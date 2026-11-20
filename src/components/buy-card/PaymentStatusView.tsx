import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  formatNaira,
  buildChipngWhatsAppUrl,
  CHIPNG_DISPLAY_PHONE,
  CHIPNG_SUPPORT_EMAIL,
} from '../../data/buyCardCatalog';
import {
  trackVerifiedPurchase,
  trackWhatsAppSupportClicked,
} from '../../utils/conversionAnalytics';
import { MakroNavbar } from '../makro/MakroNavbar';
import { MakroFooter } from '../makro/MakroFooter';
import { SeoHead } from '../seo/SeoHead';
import { openFlutterwavePayment } from '../../utils/flutterwaveClient';

interface PaymentStatusViewProps {
  onNavigate?: (view: any) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  session?: any;
}

interface VerifiedOrderSummary {
  order_number: string;
  tx_ref: string;
  flw_transaction_id?: string | null;
  payment_status: 'pending' | 'under_verification' | 'successful' | 'failed' | 'cancelled';
  fulfillment_status: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_ngn: number;
  total_amount_ngn: number;
  currency: string;
  customer_name: string;
  business_name?: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_state: string;
  preferred_card_name?: string;
  verified_at?: string | null;
  created_at: string;
}

export function PaymentStatusView({
  onNavigate,
  isDarkMode = false,
  toggleDarkMode = () => {},
  session,
}: PaymentStatusViewProps) {
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [order, setOrder] = useState<VerifiedOrderSummary | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    'verifying' | 'successful' | 'under_verification' | 'failed' | 'cancelled'
  >('verifying');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [retryError, setRetryError] = useState<string | null>(null);

  const getQueryContext = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order') || params.get('order_number') || '';
    let tokenParam = params.get('token') || params.get('access_token') || '';
    const txRef = params.get('tx_ref') || '';
    const transactionId = params.get('transaction_id') || '';
    const flwStatus = params.get('status') || '';

    if (orderParam && !tokenParam) {
      try {
        const cached = sessionStorage.getItem(`chipng_order_${orderParam}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.access_token) tokenParam = parsed.access_token;
        }
      } catch {}
    }

    return { orderParam, tokenParam, txRef, transactionId, flwStatus };
  }, []);

  const verifyPaymentNow = useCallback(async () => {
    setLoading(true);
    setRetryError(null);
    const { orderParam, tokenParam, txRef, transactionId, flwStatus } = getQueryContext();

    if (!orderParam && !txRef && !transactionId) {
      setPaymentStatus('failed');
      setStatusMessage('No order or transaction reference was found in this link.');
      setLoading(false);
      return;
    }

    try {
      const qs = new URLSearchParams();
      if (orderParam) qs.set('order', orderParam);
      if (tokenParam) qs.set('token', tokenParam);
      if (txRef) qs.set('tx_ref', txRef);
      if (transactionId) qs.set('transaction_id', transactionId);
      if (flwStatus) qs.set('status', flwStatus);

      const endpoint =
        txRef || transactionId || flwStatus
          ? `/api/flutterwave/verify?${qs.toString()}`
          : `/api/orders/status?${qs.toString()}`;

      const params = new URLSearchParams(window.location.search);
      const isInlineMode = params.get('mode') === 'inline';
      let cachedInlineOrder: VerifiedOrderSummary | null = null;
      if (isInlineMode && orderParam) {
        try {
          const raw = sessionStorage.getItem(`chipng_inline_receipt_${orderParam}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (
              parsed?.order_number === orderParam &&
              (!txRef || parsed?.tx_ref === txRef) &&
              parsed?.payment_status === 'successful'
            ) {
              cachedInlineOrder = parsed;
            }
          }
        } catch {}
      }

      const resp = await fetch(endpoint);
      const json = await resp.json().catch(() => ({}));

      if (json.order) {
        setOrder(json.order);
      }

      if (json.verified === true && json.payment_status === 'successful' && json.order) {
        setPaymentStatus('successful');
        setStatusMessage('Your payment has been verified with Flutterwave.');
        trackVerifiedPurchase({
          transactionId: json.order.tx_ref || json.order.flw_transaction_id || json.order.order_number,
          orderNumber: json.order.order_number,
          productId: json.order.product_id,
          productName: json.order.product_name,
          quantity: json.order.quantity,
          value: json.order.total_amount_ngn,
          currency: 'NGN',
          userMatch: {
            email: json.order.customer_email,
            phone: json.order.customer_phone,
          },
        });
      } else if (cachedInlineOrder) {
        setOrder(cachedInlineOrder);
        setPaymentStatus('successful');
        setStatusMessage('Your Flutterwave payment has been confirmed.');
        trackVerifiedPurchase({
          transactionId: cachedInlineOrder.flw_transaction_id || cachedInlineOrder.tx_ref,
          orderNumber: cachedInlineOrder.order_number,
          productId: cachedInlineOrder.product_id,
          productName: cachedInlineOrder.product_name,
          quantity: cachedInlineOrder.quantity,
          value: cachedInlineOrder.total_amount_ngn,
          currency: 'NGN',
          userMatch: {
            email: cachedInlineOrder.customer_email,
            phone: cachedInlineOrder.customer_phone,
          },
        });
      } else if (json.payment_status === 'under_verification' || json.payment_status === 'pending') {
        setPaymentStatus('under_verification');
        setStatusMessage(
          json.message ||
            json.error ||
            'Your transaction is still awaiting final bank/Flutterwave settlement. Please re-check in a moment.'
        );
      } else if (json.payment_status === 'cancelled') {
        setPaymentStatus('cancelled');
        setStatusMessage(json.message || 'Payment was cancelled before completion.');
      } else {
        setPaymentStatus('failed');
        setStatusMessage(
          json.message ||
            json.error ||
            'We could not confirm your payment with Flutterwave. No confirmed charge was applied to this order.'
        );
      }
    } catch (err: any) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'inline' && orderParam) {
        try {
          const raw = sessionStorage.getItem(`chipng_inline_receipt_${orderParam}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.payment_status === 'successful') {
              setOrder(parsed);
              setPaymentStatus('successful');
              setStatusMessage('Your Flutterwave payment has been confirmed.');
              setLoading(false);
              return;
            }
          }
        } catch {}
      }
      setPaymentStatus('under_verification');
      setStatusMessage(
        'We had trouble reaching our verification server. Please click Re-check Status or contact support before paying again.'
      );
    } finally {
      setLoading(false);
    }
  }, [getQueryContext]);

  useEffect(() => {
    document.title = 'Order Payment Status | CHIPNG';
    verifyPaymentNow();
  }, [verifyPaymentNow]);

  const handleRetryPayment = async () => {
    const { orderParam, tokenParam } = getQueryContext();
    const targetOrderNumber = order?.order_number || orderParam;
    if (!targetOrderNumber || !tokenParam) {
      setRetryError('Missing order session token. Please return to Buy Card to start a fresh order.');
      return;
    }

    setRetrying(true);
    setRetryError(null);
    try {
      const resp = await fetch(`/api/orders/${encodeURIComponent(targetOrderNumber)}/retry-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenParam }),
      });
      const json = await resp.json().catch(() => ({}));
      if (resp.status === 409 && json.code === 'ALREADY_PAID') {
        await verifyPaymentNow();
        setRetrying(false);
        return;
      }
      if (resp.ok && json.success && json.payment_link) {
        window.location.assign(json.payment_link);
        return;
      }

      // Fallback to Flutterwave v3 Inline checkout on the same existing order without duplicating
      if (order) {
        const retryTxRef = `${order.order_number}-RETRY-${Date.now().toString(36).toUpperCase()}`;
        await openFlutterwavePayment({
          txRef: retryTxRef,
          amount: order.total_amount_ngn,
          currency: 'NGN',
          customer: {
            email: order.customer_email,
            phone_number: order.customer_phone,
            name: order.customer_name,
          },
          title: 'CHIPNG Smart Business Cards',
          description: `${order.product_name} × ${order.quantity} — Order ${order.order_number}`,
          meta: { order_number: order.order_number },
          onSuccess: (flwResp: any) => {
            const st = String(flwResp?.status || '').toLowerCase();
            if (st === 'successful' || st === 'completed') {
              const confirmed: VerifiedOrderSummary = {
                ...order,
                tx_ref: String(flwResp?.tx_ref || retryTxRef),
                flw_transaction_id: flwResp?.transaction_id ? String(flwResp.transaction_id) : null,
                payment_status: 'successful',
                verified_at: new Date().toISOString(),
              };
              try {
                sessionStorage.setItem(`chipng_inline_receipt_${order.order_number}`, JSON.stringify(confirmed));
              } catch {}
              setOrder(confirmed);
              setPaymentStatus('successful');
              setStatusMessage('Your Flutterwave payment has been confirmed.');
              setRetrying(false);
            } else {
              setRetryError('Payment was not completed. Please try again.');
              setRetrying(false);
            }
          },
          onClose: () => setRetrying(false),
        });
        return;
      }

      setRetryError(json.error || 'Could not re-open Flutterwave checkout. Please contact support.');
      setRetrying(false);
    } catch (err: any) {
      setRetryError(err?.message || 'Network error while retrying payment.');
      setRetrying(false);
    }
  };

  const navigateToBuyCard = () => {
    if (onNavigate) {
      onNavigate('nfc-sales');
    } else {
      window.location.href = '/buy-card';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#08090b] text-neutral-950 dark:text-white flex flex-col">
      <SeoHead
        title="Order Payment Status | CHIPNG"
        description="Verify your CHIPNG NFC business card payment status."
        canonicalPath="/buy-card/payment-status"
        noindex={true}
      />
      <MakroNavbar
        currentView="nfc-sales"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-8 sm:p-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-[#16a34a] animate-spin mx-auto" />
              <h1 className="text-2xl font-extrabold tracking-tight">
                Verifying Your Payment Securely
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                We are confirming your transaction directly with Flutterwave&apos;s servers. Please do not close this tab.
              </p>
            </div>
          ) : paymentStatus === 'successful' && order ? (
            <div className="rounded-3xl border border-[#16a34a]/30 bg-white dark:bg-[#0f1115] p-6 sm:p-10 shadow-sm space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#16a34a]">
                  Payment Verified via Flutterwave
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                  YOUR CHIPNG ORDER IS CONFIRMED!
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg">
                  Thank you, <span className="font-semibold text-neutral-950 dark:text-white">{order.customer_name}</span>. Your payment has been verified and your card order is now in our Lagos design studio queue.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 p-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500 dark:text-neutral-400">Order Number</span>
                  <span className="font-mono font-bold text-neutral-950 dark:text-white">{order.order_number}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500 dark:text-neutral-400">Product Selected</span>
                  <span className="font-semibold text-neutral-950 dark:text-white text-right">
                    {order.product_name} × {order.quantity}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500 dark:text-neutral-400">Amount Paid</span>
                  <span className="font-extrabold text-[#16a34a] tabular-nums">
                    {formatNaira(order.total_amount_ngn)} (NGN)
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-neutral-500 dark:text-neutral-400">Flutterwave Reference</span>
                  <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300 text-right break-all">
                    {order.tx_ref}
                  </span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between gap-4">
                  <span className="text-neutral-500 dark:text-neutral-400">Delivery To</span>
                  <span className="text-right text-neutral-900 dark:text-neutral-200">
                    {order.delivery_address}, {order.delivery_state}
                  </span>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  What Happens Next
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-1.5">
                    <Sparkles className="w-4 h-4 text-[#16a34a]" />
                    <p className="text-xs font-bold">1. Design Proof</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Our designer sends your custom mockup to WhatsApp ({order.customer_phone}) &amp; email.
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                    <p className="text-xs font-bold">2. Your Approval</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Production begins immediately after you approve your card proof.
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-1.5">
                    <Truck className="w-4 h-4 text-[#16a34a]" />
                    <p className="text-xs font-bold">3. Fast Delivery</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Lagos: 24–48 hrs · Nationwide (DHL/GIG): 2–4 business days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={buildChipngWhatsAppUrl(
                    `Hello CHIPNG, my order ${order.order_number} (${order.product_name} x${order.quantity}) is confirmed! I'm ready for my custom design proof.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppSupportClicked('payment_success_page')}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Connect on WhatsApp for Design Proof
                </a>
                <button
                  type="button"
                  onClick={navigateToBuyCard}
                  className="py-3.5 px-5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Back to Buy Card
                </button>
              </div>
            </div>
          ) : paymentStatus === 'under_verification' ? (
            <div className="rounded-3xl border border-amber-300/60 dark:border-amber-800/60 bg-white dark:bg-[#0f1115] p-6 sm:p-10 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
                  Payment Under Verification
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  CONFIRMING YOUR TRANSACTION
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
                  {statusMessage}
                </p>
              </div>

              {order && (
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Order Reference</span>
                    <span className="font-mono font-bold">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Product</span>
                    <span className="font-semibold">{order.product_name} × {order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Amount</span>
                    <span className="font-bold tabular-nums">{formatNaira(order.total_amount_ngn)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={verifyPaymentNow}
                  className="flex-1 py-3.5 px-5 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Re-check Payment Status
                </button>
                <a
                  href={buildChipngWhatsAppUrl(
                    `Hello CHIPNG, please help verify payment status for my order ${order?.order_number || ''}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppSupportClicked('payment_pending_verification')}
                  className="flex-1 py-3.5 px-5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <MessageCircle className="w-4 h-4 text-[#16a34a]" />
                  WhatsApp Support ({CHIPNG_DISPLAY_PHONE})
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0f1115] p-6 sm:p-10 space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <XCircle className="w-8 h-8" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600 dark:text-red-400">
                  {paymentStatus === 'cancelled' ? 'Payment Cancelled' : 'Payment Not Confirmed'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                  WE COULDN&apos;T CONFIRM YOUR PAYMENT
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg leading-relaxed">
                  {statusMessage} Your card details are still saved under your order reference so you can retry securely without filling out the form again.
                </p>
              </div>

              {order && (
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Order Reference</span>
                    <span className="font-mono font-bold">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Product</span>
                    <span className="font-semibold">{order.product_name} × {order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Amount Due</span>
                    <span className="font-bold tabular-nums">{formatNaira(order.total_amount_ngn)}</span>
                  </div>
                </div>
              )}

              {retryError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3.5 text-xs text-red-700 dark:text-red-300">
                  {retryError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {order && (
                  <button
                    type="button"
                    disabled={retrying}
                    onClick={handleRetryPayment}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {retrying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Re-opening Flutterwave...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Retry Payment Securely
                      </>
                    )}
                  </button>
                )}
                <a
                  href={buildChipngWhatsAppUrl(
                    `Hello CHIPNG, my payment for order ${order?.order_number || ''} didn't go through. Please assist me.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppSupportClicked('payment_failed_page')}
                  className="flex-1 py-3.5 px-5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <MessageCircle className="w-4 h-4 text-[#16a34a]" />
                  Chat on WhatsApp ({CHIPNG_DISPLAY_PHONE})
                </a>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={navigateToBuyCard}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to CHIPNG Buy Card
                </button>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Need email support? Reach us at {CHIPNG_SUPPORT_EMAIL}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
