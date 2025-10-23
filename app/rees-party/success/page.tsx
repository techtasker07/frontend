'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Receipt, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDetails {
  reference: string;
  amount: number;
  status: string;
  email: string;
  created_at: string;
}

function ReesPartySuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (reference) {
      fetchPaymentDetails(reference);
    }
  }, [reference]);

  const fetchPaymentDetails = async (ref: string) => {
    try {
      const response = await fetch(`/api/paystack/verify?reference=${ref}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data);
      } else {
        throw new Error('Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishParty = async () => {
    if (!reference) {
      toast.error('Payment reference not found');
      return;
    }

    setPublishing(true);
    try {
      // Get stored form data from localStorage
      const storedData = localStorage.getItem('rees_party_form_data');
      if (!storedData) {
        toast.error('Party form data not found. Please start over.');
        router.push('/rees-party');
        return;
      }

      const formData = JSON.parse(storedData);

      // Create the party
      const response = await fetch('/api/rees-party', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          payment_reference: reference,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Clear stored data
        localStorage.removeItem('rees_party_form_data');

        toast.success('Re-es Party created successfully!');
        router.push('/rees-party');
      } else {
        toast.error(result.error || 'Failed to create party');
      }
    } catch (error) {
      console.error('Error creating party:', error);
      toast.error('Failed to create party');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment has been processed successfully. Ready to launch your party?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentDetails && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Reference:</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {paymentDetails.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm text-muted-foreground">
                    ₦{(paymentDetails.amount / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">
                    {paymentDetails.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Date:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(paymentDetails.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm text-green-600 font-medium">
                    {paymentDetails.status}
                  </span>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-2">
              <Button
                onClick={handlePublishParty}
                disabled={publishing}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                {publishing ? 'Publishing Party...' : 'Publish Party'}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/rees-party')}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Party Page
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Create a printable receipt
                  const printWindow = window.open('', '_blank');
                  if (printWindow && paymentDetails) {
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Payment Receipt - Re-es Party</title>
                          <style>
                            body {
                              font-family: Arial, sans-serif;
                              max-width: 600px;
                              margin: 0 auto;
                              padding: 20px;
                              line-height: 1.6;
                            }
                            .header {
                              text-align: center;
                              border-bottom: 2px solid #000;
                              padding-bottom: 20px;
                              margin-bottom: 30px;
                            }
                            .logo {
                              font-size: 24px;
                              font-weight: bold;
                              color: #2563eb;
                              margin-bottom: 10px;
                            }
                            .receipt-title {
                              font-size: 18px;
                              font-weight: bold;
                              margin-bottom: 20px;
                            }
                            .details {
                              margin-bottom: 30px;
                            }
                            .detail-row {
                              display: flex;
                              justify-content: space-between;
                              padding: 8px 0;
                              border-bottom: 1px solid #eee;
                            }
                            .detail-label {
                              font-weight: bold;
                            }
                            .footer {
                              text-align: center;
                              margin-top: 40px;
                              font-size: 12px;
                              color: #666;
                            }
                            @media print {
                              body { margin: 0; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="logo">Mipripity</div>
                            <div class="receipt-title">PAYMENT RECEIPT</div>
                            <div>Re-es Party Contribution</div>
                          </div>

                          <div class="details">
                            <div class="detail-row">
                              <span class="detail-label">Reference:</span>
                              <span>${paymentDetails.reference}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Amount:</span>
                              <span>₦${(paymentDetails.amount / 100).toLocaleString()}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Email:</span>
                              <span>${paymentDetails.email}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Date:</span>
                              <span>${new Date(paymentDetails.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Status:</span>
                              <span>${paymentDetails.status.toUpperCase()}</span>
                            </div>
                          </div>

                          <div class="footer">
                            <p>Thank you for your contribution!</p>
                            <p>This receipt was generated on ${new Date().toLocaleDateString()}</p>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="w-full"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReesPartySuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReesPartySuccessPageContent />
    </Suspense>
  );
}