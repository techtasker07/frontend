'use client';

import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { paystackConfig } from '@/lib/paystack';

interface PaystackPaymentProps {
  amount: number; // Amount in kobo (e.g., 50000 for ₦500.00)
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
  className?: string;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export function PaystackPayment({
  amount,
  email,
  onSuccess,
  onClose,
  metadata = {},
  className = '',
  children
}: PaystackPaymentProps) {
  const paystackRef = useRef<any>(null);

  useEffect(() => {
    // Load Paystack script if not already loaded
    if (!window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handlePayment = () => {
    if (!window.PaystackPop) {
      console.error('Paystack script not loaded');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackConfig.publicKey,
      email,
      amount,
      currency: 'NGN',
      metadata,
      callback: (response: any) => {
        // Payment successful
        onSuccess(response.reference);
      },
      onClose: () => {
        // Payment modal closed
        onClose();
      },
    });

    handler.openIframe();
  };

  return (
    <Button
      onClick={handlePayment}
      className={className}
      type="button"
    >
      {children || 'Pay Now'}
    </Button>
  );
}