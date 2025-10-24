import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseApi } from '@/lib/supabase-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rees_party_properties')
      .select(`
        *,
        media:rees_party_media(*),
        invitations:rees_party_invitations(
          id,
          invitee_id,
          invitee_email,
          invitee_phone,
          status,
          invited_at,
          contact:profiles!rees_party_invitations_invitee_id_fkey(id, first_name, last_name, email)
        ),
        contributions:rees_party_contributions(
          id,
          contributor_id,
          amount,
          contribution_percentage,
          payment_status,
          contributed_at,
          contributor:profiles!rees_party_contributions_contributor_id_fkey(id, first_name, last_name, email)
        ),
        forum_messages:rees_party_forum_messages(
          id,
          sender_id,
          message,
          message_type,
          media_url,
          created_at,
          sender:profiles!rees_party_forum_messages_sender_id_fkey(id, first_name, last_name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching rees parties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rees parties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      location,
      venue_details,
      event_date,
      event_time,
      dress_code,
      requirements,
      target_amount,
      contribution_per_person,
      max_participants,
      deadline,
      category_id,
      user_id,
      payment_reference
    } = body;

    if (!user_id || !title || !description || !location || !event_date || !target_amount || !contribution_per_person || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate payment reference is provided
    if (!payment_reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rees_party_properties')
      .insert({
        title,
        description,
        location,
        venue_details,
        event_date,
        event_time,
        dress_code,
        requirements: requirements || [],
        target_amount: parseFloat(target_amount),
        contribution_per_person: parseFloat(contribution_per_person),
        max_participants: max_participants ? parseInt(max_participants) : null,
        deadline,
        category_id: category_id || null,
        user_id,
        status: 'active' // Change status to active since payment is verified
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating rees party:', error);
    return NextResponse.json(
      { error: 'Failed to create rees party' },
      { status: 500 }
    );
  }
}