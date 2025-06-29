
-- Update RLS policies for customers table to allow public booking
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Business owners can view customers who booked with them" ON public.customers;
DROP POLICY IF EXISTS "Anyone can create customer records" ON public.customers;

-- Create new policies that allow booking functionality
CREATE POLICY "Anyone can create customer records for booking" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Business owners can view their customers" 
  ON public.customers 
  FOR SELECT 
  USING (
    id IN (
      SELECT customer_id FROM public.appointments 
      WHERE business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can view their own records" 
  ON public.customers 
  FOR SELECT 
  USING (
    phone IN (
      SELECT customer_phone FROM public.appointments 
      WHERE customer_id = customers.id
    )
  );
