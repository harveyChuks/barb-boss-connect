-- Fix RLS policies for public booking time slot access

-- Drop existing policy if exists to recreate it
DROP POLICY IF EXISTS "Anonymous can view appointments for availability" ON appointments;

-- Allow anonymous users to view appointments for availability checking (read-only)
CREATE POLICY "Anonymous can view appointments for availability"
ON appointments
FOR SELECT
TO anon
USING (true);

-- Grant execute permission on the function to anonymous users
GRANT EXECUTE ON FUNCTION get_available_time_slots TO anon;