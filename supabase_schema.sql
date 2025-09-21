-- Supabase Database Schema for MipripityWeb
-- This script creates all necessary tables and policies for the property voting platform

-- Enable Row Level Security (RLS) on all tables by default
-- Enable UUID extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  profile_picture TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create vote_options table
CREATE TABLE IF NOT EXISTS public.vote_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  current_worth NUMERIC(12,2),
  year_of_construction INTEGER,
  lister_phone_number TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  vote_option_id UUID REFERENCES public.vote_options(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, property_id) -- Prevent duplicate votes from same user on same property
);

-- Create prospect_properties table
CREATE TABLE IF NOT EXISTS public.prospect_properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  estimated_worth NUMERIC(12,2),
  year_of_construction INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create property_prospects table (investment ideas for prospect properties)
CREATE TABLE IF NOT EXISTS public.property_prospects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prospect_property_id UUID REFERENCES public.prospect_properties(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_cost NUMERIC(12,2) NOT NULL,
  total_cost NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_prospects ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies (read-only for all users)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Vote options policies (read-only for all users)
CREATE POLICY "Anyone can view vote options" ON public.vote_options
  FOR SELECT USING (true);

-- Properties policies
CREATE POLICY "Anyone can view properties" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" ON public.properties
  FOR DELETE USING (auth.uid() = user_id);

-- Property images policies
CREATE POLICY "Anyone can view property images" ON public.property_images
  FOR SELECT USING (true);

CREATE POLICY "Property owners can insert images" ON public.property_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update images" ON public.property_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete images" ON public.property_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- Votes policies
CREATE POLICY "Anyone can view votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert votes" ON public.votes
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own votes" ON public.votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- Prospect properties policies
CREATE POLICY "Anyone can view prospect properties" ON public.prospect_properties
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert prospect properties" ON public.prospect_properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Property prospects policies
CREATE POLICY "Anyone can view property prospects" ON public.property_prospects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert property prospects" ON public.property_prospects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS properties_user_id_idx ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS properties_category_id_idx ON public.properties(category_id);
CREATE INDEX IF NOT EXISTS property_images_property_id_idx ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS votes_property_id_idx ON public.votes(property_id);
CREATE INDEX IF NOT EXISTS votes_user_property_idx ON public.votes(user_id, property_id);
CREATE INDEX IF NOT EXISTS vote_options_category_id_idx ON public.vote_options(category_id);
CREATE INDEX IF NOT EXISTS prospect_properties_category_id_idx ON public.prospect_properties(category_id);
CREATE INDEX IF NOT EXISTS property_prospects_prospect_property_id_idx ON public.property_prospects(prospect_property_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospect_properties_updated_at BEFORE UPDATE ON public.prospect_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_prospects_updated_at BEFORE UPDATE ON public.property_prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (new.id, '', '', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample categories
INSERT INTO public.categories (id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Residential'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Commercial'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Land'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Industrial'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Materials'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Mixed-Use')
ON CONFLICT (name) DO NOTHING;


-- Insert vote options for each category
  INSERT INTO public.vote_options (category_id, name) VALUES
  -- Residential
  ('550e8400-e29b-41d4-a716-446655440001', 'Rent Out'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Sell'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Renovate'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Too Expensive'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Good Location'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Not Secure'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Spacious'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Overcrowded Area'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Future Value'),
  ('550e8400-e29b-41d4-a716-446655440001', 'I Can Buy This'),

  -- Commercial
  ('550e8400-e29b-41d4-a716-446655440002', 'Lease'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sell'),
  ('550e8400-e29b-41d4-a716-446655440002', 'High Traffic'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Poor Access'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Profitable'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Too Expensive'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Develop Further'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Prime Location'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Low Demand'),
  ('550e8400-e29b-41d4-a716-446655440002', 'I Can Buy This'),

  -- Land
  ('550e8400-e29b-41d4-a716-446655440003', 'Build House'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Farming'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Commercial Use'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Hold & Sell'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Risky'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Industrial Use'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Subdivision'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Good Location'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Too Expensive'),
  ('550e8400-e29b-41d4-a716-446655440003', 'I Can Buy This'),

  -- Industrial
  ('550e8400-e29b-41d4-a716-446655440004', 'Factory Use'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Warehouse'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Convert'),
  ('550e8400-e29b-41d4-a716-446655440004', 'High Demand'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Poor Location'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Profitable'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Too Expensive'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Upgrade Needed'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Good Access'),
  ('550e8400-e29b-41d4-a716-446655440004', 'I Can Buy This'),

  -- Materials
  ('550e8400-e29b-41d4-a716-446655440005', 'Bulk Buy'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Quality'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Overpriced'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Scarce'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Affordable'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Not Durable'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Good Demand'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Counterfeit Risk'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Resell'),
  ('550e8400-e29b-41d4-a716-446655440005', 'I Can Buy This'),

  -- Mixed-Use
  ('550e8400-e29b-41d4-a716-446655440006', 'Lease'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Sell'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Convert'),
  ('550e8400-e29b-41d4-a716-446655440006', 'High Demand'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Profitable'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Too Expensive'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Develop Further'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Prime Location'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Good Location'),
  ('550e8400-e29b-41d4-a716-446655440006', 'I Can Buy This')
ON CONFLICT (name) DO NOTHING;

-- Create storage bucket for property images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for property images
CREATE POLICY "Anyone can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own property images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own property images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );
