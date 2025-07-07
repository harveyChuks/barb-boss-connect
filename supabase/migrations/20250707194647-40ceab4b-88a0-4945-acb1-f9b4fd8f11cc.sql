-- Add WhatsApp and language settings to businesses table
ALTER TABLE public.businesses 
ADD COLUMN whatsapp_number TEXT,
ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT false,
ADD COLUMN whatsapp_settings JSONB,
ADD COLUMN language_settings JSONB,
ADD COLUMN payment_settings JSONB;