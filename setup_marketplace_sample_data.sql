-- Sample data for marketplace listings
-- This script inserts sample data for testing the marketplace page

-- First, insert listing types
INSERT INTO listing_types (name) VALUES
('For Sale'),
('For Rent'),
('For Lease'),
('For Booking')
ON CONFLICT (name) DO NOTHING;

-- Insert property types for each category
INSERT INTO property_types (category_id, name) VALUES
-- Residential category (assuming ID from categories table)
((SELECT id FROM categories WHERE name = 'Residential'), 'Apartment'),
((SELECT id FROM categories WHERE name = 'Residential'), 'House'),
((SELECT id FROM categories WHERE name = 'Residential'), 'Villa'),
((SELECT id FROM categories WHERE name = 'Residential'), 'Duplex'),
((SELECT id FROM categories WHERE name = 'Residential'), 'Studio'),

-- Commercial category
((SELECT id FROM categories WHERE name = 'Commercial'), 'Office Space'),
((SELECT id FROM categories WHERE name = 'Commercial'), 'Retail Shop'),
((SELECT id FROM categories WHERE name = 'Commercial'), 'Restaurant'),
((SELECT id FROM categories WHERE name = 'Commercial'), 'Warehouse'),

-- Land category
((SELECT id FROM categories WHERE name = 'Land'), 'Residential Land'),
((SELECT id FROM categories WHERE name = 'Land'), 'Commercial Land'),
((SELECT id FROM categories WHERE name = 'Land'), 'Agricultural Land')
ON CONFLICT (category_id, name) DO NOTHING;

-- Insert sample marketplace listings
INSERT INTO marketplace_listings (
  title,
  description,
  location,
  listing_type_id,
  property_type_id,
  category_id,
  price,
  currency,
  price_period,
  bedrooms,
  bathrooms,
  area_sqft,
  parking_spaces,
  amenities,
  utilities_included,
  is_featured,
  is_active,
  views_count,
  contact_phone,
  contact_email,
  user_id,
  created_at,
  updated_at
) VALUES
(
  'Modern 3-Bedroom Apartment',
  'Beautiful modern apartment in the heart of Lagos with stunning city views. Fully furnished with all amenities.',
  'Victoria Island, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Rent'),
  (SELECT id FROM property_types WHERE name = 'Apartment'),
  (SELECT id FROM categories WHERE name = 'Residential'),
  2500000,
  'NGN',
  'monthly',
  3,
  2,
  1200,
  1,
  '["WiFi", "AC", "Security", "Gym", "Pool"]',
  true,
  true,
  true,
  45,
  '+234-801-234-5678',
  'contact@modernapartments.ng',
  'c189d980-8a80-411a-b01d-36a4b9c7963c',
  NOW(),
  NOW()
),
(
  'Luxury Villa with Pool',
  'Spacious 5-bedroom villa with private pool, garden, and 24/7 security. Perfect for families.',
  'Ikoyi, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Sale'),
  (SELECT id FROM property_types WHERE name = 'Villa'),
  (SELECT id FROM categories WHERE name = 'Residential'),
  150000000,
  'NGN',
  NULL,
  5,
  4,
  3500,
  3,
  '["Pool", "Garden", "Security", "Generator", "Water Treatment"]',
  false,
  true,
  true,
  78,
  '+234-802-345-6789',
  'sales@luxuryvillas.ng',
  'c189d980-8a80-411a-b01d-36a4b9c7963c',
  NOW(),
  NOW()
),
(
  'Commercial Office Space',
  'Prime office space in a modern business district. Fully equipped with high-speed internet and meeting rooms.',
  'Lekki Phase 1, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Lease'),
  (SELECT id FROM property_types WHERE name = 'Office Space'),
  (SELECT id FROM categories WHERE name = 'Commercial'),
  5000000,
  'NGN',
  'monthly',
  NULL,
  3,
  2000,
  10,
  '["High-speed Internet", "Meeting Rooms", "Reception", "Parking", "Security"]',
  false,
  false,
  true,
  23,
  '+234-803-456-7890',
  'leasing@officecomplex.ng',
  '2e51a29b-d1c8-41a3-96a6-00c9501cce62',
  NOW(),
  NOW()
),
(
  'Residential Land Plot',
  '1-acre residential land in a developing area with C of O. Ready for immediate development.',
  'Abuja, FCT',
  (SELECT id FROM listing_types WHERE name = 'For Sale'),
  (SELECT id FROM property_types WHERE name = 'Residential Land'),
  (SELECT id FROM categories WHERE name = 'Land'),
  25000000,
  'NGN',
  NULL,
  NULL,
  NULL,
  43560,
  NULL,
  '["C of O", "Gated Community", "Electricity", "Water"]',
  false,
  false,
  true,
  12,
  '+234-804-567-8901',
  'land@realestate.ng',
  'c07eff48-6879-4d61-88a5-00f88afe6305',
  NOW(),
  NOW()
),
(
  'Cozy Studio Apartment',
  'Perfect starter home or investment property. Well-maintained studio in a secure complex.',
  'Yaba, Lagos',
  (SELECT id FROM listing_types WHERE name = 'For Rent'),
  (SELECT id FROM property_types WHERE name = 'Studio'),
  (SELECT id FROM categories WHERE name = 'Residential'),
  800000,
  'NGN',
  'monthly',
  1,
  1,
  400,
  0,
  '["WiFi", "Security", "Generator"]',
  true,
  false,
  true,
  34,
  '+234-805-678-9012',
  'rentals@studios.ng',
  'c07eff48-6879-4d61-88a5-00f88afe6305',
  NOW(),
  NOW()
);

-- Insert sample images for the listings
INSERT INTO marketplace_images (
  marketplace_listing_id,
  image_url,
  is_primary,
  display_order,
  created_at
) VALUES
-- Images for first listing (Apartment)
(
  (SELECT id FROM marketplace_listings WHERE title = 'Modern 3-Bedroom Apartment'),
  'https://picsum.photos/800/600',
  true,
  1,
  NOW()
),
(
  (SELECT id FROM marketplace_listings WHERE title = 'Modern 3-Bedroom Apartment'),
  'https://picsum.photos/800/600',
  false,
  2,
  NOW()
),

-- Images for second listing (Villa)
(
  (SELECT id FROM marketplace_listings WHERE title = 'Luxury Villa with Pool'),
  'https://picsum.photos/800/600',
  true,
  1,
  NOW()
),
(
  (SELECT id FROM marketplace_listings WHERE title = 'Luxury Villa with Pool'),
  'https://picsum.photos/800/600',
  false,
  2,
  NOW()
),

-- Images for third listing (Office)
(
  (SELECT id FROM marketplace_listings WHERE title = 'Commercial Office Space'),
  'https://picsum.photos/800/600',
  true,
  1,
  NOW()
),

-- Images for fourth listing (Land)
(
  (SELECT id FROM marketplace_listings WHERE title = 'Residential Land Plot'),
  'https://picsum.photos/800/600',
  true,
  1,
  NOW()
),

-- Images for fifth listing (Studio)
(
  (SELECT id FROM marketplace_listings WHERE title = 'Cozy Studio Apartment'),
  'https://picsum.photos/800/600',
  true,
  1,
  NOW()
);

COMMIT;