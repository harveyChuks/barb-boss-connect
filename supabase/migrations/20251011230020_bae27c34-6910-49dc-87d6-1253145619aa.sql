-- Fix RLS policy for services table to properly handle INSERT operations
DROP POLICY IF EXISTS "Business owners can manage their services" ON public.services;

-- Create separate policies for better control
CREATE POLICY "Business owners can view their services"
ON public.services
FOR SELECT
USING (business_id IN (
  SELECT businesses.id
  FROM businesses
  WHERE businesses.owner_id = auth.uid()
));

CREATE POLICY "Business owners can insert their services"
ON public.services
FOR INSERT
WITH CHECK (business_id IN (
  SELECT businesses.id
  FROM businesses
  WHERE businesses.owner_id = auth.uid()
));

CREATE POLICY "Business owners can update their services"
ON public.services
FOR UPDATE
USING (business_id IN (
  SELECT businesses.id
  FROM businesses
  WHERE businesses.owner_id = auth.uid()
))
WITH CHECK (business_id IN (
  SELECT businesses.id
  FROM businesses
  WHERE businesses.owner_id = auth.uid()
));

CREATE POLICY "Business owners can delete their services"
ON public.services
FOR DELETE
USING (business_id IN (
  SELECT businesses.id
  FROM businesses
  WHERE businesses.owner_id = auth.uid()
));