-- Create amenities table for marketplace listings
-- This table will store predefined amenities that users can select from

CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'general', 'residential', 'commercial', 'land', 'security', 'utilities', etc.
  icon TEXT, -- Optional icon name or URL
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can view active amenities" ON public.amenities
  FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS amenities_category_idx ON public.amenities(category);
CREATE INDEX IF NOT EXISTS amenities_is_active_idx ON public.amenities(is_active);
CREATE INDEX IF NOT EXISTS amenities_display_order_idx ON public.amenities(display_order);

-- Create trigger for updating timestamps
CREATE TRIGGER update_amenities_updated_at BEFORE UPDATE ON public.amenities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample amenities data
INSERT INTO public.amenities (name, category, icon, description, display_order) VALUES
-- General amenities
('WiFi', 'utilities', 'wifi', 'High-speed internet connection', 1),
('Air Conditioning', 'utilities', 'wind', 'Central or split AC system', 2),
('Heating', 'utilities', 'thermometer', 'Heating system', 3),
('Generator', 'utilities', 'zap', 'Backup power generator', 4),
('Water Supply', 'utilities', 'droplets', 'Reliable water supply', 5),

-- Security amenities
('24/7 Security', 'security', 'shield', 'Round-the-clock security personnel', 6),
('CCTV Cameras', 'security', 'camera', 'Security camera surveillance', 7),
('Security Gates', 'security', 'lock', 'Gated community access', 8),
('Alarm System', 'security', 'bell', 'Security alarm system', 9),
('Intercom', 'security', 'phone', 'Building intercom system', 10),

-- Residential amenities
('Swimming Pool', 'residential', 'waves', 'Private or community swimming pool', 11),
('Gym/Fitness Center', 'residential', 'dumbbell', 'Fitness facility', 12),
('Playground', 'residential', 'gamepad-2', 'Children playground area', 13),
('Garden', 'residential', 'leaf', 'Landscaped garden area', 14),
('Balcony/Terrace', 'residential', 'home', 'Private balcony or terrace', 15),
('Parking Space', 'residential', 'car', 'Dedicated parking space', 16),
('Elevator', 'residential', 'arrow-up-down', 'Building elevator', 17),
('Laundry Room', 'residential', 'shirt', 'Laundry facilities', 18),
('Storage Room', 'residential', 'archive', 'Additional storage space', 19),
('Pet Friendly', 'residential', 'heart', 'Allows pets', 20),

-- Commercial amenities
('Conference Room', 'commercial', 'users', 'Meeting/conference facilities', 21),
('Loading Dock', 'commercial', 'truck', 'Loading and unloading area', 22),
('High Ceiling', 'commercial', 'arrow-up', 'High ceiling height', 23),
('Fire Safety', 'commercial', 'flame', 'Fire safety equipment', 24),
('Accessibility', 'commercial', 'wheelchair', 'Wheelchair accessible', 25),

-- Land amenities
('Electricity Access', 'land', 'plug', 'Electrical connection available', 26),
('Water Access', 'land', 'droplets', 'Water connection available', 27),
('Road Access', 'land', 'road', 'Road accessibility', 28),
('Fenced', 'land', 'fence', 'Boundary fencing', 29),
('Soil Quality', 'land', 'sprout', 'Good soil for cultivation', 30)
ON CONFLICT (name) DO NOTHING;

COMMIT;