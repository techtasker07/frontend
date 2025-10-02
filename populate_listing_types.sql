-- Populate listing_types and property_types tables
-- This script temporarily disables RLS to insert required data

-- Disable RLS temporarily for setup
ALTER TABLE public.listing_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types DISABLE ROW LEVEL SECURITY;

-- Insert listing types
INSERT INTO public.listing_types (id, name) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'For Sale'),
  ('650e8400-e29b-41d4-a716-446655440002', 'For Rent'),
  ('650e8400-e29b-41d4-a716-446655440003', 'For Lease'),
  ('650e8400-e29b-41d4-a716-446655440004', 'For Booking')
ON CONFLICT (id) DO NOTHING;

-- Insert property types for each category
INSERT INTO public.property_types (id, category_id, name) VALUES
  -- Residential property types
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Apartment'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'House'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Villa'),
  ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Duplex'),
  ('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Studio'),

  -- Commercial property types
  ('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Office Space'),
  ('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Retail Shop'),
  ('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Restaurant'),
  ('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'Warehouse'),

  -- Land property types
  ('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Residential Land'),
  ('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Commercial Land'),
  ('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Agricultural Land'),

  -- Industrial property types
  ('750e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440004', 'Factory'),
  ('750e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'Warehouse'),

  -- Materials property types
  ('750e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'Building Materials'),
  ('750e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', 'Construction Equipment'),

  -- Mixed-Use property types
  ('750e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440006', 'Mixed-Use Building'),
  ('750e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440006', 'Commercial-Residential')
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE public.listing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;

-- Verify the data was inserted
SELECT 'listing_types' as table_name, COUNT(*) as count FROM public.listing_types
UNION ALL
SELECT 'property_types' as table_name, COUNT(*) as count FROM public.property_types;

COMMIT;