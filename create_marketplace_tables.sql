-- Create minimal marketplace tables for testing

-- Create listing_types table
CREATE TABLE IF NOT EXISTS public.listing_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create property_types table
CREATE TABLE IF NOT EXISTS public.property_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  listing_type_id UUID REFERENCES public.listing_types(id) ON DELETE RESTRICT NOT NULL,
  property_type_id UUID REFERENCES public.property_types(id) ON DELETE RESTRICT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  price_period TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view listing types" ON public.listing_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view property types" ON public.property_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view active marketplace listings" ON public.marketplace_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create marketplace listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their marketplace listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their marketplace listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = user_id);

-- Insert sample data
INSERT INTO public.listing_types (name) VALUES ('For Sale'), ('For Rent'), ('For Lease'), ('For Booking')
ON CONFLICT (name) DO NOTHING;

-- Insert property types for each category
INSERT INTO public.property_types (category_id, name)
SELECT c.id, pt.name
FROM public.categories c
CROSS JOIN (
  VALUES
    ('Apartment'), ('House'), ('Villa'), ('Duplex'), ('Bungalow'), ('Studio'), ('Room'), ('Shared Apartment'), ('Penthouse'), ('Mansion'),
    ('Office Space'), ('Retail Shop'), ('Restaurant'), ('Warehouse'), ('Shopping Mall'), ('Hotel'), ('Event Center'), ('Coworking Space'), ('Medical Center'), ('Showroom'),
    ('Residential Land'), ('Commercial Land'), ('Agricultural Land'), ('Industrial Land'), ('Mixed-Use Land'), ('Beachfront Land'), ('Waterfront Land'),
    ('Factory'), ('Manufacturing Plant'), ('Storage Facility'), ('Distribution Center'), ('Cold Storage'),
    ('Residential-Commercial'), ('Office-Retail'), ('Hotel-Residential')
) AS pt(name)
WHERE c.name IN ('Residential', 'Commercial', 'Land', 'Industrial', 'Mixed-Use')
ON CONFLICT (category_id, name) DO NOTHING;

COMMIT;