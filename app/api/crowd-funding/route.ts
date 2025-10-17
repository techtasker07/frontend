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

    // Get user's crowd funding properties
    const { data: properties, error: propertiesError } = await supabase
      .from('crowd_funding_properties')
      .select(`
        *,
        category:categories(name),
        media:crowd_funding_media(*),
        invitations:crowd_funding_invitations(
          id,
          invitee_id,
          invitee_email,
          invitee_phone,
          status,
          invited_at,
          contact:profiles!crowd_funding_invitations_invitee_id_fkey(id, first_name, last_name, email)
        ),
        contributions:crowd_funding_contributions(
          id,
          contributor_id,
          amount,
          contribution_percentage,
          payment_status,
          contributed_at,
          contributor:profiles!crowd_funding_contributions_contributor_id_fkey(id, first_name, last_name, email)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    // Get properties where user is invited to contribute
    const { data: invitedProperties, error: invitedError } = await supabase
      .from('crowd_funding_invitations')
      .select(`
        property:crowd_funding_properties(
          *,
          category:categories(name),
          media:crowd_funding_media(*),
          contributions:crowd_funding_contributions(
            id,
            contributor_id,
            amount,
            contribution_percentage,
            payment_status,
            contributed_at,
            contributor:profiles(id, first_name, last_name, email)
          )
        )
      `)
      .eq('invitee_id', user.id)
      .eq('status', 'accepted');

    if (invitedError) {
      console.error('Error fetching invited properties:', invitedError);
      return NextResponse.json({ error: 'Failed to fetch invited properties' }, { status: 500 });
    }

    return NextResponse.json({
      properties: properties || [],
      invitedProperties: invitedProperties?.map(item => item.property).filter(Boolean) || []
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
    const { action, propertyId, invitationId, amount } = body;

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    switch (action) {
      case 'accept_invitation': {
        const { error } = await supabase
          .from('crowd_funding_invitations')
          .update({
            status: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('id', invitationId)
          .eq('invitee_id', user.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'decline_invitation': {
        const { error } = await supabase
          .from('crowd_funding_invitations')
          .update({
            status: 'declined',
            responded_at: new Date().toISOString()
          })
          .eq('id', invitationId)
          .eq('invitee_id', user.id);

        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'contribute': {
        // First check if user has accepted the invitation
        const { data: invitation, error: inviteError } = await supabase
          .from('crowd_funding_invitations')
          .select('id, status')
          .eq('property_id', propertyId)
          .eq('invitee_id', user.id)
          .eq('status', 'accepted')
          .single();

        if (inviteError || !invitation) {
          return NextResponse.json({ error: 'You must accept the invitation first' }, { status: 400 });
        }

        // Get property details for validation
        const { data: property, error: propertyError } = await supabase
          .from('crowd_funding_properties')
          .select('min_contribution, max_contribution, target_amount, current_amount')
          .eq('id', propertyId)
          .single();

        if (propertyError) throw propertyError;

        // Validate contribution amount
        if (amount < property.min_contribution) {
          return NextResponse.json({
            error: `Minimum contribution is ₦${property.min_contribution.toLocaleString()}`
          }, { status: 400 });
        }

        if (property.max_contribution && amount > property.max_contribution) {
          return NextResponse.json({
            error: `Maximum contribution is ₦${property.max_contribution.toLocaleString()}`
          }, { status: 400 });
        }

        // Check if total contribution would exceed target
        if (property.current_amount + amount > property.target_amount) {
          return NextResponse.json({
            error: `Contribution would exceed target amount. Maximum allowed: ₦${(property.target_amount - property.current_amount).toLocaleString()}`
          }, { status: 400 });
        }

        // Create contribution record
        const { data: contribution, error: contribError } = await supabase
          .from('crowd_funding_contributions')
          .insert({
            property_id: propertyId,
            contributor_id: user.id,
            invitation_id: invitation.id,
            amount: amount,
            payment_status: 'completed' // In a real app, this would be 'pending' until payment is confirmed
          })
          .select()
          .single();

        if (contribError) throw contribError;

        return NextResponse.json({
          success: true,
          contribution,
          message: 'Contribution recorded successfully'
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}