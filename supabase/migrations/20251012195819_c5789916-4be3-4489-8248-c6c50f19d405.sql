-- Create business-logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to view all business logos (public bucket)
CREATE POLICY "Business logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-logos');

-- Allow authenticated users to upload their own business logos
CREATE POLICY "Users can upload their own business logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own business logos
CREATE POLICY "Users can update their own business logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own business logos
CREATE POLICY "Users can delete their own business logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);