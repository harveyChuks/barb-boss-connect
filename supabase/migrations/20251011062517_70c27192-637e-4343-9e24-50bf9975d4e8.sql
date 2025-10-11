-- Fix function search paths for security
-- These functions need to have search_path set to avoid security warnings

-- Fix prevent_appointment_overlap
CREATE OR REPLACE FUNCTION public.prevent_appointment_overlap()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM appointments 
    WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND business_id = NEW.business_id
      AND appointment_date = NEW.appointment_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (
        (NEW.staff_id IS NOT NULL AND staff_id IS NOT NULL AND staff_id = NEW.staff_id) OR
        (NEW.staff_id IS NULL OR staff_id IS NULL)
      )
      AND check_time_overlap(start_time, end_time, NEW.start_time, NEW.end_time)
  ) THEN
    RAISE EXCEPTION 'Appointment time slot conflicts with existing appointment. Please choose a different time.';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix assign_service_point
CREATE OR REPLACE FUNCTION public.assign_service_point(p_business_id uuid, p_appointment_date date, p_start_time time without time zone, p_end_time time without time zone)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  service_point_id uuid;
  current_bookings INTEGER;
BEGIN
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

-- Fix calculate_deposit_amount
CREATE OR REPLACE FUNCTION public.calculate_deposit_amount(service_price numeric)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN ROUND(service_price * 0.5, 2);
END;
$function$;

-- Fix generate_booking_link
CREATE OR REPLACE FUNCTION public.generate_booking_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.booking_link IS NULL THEN
    NEW.booking_link := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      )
    ) || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix initialize_default_service_point
CREATE OR REPLACE FUNCTION public.initialize_default_service_point(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM service_points WHERE business_id = p_business_id
  ) THEN
    INSERT INTO public.service_points (business_id, name, description, max_concurrent_slots, is_active)
    VALUES (p_business_id, 'Main Service Point', 'Default service area', 1, true);
  END IF;
END;
$function$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_business
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  PERFORM initialize_default_service_point(NEW.id);
  RETURN NEW;
END;
$function$;

-- Fix initialize_default_business_hours
CREATE OR REPLACE FUNCTION public.initialize_default_business_hours(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.business_hours (business_id, day_of_week, start_time, end_time, is_closed)
  VALUES 
    (p_business_id, 0, '08:00', '21:00', true),
    (p_business_id, 1, '08:00', '21:00', false),
    (p_business_id, 2, '08:00', '21:00', false),
    (p_business_id, 3, '08:00', '21:00', false),
    (p_business_id, 4, '08:00', '21:00', false),
    (p_business_id, 5, '08:00', '21:00', false),
    (p_business_id, 6, '08:00', '21:00', false)
  ON CONFLICT (business_id, day_of_week) DO NOTHING;
END;
$function$;

-- Fix calculate_distance
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  earth_radius DECIMAL := 6371;
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$function$;

-- Fix check_appointment_conflict
CREATE OR REPLACE FUNCTION public.check_appointment_conflict(p_business_id uuid, p_appointment_date date, p_start_time time without time zone, p_end_time time without time zone, p_staff_id uuid DEFAULT NULL::uuid, p_exclude_appointment_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  total_capacity INTEGER;
  booked_slots INTEGER;
BEGIN
  SELECT COALESCE(SUM(max_concurrent_slots), 1)
  INTO total_capacity
  FROM service_points 
  WHERE business_id = p_business_id AND is_active = true;
  
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
  
  RETURN booked_slots >= total_capacity;
END;
$function$;

-- Fix find_nearby_businesses_with_slots
CREATE OR REPLACE FUNCTION public.find_nearby_businesses_with_slots(user_lat numeric, user_lon numeric, search_radius numeric DEFAULT 10, search_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(business_id uuid, business_name text, business_type text, address text, phone text, latitude numeric, longitude numeric, distance_km numeric, available_slots integer, logo_url text)
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.business_type::TEXT,
    b.address,
    b.phone,
    b.latitude,
    b.longitude,
    calculate_distance(user_lat, user_lon, b.latitude, b.longitude) as distance_km,
    (SELECT COUNT(*)::INTEGER 
     FROM get_available_time_slots(b.id, search_date, 30) 
     WHERE is_available = true) as available_slots,
    b.logo_url
  FROM businesses b
  WHERE b.is_active = true
    AND b.latitude IS NOT NULL 
    AND b.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, b.latitude, b.longitude) <= search_radius
  ORDER BY distance_km ASC;
END;
$function$;

-- Fix get_available_time_slots
CREATE OR REPLACE FUNCTION public.get_available_time_slots(p_business_id uuid, p_date date, p_duration_minutes integer, p_staff_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(slot_time time without time zone, is_available boolean)
LANGUAGE plpgsql
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