-- Remove property_id from marketplace_listings table
-- Since we're now fetching marketplace listings directly in getProperties

-- First, drop the foreign key constraint
ALTER TABLE public.marketplace_listings DROP CONSTRAINT IF EXISTS marketplace_listings_property_id_fkey;

-- Remove the property_id column
ALTER TABLE public.marketplace_listings DROP COLUMN IF EXISTS property_id;

-- Update RLS policies to not reference property_id
DROP POLICY IF EXISTS "Property owners can insert marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Property owners can update their marketplace listings" ON public.marketplace_listings;
DROP POLICY IF EXISTS "Property owners can delete their marketplace listings" ON public.marketplace_listings;

-- Create new policies based on user_id
CREATE POLICY "Authenticated users can insert marketplace listings" ON public.marketplace_listings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace listings" ON public.marketplace_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace listings" ON public.marketplace_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Update booking policies to not reference properties
DROP POLICY IF EXISTS "Property owners can view bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Property owners can update bookings for their properties" ON public.bookings;

CREATE POLICY "Listing owners can view bookings for their listings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings ml
      WHERE ml.id = marketplace_listing_id AND ml.user_id = auth.uid()
    )
  );

CREATE POLICY "Listing owners can update bookings for their listings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings ml
      WHERE ml.id = marketplace_listing_id AND ml.user_id = auth.uid()
    )
  );

-- Remove the index for property_id
DROP INDEX IF EXISTS marketplace_listings_property_id_idx;

COMMIT;