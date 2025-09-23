-- Check Database Status for AI Prospect Features
-- Run this query in your Supabase SQL editor to check if you need the migration

-- Check if AI prospect tables exist
SELECT 
    'AI Prospect Tables Status Check' as check_name,
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
                'prospect_analyses', 
                'consultation_bookings', 
                'prospect_comparisons', 
                'shared_analyses', 
                'ai_processing_logs'
            )
        ) = 5 THEN 'ALL TABLES EXIST - Migration not needed'
        ELSE 'MISSING TABLES - Migration required'
    END as status,
    (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'prospect_analyses', 
            'consultation_bookings', 
            'prospect_comparisons', 
            'shared_analyses', 
            'ai_processing_logs'
        )
    ) as existing_tables,
    5 as required_tables;

-- List existing tables
SELECT 
    'Existing Tables' as section,
    table_name,
    CASE 
        WHEN table_name IN (
            'prospect_analyses', 
            'consultation_bookings', 
            'prospect_comparisons', 
            'shared_analyses', 
            'ai_processing_logs'
        ) THEN '✓ AI Prospect Table'
        ELSE '• Regular Table'
    END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY 
    CASE 
        WHEN table_name IN (
            'prospect_analyses', 
            'consultation_bookings', 
            'prospect_comparisons', 
            'shared_analyses', 
            'ai_processing_logs'
        ) THEN 1 
        ELSE 2 
    END,
    table_name;

-- Check storage buckets
SELECT 
    'Storage Buckets Check' as check_name,
    name,
    public,
    CASE 
        WHEN name IN ('ai-prospect-images', 'prospect-analysis-images') 
        THEN '✓ AI Prospect Bucket'
        ELSE '• Regular Bucket'
    END as bucket_type
FROM storage.buckets
ORDER BY 
    CASE 
        WHEN name IN ('ai-prospect-images', 'prospect-analysis-images') THEN 1 
        ELSE 2 
    END,
    name;
