import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;

    const { data, error } = await supabase
      .from('rees_party_forum_messages')
      .select(`
        *,
        sender:profiles(id, first_name, last_name)
      `)
      .eq('party_id', partyId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching forum messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forum messages' },
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

    const { data, error } = await supabase
      .from('rees_party_forum_messages')
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
    console.error('Error creating forum message:', error);
    return NextResponse.json(
      { error: 'Failed to create forum message' },
      { status: 500 }
    );
  }
}