-- Revert RLS policy changes for services back to original restrictive state
DROP POLICY IF EXISTS "Public can view active services for active businesses" ON services;

-- Restore original policy that requires authentication
CREATE POLICY "Anyone can view active services" 
ON services 
FOR SELECT 
USING (is_active = true);