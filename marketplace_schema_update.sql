-- Marketplace Database Schema Update
-- This script adds marketplace-specific tables and updates existing ones

-- Add new property types for marketplace
CREATE TABLE IF NOT EXISTS public.property_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add listing types (sale, rent, lease, booking)
CREATE TABLE IF NOT EXISTS public.listing_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add marketplace listings table (extends properties)
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  listing_type_id UUID REFERENCES public.listing_types(id) ON DELETE RESTRICT NOT NULL,
  property_type_id UUID REFERENCES public.property_types(id) ON DELETE RESTRICT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  price_period TEXT, -- 'monthly', 'yearly', 'daily', 'per_night', null for sale
  available_from DATE,
  available_to DATE,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  area_sqm INTEGER,
  furnishing_status TEXT, -- 'furnished', 'semi-furnished', 'unfurnished'
  parking_spaces INTEGER DEFAULT 0,
  amenities JSONB DEFAULT '[]'::jsonb,
  utilities_included BOOLEAN DEFAULT false,
  security_deposit NUMERIC(12,2),
  commission_rate NUMERIC(5,2), -- percentage
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add bookings table for rental/lease bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_type TEXT NOT NULL, -- 'inquiry', 'booking_request', 'viewing_request'
  start_date DATE,
  end_date DATE,
  guest_count INTEGER,
  message TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  total_amount NUMERIC(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, marketplace_listing_id)
);

-- Enable RLS on new tables
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for new tables

-- Property types policies (read-only for all users)
CREATE POLICY "Anyone can view property types" ON public.property_types
  FOR SELECT USING (true);

-- Listing types policies (read-only for all users)
CREATE POLICY "Anyone can view listing types" ON public.listing_types
  FOR SELECT USING (true);

-- Marketplace listings policies
CREATE POLICY "Anyone can view active marketplace listings" ON public.marketplace_listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Property owners can insert marketplace listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update their marketplace listings" ON public.marketplace_listings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete their marketplace listings" ON public.marketplace_listings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE id = property_id AND user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view bookings for their properties" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings ml
      JOIN public.properties p ON p.id = ml.property_id
      WHERE ml.id = marketplace_listing_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Property owners can update bookings for their properties" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings ml
      JOIN public.properties p ON p.id = ml.property_id
      WHERE ml.id = marketplace_listing_id AND p.user_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS marketplace_listings_property_id_idx ON public.marketplace_listings(property_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_listing_type_id_idx ON public.marketplace_listings(listing_type_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_property_type_id_idx ON public.marketplace_listings(property_type_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_price_idx ON public.marketplace_listings(price);
CREATE INDEX IF NOT EXISTS marketplace_listings_is_active_idx ON public.marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS marketplace_listings_is_featured_idx ON public.marketplace_listings(is_featured);
CREATE INDEX IF NOT EXISTS marketplace_listings_created_at_idx ON public.marketplace_listings(created_at);

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_marketplace_listing_id_idx ON public.bookings(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_marketplace_listing_id_idx ON public.favorites(marketplace_listing_id);

CREATE INDEX IF NOT EXISTS property_types_category_id_idx ON public.property_types(category_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default listing types
INSERT INTO public.listing_types (id, name) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'For Sale'),
  ('650e8400-e29b-41d4-a716-446655440002', 'For Rent'),
  ('650e8400-e29b-41d4-a716-446655440003', 'For Lease'),
  ('650e8400-e29b-41d4-a716-446655440004', 'For Booking')
ON CONFLICT (name) DO NOTHING;

-- Insert property types for each category
INSERT INTO public.property_types (category_id, name) VALUES
  -- Residential property types
  ('550e8400-e29b-41d4-a716-446655440001', 'Apartment'),
  ('550e8400-e29b-41d4-a716-446655440001', 'House'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Villa'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Duplex'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Bungalow'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Studio'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Room'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Shared Apartment'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Penthouse'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Mansion'),

  -- Commercial property types
  ('550e8400-e29b-41d4-a716-446655440002', 'Office Space'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Retail Shop'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Restaurant'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Warehouse'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Shopping Mall'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Hotel'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Event Center'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Coworking Space'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Medical Center'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Showroom'),

  -- Land property types
  ('550e8400-e29b-41d4-a716-446655440003', 'Residential Land'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Commercial Land'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Agricultural Land'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Industrial Land'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mixed-Use Land'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Beachfront Land'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Waterfront Land'),

  -- Industrial property types
  ('550e8400-e29b-41d4-a716-446655440004', 'Factory'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Manufacturing Plant'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Storage Facility'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Distribution Center'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Cold Storage'),

  -- Mixed-Use property types
  ('550e8400-e29b-41d4-a716-446655440006', 'Residential-Commercial'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Office-Retail'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Hotel-Residential')
ON CONFLICT DO NOTHING;
