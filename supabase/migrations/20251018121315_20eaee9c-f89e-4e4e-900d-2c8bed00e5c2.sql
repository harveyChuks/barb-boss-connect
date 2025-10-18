-- Drop existing overly permissive policies on appointments
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can view appointments for scheduling conflicts" ON public.appointments;

-- Keep the business owner policy but rename it for clarity
DROP POLICY IF EXISTS "Business owners can manage appointments for their business" ON public.appointments;

-- Create strict RLS policies for appointments

-- Business owners can SELECT all appointments for their businesses
CREATE POLICY "Business owners can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Customers can SELECT only their own appointments
CREATE POLICY "Customers can view own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

-- Authenticated users can INSERT only when customer_id matches their auth.uid()
CREATE POLICY "Customers can create own appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

-- Customers can UPDATE only their own future appointments (for rescheduling)
CREATE POLICY "Customers can update own future appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid() 
  AND appointment_date >= CURRENT_DATE
)
WITH CHECK (customer_id = auth.uid());

-- Business owners can UPDATE appointments for their businesses
CREATE POLICY "Business owners can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Business owners can DELETE appointments for their businesses
CREATE POLICY "Business owners can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  )
);

-- Create RPC to check timeslot conflicts (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_timeslot_conflicting(
  p_business_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time,
  p_end_time time,
  p_staff_id uuid DEFAULT NULL,
  p_exclude_appointment_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_conflict boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM appointments
    WHERE business_id = p_business_id
      AND service_id = p_service_id
      AND appointment_date = p_appointment_date
      AND status NOT IN ('cancelled', 'no_show')
      AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
      AND (p_staff_id IS NULL OR staff_id = p_staff_id OR staff_id IS NULL)
      AND (start_time < p_end_time AND end_time > p_start_time)
  ) INTO has_conflict;
  
  RETURN has_conflict;
END;
$$;

-- Grant execute to anon and authenticated, revoke from public
GRANT EXECUTE ON FUNCTION public.is_timeslot_conflicting TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_timeslot_conflicting FROM public;

-- Create RPC to list booked slots (returns minimal data, no PII)
CREATE OR REPLACE FUNCTION public.list_booked_slots(
  p_business_id uuid,
  p_date_from date,
  p_date_to date
)
RETURNS TABLE(
  service_id uuid,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  appointment_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.service_id,
    (a.appointment_date + a.start_time)::timestamp with time zone as start_at,
    (a.appointment_date + a.end_time)::timestamp with time zone as end_at,
    a.appointment_date
  FROM appointments a
  WHERE a.business_id = p_business_id
    AND a.appointment_date BETWEEN p_date_from AND p_date_to
    AND a.status NOT IN ('cancelled', 'no_show')
  ORDER BY a.appointment_date, a.start_time;
END;
$$;

-- Grant execute to anon and authenticated, revoke from public
GRANT EXECUTE ON FUNCTION public.list_booked_slots TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.list_booked_slots FROM public;

-- Create view for user's own appointments
CREATE OR REPLACE VIEW public.my_appointments AS
SELECT 
  id,
  customer_id,
  business_id,
  service_id,
  appointment_date,
  start_time,
  end_time,
  status,
  created_at
FROM appointments
WHERE customer_id = auth.uid();

-- Grant SELECT on view to authenticated users only
GRANT SELECT ON public.my_appointments TO authenticated;
REVOKE SELECT ON public.my_appointments FROM public, anon;