import { NextRequest, NextResponse } from 'next/server';
import { paystackConfig } from '@/lib/paystack';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha512', paystackConfig.secretKey)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;
      case 'charge.failure':
        await handleChargeFailure(event.data);
        break;
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      case 'transfer.failure':
        await handleTransferFailure(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.event);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleChargeSuccess(data: any) {
  // Handle successful payment
  console.log('Payment successful:', data.reference);

  try {
    // Check if this is a Re-es Party contribution payment
    const metadata = data.metadata || {};
    if (metadata.contribution_type === 'rees_party') {
      await handleReesPartyContribution(data);
    } else {
      // Handle other payment types
      await handleGeneralPayment(data);
    }

    console.log('Charge success handled for reference:', data.reference);
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

async function handleReesPartyContribution(data: any) {
  const { supabase } = await import('@/lib/supabase');

  try {
    const { party_id, contributor_id, party_title } = data.metadata || {};
    const amount = data.amount / 100; // Convert from kobo to naira

    // Find user's invitation
    const { data: invitation } = await supabase
      .from('rees_party_invitations')
      .select('id')
      .eq('party_id', party_id)
      .eq('invitee_id', contributor_id)
      .eq('status', 'accepted')
      .single();

    if (!invitation) {
      console.error('No invitation found for contributor:', contributor_id);
      return;
    }

    // Create or update contribution record
    const { error: contributionError } = await supabase
      .from('rees_party_contributions')
      .upsert({
        party_id,
        contributor_id,
        invitation_id: invitation.id,
        amount,
        payment_status: 'completed',
        payment_reference: data.reference,
        contributed_at: new Date().toISOString()
      }, {
        onConflict: 'party_id,contributor_id'
      });

    if (contributionError) {
      console.error('Error creating contribution:', contributionError);
      return;
    }

    // Send receipt email
    await sendPaymentReceipt(data.customer.email, {
      reference: data.reference,
      amount,
      party_title,
      date: new Date().toISOString()
    });

    console.log('Re-es Party contribution processed successfully');
  } catch (error) {
    console.error('Error processing Re-es Party contribution:', error);
  }
}

async function handleGeneralPayment(data: any) {
  // Handle other payment types
  console.log('General payment processed:', data.reference);
}

async function sendPaymentReceipt(email: string, receiptData: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        receiptData
      })
    });

    if (response.ok) {
      console.log('Receipt sent successfully to:', email);
    } else {
      console.error('Failed to send receipt:', await response.text());
    }
  } catch (error) {
    console.error('Error sending receipt:', error);
  }
}

async function handleChargeFailure(data: any) {
  // Handle failed payment
  console.log('Payment failed:', data.reference);

  // Update your database here
  // For example:
  // - Mark payment as failed
  // - Send failure notification
  // - Log failure reason

  try {
    // Example: Update payment status in database
    // await updatePaymentStatus(data.reference, 'failed');

    console.log('Charge failure handled for reference:', data.reference);
  } catch (error) {
    console.error('Error handling charge failure:', error);
  }
}

async function handleTransferSuccess(data: any) {
  // Handle successful transfer
  console.log('Transfer successful:', data.reference);

  // Update your database here
  // For example:
  // - Mark transfer as completed
  // - Update account balance

  try {
    console.log('Transfer success handled for reference:', data.reference);
  } catch (error) {
    console.error('Error handling transfer success:', error);
  }
}

async function handleTransferFailure(data: any) {
  // Handle failed transfer
  console.log('Transfer failed:', data.reference);

  // Update your database here
  // For example:
  // - Mark transfer as failed
  // - Send failure notification

  try {
    console.log('Transfer failure handled for reference:', data.reference);
  } catch (error) {
    console.error('Error handling transfer failure:', error);
  }
}