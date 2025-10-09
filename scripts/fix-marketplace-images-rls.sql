-- Fix RLS policy for marketplace_images to allow proper inserts
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Listing owners can manage their images" ON public.marketplace_images;

-- Create separate policies for different operations
CREATE POLICY "Anyone can view marketplace images" ON public.marketplace_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings
      WHERE id = marketplace_listing_id AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can insert marketplace images" ON public.marketplace_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Listing owners can update their images" ON public.marketplace_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings
      WHERE id = marketplace_listing_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Listing owners can delete their images" ON public.marketplace_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_listings
      WHERE id = marketplace_listing_id AND user_id = auth.uid()
    )
  );