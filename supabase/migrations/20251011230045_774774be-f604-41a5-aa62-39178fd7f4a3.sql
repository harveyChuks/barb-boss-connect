-- Drop all existing policies on services table
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Business owners can manage their services" ON public.services;
DROP POLICY IF EXISTS "Business owners can view their services" ON public.services;
DROP POLICY IF EXISTS "Business owners can insert their services" ON public.services;
DROP POLICY IF EXISTS "Business owners can update their services" ON public.services;
DROP POLICY IF EXISTS "Business owners can delete their services" ON public.services;

-- Create new policies with proper INSERT/UPDATE handling
CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

CREATE POLICY "Business owners can view all their services"
ON public.services
FOR SELECT
USING (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));

CREATE POLICY "Business owners can insert services"
ON public.services
FOR INSERT
WITH CHECK (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));

CREATE POLICY "Business owners can update services"
ON public.services
FOR UPDATE
USING (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
))
WITH CHECK (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));

CREATE POLICY "Business owners can delete services"
ON public.services
FOR DELETE
USING (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));