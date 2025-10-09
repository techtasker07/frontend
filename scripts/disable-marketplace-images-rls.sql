-- Temporarily disable RLS for marketplace_images table for testing
ALTER TABLE public.marketplace_images DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS after testing
-- ALTER TABLE public.marketplace_images ENABLE ROW LEVEL SECURITY;