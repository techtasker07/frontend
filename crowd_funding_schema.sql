-- Crowd Funding Schema for Mipripity
-- Tables for property crowd funding functionality

-- Create crowd_funding_properties table
CREATE TABLE IF NOT EXISTS public.crowd_funding_properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    features TEXT[], -- Array of property features
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'funded', 'cancelled')),
    target_amount NUMERIC(12,2) NOT NULL,
    current_amount NUMERIC(12,2) DEFAULT 0,
    min_contribution NUMERIC(10,2) DEFAULT 1000,
    max_contribution NUMERIC(10,2),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create crowd_funding_media table for images and videos
CREATE TABLE IF NOT EXISTS public.crowd_funding_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.crowd_funding_properties(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create crowd_funding_invitations table
CREATE TABLE IF NOT EXISTS public.crowd_funding_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.crowd_funding_properties(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT,
    invitee_phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(property_id, invitee_id),
    UNIQUE(property_id, invitee_email),
    UNIQUE(property_id, invitee_phone)
);

-- Create crowd_funding_contributions table
CREATE TABLE IF NOT EXISTS public.crowd_funding_contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.crowd_funding_properties(id) ON DELETE CASCADE NOT NULL,
    contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invitation_id UUID REFERENCES public.crowd_funding_invitations(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    contribution_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        ROUND((amount / (SELECT target_amount FROM public.crowd_funding_properties WHERE id = property_id)) * 100, 2)
    ) STORED,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference TEXT,
    contributed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.crowd_funding_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_funding_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_funding_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_funding_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crowd_funding_properties
CREATE POLICY "Anyone can view active crowd funding properties" ON public.crowd_funding_properties
    FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create crowd funding properties" ON public.crowd_funding_properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Property creators can update their properties" ON public.crowd_funding_properties
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Property creators can delete their properties" ON public.crowd_funding_properties
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for crowd_funding_media
CREATE POLICY "Anyone can view media for active properties" ON public.crowd_funding_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.crowd_funding_properties
            WHERE id = property_id AND (status = 'active' OR user_id = auth.uid())
        )
    );

CREATE POLICY "Property creators can manage media" ON public.crowd_funding_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.crowd_funding_properties
            WHERE id = property_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for crowd_funding_invitations
CREATE POLICY "Users can view invitations they sent or received" ON public.crowd_funding_invitations
    FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Property creators can create invitations" ON public.crowd_funding_invitations
    FOR INSERT WITH CHECK (
        auth.uid() = inviter_id AND
        EXISTS (
            SELECT 1 FROM public.crowd_funding_properties
            WHERE id = property_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update invitations they received" ON public.crowd_funding_invitations
    FOR UPDATE USING (auth.uid() = invitee_id);

-- RLS Policies for crowd_funding_contributions
CREATE POLICY "Users can view contributions to properties they can access" ON public.crowd_funding_contributions
    FOR SELECT USING (
        auth.uid() = contributor_id OR
        EXISTS (
            SELECT 1 FROM public.crowd_funding_properties
            WHERE id = property_id AND (status = 'active' OR user_id = auth.uid())
        )
    );

CREATE POLICY "Authenticated users can create contributions" ON public.crowd_funding_contributions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND auth.uid() = contributor_id AND
        EXISTS (
            SELECT 1 FROM public.crowd_funding_invitations
            WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Contributors can update their contributions" ON public.crowd_funding_contributions
    FOR UPDATE USING (auth.uid() = contributor_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS crowd_funding_properties_user_id_idx ON public.crowd_funding_properties(user_id);
CREATE INDEX IF NOT EXISTS crowd_funding_properties_status_idx ON public.crowd_funding_properties(status);
CREATE INDEX IF NOT EXISTS crowd_funding_properties_category_id_idx ON public.crowd_funding_properties(category_id);
CREATE INDEX IF NOT EXISTS crowd_funding_media_property_id_idx ON public.crowd_funding_media(property_id);
CREATE INDEX IF NOT EXISTS crowd_funding_invitations_property_id_idx ON public.crowd_funding_invitations(property_id);
CREATE INDEX IF NOT EXISTS crowd_funding_invitations_inviter_id_idx ON public.crowd_funding_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS crowd_funding_invitations_invitee_id_idx ON public.crowd_funding_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS crowd_funding_contributions_property_id_idx ON public.crowd_funding_contributions(property_id);
CREATE INDEX IF NOT EXISTS crowd_funding_contributions_contributor_id_idx ON public.crowd_funding_contributions(contributor_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_crowd_funding_properties_updated_at BEFORE UPDATE ON public.crowd_funding_properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crowd_funding_invitations_updated_at BEFORE UPDATE ON public.crowd_funding_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crowd_funding_contributions_updated_at BEFORE UPDATE ON public.crowd_funding_contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update current_amount when contributions are made
CREATE OR REPLACE FUNCTION update_crowd_funding_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
        UPDATE public.crowd_funding_properties
        SET current_amount = current_amount + NEW.amount,
            status = CASE
                WHEN current_amount + NEW.amount >= target_amount THEN 'funded'
                ELSE status
            END
        WHERE id = NEW.property_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.payment_status != 'completed' AND NEW.payment_status = 'completed' THEN
        UPDATE public.crowd_funding_properties
        SET current_amount = current_amount + NEW.amount,
            status = CASE
                WHEN current_amount + NEW.amount >= target_amount THEN 'funded'
                ELSE status
            END
        WHERE id = NEW.property_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.payment_status = 'completed' AND NEW.payment_status != 'completed' THEN
        UPDATE public.crowd_funding_properties
        SET current_amount = current_amount - OLD.amount,
            status = CASE
                WHEN current_amount - OLD.amount < target_amount AND status = 'funded' THEN 'active'
                ELSE status
            END
        WHERE id = NEW.property_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update current_amount
CREATE TRIGGER trigger_update_crowd_funding_current_amount
    AFTER INSERT OR UPDATE OR DELETE ON public.crowd_funding_contributions
    FOR EACH ROW EXECUTE FUNCTION update_crowd_funding_current_amount();

-- Create storage bucket for crowd funding media
INSERT INTO storage.buckets (id, name, public)
VALUES ('crowd-funding-media', 'crowd-funding-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for crowd funding media
CREATE POLICY "Anyone can view crowd funding media" ON storage.objects
    FOR SELECT USING (bucket_id = 'crowd-funding-media');

CREATE POLICY "Authenticated users can upload crowd funding media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'crowd-funding-media' AND auth.role() = 'authenticated');

CREATE POLICY "Property creators can update their media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'crowd-funding-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Property creators can delete their media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'crowd-funding-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );