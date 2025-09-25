-- Add currency field to businesses table
ALTER TABLE public.businesses 
ADD COLUMN currency text DEFAULT 'NGN';

-- Update existing businesses to have currency based on country
UPDATE public.businesses 
SET currency = CASE 
  WHEN country = 'Nigeria' THEN 'NGN'
  WHEN country = 'Ghana' THEN 'GHS'
  WHEN country = 'Kenya' THEN 'KES'
  WHEN country = 'South Africa' THEN 'ZAR'
  WHEN country = 'United States' THEN 'USD'
  WHEN country = 'United Kingdom' THEN 'GBP'
  WHEN country = 'Canada' THEN 'CAD'
  ELSE 'USD'
END;