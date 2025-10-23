-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Customers can view own appointments" ON appointments;

-- Create updated policy that allows customers to view appointments by customer_id, email, or phone
CREATE POLICY "Customers can view own appointments" ON appointments
  FOR SELECT
  USING (
    customer_id = auth.uid() 
    OR customer_email = (SELECT email FROM customer_profiles WHERE id = auth.uid())
    OR customer_phone = (SELECT phone FROM customer_profiles WHERE id = auth.uid())
  );