-- Create page visits tracking table
CREATE TABLE public.page_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  business_id uuid NULL, -- nullable for general site visits
  user_agent text NULL,
  ip_address text NULL,
  referrer text NULL,
  session_id text NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  visit_timestamp timestamp with time zone NOT NULL DEFAULT now(),
  country text NULL,
  city text NULL,
  device_type text NULL, -- mobile, desktop, tablet
  is_unique_visit boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for better performance on common queries
CREATE INDEX idx_page_visits_date ON public.page_visits(visit_date);
CREATE INDEX idx_page_visits_business ON public.page_visits(business_id);
CREATE INDEX idx_page_visits_path ON public.page_visits(page_path);

-- Enable RLS
ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert visit data (public tracking)
CREATE POLICY "Anyone can create page visits"
ON public.page_visits
FOR INSERT
WITH CHECK (true);

-- Only admins can view all visits
CREATE POLICY "Admins can view all page visits"
ON public.page_visits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Business owners can view visits to their business pages
CREATE POLICY "Business owners can view their page visits"
ON public.page_visits
FOR SELECT
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
);