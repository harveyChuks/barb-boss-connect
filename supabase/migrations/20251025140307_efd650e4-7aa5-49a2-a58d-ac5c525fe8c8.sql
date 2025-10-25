-- Revert the RLS policy changes back to original
DROP POLICY IF EXISTS "Customers can view own appointments" ON appointments;

-- Restore original customer view policy
CREATE POLICY "Customers can view own appointments" ON appointments
  FOR SELECT
  USING (
    (customer_id = auth.uid()) 
    OR (customer_email = (SELECT email FROM customer_profiles WHERE id = auth.uid())) 
    OR (customer_phone = (SELECT phone FROM customer_profiles WHERE id = auth.uid()))
  );

-- Drop the trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_booking_confirmation ON appointments;
DROP FUNCTION IF EXISTS notify_booking_confirmation();