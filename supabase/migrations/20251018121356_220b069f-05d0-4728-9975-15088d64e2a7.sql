-- Fix security issue: Set security_invoker on my_appointments view
ALTER VIEW public.my_appointments SET (security_invoker = on);