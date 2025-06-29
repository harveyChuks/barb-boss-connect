
-- Create the function to initialize default business hours
CREATE OR REPLACE FUNCTION public.initialize_default_business_hours(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert default business hours (Monday-Saturday 8AM-9PM, Sunday closed)
  INSERT INTO public.business_hours (business_id, day_of_week, start_time, end_time, is_closed)
  VALUES 
    (p_business_id, 0, '08:00', '21:00', true),   -- Sunday (closed)
    (p_business_id, 1, '08:00', '21:00', false),  -- Monday
    (p_business_id, 2, '08:00', '21:00', false),  -- Tuesday
    (p_business_id, 3, '08:00', '21:00', false),  -- Wednesday
    (p_business_id, 4, '08:00', '21:00', false),  -- Thursday
    (p_business_id, 5, '08:00', '21:00', false),  -- Friday
    (p_business_id, 6, '08:00', '21:00', false)   -- Saturday
  ON CONFLICT (business_id, day_of_week) DO NOTHING;
END;
$function$
