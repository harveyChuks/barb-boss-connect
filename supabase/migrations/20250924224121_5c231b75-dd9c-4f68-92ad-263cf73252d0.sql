-- Create admin roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'business_owner');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'business_owner',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_monthly numeric(10,2) NOT NULL,
  price_yearly numeric(10,2),
  features jsonb NOT NULL DEFAULT '[]',
  max_appointments_per_month integer,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create business subscriptions table
CREATE TABLE public.business_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
  trial_start_date timestamp with time zone,
  trial_end_date timestamp with time zone,
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  next_billing_date timestamp with time zone,
  payment_method jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (business_id)
);

-- Create platform statistics table for admin tracking
CREATE TABLE public.platform_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_businesses integer DEFAULT 0,
  active_subscriptions integer DEFAULT 0,
  trial_subscriptions integer DEFAULT 0,
  expired_subscriptions integer DEFAULT 0,
  monthly_revenue numeric(10,2) DEFAULT 0,
  new_businesses_today integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (date)
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, max_appointments_per_month) VALUES
('Free Trial', '1-month free trial for new businesses', 0, 0, '["Basic appointment management", "Up to 50 appointments", "Email notifications"]', 50),
('Starter', 'Perfect for small businesses', 29.99, 299.99, '["Unlimited appointments", "WhatsApp integration", "Basic analytics", "Customer management"]', NULL),
('Professional', 'Advanced features for growing businesses', 59.99, 599.99, '["Everything in Starter", "Advanced analytics", "Staff management", "Custom branding", "Priority support"]', NULL),
('Enterprise', 'Full-featured solution for large businesses', 99.99, 999.99, '["Everything in Professional", "Multi-location support", "API access", "Custom integrations", "Dedicated account manager"]', NULL);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_statistics ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON public.subscription_plans
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for business_subscriptions
CREATE POLICY "Business owners can view their subscription" ON public.business_subscriptions
FOR SELECT USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Business owners can update their subscription" ON public.business_subscriptions
FOR UPDATE USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "System can create subscriptions" ON public.business_subscriptions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all subscriptions" ON public.business_subscriptions
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_statistics
CREATE POLICY "Only admins can view platform statistics" ON public.platform_statistics
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage platform statistics" ON public.platform_statistics
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to create trial subscription when business is created
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_plan_id uuid;
BEGIN
  -- Get the free trial plan
  SELECT id INTO trial_plan_id 
  FROM subscription_plans 
  WHERE name = 'Free Trial' 
  LIMIT 1;
  
  -- Create trial subscription
  INSERT INTO business_subscriptions (
    business_id,
    plan_id,
    status,
    trial_start_date,
    trial_end_date
  ) VALUES (
    NEW.id,
    trial_plan_id,
    'trial',
    now(),
    now() + interval '1 month'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to create trial subscription when business is created
CREATE TRIGGER create_trial_subscription_trigger
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- Function to check subscription status
CREATE OR REPLACE FUNCTION public.check_business_subscription_status(p_business_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_status text;
  trial_end_date timestamp with time zone;
  subscription_end_date timestamp with time zone;
BEGIN
  SELECT 
    bs.status,
    bs.trial_end_date,
    bs.subscription_end_date
  INTO 
    subscription_status,
    trial_end_date,
    subscription_end_date
  FROM business_subscriptions bs
  WHERE bs.business_id = p_business_id;
  
  IF subscription_status IS NULL THEN
    RETURN 'no_subscription';
  END IF;
  
  -- Check if trial has expired
  IF subscription_status = 'trial' AND trial_end_date < now() THEN
    -- Update status to expired
    UPDATE business_subscriptions 
    SET status = 'expired', updated_at = now()
    WHERE business_id = p_business_id;
    RETURN 'expired';
  END IF;
  
  -- Check if paid subscription has expired
  IF subscription_status = 'active' AND subscription_end_date < now() THEN
    -- Update status to expired
    UPDATE business_subscriptions 
    SET status = 'expired', updated_at = now()
    WHERE business_id = p_business_id;
    RETURN 'expired';
  END IF;
  
  RETURN subscription_status;
END;
$$;

-- Update updated_at trigger for subscriptions
CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at trigger for subscription plans
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();