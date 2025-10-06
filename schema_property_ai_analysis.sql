-- Property AI Analysis Schema for Supabase
-- This schema supports storing property analysis results and AI-generated prospects

-- Table for storing property analysis sessions
CREATE TABLE property_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Property Information
    property_address TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('building', 'apartment', 'space', 'land')),
    square_meters DECIMAL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    current_use TEXT,
    
    -- Investment Details
    budget_range TEXT,
    timeline TEXT,
    ownership_status TEXT,
    additional_info TEXT,
    
    -- Image and Vision Analysis
    property_image_url TEXT,
    vision_analysis JSONB, -- Store Google Vision API results
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for storing individual property prospects
CREATE TABLE property_prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES property_analyses(id) ON DELETE CASCADE,
    
    -- Prospect Details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'mixed-use', 'investment', 'development')),
    feasibility_score INTEGER NOT NULL CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    
    -- Financial Information (in Naira)
    estimated_revenue_min BIGINT,
    estimated_revenue_max BIGINT,
    revenue_timeframe TEXT,
    estimated_cost_min BIGINT,
    estimated_cost_max BIGINT,
    cost_breakdown JSONB, -- Array of cost breakdown items
    
    -- Timeline Information
    planning_duration TEXT,
    execution_duration TEXT,
    total_duration TEXT,
    
    -- Lists (stored as JSONB arrays)
    requirements JSONB, -- Array of requirements
    benefits JSONB, -- Array of benefits
    risks JSONB, -- Array of risks
    next_steps JSONB, -- Array of next steps
    tags JSONB, -- Array of tags
    
    -- Market Analysis
    market_demand TEXT NOT NULL CHECK (market_demand IN ('low', 'medium', 'high')),
    complexity TEXT NOT NULL CHECK (complexity IN ('simple', 'moderate', 'complex')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for storing analysis insights
CREATE TABLE property_analysis_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES property_analyses(id) ON DELETE CASCADE,
    
    -- Insights (stored as JSONB arrays)
    property_strengths JSONB NOT NULL,
    market_opportunities JSONB NOT NULL,
    considerations JSONB NOT NULL,
    
    -- Summary Statistics
    total_prospects INTEGER NOT NULL DEFAULT 0,
    average_feasibility DECIMAL,
    potential_revenue_min BIGINT,
    potential_revenue_max BIGINT,
    top_recommendation_id UUID REFERENCES property_prospects(id),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_property_analyses_user_id ON property_analyses(user_id);
CREATE INDEX idx_property_analyses_created_at ON property_analyses(created_at DESC);
CREATE INDEX idx_property_prospects_analysis_id ON property_prospects(analysis_id);
CREATE INDEX idx_property_prospects_feasibility_score ON property_prospects(feasibility_score DESC);
CREATE INDEX idx_property_analysis_insights_analysis_id ON property_analysis_insights(analysis_id);

-- Row Level Security (RLS) policies
ALTER TABLE property_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analysis_insights ENABLE ROW LEVEL SECURITY;

-- Users can only access their own property analyses
CREATE POLICY "Users can view own property analyses" ON property_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own property analyses" ON property_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own property analyses" ON property_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own property analyses" ON property_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only access prospects for their analyses
CREATE POLICY "Users can view prospects for own analyses" ON property_prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_prospects.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prospects for own analyses" ON property_prospects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_prospects.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update prospects for own analyses" ON property_prospects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_prospects.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete prospects for own analyses" ON property_prospects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_prospects.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

-- Users can only access insights for their analyses
CREATE POLICY "Users can view insights for own analyses" ON property_analysis_insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_analysis_insights.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert insights for own analyses" ON property_analysis_insights
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_analysis_insights.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update insights for own analyses" ON property_analysis_insights
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_analysis_insights.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete insights for own analyses" ON property_analysis_insights
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM property_analyses 
            WHERE property_analyses.id = property_analysis_insights.analysis_id 
            AND property_analyses.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_property_analyses_updated_at BEFORE UPDATE ON property_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_prospects_updated_at BEFORE UPDATE ON property_prospects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_analysis_insights_updated_at BEFORE UPDATE ON property_analysis_insights 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
