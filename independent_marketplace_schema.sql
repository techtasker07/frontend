-- Independent Marketplace Schema
-- This creates a completely independent marketplace system that doesn't depend on the properties table

-- Drop existing marketplace_listings table if it exists
DROP TABLE IF EXISTS public.marketplace_listings CASCADE;
DROP TABLE IF EXISTS public.marketplace_images CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;

-- Create independent marketplace_listings table with all property details
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Property Information
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Property Type and Category
  listing_type_id UUID REFERENCES public.listing_types(id) ON DELETE RESTRICT NOT NULL,
  property_type_id UUID REFERENCES public.property_types(id) ON DELETE RESTRICT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
  
  -- Pricing Information
  price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  price_period TEXT, -- 'monthly', 'yearly', 'daily', 'per_night', null for sale
  security_deposit NUMERIC(12,2),
  
  -- Property Details
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  area_sqm INTEGER,
  year_of_construction INTEGER,
  furnishing_status TEXT, -- 'furnished', 'semi-furnished', 'unfurnished'
  parking_spaces INTEGER DEFAULT 0,
  
  -- Availability
  available_from DATE,
  available_to DATE,
  
  -- Features and Amenities
  amenities JSONB DEFAULT '[]'::jsonb,
  utilities_included BOOLEAN DEFAULT false,
  
  -- Listing Management
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  
  -- Contact Information
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,
  
  -- User who created the listing
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- SEO and Additional Info
  keywords TEXT[],
  virtual_tour_url TEXT,
  video_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create marketplace_images table for property images
CREATE TABLE IF NOT EXISTS public.marketplace_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Recreate bookings table with correct reference
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

-- Recreate favorites table with correct reference
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL,
  UNIQUE(user_id, marketplace_listing_id)
);

-- Enable RLS on new tables
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Marketplace listings policies
CREATE POLICY "Anyone can view active marketplace listings" ON public.marketplace_listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create marketplace listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their marketplace listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their marketplace listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Marketplace images policies
CREATE POLICY "Anyone can view marketplace images" ON public.marketplace_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings 
      WHERE id = marketplace_listing_id AND is_active = true
    )
  );

CREATE POLICY "Listing owners can manage their images" ON public.marketplace_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings 
      WHERE id = marketplace_listing_id AND user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Listing owners can view bookings for their properties" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings 
      WHERE id = marketplace_listing_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Listing owners can update bookings for their properties" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings 
      WHERE id = marketplace_listing_id AND user_id = auth.uid()
    )
  );

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS marketplace_listings_category_id_idx ON public.marketplace_listings(category_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_listing_type_id_idx ON public.marketplace_listings(listing_type_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_property_type_id_idx ON public.marketplace_listings(property_type_id);
CREATE INDEX IF NOT EXISTS marketplace_listings_price_idx ON public.marketplace_listings(price);
CREATE INDEX IF NOT EXISTS marketplace_listings_location_idx ON public.marketplace_listings USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS marketplace_listings_title_idx ON public.marketplace_listings USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS marketplace_listings_is_active_idx ON public.marketplace_listings(is_active);
CREATE INDEX IF NOT EXISTS marketplace_listings_is_featured_idx ON public.marketplace_listings(is_featured);
CREATE INDEX IF NOT EXISTS marketplace_listings_created_at_idx ON public.marketplace_listings(created_at);
CREATE INDEX IF NOT EXISTS marketplace_listings_bedrooms_idx ON public.marketplace_listings(bedrooms);
CREATE INDEX IF NOT EXISTS marketplace_listings_bathrooms_idx ON public.marketplace_listings(bathrooms);
CREATE INDEX IF NOT EXISTS marketplace_listings_user_id_idx ON public.marketplace_listings(user_id);

CREATE INDEX IF NOT EXISTS marketplace_images_listing_id_idx ON public.marketplace_images(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS marketplace_images_is_primary_idx ON public.marketplace_images(is_primary);
CREATE INDEX IF NOT EXISTS marketplace_images_display_order_idx ON public.marketplace_images(display_order);

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_marketplace_listing_id_idx ON public.bookings(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_marketplace_listing_id_idx ON public.favorites(marketplace_listing_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data

INSERT INTO public.marketplace_listings (
  title, description, location, listing_type_id, property_type_id, category_id,
  price, currency, price_period, bedrooms, bathrooms, area_sqft, area_sqm,
  parking_spaces, amenities, utilities_included, is_featured, is_active,
  contact_name, contact_phone, contact_email, user_id
) VALUES 
-- Sample listing 1: For Sale Apartment
(
  'Luxury 3-Bedroom Apartment in Victoria Island',
  'Stunning oceanview apartment with modern amenities in the heart of Victoria Island. Perfect for professionals and families seeking upscale living.',
  'Victoria Island, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Sale' LIMIT 1),
  (SELECT id FROM property_types WHERE name = 'Apartment' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Residential' LIMIT 1),
  25000000, 'NGN', NULL,
  3, 2, 1200, 111,
  2, '["WiFi", "AC", "Security", "Generator", "Swimming Pool", "Gym"]'::jsonb, true, true, true,
  'John Doe', '+234-803-123-4567', 'john@example.com',
  (SELECT id FROM profiles LIMIT 1)
),
-- Sample listing 2: For Rent House
(
  'Modern 2-Bedroom House in Lekki Phase 1',
  'Spacious house in a secured gated community with excellent amenities and 24/7 security. Ideal for young families.',
  'Lekki Phase 1, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Rent' LIMIT 1),
  (SELECT id FROM property_types WHERE name = 'House' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Residential' LIMIT 1),
  1500000, 'NGN', 'monthly',
  2, 2, 850, 79,
  1, '["WiFi", "Security", "Generator", "Playground"]'::jsonb, false, true, true,
  'Jane Smith', '+234-805-987-6543', 'jane@example.com',
  (SELECT id FROM profiles LIMIT 1)
),
-- Sample listing 3: For Sale Villa
(
  'Exquisite 4-Bedroom Villa in Ikoyi',
  'Premium villa with private pool, landscaped garden, and luxury finishes in prestigious Ikoyi neighborhood.',
  'Ikoyi, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Sale' LIMIT 1),
  (SELECT id FROM property_types WHERE name = 'Villa' LIMIT 1),
  (SELECT id FROM categories WHERE name = 'Residential' LIMIT 1),
  45000000, 'NGN', NULL,
  4, 3, 2000, 186,
  3, '["Private Pool", "Garden", "Gym", "Security", "Generator", "Maid Room", "Study Room"]'::jsonb, false, false, true,
  'Mike Johnson', '+234-807-111-2222', 'mike@example.com',
  (SELECT id FROM profiles LIMIT 1)
);

-- Insert sample images for the listings
INSERT INTO public.marketplace_images (marketplace_listing_id, image_url, is_primary, caption, display_order)
SELECT 
  ml.id,
  '/api/placeholder/800/600',
  true,
  'Main property view',
  1
FROM public.marketplace_listings ml
WHERE ml.title LIKE '%Victoria Island%'
UNION ALL
SELECT 
  ml.id,
  '/api/placeholder/800/600',
  true,
  'Front view of the house',
  1
FROM public.marketplace_listings ml
WHERE ml.title LIKE '%Lekki%'
UNION ALL
SELECT 
  ml.id,
  '/api/placeholder/800/600',
  true,
  'Villa exterior with pool',
  1
FROM public.marketplace_listings ml
WHERE ml.title LIKE '%Villa%';

COMMIT;
