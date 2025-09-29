-- Virtual Tour Database Schema for Supabase
-- This schema extends the existing property system with virtual tour capabilities

-- Virtual Tour Main Table
CREATE TABLE virtual_tours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    marketplace_listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    default_scene_id UUID,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual Tour Scenes Table
CREATE TABLE virtual_tour_scenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    virtual_tour_id UUID NOT NULL REFERENCES virtual_tours(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    image_metadata JSONB DEFAULT '{}', -- Store image dimensions, format, etc.
    position_x REAL DEFAULT 0,
    position_y REAL DEFAULT 0,
    position_z REAL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual Tour Hotspots Table
CREATE TABLE virtual_tour_hotspots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scene_id UUID NOT NULL REFERENCES virtual_tour_scenes(id) ON DELETE CASCADE,
    target_scene_id UUID REFERENCES virtual_tour_scenes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    hotspot_type VARCHAR(50) DEFAULT 'navigation', -- navigation, info, media
    position_yaw REAL NOT NULL, -- Horizontal angle in radians
    position_pitch REAL NOT NULL, -- Vertical angle in radians
    style_config JSONB DEFAULT '{}', -- Custom styling options
    interaction_data JSONB DEFAULT '{}', -- Additional interaction data
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add virtual tour URL to existing properties table
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT,
ADD COLUMN IF NOT EXISTS has_virtual_tour BOOLEAN DEFAULT false;

-- Indexes for performance
CREATE INDEX idx_virtual_tours_listing_id ON virtual_tours(marketplace_listing_id);
CREATE INDEX idx_virtual_tour_scenes_tour_id ON virtual_tour_scenes(virtual_tour_id);
CREATE INDEX idx_virtual_tour_scenes_default ON virtual_tour_scenes(is_default);
CREATE INDEX idx_virtual_tour_hotspots_scene_id ON virtual_tour_hotspots(scene_id);
CREATE INDEX idx_virtual_tour_hotspots_target_scene_id ON virtual_tour_hotspots(target_scene_id);
CREATE INDEX idx_marketplace_listings_has_virtual_tour ON marketplace_listings(has_virtual_tour);

-- Row Level Security (RLS) Policies
ALTER TABLE virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_hotspots ENABLE ROW LEVEL SECURITY;

-- Virtual Tours Policies
CREATE POLICY "Anyone can view active virtual tours" ON virtual_tours
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create tours for their marketplace listings" ON virtual_tours
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketplace_listings 
            WHERE id = marketplace_listing_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own virtual tours" ON virtual_tours
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM marketplace_listings 
            WHERE id = marketplace_listing_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own virtual tours" ON virtual_tours
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM marketplace_listings 
            WHERE id = marketplace_listing_id AND user_id = auth.uid()
        )
    );

-- Virtual Tour Scenes Policies
CREATE POLICY "Anyone can view scenes from active tours" ON virtual_tour_scenes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_tours vt 
            WHERE vt.id = virtual_tour_id AND vt.is_active = true
        )
    );

CREATE POLICY "Users can manage scenes for their tours" ON virtual_tour_scenes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM virtual_tours vt
            JOIN marketplace_listings ml ON ml.id = vt.marketplace_listing_id
            WHERE vt.id = virtual_tour_id AND ml.user_id = auth.uid()
        )
    );

-- Virtual Tour Hotspots Policies
CREATE POLICY "Anyone can view hotspots from active tours" ON virtual_tour_hotspots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_tour_scenes vts
            JOIN virtual_tours vt ON vt.id = vts.virtual_tour_id
            WHERE vts.id = scene_id AND vt.is_active = true
        )
    );

CREATE POLICY "Users can manage hotspots for their tours" ON virtual_tour_hotspots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM virtual_tour_scenes vts
            JOIN virtual_tours vt ON vt.id = vts.virtual_tour_id
            JOIN marketplace_listings ml ON ml.id = vt.marketplace_listing_id
            WHERE vts.id = scene_id AND ml.user_id = auth.uid()
        )
    );

-- Functions and Triggers

-- Function to update virtual tour timestamp
CREATE OR REPLACE FUNCTION update_virtual_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_virtual_tours_updated_at
    BEFORE UPDATE ON virtual_tours
    FOR EACH ROW
    EXECUTE FUNCTION update_virtual_tour_updated_at();

CREATE TRIGGER trigger_update_virtual_tour_scenes_updated_at
    BEFORE UPDATE ON virtual_tour_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_virtual_tour_updated_at();

CREATE TRIGGER trigger_update_virtual_tour_hotspots_updated_at
    BEFORE UPDATE ON virtual_tour_hotspots
    FOR EACH ROW
    EXECUTE FUNCTION update_virtual_tour_updated_at();

-- Function to set default scene
CREATE OR REPLACE FUNCTION set_default_scene()
RETURNS TRIGGER AS $$
BEGIN
    -- If this scene is being set as default
    IF NEW.is_default = true THEN
        -- Unset other default scenes in the same tour
        UPDATE virtual_tour_scenes 
        SET is_default = false 
        WHERE virtual_tour_id = NEW.virtual_tour_id AND id != NEW.id;
        
        -- Update the virtual tour's default_scene_id
        UPDATE virtual_tours 
        SET default_scene_id = NEW.id 
        WHERE id = NEW.virtual_tour_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_default_scene
    AFTER INSERT OR UPDATE ON virtual_tour_scenes
    FOR EACH ROW
    EXECUTE FUNCTION set_default_scene();

-- Function to update property virtual tour status
CREATE OR REPLACE FUNCTION update_marketplace_virtual_tour_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE marketplace_listings 
        SET has_virtual_tour = true 
        WHERE id = NEW.marketplace_listing_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Check if there are any other active virtual tours for this listing
        IF NOT EXISTS (
            SELECT 1 FROM virtual_tours 
            WHERE marketplace_listing_id = OLD.marketplace_listing_id AND is_active = true AND id != OLD.id
        ) THEN
            UPDATE marketplace_listings 
            SET has_virtual_tour = false 
            WHERE id = OLD.marketplace_listing_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update based on is_active status
        UPDATE marketplace_listings 
        SET has_virtual_tour = EXISTS (
            SELECT 1 FROM virtual_tours 
            WHERE marketplace_listing_id = NEW.marketplace_listing_id AND is_active = true
        )
        WHERE id = NEW.marketplace_listing_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_marketplace_virtual_tour_status
    AFTER INSERT OR UPDATE OR DELETE ON virtual_tours
    FOR EACH ROW
    EXECUTE FUNCTION update_marketplace_virtual_tour_status();

-- Views for easier querying

-- Complete virtual tour data view
CREATE VIEW virtual_tours_complete AS
SELECT 
    vt.id,
    vt.property_id,
    vt.title,
    vt.description,
    vt.default_scene_id,
    vt.settings,
    vt.is_active,
    vt.created_at,
    vt.updated_at,
    ml.title as property_title,
    ml.location as property_location,
    COUNT(vts.id) as scene_count,
    COUNT(vth.id) as total_hotspots
FROM virtual_tours vt
JOIN marketplace_listings ml ON ml.id = vt.marketplace_listing_id
LEFT JOIN virtual_tour_scenes vts ON vts.virtual_tour_id = vt.id
LEFT JOIN virtual_tour_hotspots vth ON vth.scene_id = vts.id AND vth.is_active = true
WHERE vt.is_active = true
GROUP BY vt.id, ml.id;

-- Scene with hotspots view
CREATE VIEW virtual_tour_scenes_with_hotspots AS
SELECT 
    vts.id,
    vts.virtual_tour_id,
    vts.name,
    vts.description,
    vts.image_url,
    vts.image_metadata,
    vts.position_x,
    vts.position_y,
    vts.position_z,
    vts.sort_order,
    vts.is_default,
    vts.created_at,
    vts.updated_at,
    json_agg(
        json_build_object(
            'id', vth.id,
            'target_scene_id', vth.target_scene_id,
            'title', vth.title,
            'description', vth.description,
            'hotspot_type', vth.hotspot_type,
            'position_yaw', vth.position_yaw,
            'position_pitch', vth.position_pitch,
            'style_config', vth.style_config,
            'interaction_data', vth.interaction_data
        ) ORDER BY vth.created_at
    ) FILTER (WHERE vth.id IS NOT NULL AND vth.is_active = true) as hotspots
FROM virtual_tour_scenes vts
LEFT JOIN virtual_tour_hotspots vth ON vth.scene_id = vts.id AND vth.is_active = true
GROUP BY vts.id;

-- Sample data for testing (uncomment to insert test data)
/*
-- Insert sample virtual tour
INSERT INTO virtual_tours (property_id, title, description, settings) 
VALUES (
    (SELECT id FROM marketplace_listings LIMIT 1),
    'Beautiful House Virtual Tour',
    'Immersive 360-degree tour of this stunning property',
    '{"auto_rotate": false, "zoom_enabled": true, "navigation_enabled": true}'
);

-- Insert sample scenes
INSERT INTO virtual_tour_scenes (virtual_tour_id, name, description, image_url, is_default, sort_order)
VALUES 
    ((SELECT id FROM virtual_tours LIMIT 1), 'Living Room', 'Spacious living area', 'https://example.com/living-room-360.jpg', true, 1),
    ((SELECT id FROM virtual_tours LIMIT 1), 'Kitchen', 'Modern kitchen with island', 'https://example.com/kitchen-360.jpg', false, 2),
    ((SELECT id FROM virtual_tours LIMIT 1), 'Master Bedroom', 'Comfortable master suite', 'https://example.com/bedroom-360.jpg', false, 3);

-- Insert sample hotspots
INSERT INTO virtual_tour_hotspots (scene_id, target_scene_id, title, description, position_yaw, position_pitch)
VALUES 
    (
        (SELECT id FROM virtual_tour_scenes WHERE name = 'Living Room' LIMIT 1),
        (SELECT id FROM virtual_tour_scenes WHERE name = 'Kitchen' LIMIT 1),
        'Go to Kitchen',
        'View the modern kitchen',
        1.57, 0
    ),
    (
        (SELECT id FROM virtual_tour_scenes WHERE name = 'Kitchen' LIMIT 1),
        (SELECT id FROM virtual_tour_scenes WHERE name = 'Living Room' LIMIT 1),
        'Back to Living Room',
        'Return to the living area',
        -1.57, 0
    );
*/

-- Grant permissions (adjust as needed for your user roles)
-- GRANT ALL ON virtual_tours TO authenticated;
-- GRANT ALL ON virtual_tour_scenes TO authenticated;
-- GRANT ALL ON virtual_tour_hotspots TO authenticated;
