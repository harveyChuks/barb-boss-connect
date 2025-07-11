-- Function to initialize default service point for businesses without any
CREATE OR REPLACE FUNCTION public.initialize_default_service_point(p_business_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Check if business already has service points
  IF NOT EXISTS (
    SELECT 1 FROM service_points WHERE business_id = p_business_id
  ) THEN
    -- Insert default service point
    INSERT INTO public.service_points (business_id, name, description, max_concurrent_slots, is_active)
    VALUES (p_business_id, 'Main Service Point', 'Default service area', 1, true);
  END IF;
END;
$function$;

-- Create trigger to auto-create default service point for new businesses
CREATE OR REPLACE FUNCTION public.handle_new_business()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Create default service point for new business
  PERFORM initialize_default_service_point(NEW.id);
  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS create_default_service_point ON public.businesses;
CREATE TRIGGER create_default_service_point
  AFTER INSERT ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_business();