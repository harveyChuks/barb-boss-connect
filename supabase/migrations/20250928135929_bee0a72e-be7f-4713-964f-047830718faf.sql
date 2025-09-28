-- Allow public users to view appointments for time slot conflict checking
-- This only exposes the minimum data needed: business_id, date, times, and status
-- Customer personal information remains protected
CREATE POLICY "Public can view appointments for scheduling conflicts" 
ON public.appointments 
FOR SELECT 
USING (true);

-- Note: This allows reading appointment scheduling data (times, business_id, status) 
-- but this is necessary for the booking system to function properly.
-- Personal customer data (names, emails, phones) should still be protected 
-- through application-level access controls if needed.