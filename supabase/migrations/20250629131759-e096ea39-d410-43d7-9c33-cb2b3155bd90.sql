
-- Create function to check for appointment conflicts
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  p_business_id uuid,
  p_appointment_date date,
  p_start_time time,
  p_end_time time,
  p_staff_id uuid DEFAULT NULL,
  p_exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping appointments
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE business_id = p_business_id
    AND appointment_date = p_appointment_date
    AND status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
    AND (p_staff_id IS NULL OR staff_id = p_staff_id OR staff_id IS NULL)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );
  
  RETURN conflict_count > 0;
END;
$function$;

-- Create function to get available time slots
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  p_business_id uuid,
  p_date date,
  p_duration_minutes integer,
  p_staff_id uuid DEFAULT NULL
)
RETURNS TABLE(slot_time time, is_available boolean)
LANGUAGE plpgsql
AS $function$
DECLARE
  business_hours_rec RECORD;
  slot_time_var TIME;
  slot_end_time TIME;
  slot_interval INTERVAL := '30 minutes'; -- 30-minute slots
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
  
  -- Generate time slots
  slot_time_var := business_hours_rec.start_time;
  WHILE slot_time_var < business_hours_rec.end_time LOOP
    slot_end_time := slot_time_var + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Only return slot if it fits within business hours
    IF slot_end_time <= business_hours_rec.end_time THEN
      RETURN QUERY SELECT 
        slot_time_var,
        NOT check_appointment_conflict(
          p_business_id,
          p_date,
          slot_time_var,
          slot_end_time::TIME,
          p_staff_id
        );
    END IF;
    
    slot_time_var := slot_time_var + slot_interval;
  END LOOP;
END;
$function$;
