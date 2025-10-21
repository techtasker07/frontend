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

      console.log('Opening Paystack iframe...');
      handler.openIframe();

      // Apply styles to ensure iframe displays properly
      const applyPaystackStyles = () => {
        // Find all iframes and apply styles to Paystack iframe
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          if (iframe.src && (iframe.src.includes('paystack') || iframe.src.includes('checkout'))) {
            console.log('Found Paystack iframe, applying styles');
            iframe.classList.add('paystack-iframe');
            
            // Force critical styles inline
            iframe.style.cssText = `
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              max-width: 100vw !important;
              max-height: 100vh !important;
              z-index: 999999 !important;
              pointer-events: auto !important;
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            `;
          }
        });

        // Find and style Paystack modal containers
        const selectors = [
          '#paystack-modal',
          '.paystack-modal',
          'div[class*="paystack"]',
          'div[id*="paystack"]'
        ];

        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element && element instanceof HTMLElement) {
              console.log('Found Paystack container, applying styles');
              element.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                z-index: 999999 !important;
                pointer-events: auto !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
              `;
            }
          });
        });
      };

      // Apply styles immediately and repeatedly to catch the iframe
      applyPaystackStyles();
      
      // Continue checking for a few seconds to ensure we catch the iframe
      const intervals = [100, 300, 500, 800, 1200, 1800, 2500];
      intervals.forEach(delay => {
        setTimeout(applyPaystackStyles, delay);
      });

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
