-- Database schema for in-app prospect engine (consolidated)
-- Run this entire file in your Supabase/Postgres database.

-- Ensure UUID generation function is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing tables if they exist (old and new)
DROP TABLE IF EXISTS property_prospect_matches CASCADE;
DROP TABLE IF EXISTS prospect_templates CASCADE;
DROP TABLE IF EXISTS property_types CASCADE;
DROP TABLE IF EXISTS prospect_categories CASCADE;
-- Old tables from prior implementation (safe to drop if present)
DROP TABLE IF EXISTS property_prospects CASCADE;
DROP TABLE IF EXISTS prospect_properties CASCADE;

-- Create prospect categories table
CREATE TABLE prospect_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property types table  
CREATE TABLE property_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prospect templates table (main prospect data)
CREATE TABLE prospect_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES prospect_categories(id) ON DELETE CASCADE,
    sector VARCHAR(20) DEFAULT 'value-maximization' CHECK (sector IN ('value-maximization', 'alternative-use')),
    
    -- Property matching criteria
    property_types TEXT[] DEFAULT '{}', -- Array of property types this applies to
    required_features TEXT[] DEFAULT '{}', -- Features that must be present
    preferred_features TEXT[] DEFAULT '{}', -- Features that boost score
    min_square_meters INTEGER DEFAULT 0,
    max_square_meters INTEGER DEFAULT NULL,
    min_rooms INTEGER DEFAULT 0,
    max_rooms INTEGER DEFAULT NULL,
    suitable_conditions TEXT[] DEFAULT '{}', -- good, excellent, fair, poor
    suitable_locations TEXT[] DEFAULT '{}', -- urban, suburban, rural, etc.
    
    -- Prospect details
    feasibility_score INTEGER NOT NULL CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    
    -- Revenue estimates (in Naira)
    min_revenue BIGINT NOT NULL DEFAULT 0,
    max_revenue BIGINT NOT NULL DEFAULT 0,
    revenue_timeframe VARCHAR(50) DEFAULT 'annually', -- annually, monthly, one-time
    
    -- Cost estimates (in Naira)  
    min_cost BIGINT NOT NULL DEFAULT 0,
    max_cost BIGINT NOT NULL DEFAULT 0,
    cost_breakdown TEXT[] DEFAULT '{}',
    
    -- Timeline
    planning_time VARCHAR(100) DEFAULT '',
    execution_time VARCHAR(100) DEFAULT '',
    total_time VARCHAR(100) DEFAULT '',
    
    -- Additional data
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    risks TEXT[] DEFAULT '{}',
    next_steps TEXT[] DEFAULT '{}',
    market_demand VARCHAR(20) DEFAULT 'medium' CHECK (market_demand IN ('low', 'medium', 'high')),
    complexity VARCHAR(20) DEFAULT 'moderate' CHECK (complexity IN ('simple', 'moderate', 'complex')),
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 50, -- Higher number = higher priority in results
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property prospect matches table (for user-specific generations)
CREATE TABLE property_prospect_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- User who generated this
    prospect_template_id UUID REFERENCES prospect_templates(id) ON DELETE CASCADE,
    
    -- Property details used for matching
    property_address TEXT,
    property_type VARCHAR(255),
    square_meters INTEGER,
    num_rooms INTEGER,
    num_bathrooms INTEGER,
    current_use TEXT,
    ownership_status TEXT,
    budget_range TEXT,
    timeline_requirement TEXT,
    
    -- Vision analysis data used
    vision_features TEXT[] DEFAULT '{}',
    vision_confidence DECIMAL(3,2),
    vision_condition VARCHAR(50),
    vision_architectural_style VARCHAR(100),
    
    -- Computed match score
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasoning TEXT, -- Why this prospect was selected
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_prospect_templates_category ON prospect_templates(category_id);
CREATE INDEX idx_prospect_templates_feasibility ON prospect_templates(feasibility_score DESC);
CREATE INDEX idx_prospect_templates_active ON prospect_templates(is_active);
CREATE INDEX idx_prospect_templates_priority ON prospect_templates(priority DESC);
CREATE INDEX idx_prospect_templates_sector ON prospect_templates(sector);
CREATE INDEX idx_property_prospect_matches_user ON property_prospect_matches(user_id);
CREATE INDEX idx_property_prospect_matches_created ON property_prospect_matches(created_at DESC);

-- Insert initial prospect categories
INSERT INTO prospect_categories (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'residential', 'Residential property opportunities'),
    ('550e8400-e29b-41d4-a716-446655440002', 'commercial', 'Commercial property opportunities'),
    ('550e8400-e29b-41d4-a716-446655440003', 'mixed-use', 'Mixed-use development opportunities'),
    ('550e8400-e29b-41d4-a716-446655440004', 'investment', 'Investment and income generation opportunities'),
    ('550e8400-e29b-41d4-a716-446655440005', 'development', 'Development and construction opportunities'),
    ('550e8400-e29b-41d4-a716-446655440006', 'renovation', 'Renovation and improvement opportunities');

-- Insert initial property types  
INSERT INTO property_types (id, name, description) VALUES 
    ('650e8400-e29b-41d4-a716-446655440001', 'house', 'Single-family residential houses'),
    ('650e8400-e29b-41d4-a716-446655440002', 'apartment', 'Apartment buildings and condominiums'),
    ('650e8400-e29b-41d4-a716-446655440003', 'office', 'Office buildings and commercial spaces'),
    ('650e8400-e29b-41d4-a716-446655440004', 'warehouse', 'Warehouses and industrial properties'),
    ('650e8400-e29b-41d4-a716-446655440005', 'retail', 'Retail stores and shopping centers'),
    ('650e8400-e29b-41d4-a716-446655440006', 'land', 'Vacant land and development lots'),
    ('650e8400-e29b-41d4-a716-446655440007', 'mixed-use', 'Mixed-use properties');

-- Sample prospect templates (optional; you can remove or extend these)
-- Alternative Use examples
INSERT INTO prospect_templates (
    title, description, category_id, sector, property_types, required_features, 
    feasibility_score, min_revenue, max_revenue, min_cost, max_cost,
    cost_breakdown, planning_time, execution_time, total_time,
    requirements, benefits, risks, next_steps, market_demand, complexity, tags, priority
) VALUES (
    'Short-term Rental (Airbnb) Conversion',
    'Transform your residential property into a profitable short-term rental business. With the growing tourism and business travel market in Nigeria, converting your house or apartment into an Airbnb can generate substantial monthly income. This opportunity works particularly well for properties in desirable locations with good access to transportation and local attractions.

    The key to success lies in creating an appealing, well-furnished space that provides guests with comfort and convenience. Focus on quality furnishings, reliable utilities, fast internet, and excellent guest service. Consider the local market demand and seasonal trends to optimize pricing and occupancy rates.',
    '550e8400-e29b-41d4-a716-446655440004', -- investment category
    'alternative-use',
    ARRAY['house', 'apartment'],
    ARRAY['windows', 'door'],
    85,
    150000, 800000, -- ₦150K - ₦800K monthly
    300000, 1500000, -- ₦300K - ₦1.5M setup cost
    ARRAY['Furniture & Decor: ₦200K-800K', 'Utilities Setup: ₦50K-200K', 'Marketing & Photos: ₦50K-150K', 'Legal & Permits: ₦50K-150K', 'Insurance: ₦30K-100K'],
    '2-4 weeks', '4-6 weeks', '1.5-2.5 months',
    ARRAY['Property renovation/furnishing', 'Business registration', 'Insurance coverage', 'Online listing creation'],
    ARRAY['High monthly income potential', 'Flexible business model', 'Tax benefits', 'Property value enhancement'],
    ARRAY['Market competition', 'Guest management challenges', 'Regulatory changes', 'Property maintenance costs'],
    ARRAY['Research local regulations', 'Analyze competitor pricing', 'Plan renovation budget', 'Choose furnishing style'],
    'high', 'moderate',
    ARRAY['airbnb', 'short-term rental', 'tourism', 'income generation'],
    90
),
(
    'Home Office & Co-working Space',
    'Convert part of your residential property into a modern home office or small co-working space. With the rise of remote work culture, there is increasing demand for professional workspace solutions outside traditional offices. This can be particularly profitable in residential areas with good internet connectivity and parking.

    Create distinct zones for different work functions - quiet areas for calls and focused work, collaborative spaces for meetings, and common areas for breaks. Invest in reliable high-speed internet, comfortable furniture, proper lighting, and professional amenities like printing facilities and coffee service.',
    '550e8400-e29b-41d4-a716-446655440002', -- commercial category  
    'alternative-use',
    ARRAY['house', 'apartment'],
    ARRAY['windows', 'door'],
    75,
    200000, 600000, -- ₦200K - ₦600K monthly
    400000, 1200000, -- ₦400K - ₦1.2M setup cost
    ARRAY['Office Furniture: ₦250K-600K', 'IT Equipment: ₦150K-400K', 'Interior Design: ₦100K-300K', 'Utilities & Internet: ₦50K-150K'],
    '3-5 weeks', '6-8 weeks', '2-3 months',
    ARRAY['Space renovation', 'High-speed internet installation', 'Business licensing', 'Insurance coverage'],
    ARRAY['Steady monthly income', 'Low operational costs', 'Community building', 'Flexible scaling options'],
    ARRAY['Initial investment required', 'Member management', 'Utility costs', 'Competition from cafes'],
    ARRAY['Survey local remote workers', 'Design space layout', 'Source quality furniture', 'Set up booking system'],
    'high', 'moderate',
    ARRAY['co-working', 'office space', 'remote work', 'professional services'],
    80
);

-- Value Maximization examples
INSERT INTO prospect_templates (
    title, description, category_id, sector, property_types, required_features, 
    feasibility_score, min_revenue, max_revenue, min_cost, max_cost,
    cost_breakdown, planning_time, execution_time, total_time,
    requirements, benefits, risks, next_steps, market_demand, complexity, tags, priority
) VALUES (
    'Property Renovation & Modernization',
    'Enhance your property''s value through strategic renovation and modernization. Focus on high-impact improvements like kitchen and bathroom upgrades, fresh paint, modern fixtures, and energy-efficient systems. This approach maximizes return on investment while making the property more attractive to buyers or renters.',
    '550e8400-e29b-41d4-a716-446655440006', -- renovation category
    'value-maximization',
    ARRAY['house', 'apartment'],
    ARRAY['walls', 'windows'],
    80,
    300000, 1200000, -- value lift
    800000, 3000000, -- renovation cost
    ARRAY['Kitchen Upgrade: ₦400K-1.2M', 'Bathroom Renovation: ₦200K-800K', 'Painting & Fixtures: ₦150K-600K', 'Professional Services: ₦50K-400K'],
    '1-2 weeks', '6-12 weeks', '2-3.5 months',
    ARRAY['Property condition assessment', 'Renovation permits', 'Contractor selection', 'Material sourcing'],
    ARRAY['Increased property value', 'Higher rental income potential', 'Faster sale/lease', 'Improved living conditions'],
    ARRAY['Cost overruns', 'Construction delays', 'Market timing risks', 'Quality control issues'],
    ARRAY['Get property valuation', 'Obtain renovation quotes', 'Secure financing', 'Plan timeline'],
    'high', 'moderate',
    ARRAY['renovation', 'modernization', 'value-add', 'improvement'],
    95
),
(
    'Strategic Property Leasing Optimization',
    'Maximize rental income through strategic leasing optimization. This includes market research, competitive pricing, property staging, professional photography, and targeted marketing.',
    '550e8400-e29b-41d4-a716-446655440004', -- investment category
    'value-maximization',
    ARRAY['house', 'apartment', 'office'],
    ARRAY['windows', 'door'],
    85,
    400000, 1500000, -- annual rental income
    200000, 800000, -- optimization cost
    ARRAY['Property Staging: ₦100K-300K', 'Professional Photos: ₦30K-80K', 'Marketing & Ads: ₦50K-200K', 'Management Setup: ₦20K-220K'],
    '1-3 weeks', '2-4 weeks', '1-2 months',
    ARRAY['Market rate analysis', 'Property preparation', 'Marketing strategy', 'Tenant screening process'],
    ARRAY['Optimized rental income', 'Reduced vacancy periods', 'Quality tenant attraction', 'Professional management'],
    ARRAY['Market rent fluctuations', 'Tenant turnover', 'Property maintenance costs', 'Economic downturns'],
    ARRAY['Conduct market research', 'Prepare property for leasing', 'Develop marketing plan', 'Screen potential tenants'],
    'high', 'simple',
    ARRAY['leasing', 'rental optimization', 'property management', 'income maximization'],
    90
);
