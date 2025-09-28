-- Add unique constraint to prevent overlapping appointments
-- This will ensure database-level protection against double bookings

-- First, let's create a function to check for time overlap
CREATE OR REPLACE FUNCTION check_time_overlap(
  start1 TIME,
  end1 TIME,
  start2 TIME,
  end2 TIME
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN (start1 < end2) AND (end1 > start2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a trigger function to prevent overlapping appointments
CREATE OR REPLACE FUNCTION prevent_appointment_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping appointments on the same date for the same business
  -- (and same staff if staff_id is specified)
  IF EXISTS (
    SELECT 1 
    FROM appointments 
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND business_id = NEW.business_id
      AND appointment_date = NEW.appointment_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        -- If both appointments have staff_id, they must match for conflict
        (NEW.staff_id IS NOT NULL AND staff_id IS NOT NULL AND staff_id = NEW.staff_id) OR
        -- If either appointment has no staff_id, check for any overlap
        (NEW.staff_id IS NULL OR staff_id IS NULL)
      )
      AND check_time_overlap(start_time, end_time, NEW.start_time, NEW.end_time)
  ) THEN
    RAISE EXCEPTION 'Appointment time slot conflicts with existing appointment. Please choose a different time.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_appointment_overlap_trigger ON appointments;
CREATE TRIGGER prevent_appointment_overlap_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION prevent_appointment_overlap();