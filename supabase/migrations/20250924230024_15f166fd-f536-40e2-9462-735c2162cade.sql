-- Update RLS policies to allow admins to view all businesses
DROP POLICY IF EXISTS "Only business owners can view their full business data" ON public.businesses;

-- Create new policy that allows admins and business owners to view businesses
CREATE POLICY "Admins and business owners can view business data" 
ON public.businesses 
FOR SELECT 
USING (
  (auth.uid() = owner_id) OR 
  (auth.role() = 'service_role'::text) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Also allow admins to manage any business if needed
CREATE POLICY "Admins can manage all businesses" 
ON public.businesses 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));