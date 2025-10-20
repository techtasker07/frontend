import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partyId = params.id;

    const { data, error } = await supabase
      .from('rees_party_contributions')
      .select(`
        *,
        contributor:profiles(id, first_name, last_name, email),
        invitation:rees_party_invitations(id, status)
      `)
      .eq('party_id', partyId)
      .order('contributed_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
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
    const { contributor_id, invitation_id, amount, payment_status, payment_reference } = body;

    if (!contributor_id || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('rees_party_contributions')
      .insert({
        party_id: partyId,
        contributor_id,
        invitation_id,
        amount: parseFloat(amount),
        payment_status: payment_status || 'pending',
        payment_reference
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    );
  }
}