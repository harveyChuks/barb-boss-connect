-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage system settings
CREATE POLICY "Only admins can manage system settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
('general', '{"maintenance_mode": false, "registration_enabled": true, "max_businesses_per_user": 5, "default_trial_days": 90, "support_email": "support@bizflow.com", "platform_name": "BizFlow", "platform_description": "Business appointment booking platform"}'::jsonb),
('notifications', '{"email_notifications": true, "sms_notifications": false}'::jsonb),
('backup', '{"backup_enabled": true, "backup_frequency": "daily"}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;