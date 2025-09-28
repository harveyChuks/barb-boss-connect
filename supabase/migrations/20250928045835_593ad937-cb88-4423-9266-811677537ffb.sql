-- Create default service points for businesses that don't have any
INSERT INTO service_points (business_id, name, max_concurrent_slots, is_active)
SELECT DISTINCT b.id, 'Default Service Point', 1, true
FROM businesses b
LEFT JOIN service_points sp ON b.id = sp.business_id
WHERE sp.id IS NULL;

-- Update the get_available_time_slots function to handle missing service points
CREATE OR REPLACE FUNCTION public.get_available_time_slots(p_business_id uuid, p_date date, p_duration_minutes integer, p_staff_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(slot_time time without time zone, is_available boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
  business_hours_rec RECORD;
  slot_time_var TIME;
  slot_end_time TIME;
  slot_interval INTERVAL := '30 minutes';
  total_capacity INTEGER;
  booked_slots INTEGER;
BEGIN
  -- Get business hours for the day
  SELECT bh.start_time, bh.end_time, bh.is_closed
  INTO business_hours_rec
  FROM business_hours bh
  WHERE bh.business_id = p_business_id
    AND bh.day_of_week = EXTRACT(DOW FROM p_date);
  
  -- If no business hours found or closed, return empty
  IF business_hours_rec IS NULL OR business_hours_rec.is_closed THEN
    RETURN;
  END IF;
  
  -- Get total capacity from all active service points, default to 1 if none exist
  SELECT COALESCE(SUM(max_concurrent_slots), 1)
  INTO total_capacity
  FROM service_points 
  WHERE business_id = p_business_id AND is_active = true;
  
  -- If no service points, default to capacity of 1
  IF total_capacity IS NULL OR total_capacity = 0 THEN
    total_capacity := 1;
  END IF;
  
  -- Generate time slots
  slot_time_var := business_hours_rec.start_time;
  WHILE slot_time_var < business_hours_rec.end_time LOOP
    slot_end_time := slot_time_var + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Only return slot if it fits within business hours
    IF slot_end_time <= business_hours_rec.end_time THEN
      -- Count existing bookings that overlap with this time slot
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