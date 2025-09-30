-- Update trial subscription function to use 3 months
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  trial_plan_id uuid;
BEGIN
  -- Get the free trial plan
  SELECT id INTO trial_plan_id 
  FROM subscription_plans 
  WHERE name = 'Free Trial' 
  LIMIT 1;
  
  -- Create trial subscription with 3 months trial
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
    now() + interval '3 months'
  );
  
  RETURN NEW;
END;
$function$;

-- Add blocked status to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS blocked_at timestamp with time zone;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS block_reason text;