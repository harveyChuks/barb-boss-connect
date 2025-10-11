-- Add service_type column to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Add banner_url column to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS banner_url TEXT;