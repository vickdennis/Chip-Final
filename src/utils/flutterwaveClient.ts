/**
 * CHIP NG - Official Flutterwave Payment Client Utility
 * Handles modern inline Flutterwave checkouts across all customer touchpoints.
 */

export const FLUTTERWAVE_PUBLIC_KEY =
  (import.meta as any).env.VITE_FLWPUBK ||
  (import.meta as any).env.VITE_FLUTTERWAVE_PUBLIC_KEY ||
  'FLWPUBK-0cf19429de1ea7b5950898d31a89dcf5-X';

export interface FlutterwaveCheckoutOptions {
  txRef?: string;
  amount: number; // in NGN
  currency?: string;
  customer: {
    email: string;
    phone_number?: string;
    name?: string;
  };
  title?: string;
  description?: string;
  meta?: Record<string, any>;
  onSuccess: (response: any) => void;
  onClose?: () => void;
}

/**
 * Dynamically loads Flutterwave inline checkout script if not present
 */
export async function ensureFlutterwaveScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if ((window as any).FlutterwaveCheckout) return true;

  return new Promise((resolve) => {
    const existing = document.querySelector('script[src*="flutterwave"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      setTimeout(() => resolve(!!(window as any).FlutterwaveCheckout), 1500);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Flutterwave v3.js script');
      resolve(false);
    };
    document.head.appendChild(script);
  });
}

/**
 * Launches Flutterwave modal using either window.FlutterwaveCheckout or fallback
 */
export async function openFlutterwavePayment(options: FlutterwaveCheckoutOptions): Promise<void> {
  const tx_ref = options.txRef || `CHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  await ensureFlutterwaveScript();

  if (typeof (window as any).FlutterwaveCheckout === 'function') {
    (window as any).FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref,
      amount: options.amount,
      currency: options.currency || 'NGN',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: options.customer.email.trim() || 'customer@chipng.com',
        phone_number: options.customer.phone_number || '',
        name: options.customer.name || 'Valued Customer',
      },
      customizations: {
        title: options.title || 'CHIP NG — Contactless Smart Cards',
        description: options.description || 'Secure contactless NFC card checkout',
        logo: 'https://www.chipng.com/chipng_exact_tile.png',
      },
      meta: options.meta || {},
      callback: (data: any) => {
        options.onSuccess(data || { tx_ref, status: 'successful' });
      },
      onclose: () => {
        if (options.onClose) options.onClose();
      },
    });
  } else {
    throw new Error('Flutterwave inline checkout could not be initialized. Please check network connection.');
  }
}
