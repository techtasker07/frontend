-- Marketplace Detailed Fields Update
-- This script adds detailed property fields for Residential, Commercial, and Land categories

-- Add general property details columns
ALTER TABLE public.marketplace_listings
ADD COLUMN IF NOT EXISTS property_condition TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria',

-- Residential specific fields
ADD COLUMN IF NOT EXISTS toilets INTEGER,
ADD COLUMN IF NOT EXISTS kitchen_size TEXT,
ADD COLUMN IF NOT EXISTS dining_room BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS balcony_terrace BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS appliances_included JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS security_features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS neighbourhood_features JSONB DEFAULT '[]'::jsonb,

-- Commercial specific fields
ADD COLUMN IF NOT EXISTS property_usage_type TEXT,
ADD COLUMN IF NOT EXISTS total_floors INTEGER,
ADD COLUMN IF NOT EXISTS floor_number INTEGER,
ADD COLUMN IF NOT EXISTS office_rooms INTEGER,
ADD COLUMN IF NOT EXISTS conference_rooms INTEGER,
ADD COLUMN IF NOT EXISTS internet_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS power_supply TEXT,
ADD COLUMN IF NOT EXISTS loading_dock BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS storage_space TEXT,
ADD COLUMN IF NOT EXISTS accessibility_features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS fire_safety_features JSONB DEFAULT '[]'::jsonb,

-- Land specific fields
ADD COLUMN IF NOT EXISTS land_type TEXT,
ADD COLUMN IF NOT EXISTS title_document TEXT,
ADD COLUMN IF NOT EXISTS topography TEXT,
ADD COLUMN IF NOT EXISTS water_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS electricity_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fence_boundary_status TEXT,
ADD COLUMN IF NOT EXISTS road_access BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS soil_type TEXT,
ADD COLUMN IF NOT EXISTS proximity_to_amenities JSONB DEFAULT '[]'::jsonb,

-- Function-specific fields
ADD COLUMN IF NOT EXISTS payment_frequency TEXT, -- 'monthly', 'quarterly', 'yearly', 'bi-yearly', 'annual'
ADD COLUMN IF NOT EXISTS minimum_rental_period TEXT,
ADD COLUMN IF NOT EXISTS lease_duration TEXT,
ADD COLUMN IF NOT EXISTS renewal_terms TEXT,

-- Booking-specific fields
ADD COLUMN IF NOT EXISTS daily_rate NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS weekly_rate NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS check_out_time TIME,
ADD COLUMN IF NOT EXISTS minimum_stay_duration INTEGER, -- in days
ADD COLUMN IF NOT EXISTS maximum_stay_duration INTEGER, -- in days
ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
ADD COLUMN IF NOT EXISTS caution_fee NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS services_included JSONB DEFAULT '[]'::jsonb;

-- Create indexes for new searchable fields
CREATE INDEX IF NOT EXISTS marketplace_listings_city_idx ON public.marketplace_listings(city);
CREATE INDEX IF NOT EXISTS marketplace_listings_state_idx ON public.marketplace_listings(state);
CREATE INDEX IF NOT EXISTS marketplace_listings_bedrooms_idx ON public.marketplace_listings(bedrooms);
CREATE INDEX IF NOT EXISTS marketplace_listings_bathrooms_idx ON public.marketplace_listings(bathrooms);
CREATE INDEX IF NOT EXISTS marketplace_listings_toilets_idx ON public.marketplace_listings(toilets);
CREATE INDEX IF NOT EXISTS marketplace_listings_pet_friendly_idx ON public.marketplace_listings(pet_friendly);
CREATE INDEX IF NOT EXISTS marketplace_listings_furnishing_status_idx ON public.marketplace_listings(furnishing_status);
CREATE INDEX IF NOT EXISTS marketplace_listings_property_usage_type_idx ON public.marketplace_listings(property_usage_type);
CREATE INDEX IF NOT EXISTS marketplace_listings_land_type_idx ON public.marketplace_listings(land_type);
CREATE INDEX IF NOT EXISTS marketplace_listings_daily_rate_idx ON public.marketplace_listings(daily_rate);
CREATE INDEX IF NOT EXISTS marketplace_listings_weekly_rate_idx ON public.marketplace_listings(weekly_rate);

-- Update trigger for updated_at
CREATE TRIGGER update_marketplace_listings_detailed_updated_at BEFORE UPDATE ON public.marketplace_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;