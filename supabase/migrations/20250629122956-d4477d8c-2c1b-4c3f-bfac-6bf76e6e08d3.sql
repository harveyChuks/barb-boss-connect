
-- Add business hours table
CREATE TABLE public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(business_id, day_of_week)
);

-- Add appointment modifications tracking
CREATE TABLE public.appointment_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('reschedule', 'cancel', 'status_change')),
  old_date DATE,
  old_start_time TIME,
  old_end_time TIME,
  new_date DATE,
  new_start_time TIME,
  new_end_time TIME,
  old_status TEXT,
  new_status TEXT,
  reason TEXT,
  modified_by TEXT, -- 'customer' or 'business'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add payment tracking
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_intent_id TEXT, -- For Stripe integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX idx_business_hours_business_id ON business_hours(business_id);
CREATE INDEX idx_appointment_modifications_appointment_id ON appointment_modifications(appointment_id);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);

-- Function to check for appointment conflicts
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_business_id UUID,
  p_appointment_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_staff_id UUID DEFAULT NULL,
  p_exclude_appointment_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping appointments
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE business_id = p_business_id
    AND appointment_date = p_appointment_date
    AND status NOT IN ('cancelled', 'no_show')
    AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
    AND (p_staff_id IS NULL OR staff_id = p_staff_id OR staff_id IS NULL)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get available time slots (fixed variable name)
CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_business_id UUID,
  p_date DATE,
  p_duration_minutes INTEGER,
  p_staff_id UUID DEFAULT NULL
) RETURNS TABLE (
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  business_hours_rec RECORD;
  slot_time_var TIME;
  slot_end_time TIME;
  slot_interval INTERVAL := '30 minutes'; -- 30-minute slots
BEGIN
  -- Get business hours for the day
  SELECT bh.start_time, bh.end_time, bh.is_closed
  INTO business_hours_rec
  FROM business_hours bh
  WHERE bh.business_id = p_business_id
    AND bh.day_of_week = EXTRACT(DOW FROM p_date);
  
  -- If no business hours found or closed, return empty
  IF business_hours_rec IS NULL OR business_hours_rec.is_closed THEN
    RETURN;
  END IF;
  
  -- Generate time slots
  slot_time_var := business_hours_rec.start_time;
  WHILE slot_time_var < business_hours_rec.end_time LOOP
    slot_end_time := slot_time_var + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Only return slot if it fits within business hours
    IF slot_end_time <= business_hours_rec.end_time THEN
      RETURN QUERY SELECT 
        slot_time_var,
        NOT check_appointment_conflict(
          p_business_id,
          p_date,
          slot_time_var,
          slot_end_time::TIME,
          p_staff_id
        );
    END IF;
    
    slot_time_var := slot_time_var + slot_interval;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Business hours policies (business owners can manage their hours)
CREATE POLICY "Business owners can manage their business hours"
  ON business_hours
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- Public read access to business hours for booking
CREATE POLICY "Public can view business hours"
  ON business_hours
  FOR SELECT
  USING (true);

-- Appointment modifications policies
CREATE POLICY "Business owners can view all modifications"
  ON appointment_modifications
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN businesses b ON a.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create modifications"
  ON appointment_modifications
  FOR INSERT
  WITH CHECK (true);

-- Payment policies
CREATE POLICY "Business owners can view payments"
  ON payments
  FOR SELECT
  USING (
    appointment_id IN (
      SELECT a.id FROM appointments a
      JOIN businesses b ON a.business_id = b.id
      WHERE b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments"
  ON payments
  FOR INSERT
  WITH CHECK (true);

-- Add cancellation_reason column to appointments
ALTER TABLE appointments ADD COLUMN cancellation_reason TEXT;
ALTER TABLE appointments ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE appointments ADD COLUMN can_reschedule BOOLEAN DEFAULT TRUE;
ALTER TABLE appointments ADD COLUMN can_cancel BOOLEAN DEFAULT TRUE;
