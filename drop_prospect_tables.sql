-- Drop Prospect-Related Tables and Storage
-- Run this script to remove all prospect and camera capture related database objects

-- ============================================================================
-- DROP STORAGE POLICIES AND BUCKETS
-- ============================================================================

-- Drop storage policies for prospect images
DROP POLICY IF EXISTS "Anyone can view AI prospect images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload prospect analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view prospect analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own prospect analysis images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own prospect analysis images" ON storage.objects;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id IN ('ai-prospect-images', 'prospect-analysis-images');

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================

-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS public.ai_processing_logs;
DROP TABLE IF EXISTS public.shared_analyses;
DROP TABLE IF EXISTS public.consultation_bookings;
DROP TABLE IF EXISTS public.prospect_comparisons;
DROP TABLE IF EXISTS public.prospect_analyses;

-- Drop prospect properties tables
DROP TABLE IF EXISTS public.property_prospects;
DROP TABLE IF EXISTS public.prospect_properties;

-- ============================================================================
-- DROP INDEXES
-- ============================================================================

-- Drop prospect-related indexes from main schema
DROP INDEX IF EXISTS prospect_properties_category_id_idx;
DROP INDEX IF EXISTS property_prospects_prospect_property_id_idx;

-- Drop prospect-related indexes from migration
DROP INDEX IF EXISTS prospect_analyses_user_id_idx;
DROP INDEX IF EXISTS prospect_analyses_created_at_idx;
DROP INDEX IF EXISTS prospect_analyses_is_favorite_idx;
DROP INDEX IF EXISTS prospect_analyses_status_idx;
DROP INDEX IF EXISTS consultation_bookings_user_id_idx;
DROP INDEX IF EXISTS consultation_bookings_scheduled_date_idx;
DROP INDEX IF EXISTS consultation_bookings_status_idx;
DROP INDEX IF EXISTS shared_analyses_share_token_idx;
DROP INDEX IF EXISTS shared_analyses_expires_at_idx;
DROP INDEX IF EXISTS ai_processing_logs_analysis_id_idx;
DROP INDEX IF EXISTS ai_processing_logs_created_at_idx;

-- ============================================================================
-- DROP TRIGGERS
-- ============================================================================

-- Drop triggers from main schema
DROP TRIGGER IF EXISTS update_prospect_properties_updated_at ON public.prospect_properties;
DROP TRIGGER IF EXISTS update_property_prospects_updated_at ON public.property_prospects;

-- Drop triggers from migration
DROP TRIGGER IF EXISTS update_prospect_analyses_updated_at ON public.prospect_analyses;
DROP TRIGGER IF EXISTS update_consultation_bookings_updated_at ON public.consultation_bookings;
DROP TRIGGER IF EXISTS update_prospect_comparisons_updated_at ON public.prospect_comparisons;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

-- Drop utility functions from migration
DROP FUNCTION IF EXISTS cleanup_expired_shares();
DROP FUNCTION IF EXISTS get_user_prospect_analytics(UUID);

-- ============================================================================
-- DROP POLICIES
-- ============================================================================

-- Drop policies from main schema
DROP POLICY IF EXISTS "Anyone can view prospect properties" ON public.prospect_properties;
DROP POLICY IF EXISTS "Authenticated users can insert prospect properties" ON public.prospect_properties;
DROP POLICY IF EXISTS "Anyone can view property prospects" ON public.property_prospects;
DROP POLICY IF EXISTS "Authenticated users can insert property prospects" ON public.property_prospects;

-- Drop policies from migration
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.prospect_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.prospect_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON public.prospect_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.prospect_analyses;
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Users can view their own comparisons" ON public.prospect_comparisons;
DROP POLICY IF EXISTS "Users can insert their own comparisons" ON public.prospect_comparisons;
DROP POLICY IF EXISTS "Users can update their own comparisons" ON public.prospect_comparisons;
DROP POLICY IF EXISTS "Users can delete their own comparisons" ON public.prospect_comparisons;
DROP POLICY IF EXISTS "Anyone can view shared analyses" ON public.shared_analyses;
DROP POLICY IF EXISTS "Analysis owners can create shares" ON public.shared_analyses;
DROP POLICY IF EXISTS "Users can view logs for their analyses" ON public.ai_processing_logs;
DROP POLICY IF EXISTS "System can insert processing logs" ON public.ai_processing_logs;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables were dropped
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'prospect_properties',
        'property_prospects',
        'prospect_analyses',
        'consultation_bookings',
        'prospect_comparisons',
        'shared_analyses',
        'ai_processing_logs'
    );

    IF table_count = 0 THEN
        RAISE NOTICE 'SUCCESS: All prospect-related tables dropped successfully!';
    ELSE
        RAISE EXCEPTION 'ERROR: % tables still exist', table_count;
    END IF;
END $$;

-- Display final status
SELECT
    'Prospect Tables Drop' AS operation,
    'COMPLETED' AS status,
    NOW() AS completed_at,
    'All prospect and camera capture related database objects removed' AS notes;