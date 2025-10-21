import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, receiptData } = await request.json();

    if (!email || !receiptData) {
      return NextResponse.json({ error: 'Email and receipt data are required' }, { status: 400 });
    }

    // Here you would integrate with your email service
    // For example: SendGrid, Mailgun, Resend, etc.

    // Example implementation with a generic email service:
    const emailContent = generateReceiptEmail(receiptData);

    // Send email (replace with your email service)
    const emailResponse = await sendEmail({
      to: email,
      subject: `Payment Receipt - ${receiptData.party_title}`,
      html: emailContent,
    });

    if (emailResponse.success) {
      return NextResponse.json({ success: true, message: 'Receipt sent successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to send receipt' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending receipt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateReceiptEmail(receiptData: any) {
  const { reference, amount, party_title, date } = receiptData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .receipt-details { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Thank you for your contribution!</p>
        </div>

        <div class="receipt-details">
          <h2>Re-es Party Contribution</h2>
          <p><strong>Party:</strong> ${party_title}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Amount:</strong> <span class="amount">₦${amount.toLocaleString()}</span></p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>

        <div class="footer">
          <p>This is an automated receipt. Please keep this email for your records.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail(emailData: { to: string; subject: string; html: string }) {
  // Replace this with your actual email service implementation
  // Example with SendGrid:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: emailData.to,
    from: 'noreply@yourapp.com',
    subject: emailData.subject,
    html: emailData.html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
  */

  // For now, just log the email (replace with actual implementation)
  console.log('Sending email:', emailData);
  return { success: true };
}