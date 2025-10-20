-- Create hero_images table for homepage hero section
CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Anyone can view hero images" ON public.hero_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert hero images" ON public.hero_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update hero images" ON public.hero_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete hero images" ON public.hero_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS hero_images_is_active_idx ON public.hero_images(is_active);
CREATE INDEX IF NOT EXISTS hero_images_display_order_idx ON public.hero_images(display_order);

-- Create trigger for updating timestamps
CREATE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON public.hero_images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample hero images (you can replace these with actual image URLs)
INSERT INTO public.hero_images (image_url, alt_text, display_order) VALUES
  ('/images/home.gif', 'Modern home with garden', 1),
  ('/images/consultation.gif', 'Real estate consultation', 2),
  ('/images/investment.gif', 'Investment opportunities', 3),
  ('/images/market_place.gif', 'Property marketplace', 4)
ON CONFLICT DO NOTHING;