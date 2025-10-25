-- Fix infinite recursion in appointments RLS policy
DROP POLICY IF EXISTS "Customers can view own appointments" ON appointments;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Customers can view own appointments" 
ON appointments 
FOR SELECT 
USING (customer_id = auth.uid());

-- Fix get_available_time_slots to use SECURITY DEFINER so anonymous users can check availability
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  p_business_id uuid, 
  p_date date, 
  p_duration_minutes integer, 
  p_staff_id uuid DEFAULT NULL::uuid
)
RETURNS TABLE(slot_time time without time zone, is_available boolean)
LANGUAGE plpgsql
SECURITY DEFINER  -- Changed back to DEFINER for anonymous access
SET search_path = public
AS $function$
DECLARE
  business_hours_rec RECORD;
  slot_time_var TIME;
  slot_end_time TIME;
  slot_interval INTERVAL := '30 minutes';
  total_capacity INTEGER;
  booked_slots INTEGER;
BEGIN
  SELECT bh.start_time, bh.end_time, bh.is_closed
  INTO business_hours_rec
  FROM business_hours bh
  WHERE bh.business_id = p_business_id
    AND bh.day_of_week = EXTRACT(DOW FROM p_date);
  
  IF business_hours_rec IS NULL OR business_hours_rec.is_closed THEN
    RETURN;
  END IF;
  
  SELECT COALESCE(SUM(max_concurrent_slots), 1)
  INTO total_capacity
  FROM service_points 
  WHERE business_id = p_business_id AND is_active = true;
  
  IF total_capacity IS NULL OR total_capacity = 0 THEN
    total_capacity := 1;
  END IF;
  
  slot_time_var := business_hours_rec.start_time;
  WHILE slot_time_var < business_hours_rec.end_time LOOP
    slot_end_time := slot_time_var + (p_duration_minutes || ' minutes')::INTERVAL;
    
    IF slot_end_time <= business_hours_rec.end_time THEN
      SELECT COUNT(*)
      INTO booked_slots
      FROM appointments
      WHERE business_id = p_business_id
        AND appointment_date = p_date
        AND status NOT IN ('cancelled', 'no_show')
        AND (p_staff_id IS NULL OR staff_id = p_staff_id OR staff_id IS NULL)
        AND (
          (start_time < slot_end_time::TIME AND end_time > slot_time_var)
        );
      
      RETURN QUERY SELECT 
        slot_time_var,
        booked_slots < total_capacity;
    END IF;
    
    slot_time_var := slot_time_var + slot_interval;
  END LOOP;
END;
$function$;