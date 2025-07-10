-- Create service_points table
CREATE TABLE public.service_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  max_concurrent_slots INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_service_points_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Add service_point_id to appointments table
ALTER TABLE public.appointments 
ADD COLUMN service_point_id UUID,
ADD CONSTRAINT fk_appointments_service_point FOREIGN KEY (service_point_id) REFERENCES service_points(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_service_points_business_id ON public.service_points(business_id);
CREATE INDEX idx_service_points_active ON public.service_points(business_id, is_active);
CREATE INDEX idx_appointments_service_point ON public.appointments(service_point_id);
CREATE INDEX idx_appointments_time_slot ON public.appointments(appointment_date, start_time, end_time);

-- Enable RLS on service_points
ALTER TABLE public.service_points ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_points
CREATE POLICY "Anyone can view active service points" 
ON public.service_points 
FOR SELECT 
USING (is_active = true AND business_id IN (
  SELECT id FROM businesses WHERE is_active = true
));

CREATE POLICY "Business owners can manage their service points" 
ON public.service_points 
FOR ALL 
USING (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_service_points_updated_at
BEFORE UPDATE ON public.service_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update get_available_time_slots function to consider service points
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  p_business_id uuid, 
  p_date date, 
  p_duration_minutes integer, 
  p_staff_id uuid DEFAULT NULL::uuid
)
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
  
  -- Get total capacity from all active service points
  SELECT COALESCE(SUM(max_concurrent_slots), 1)
  INTO total_capacity
  FROM service_points 
  WHERE business_id = p_business_id AND is_active = true;
  
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

-- Update check_appointment_conflict function to consider service points
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(
  p_business_id uuid, 
  p_appointment_date date, 
  p_start_time time without time zone, 
  p_end_time time without time zone, 
  p_staff_id uuid DEFAULT NULL::uuid, 
  p_exclude_appointment_id uuid DEFAULT NULL::uuid
)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
  total_capacity INTEGER;
  booked_slots INTEGER;
BEGIN
  -- Get total capacity from all active service points
  SELECT COALESCE(SUM(max_concurrent_slots), 1)
  INTO total_capacity
  FROM service_points 
  WHERE business_id = p_business_id AND is_active = true;
  
  -- Count overlapping appointments
  SELECT COUNT(*) INTO booked_slots
  FROM appointments
  WHERE business_id = p_business_id
    AND appointment_date = p_appointment_date
    AND status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
    AND (p_staff_id IS NULL OR staff_id = p_staff_id OR staff_id IS NULL)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );
  
  -- Return true if capacity would be exceeded
  RETURN booked_slots >= total_capacity;
END;
$function$;

-- Function to assign appointment to available service point
CREATE OR REPLACE FUNCTION public.assign_service_point(
  p_business_id uuid,
  p_appointment_date date,
  p_start_time time without time zone,
  p_end_time time without time zone
)
RETURNS uuid
LANGUAGE plpgsql
AS $function$
DECLARE
  service_point_id uuid;
  current_bookings INTEGER;
BEGIN
  -- Find first available service point
  SELECT sp.id INTO service_point_id
  FROM service_points sp
  WHERE sp.business_id = p_business_id 
    AND sp.is_active = true
    AND (
      SELECT COUNT(*)
      FROM appointments a
      WHERE a.service_point_id = sp.id
        AND a.appointment_date = p_appointment_date
        AND a.status NOT IN ('cancelled', 'no_show')
        AND (a.start_time < p_end_time AND a.end_time > p_start_time)
    ) < sp.max_concurrent_slots
  ORDER BY sp.name
  LIMIT 1;
  
  RETURN service_point_id;
END;
$function$;