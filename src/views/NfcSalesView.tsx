'use client';

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Smartphone,
  Wifi,
  Share2,
  Palette,
  Globe,
  UserPlus,
  RefreshCw,
  Award,
  Briefcase,
  ShieldCheck,
  Truck,
  MessageCircle,
  Mail,
  MapPin,
  Star,
  Lock,
  Play,
  ExternalLink,
  QrCode,
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  X,
  ZoomIn,
} from 'lucide-react';
import { SeoHead } from '../components/seo/SeoHead';
import { BUY_CARD_META, BUY_CARD_SCHEMA_JSON_LD } from '../utils/buyCardSeo';
import {
  CANONICAL_BUY_CARD_PRODUCTS,
  PRODUCT_COMPARISON_ROWS,
  BUY_CARD_FAQS,
  CLIENT_PROOF_GALLERY,
  BuyCardProduct,
  ClientProofItem,
  formatNaira,
  buildChipngWhatsAppUrl,
  CHIPNG_DISPLAY_PHONE,
  CHIPNG_SUPPORT_EMAIL,
} from '../data/buyCardCatalog';
import { initTikTokPixel } from '../utils/tiktokPixel';
import {
  trackBuyCardViewContent,
  trackSelectProduct,
  trackAddToCart,
  trackWhatsAppSupportClicked,
  trackFaqOpened,
} from '../utils/conversionAnalytics';
import { PaymentStatusView } from '../components/buy-card/PaymentStatusView';

const BuyCardCheckoutScreen = lazy(() =>
  import('../components/buy-card/BuyCardCheckoutScreen').then((m) => ({
    default: m.BuyCardCheckoutScreen,
  }))
);

interface NfcSalesViewProps {
  onNavigate?: (view: any) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  session?: any;
}

const REAL_TIKTOK_DEMOS = [
  {
    id: '7628228439719398664',
    title: '1-Second Tap Demo on iPhone & Android',
    subtitle: 'Opens directly in the browser—zero app download needed',
    poster: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.28640138450754493.jpeg',
  },
  {
    id: '7680709423232208146',
    title: 'Scratch-Proof Laser-Engraved Metal Cards',
    subtitle: 'Finished Nigerian founder & corporate cards from our Lekki studio',
    poster: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9650784343957072.jpeg',
  },
];

const VERIFIED_CLIENT_STORIES = [
  {
    name: 'Tony Zola',
    role: 'Custom Gold Metal Card Buyer',
    location: 'Kano (Shipped via GIG Logistics)',
    quote:
      'Excellent work on the metal card. The finishing is clean, the card feels strong and premium, and the overall quality is impressive. It looks much more luxurious than a regular plastic ATM card. The customization and attention to detail are also top-notch. Highly recommended for anyone looking for a durable and stylish metal card.',
    proofImage: '/assets/aistudio/IMG_2654_22e94953.jpeg',
    proofLabel: '5-Star Review Screenshot',
  },
  {
    name: 'Samirah Ade-Adebiyi',
    role: 'Managing Director · Corporate Team Rollout',
    location: 'Lagos · ₦200k+ Executive & Team Orders',
    quote:
      'We received clean softcopy card designs on WhatsApp to inspect and approve before printing. Having our Managing Director and leadership cards branded consistently with QR backup made team onboarding effortless.',
    proofImage: '/assets/aistudio/IMG_2647_cf6c75ad.jpeg',
    proofLabel: 'Verified Corporate Proof',
  },
  {
    name: 'Star Capital',
    role: 'Financial Services Team',
    location: 'Lagos · Same-Day Courier Delivery',
    quote:
      'Live Lagos rider tracking right to our office door with zero guesswork. Clients simply tap our card on iPhone or Android and save our contact details in one second without downloading any app.',
    proofImage: '/assets/aistudio/IMG_4323_7e949315.png',
    proofLabel: 'Live Lagos Delivery Receipt',
  },
];

const WHY_CHOOSE_ITEMS = [
  {
    icon: Wifi,
    title: 'Works on every iPhone & Android in 1 second',
    desc: 'One gentle tap opens your business profile immediately—plus a built-in QR code lets older phones scan with their camera.',
  },
  {
    icon: Smartphone,
    title: 'Your clients never need an app',
    desc: 'Your profile opens straight inside Safari or Chrome. Zero downloads, zero logins, zero awkward friction during meetings.',
  },
  {
    icon: Palette,
    title: 'Approve your design on WhatsApp before printing',
    desc: 'Upload your logo at checkout. Our Lekki designers send your softcopy proof first—we only print after you say approved.',
  },
  {
    icon: Award,
    title: 'Scratch-proof finishes that never fade',
    desc: 'Choose waterproof ceramic white PVC, raised anti-scratch matte black UV PVC, or solid stainless steel with permanent laser engraving.',
  },
  {
    icon: UserPlus,
    title: 'One-tap contact saving into their phonebook',
    desc: 'Clients save your phone number, WhatsApp, email, company, and job title into their contacts in a single click.',
  },
  {
    icon: RefreshCw,
    title: 'Update your details anytime without reprinting',
    desc: 'Changed phone numbers, office address, or social handles? Edit your digital profile in seconds—your physical card updates live.',
  },
  {
    icon: Truck,
    title: '24–48 hr Lagos delivery & 2–4 day nationwide',
    desc: 'Dispatched fast from Lekki Phase 1 with live Lagos courier tracking, plus insured DHL & GIG Logistics shipping to all 36 states.',
  },
  {
    icon: ShieldCheck,
    title: '12-Month Free NFC Chip Replacement Warranty',
    desc: 'If your NFC chip ever stops scanning under normal use within 12 months—or arrives damaged—we replace your card free of charge.',
  },
  {
    icon: Briefcase,
    title: 'No monthly fee for core networking',
    desc: 'Pay once for your card and enjoy lifetime hosting of your core digital profile, plus 3 months free CHIP Pro analytics.',
  },
];

const DEMO_STEPS = [
  {
    step: 'STEP 1: TAP.',
    shortLabel: 'Tap',
    headline: 'Tap your CHIPNG card against any iPhone or Android.',
    detail:
      'Hold your card near the top back of an iPhone or the center back of an Android phone. It responds in under 1 second—no battery or charging ever needed.',
    phoneStatus: 'Card Detected in 1s · chipng.com',
  },
  {
    step: 'STEP 2: CONNECT.',
    shortLabel: 'Connect',
    headline: 'Your business profile opens instantly in their browser.',
    detail:
      'Your branded CHIPNG profile opens right inside Safari or Chrome. Clients never download an app—and older phones can scan the printed QR backup with their camera.',
    phoneStatus: 'Opening Profile · No App Needed',
  },
  {
    step: 'STEP 3: SHARE.',
    shortLabel: 'Share',
    headline: 'They save your contact, message you on WhatsApp, or visit your site.',
    detail:
      'One tap saves your phone number, email, role, and company straight into their phonebook, with direct buttons for WhatsApp, Instagram, LinkedIn, and your website.',
    phoneStatus: 'Contact Saved · Ready to Follow Up',
  },
];

type AudienceFilter = 'all' | 'individual' | 'executive' | 'business';

export default function NfcSalesView({
  onNavigate,
  isDarkMode = false,
  toggleDarkMode = () => {},
  session,
}: NfcSalesViewProps) {
  // Detect dedicated Payment Status route or Flutterwave callback parameters
  const isPaymentStatusRoute = (() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    if (path === '/buy-card/payment-status' || path === '/buycard/payment-status') return true;
    const params = new URLSearchParams(window.location.search);
    return Boolean(params.get('tx_ref') || params.get('transaction_id') || (params.get('order') && params.get('token')));
  })();

  if (isPaymentStatusRoute) {
    return (
      <PaymentStatusView
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />
    );
  }

  return (
    <BuyCardSalesExperience
      onNavigate={onNavigate}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      session={session}
    />
  );
}

function BuyCardSalesExperience({
  isDarkMode = false,
  toggleDarkMode = () => {},
}: NfcSalesViewProps) {
  const isCheckoutPath = (pathname: string) => {
    const p = pathname.toLowerCase().replace(/\/+$/, '');
    return p === '/buy-card/checkout' || p === '/buycard/checkout';
  };

  const resolveProductFromSearch = (catalog: BuyCardProduct[], search: string): BuyCardProduct => {
    try {
      const slug = new URLSearchParams(search).get('product')?.trim().toLowerCase();
      if (slug) {
        const match = catalog.find(
          (item) => item.slug.toLowerCase() === slug || item.id.toLowerCase() === slug
        );
        if (match) return match;
      }
    } catch {}
    return catalog.find((item) => item.recommended) || catalog[0];
  };

  const [products, setProducts] = useState<BuyCardProduct[]>(CANONICAL_BUY_CARD_PRODUCTS);
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<string, number>>({});
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');
  const [activeDemoStep, setActiveDemoStep] = useState<number>(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(BUY_CARD_FAQS[0].id);
  const [isCheckoutScreen, setIsCheckoutScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isCheckoutPath(window.location.pathname) : false
  );
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>(() =>
    typeof window !== 'undefined'
      ? resolveProductFromSearch(CANONICAL_BUY_CARD_PRODUCTS, window.location.search).slug
      : (CANONICAL_BUY_CARD_PRODUCTS.find((p) => p.recommended) || CANONICAL_BUY_CARD_PRODUCTS[0]).slug
  );
  const [activeVideoIds, setActiveVideoIds] = useState<Record<string, boolean>>({});
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(false);
  const [referrer, setReferrer] = useState<string | null>(null);
  const [lightboxProof, setLightboxProof] = useState<ClientProofItem | null>(null);

  const heroCtaRef = useRef<HTMLDivElement | null>(null);

  // Sync browser back/forward navigation between /buy-card and /buy-card/checkout
  useEffect(() => {
    const handlePopState = () => {
      const onCheckout = isCheckoutPath(window.location.pathname);
      setIsCheckoutScreen(onCheckout);
      if (onCheckout) {
        const resolved = resolveProductFromSearch(products, window.location.search);
        setSelectedProductSlug(resolved.slug);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Close proof lightbox on Escape
  useEffect(() => {
    if (!lightboxProof) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxProof(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxProof]);

  // Initialize scoped Buy-Card TikTok Pixel + unified analytics + live Supabase catalog hydration
  useEffect(() => {
    initTikTokPixel();

    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setReferrer(refParam.trim());
    }

    let cancelled = false;
    fetch('/api/buy-card/catalog')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && Array.isArray(json?.products) && json.products.length > 0) {
          setProducts(json.products);
        }
      })
      .catch(() => {});

    trackBuyCardViewContent(30000);

    // Preload checkout screen chunk during idle time
    const idleTimer = setTimeout(() => {
      import('../components/buy-card/BuyCardCheckoutScreen');
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(idleTimer);
    };
  }, []);

  // Gentle auto-cycle for 3-step NFC demonstration
  useEffect(() => {
    if (isCheckoutScreen) return;
    const interval = setInterval(() => {
      setActiveDemoStep((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isCheckoutScreen]);

  // Show slim mobile sticky CTA once hero CTA scrolls out of view
  useEffect(() => {
    if (isCheckoutScreen) return;
    const target = heroCtaRef.current;
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        setShowStickyMobileCta(!entries[0]?.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [isCheckoutScreen]);

  const lowestPrice = Math.min(...products.map((p) => p.priceNgn).filter((n) => n > 0), 30000);

  const filteredProducts =
    audienceFilter === 'all'
      ? products
      : products.filter((p) => p.audienceTag === audienceFilter);

  const selectedProduct =
    products.find((p) => p.slug === selectedProductSlug) ||
    products.find((p) => p.recommended) ||
    products[0];

  const whitePvcProduct = products.find((p) => p.slug === 'pvc-nfc-card') || products[0];
  const blackPvcProduct = products.find((p) => p.slug === 'premium-pvc-nfc-card') || products[1];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const buildCheckoutUrl = (productSlug: string) => {
    const qs = new URLSearchParams({ product: productSlug });
    if (referrer) qs.set('ref', referrer);
    const basePath =
      typeof window !== 'undefined' && window.location.pathname.toLowerCase().startsWith('/buycard')
        ? '/buycard/checkout'
        : '/buy-card/checkout';
    return `${basePath}?${qs.toString()}`;
  };

  const handleSelectProduct = (product: BuyCardProduct) => {
    trackSelectProduct({
      id: product.id,
      name: product.name,
      price: product.priceNgn,
      category: product.category,
    });
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.priceNgn,
      quantity: 1,
      category: product.category,
    });
    setSelectedProductSlug(product.slug);
    setIsCheckoutScreen(true);
    try {
      window.history.pushState({ buyCardCheckout: true, product: product.slug }, '', buildCheckoutUrl(product.slug));
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } catch {}
  };

  const handleSwitchProductInCheckout = (nextProduct: BuyCardProduct) => {
    setSelectedProductSlug(nextProduct.slug);
    try {
      window.history.replaceState(
        { buyCardCheckout: true, product: nextProduct.slug },
        '',
        buildCheckoutUrl(nextProduct.slug)
      );
    } catch {}
  };

  const handleExitCheckout = () => {
    setIsCheckoutScreen(false);
    try {
      const qs = new URLSearchParams();
      if (referrer) qs.set('ref', referrer);
      const basePath = window.location.pathname.toLowerCase().startsWith('/buycard')
        ? '/buycard'
        : '/buy-card';
      const targetUrl = qs.toString() ? `${basePath}?${qs.toString()}` : basePath;
      window.history.pushState({}, '', targetUrl);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } catch {}
  };

  const handleToggleFaq = (faqId: string, question: string) => {
    const opening = openFaqId !== faqId;
    setOpenFaqId(opening ? faqId : null);
    if (opening) {
      trackFaqOpened(faqId, question);
    }
  };

  // Dedicated Full-Page Checkout Screen (not a popup modal)
  if (isCheckoutScreen && selectedProduct) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-neutral-50 dark:bg-[#08090b] text-neutral-600 dark:text-neutral-300 flex items-center justify-center text-sm font-semibold">
            Loading CHIPNG Checkout...
          </div>
        }
      >
        <BuyCardCheckoutScreen
          product={selectedProduct}
          allProducts={products}
          onSelectProduct={handleSwitchProductInCheckout}
          onBack={handleExitCheckout}
          referrer={referrer}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </Suspense>
    );
  }

  const activeDemo = DEMO_STEPS[activeDemoStep];

  return (
    <div className="min-h-screen bg-white dark:bg-[#08090b] text-neutral-950 dark:text-white selection:bg-[#16a34a]/20 selection:text-[#16a34a]">
      <SeoHead
        title={BUY_CARD_META.title}
        description={BUY_CARD_META.description}
        canonicalUrl={BUY_CARD_META.canonical}
        image={BUY_CARD_META.image}
        ogType="product"
        schemaJsonLd={BUY_CARD_SCHEMA_JSON_LD}
      />

      {/* ================================================================
          CONVERSION-LOCKED FUNNEL HEADER (Zero Distracting Exit Links)
         ================================================================ */}
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-white/95 dark:bg-[#08090b]/95 backdrop-blur-md border-b border-neutral-200/90 dark:border-neutral-800/90">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-neutral-950 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <img
              src="/chipng_3d_logo.jpg"
              alt="CHIPNG"
              className="h-7 w-7 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800"
            />
            <span>CHIPNG</span>
          </button>

          {/* Zone 2: In-Page Anchor Navigation Only (No Blog/Company/Home Exit Leaks) */}
          <nav
            aria-label="Buy Card page sections"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600 dark:text-neutral-300"
          >
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('select-card')}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Compare Cards
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('client-proofs')}
              className="hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Real Client Proofs
            </button>
          </nav>

          {/* Zone 3: WhatsApp Order/Help Escape Hatch + Primary Action */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href={buildChipngWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppSupportClicked('funnel_header_whatsapp')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-[#16a34a] hover:text-[#16a34a] transition-colors whitespace-nowrap shrink-0 min-h-[38px]"
            >
              <MessageCircle className="w-4 h-4 text-[#16a34a]" />
              <span className="hidden sm:inline">WhatsApp Order</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => scrollToSection('select-card')}
              className="px-4 py-2 rounded-lg bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
            >
              Order Card
            </button>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle color theme"
              className="h-9 w-9 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* ================================================================
            SECTION 1: HIGH-CONVERTING HERO (ABOVE-THE-FOLD OPTIMIZED)
           ================================================================ */}
        <section className="relative overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Copy Column */}
              <div className="lg:col-span-7 space-y-6">
                <p className="text-xs font-semibold tracking-wide text-[#16a34a]">
                  CHIPNG Smart NFC Business Cards · Crafted in Lekki, Lagos
                </p>

                <h1
                  className="text-3xl sm:text-5xl lg:text-[3.3rem] font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.06]"
                  style={{ textWrap: 'balance' }}
                >
                  YOUR BUSINESS DESERVES MORE THAN A PAPER BUSINESS CARD.
                </h1>

                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
                  Share your phone number, WhatsApp, website, and social media in 1 second on every iPhone &amp; Android—no app needed. Approve your custom card proof on WhatsApp before we print.
                </p>

                {/* Primary & Secondary CTAs — Visible Above the Fold on Mobile */}
                <div ref={heroCtaRef} className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => scrollToSection('select-card')}
                    className="px-7 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer min-h-[52px] whitespace-nowrap"
                  >
                    GET YOUR NFC CARD
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('client-proofs')}
                    className="px-7 py-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-white text-neutral-900 dark:text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[52px] whitespace-nowrap"
                  >
                    SEE REAL CLIENT CARDS
                  </button>
                </div>

                {/* Clear Pricing Entry Point, Delivery Speed & 12-Month Warranty Strip */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">One-Time Price</p>
                    <p className="font-extrabold text-sm text-neutral-950 dark:text-white tabular-nums mt-0.5">
                      From {formatNaira(lowestPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Lagos Delivery</p>
                    <p className="font-bold text-sm text-neutral-950 dark:text-white mt-0.5">24–48 Hours</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Nationwide</p>
                    <p className="font-bold text-sm text-neutral-950 dark:text-white mt-0.5">DHL &amp; GIG (2–4d)</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Chip Warranty</p>
                    <p className="font-bold text-sm text-[#16a34a] mt-0.5">12-Mo Free Replace</p>
                  </div>
                </div>
              </div>

              {/* Right Visual Column: NFC Card + Smartphone Tap Demonstration */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0f1115] p-5 sm:p-6 overflow-hidden">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800">
                    <img
                      src={blackPvcProduct?.images[0] || CANONICAL_BUY_CARD_PRODUCTS[1].images[0]}
                      alt="CHIPNG Matte Black Custom NFC Smart Business Card"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45 }}
                      className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3.5 shadow-lg flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                            Works on iPhone &amp; Android in 1 Second
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            Save Contact · WhatsApp · Website · QR Backup
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#16a34a] shrink-0 whitespace-nowrap">No App</span>
                    </motion.div>
                  </div>

                  {/* Quick Jump Material Strip */}
                  <div className="grid grid-cols-3 gap-2.5 mt-4">
                    {[
                      {
                        label: 'White PVC',
                        price: whitePvcProduct?.priceNgn || 30000,
                        img: whitePvcProduct?.images[0],
                        product: whitePvcProduct,
                      },
                      {
                        label: 'Matte Black PVC',
                        price: blackPvcProduct?.priceNgn || 35000,
                        img: blackPvcProduct?.images[0],
                        product: blackPvcProduct,
                      },
                      {
                        label: 'Metal Laser',
                        price: products[2]?.priceNgn || 50000,
                        img: products[2]?.images[0],
                        product: products[2],
                      },
                    ].map((thumb) => (
                      <button
                        key={thumb.label}
                        type="button"
                        onClick={() => scrollToSection('select-card')}
                        className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2 text-left hover:border-[#16a34a] transition-colors cursor-pointer"
                      >
                        <div className="aspect-[16/10] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 mb-1.5">
                          <img
                            src={thumb.img}
                            alt={`CHIPNG ${thumb.label} NFC business card`}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">{thumb.label}</p>
                        <p className="text-[11px] font-semibold text-[#16a34a] tabular-nums">
                          {formatNaira(thumb.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: PRODUCT SELECTION, ₦30K VS ₦35K CLARITY & GUARANTEE STRIP
           ================================================================ */}
        <section
          id="select-card"
          className="py-14 sm:py-20 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#0b0d10]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Compact Delivery Speed + 12-Month Chip Warranty Strip Directly Above Card Selection */}
            <div className="mb-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-neutral-950 dark:text-white">24–48 hr Lagos Delivery</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Live rider tracking straight from our Lekki Phase 1 studio.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-neutral-950 dark:text-white">2–4 Day Nationwide Shipping</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Insured DHL &amp; GIG Logistics to Abuja, PH, Kano &amp; all 36 states.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-neutral-950 dark:text-white">12-Month Chip Warranty</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Free replacement if your NFC chip ever stops scanning under normal use.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-neutral-950 dark:text-white">Approve Proof Before Print</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    We send your softcopy layout on WhatsApp before printing or engraving.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-[#16a34a]">
                  One-Time Payment · No Monthly Subscription Required
                </p>
                <h2
                  className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1.5"
                  style={{ textWrap: 'balance' }}
                >
                  Choose your CHIPNG smart business card.
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
                  Every card works on iPhone &amp; Android in 1 second, includes a backup QR code, WhatsApp proof approval before production, and our 12-month chip warranty.
                </p>
              </div>

              {/* Interactive Audience Filter */}
              <div
                role="tablist"
                aria-label="Filter cards by customer type"
                className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-neutral-200/70 dark:bg-neutral-900"
              >
                {[
                  { key: 'all' as AudienceFilter, label: 'All Cards' },
                  { key: 'individual' as AudienceFilter, label: 'PVC (₦30k–₦35k)' },
                  { key: 'executive' as AudienceFilter, label: 'Metal (₦50k+)' },
                  { key: 'business' as AudienceFilter, label: 'Teams (11 Cards)' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={audienceFilter === tab.key}
                    onClick={() => setAudienceFilter(tab.key)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer min-h-[38px] whitespace-nowrap ${
                      audienceFilter === tab.key
                        ? 'bg-white dark:bg-[#181b22] text-neutral-950 dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Second Clarity Callout: ₦30,000 White PVC vs. ₦35,000 Matte Black PVC */}
            {(audienceFilter === 'all' || audienceFilter === 'individual') && (
              <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <h3 className="text-sm sm:text-base font-extrabold text-neutral-950 dark:text-white">
                    Deciding between ₦30,000 and ₦35,000 PVC? Here&apos;s what the extra ₦5,000 buys:
                  </h3>
                  <span className="text-xs font-semibold text-[#16a34a] whitespace-nowrap">
                    Same 1-second NFC tap · Different finish
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 text-xs sm:text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-bold text-neutral-950 dark:text-white">
                        Standard White PVC — <span className="tabular-nums">{formatNaira(whitePvcProduct?.priceNgn || 30000)}</span>
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Clean ceramic white finish with full-color front &amp; back printing. Pick this if your logo uses bright colors that look sharpest on a white background.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4 md:border-l md:border-neutral-200 md:dark:border-neutral-800 md:pl-5">
                    <div className="space-y-1">
                      <p className="font-bold text-neutral-950 dark:text-white">
                        Premium Matte Black PVC — <span className="tabular-nums text-[#16a34a]">{formatNaira(blackPvcProduct?.priceNgn || 35000)}</span>
                        <span className="text-xs font-semibold text-[#16a34a]"> (Most Popular · +₦5,000)</span>
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Upgrades to a sleek Matte Black soft-touch card with raised, waterproof UV ink and an anti-scratch coat that resists wallet scuffs and fingerprints.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredProducts.map((product) => {
                const activeIdx = activeImageByProduct[product.id] || 0;
                const currentImg = product.images[activeIdx] || product.images[0];
                return (
                  <article
                    key={product.id}
                    className={`flex flex-col rounded-2xl border bg-white dark:bg-[#0f1115] overflow-hidden transition-shadow hover:shadow-md ${
                      product.recommended
                        ? 'border-[#16a34a] ring-1 ring-[#16a34a]/25'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {/* Product Image + Gallery Thumbnails */}
                    <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                      <img
                        src={currentImg}
                        alt={`${product.name} — CHIPNG NFC business card`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {product.images.length > 1 && (
                        <div className="absolute bottom-3 left-3 flex gap-1.5">
                          {product.images.slice(0, 4).map((imgUrl, idx) => (
                            <button
                              key={imgUrl}
                              type="button"
                              aria-label={`View photo ${idx + 1} of ${product.name}`}
                              onClick={() =>
                                setActiveImageByProduct((prev) => ({ ...prev, [product.id]: idx }))
                              }
                              className={`h-8 w-8 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                activeIdx === idx
                                  ? 'border-[#16a34a] scale-105'
                                  : 'border-white/75 opacity-85 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Body */}
                    <div className="flex-1 p-6 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-[#16a34a]">
                            {product.tierLabel}
                          </p>
                          <h3 className="text-lg font-extrabold text-neutral-950 dark:text-white mt-1">
                            {product.name}
                          </h3>
                          <p className="text-2xl font-extrabold text-neutral-950 dark:text-white tabular-nums mt-1">
                            {formatNaira(product.priceNgn)}
                          </p>
                        </div>

                        {product.upgradeHighlight && (
                          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-900 rounded-xl px-3 py-2.5 leading-relaxed">
                            {product.upgradeHighlight}
                          </p>
                        )}

                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {product.shortDescription}
                        </p>

                        <ul className="space-y-2 pt-1">
                          {product.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                              <Check className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
                          <p className="font-medium text-neutral-700 dark:text-neutral-300">
                            {product.customizationNote}
                          </p>
                          <p>{product.productionAndDelivery}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectProduct(product)}
                          className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[48px] whitespace-nowrap ${
                            product.recommended
                              ? 'bg-[#16a34a] hover:bg-[#15803d] text-white'
                              : 'bg-neutral-950 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950'
                          }`}
                        >
                          SELECT THIS CARD
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Product Comparison Table */}
            <div className="mt-12 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-extrabold text-neutral-950 dark:text-white">
                  Compare CHIPNG Smart Card Editions Side-by-Side
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Every card works on iPhone &amp; Android in 1 second, includes a WhatsApp softcopy proof before print, and carries our 12-month free chip warranty.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[660px]">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-bold">
                      <th className="py-3.5 px-5">What Matters</th>
                      <th className="py-3.5 px-5">White PVC (₦30k)</th>
                      <th className="py-3.5 px-5 text-[#16a34a]">Matte Black PVC (₦35k)</th>
                      <th className="py-3.5 px-5">Metal Editions (₦50k+)</th>
                      <th className="py-3.5 px-5">Team Pack (₦300k)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                    {PRODUCT_COMPARISON_ROWS.map((row) => (
                      <tr key={row.feature}>
                        <td className="py-3.5 px-5 font-semibold text-neutral-950 dark:text-white">
                          {row.feature}
                        </td>
                        <td className="py-3.5 px-5 text-neutral-600 dark:text-neutral-300 tabular-nums">
                          {row.pvc}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-neutral-950 dark:text-white bg-[#16a34a]/[0.04] tabular-nums">
                          {row.premiumPvc}
                        </td>
                        <td className="py-3.5 px-5 text-neutral-600 dark:text-neutral-300 tabular-nums">
                          {row.metal}
                        </td>
                        <td className="py-3.5 px-5 text-neutral-600 dark:text-neutral-300 tabular-nums">
                          {row.corporate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: REAL NIGERIAN CLIENT PROOFS & WHATSAPP RECEIPTS
           ================================================================ */}
        <section
          id="client-proofs"
          className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold text-[#16a34a]">
                  Verified Orders, Reviews &amp; Delivery Receipts
                </p>
                <h2
                  className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1.5"
                  style={{ textWrap: 'balance' }}
                >
                  Real Nigerian clients. Real WhatsApp receipts. Real deliveries.
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
                  No stock quotes or invented numbers—inspect actual WhatsApp reviews, live Lagos rider deliveries, Kano GIG waybills, and repeat corporate staff orders.
                </p>
              </div>
              <a
                href="https://g.page/r/CZGM0zQdEiY7EAE/review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#16a34a] hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                Read Google Reviews <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* 3 Attributable Verified Nigerian Client Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VERIFIED_CLIENT_STORIES.map((story) => (
                <blockquote
                  key={story.name}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#16a34a]" aria-label="5 out of 5 stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{story.proofLabel}</span>
                    </div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>
                  <footer className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-950 dark:text-white truncate">{story.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {story.role} · {story.location}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const match = CLIENT_PROOF_GALLERY.find((p) => p.image === story.proofImage);
                        if (match) setLightboxProof(match);
                      }}
                      aria-label={`Inspect WhatsApp proof from ${story.name}`}
                      className="h-11 w-11 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0 hover:border-[#16a34a] transition-colors cursor-pointer"
                    >
                      <img
                        src={story.proofImage}
                        alt={`Proof screenshot for ${story.name}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  </footer>
                </blockquote>
              ))}
            </div>

            {/* Full 8-Screenshot Real WhatsApp Proof Gallery (Tap any card to zoom) */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-neutral-950 dark:text-white">
                  Unedited WhatsApp Reviews, Softcopy Proofs &amp; Delivery Receipts
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Tap any screenshot to view full size
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {CLIENT_PROOF_GALLERY.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLightboxProof(item)}
                    className="group text-left rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden hover:border-[#16a34a] transition-colors cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-[4/5] bg-neutral-950 overflow-hidden">
                      <img
                        src={item.image}
                        alt={`${item.tag} — ${item.title}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-2.5 right-2.5 h-8 w-8 rounded-lg bg-black/70 text-white flex items-center justify-center opacity-90 group-hover:bg-[#16a34a] transition-colors">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-[#16a34a]">
                          {item.tag} · {item.location}
                        </p>
                        <p className="text-sm font-bold text-neutral-950 dark:text-white mt-1 leading-snug">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                        {item.caption}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Real Workshop Videos (Click-to-Play for Fast Page Load) */}
            <div className="pt-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#16a34a]">
                    See CHIPNG Cards In Action
                  </p>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1">
                    Real cards crafted in our Lekki studio.
                  </h3>
                </div>
                <a
                  href="https://www.tiktok.com/@chipng_nfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#16a34a] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
                >
                  More videos on @chipng_nfc <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {REAL_TIKTOK_DEMOS.map((vid) => (
                  <div
                    key={vid.id}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden"
                  >
                    <div className="relative aspect-[16/10] bg-neutral-950 overflow-hidden">
                      {activeVideoIds[vid.id] ? (
                        <iframe
                          src={`https://www.tiktok.com/embed/v2/${vid.id}`}
                          title={vid.title}
                          className="w-full h-full border-0"
                          allow="encrypted-media;"
                          loading="lazy"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveVideoIds((prev) => ({ ...prev, [vid.id]: true }))}
                          className="relative w-full h-full group cursor-pointer"
                          aria-label={`Play video: ${vid.title}`}
                        >
                          <img
                            src={vid.poster}
                            alt={vid.title}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <span className="h-14 w-14 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 ml-0.5" />
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                    <div className="p-5">
                      <h4 className="text-base font-bold text-neutral-950 dark:text-white">{vid.title}</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{vid.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 4: 3-STEP PRODUCT DEMONSTRATION (PLAIN-ENGLISH OUTCOMES)
           ================================================================ */}
        <section
          id="how-it-works"
          className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#0b0d10]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#16a34a]">
                How CHIPNG Works
              </p>
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1.5"
                style={{ textWrap: 'balance' }}
              >
                Share your entire business identity in 1 second.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
                Zero app required for the person you meet. Every card works straight in Safari or Chrome and includes a backup QR code for older phones.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-10 items-center">
              <div className="lg:col-span-7 space-y-3">
                {DEMO_STEPS.map((item, idx) => {
                  const isActive = activeDemoStep === idx;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => setActiveDemoStep(idx)}
                      className={`w-full text-left rounded-2xl p-5 sm:p-6 border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-[#11141a] border-[#16a34a] shadow-xs'
                          : 'bg-white/60 dark:bg-[#0e1014] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs font-extrabold tracking-wide text-[#16a34a]">
                            {item.step}
                          </p>
                          <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                            {item.headline}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 tabular-nums ${
                            isActive
                              ? 'bg-[#16a34a] text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          0{idx + 1}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-6 sm:p-8 flex flex-col items-center">
                  <div className="w-full max-w-[280px] rounded-[2rem] border-4 border-neutral-900 dark:border-neutral-700 bg-neutral-950 text-white p-4 shadow-xl">
                    <div className="w-16 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />
                    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4 min-h-[250px] flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-semibold text-[#16a34a]">chipng.com/you</span>
                        <span>No App Needed</span>
                      </div>

                      {activeDemoStep === 0 && (
                        <motion.div
                          key="demo-tap"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center text-center py-5 space-y-3"
                        >
                          <div className="h-14 w-14 rounded-2xl bg-[#16a34a]/15 border border-[#16a34a]/40 text-[#16a34a] flex items-center justify-center">
                            <Wifi className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold">Tap Card Against Any Phone</p>
                          <p className="text-xs text-neutral-400">
                            Works on every iPhone &amp; Android in 1 second—never needs charging
                          </p>
                        </motion.div>
                      )}

                      {activeDemoStep === 1 && (
                        <motion.div
                          key="demo-connect"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-[#16a34a] text-white font-bold flex items-center justify-center text-sm">
                              SA
                            </div>
                            <div>
                              <p className="text-sm font-bold">Samirah Ade-Adebiyi</p>
                              <p className="text-[11px] text-neutral-400">Managing Director · Lagos</p>
                            </div>
                          </div>
                          <div className="rounded-xl bg-neutral-800/80 p-3 text-xs text-neutral-300 leading-relaxed">
                            Opens straight in Safari or Chrome—no app download needed.
                          </div>
                        </motion.div>
                      )}

                      {activeDemoStep === 2 && (
                        <motion.div
                          key="demo-share"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-2.5 py-1"
                        >
                          <div className="rounded-xl bg-[#16a34a] text-white px-3.5 py-2.5 text-xs font-bold flex items-center justify-between">
                            <span>Save Contact to Phone</span>
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="rounded-xl bg-neutral-800 px-3.5 py-2 text-xs text-neutral-200 flex items-center justify-between">
                            <span>Message on WhatsApp</span>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                          </div>
                          <div className="rounded-xl bg-neutral-800 px-3.5 py-2 text-xs text-neutral-200 flex items-center justify-between">
                            <span>Website &amp; Social Media</span>
                            <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                          </div>
                        </motion.div>
                      )}

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <span>{activeDemo.phoneStatus}</span>
                        <QrCode className="w-4 h-4 text-neutral-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 5: WHY CHOOSE CHIPNG (OUTCOME-DRIVEN BENEFITS)
           ================================================================ */}
        <section className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#16a34a]">
                Why Nigerian Founders &amp; Teams Switch to CHIPNG
              </p>
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1.5"
                style={{ textWrap: 'balance' }}
              >
                One smart card built to outlast thousands of paper reprints.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_CHOOSE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-6 space-y-3"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">{item.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Pre-Production Design Proof & Risk-Free Guarantee Banner */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-white p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3.5">
                <p className="text-xs font-semibold text-[#16a34a] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Zero Guesswork Production
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  YOUR BRAND. YOUR CARD. YOUR APPROVAL.
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                  We never print or engrave blindly. After you order, our Lekki studio sends your custom softcopy proof to WhatsApp &amp; email—and every card is protected by our 12-Month Free NFC Chip Replacement Guarantee.
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { icon: CheckCircle2, label: 'Free layout edits before print' },
                  { icon: ShieldCheck, label: '12-Month Free Chip Warranty' },
                  { icon: Lock, label: 'Encrypted Flutterwave checkout' },
                  { icon: Truck, label: '24–48h Lagos · DHL & GIG nationwide' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-xl bg-white/[0.06] border border-white/10 p-4 flex items-start gap-2.5"
                    >
                      <Icon className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                      <span className="font-semibold text-neutral-100 leading-snug">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: ESSENTIAL BUYER FAQ ACCORDION
           ================================================================ */}
        <section
          id="faq"
          className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-[#0b0d10]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-[#16a34a]">
                Quick Answers Before You Order
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1.5">
                Everything you need to know about ordering.
              </h2>
            </div>

            <div className="mt-10 divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden">
              {BUY_CARD_FAQS.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div key={faq.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => handleToggleFaq(faq.id, faq.question)}
                      className="w-full px-5 sm:px-7 py-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-neutral-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#16a34a]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 sm:px-7 pb-5 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 7: FINAL CONVERSION & WHATSAPP CONCIERGE CTA
           ================================================================ */}
        <section className="py-16 sm:py-24 pb-28 md:pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <p className="text-xs font-semibold text-[#16a34a]">
              24–48 hr Lagos Delivery · Nationwide DHL &amp; GIG · 12-Month Chip Warranty
            </p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Order your custom CHIPNG smart card today.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Pick your card, upload your logo, approve your WhatsApp proof before production, and pay securely via Flutterwave. Prefer to chat first? Message our Lekki studio directly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('select-card')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[52px] whitespace-nowrap"
              >
                CHOOSE YOUR NFC CARD
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={buildChipngWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppSupportClicked('bottom_cta')}
                className="w-full sm:w-auto px-7 py-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#16a34a] text-neutral-950 dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors min-h-[52px] whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 text-[#16a34a]" />
                Order / Chat on WhatsApp ({CHIPNG_DISPLAY_PHONE})
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Compact Conversion-Safe Footer (No Funnel Exit Clutter) */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0a0c0f] py-10 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="space-y-1.5">
            <p className="text-sm font-extrabold text-neutral-950 dark:text-white">CHIP NG Technologies Ltd</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#16a34a]" /> Lekki Phase 1, Lagos, Nigeria
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#16a34a]" /> {CHIPNG_SUPPORT_EMAIL}
              </span>
              <span aria-hidden="true">·</span>
              <a
                href={buildChipngWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppSupportClicked('funnel_footer_whatsapp')}
                className="inline-flex items-center gap-1 font-semibold text-neutral-900 dark:text-white hover:text-[#16a34a]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#16a34a]" /> WhatsApp {CHIPNG_DISPLAY_PHONE}
              </a>
            </p>
          </div>
          <div className="space-y-1 md:text-right">
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
              12-Month Free NFC Chip Replacement Warranty · Insured DHL &amp; GIG Shipping
            </p>
            <p>© {new Date().getFullYear()} CHIPNG. Encrypted payments processed by Flutterwave.</p>
          </div>
        </div>
      </footer>

      {/* Mobile-Only Slim Sticky Purchase CTA (hidden when hero CTA visible) */}
      {showStickyMobileCta && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
          <button
            type="button"
            onClick={() => scrollToSection('select-card')}
            className="flex-1 py-3 px-4 rounded-xl bg-[#16a34a] active:bg-[#15803d] text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer whitespace-nowrap"
          >
            GET YOUR CARD — FROM {formatNaira(lowestPrice)}
          </button>
          <a
            href={buildChipngWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with CHIPNG on WhatsApp"
            onClick={() => trackWhatsAppSupportClicked('mobile_sticky_bar')}
            className="h-11 w-11 rounded-xl border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[#16a34a] shrink-0"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      )}

      {/* Real Client Proof Lightbox */}
      {lightboxProof && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxProof.title}
          onClick={() => setLightboxProof(null)}
        >
          <div
            className="relative max-w-lg w-full rounded-2xl bg-white dark:bg-[#0f1115] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#16a34a] truncate">
                  {lightboxProof.tag} · {lightboxProof.location}
                </p>
                <p className="text-sm font-bold text-neutral-950 dark:text-white truncate">
                  {lightboxProof.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxProof(null)}
                aria-label="Close proof screenshot"
                className="h-9 w-9 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-neutral-950 max-h-[70vh] overflow-y-auto flex items-center justify-center">
              <img
                src={lightboxProof.image}
                alt={lightboxProof.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-300 border-t border-neutral-200 dark:border-neutral-800">
              {lightboxProof.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
