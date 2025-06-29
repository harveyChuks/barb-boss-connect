
-- Create storage bucket for work pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('work-pictures', 'work-pictures', true);

-- Create policy to allow authenticated users to upload their own work pictures
CREATE POLICY "Allow authenticated users to upload work pictures" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'work-pictures');

-- Create policy to allow users to view all work pictures (public portfolio)
CREATE POLICY "Allow public read access to work pictures" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'work-pictures');

-- Create policy to allow users to update their own work pictures
CREATE POLICY "Allow users to update their own work pictures" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'work-pictures');

-- Create policy to allow users to delete their own work pictures
CREATE POLICY "Allow users to delete their own work pictures" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'work-pictures');
