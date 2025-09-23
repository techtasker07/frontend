-- Database Migration for AI Prospect Analysis Features
-- Run this script in your Supabase SQL editor to add new tables

-- ============================================================================
-- NEW TABLES FOR AI PROSPECT ANALYSIS
-- ============================================================================

-- 1. Prospect Analyses - Main table for saving AI analysis results
CREATE TABLE IF NOT EXISTS public.prospect_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Property image and data
  property_image_url TEXT,
  property_data JSONB NOT NULL, -- Store all property form data
  
  -- AI analysis results
  valuation JSONB NOT NULL, -- Property valuation results
  prospects JSONB NOT NULL, -- Array of 5 generated prospects
  identified_category JSONB, -- AI-identified property category
  
  -- Metadata
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'analyzing', 'completed', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Consultation Bookings - For the "Book Consultation" feature
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prospect_analysis_id UUID REFERENCES public.prospect_analyses(id) ON DELETE CASCADE,
  
  -- Booking details
  consultation_type TEXT NOT NULL CHECK (consultation_type IN ('basic', 'detailed', 'premium')),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_time TEXT NOT NULL,
  
  -- Payment information
  amount INTEGER NOT NULL, -- Amount in kobo (Naira * 100)
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_reference TEXT,
  
  -- Meeting details
  meeting_link TEXT,
  meeting_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- 3. Prospect Comparisons - For comparing multiple prospects
CREATE TABLE IF NOT EXISTS public.prospect_comparisons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Comparison details
  name TEXT NOT NULL,
  prospect_analysis_ids UUID[] NOT NULL, -- Array of analysis IDs to compare
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
);

-- 4. Shared Analyses - For sharing prospect analysis results
CREATE TABLE IF NOT EXISTS public.shared_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_id UUID REFERENCES public.prospect_analyses(id) ON DELETE CASCADE NOT NULL,
  
  -- Sharing details
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. AI Processing Logs - For tracking AI API usage and performance
CREATE TABLE IF NOT EXISTS public.ai_processing_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  analysis_id UUID REFERENCES public.prospect_analyses(id) ON DELETE CASCADE,
  
  -- Processing details
  service_type TEXT NOT NULL CHECK (service_type IN ('vision', 'valuation', 'prospects', 'complete')),
  api_provider TEXT,
  processing_time_ms INTEGER,
  accuracy_score DECIMAL(5,4), -- 0.0000 to 1.0000
  
  -- API response data (for debugging)
  request_data JSONB,
  response_data JSONB,
  error_data JSONB,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.prospect_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_processing_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Prospect Analyses Policies
CREATE POLICY "Users can view their own analyses" ON public.prospect_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON public.prospect_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" ON public.prospect_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" ON public.prospect_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Consultation Bookings Policies  
CREATE POLICY "Users can view their own bookings" ON public.consultation_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookings" ON public.consultation_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.consultation_bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Prospect Comparisons Policies
CREATE POLICY "Users can view their own comparisons" ON public.prospect_comparisons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comparisons" ON public.prospect_comparisons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparisons" ON public.prospect_comparisons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons" ON public.prospect_comparisons
  FOR DELETE USING (auth.uid() = user_id);

-- Shared Analyses Policies (public read, owner can manage)
CREATE POLICY "Anyone can view shared analyses" ON public.shared_analyses
  FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Analysis owners can create shares" ON public.shared_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prospect_analyses 
      WHERE id = analysis_id AND user_id = auth.uid()
    )
  );

-- AI Processing Logs Policies (users can view their own logs)
CREATE POLICY "Users can view logs for their analyses" ON public.ai_processing_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.prospect_analyses 
      WHERE id = analysis_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert processing logs" ON public.ai_processing_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================================================

-- Prospect Analyses indexes
CREATE INDEX IF NOT EXISTS prospect_analyses_user_id_idx ON public.prospect_analyses(user_id);
CREATE INDEX IF NOT EXISTS prospect_analyses_created_at_idx ON public.prospect_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS prospect_analyses_is_favorite_idx ON public.prospect_analyses(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS prospect_analyses_status_idx ON public.prospect_analyses(user_id, status);

-- Consultation Bookings indexes
CREATE INDEX IF NOT EXISTS consultation_bookings_user_id_idx ON public.consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS consultation_bookings_scheduled_date_idx ON public.consultation_bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS consultation_bookings_status_idx ON public.consultation_bookings(user_id, status);

-- Shared Analyses indexes
CREATE INDEX IF NOT EXISTS shared_analyses_share_token_idx ON public.shared_analyses(share_token);
CREATE INDEX IF NOT EXISTS shared_analyses_expires_at_idx ON public.shared_analyses(expires_at) WHERE expires_at > NOW();

-- AI Processing Logs indexes
CREATE INDEX IF NOT EXISTS ai_processing_logs_analysis_id_idx ON public.ai_processing_logs(analysis_id);
CREATE INDEX IF NOT EXISTS ai_processing_logs_created_at_idx ON public.ai_processing_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================================================

-- Add updated_at triggers for new tables
CREATE TRIGGER update_prospect_analyses_updated_at 
  BEFORE UPDATE ON public.prospect_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_bookings_updated_at 
  BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospect_comparisons_updated_at 
  BEFORE UPDATE ON public.prospect_comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS FOR AI PROSPECT IMAGES
-- ============================================================================

-- Create bucket for AI prospect sample images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ai-prospect-images', 'ai-prospect-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create bucket for user property analysis images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prospect-analysis-images', 'prospect-analysis-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for AI prospect images
CREATE POLICY "Anyone can view AI prospect images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ai-prospect-images');

CREATE POLICY "Authenticated users can upload prospect analysis images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prospect-analysis-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view prospect analysis images" ON storage.objects
  FOR SELECT USING (bucket_id = 'prospect-analysis-images');

CREATE POLICY "Users can update their own prospect analysis images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'prospect-analysis-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own prospect analysis images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prospect-analysis-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- SAMPLE DATA AND UTILITY FUNCTIONS
-- ============================================================================

-- Function to cleanup expired shares (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.shared_analyses 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user analytics
CREATE OR REPLACE FUNCTION get_user_prospect_analytics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_analyses', COUNT(*),
    'favorites_count', COUNT(*) FILTER (WHERE is_favorite = true),
    'this_month_count', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())),
    'avg_prospects_per_analysis', COALESCE(AVG(jsonb_array_length(prospects)), 0),
    'total_consultations', (
      SELECT COUNT(*) FROM public.consultation_bookings 
      WHERE user_id = user_uuid
    )
  ) INTO result
  FROM public.prospect_analyses
  WHERE user_id = user_uuid AND status != 'archived';
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- MIGRATION VERIFICATION
-- ============================================================================

-- Verify all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'prospect_analyses', 
        'consultation_bookings', 
        'prospect_comparisons', 
        'shared_analyses', 
        'ai_processing_logs'
    );
    
    IF table_count = 5 THEN
        RAISE NOTICE 'SUCCESS: All 5 AI prospect tables created successfully!';
    ELSE
        RAISE EXCEPTION 'ERROR: Only % out of 5 tables were created', table_count;
    END IF;
END $$;

-- Display final status
SELECT 
    'AI Prospect Database Migration' AS migration_name,
    'COMPLETED' AS status,
    NOW() AS completed_at,
    'Ready for AI prospect analysis features' AS notes;
