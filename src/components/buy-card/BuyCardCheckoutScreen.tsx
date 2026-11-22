import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Lock,
  MessageCircle,
  Loader2,
  AlertCircle,
  FileText,
  Truck,
  Sparkles,
  Minus,
  Plus,
  Moon,
  Sun,
} from 'lucide-react';
import {
  BuyCardProduct,
  NIGERIAN_STATES,
  formatNaira,
  buildChipngWhatsAppUrl,
  CHIPNG_DISPLAY_PHONE,
} from '../../data/buyCardCatalog';
import {
  trackBeginCheckout,
  trackLogoUploaded,
  trackDesignApprovalRequested,
  trackAddPaymentInfo,
  trackCheckoutAbandoned,
  trackWhatsAppSupportClicked,
  trackVerifiedPurchase,
} from '../../utils/conversionAnalytics';
import { ensureFlutterwaveScript, openFlutterwavePayment } from '../../utils/flutterwaveClient';
import { supabase } from '../../supabaseClient';
import { SeoHead } from '../seo/SeoHead';

interface BuyCardCheckoutScreenProps {
  product: BuyCardProduct;
  allProducts: BuyCardProduct[];
  onSelectProduct: (product: BuyCardProduct) => void;
  onBack: () => void;
  initialQuantity?: number;
  referrer?: string | null;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const ALLOWED_FILE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
]);
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

export function BuyCardCheckoutScreen({
  product,
  allProducts,
  onSelectProduct,
  onBack,
  initialQuantity = 1,
  referrer = null,
  isDarkMode = false,
  toggleDarkMode,
}: BuyCardCheckoutScreenProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  // Step 1: Customer & Delivery Info
  const [customerName, setCustomerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryState, setDeliveryState] = useState('Lagos');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [reminderConsent, setReminderConsent] = useState(false);

  // Step 2: Card Customization
  const [preferredCardName, setPreferredCardName] = useState('');
  const [brandColors, setBrandColors] = useState('');
  const [designPreferences, setDesignPreferences] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Logo Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string>('');
  const [logoPreviewDataUrl, setLogoPreviewDataUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Step 3: Design Approval Acknowledgement
  const [designApprovalAck, setDesignApprovalAck] = useState(false);

  // Step 4: Payment Submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedOrderRef, setSavedOrderRef] = useState<string | null>(null);
  const hasInitiatedRedirectRef = useRef(false);
  const trackedProductRef = useRef<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    ensureFlutterwaveScript().catch(() => {});
  }, []);

  useEffect(() => {
    if (trackedProductRef.current === product.id) return;
    trackedProductRef.current = product.id;
    setErrorMessage(null);
    setSavedOrderRef(null);
    hasInitiatedRedirectRef.current = false;
    trackBeginCheckout({
      id: product.id,
      name: product.name,
      price: product.priceNgn,
      quantity,
      category: product.category,
    });
  }, [product.id]);

  // Smoothly scroll to top whenever the user advances or steps back
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  }, [step]);

  const totalAmount = product.priceNgn * quantity;

  const handleBackToCards = () => {
    if (!hasInitiatedRedirectRef.current && (customerEmail || customerPhone || step > 1)) {
      trackCheckoutAbandoned(product.id, step, totalAmount);

      if (reminderConsent && (customerEmail.trim() || customerPhone.trim())) {
        fetch('/api/funnel/save-incomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            consent: true,
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim(),
            product_name: product.name,
            preferred_card_name: preferredCardName.trim() || customerName.trim(),
            funnel_stage: `step_${step}_abandoned`,
            estimated_amount: totalAmount,
          }),
        }).catch(() => {});
      }
    }
    onBack();
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError(null);

    const mime = (file.type || '').toLowerCase();
    if (!ALLOWED_FILE_TYPES.has(mime)) {
      setLogoError('Unsupported format. Please upload PNG, JPG, WEBP, SVG, or PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoError('Logo exceeds 5MB maximum size. Please upload a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLogoUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read selected file.'));
        reader.readAsDataURL(file);
      });

      let uploadedUrl: string | null = null;
      try {
        const resp = await fetch('/api/orders/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimeType: mime,
            base64Data: dataUrl,
          }),
        });
        const json = await resp.json().catch(() => ({}));
        if (resp.ok && json.success && json.url) {
          uploadedUrl = json.url;
        }
      } catch {
        // Fall through to direct Supabase Storage upload
      }

      if (!uploadedUrl) {
        const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
        const storagePath = `card-logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: sbErr } = await supabase.storage
          .from('covers')
          .upload(storagePath, file, { contentType: mime, upsert: false });
        if (sbErr) {
          throw new Error(sbErr.message || 'Logo upload failed. Please try again.');
        }
        const { data: pubData } = supabase.storage.from('covers').getPublicUrl(storagePath);
        uploadedUrl = pubData?.publicUrl || null;
      }

      if (!uploadedUrl) {
        throw new Error('Logo upload failed. Please try again.');
      }

      setLogoUrl(uploadedUrl);
      setLogoFileName(file.name);
      setLogoPreviewDataUrl(mime === 'application/pdf' ? null : dataUrl);
      trackLogoUploaded(product.id, mime);
    } catch (err: any) {
      setLogoError(err?.message || 'Could not upload logo.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setLogoFileName('');
    setLogoPreviewDataUrl(null);
    setLogoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateStep1 = (): boolean => {
    setErrorMessage(null);
    if (customerName.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMessage('Please enter a valid email address for your receipt and design proof.');
      return false;
    }
    if (customerPhone.replace(/[^0-9+]/g, '').length < 7) {
      setErrorMessage('Please enter a valid phone or WhatsApp number.');
      return false;
    }
    if (!deliveryState) {
      setErrorMessage('Please select your delivery state.');
      return false;
    }
    if (deliveryAddress.trim().length < 5) {
      setErrorMessage('Please enter your complete delivery address.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (step === 1) {
      if (!validateStep1()) return;
      if (!preferredCardName.trim()) {
        setPreferredCardName(customerName.trim());
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!designApprovalAck) {
        setErrorMessage('Please confirm that you understand we will send a design proof for your approval before production.');
        return;
      }
      trackDesignApprovalRequested(product.id);
      setStep(4);
    }
  };

  const handleJumpToStep = (target: 1 | 2 | 3 | 4) => {
    if (submitting || target >= step) return;
    setErrorMessage(null);
    setStep(target);
  };

  const handleProceedToFlutterwave = async () => {
    setErrorMessage(null);
    setSavedOrderRef(null);

    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!designApprovalAck) {
      setErrorMessage('Please acknowledge the pre-production design proof step.');
      setStep(3);
      return;
    }

    setSubmitting(true);
    try {
      trackAddPaymentInfo(
        {
          id: product.id,
          name: product.name,
          price: product.priceNgn,
          quantity,
          category: product.category,
        },
        'flutterwave'
      );

      const orderPayload = {
        product_id: product.id,
        product_slug: product.slug,
        quantity,
        customer_name: customerName.trim(),
        business_name: businessName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        delivery_state: deliveryState,
        preferred_card_name: preferredCardName.trim() || customerName.trim(),
        brand_colors: brandColors.trim(),
        design_preferences: designPreferences.trim(),
        logo_url: logoUrl,
        website_url: websiteUrl.trim(),
        social_handles: {
          instagram: instagramHandle.trim(),
          linkedin: linkedinHandle.trim(),
          twitter: twitterHandle.trim(),
        },
        special_instructions: specialInstructions.trim(),
        design_approval_acknowledged: designApprovalAck,
        marketing_opt_in: reminderConsent,
        referrer: referrer || undefined,
      };

      // 1. Try server-authoritative Flutterwave Standard Hosted Checkout first
      let serverOrderNumber = '';
      let serverAccessToken = '';
      let serverTxRef = '';

      try {
        const resp = await fetch('/api/orders/create-and-pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
        const json = await resp.json().catch(() => ({}));

        if (json.order_number) {
          serverOrderNumber = String(json.order_number);
          serverAccessToken = String(json.access_token || '');
          serverTxRef = String(json.tx_ref || '');
          setSavedOrderRef(serverOrderNumber);
          try {
            sessionStorage.setItem(
              `chipng_order_${serverOrderNumber}`,
              JSON.stringify({
                order_number: serverOrderNumber,
                access_token: serverAccessToken,
                tx_ref: serverTxRef,
              })
            );
          } catch {}
        }

        if (resp.ok && json.success && json.payment_link) {
          hasInitiatedRedirectRef.current = true;
          window.location.assign(json.payment_link);
          return;
        }
      } catch {
        // Proceed seamlessly to Flutterwave v3 Inline Checkout
      }

      // 2. Seamless Flutterwave v3 Inline Checkout (guaranteed live payment flow on /buy-card & /buycard)
      const now = new Date();
      const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const orderNumber =
        serverOrderNumber || `CHIP-${ymd}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const txRef =
        serverTxRef || `${orderNumber}-${Date.now().toString(36).toUpperCase()}`;
      setSavedOrderRef(orderNumber);

      // Record pending order lead in Supabase so design details are never lost
      try {
        await supabase.from('leads').insert([
          {
            name: orderPayload.customer_name,
            whatsapp: orderPayload.customer_phone,
            city: JSON.stringify({
              order_number: orderNumber,
              tx_ref: txRef,
              email: orderPayload.customer_email,
              business_name: orderPayload.business_name,
              delivery_state: orderPayload.delivery_state,
              delivery_address: orderPayload.delivery_address,
              product_name: product.name,
              quantity,
              amount_ngn: totalAmount,
              preferred_card_name: orderPayload.preferred_card_name,
              brand_colors: orderPayload.brand_colors,
              design_preferences: orderPayload.design_preferences,
              logo_url: orderPayload.logo_url,
              website_url: orderPayload.website_url,
              social_handles: orderPayload.social_handles,
              special_instructions: orderPayload.special_instructions,
              status: 'pending_payment',
            }),
            post_slug: `buy_card_${product.slug}`,
            source: 'buy_card_flutterwave_checkout',
          },
        ]);
      } catch {}

      let paymentHandled = false;
      await openFlutterwavePayment({
        txRef,
        amount: totalAmount,
        currency: 'NGN',
        customer: {
          email: orderPayload.customer_email,
          phone_number: orderPayload.customer_phone,
          name: orderPayload.customer_name,
        },
        title: 'CHIPNG Smart Business Cards',
        description: `${product.name} × ${quantity} — Order ${orderNumber}`,
        meta: {
          order_number: orderNumber,
          product_id: product.id,
          product_slug: product.slug,
          product_name: product.name,
          card_tier: product.name,
          quantity,
          delivery_state: orderPayload.delivery_state,
          delivery_address: orderPayload.delivery_address,
          business_name: orderPayload.business_name,
          preferred_card_name: orderPayload.preferred_card_name,
          logo_url: orderPayload.logo_url || '',
          phone: orderPayload.customer_phone,
          name: orderPayload.customer_name,
          referrer: referrer || '',
        },
        onSuccess: async (flwResp: any) => {
          paymentHandled = true;
          const flwStatus = String(flwResp?.status || '').toLowerCase();
          const finalTxRef = String(flwResp?.tx_ref || txRef);
          const flwTransactionId = flwResp?.transaction_id ? String(flwResp.transaction_id) : '';
          const isSuccessful = flwStatus === 'successful' || flwStatus === 'completed';

          if (!isSuccessful) {
            setErrorMessage(
              `Flutterwave returned status "${flwStatus || 'incomplete'}". Please retry payment or message CHIPNG support.`
            );
            setSubmitting(false);
            return;
          }

          // Attempt server-side verification & recording
          try {
            await fetch(`/api/flutterwave/verify-ref/${encodeURIComponent(finalTxRef)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: orderPayload.customer_email,
                name: orderPayload.customer_name,
                phone: orderPayload.customer_phone,
                card_type: `${product.name}${quantity > 1 ? ` × ${quantity}` : ''} [${orderNumber}]`,
                amount_ngn: totalAmount,
                currency: 'NGN',
                delivery_address: `${orderPayload.delivery_address}, ${orderPayload.delivery_state}`,
                referrer: referrer || undefined,
              }),
            });
          } catch {}

          // Ensure confirmed purchase is stored in Supabase `purchases` (idempotent by reference)
          try {
            const { data: existingP } = await supabase
              .from('purchases')
              .select('id')
              .eq('reference', finalTxRef)
              .maybeSingle();
            if (!existingP) {
              await supabase.from('purchases').insert([
                {
                  buyer_email: orderPayload.customer_email,
                  amount: totalAmount,
                  platform_fee: 0,
                  net_earnings: totalAmount,
                  reference: finalTxRef,
                  status: 'completed',
                  purchase_type: 'nfc_card',
                },
              ]);
            }
          } catch {}

          // Persist verified inline receipt for PaymentStatusView
          const receiptOrder = {
            order_number: orderNumber,
            tx_ref: finalTxRef,
            flw_transaction_id: flwTransactionId || null,
            payment_status: 'successful' as const,
            fulfillment_status: 'paid_awaiting_design_proof',
            product_id: product.id,
            product_name: product.name,
            quantity,
            unit_price_ngn: product.priceNgn,
            total_amount_ngn: totalAmount,
            currency: 'NGN',
            customer_name: orderPayload.customer_name,
            business_name: orderPayload.business_name,
            customer_email: orderPayload.customer_email,
            customer_phone: orderPayload.customer_phone,
            delivery_address: orderPayload.delivery_address,
            delivery_state: orderPayload.delivery_state,
            preferred_card_name: orderPayload.preferred_card_name,
            verified_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          };
          try {
            sessionStorage.setItem(`chipng_inline_receipt_${orderNumber}`, JSON.stringify(receiptOrder));
          } catch {}

          trackVerifiedPurchase({
            transactionId: flwTransactionId || finalTxRef,
            orderNumber,
            productId: product.id,
            productName: product.name,
            quantity,
            value: totalAmount,
            currency: 'NGN',
            userMatch: {
              email: orderPayload.customer_email,
              phone: orderPayload.customer_phone,
            },
          });

          hasInitiatedRedirectRef.current = true;
          const qs = new URLSearchParams({
            order: orderNumber,
            tx_ref: finalTxRef,
            mode: 'inline',
          });
          if (serverAccessToken) qs.set('token', serverAccessToken);
          if (flwTransactionId) qs.set('transaction_id', flwTransactionId);
          window.location.assign(`/buy-card/payment-status?${qs.toString()}`);
        },
        onClose: () => {
          if (!paymentHandled) {
            setSubmitting(false);
            setErrorMessage(
              `Payment window was closed before completion (Order Ref: ${orderNumber}). Click "Pay with Flutterwave" to continue whenever you are ready.`
            );
          }
        },
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Unable to open Flutterwave checkout. Please check your internet connection and retry.'
      );
      setSubmitting(false);
    }
  };

  const stepsMeta: Array<{ num: 1 | 2 | 3 | 4; label: string; shortLabel: string }> = [
    { num: 1, label: 'Customer Info', shortLabel: 'Details' },
    { num: 2, label: 'Customize Card', shortLabel: 'Customize' },
    { num: 3, label: 'Design Approval', shortLabel: 'Approval' },
    { num: 4, label: 'Review & Pay', shortLabel: 'Pay' },
  ];

  const inputClass =
    'w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3.5 py-3 text-sm text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 transition-colors';
  const labelClass = 'block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#08090b] text-neutral-950 dark:text-white flex flex-col selection:bg-[#16a34a]/20 selection:text-[#16a34a]">
      <SeoHead
        title={`Checkout — ${product.name} | CHIPNG`}
        description="Complete your custom CHIPNG NFC smart business card order securely via Flutterwave."
        canonicalPath="/buy-card/checkout"
        noindex={true}
      />

      {/* Distraction-Free Dedicated Checkout Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={handleBackToCards}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cards</span>
            </button>
            <span aria-hidden="true" className="hidden sm:inline text-neutral-300 dark:text-neutral-700">
              /
            </span>
            <span className="hidden sm:inline text-sm font-extrabold tracking-tight text-neutral-950 dark:text-white whitespace-nowrap shrink-0">
              CHIPNG Checkout
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <a
              href={buildChipngWhatsAppUrl(
                `Hello CHIPNG, I have a quick question while checking out the ${product.name} (${formatNaira(product.priceNgn)}).`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppSupportClicked('checkout_header_help')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#16a34a] transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-[#16a34a]" />
              <span className="hidden sm:inline">WhatsApp Help</span>
              <span className="sm:hidden">Help</span>
            </a>

            {toggleDarkMode && (
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Toggle color theme"
                className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Full-Width 4-Step Progress Bar */}
        <div className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/90 dark:bg-[#0a0c0f]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ol className="grid grid-cols-4 gap-2 sm:gap-4" aria-label="Checkout progress">
              {stepsMeta.map((s) => {
                const isDone = step > s.num;
                const isCurrent = step === s.num;
                return (
                  <li key={s.num}>
                    <button
                      type="button"
                      disabled={!isDone || submitting}
                      onClick={() => handleJumpToStep(s.num)}
                      className={`w-full text-left flex flex-col gap-1.5 group ${
                        isDone && !submitting ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          isDone || isCurrent ? 'bg-[#16a34a]' : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                      />
                      <span
                        className={`text-xs font-semibold truncate flex items-center gap-1 ${
                          isCurrent
                            ? 'text-neutral-950 dark:text-white'
                            : isDone
                              ? 'text-[#16a34a] group-hover:underline'
                              : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 shrink-0" />}
                        <span className="hidden sm:inline">
                          {s.num}. {s.label}
                        </span>
                        <span className="sm:hidden">
                          {s.num}. {s.shortLabel}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </header>

      {/* Dedicated Full-Page Checkout Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Mobile Compact Order Strip (shown below lg) */}
        <div className="lg:hidden mb-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-4 flex items-center gap-3.5">
          <img
            src={product.images[0]}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-14 w-14 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#16a34a] truncate">{product.tierLabel}</p>
            <p className="text-sm font-bold text-neutral-950 dark:text-white truncate">{product.name}</p>
            <p className="text-sm font-extrabold text-neutral-950 dark:text-white tabular-nums mt-0.5">
              {formatNaira(totalAmount)}
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {' '}
                · Qty {quantity}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(200, q + 1))}
              className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Active Checkout Step Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-5 sm:p-8 space-y-6">
              {/* Step Context Heading */}
              <div className="flex items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <p className="text-xs font-semibold text-[#16a34a]">
                    Step {step} of 4 · Secure Order Setup
                  </p>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1">
                    {step === 1 && 'Customer & Delivery Details'}
                    {step === 2 && 'Customize Your Smart Card'}
                    {step === 3 && 'Pre-Production Design Approval'}
                    {step === 4 && 'Review Order & Pay Securely'}
                  </h1>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-medium leading-relaxed">{errorMessage}</p>
                    {savedOrderRef && (
                      <a
                        href={buildChipngWhatsAppUrl(
                          `Hello CHIPNG, I just started order ${savedOrderRef} for ${product.name} (x${quantity}) and need help completing payment.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackWhatsAppSupportClicked('checkout_error_fallback')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-[#16a34a] hover:underline"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message CHIPNG Support on WhatsApp ({CHIPNG_DISPLAY_PHONE}) with {savedOrderRef}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 1: Customer & Delivery Information */}
              {step === 1 && (
                <div className="space-y-5">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Where should we send your custom card design proof and deliver your finished CHIPNG card?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="chip-full-name" className={labelClass}>
                        Full Name *
                      </label>
                      <input
                        id="chip-full-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Chinedu Okafor"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="chip-business-name" className={labelClass}>
                        Business / Company Name
                      </label>
                      <input
                        id="chip-business-name"
                        type="text"
                        autoComplete="organization"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Apex Advisory Ltd"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="chip-email" className={labelClass}>
                        Email Address *
                      </label>
                      <input
                        id="chip-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="chip-phone" className={labelClass}>
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        id="chip-phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0801 234 5678"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="chip-state" className={labelClass}>
                        Delivery State *
                      </label>
                      <select
                        id="chip-state"
                        value={deliveryState}
                        onChange={(e) => setDeliveryState(e.target.value)}
                        className={inputClass}
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="chip-address" className={labelClass}>
                        Delivery Address *
                      </label>
                      <input
                        id="chip-address"
                        type="text"
                        required
                        autoComplete="street-address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House/Office number, street, area & landmark"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-3 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={reminderConsent}
                      onChange={(e) => setReminderConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#16a34a] focus:ring-[#16a34a]"
                    />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Optional: Save my card details so CHIPNG can send a helpful checkout reminder if I get disconnected (you can opt out anytime).
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 2: Card Customization & Logo Upload */}
              {step === 2 && (
                <div className="space-y-5">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Share your branding details. Don&apos;t worry if you&apos;re still finalizing your logo—you can also send it later on WhatsApp.
                  </p>

                  {/* Logo Upload */}
                  <div>
                    <span className={labelClass}>
                      Business Logo Upload (PNG, JPG, WEBP, SVG, PDF · Max 5MB)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                      onChange={handleLogoSelect}
                      className="hidden"
                    />

                    {!logoUrl ? (
                      <button
                        type="button"
                        disabled={logoUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-[#16a34a] bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <div className="flex flex-col items-center gap-2">
                          {logoUploading ? (
                            <Loader2 className="w-6 h-6 text-[#16a34a] animate-spin" />
                          ) : (
                            <Upload className="w-6 h-6 text-neutral-500 dark:text-neutral-400" />
                          )}
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {logoUploading ? 'Uploading your logo securely...' : 'Click to upload your logo'}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Transparent PNG or vector SVG/PDF gives the sharpest print or laser engraving
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {logoPreviewDataUrl ? (
                            <img
                              src={logoPreviewDataUrl}
                              alt="Uploaded brand logo preview"
                              className="h-14 w-14 rounded-lg object-contain bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-1.5 shrink-0"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-lg bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-950 dark:text-white truncate">
                              {logoFileName || 'Uploaded logo'}
                            </p>
                            <p className="text-xs text-[#16a34a] font-medium flex items-center gap-1 mt-0.5">
                              <Check className="w-3.5 h-3.5" /> Uploaded &amp; attached to your order
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 rounded-lg text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            aria-label="Remove uploaded logo"
                            className="p-2 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {logoError && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium">{logoError}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="chip-card-name" className={labelClass}>
                        Preferred Name on Card
                      </label>
                      <input
                        id="chip-card-name"
                        type="text"
                        value={preferredCardName}
                        onChange={(e) => setPreferredCardName(e.target.value)}
                        placeholder="e.g. Chinedu Okafor · Managing Partner"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="chip-brand-colors" className={labelClass}>
                        Brand Colors (Optional)
                      </label>
                      <input
                        id="chip-brand-colors"
                        type="text"
                        value={brandColors}
                        onChange={(e) => setBrandColors(e.target.value)}
                        placeholder="e.g. Matte Black & Gold, or #16a34a"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="chip-website" className={labelClass}>
                      Website URL (Optional)
                    </label>
                    <input
                      id="chip-website"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourbusiness.com"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="chip-ig" className={labelClass}>
                        Instagram
                      </label>
                      <input
                        id="chip-ig"
                        type="text"
                        value={instagramHandle}
                        onChange={(e) => setInstagramHandle(e.target.value)}
                        placeholder="@yourbrand"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="chip-li" className={labelClass}>
                        LinkedIn
                      </label>
                      <input
                        id="chip-li"
                        type="text"
                        value={linkedinHandle}
                        onChange={(e) => setLinkedinHandle(e.target.value)}
                        placeholder="in/yourname"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="chip-tw" className={labelClass}>
                        X / Twitter
                      </label>
                      <input
                        id="chip-tw"
                        type="text"
                        value={twitterHandle}
                        onChange={(e) => setTwitterHandle(e.target.value)}
                        placeholder="@handle"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="chip-design-pref" className={labelClass}>
                      Design Preferences &amp; Special Instructions (Optional)
                    </label>
                    <textarea
                      id="chip-design-pref"
                      rows={3}
                      value={designPreferences}
                      onChange={(e) => setDesignPreferences(e.target.value)}
                      placeholder="Tell our Lagos designers your layout preference (minimalist centered logo, front/back QR placement, job title, or team roster notes)."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="chip-special" className={labelClass}>
                      Delivery or Packaging Notes (Optional)
                    </label>
                    <input
                      id="chip-special"
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g. Call on arrival, office hours 9am–5pm"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Pre-Production Design Proof Assurance */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#16a34a]">
                      <Sparkles className="w-4 h-4" /> Pre-Production Proof Guarantee
                    </div>
                    <h2
                      className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-tight"
                      style={{ textWrap: 'balance' }}
                    >
                      YOUR BRAND. YOUR CARD. YOUR APPROVAL.
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      We never print or laser-engrave your card blindly. Once your order is confirmed, our design team prepares a crisp custom card layout using your details and sends the digital proof to{' '}
                      <span className="font-semibold text-neutral-950 dark:text-white">
                        {customerPhone || 'your WhatsApp'}
                      </span>{' '}
                      and{' '}
                      <span className="font-semibold text-neutral-950 dark:text-white">
                        {customerEmail || 'your email'}
                      </span>
                      .
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-200/80 dark:border-neutral-800">
                      {[
                        {
                          title: '01. Proof Prepared',
                          desc: 'Our Lagos studio designs your exact front & back layout.',
                        },
                        {
                          title: '02. You Review',
                          desc: 'Request edits on logo sizing, alignment, or text for free.',
                        },
                        {
                          title: '03. Print & Dispatch',
                          desc: 'Production begins only after you give explicit sign-off.',
                        },
                      ].map((item) => (
                        <div key={item.title} className="space-y-1">
                          <p className="text-xs font-bold text-neutral-950 dark:text-white">{item.title}</p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customization Snapshot */}
                  <div className="border-t border-b border-neutral-200 dark:border-neutral-800 py-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        Design Brief Summary
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-[#16a34a] hover:underline cursor-pointer"
                      >
                        Edit customization
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">Name on card</span>
                      <span className="font-semibold text-neutral-950 dark:text-white text-right truncate">
                        {preferredCardName.trim() || customerName.trim()}
                      </span>
                      {businessName.trim() && (
                        <>
                          <span className="text-neutral-500 dark:text-neutral-400">Company</span>
                          <span className="font-semibold text-neutral-950 dark:text-white text-right truncate">
                            {businessName.trim()}
                          </span>
                        </>
                      )}
                      <span className="text-neutral-500 dark:text-neutral-400">Logo attached</span>
                      <span className="font-semibold text-neutral-950 dark:text-white text-right truncate">
                        {logoUrl ? `Yes (${logoFileName || 'uploaded'})` : 'Will share on WhatsApp'}
                      </span>
                      {brandColors.trim() && (
                        <>
                          <span className="text-neutral-500 dark:text-neutral-400">Brand colors</span>
                          <span className="font-semibold text-neutral-950 dark:text-white text-right truncate">
                            {brandColors.trim()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border border-[#16a34a]/35 bg-[#16a34a]/5 p-4 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={designApprovalAck}
                      onChange={(e) => setDesignApprovalAck(e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-[#16a34a] focus:ring-[#16a34a]"
                    />
                    <span className="text-sm font-medium text-neutral-900 dark:text-white leading-relaxed">
                      I understand CHIPNG will send my custom card design proof for approval before production starts.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 4: Final Review & Flutterwave Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Confirm your shipping and customization details below, then pay securely via Flutterwave (Card, Bank Transfer, or USSD).
                  </p>

                  {/* Customer & Delivery Recap */}
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-t border-b border-neutral-200 dark:border-neutral-800 text-sm">
                    <div className="py-4 flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                          Customer &amp; Delivery
                        </p>
                        <p className="font-bold text-neutral-950 dark:text-white">{customerName}</p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">
                          {customerEmail} · {customerPhone}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">
                          {deliveryAddress}, {deliveryState}, Nigeria
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-[#16a34a] hover:underline shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="py-4 flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                          Card Customization
                        </p>
                        <p className="font-bold text-neutral-950 dark:text-white">
                          {preferredCardName.trim() || customerName.trim()}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300">
                          Logo: {logoUrl ? logoFileName || 'Attached' : 'Will send via WhatsApp'}
                          {brandColors.trim() ? ` · Colors: ${brandColors.trim()}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-[#16a34a] hover:underline shrink-0 cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Mobile Price Summary (Desktop shows in right sidebar) */}
                  <div className="lg:hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>
                        Subtotal ({quantity} × {formatNaira(product.priceNgn)})
                      </span>
                      <span className="font-semibold text-neutral-950 dark:text-white tabular-nums">
                        {formatNaira(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Design Proof &amp; Setup</span>
                      <span className="font-semibold text-[#16a34a]">Included</span>
                    </div>
                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2.5 flex items-baseline justify-between">
                      <span className="font-bold text-neutral-950 dark:text-white">Total Payable (NGN)</span>
                      <span className="text-xl font-extrabold text-neutral-950 dark:text-white tabular-nums">
                        {formatNaira(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Assurance Notice */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                      <span>Encrypted Flutterwave checkout (Card, Bank Transfer, USSD)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                      <span>Design proof sent before production starts</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Step Controls */}
              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => {
                      setErrorMessage(null);
                      setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
                    }}
                    className="px-5 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[46px] whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBackToCards}
                    className="px-4 py-3 rounded-xl text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors flex items-center justify-center sm:justify-start gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft className="w-4 h-4" /> Choose a different card
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={logoUploading}
                    className="px-7 py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[48px] whitespace-nowrap shadow-sm"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleProceedToFlutterwave}
                    className="px-7 py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[50px] whitespace-nowrap shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Opening Flutterwave Checkout...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Pay {formatNaira(totalAmount)} with Flutterwave
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Persistent Order Summary & Card Switcher */}
          <aside className="lg:col-span-5 lg:sticky lg:top-32 space-y-5">
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden">
              {/* Product Image Header */}
              <div className="aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
                <img
                  src={product.images[0]}
                  alt={`${product.name} — CHIPNG NFC business card`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Product Info & Card Switcher */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#16a34a]">{product.tierLabel}</p>
                    <h2 className="text-lg font-extrabold text-neutral-950 dark:text-white mt-0.5">
                      {product.name}
                    </h2>
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 tabular-nums mt-0.5">
                      {formatNaira(product.priceNgn)} per card
                    </p>
                  </div>

                  {allProducts.length > 1 && (
                    <div>
                      <label
                        htmlFor="chip-switch-product"
                        className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1"
                      >
                        Switch card edition
                      </label>
                      <select
                        id="chip-switch-product"
                        value={product.slug}
                        disabled={submitting}
                        onChange={(e) => {
                          const next = allProducts.find((p) => p.slug === e.target.value);
                          if (next) onSelectProduct(next);
                        }}
                        className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-2.5 text-xs sm:text-sm font-medium text-neutral-900 dark:text-white focus:border-[#16a34a] focus:outline-none"
                      >
                        {allProducts.map((p) => (
                          <option key={p.id} value={p.slug}>
                            {p.name} — {formatNaira(p.priceNgn)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between py-3 border-t border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quantity</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={submitting}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm tabular-nums text-neutral-950 dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={submitting}
                      onClick={() => setQuantity((q) => Math.min(200, q + 1))}
                      className="h-9 w-9 rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Itemized Price Breakdown */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>
                      Subtotal ({quantity} × {formatNaira(product.priceNgn)})
                    </span>
                    <span className="font-semibold text-neutral-950 dark:text-white tabular-nums">
                      {formatNaira(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Custom Design Proof &amp; Setup</span>
                    <span className="font-semibold text-[#16a34a]">Included</span>
                  </div>
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Delivery Destination</span>
                    <span className="font-medium text-neutral-900 dark:text-neutral-200">
                      {deliveryState}, Nigeria
                    </span>
                  </div>
                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex items-baseline justify-between">
                    <span className="font-bold text-neutral-950 dark:text-white">Total Payable (NGN)</span>
                    <span className="text-2xl font-extrabold text-neutral-950 dark:text-white tabular-nums">
                      {formatNaira(totalAmount)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Final price is verified against CHIPNG&apos;s live catalog before Flutterwave payment authorization.
                  </p>
                </div>

                {/* Live Customization Preview if entered */}
                {(preferredCardName.trim() || logoPreviewDataUrl || logoUrl) && (
                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex items-center gap-3">
                    {logoPreviewDataUrl ? (
                      <img
                        src={logoPreviewDataUrl}
                        alt="Uploaded logo"
                        className="h-10 w-10 rounded-lg object-contain bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-1 shrink-0"
                      />
                    ) : null}
                    <div className="min-w-0 text-xs">
                      <p className="text-neutral-500 dark:text-neutral-400">Card Personalization</p>
                      <p className="font-semibold text-neutral-950 dark:text-white truncate">
                        {preferredCardName.trim() || customerName.trim() || 'Custom Layout'}
                        {logoUrl ? ' · Logo Attached' : ''}
                      </p>
                    </div>
                  </div>
                )}

                {/* Trust Guarantees */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>Pre-production design proof sent for approval before printing</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>{product.productionAndDelivery}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MessageCircle className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                    <span>Direct Lagos studio WhatsApp support on {CHIPNG_DISPLAY_PHONE}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
