'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { toast } from 'sonner';

function PaymentFailurePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const reference = searchParams.get('reference');

  const handleRetry = () => {
    if (reference) {
      // Redirect back to payment page with the same reference
      router.push(`/payment?reference=${reference}`);
    } else {
      router.push('/payment');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Payment Failed</CardTitle>
            <CardDescription>
              Your payment could not be processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {reference && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Reference:</strong> {reference}
                </p>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>If you were charged, please contact our support team with your payment reference.</p>
            </div>

            <div className="pt-4 space-y-2">
              <Button
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Dashboard
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Need Help?</p>
                <p>Contact our support team:</p>
                <p className="mt-1">
                  Email: support@mipripity.com<br />
                  Phone: +234 806 095 9610
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailurePageContent />
    </Suspense>
  );
}