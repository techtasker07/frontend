-- Schema updates for contacts/referrals functionality

-- Add referrer_id to profiles table to track who referred each user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS profiles_referrer_id_idx ON public.profiles(referrer_id);

-- Update RLS policies to allow viewing referrer information
-- Users can view their own referrer and their referrals
CREATE POLICY "Users can view their referrer and referrals" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR
    referrer_id = auth.uid() OR
    id IN (
      SELECT referrer_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Optional: Create a referrals table for more detailed tracking
-- This could store invite timestamps, status, etc.
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'registered')),
  referee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals
CREATE POLICY "Users can view their own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert their own referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Index for referrals
CREATE INDEX IF NOT EXISTS referrals_referrer_id_idx ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS referrals_referee_id_idx ON public.referrals(referee_id);

-- Trigger for updating referrals updated_at
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();