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

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [description, setDescription] = useState(searchParams.get('description') || '');
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
        router.push(`/payment/success?reference=${reference}`);
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
  };

  const amountInKobo = parseFloat(amount) * 100; // Convert to kobo

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>
              Enter your payment details below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment description"
              />
            </div>

            {amount && email && (
              <div className="pt-4">
                <PaystackPayment
                  amount={amountInKobo}
                  email={email}
                  onSuccess={handlePaymentSuccess}
                  onClose={handlePaymentClose}
                  metadata={{
                    description,
                    custom_fields: [
                      {
                        display_name: 'Description',
                        variable_name: 'description',
                        value: description,
                      },
                    ],
                  }}
                  className="w-full"
                />
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}