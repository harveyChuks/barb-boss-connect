-- Drop and recreate the get_business_public_data function with phone and email
DROP FUNCTION IF EXISTS public.get_business_public_data(text);

CREATE OR REPLACE FUNCTION public.get_business_public_data(business_booking_link text)
RETURNS TABLE(
  id uuid, 
  name text, 
  business_type text, 
  description text, 
  address text, 
  phone text,
  email text,
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
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    b.id,
    b.name,
    b.business_type::text,
    b.description,
    b.address,
    b.phone,
    b.email,
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