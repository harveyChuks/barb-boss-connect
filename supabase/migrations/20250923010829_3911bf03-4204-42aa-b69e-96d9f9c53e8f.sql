-- First, update the main businesses table policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;

-- Create a more restrictive policy - only business owners and service role can see full data
CREATE POLICY "Only business owners can view their full business data" 
ON public.businesses 
FOR SELECT 
USING (auth.uid() = owner_id OR auth.role() = 'service_role');

-- Create a security definer function for public business data access
CREATE OR REPLACE FUNCTION public.get_business_public_data(business_booking_link TEXT)
RETURNS TABLE (
  id uuid,
  name text,
  business_type text,
  description text,
  address text,
  website text,
  instagram text,
  logo_url text,
  cover_image_url text,
  booking_link text,
  city text,
  state text,
  country text,
  is_active boolean,
  created_at timestamp with time zone
) 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT 
    b.id,
    b.name,
    b.business_type::text,
    b.description,
    b.address,
    b.website,
    b.instagram,
    b.logo_url,
    b.cover_image_url,
    b.booking_link,
    b.city,
    b.state,
    b.country,
    b.is_active,
    b.created_at
  FROM businesses b
  WHERE b.booking_link = business_booking_link 
    AND b.is_active = true;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_business_public_data(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_business_public_data(TEXT) TO authenticated;