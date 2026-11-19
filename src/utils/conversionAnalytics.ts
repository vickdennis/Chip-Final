import { trackTikTokEvent } from './tiktokPixel';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export interface FunnelProductPayload {
  id: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  currency?: string;
}

const PURCHASE_DEDUP_KEY = 'chipng_tracked_purchases_v1';

function hasTrackedPurchase(reference: string): boolean {
  if (typeof window === 'undefined' || !reference) return false;
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_DEDUP_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    return list.includes(reference);
  } catch {
    return false;
  }
}

function markPurchaseTracked(reference: string): void {
  if (typeof window === 'undefined' || !reference) return;
  try {
    const raw = window.sessionStorage.getItem(PURCHASE_DEDUP_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(reference)) {
      list.push(reference);
      window.sessionStorage.setItem(PURCHASE_DEDUP_KEY, JSON.stringify(list.slice(-30)));
    }
  } catch {
    // Ignore restricted storage environments
  }
}

function safeGtag(eventName: string, params: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch {
    // Never block user flows
  }
}

function safeFbq(action: 'track' | 'trackCustom', eventName: string, params?: Record<string, any>, options?: Record<string, any>) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (options) {
        window.fbq(action, eventName, params || {}, options);
      } else {
        window.fbq(action, eventName, params || {});
      }
    }
  } catch {
    // Never block user flows
  }
}

export function trackBuyCardViewContent(startingPriceNgn = 30000) {
  safeGtag('view_item_list', {
    item_list_id: 'buy_card_catalog',
    item_list_name: 'CHIPNG NFC Business Cards',
    currency: 'NGN',
    value: startingPriceNgn,
  });

  safeFbq('track', 'ViewContent', {
    content_name: 'CHIPNG NFC Business Cards',
    content_category: 'NFC Smart Business Cards',
    content_type: 'product_group',
    currency: 'NGN',
    value: startingPriceNgn,
  });

  trackTikTokEvent('ViewContent', {
    content_type: 'product',
    content_name: 'CHIPNG NFC Business Cards',
    content_category: 'NFC Smart Business Cards',
    value: startingPriceNgn,
    currency: 'NGN',
  });
}

export function trackSelectProduct(product: FunnelProductPayload) {
  const qty = product.quantity || 1;
  const currency = product.currency || 'NGN';
  const value = Math.round(product.price * qty);

  safeGtag('select_item', {
    currency,
    value,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'NFC Smart Card',
        price: product.price,
        quantity: qty,
      },
    ],
  });

  safeFbq('trackCustom', 'SelectProduct', {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category || 'NFC Smart Card',
    currency,
    value,
  });
}

export function trackAddToCart(product: FunnelProductPayload) {
  const qty = product.quantity || 1;
  const currency = product.currency || 'NGN';
  const value = Math.round(product.price * qty);

  safeGtag('add_to_cart', {
    currency,
    value,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'NFC Smart Card',
        price: product.price,
        quantity: qty,
      },
    ],
  });

  safeFbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    currency,
    value,
    num_items: qty,
  });

  trackTikTokEvent('AddToCart', {
    content_type: 'product',
    content_id: product.id,
    content_name: product.name,
    quantity: qty,
    value,
    currency,
  });
}

export function trackBeginCheckout(product: FunnelProductPayload, userMatch?: { email?: string; phone?: string }) {
  const qty = product.quantity || 1;
  const currency = product.currency || 'NGN';
  const value = Math.round(product.price * qty);

  safeGtag('begin_checkout', {
    currency,
    value,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'NFC Smart Card',
        price: product.price,
        quantity: qty,
      },
    ],
  });

  safeFbq('track', 'InitiateCheckout', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    currency,
    value,
    num_items: qty,
  });

  trackTikTokEvent(
    'InitiateCheckout',
    {
      content_type: 'product',
      content_id: product.id,
      content_name: product.name,
      quantity: qty,
      value,
      currency,
    },
    userMatch ? { user: userMatch } : undefined
  );
}

export function trackAddPaymentInfo(product: FunnelProductPayload, paymentGateway = 'flutterwave') {
  const qty = product.quantity || 1;
  const currency = product.currency || 'NGN';
  const value = Math.round(product.price * qty);

  safeGtag('add_payment_info', {
    currency,
    value,
    payment_type: paymentGateway,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'NFC Smart Card',
        price: product.price,
        quantity: qty,
      },
    ],
  });

  safeFbq('track', 'AddPaymentInfo', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    currency,
    value,
  });
}

/**
 * Fires Purchase ONLY after verified server-side Flutterwave confirmation.
 * Deduplicated per transaction reference so refreshes never double-report.
 */
export function trackVerifiedPurchase(params: {
  transactionId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  value: number;
  currency?: string;
  userMatch?: { email?: string; phone?: string };
}) {
  const dedupKey = params.transactionId || params.orderNumber;
  if (!dedupKey || hasTrackedPurchase(dedupKey)) {
    return false;
  }

  markPurchaseTracked(dedupKey);
  const currency = (params.currency || 'NGN').toUpperCase();

  safeGtag('purchase', {
    transaction_id: dedupKey,
    currency,
    value: params.value,
    items: [
      {
        item_id: params.productId,
        item_name: params.productName,
        price: params.quantity > 0 ? Math.round(params.value / params.quantity) : params.value,
        quantity: params.quantity,
      },
    ],
  });

  safeFbq(
    'track',
    'Purchase',
    {
      content_ids: [params.productId],
      content_name: params.productName,
      content_type: 'product',
      currency,
      value: params.value,
      num_items: params.quantity,
    },
    { eventID: dedupKey }
  );

  trackTikTokEvent(
    'CompletePayment',
    {
      event_id: dedupKey,
      content_type: 'product',
      content_id: params.productId,
      content_name: params.productName,
      quantity: params.quantity,
      value: params.value,
      currency,
    },
    {
      force: true,
      ...(params.userMatch ? { user: params.userMatch } : {}),
    }
  );

  return true;
}

export function trackLogoUploaded(productId: string, fileType: string) {
  safeGtag('logo_uploaded', { product_id: productId, file_type: fileType });
  safeFbq('trackCustom', 'LogoUploaded', { product_id: productId, file_type: fileType });
}

export function trackWhatsAppSupportClicked(source: string) {
  safeGtag('whatsapp_support_clicked', { source });
  safeFbq('trackCustom', 'WhatsAppSupportClicked', { source });
}

export function trackFaqOpened(faqId: string, question: string) {
  safeGtag('faq_opened', { faq_id: faqId, question: question.slice(0, 100) });
  safeFbq('trackCustom', 'FAQOpened', { faq_id: faqId });
}

export function trackDesignApprovalRequested(productId: string) {
  safeGtag('design_approval_requested', { product_id: productId });
  safeFbq('trackCustom', 'DesignApprovalRequested', { product_id: productId });
}

export function trackCheckoutAbandoned(productId: string, step: number, valueNgn: number) {
  safeGtag('checkout_abandoned', { product_id: productId, step, currency: 'NGN', value: valueNgn });
  safeFbq('trackCustom', 'CheckoutAbandoned', { product_id: productId, step, currency: 'NGN', value: valueNgn });
}
