-- Fix RLS policy for services to allow public access to active services for active businesses
DROP POLICY IF EXISTS "Anyone can view active services" ON services;

CREATE POLICY "Public can view active services for active businesses" 
ON services 
FOR SELECT 
USING (
  is_active = true 
  AND business_id IN (
    SELECT id 
    FROM businesses 
    WHERE is_active = true
  )
);