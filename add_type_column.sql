"ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'poll' CHECK (type IN ('poll', 'sale', 'rent', 'lease', 'booking'));" 
