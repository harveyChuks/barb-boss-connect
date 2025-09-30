-- Add unique constraint to booking_link to prevent duplicates
ALTER TABLE businesses ADD CONSTRAINT businesses_booking_link_unique UNIQUE (booking_link);