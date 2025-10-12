-- Create customer profiles table for registered customers
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_bookings INTEGER DEFAULT 0,
  is_loyalty_member BOOLEAN DEFAULT true,
  followed_businesses JSONB DEFAULT '[]'::jsonb,
  UNIQUE(phone)
);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Customers can view and update their own profile
CREATE POLICY "Customers can view own profile"
  ON public.customer_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON public.customer_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can create profile"
  ON public.customer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Business owners can view profiles of their customers
CREATE POLICY "Business owners can view their customer profiles"
  ON public.customer_profiles
  FOR SELECT
  USING (
    id IN (
      SELECT DISTINCT customer_id
      FROM appointments
      WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
      )
      AND customer_id IS NOT NULL
    )
  );

-- Add discount fields to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_reason TEXT,
ADD COLUMN IF NOT EXISTS final_price NUMERIC;

-- Update customer_id to link to customer_profiles
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_customer_id_fkey;

-- Create function to automatically create customer profile from auth
CREATE OR REPLACE FUNCTION public.handle_customer_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if user has customer metadata
  IF NEW.raw_user_meta_data->>'account_type' = 'customer' THEN
    INSERT INTO public.customer_profiles (
      id,
      name,
      email,
      phone
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Customer'),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to create customer profile on signup
DROP TRIGGER IF EXISTS on_customer_created ON auth.users;
CREATE TRIGGER on_customer_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_customer_signup();

-- Function to calculate discount for loyalty customers
CREATE OR REPLACE FUNCTION public.calculate_customer_discount(
  p_customer_id UUID,
  p_business_id UUID,
  p_base_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_loyalty BOOLEAN;
  has_followed BOOLEAN;
  discount_pct NUMERIC := 0;
  discount_reason TEXT := '';
  final_amount NUMERIC;
BEGIN
  -- Check if customer is loyalty member
  SELECT is_loyalty_member INTO is_loyalty
  FROM customer_profiles
  WHERE id = p_customer_id;
  
  -- Base loyalty discount
  IF is_loyalty THEN
    discount_pct := 3;
    discount_reason := 'Loyalty member discount';
  END IF;
  
  -- Check if followed business on social media
  SELECT EXISTS(
    SELECT 1 
    FROM customer_profiles 
    WHERE id = p_customer_id 
    AND followed_businesses @> jsonb_build_array(p_business_id)
  ) INTO has_followed;
  
  IF has_followed THEN
    discount_pct := discount_pct + 2;
    discount_reason := discount_reason || ' + Social media follower bonus';
  END IF;
  
  final_amount := p_base_price * (1 - discount_pct / 100);
  
  RETURN jsonb_build_object(
    'discount_percentage', discount_pct,
    'discount_reason', discount_reason,
    'final_price', final_amount
  );
END;
$$;

-- Add trigger to update customer booking count
CREATE OR REPLACE FUNCTION public.update_customer_booking_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL AND NEW.status = 'confirmed' THEN
    UPDATE customer_profiles
    SET total_bookings = total_bookings + 1,
        updated_at = now()
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS increment_customer_bookings ON appointments;
CREATE TRIGGER increment_customer_bookings
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION public.update_customer_booking_count();

-- Update timestamps trigger
DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER update_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);

COMMENT ON TABLE customer_profiles IS 'Registered customer accounts with loyalty benefits';
COMMENT ON COLUMN customer_profiles.is_loyalty_member IS 'Customers who created accounts get 3% discount';
COMMENT ON COLUMN customer_profiles.followed_businesses IS 'Array of business IDs the customer follows on social media for additional discounts';