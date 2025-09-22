-- Update the booking link generation function to create URL-safe links
CREATE OR REPLACE FUNCTION public.generate_booking_link()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.booking_link IS NULL THEN
    -- Create URL-safe booking link by replacing spaces and special characters
    NEW.booking_link := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special chars except spaces and hyphens
        '\s+', '-', 'g' -- Replace spaces with hyphens
      )
    ) || '-' || SUBSTRING(NEW.id::text FROM 1 FOR 8);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update existing booking links to be URL-safe
UPDATE businesses 
SET booking_link = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || SUBSTRING(id::text FROM 1 FOR 8)
WHERE booking_link IS NOT NULL;