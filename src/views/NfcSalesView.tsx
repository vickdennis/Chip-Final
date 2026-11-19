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
} from 'lucide-react';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { SeoHead } from '../components/seo/SeoHead';
import { BUY_CARD_META, BUY_CARD_SCHEMA_JSON_LD } from '../utils/buyCardSeo';
import { CHIPNG_PRODUCT_REVIEWS } from '../utils/productSchemaData';
import {
  CANONICAL_BUY_CARD_PRODUCTS,
  PRODUCT_COMPARISON_ROWS,
  BUY_CARD_FAQS,
  BuyCardProduct,
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

const BuyCardCheckoutModal = lazy(() =>
  import('../components/buy-card/BuyCardCheckoutModal').then((m) => ({
    default: m.BuyCardCheckoutModal,
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
    title: 'One-Tap NFC Card Demo',
    subtitle: 'Instant browser profile load with zero app needed',
    poster: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.28640138450754493.jpeg',
  },
  {
    id: '7680709423232208146',
    title: 'Custom Laser-Engraved Metal Showcase',
    subtitle: 'Real Nigerian founder & executive cards crafted in Lagos',
    poster: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.9650784343957072.jpeg',
  },
];

const WHY_CHOOSE_ITEMS = [
  {
    icon: Wifi,
    title: 'One-tap contact sharing',
    desc: 'Tap your physical CHIPNG card near any NFC-enabled phone to transfer your full business identity immediately.',
  },
  {
    icon: Smartphone,
    title: 'No special app required',
    desc: 'Your contacts view your digital profile straight inside Safari or Chrome—zero downloads, zero friction.',
  },
  {
    icon: Palette,
    title: 'Custom branding with your logo',
    desc: 'Upload your brand logo, colors, and title. Approve your digital proof before we print or engrave.',
  },
  {
    icon: Globe,
    title: 'Share websites & social media',
    desc: 'Connect prospects directly to your website, Instagram, LinkedIn, WhatsApp, portfolio, and booking links.',
  },
  {
    icon: UserPlus,
    title: 'Digital contact saving',
    desc: 'Recipients save your phone number, email, role, and company into their phone contacts with one click.',
  },
  {
    icon: RefreshCw,
    title: 'Update anytime without reprinting',
    desc: 'Changed roles, phone numbers, or links? Edit your digital profile in seconds while keeping the same card.',
  },
  {
    icon: Award,
    title: 'Premium physical card designs',
    desc: 'Choose waterproof UV-cured PVC or precision-weighted stainless steel with crisp fiber-laser engraving.',
  },
  {
    icon: Briefcase,
    title: 'Effortless networking',
    desc: 'Replace stacks of paper cards that get lost or discarded with one lasting card built for every meeting.',
  },
  {
    icon: ShieldCheck,
    title: 'Lifetime core digital profile hosting',
    desc: 'Includes lifetime hosting of CHIP Core profile features (subject to product terms) plus 3 months free CHIP Pro.',
  },
];

const DEMO_STEPS = [
  {
    step: 'STEP 1: TAP.',
    shortLabel: 'Tap',
    headline: 'Simply tap your CHIPNG card against a compatible smartphone.',
    detail:
      'Hold your CHIPNG card near the top back of an iPhone or the center back of an Android phone. The embedded NXP NTAG216 chip responds automatically—no battery needed.',
    phoneStatus: 'NFC Tag Detected · chipng.com',
  },
  {
    step: 'STEP 2: CONNECT.',
    shortLabel: 'Connect',
    headline: 'Your digital business profile opens instantly in the browser.',
    detail:
      'A clean notification opens your branded CHIPNG business profile directly in Safari or Chrome. Recipients never need to install an application—and every card includes a dynamic QR backup.',
    phoneStatus: 'Opening Digital Profile in Browser',
  },
  {
    step: 'STEP 3: SHARE.',
    shortLabel: 'Share',
    headline: 'Let customers save your contact, visit your website and connect with your social media.',
    detail:
      'In one click, clients download your verified vCard into their phonebook, message you on WhatsApp, browse your website, or follow your social accounts.',
    phoneStatus: 'Contact Saved · Connected',
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
  onNavigate,
  isDarkMode = false,
  toggleDarkMode = () => {},
  session,
}: NfcSalesViewProps) {
  const [products, setProducts] = useState<BuyCardProduct[]>(CANONICAL_BUY_CARD_PRODUCTS);
  const [activeImageByProduct, setActiveImageByProduct] = useState<Record<string, number>>({});
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');
  const [activeDemoStep, setActiveDemoStep] = useState<number>(0);
  const [openFaqId, setOpenFaqId] = useState<string | null>(BUY_CARD_FAQS[0].id);
  const [selectedProduct, setSelectedProduct] = useState<BuyCardProduct | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeVideoIds, setActiveVideoIds] = useState<Record<string, boolean>>({});
  const [showStickyMobileCta, setShowStickyMobileCta] = useState(false);
  const [referrer, setReferrer] = useState<string | null>(null);

  const heroCtaRef = useRef<HTMLDivElement | null>(null);

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

    // Preload checkout modal chunk during idle time
    const idleTimer = setTimeout(() => {
      import('../components/buy-card/BuyCardCheckoutModal');
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(idleTimer);
    };
  }, []);

  // Gentle auto-cycle for 3-step NFC demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemoStep((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Show slim mobile sticky CTA once hero CTA scrolls out of view
  useEffect(() => {
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
  }, []);

  const lowestPrice = Math.min(...products.map((p) => p.priceNgn).filter((n) => n > 0), 30000);

  const filteredProducts =
    audienceFilter === 'all'
      ? products
      : products.filter((p) => p.audienceTag === audienceFilter);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleToggleFaq = (faqId: string, question: string) => {
    const opening = openFaqId !== faqId;
    setOpenFaqId(opening ? faqId : null);
    if (opening) {
      trackFaqOpened(faqId, question);
    }
  };

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

      <MakroNavbar
        currentView="nfc-sales"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="pt-20 sm:pt-24">
        {/* ================================================================
            SECTION 1: HIGH-CONVERTING HERO (ABOVE-THE-FOLD OPTIMIZED)
           ================================================================ */}
        <section className="relative overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pt-14 sm:pb-20 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Copy Column */}
              <div className="lg:col-span-7 space-y-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                  CHIPNG Smart NFC Business Cards · Nigeria
                </p>

                <h1
                  className="text-3xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.06]"
                  style={{ textWrap: 'balance' }}
                >
                  YOUR BUSINESS DESERVES MORE THAN A PAPER BUSINESS CARD.
                </h1>

                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl leading-relaxed">
                  Make unforgettable first impressions with CHIPNG NFC smart business cards. Share your contact details, social media, website and business information with a single tap.
                </p>

                {/* Primary & Secondary CTAs — Visible Above the Fold on Mobile */}
                <div ref={heroCtaRef} className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => scrollToSection('select-card')}
                    className="px-7 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2.5 transition-colors shadow-sm cursor-pointer min-h-[52px]"
                  >
                    GET YOUR NFC CARD
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('how-it-works')}
                    className="px-7 py-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-neutral-950 dark:hover:border-white text-neutral-900 dark:text-white font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[52px]"
                  >
                    SEE HOW IT WORKS
                  </button>
                </div>

                {/* Clear Pricing Entry Point & Trust Indicators */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Starting Price</p>
                    <p className="font-extrabold text-sm text-neutral-950 dark:text-white tabular-nums mt-0.5">
                      From {formatNaira(lowestPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">App Required</p>
                    <p className="font-bold text-sm text-neutral-950 dark:text-white mt-0.5">None (Browser)</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Design Proof</p>
                    <p className="font-bold text-sm text-neutral-950 dark:text-white mt-0.5">Before Printing</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-neutral-400">Delivery</p>
                    <p className="font-bold text-sm text-neutral-950 dark:text-white mt-0.5">Lagos &amp; Nationwide</p>
                  </div>
                </div>
              </div>

              {/* Right Visual Column: NFC Card + Smartphone Tap Demonstration */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0f1115] p-5 sm:p-7 overflow-hidden">
                  {/* Real Product Photo Backdrop */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800">
                    <img
                      src={products[1]?.images[0] || CANONICAL_BUY_CARD_PRODUCTS[1].images[0]}
                      alt="CHIPNG Matte Black Custom NFC Smart Business Card"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    {/* Animated NFC Tap Signal Overlay */}
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 p-3.5 shadow-lg flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-[#16a34a] text-white flex items-center justify-center shrink-0">
                          <Wifi className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                            CHIPNG Profile Opened Instantly
                          </p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            Save Contact · Website · WhatsApp · Socials
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#16a34a] shrink-0">1 Tap</span>
                    </motion.div>
                  </div>

                  {/* Secondary Card Material Strip */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      {
                        label: 'PVC White',
                        price: products[0]?.priceNgn || 30000,
                        img: products[0]?.images[0],
                      },
                      {
                        label: 'Premium PVC',
                        price: products[1]?.priceNgn || 35000,
                        img: products[1]?.images[0],
                      },
                      {
                        label: 'Metal NFC',
                        price: products[2]?.priceNgn || 50000,
                        img: products[2]?.images[0],
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
            SECTION 2: PRODUCT DEMONSTRATION (3-STEP INTERACTIVE FLOW)
           ================================================================ */}
        <section
          id="how-it-works"
          className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#0b0d10]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                How CHIPNG Works
              </p>
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-2"
                style={{ textWrap: 'balance' }}
              >
                Share your entire business identity in three effortless seconds.
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-3 leading-relaxed">
                Your clients do not need to install any special application to view your shared profile. Every card works directly in their mobile browser and includes a backup QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mt-10 items-center">
              {/* Interactive 3-Step Cards */}
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
                          ? 'bg-white dark:bg-[#11141a] border-[#16a34a] shadow-sm'
                          : 'bg-white/60 dark:bg-[#0e1014] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#16a34a]">
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
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
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

              {/* Animated Smartphone + Card Interactive Preview */}
              <div className="lg:col-span-5">
                <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-6 sm:p-8 flex flex-col items-center">
                  {/* Minimalist Smartphone Frame */}
                  <div className="w-full max-w-[280px] rounded-[2rem] border-4 border-neutral-900 dark:border-neutral-700 bg-neutral-950 text-white p-4 shadow-xl">
                    <div className="w-16 h-1.5 bg-neutral-700 rounded-full mx-auto mb-4" />

                    {/* Dynamic Step State Inside Phone */}
                    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4 min-h-[260px] flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="font-semibold text-[#16a34a]">chipng.com/you</span>
                        <span>No App Needed</span>
                      </div>

                      {activeDemoStep === 0 && (
                        <motion.div
                          key="demo-tap"
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center text-center py-6 space-y-3"
                        >
                          <div className="h-14 w-14 rounded-2xl bg-[#16a34a]/15 border border-[#16a34a]/40 text-[#16a34a] flex items-center justify-center">
                            <Wifi className="w-7 h-7" />
                          </div>
                          <p className="text-sm font-bold">Tap CHIPNG Card Here</p>
                          <p className="text-xs text-neutral-400">
                            NXP NTAG216 chip detected instantly on compatible iPhone &amp; Android phones
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
                              CO
                            </div>
                            <div>
                              <p className="text-sm font-bold">Chinedu Okafor</p>
                              <p className="text-[11px] text-neutral-400">Managing Director · Lagos</p>
                            </div>
                          </div>
                          <div className="rounded-xl bg-neutral-800/80 p-3 text-xs text-neutral-300 leading-relaxed">
                            Browser opened directly—no app download or account required for the person you meet.
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
                            <span>Save Contact (vCard)</span>
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="rounded-xl bg-neutral-800 px-3.5 py-2 text-xs text-neutral-200 flex items-center justify-between">
                            <span>Visit Website</span>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                          </div>
                          <div className="rounded-xl bg-neutral-800 px-3.5 py-2 text-xs text-neutral-200 flex items-center justify-between">
                            <span>WhatsApp &amp; Social Media</span>
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
            SECTION 3: WHY CHOOSE CHIPNG? (9 VERIFIED BENEFITS)
           ================================================================ */}
        <section className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                Why Choose CHIPNG?
              </p>
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-2"
                style={{ textWrap: 'balance' }}
              >
                Built for Nigerian founders, executives, and modern teams.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
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
          </div>
        </section>

        {/* ================================================================
            SECTION 4: PRODUCT SELECTION, PRICING & COMPARISON (PHASE 2)
           ================================================================ */}
        <section
          id="select-card"
          className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#0b0d10]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                  Verified CHIPNG Catalog · NGN Pricing
                </p>
                <h2
                  className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-2"
                  style={{ textWrap: 'balance' }}
                >
                  Choose the right NFC smart business card for your brand.
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
                  Every card includes custom logo branding, pre-production design approval, lifetime CHIP Core hosting, and 3 months free CHIP Pro.
                </p>
              </div>

              {/* Interactive Audience Filter (Smart Recommendation) */}
              <div
                role="tablist"
                aria-label="Filter cards by customer type"
                className="flex flex-wrap gap-2"
              >
                {[
                  { key: 'all' as AudienceFilter, label: 'All Cards' },
                  { key: 'individual' as AudienceFilter, label: 'Individuals (PVC)' },
                  { key: 'executive' as AudienceFilter, label: 'Executives (Metal)' },
                  { key: 'business' as AudienceFilter, label: 'Businesses (Corporate)' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={audienceFilter === tab.key}
                    onClick={() => setAudienceFilter(tab.key)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[42px] ${
                      audienceFilter === tab.key
                        ? 'bg-neutral-950 dark:bg-white text-white dark:text-neutral-950'
                        : 'bg-white dark:bg-[#11141a] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {filteredProducts.map((product) => {
                const activeIdx = activeImageByProduct[product.id] || 0;
                const currentImg = product.images[activeIdx] || product.images[0];
                return (
                  <article
                    key={product.id}
                    className={`flex flex-col rounded-3xl border bg-white dark:bg-[#0f1115] overflow-hidden transition-shadow hover:shadow-lg ${
                      product.recommended
                        ? 'border-[#16a34a] ring-1 ring-[#16a34a]/20'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {/* Product Image + Gallery Thumbnails */}
                    <div className="relative aspect-[4/3] bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                      <img
                        src={currentImg}
                        alt={`${product.name} — CHIPNG NFC business card`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {product.recommended && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#16a34a] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                          Most Popular
                        </span>
                      )}
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
                                  : 'border-white/70 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Body */}
                    <div className="flex-1 p-6 flex flex-col justify-between gap-5">
                      <div className="space-y-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
                            {product.tierLabel}
                          </p>
                          <h3 className="text-lg font-extrabold text-neutral-950 dark:text-white mt-1">
                            {product.name}
                          </h3>
                          <p className="text-2xl font-extrabold text-neutral-950 dark:text-white tabular-nums mt-1">
                            {formatNaira(product.priceNgn)}
                          </p>
                        </div>

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
                          className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[48px] ${
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
            <div className="mt-14 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-extrabold text-neutral-950 dark:text-white">
                  Compare CHIPNG Smart Card Editions
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  All editions use genuine NXP NTAG216 chips and include pre-production design approval.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase text-[11px] font-bold tracking-wider">
                      <th className="py-3.5 px-5">Feature</th>
                      <th className="py-3.5 px-5">PVC Card</th>
                      <th className="py-3.5 px-5 text-[#16a34a]">Premium PVC</th>
                      <th className="py-3.5 px-5">Metal Editions</th>
                      <th className="py-3.5 px-5">Corporate Package</th>
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
            SECTION 5: DESIGN APPROVAL PROMISE & TRUST / PROOF (PHASE 3 & 4)
           ================================================================ */}
        <section className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Pre-Production Design Proof Banner */}
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-white p-7 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Zero Guesswork Production
                </p>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  YOUR BRAND. YOUR CARD. YOUR APPROVAL.
                </h2>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                  After you complete your order, our Lagos studio crafts your custom card mockup with your logo, name, and QR layout—and sends it to your WhatsApp &amp; email for sign-off before we print or laser-engrave a single card.
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { icon: CheckCircle2, label: 'Free layout revisions before print' },
                  { icon: ShieldCheck, label: 'Genuine NXP NTAG216 hardware' },
                  { icon: Lock, label: 'Verified Flutterwave checkout' },
                  { icon: Truck, label: 'Insured DHL & GIG delivery' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 flex items-start gap-2.5"
                    >
                      <Icon className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
                      <span className="font-semibold text-neutral-100 leading-snug">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real Product Demonstration Videos (Lazy-loaded Click-to-Play for Core Web Vitals) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                    See CHIPNG Cards In Action
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1">
                    Real cards crafted in our Lagos workshop.
                  </h2>
                </div>
                <a
                  href="https://www.tiktok.com/@chipng_nfc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#16a34a] hover:underline inline-flex items-center gap-1"
                >
                  Follow @chipng_nfc on TikTok <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {REAL_TIKTOK_DEMOS.map((vid) => (
                  <div
                    key={vid.id}
                    className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0f1115] overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-[16/10] bg-neutral-950">
                      {activeVideoIds[vid.id] ? (
                        <iframe
                          src={`https://www.tiktok.com/player/v1/${vid.id}?autoplay=1&loop=1&music_info=0&description=0`}
                          title={vid.title}
                          className="w-full h-full border-0"
                          allow="fullscreen; autoplay"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveVideoIds((prev) => ({ ...prev, [vid.id]: true }))}
                          className="relative w-full h-full group cursor-pointer text-left"
                        >
                          <img
                            src={vid.poster}
                            alt={vid.title}
                            loading="lazy"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
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
                      <h3 className="text-base font-bold text-neutral-950 dark:text-white">{vid.title}</h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{vid.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Customer Reviews */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                    Trusted by Professionals Across Nigeria
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-1">
                    4.9 / 5 rated by Nigerian founders &amp; teams.
                  </h2>
                </div>
                <a
                  href="https://g.page/r/CZGM0zQdEiY7EAE/review"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#16a34a] hover:underline inline-flex items-center gap-1"
                >
                  View CHIPNG Google Reviews <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                {CHIPNG_PRODUCT_REVIEWS.map((review) => (
                  <blockquote
                    key={review.author.name}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] p-6 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-[#16a34a]" aria-label="5 out of 5 stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        &ldquo;{review.reviewBody}&rdquo;
                      </p>
                    </div>
                    <footer className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-950 dark:text-white">{review.author.name}</span>
                      <span className="text-neutral-400">Verified Buyer</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>

            {/* Verified Support, Compatibility & Delivery Assurance Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0f1115] p-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#16a34a]">Device Compatibility</p>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                  Works on NFC-enabled iPhone &amp; Android
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Powered by passive NXP NTAG216 technology (iPhone XR/XS &amp; newer, modern Android phones with NFC enabled), plus a crisp dynamic QR code backup for any camera.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0f1115] p-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#16a34a]">Lagos &amp; Nationwide Delivery</p>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                  Fast Insured Dispatch Across Nigeria
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Crafted in Lekki Phase 1, Lagos. Lagos delivery takes 24–48 hours after design approval; Abuja, Port Harcourt, and all 36 states ship in 2–4 business days via DHL &amp; GIG.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0f1115] p-6 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#16a34a]">Real Nigerian Support</p>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                  Direct WhatsApp &amp; Email Concierge
                </h3>
                <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 space-y-1.5 pt-1">
                  <p className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <a
                      href={buildChipngWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsAppSupportClicked('trust_strip')}
                      className="font-semibold text-neutral-900 dark:text-white hover:text-[#16a34a]"
                    >
                      WhatsApp: {CHIPNG_DISPLAY_PHONE}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>{CHIPNG_SUPPORT_EMAIL}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Lekki Phase 1, Lagos, Nigeria</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: 12-QUESTION INTERACTIVE FAQ (PHASE 4)
           ================================================================ */}
        <section
          id="faq"
          className="py-16 sm:py-24 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-[#0b0d10]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
                Frequently Asked Questions
              </p>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white mt-2">
                Everything you should know before ordering.
              </h2>
            </div>

            <div className="mt-10 divide-y divide-neutral-200 dark:divide-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0f1115] overflow-hidden">
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
            SECTION 7: FINAL CONVERSION & WHATSAPP CONCIERGE CTA (PHASE 6)
           ================================================================ */}
        <section className="py-16 sm:py-24 pb-28 md:pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#16a34a]">
              Ready to Upgrade Your First Impression?
            </p>
            <h2
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Order your custom CHIPNG NFC card today.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Select your card, upload your logo, approve your design proof, and pay securely via Flutterwave. Still deciding between PVC, Metal, or Corporate? Talk directly to our team.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('select-card')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[52px]"
              >
                GET YOUR NFC CARD
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={buildChipngWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppSupportClicked('bottom_cta')}
                className="w-full sm:w-auto px-7 py-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#16a34a] text-neutral-950 dark:text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors min-h-[52px]"
              >
                <MessageCircle className="w-4 h-4 text-[#16a34a]" />
                Chat on WhatsApp ({CHIPNG_DISPLAY_PHONE})
              </a>
            </div>
          </div>
        </section>
      </main>

      <MakroFooter onNavigate={onNavigate} />

      {/* Mobile-Only Slim Sticky Purchase CTA (hidden when modal open or hero CTA visible) */}
      {showStickyMobileCta && !isCheckoutOpen && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0d0f12]/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-4 py-2.5 flex items-center gap-2.5 shadow-lg">
          <button
            type="button"
            onClick={() => scrollToSection('select-card')}
            className="flex-1 py-3 px-4 rounded-xl bg-[#16a34a] active:bg-[#15803d] text-white font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            GET YOUR CHIPNG CARD — FROM {formatNaira(lowestPrice)}
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

      {/* Lazy-loaded 4-step Checkout Modal */}
      {isCheckoutOpen && (
        <Suspense fallback={null}>
          <BuyCardCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            product={selectedProduct}
            referrer={referrer}
          />
        </Suspense>
      )}
    </div>
  );
}
