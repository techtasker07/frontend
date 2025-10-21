-- 1) Helper: ensure uuid and gen_random functions exist (extensions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

------------------------------
-- 2) Helper: updated_at trigger
------------------------------
-- function to set updated_at column to now() in UTC
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------
-- 3) Create tables
------------------------------

-- rees_party_properties
CREATE TABLE IF NOT EXISTS public.rees_party_properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    venue_details TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_time TEXT,
    dress_code TEXT,
    requirements TEXT[], -- Array of personal requirements
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    category_id TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
    target_amount NUMERIC(12,2) NOT NULL,
    current_amount NUMERIC(12,2) DEFAULT 0,
    contribution_per_person NUMERIC(10,2) NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL, -- Payment deadline
    forum_expiry TIMESTAMP WITH TIME ZONE, -- populated by trigger (deadline + 1 day)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- rees_party_media
CREATE TABLE IF NOT EXISTS public.rees_party_media (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    party_id UUID REFERENCES public.rees_party_properties(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    file_name TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- rees_party_invitations
CREATE TABLE IF NOT EXISTS public.rees_party_invitations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    party_id UUID REFERENCES public.rees_party_properties(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invitee_email TEXT,
    invitee_phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(party_id, invitee_id),
    UNIQUE(party_id, invitee_email),
    UNIQUE(party_id, invitee_phone)
);

-- rees_party_contributions
CREATE TABLE IF NOT EXISTS public.rees_party_contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    party_id UUID REFERENCES public.rees_party_properties(id) ON DELETE CASCADE NOT NULL,
    contributor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    invitation_id UUID REFERENCES public.rees_party_invitations(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    contribution_percentage NUMERIC(5,2), -- calculated by trigger
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference TEXT,
    contributed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- rees_party_forum_messages
CREATE TABLE IF NOT EXISTS public.rees_party_forum_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    party_id UUID REFERENCES public.rees_party_properties(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- rees_party_chat_messages (for contributor-only chats)
CREATE TABLE IF NOT EXISTS public.rees_party_chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    party_id UUID REFERENCES public.rees_party_properties(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

------------------------------
-- 4) Indexes
------------------------------
CREATE INDEX IF NOT EXISTS rees_party_properties_user_id_idx ON public.rees_party_properties(user_id);
CREATE INDEX IF NOT EXISTS rees_party_properties_status_idx ON public.rees_party_properties(status);
CREATE INDEX IF NOT EXISTS rees_party_properties_event_date_idx ON public.rees_party_properties(event_date);
CREATE INDEX IF NOT EXISTS rees_party_properties_deadline_idx ON public.rees_party_properties(deadline);
CREATE INDEX IF NOT EXISTS rees_party_media_party_id_idx ON public.rees_party_media(party_id);
CREATE INDEX IF NOT EXISTS rees_party_invitations_party_id_idx ON public.rees_party_invitations(party_id);
CREATE INDEX IF NOT EXISTS rees_party_invitations_inviter_id_idx ON public.rees_party_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS rees_party_invitations_invitee_id_idx ON public.rees_party_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS rees_party_contributions_party_id_idx ON public.rees_party_contributions(party_id);
CREATE INDEX IF NOT EXISTS rees_party_contributions_contributor_id_idx ON public.rees_party_contributions(contributor_id);
CREATE INDEX IF NOT EXISTS rees_party_forum_messages_party_id_idx ON public.rees_party_forum_messages(party_id);
CREATE INDEX IF NOT EXISTS rees_party_forum_messages_sender_id_idx ON public.rees_party_forum_messages(sender_id);
CREATE INDEX IF NOT EXISTS rees_party_chat_messages_party_id_idx ON public.rees_party_chat_messages(party_id);
CREATE INDEX IF NOT EXISTS rees_party_chat_messages_sender_id_idx ON public.rees_party_chat_messages(sender_id);

------------------------------
-- 5) Triggers & trigger functions
------------------------------

-- 5.1 set forum_expiry on insert/update of deadline
CREATE OR REPLACE FUNCTION public.set_forum_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deadline IS NOT NULL THEN
    NEW.forum_expiry := NEW.deadline + INTERVAL '1 day';
  ELSE
    NEW.forum_expiry := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rees_party_properties_set_forum_expiry
BEFORE INSERT OR UPDATE OF deadline ON public.rees_party_properties
FOR EACH ROW EXECUTE FUNCTION public.set_forum_expiry();

-- Also ensure forum_expiry is set on inserts where deadline provided
CREATE TRIGGER rees_party_properties_set_forum_expiry_on_insert
BEFORE INSERT ON public.rees_party_properties
FOR EACH ROW EXECUTE FUNCTION public.set_forum_expiry();

-- 5.2 contribution percentage calculation
CREATE OR REPLACE FUNCTION public.update_contribution_percentage()
RETURNS TRIGGER AS $$
DECLARE
  tgt NUMERIC(12,2);
BEGIN
  SELECT target_amount INTO tgt FROM public.rees_party_properties WHERE id = NEW.party_id;
  IF tgt IS NULL OR tgt = 0 THEN
    NEW.contribution_percentage := NULL;
  ELSE
    NEW.contribution_percentage := ROUND( (NEW.amount / tgt) * 100.0, 2 );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_contribution_percentage
BEFORE INSERT OR UPDATE OF amount ON public.rees_party_contributions
FOR EACH ROW EXECUTE FUNCTION public.update_contribution_percentage();

-- 5.3 update current_amount and current_participants on contributions changes
CREATE OR REPLACE FUNCTION public.update_rees_party_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
        UPDATE public.rees_party_properties
        SET current_amount = COALESCE(current_amount,0) + NEW.amount,
            current_participants = COALESCE(current_participants,0) + 1,
            status = CASE
                WHEN COALESCE(current_amount,0) + NEW.amount >= target_amount THEN 'completed'
                WHEN status = 'planning' THEN 'active'
                ELSE status
            END
        WHERE id = NEW.party_id;
    ELSIF TG_OP = 'UPDATE' AND (OLD.payment_status IS DISTINCT FROM 'completed') AND (NEW.payment_status = 'completed') THEN
        UPDATE public.rees_party_properties
        SET current_amount = COALESCE(current_amount,0) + NEW.amount,
            current_participants = COALESCE(current_participants,0) + 1,
            status = CASE
                WHEN COALESCE(current_amount,0) + NEW.amount >= target_amount THEN 'completed'
                WHEN status = 'planning' THEN 'active'
                ELSE status
            END
        WHERE id = NEW.party_id;
    ELSIF TG_OP = 'UPDATE' AND (OLD.payment_status = 'completed') AND (NEW.payment_status IS DISTINCT FROM 'completed') THEN
        UPDATE public.rees_party_properties
        SET current_amount = COALESCE(current_amount,0) - OLD.amount,
            current_participants = GREATEST(COALESCE(current_participants,0) - 1, 0),
            status = CASE
                WHEN COALESCE(current_amount,0) - OLD.amount < target_amount AND status = 'completed' THEN 'active'
                ELSE status
            END
        WHERE id = NEW.party_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- If a completed contribution is deleted, subtract
        IF OLD.payment_status = 'completed' THEN
          UPDATE public.rees_party_properties
          SET current_amount = COALESCE(current_amount,0) - OLD.amount,
              current_participants = GREATEST(COALESCE(current_participants,0) - 1, 0),
              status = CASE
                WHEN COALESCE(current_amount,0) - OLD.amount < target_amount AND status = 'completed' THEN 'active'
                ELSE status
              END
          WHERE id = OLD.party_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rees_party_current_amount
AFTER INSERT OR UPDATE OR DELETE ON public.rees_party_contributions
FOR EACH ROW EXECUTE FUNCTION public.update_rees_party_current_amount();

-- 5.4 attach update_updated_at trigger to relevant tables
CREATE TRIGGER update_rees_party_properties_updated_at BEFORE UPDATE ON public.rees_party_properties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rees_party_invitations_updated_at BEFORE UPDATE ON public.rees_party_invitations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rees_party_contributions_updated_at BEFORE UPDATE ON public.rees_party_contributions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rees_party_forum_messages_updated_at BEFORE UPDATE ON public.rees_party_forum_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rees_party_chat_messages_updated_at BEFORE UPDATE ON public.rees_party_chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

------------------------------
-- 6) Storage bucket (supabase storage schema)
------------------------------
-- only run if storage.buckets exists in your project (Supabase default)
INSERT INTO storage.buckets (id, name, public)
VALUES ('rees-party-media', 'rees-party-media', true)
ON CONFLICT (id) DO NOTHING;

------------------------------
-- 7) RLS Policies
------------------------------

-- Enable RLS
ALTER TABLE public.rees_party_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rees_party_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rees_party_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rees_party_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rees_party_forum_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rees_party_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rees_party_properties
CREATE POLICY "Anyone can view active rees parties" ON public.rees_party_properties
    FOR SELECT USING (status IN ('active', 'completed') OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create rees parties" ON public.rees_party_properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Party creators can update their parties" ON public.rees_party_properties
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Party creators can delete their parties" ON public.rees_party_properties
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rees_party_media
CREATE POLICY "Anyone can view media for active parties" ON public.rees_party_media
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rees_party_properties
            WHERE id = party_id AND (status IN ('active', 'completed') OR user_id = auth.uid())
        )
    );

CREATE POLICY "Party creators can manage media" ON public.rees_party_media
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rees_party_properties
            WHERE id = party_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for rees_party_invitations
CREATE POLICY "Users can view invitations they sent or received" ON public.rees_party_invitations
    FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Party creators can create invitations" ON public.rees_party_invitations
    FOR INSERT WITH CHECK (
        auth.uid() = inviter_id AND
        EXISTS (
            SELECT 1 FROM public.rees_party_properties
            WHERE id = party_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update invitations they received" ON public.rees_party_invitations
    FOR UPDATE USING (auth.uid() = invitee_id);

-- RLS Policies for rees_party_contributions
CREATE POLICY "Users can view contributions to parties they can access" ON public.rees_party_contributions
    FOR SELECT USING (
        auth.uid() = contributor_id OR
        EXISTS (
            SELECT 1 FROM public.rees_party_properties
            WHERE id = party_id AND (status IN ('active', 'completed') OR user_id = auth.uid())
        )
    );

CREATE POLICY "Authenticated users can create contributions" ON public.rees_party_contributions
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND auth.uid() = contributor_id AND
        EXISTS (
            SELECT 1 FROM public.rees_party_invitations
            WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Contributors can update their contributions" ON public.rees_party_contributions
    FOR UPDATE USING (auth.uid() = contributor_id);

-- RLS Policies for rees_party_forum_messages
CREATE POLICY "Party participants can view forum messages" ON public.rees_party_forum_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rees_party_properties p
            WHERE p.id = party_id AND (
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.rees_party_invitations i WHERE i.party_id = p.id AND i.invitee_id = auth.uid() AND i.status = 'accepted')
            ) AND p.forum_expiry > NOW()
        )
    );

CREATE POLICY "Party participants can create forum messages" ON public.rees_party_forum_messages
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.rees_party_properties p
            WHERE p.id = party_id AND (
                p.user_id = auth.uid() OR
                EXISTS (SELECT 1 FROM public.rees_party_invitations i WHERE i.party_id = p.id AND i.invitee_id = auth.uid() AND i.status = 'accepted')
            ) AND p.forum_expiry > NOW()
        )
    );

CREATE POLICY "Users can update their own forum messages" ON public.rees_party_forum_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for rees_party_chat_messages (contributors only)
CREATE POLICY "Party contributors can view chat messages" ON public.rees_party_chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rees_party_contributions c
            WHERE c.party_id = party_id AND c.contributor_id = auth.uid() AND c.payment_status = 'completed'
        )
    );

CREATE POLICY "Party contributors can create chat messages" ON public.rees_party_chat_messages
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.rees_party_contributions c
            WHERE c.party_id = party_id AND c.contributor_id = auth.uid() AND c.payment_status = 'completed'
        )
    );

CREATE POLICY "Users can update their own chat messages" ON public.rees_party_chat_messages
    FOR UPDATE USING (auth.uid() = sender_id);

------------------------------
-- 8) Storage policies
------------------------------

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for rees party media
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