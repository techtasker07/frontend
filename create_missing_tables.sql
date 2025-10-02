-- Create missing tables for marketplace functionality

-- Create listing_types table
CREATE TABLE IF NOT EXISTS public.listing_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create property_types table
CREATE TABLE IF NOT EXISTS public.property_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view listing types" ON public.listing_types
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view property types" ON public.property_types
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS property_types_category_id_idx ON public.property_types(category_id);

COMMIT;