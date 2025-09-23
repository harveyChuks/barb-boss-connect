-- Create a secure view for public business access
CREATE OR REPLACE VIEW public.businesses_public AS
SELECT 
  id,
  name,
  business_type,
  description,
  address,
  website,
  instagram,
  logo_url,
  cover_image_url,
  booking_link,
  city,
  state,
  country,
  is_active,
  created_at
FROM businesses
WHERE is_active = true;

-- Enable RLS on the view
ALTER VIEW public.businesses_public ENABLE ROW LEVEL SECURITY;

-- Allow public read access to the safe view
CREATE POLICY "Public can view safe business data" 
ON public.businesses_public 
FOR SELECT 
USING (true);

-- Update the main businesses table policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;

-- Create a more restrictive policy for the main table - only business owners can see full data
CREATE POLICY "Only business owners can view their full business data" 
ON public.businesses 
FOR SELECT 
USING (auth.uid() = owner_id OR auth.role() = 'service_role');

-- Keep the existing management policy
-- "Business owners can manage their businesses" already exists