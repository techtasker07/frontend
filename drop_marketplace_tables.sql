-- Drop Marketplace Tables Schema
-- This script drops all marketplace-related tables and their dependencies

-- Drop triggers first
DROP TRIGGER IF EXISTS update_marketplace_listings_updated_at ON public.marketplace_listings;
DROP TRIGGER IF EXISTS update_marketplace_listings_detailed_updated_at ON public.marketplace_listings;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;

-- Drop policies
DROP POLICY IF EXISTS "Anyone can view active marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can create marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can update their marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Users can delete their marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Property owners can insert marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Property owners can update their marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Property owners can delete their marketplace listings" ON public.marketplace_listings;

DROP POLICY IF EXISTS "Anyone can view marketplace images" ON public.marketplace_images;
DROP POLICY IF EXISTS "Listing owners can manage their images" ON public.marketplace_images;

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Listing owners can view bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Listing owners can update bookings for their properties" ON public.bookings;

DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;

DROP POLICY IF EXISTS "Anyone can view property types" ON public.property_types;
DROP POLICY IF EXISTS "Anyone can view listing types" ON public.listing_types;

-- Drop indexes
DROP INDEX IF EXISTS marketplace_listings_category_id_idx;
DROP INDEX IF EXISTS marketplace_listings_listing_type_id_idx;
DROP INDEX IF EXISTS marketplace_listings_property_type_id_idx;
DROP INDEX IF EXISTS marketplace_listings_price_idx;
DROP INDEX IF EXISTS marketplace_listings_location_idx;
DROP INDEX IF EXISTS marketplace_listings_title_idx;
DROP INDEX IF EXISTS marketplace_listings_is_active_idx;
DROP INDEX IF EXISTS marketplace_listings_is_featured_idx;
DROP INDEX IF EXISTS marketplace_listings_created_at_idx;
DROP INDEX IF EXISTS marketplace_listings_bedrooms_idx;
DROP INDEX IF EXISTS marketplace_listings_bathrooms_idx;
DROP INDEX IF EXISTS marketplace_listings_user_id_idx;
DROP INDEX IF EXISTS marketplace_listings_property_id_idx;
DROP INDEX IF EXISTS marketplace_listings_city_idx;
DROP INDEX IF EXISTS marketplace_listings_state_idx;
DROP INDEX IF EXISTS marketplace_listings_toilets_idx;
DROP INDEX IF EXISTS marketplace_listings_pet_friendly_idx;
DROP INDEX IF EXISTS marketplace_listings_furnishing_status_idx;
DROP INDEX IF EXISTS marketplace_listings_property_usage_type_idx;
DROP INDEX IF EXISTS marketplace_listings_land_type_idx;
DROP INDEX IF EXISTS marketplace_listings_daily_rate_idx;
DROP INDEX IF EXISTS marketplace_listings_weekly_rate_idx;

DROP INDEX IF EXISTS marketplace_images_listing_id_idx;
DROP INDEX IF EXISTS marketplace_images_is_primary_idx;
DROP INDEX IF EXISTS marketplace_images_display_order_idx;

DROP INDEX IF EXISTS bookings_user_id_idx;
DROP INDEX IF EXISTS bookings_marketplace_listing_id_idx;
DROP INDEX IF EXISTS bookings_status_idx;

DROP INDEX IF EXISTS favorites_user_id_idx;
DROP INDEX IF EXISTS favorites_marketplace_listing_id_idx;

DROP INDEX IF EXISTS property_types_category_id_idx;

-- Drop tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.marketplace_images CASCADE;
DROP TABLE IF EXISTS public.marketplace_listings CASCADE;
DROP TABLE IF EXISTS public.property_types CASCADE;
DROP TABLE IF EXISTS public.listing_types CASCADE;

COMMIT;