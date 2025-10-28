-- Fresh Marketplace Schema
-- This creates a clean, comprehensive marketplace schema based on the form and details page requirements

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(category_id, name)
);

-- Create marketplace_listings table with all required fields
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic Information
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',

  -- Property Type and Category
  listing_type_id UUID REFERENCES public.listing_types(id) ON DELETE RESTRICT NOT NULL,
  property_type_id UUID REFERENCES public.property_types(id) ON DELETE RESTRICT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,

  -- Pricing Information
  price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  price_period TEXT, -- 'one-time', 'month', 'year', 'day', 'week', 'hour'

  -- Property Details
  property_condition TEXT, -- 'new', 'excellent', 'good', 'fair', 'needs_renovation'
  property_size TEXT,
  area_sqft INTEGER,
  area_sqm INTEGER,
  year_of_construction INTEGER,

  -- Residential Fields
  bedrooms INTEGER,
  bathrooms INTEGER,
  toilets INTEGER,
  kitchen_size TEXT,
  dining_room BOOLEAN DEFAULT false,
  balcony_terrace BOOLEAN DEFAULT false,
  furnishing_status TEXT, -- 'furnished', 'semi-furnished', 'unfurnished'
  parking_spaces INTEGER DEFAULT 0,
  pet_friendly BOOLEAN DEFAULT false,
  appliances_included JSONB DEFAULT '[]'::jsonb,
  security_features JSONB DEFAULT '[]'::jsonb,
  neighbourhood_features JSONB DEFAULT '[]'::jsonb,

  -- Commercial Fields
  property_usage_type TEXT,
  total_floors INTEGER,
  floor_number INTEGER,
  office_rooms INTEGER,
  conference_rooms INTEGER,
  internet_available BOOLEAN DEFAULT false,
  power_supply TEXT,
  loading_dock BOOLEAN DEFAULT false,
  storage_space TEXT,
  accessibility_features JSONB DEFAULT '[]'::jsonb,
  fire_safety_features JSONB DEFAULT '[]'::jsonb,

  -- Land Fields
  land_type TEXT,
  title_document TEXT,
  topography TEXT,
  water_access BOOLEAN DEFAULT false,
  electricity_access BOOLEAN DEFAULT false,
  fence_boundary_status TEXT,
  road_access BOOLEAN DEFAULT false,
  soil_type TEXT,
  proximity_to_amenities JSONB DEFAULT '[]'::jsonb,

  -- Rent-specific Fields
  monthly_rent_amount NUMERIC(12,2),
  security_deposit NUMERIC(12,2),
  utilities_included BOOLEAN DEFAULT false,
  payment_frequency TEXT, -- 'monthly', 'quarterly', 'yearly', 'bi-yearly', 'annual'
  minimum_rental_period TEXT,

  -- Lease-specific Fields
  lease_amount NUMERIC(12,2),
  lease_duration TEXT,
  renewal_terms TEXT,

  -- Booking-specific Fields
  hourly_rate NUMERIC(12,2),
  daily_rate NUMERIC(12,2),
  weekly_rate NUMERIC(12,2),
  check_in_time TIME,
  check_out_time TIME,
  minimum_stay_duration INTEGER, -- in days
  maximum_stay_duration INTEGER, -- in days
  minimum_booking_duration INTEGER, -- in hours
  maximum_booking_duration INTEGER, -- in hours
  cancellation_policy TEXT,
  caution_fee NUMERIC(12,2),
  services_included JSONB DEFAULT '[]'::jsonb,

  -- General Fields
  available_from DATE,
  available_to DATE,
  amenities JSONB DEFAULT '[]'::jsonb,
  keywords TEXT[],

  -- Contact Information
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  contact_whatsapp TEXT,

  -- Media
  virtual_tour_url TEXT,
  video_url TEXT,

  -- Management Fields
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create marketplace_images table
CREATE TABLE IF NOT EXISTS public.marketplace_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, marketplace_listing_id)
);

-- Create marketplace_reviews table
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace_listing_id UUID REFERENCES public.marketplace_listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, marketplace_listing_id)
);

-- Enable RLS
ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Listing types policies
CREATE POLICY "Anyone can view listing types" ON public.listing_types FOR SELECT USING (true);

-- Property types policies
CREATE POLICY "Anyone can view property types" ON public.property_types FOR SELECT USING (true);

-- Marketplace listings policies
CREATE POLICY "Anyone can view active marketplace listings" ON public.marketplace_listings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create marketplace listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Marketplace reviews policies
CREATE POLICY "Anyone can view marketplace reviews" ON public.marketplace_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.marketplace_reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.marketplace_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.marketplace_reviews
  FOR DELETE USING (auth.uid() = user_id);

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
CREATE INDEX IF NOT EXISTS marketplace_listings_city_idx ON public.marketplace_listings(city);
CREATE INDEX IF NOT EXISTS marketplace_listings_state_idx ON public.marketplace_listings(state);
CREATE INDEX IF NOT EXISTS marketplace_listings_user_id_idx ON public.marketplace_listings(user_id);

CREATE INDEX IF NOT EXISTS marketplace_images_listing_id_idx ON public.marketplace_images(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS marketplace_images_is_primary_idx ON public.marketplace_images(is_primary);
CREATE INDEX IF NOT EXISTS marketplace_images_display_order_idx ON public.marketplace_images(display_order);

CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_marketplace_listing_id_idx ON public.bookings(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_marketplace_listing_id_idx ON public.favorites(marketplace_listing_id);

CREATE INDEX IF NOT EXISTS marketplace_reviews_listing_id_idx ON public.marketplace_reviews(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS marketplace_reviews_user_id_idx ON public.marketplace_reviews(user_id);
CREATE INDEX IF NOT EXISTS marketplace_reviews_created_at_idx ON public.marketplace_reviews(created_at);

CREATE INDEX IF NOT EXISTS property_types_category_id_idx ON public.property_types(category_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_marketplace_listings_updated_at BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplace_reviews_updated_at BEFORE UPDATE ON public.marketplace_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default listing types
INSERT INTO public.listing_types (name) VALUES
  ('For Sale'),
  ('For Rent'),
  ('For Lease'),
  ('For Booking')
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