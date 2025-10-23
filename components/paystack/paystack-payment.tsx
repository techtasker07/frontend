'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { paystackConfig } from '@/lib/paystack';

interface PaystackPaymentProps {
  amount: number; // Amount in kobo (smallest currency unit)
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
  className?: string;
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
  metadata,
  className
}: PaystackPaymentProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Paystack script');
      setIsLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!isLoaded || !window.PaystackPop) {
      console.error('Paystack script not loaded');
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: paystackConfig.publicKey,
        email,
        amount,
        currency: 'NGN',
        ref: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata,
        callback: (response: any) => {
          console.log('Paystack callback:', response);
          onSuccess(response.reference);
        },
        onClose: () => {
          console.log('Paystack modal closed');
          onClose();
        },
      });

      // Open the Paystack modal
      handler.openIframe();

      // Apply styles to Paystack-generated elements directly
      setTimeout(() => {
        // Find Paystack modal elements
        const paystackModal = document.querySelector('[class*="paystack-modal"]') as HTMLElement;
        const paystackOverlay = document.querySelector('[class*="paystack-overlay"]') as HTMLElement;
        const paystackIframe = document.querySelector('iframe[src*="paystack"]') as HTMLIFrameElement;

        if (paystackModal) {
          // Style the modal container for full width
          paystackModal.style.width = '90vw';
          paystackModal.style.maxWidth = '500px';
          paystackModal.style.height = 'auto';
          paystackModal.style.borderRadius = '12px';
          paystackModal.style.zIndex = '999999';
        }

        if (paystackOverlay) {
          // Ensure overlay is behind modal but above content
          paystackOverlay.style.zIndex = '999998';
        }

        if (paystackIframe) {
          // Style the iframe directly
          paystackIframe.style.width = '100%';
          paystackIframe.style.height = '400px';
          paystackIframe.style.border = 'none';
          paystackIframe.style.borderRadius = '12px';
        }
      }, 100);

    } catch (error) {
      console.error('Error setting up Paystack payment:', error);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={!isLoaded}
      className={className}
    >
      {!isLoaded ? 'Loading...' : 'Pay Now'}
    </Button>
  );
}