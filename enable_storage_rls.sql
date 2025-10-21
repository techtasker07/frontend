-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for rees party media
DROP POLICY IF EXISTS "Anyone can view rees party media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload rees party media" ON storage.objects;
DROP POLICY IF EXISTS "Party creators can update their media" ON storage.objects;
DROP POLICY IF EXISTS "Party creators can delete their media" ON storage.objects;

CREATE POLICY "Anyone can view rees party media" ON storage.objects
    FOR SELECT USING (bucket_id = 'rees-party-media');

CREATE POLICY "Authenticated users can upload rees party media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'rees-party-media' AND auth.role() = 'authenticated');

CREATE POLICY "Party creators can update their media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'rees-party-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Party creators can delete their media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'rees-party-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );