-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view work pictures" ON work_pictures;

-- Create a simpler policy that allows truly public access to work pictures
CREATE POLICY "Public can view all work pictures"
  ON work_pictures
  FOR SELECT
  USING (true);

-- Keep the business owner management policy as is
-- (Already exists: "Business owners can manage their work pictures")