import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch referrals (users who registered through this user's invite)
    const { data: referrals, error: referralsError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, phone_number, created_at')
      .eq('referrer_id', user.id);

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Fetch pending invites (from referrals table)
    const { data: pendingInvites, error: invitesError } = await supabase
      .from('referrals')
      .select('id, phone_number, invited_at, status')
      .eq('referrer_id', user.id)
      .eq('status', 'invited');

    if (invitesError) {
      console.error('Error fetching pending invites:', invitesError);
      return NextResponse.json({ error: 'Failed to fetch pending invites' }, { status: 500 });
    }

    return NextResponse.json({
      referrals: referrals || [],
      pendingInvites: pendingInvites || []
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if this phone number is already invited or registered
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id, status')
      .eq('referrer_id', user.id)
      .eq('phone_number', phoneNumber)
      .single();

    if (existingReferral) {
      if (existingReferral.status === 'registered') {
        return NextResponse.json({ error: 'This contact has already registered' }, { status: 400 });
      } else {
        return NextResponse.json({ error: 'This contact has already been invited' }, { status: 400 });
      }
    }

    // Insert new referral
    const { data: newReferral, error: insertError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: user.id,
        phone_number: phoneNumber,
        status: 'invited'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating referral:', insertError);
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
    }

    // Generate WhatsApp invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${user.id}`;
    const whatsappMessage = `Hi! Join me on Mipripity - a platform for property investment and voting. Sign up here: ${inviteLink}`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({
      success: true,
      referral: newReferral,
      whatsappUrl
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}