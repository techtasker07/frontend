-- Migration: Prospect Form Integration
-- This migration documents the integration of the property details form with the prospect_analyses table
-- No schema changes are needed as the existing property_data JSONB field stores all form data

-- ============================================================================
-- PROSPECT FORM INTEGRATION
-- ============================================================================

-- The prospect_analyses table already has the necessary structure:
-- - property_data JSONB: Stores all property form details including:
--   * size: Property size in square meters
--   * stories: Number of stories (for buildings)
--   * rooms: Number of rooms/outlets
--   * averageRoomSize: Average size of each room/outlet
--   * amenities: Array of selected amenities
--   * usage: Current property usage
--   * location: Property location/address

-- Example of the property_data JSONB structure:
-- {
--   "size": "120",
--   "stories": "2",
--   "rooms": "4",
--   "averageRoomSize": "25",
--   "amenities": ["Parking Space", "Garden", "Security System"],
--   "usage": "Residential",
--   "location": "123 Main Street, Lagos"
-- }

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the prospect_analyses table exists and has the correct structure
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'prospect_analyses'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE EXCEPTION 'ERROR: prospect_analyses table does not exist. Please run database_migration_ai_prospects.sql first.';
    END IF;

    -- Check if property_data column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'prospect_analyses'
        AND column_name = 'property_data'
    ) INTO column_exists;

    IF NOT column_exists THEN
        RAISE EXCEPTION 'ERROR: property_data column does not exist in prospect_analyses table.';
    END IF;

    RAISE NOTICE 'SUCCESS: prospect_analyses table is ready for property form integration.';
END $$;

-- ============================================================================
-- INDEXES FOR PROPERTY DATA QUERIES (Optional)
-- ============================================================================

-- Add GIN index for efficient JSONB queries on property_data
CREATE INDEX IF NOT EXISTS prospect_analyses_property_data_gin_idx
ON public.prospect_analyses USING GIN (property_data);

-- Add index for property usage queries
CREATE INDEX IF NOT EXISTS prospect_analyses_property_usage_idx
ON public.prospect_analyses ((property_data->>'usage'));

-- Add index for property location queries
CREATE INDEX IF NOT EXISTS prospect_analyses_property_location_idx
ON public.prospect_analyses ((property_data->>'location'));

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT
    'Prospect Form Integration Migration' AS migration_name,
    'COMPLETED' AS status,
    NOW() AS completed_at,
    'Property details form integrated with prospect_analyses table' AS notes;