-- Add INSERT policies for listing_types and property_types tables

-- Allow authenticated users to insert listing types
CREATE POLICY "Authenticated users can insert listing types" ON public.listing_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to insert property types
CREATE POLICY "Authenticated users can insert property types" ON public.property_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

COMMIT;