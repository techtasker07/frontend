-- COMPLETELY DISABLE RLS FOR DEVELOPMENT
-- WARNING: This script removes ALL security policies for development purposes
-- Use this only for development environments, NOT in production
-- Run this script in your Supabase SQL editor if the previous script doesn't work

-- Step 1: Disable Row Level Security on all tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_prospects DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;

DROP POLICY IF EXISTS "Anyone can view vote options" ON public.vote_options;
DROP POLICY IF EXISTS "Public can view vote options" ON public.vote_options;

DROP POLICY IF EXISTS "Anyone can view properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;

DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
DROP POLICY IF EXISTS "Property owners can insert images" ON public.property_images;
DROP POLICY IF EXISTS "Property owners can update images" ON public.property_images;
DROP POLICY IF EXISTS "Property owners can delete images" ON public.property_images;

DROP POLICY IF EXISTS "Anyone can view votes" ON public.votes;
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON public.votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON public.votes;

DROP POLICY IF EXISTS "Anyone can view prospect properties" ON public.prospect_properties;
DROP POLICY IF EXISTS "Authenticated users can insert prospect properties" ON public.prospect_properties;

DROP POLICY IF EXISTS "Anyone can view property prospects" ON public.property_prospects;
DROP POLICY IF EXISTS "Authenticated users can insert property prospects" ON public.property_prospects;

-- Step 3: Remove the automatic profile creation trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Clean up any storage policies that might cause issues
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own property images" ON storage.objects;

-- Step 5: Create simple storage policies for property images
CREATE POLICY "Public access to property images" ON storage.objects
  FOR ALL USING (bucket_id = 'property-images');

-- Step 6: Grant necessary permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO anon;
GRANT ALL ON public.vote_options TO authenticated;
GRANT ALL ON public.vote_options TO anon;
GRANT ALL ON public.properties TO authenticated;
GRANT ALL ON public.property_images TO authenticated;
GRANT ALL ON public.votes TO authenticated;
GRANT ALL ON public.prospect_properties TO authenticated;
GRANT ALL ON public.property_prospects TO authenticated;

-- Step 7: Verification - Check which tables still have RLS enabled
-- Run this to see which tables still have RLS enabled (should be none after this script)
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' AND rowsecurity = true;

-- Step 8: Create a simple profile creation function with no restrictions
CREATE OR REPLACE FUNCTION public.create_profile_unrestricted(
  user_id UUID,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone_number)
  VALUES (user_id, user_email, first_name, last_name, phone_number)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone_number = EXCLUDED.phone_number,
    updated_at = NOW()
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.create_profile_unrestricted TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_unrestricted TO anon;

-- Success message
SELECT 'RLS has been completely disabled for all tables. Registration should now work freely.' AS status;
