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
          // Close the modal after 5 seconds to allow user interaction with success page
          setTimeout(() => {
            const paystackIframe = document.querySelector('iframe[src*="paystack"]');
            if (paystackIframe) {
              const modalContainer = paystackIframe.closest('[style*="position: fixed"]') as HTMLElement;
              if (modalContainer) {
                modalContainer.style.display = 'none';
                document.body.style.overflow = '';
              }
            }
          }, 5000);
          onSuccess(response.reference);
        },
        onClose: () => {
          console.log('Paystack modal closed');
          onClose();
        },
      });

      // Open the Paystack modal
      handler.openIframe();

      // Watch for Paystack iframe insertion and then style modal container + iframe (do NOT move nodes)
      const observer = new MutationObserver((mutations, obs) => {
        for (const m of mutations) {
          for (const node of Array.from(m.addedNodes)) {
            if (!(node instanceof HTMLElement)) continue;

            const iframe = node.tagName === 'IFRAME' && (node as HTMLIFrameElement).src.includes('paystack')
              ? (node as HTMLIFrameElement)
              : node.querySelector?.('iframe[src*="paystack"]') as HTMLIFrameElement | null;

            if (iframe) {
              try {
                // Enhanced iframe styling for better presentation
                iframe.style.width = '100%';
                iframe.style.maxWidth = '900px';
                iframe.style.height = 'min(85vh, 780px)';
                iframe.style.minHeight = '560px';
                iframe.style.border = 'none';
                iframe.style.borderRadius = '16px';
                iframe.style.display = 'block';
                iframe.style.margin = '0 auto';
                iframe.style.boxSizing = 'border-box';
                iframe.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)';
                iframe.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

                // Find the closest fixed-position ancestor (Paystack modal container)
                let ancestor: HTMLElement | null = iframe.parentElement;
                while (ancestor && getComputedStyle(ancestor).position !== 'fixed') {
                  ancestor = ancestor.parentElement;
                }

                const modalContainer = ancestor || iframe.parentElement!;
                
                // Enhanced modal container styling for professional presentation
                modalContainer.style.position = 'fixed';
                modalContainer.style.inset = '0';
                modalContainer.style.display = 'flex';
                modalContainer.style.alignItems = 'center';
                modalContainer.style.justifyContent = 'center';
                modalContainer.style.padding = '1rem';
                modalContainer.style.zIndex = '999999';
                modalContainer.style.pointerEvents = 'auto';
                modalContainer.style.animation = 'fadeIn 0.2s ease-out';

                // Ensure the inner content is centered using flexbox
                const innerContent = modalContainer.querySelector('div') || modalContainer;
                // Remove conflicting absolute positioning; rely on modalContainer's flex centering

                // Create enhanced backdrop if it doesn't exist
                let backdrop = modalContainer.querySelector('.paystack-custom-backdrop') as HTMLElement;
                if (!backdrop) {
                  backdrop = document.createElement('div');
                  backdrop.className = 'paystack-custom-backdrop';
                  backdrop.style.position = 'fixed';
                  backdrop.style.inset = '0';
                  backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
                  backdrop.style.backdropFilter = 'blur(8px)';
                  (backdrop.style as any).webkitBackdropFilter = 'blur(8px)';
                  backdrop.style.zIndex = '-1';
                  backdrop.style.animation = 'fadeIn 0.3s ease-out';
                  modalContainer.insertBefore(backdrop, modalContainer.firstChild);
                }

                // Wrapper for iframe to add padding and centering
                if (iframe.parentElement !== modalContainer) {
                  const wrapper = iframe.parentElement!;
                  wrapper.style.width = '100%';
                  wrapper.style.maxWidth = '900px';
                  wrapper.style.margin = '0 auto';
                  wrapper.style.position = 'relative';
                  wrapper.style.zIndex = '1';
                }

                // Add CSS animations if not already present
                if (!document.getElementById('paystack-custom-animations')) {
                  const style = document.createElement('style');
                  style.id = 'paystack-custom-animations';
                  style.textContent = `
                    @keyframes fadeIn {
                      from {
                        opacity: 0;
                      }
                      to {
                        opacity: 1;
                      }
                    }
                    
                    @keyframes slideUp {
                      from {
                        transform: translateY(20px);
                        opacity: 0;
                      }
                      to {
                        transform: translateY(0);
                        opacity: 1;
                      }
                    }

                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                      iframe[src*="paystack"] {
                        max-width: 100% !important;
                        height: 90vh !important;
                        min-height: 500px !important;
                        border-radius: 12px !important;
                      }
                    }

                    @media (max-width: 480px) {
                      iframe[src*="paystack"] {
                        height: 95vh !important;
                        min-height: 450px !important;
                        border-radius: 8px !important;
                      }
                    }
                  `;
                  document.head.appendChild(style);
                }

                // Apply slide-up animation to iframe
                iframe.style.animation = 'slideUp 0.3s ease-out';

                // Lower any full-screen dark overlays so modal sits above them
                document.querySelectorAll<HTMLElement>('body > *').forEach((el) => {
                  try {
                    const style = getComputedStyle(el);
                    if (el !== modalContainer && style.position === 'fixed' && /rgba?\(0,\s*0,\s*0/.test(style.backgroundColor || '')) {
                      el.style.zIndex = '999998';
                    }
                  } catch (e) { /* ignore */ }
                });

                // Prevent body scroll when modal is open
                document.body.style.overflow = 'hidden';

                // Listen for modal close to restore body scroll
                const closeObserver = new MutationObserver((mutations) => {
                  const paystackIframe = document.querySelector('iframe[src*="paystack"]');
                  if (!paystackIframe) {
                    document.body.style.overflow = '';
                    closeObserver.disconnect();
                  }
                });
                closeObserver.observe(document.body, { childList: true, subtree: true });

              } catch (e) {
                console.error('Error styling Paystack modal', e);
              } finally {
                obs.disconnect();
                return;
              }
            }
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Fallback if iframe already present
      setTimeout(() => {
        const existing = document.querySelector('iframe[src*="paystack"]') as HTMLIFrameElement | null;
        if (existing) {
          existing.style.maxWidth = '900px';
          existing.style.height = 'min(85vh, 780px)';
          existing.style.borderRadius = '16px';
          existing.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        }
      }, 350);

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
