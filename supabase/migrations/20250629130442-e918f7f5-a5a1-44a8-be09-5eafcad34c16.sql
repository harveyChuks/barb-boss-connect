
-- First, let's check what policies currently exist and then fix them
DROP POLICY IF EXISTS "Anyone can create customer records for booking" ON public.customers;
DROP POLICY IF EXISTS "Business owners can view their customers" ON public.customers;
DROP POLICY IF EXISTS "Customers can view their own records" ON public.customers;

-- Create a simpler policy that allows anyone to insert customers (needed for public booking)
CREATE POLICY "Allow public customer creation" 
  ON public.customers 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow business owners to view customers who have appointments with them
CREATE POLICY "Business owners can view their customers" 
  ON public.customers 
  FOR SELECT 
  TO authenticated
  USING (
    id IN (
      SELECT customer_id FROM public.appointments 
      WHERE business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
      )
    )
  );

-- Allow customers to view their own records (for future use)
CREATE POLICY "Customers can view own records" 
  ON public.customers 
  FOR SELECT 
  TO authenticated
  USING (auth.uid()::text = id::text);
