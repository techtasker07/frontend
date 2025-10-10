-- Virtual Tour Database Schema
-- This schema adds support for immersive 360° virtual tours

-- Main virtual tours table
CREATE TABLE IF NOT EXISTS virtual_tours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    default_scene_id TEXT,
    settings JSONB DEFAULT '{
        "auto_rotate": false,
        "auto_rotate_speed": 2,
        "zoom_enabled": true,
        "navigation_enabled": true,
        "controls_visible": true,
        "transition_duration": 1000
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual tour scenes (individual 360° images/rooms)
CREATE TABLE IF NOT EXISTS virtual_tour_scenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id UUID NOT NULL REFERENCES virtual_tours(id) ON DELETE CASCADE,
    scene_id TEXT NOT NULL, -- Unique identifier within the tour
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    position JSONB, -- 3D position data (x, y, z)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tour_id, scene_id)
);

-- Virtual tour hotspots (navigation points between scenes)
CREATE TABLE IF NOT EXISTS virtual_tour_hotspots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scene_id UUID NOT NULL REFERENCES virtual_tour_scenes(id) ON DELETE CASCADE,
    target_scene_id TEXT NOT NULL, -- References scene_id within same tour
    position JSONB NOT NULL, -- Position on the sphere (yaw, pitch in radians)
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'navigation' CHECK (type IN ('navigation', 'info', 'media')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_virtual_tours_property_id ON virtual_tours(property_id);
CREATE INDEX IF NOT EXISTS idx_virtual_tour_scenes_tour_id ON virtual_tour_scenes(tour_id);
CREATE INDEX IF NOT EXISTS idx_virtual_tour_hotspots_scene_id ON virtual_tour_hotspots(scene_id);

-- Row Level Security (RLS) policies
ALTER TABLE virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_hotspots ENABLE ROW LEVEL SECURITY;

-- Policies for virtual_tours
CREATE POLICY "Users can view virtual tours for properties they can access" ON virtual_tours
    FOR SELECT USING (true); -- Public read access for marketplace

CREATE POLICY "Users can create virtual tours for their properties" ON virtual_tours
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.property_id
            AND ml.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update virtual tours for their properties" ON virtual_tours
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.property_id
            AND ml.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete virtual tours for their properties" ON virtual_tours
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.property_id
            AND ml.user_id = auth.uid()
        )
    );

-- Policies for virtual_tour_scenes
CREATE POLICY "Users can view virtual tour scenes for accessible tours" ON virtual_tour_scenes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_tours vt
            WHERE vt.id = virtual_tour_scenes.tour_id
        )
    );

CREATE POLICY "Users can manage scenes for their virtual tours" ON virtual_tour_scenes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM virtual_tours vt
            JOIN marketplace_listings ml ON ml.id = vt.property_id
            WHERE vt.id = virtual_tour_scenes.tour_id
            AND ml.user_id = auth.uid()
        )
    );

-- Policies for virtual_tour_hotspots
CREATE POLICY "Users can view hotspots for accessible scenes" ON virtual_tour_hotspots
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_tour_scenes vts
            JOIN virtual_tours vt ON vt.id = vts.tour_id
            WHERE vts.id = virtual_tour_hotspots.scene_id
        )
    );

CREATE POLICY "Users can manage hotspots for their virtual tours" ON virtual_tour_hotspots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM virtual_tour_scenes vts
            JOIN virtual_tours vt ON vt.id = vts.tour_id
            JOIN marketplace_listings ml ON ml.id = vt.property_id
            WHERE vts.id = virtual_tour_hotspots.scene_id
            AND ml.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_virtual_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE virtual_tours
    SET updated_at = NOW()
    WHERE id = NEW.tour_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update parent tour timestamp
CREATE TRIGGER update_virtual_tour_timestamp_on_scene_change
    AFTER INSERT OR UPDATE OR DELETE ON virtual_tour_scenes
    FOR EACH ROW EXECUTE FUNCTION update_virtual_tour_updated_at();

CREATE TRIGGER update_virtual_tour_timestamp_on_hotspot_change
    AFTER INSERT OR UPDATE OR DELETE ON virtual_tour_hotspots
    FOR EACH ROW EXECUTE FUNCTION update_virtual_tour_updated_at();

-- Function to validate scene connections
CREATE OR REPLACE FUNCTION validate_scene_connection()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure target_scene_id exists in the same tour
    IF NOT EXISTS (
        SELECT 1 FROM virtual_tour_scenes vts
        WHERE vts.scene_id = NEW.target_scene_id
        AND vts.tour_id = (
            SELECT tour_id FROM virtual_tour_scenes WHERE id = NEW.scene_id
        )
    ) THEN
        RAISE EXCEPTION 'Target scene % does not exist in this tour', NEW.target_scene_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate hotspot connections
CREATE TRIGGER validate_hotspot_connection
    BEFORE INSERT OR UPDATE ON virtual_tour_hotspots
    FOR EACH ROW EXECUTE FUNCTION validate_scene_connection();