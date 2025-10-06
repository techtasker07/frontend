-- Expand property_prospects table to store detailed prospect data
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS feasibility_score INTEGER;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS estimated_revenue JSONB;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS estimated_cost_breakdown JSONB;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS timeline JSONB;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS requirements TEXT[];
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS benefits TEXT[];
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS risks TEXT[];
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS next_steps TEXT[];
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS market_demand TEXT;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS complexity TEXT;
ALTER TABLE public.property_prospects ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update RLS policies if needed
-- The existing policies should work as they allow authenticated users to insert