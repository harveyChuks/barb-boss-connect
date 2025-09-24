-- Check if there are any existing admin users
DO $$
BEGIN
  -- If no admin users exist, we'll allow the next user who signs up to become admin
  -- You can also manually insert your user ID here if you know it
  
  -- Example: Replace 'your-user-id-here' with your actual user ID from auth.users
  -- INSERT INTO public.user_roles (user_id, role) 
  -- VALUES ('your-user-id-here', 'admin')
  -- ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Admin setup instructions: After signing up, run this query with your user ID to become admin';
END $$;