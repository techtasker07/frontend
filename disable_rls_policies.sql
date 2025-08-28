-- Disable Restrictive RLS Policies for Free Registration
-- This script removes or modifies RLS policies that prevent free user registration
-- Run this script in your Supabase SQL editor

-- Step 1: Drop the restrictive profile INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Step 2: Create a more permissive profile INSERT policy
-- This allows any authenticated user to create a profile with any ID
-- (useful during registration when auth.uid() might not match the new user ID immediately)
CREATE POLICY "Authenticated users can insert any profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Alternative: If you want completely open registration (no authentication required)
-- Uncomment the lines below and comment out the policy above
-- DROP POLICY IF EXISTS "Authenticated users can insert any profile" ON public.profiles;
-- CREATE POLICY "Anyone can insert profiles" ON public.profiles
--   FOR INSERT WITH CHECK (true);

-- Step 3: Make categories and vote_options more accessible for new users
-- These policies are already permissive, but let's ensure they work for unauthenticated users too
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view vote options" ON public.vote_options;
CREATE POLICY "Public can view vote options" ON public.vote_options
  FOR SELECT USING (true);

-- Step 4: Allow new users to create properties immediately after registration
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
CREATE POLICY "Authenticated users can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 5: Allow new users to vote immediately after registration
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON public.votes;
CREATE POLICY "Authenticated users can insert votes" ON public.votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Step 6: Remove the automatic profile creation trigger that might conflict
-- with manual profile creation during registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 7: Optional - Completely disable RLS on profiles table for development
-- Uncomment the line below if you want to completely remove RLS from profiles table
-- WARNING: This removes all security on the profiles table
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 8: Create a new simplified profile creation function (optional)
-- This can be used by your application for more controlled profile creation
CREATE OR REPLACE FUNCTION public.create_profile(
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
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile TO authenticated;

-- Verification: Check current policies
-- Run these to verify the changes
-- \d+ public.profiles
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename = 'profiles';
