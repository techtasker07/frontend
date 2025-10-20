import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First check if user is a contributor to this party
    const { data: contribution, error: contribError } = await supabase
      .from('rees_party_contributions')
      .select('id')
      .eq('party_id', partyId)
      .eq('contributor_id', userId)
      .eq('payment_status', 'completed')
      .single();

    if (contribError || !contribution) {
      return NextResponse.json({ error: 'Access denied. Only contributors can view chat messages.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('rees_party_chat_messages')
      .select(`
        *,
        sender:profiles(id, first_name, last_name)
      `)
      .eq('party_id', partyId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
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
    const { sender_id, message, message_type, media_url } = body;

    if (!sender_id || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is a contributor to this party
    const { data: contribution, error: contribError } = await supabase
      .from('rees_party_contributions')
      .select('id')
      .eq('party_id', partyId)
      .eq('contributor_id', sender_id)
      .eq('payment_status', 'completed')
      .single();

    if (contribError || !contribution) {
      return NextResponse.json({ error: 'Access denied. Only contributors can send chat messages.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('rees_party_chat_messages')
      .insert({
        party_id: partyId,
        sender_id,
        message,
        message_type: message_type || 'text',
        media_url
      })
      .select(`
        *,
        sender:profiles(id, first_name, last_name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Failed to create chat message' },
      { status: 500 }
    );
  }
}