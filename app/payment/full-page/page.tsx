'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaystackPayment } from '@/components/paystack/paystack-payment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get parameters from URL
  const amount = searchParams.get('amount') || '';
  const email = searchParams.get('email') || '';
  const description = searchParams.get('description') || '';
  const type = searchParams.get('type') || 'general'; // property, crowd-funding, rees-party, dashboard
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const metadata = JSON.parse(searchParams.get('metadata') || '{}');

  const [customAmount, setCustomAmount] = useState(amount);
  const [customEmail, setCustomEmail] = useState(email);
  const [customDescription, setCustomDescription] = useState(description);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async (reference: string) => {
    setIsProcessing(true);
    try {
      // Verify payment with backend
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      if (response.ok) {
        toast.success('Payment Successful', {
          description: 'Your payment has been processed successfully.',
        });

        // Redirect based on type
        const successUrl = getSuccessUrl(type, reference);
        router.push(successUrl);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment Verification Failed', {
        description: 'Please contact support if you were charged.',
      });
      router.push('/payment/failure');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    toast('Payment Cancelled', {
      description: 'Payment was cancelled by user.',
    });
    router.push(returnUrl);
  };

  const getSuccessUrl = (paymentType: string, reference: string) => {
    switch (paymentType) {
      case 'property':
        return `/properties/success?reference=${reference}`;
      case 'crowd-funding':
        return `/crowd-funding/success?reference=${reference}`;
      case 'rees-party':
        return `/rees-party/success?reference=${reference}`;
      case 'dashboard':
        return `/dashboard?payment=success&reference=${reference}`;
      default:
        return `/payment/success?reference=${reference}`;
    }
  };

  const getPageTitle = () => {
    switch (type) {
      case 'property':
        return 'Property Payment';
      case 'crowd-funding':
        return 'Crowd Funding Payment';
      case 'rees-party':
        return 'Re-es Party Payment';
      case 'dashboard':
        return 'Dashboard Payment';
      default:
        return 'Payment';
    }
  };

  const getPageDescription = () => {
    switch (type) {
      case 'property':
        return 'Complete your property listing payment';
      case 'crowd-funding':
        return 'Make your contribution to this crowd funding campaign';
      case 'rees-party':
        return 'Make your contribution to launch this party';
      case 'dashboard':
        return 'Complete your payment';
      default:
        return 'Enter your payment details below';
    }
  };

  const amountInKobo = parseFloat(customAmount) * 100; // Convert to kobo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push(returnUrl)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-600">{getPageDescription()}</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                {getPageDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Section */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (NGN) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  disabled={isProcessing}
                />
                {type === 'general' && (
                  <p className="text-xs text-gray-500">Enter the amount you want to pay</p>
                )}
              </div>

              {/* Email Section */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isProcessing}
                />
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Payment description"
                  disabled={isProcessing}
                />
              </div>

              {/* Payment Summary */}
              {customAmount && customEmail && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">₦{parseFloat(customAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{customEmail}</span>
                    </div>
                    {customDescription && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="text-right max-w-48 truncate">{customDescription}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Button */}
              {customAmount && customEmail && (
                <div className="pt-4">
                  <PaystackPayment
                    amount={amountInKobo}
                    email={customEmail}
                    onSuccess={handlePaymentSuccess}
                    onClose={handlePaymentClose}
                    metadata={{
                      description: customDescription,
                      payment_type: type,
                      return_url: returnUrl,
                      ...metadata,
                      custom_fields: [
                        {
                          display_name: 'Payment Type',
                          variable_name: 'payment_type',
                          value: type,
                        },
                        {
                          display_name: 'Description',
                          variable_name: 'description',
                          value: customDescription,
                        },
                      ],
                    }}
                    className="w-full"
                  />
                </div>
              )}

              {/* Cancel Button */}
              <Button
                variant="outline"
                onClick={() => router.push(returnUrl)}
                className="w-full"
                disabled={isProcessing}
              >
                Cancel Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function FullPagePayment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}