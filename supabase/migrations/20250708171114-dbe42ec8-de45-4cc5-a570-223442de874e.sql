-- Add WhatsApp integration columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS whatsapp_settings jsonb DEFAULT '{}'::jsonb;

-- Add payment gateway settings to businesses table  
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS payment_settings jsonb DEFAULT '{}'::jsonb;

-- Add offline sync settings
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS offline_settings jsonb DEFAULT '{"enabled": true, "syncInterval": 300}'::jsonb;

-- Add payment methods table for local payments
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  provider text NOT NULL, -- 'mpesa', 'paystack', 'flutterwave', 'mtn_momo'
  provider_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_methods
CREATE POLICY "Business owners can manage their payment methods"
ON payment_methods
FOR ALL
TO authenticated
USING (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));

-- Add offline sync tracking table
CREATE TABLE IF NOT EXISTS offline_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL, -- 'create', 'update', 'delete'
  data jsonb,
  synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on offline_sync_log
ALTER TABLE offline_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for offline_sync_log
CREATE POLICY "Business owners can manage their sync logs"
ON offline_sync_log
FOR ALL
TO authenticated
USING (business_id IN (
  SELECT id FROM businesses WHERE owner_id = auth.uid()
));

-- Add updated_at triggers for new tables
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_business_id ON payment_methods(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_provider ON payment_methods(provider);
CREATE INDEX IF NOT EXISTS idx_offline_sync_business_id ON offline_sync_log(business_id);
CREATE INDEX IF NOT EXISTS idx_offline_sync_synced ON offline_sync_log(synced);