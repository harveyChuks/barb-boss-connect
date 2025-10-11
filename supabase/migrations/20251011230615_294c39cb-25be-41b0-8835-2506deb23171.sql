-- Drop the catch-all policy and create specific ones for better control
DROP POLICY IF EXISTS "Business owners can manage their businesses" ON public.businesses;

-- Create separate policies for each operation
CREATE POLICY "Business owners can select their businesses"
ON public.businesses
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can insert their businesses"
ON public.businesses
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their businesses"
ON public.businesses
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can delete their businesses"
ON public.businesses
FOR DELETE
USING (auth.uid() = owner_id);