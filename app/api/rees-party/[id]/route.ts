import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;

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
          responded_at,
          contact:profiles!rees_party_invitations_invitee_id_fkey(id, first_name, last_name, email, phone_number)
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
      .eq('id', partyId)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching rees party:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rees party' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;
    const body = await request.json();

    const { data, error } = await supabase
      .from('rees_party_properties')
      .update(body)
      .eq('id', partyId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating rees party:', error);
    return NextResponse.json(
      { error: 'Failed to update rees party' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;

    const { error } = await supabase
      .from('rees_party_properties')
      .delete()
      .eq('id', partyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rees party:', error);
    return NextResponse.json(
      { error: 'Failed to delete rees party' },
      { status: 500 }
    );
  }
}