
-- Add payment-related columns to appointments table
ALTER TABLE public.appointments 
ADD COLUMN deposit_amount DECIMAL(10,2),
ADD COLUMN deposit_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN payment_intent_id TEXT,
ADD COLUMN requires_deposit BOOLEAN DEFAULT TRUE;

-- Create a table to track booking modifications
CREATE TABLE IF NOT EXISTS public.booking_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('reschedule', 'cancel')),
  old_date DATE,
  old_start_time TIME,
  old_end_time TIME,
  new_date DATE,
  new_start_time TIME,
  new_end_time TIME,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on booking_modifications
ALTER TABLE public.booking_modifications ENABLE ROW LEVEL SECURITY;

-- Create policies for booking_modifications
CREATE POLICY "Users can view their booking modifications" 
  ON public.booking_modifications 
  FOR SELECT 
  USING (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE customer_email = auth.email()
    )
  );

CREATE POLICY "Users can create booking modifications" 
  ON public.booking_modifications 
  FOR INSERT 
  WITH CHECK (
    appointment_id IN (
      SELECT id FROM appointments 
      WHERE customer_email = auth.email()
    )
  );

-- Create a function to calculate deposit amount
CREATE OR REPLACE FUNCTION calculate_deposit_amount(service_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN ROUND(service_price * 0.5, 2);
END;
$$ LANGUAGE plpgsql;

-- Update existing appointments to have deposit requirements
UPDATE public.appointments 
SET deposit_amount = (
  SELECT calculate_deposit_amount(s.price) 
  FROM services s 
  WHERE s.id = appointments.service_id
)
WHERE deposit_amount IS NULL;
