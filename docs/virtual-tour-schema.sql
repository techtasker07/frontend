-- Virtual Tour Database Schema for Marketplace Integration
-- This schema creates a clean virtual tour system integrated with marketplace listings

-- First, clean up any existing virtual tour tables (if they exist)
DROP TABLE IF EXISTS virtual_tour_navigation CASCADE;
DROP TABLE IF EXISTS virtual_tour_scenes CASCADE;
DROP TABLE IF EXISTS virtual_tours CASCADE;

-- Add virtual tour flag to marketplace_listings if not exists
ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS has_virtual_tour BOOLEAN DEFAULT false;

-- Create virtual_tours table linked to marketplace listings
CREATE TABLE virtual_tours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    marketplace_listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{
        "auto_rotate": false,
        "auto_rotate_speed": 2,
        "zoom_enabled": true,
        "navigation_enabled": true,
        "controls_visible": true,
        "transition_duration": 1000
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(marketplace_listing_id) -- One virtual tour per listing
);

-- Create virtual_tour_scenes table for individual 360° images
CREATE TABLE virtual_tour_scenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    virtual_tour_id UUID NOT NULL REFERENCES virtual_tours(id) ON DELETE CASCADE,
    scene_order INTEGER NOT NULL, -- Order of scenes in the tour
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL, -- Reference to marketplace_images
    position JSONB, -- Optional 3D position data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(virtual_tour_id, scene_order)
);

-- Create virtual_tour_navigation table for scene connections
CREATE TABLE virtual_tour_navigation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_scene_id UUID NOT NULL REFERENCES virtual_tour_scenes(id) ON DELETE CASCADE,
    to_scene_id UUID NOT NULL REFERENCES virtual_tour_scenes(id) ON DELETE CASCADE,
    hotspot_position JSONB NOT NULL, -- Position on the sphere (yaw, pitch in radians)
    hotspot_title TEXT NOT NULL,
    hotspot_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (from_scene_id != to_scene_id), -- Prevent self-references
    UNIQUE(from_scene_id, to_scene_id) -- One connection between any two scenes
);

-- Create indexes for performance
CREATE INDEX idx_virtual_tours_marketplace_listing_id ON virtual_tours(marketplace_listing_id);
CREATE INDEX idx_virtual_tour_scenes_virtual_tour_id ON virtual_tour_scenes(virtual_tour_id);
CREATE INDEX idx_virtual_tour_scenes_scene_order ON virtual_tour_scenes(virtual_tour_id, scene_order);
CREATE INDEX idx_virtual_tour_navigation_from_scene ON virtual_tour_navigation(from_scene_id);
CREATE INDEX idx_virtual_tour_navigation_to_scene ON virtual_tour_navigation(to_scene_id);

-- Enable Row Level Security
ALTER TABLE virtual_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_tour_navigation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for virtual_tours
CREATE POLICY "Anyone can view active virtual tours for active listings" ON virtual_tours
    FOR SELECT USING (
        is_active = true AND
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.marketplace_listing_id
            AND ml.is_active = true
        )
    );

CREATE POLICY "Users can create virtual tours for their listings" ON virtual_tours
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.marketplace_listing_id
            AND ml.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update virtual tours for their listings" ON virtual_tours
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.marketplace_listing_id
            AND ml.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete virtual tours for their listings" ON virtual_tours
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM marketplace_listings ml
            WHERE ml.id = virtual_tours.marketplace_listing_id
            AND ml.user_id = auth.uid()
        )
    );

-- RLS Policies for virtual_tour_scenes
CREATE POLICY "Anyone can view scenes for accessible tours" ON virtual_tour_scenes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_tours vt
            WHERE vt.id = virtual_tour_scenes.virtual_tour_id
            AND vt.is_active = true
        )
    );

CREATE POLICY "Users can manage scenes for their virtual tours" ON virtual_tour_scenes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM virtual_tours vt
            JOIN marketplace_listings ml ON ml.id = vt.marketplace_listing_id
            WHERE vt.id = virtual_tour_scenes.virtual_tour_id
            AND ml.user_id = auth.uid()
        )
    );

-- RLS Policies for virtual_tour_navigation
CREATE POLICY "Anyone can view navigation for accessible tours" ON virtual_tour_navigation
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM virtual_tour_scenes vts
            JOIN virtual_tours vt ON vt.id = vts.virtual_tour_id
            WHERE vts.id = virtual_tour_navigation.from_scene_id
            AND vt.is_active = true
        )
    );

CREATE POLICY "Users can manage navigation for their virtual tours" ON virtual_tour_navigation
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM virtual_tour_scenes vts
            JOIN virtual_tours vt ON vt.id = vts.virtual_tour_id
            JOIN marketplace_listings ml ON ml.id = vt.marketplace_listing_id
            WHERE vts.id = virtual_tour_navigation.from_scene_id
            AND ml.user_id = auth.uid()
        )
    );

-- Function to update virtual tour timestamp
CREATE OR REPLACE FUNCTION update_virtual_tour_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE virtual_tours
    SET updated_at = NOW()
    WHERE id = (
        SELECT virtual_tour_id FROM virtual_tour_scenes
        WHERE id = COALESCE(NEW.from_scene_id, NEW.to_scene_id, OLD.from_scene_id, OLD.to_scene_id)
        LIMIT 1
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update marketplace listing virtual tour flag
CREATE OR REPLACE FUNCTION update_marketplace_listing_virtual_tour_flag()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the has_virtual_tour flag on marketplace_listing
    UPDATE marketplace_listings
    SET has_virtual_tour = EXISTS(
        SELECT 1 FROM virtual_tours vt
        WHERE vt.marketplace_listing_id = marketplace_listings.id
        AND vt.is_active = true
    )
    WHERE id = COALESCE(NEW.marketplace_listing_id, OLD.marketplace_listing_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_virtual_tours_updated_at
    AFTER INSERT OR UPDATE OR DELETE ON virtual_tour_scenes
    FOR EACH ROW EXECUTE FUNCTION update_virtual_tour_updated_at();

CREATE TRIGGER update_virtual_tours_updated_at_navigation
    AFTER INSERT OR UPDATE OR DELETE ON virtual_tour_navigation
    FOR EACH ROW EXECUTE FUNCTION update_virtual_tour_updated_at();

CREATE TRIGGER update_marketplace_listing_virtual_tour_flag_trigger
    AFTER INSERT OR UPDATE OR DELETE ON virtual_tours
    FOR EACH ROW EXECUTE FUNCTION update_marketplace_listing_virtual_tour_flag();

-- Function to validate navigation connections
CREATE OR REPLACE FUNCTION validate_navigation_connection()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure both scenes belong to the same virtual tour
    IF NOT EXISTS (
        SELECT 1 FROM virtual_tour_scenes vts1
        JOIN virtual_tour_scenes vts2 ON vts1.virtual_tour_id = vts2.virtual_tour_id
        WHERE vts1.id = NEW.from_scene_id
        AND vts2.id = NEW.to_scene_id
    ) THEN
        RAISE EXCEPTION 'Navigation connection must be between scenes in the same virtual tour';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate navigation connections
CREATE TRIGGER validate_navigation_connection_trigger
    BEFORE INSERT OR UPDATE ON virtual_tour_navigation
    FOR EACH ROW EXECUTE FUNCTION validate_navigation_connection();