
-- Create enum for business types
CREATE TYPE business_type AS ENUM (
  'barbershop',
  'hair_salon', 
  'makeup_artist',
  'nail_salon',
  'spa',
  'beauty_clinic'
);

-- Create enum for appointment status
CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  business_type business_type NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  booking_link TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create staff/service providers table
CREATE TABLE public.staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customers table (for booking without account)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Business owners can manage their businesses" 
  ON public.businesses 
  FOR ALL 
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view active businesses" 
  ON public.businesses 
  FOR SELECT 
  USING (is_active = true);

-- RLS Policies for services
CREATE POLICY "Business owners can manage their services" 
  ON public.services 
  FOR ALL 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active services" 
  ON public.services 
  FOR SELECT 
  USING (
    is_active = true AND 
    business_id IN (
      SELECT id FROM public.businesses WHERE is_active = true
    )
  );

-- RLS Policies for staff
CREATE POLICY "Business owners can manage their staff" 
  ON public.staff 
  FOR ALL 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view active staff" 
  ON public.staff 
  FOR SELECT 
  USING (
    is_active = true AND 
    business_id IN (
      SELECT id FROM public.businesses WHERE is_active = true
    )
  );

-- RLS Policies for customers
CREATE POLICY "Business owners can view customers who booked with them" 
  ON public.customers 
  FOR SELECT 
  USING (
    id IN (
      SELECT customer_id FROM public.appointments 
      WHERE business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can create customer records" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for appointments
CREATE POLICY "Business owners can manage appointments for their business" 
  ON public.appointments 
  FOR ALL 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX idx_businesses_booking_link ON public.businesses(booking_link);
CREATE INDEX idx_services_business_id ON public.services(business_id);
CREATE INDEX idx_staff_business_id ON public.staff(business_id);
CREATE INDEX idx_appointments_business_id ON public.appointments(business_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_customers_phone ON public.customers(phone);

-- Generate unique booking links
CREATE OR REPLACE FUNCTION generate_booking_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_link IS NULL THEN
    NEW.booking_link := LOWER(REPLACE(NEW.name, ' ', '-')) || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_link
  BEFORE INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_link();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
