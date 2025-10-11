-- Fix remaining functions with search path issues

-- Fix check_time_overlap
CREATE OR REPLACE FUNCTION public.check_time_overlap(start1 time without time zone, end1 time without time zone, start2 time without time zone, end2 time without time zone)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  RETURN (start1 < end2) AND (end1 > start2);
END;
$function$;

-- Fix create_trial_subscription
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  trial_plan_id uuid;
BEGIN
  SELECT id INTO trial_plan_id 
  FROM subscription_plans 
  WHERE name = 'Free Trial' 
  LIMIT 1;
  
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