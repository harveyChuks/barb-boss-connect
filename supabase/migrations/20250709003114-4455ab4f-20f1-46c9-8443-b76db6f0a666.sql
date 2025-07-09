-- Add location fields to businesses table
ALTER TABLE public.businesses 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN country TEXT DEFAULT 'Nigeria',
ADD COLUMN postal_code TEXT;

-- Create index for geospatial queries
CREATE INDEX idx_businesses_location ON public.businesses (latitude, longitude);

-- Create function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL, 
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  earth_radius DECIMAL := 6371; -- Earth radius in kilometers
  dlat DECIMAL;
  dlon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Create function to find nearby businesses with availability
CREATE OR REPLACE FUNCTION public.find_nearby_businesses_with_slots(
  user_lat DECIMAL,
  user_lon DECIMAL,
  search_radius DECIMAL DEFAULT 10, -- km
  search_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE(
  business_id UUID,
  business_name TEXT,
  business_type TEXT,
  address TEXT,
  phone TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km DECIMAL,
  available_slots INTEGER,
  logo_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.business_type::TEXT,
    b.address,
    b.phone,
    b.latitude,
    b.longitude,
    calculate_distance(user_lat, user_lon, b.latitude, b.longitude) as distance_km,
    -- Count available slots for the date
    (SELECT COUNT(*)::INTEGER 
     FROM get_available_time_slots(b.id, search_date, 30) 
     WHERE is_available = true) as available_slots,
    b.logo_url
  FROM businesses b
  WHERE b.is_active = true
    AND b.latitude IS NOT NULL 
    AND b.longitude IS NOT NULL
    AND calculate_distance(user_lat, user_lon, b.latitude, b.longitude) <= search_radius
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;