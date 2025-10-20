import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;

    const { data, error } = await supabase
      .from('rees_party_invitations')
      .select(`
        *,
        contact:profiles(id, first_name, last_name, email, phone_number)
      `)
      .eq('party_id', partyId)
      .order('invited_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;
    const body = await request.json();
    const { invitee_id, invitee_email, invitee_phone, inviter_id } = body;

    if (!inviter_id || (!invitee_id && !invitee_email && !invitee_phone)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rees_party_invitations')
      .insert({
        party_id: partyId,
        inviter_id,
        invitee_id,
        invitee_email,
        invitee_phone,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  }
}