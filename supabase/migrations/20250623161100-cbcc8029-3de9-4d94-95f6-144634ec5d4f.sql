
-- Create table for storing work pictures/portfolio
CREATE TABLE public.work_pictures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  service_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update services table to include price (it already exists but let's ensure it's properly set up)
-- No changes needed to services table as it already has price and business_id

-- Update appointments table to properly link with customers and services
-- The appointments table already exists with the right structure

-- Create storage bucket for work pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('work-pictures', 'work-pictures', true);

-- Enable RLS for work_pictures
ALTER TABLE public.work_pictures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_pictures
CREATE POLICY "Business owners can manage their work pictures" 
  ON public.work_pictures 
  FOR ALL 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view work pictures" 
  ON public.work_pictures 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE is_active = true
    )
  );

-- Storage policies for work-pictures bucket
CREATE POLICY "Business owners can upload work pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'work-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Business owners can update their work pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'work-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Business owners can delete their work pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'work-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view work pictures"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-pictures');

-- Create indexes for better performance
CREATE INDEX idx_work_pictures_business_id ON public.work_pictures(business_id);
