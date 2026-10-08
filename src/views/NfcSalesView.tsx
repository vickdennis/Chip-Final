'use client';

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Wifi, 
  Shield, 
  ArrowRight, 
  Star, 
  Zap, 
  RefreshCw, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  MapPin, 
  BadgeCheck, 
  Smartphone, 
  ChevronRight, 
  Download, 
  CheckCircle2, 
  Flame, 
  Layers, 
  RotateCw,
  QrCode,
  Building2,
  Users,
  Briefcase,
  Activity,
  Sliders,
  RotateCcw,
  Check,
  ExternalLink
} from 'lucide-react';

import { Card3DRotator, CardMaterial } from '../components/funnel/Card3DRotator';
import { LiveBioPreview } from '../components/funnel/LiveBioPreview';
import type { CardCustomizationData } from '../components/funnel/CardCustomizerModal';
import { SocialMediaIconSet, SocialPlatform } from '../components/social/SocialMediaIconSet';
import { trackTikTokEvent } from '../utils/tiktokPixel';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { ProductComparisonMatrix } from '../components/ProductComparisonMatrix';

// Lazy-load heavier checkout & customization modals to keep the initial page bundle lean
const CardCustomizerModal = lazy(() =>
  import('../components/funnel/CardCustomizerModal').then(m => ({ default: m.CardCustomizerModal }))
);
const CheckoutOnboardingModal = lazy(() =>
  import('../components/funnel/CheckoutOnboardingModal').then(m => ({ default: m.CheckoutOnboardingModal }))
);

// Preload modal chunks during idle time or user interaction
const preloadFunnelModals = () => {
  import('../components/funnel/CardCustomizerModal');
  import('../components/funnel/CheckoutOnboardingModal');
};

type PersonaType = 'executive' | 'founder' | 'creator';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: string;
}

const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 25, className = '', as = 'div' }: FadeInProps) => {
  const Tag = (motion as any)[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
};

interface NfcSalesViewProps {
  onNavigate?: (view: any) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  session?: any;
}

export default function NfcSalesView({
  onNavigate,
  isDarkMode = true,
  toggleDarkMode = () => {},
  session,
}: NfcSalesViewProps) {
  // 1. Traffic Alignment & Persona Matrix
  const [persona, setPersona] = useState<PersonaType>('founder');
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // 2. Interactive Preview State
  const [heroMaterial, setHeroMaterial] = useState<CardMaterial>('metal_spacegray');
  const [heroCustomName, setHeroCustomName] = useState('Victor Dennis');
  const [heroCustomTitle, setHeroCustomTitle] = useState('Managing Partner & Founder');
  const [heroCompany, setHeroCompany] = useState('Apex Ventures');
  const [heroHandle, setHeroHandle] = useState('victor');

  // Card Studio Interactive State
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);
  const [showTapBanner, setShowTapBanner] = useState(false);

  const getMaterialPrice = (mat: CardMaterial) => {
    switch (mat) {
      case 'plastic_white':
        return 30000;
      case 'plastic_black':
        return 35000;
      case 'metal_spacegray':
        return 50000;
      case 'metal_gold':
      default:
        return 100000;
    }
  };

  const getMaterialOriginalPrice = (mat: CardMaterial) => {
    switch (mat) {
      case 'plastic_white':
      case 'plastic_black':
        return 45000;
      case 'metal_spacegray':
        return 75000;
      case 'metal_gold':
      default:
        return 150000;
    }
  };

  const getMaterialTier = (mat: CardMaterial): 'plastic' | 'metal' | 'debit' => {
    if (mat === 'plastic_white' || mat === 'plastic_black') return 'plastic';
    if (mat === 'metal_spacegray') return 'metal';
    return 'debit';
  };

  const getMaterialLabel = (mat: CardMaterial) => {
    switch (mat) {
      case 'metal_gold':
        return '24K Matte Gold';
      case 'metal_spacegray':
        return 'Space Gray Steel';
      case 'plastic_black':
        return 'Matte Obsidian';
      case 'plastic_white':
        return 'Glacier White';
    }
  };

  const handleSimulateTap = () => {
    setIsSimulatingTap(true);
    setShowTapBanner(true);
    trackTikTokEvent('ViewContent', {
      content_type: 'product_interaction',
      content_name: 'Simulate NFC Tap Demo',
      content_id: heroMaterial,
      value: getMaterialPrice(heroMaterial),
      currency: 'NGN',
    });

    setTimeout(() => {
      setIsSimulatingTap(false);
    }, 2400);

    setTimeout(() => {
      setShowTapBanner(false);
    }, 5500);
  };

  const handleOrderHeroCard = () => {
    const tier = getMaterialTier(heroMaterial);
    const price = getMaterialPrice(heroMaterial);
    setSelectedInitialTier(tier);
    setSelectedInitialMaterial(heroMaterial);

    trackTikTokEvent('AddToCart', {
      content_type: 'product',
      content_name: `${tier.toUpperCase()} NFC Card (${heroMaterial})`,
      content_id: tier,
      value: price,
      currency: 'NGN',
    });

    setIsCustomizerOpen(true);
  };

  // 3. Modals & Funnel State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedInitialTier, setSelectedInitialTier] = useState<'plastic' | 'metal' | 'debit'>('metal');
  const [selectedInitialMaterial, setSelectedInitialMaterial] = useState<CardMaterial>('metal_spacegray');
  const [customizationData, setCustomizationData] = useState<CardCustomizationData | null>(null);

  // 4. Scarcity & Urgency Timer (15 Minutes)
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [hasDiscountLocked, setHasDiscountLocked] = useState(false);
  const tiktokSectionRef = useRef<HTMLDivElement>(null);

  // Idle preloader for funnel modal chunks
  useEffect(() => {
    const idleTimer = setTimeout(() => {
      preloadFunnelModals();
    }, 2800);
    return () => clearTimeout(idleTimer);
  }, []);

  // Parse UTM parameters on mount & track TikTok ViewContent
  useEffect(() => {
    trackTikTokEvent('ViewContent', {
      content_type: 'product',
      content_name: 'CHIP Smart NFC Cards & Digital Profiles',
      content_category: 'Smart Hardware',
      value: 50000,
      currency: 'NGN',
    });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('utm_source')?.toLowerCase() || '';
      const campaign = urlParams.get('utm_campaign')?.toLowerCase() || '';
      const personaParam = urlParams.get('persona')?.toLowerCase() as PersonaType;

      setUtmSource(source);
      setUtmCampaign(campaign);

      if (personaParam && ['executive', 'founder', 'creator'].includes(personaParam)) {
        setPersona(personaParam);
      } else if (source.includes('linkedin') || source.includes('corporate') || source.includes('b2b')) {
        setPersona('executive');
        setHeroCustomTitle('Chief Executive Officer');
        setHeroMaterial('metal_gold');
      } else if (source.includes('tiktok') || source.includes('instagram') || source.includes('youtube')) {
        setPersona('creator');
        setHeroCustomTitle('Content Creator & Director');
        setHeroMaterial('plastic_black');
      } else if (source.includes('twitter') || source.includes('x') || source.includes('tech')) {
        setPersona('founder');
        setHeroCustomTitle('Co-Founder & CTO');
        setHeroMaterial('metal_spacegray');
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // TikTok embed script lazy loader (loads only when user scrolls near the demo section)
  useEffect(() => {
    const target = tiktokSectionRef.current;
    if (!target) return;

    let script: HTMLScriptElement | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          script = document.createElement('script');
          script.src = 'https://www.tiktok.com/embed.js';
          script.async = true;
          document.body.appendChild(script);
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Persona-matched dynamic copywriting
  const getPersonaCopy = () => {
    switch (persona) {
      case 'executive':
        return {
          badge: '👔 Executive & Enterprise Edition',
          headline: 'Command The Room. Exchange Prestige in 0.2 Seconds.',
          subheadline:
            'For Managing Directors, C-Suite Leaders, and Board Members. Aerospace-grade 24K Matte Gold & Stainless Steel NFC hardware paired with instantaneous executive vCard contact synchronization.',
          socialProof: 'Adopted by 450+ Bank Executives, Partners, and Corporate Directors across Lagos & Abuja.',
          ctaPrimary: 'Craft Executive Metal Card (10% Off)',
          keyPillars: ['Instant vCard Direct to Phone Book', 'Zero Paper Waste • Indestructible', 'Heavyweight 28g Luxury Feel'],
        };
      case 'creator':
        return {
          badge: '🎨 Creator & Media Pro Edition',
          headline: 'Turn Casual Encounters Into Millions of Followers & Brand Deals.',
          subheadline:
            'For Content Creators, Artists, and Media Entrepreneurs. Tap your custom card to any brand manager or fan’s phone to instantly open your media kit, TikTok, Instagram, Spotify, and rate card.',
          socialProof: 'Powering 3,200+ Nigerian creators with over 50M+ collective impressions.',
          ctaPrimary: 'Build Creator Card (10% Off)',
          keyPillars: ['Media Kit & Rate Card in 1-Tap', 'Direct TikTok & Instagram Follows', 'No App Needed on iOS & Android'],
        };
      case 'founder':
      default:
        return {
          badge: '🚀 Founders & Modern Networking Edition',
          headline: 'Pitch Less. Connect Instantly. Close Deals Faster.',
          subheadline:
            'For Startup Founders, Executives, and Independent Operators. Share your dynamic portfolio, Calendly booking link, and verified contact card in one single contactless tap.',
          socialProof: 'Certified NTAG216 contactless hardware engineered for instant, app-free connection on iOS and Android.',
          ctaPrimary: 'Order Your Smart Card',
          keyPillars: ['One-Tap Calendly Meeting Booking', 'Live Pitch Deck & Portfolio Link', 'Real-Time Cloud Profile Updates'],
        };
    }
  };

  const personaContent = getPersonaCopy();

  // Open Customizer for a specific tier and material
  const handleOpenCustomizer = (tier: 'plastic' | 'metal' | 'debit' = 'metal', material?: CardMaterial) => {
    setSelectedInitialTier(tier);
    if (material) {
      setSelectedInitialMaterial(material);
    } else if (tier === 'plastic') {
      setSelectedInitialMaterial('plastic_white');
    } else if (tier === 'debit') {
      setSelectedInitialMaterial('metal_gold');
    } else {
      setSelectedInitialMaterial('metal_spacegray');
    }

    // Track TikTok AddToCart event (₦30,000 for PVC, ₦50,000 for Metal, ₦100,000 for Heavy Metal/Debit)
    const itemPrice = tier === 'plastic' ? 30000 : tier === 'metal' ? 50000 : 100000;

    trackTikTokEvent('AddToCart', {
      content_type: 'product',
      content_name: `${tier === 'plastic' ? 'Custom PVC NFC Card' : tier === 'metal' ? 'NFC Smart Metal Card' : 'Metal Debit Card + Custom Design'} (${material || 'standard'})`,
      content_id: tier,
      value: itemPrice,
      currency: 'NGN',
    });

    setIsCustomizerOpen(true);
  };

  // When customizer completes lead capture and advances to checkout
  const handleProceedToCheckout = (data: CardCustomizationData) => {
    setCustomizationData(data);
    setHasDiscountLocked(true);
    setIsCustomizerOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#D2F843] selection:text-neutral-950 relative overflow-x-hidden font-sans transition-colors flex flex-col justify-between pb-24 md:pb-0">
      
      {/* Background Ambience Light Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#D2F843]/10 via-emerald-500/5 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#D2F843]/5 blur-[160px] pointer-events-none z-0" />

      {/* Top Header Navigation matching Homepage */}
      <MakroNavbar
        currentView="nfc-sales"
        onNavigate={onNavigate || (() => {})}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      {/* ================= STAGE 1 & 2: TRAFFIC ALIGNMENT & OPTIMIZED HERO ================= */}
      <section className="relative pt-4 sm:pt-8 pb-14 sm:pb-24 px-4 sm:px-6 lg:px-8 z-10 max-w-7xl mx-auto w-full">
        
        {/* Persona Switcher Tab Strip (Traffic Alignment) */}
        <div className="flex flex-col items-center mb-6 sm:mb-8 w-full max-w-full">
          <div className="w-full max-w-full overflow-x-auto no-scrollbar flex justify-start sm:justify-center px-1 py-1">
            <div className="inline-flex p-1 sm:p-1.5 rounded-full bg-neutral-100 dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-xs shrink-0">
              {[
                { id: 'founder', label: '🚀 Founders & VCs', icon: Briefcase },
                { id: 'executive', label: '👔 Executives', icon: Building2 },
                { id: 'creator', label: '🎨 Creators & Media', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPersona(tab.id as PersonaType)}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap min-h-[36px] ${
                    persona === tab.id
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {utmSource && (
            <span className="text-[10px] font-mono text-neutral-500 dark:text-white/40 mt-1.5 text-center px-2">
              Personalized campaign matched for <strong className="text-neutral-900 dark:text-white uppercase">{utmSource}</strong>
            </span>
          )}
        </div>

        {/* Hero Copywriting Block - Rendered immediately for lightning-fast First Contentful Paint */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12 px-2 sm:px-0">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1.5 shadow-2xs mb-3.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <span className="w-5 h-5 rounded-full bg-[#D2F843] flex items-center justify-center text-neutral-950">
              <Zap className="w-3 h-3 fill-current text-neutral-950" />
            </span>
            <span>{personaContent.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[60px] font-extrabold tracking-[-0.035em] leading-[1.12] sm:leading-[1.08] text-neutral-950 dark:text-white">
            {personaContent.headline}
          </h1>

          <p className="mt-3.5 sm:mt-5 text-sm sm:text-lg text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto">
            {personaContent.subheadline}
          </p>

          {/* Persona highlights pill row */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-5 text-xs font-mono">
            {personaContent.keyPillars.map((pillar, idx) => (
              <span
                key={idx}
                className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 text-neutral-800 dark:text-neutral-200 shadow-2xs flex items-center gap-1.5 text-[11px] sm:text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6c8600] dark:text-[#D2F843]" />
                <span>{pillar}</span>
              </span>
            ))}
          </div>

          <p className="text-xs text-neutral-500 dark:text-white/50 mt-4 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>{personaContent.socialProof}</span>
          </p>
        </div>

        {/* ================= HERO SHOWCASE: BOLD PHYSICAL SMART CARD & SIDE FUNCTION CONTROLS ================= */}
        {/* On desktop: Physical Smart Card is prominent on left with Function Controls by the side.
            On mobile: Physical Smart Card is at top with Function Controls directly below it. */}
        <div className="mt-6 sm:mt-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* ================= LEFT / HERO CENTERPIECE: BOLD PHYSICAL SMART CARD STAGE ================= */}
            <div className="lg:col-span-7 flex flex-col items-center w-full relative">
              
              {/* Floating iOS / Android Contactless Tap Simulation Banner */}
              <AnimatePresence>
                {showTapBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -25, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="absolute -top-4 sm:top-2 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[420px] bg-neutral-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center gap-3.5 text-left ring-1 ring-white/10 cursor-pointer"
                    onClick={() => setShowTapBanner(false)}
                  >
                    <div className="w-11 h-11 rounded-xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center shrink-0 shadow-sm">
                      <Wifi className="w-5 h-5 rotate-90" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6c8600] dark:text-[#D2F843] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843] animate-pulse" />
                          NFC Tag Detected • CHIP.NG
                        </span>
                        <span className="text-[10px] font-mono text-white/40">Just Now</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate mt-0.5">
                        {heroCustomName || 'Victor Dennis'} • {heroCompany || 'Apex Ventures'}
                      </p>
                      <p className="text-[11px] text-white/70 truncate">
                        Opened chipng.com/@{heroHandle} • One-tap "Save Contact" ready
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Plinth Container with Ambient Glow */}
              <div className="w-full relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col items-center">
                
                {/* Stage Ambient Radial Light */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] bg-gradient-to-br from-[#D2F843]/15 via-emerald-500/5 to-transparent blur-[110px] pointer-events-none z-0" />

                {/* Card Hardware Status Bar */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between w-full max-w-[560px] mb-3 sm:mb-6 gap-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-xs font-mono text-neutral-800 dark:text-white/90 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold">{getMaterialLabel(heroMaterial)}</span>
                  </div>

                  <span className="text-[11px] sm:text-xs font-mono text-neutral-500 dark:text-white/60">
                    {heroMaterial.includes('metal') ? '28g Solid Steel • Laser Engraved' : 'Polymer PVC • Full-Color UV'}
                  </span>
                </div>

                {/* The Bold 3D Smart Card Rotator */}
                <div className="relative z-10 w-full flex justify-center py-2 sm:py-4">
                  <Card3DRotator
                    material={heroMaterial}
                    customName={heroCustomName}
                    customTitle={heroCustomTitle}
                    customCompany={heroCompany}
                    qrUrl={`https://chipng.com/@${heroHandle}`}
                    isFlipped={isCardFlipped}
                    onFlipToggle={() => setIsCardFlipped((prev) => !prev)}
                    size="hero"
                    isTapping={isSimulatingTap}
                    className="w-full"
                  />
                </div>

                {/* Interactive Action Bar under Card */}
                <div className="relative z-10 w-full max-w-[560px] mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                  <button
                    onClick={handleSimulateTap}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold bg-neutral-950 text-white dark:bg-[#D2F843] dark:text-neutral-950 hover:bg-[#D2F843] hover:text-neutral-950 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 transition-all min-h-[44px]"
                  >
                    <Wifi className="w-3.5 h-3.5 rotate-90" />
                    <span>Simulate Phone Tap</span>
                  </button>

                  <button
                    onClick={() => setIsCardFlipped((prev) => !prev)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 text-neutral-800 dark:text-white/90 border border-neutral-200/80 dark:border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-colors min-h-[44px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-neutral-500 dark:text-white/70" />
                    <span>Flip Card ({isCardFlipped ? 'Front' : 'Back'})</span>
                  </button>
                </div>

                {/* 3D Tilt Instruction */}
                <div className="relative z-10 mt-3 text-[10px] sm:text-[11px] font-mono text-neutral-500 dark:text-white/40 text-center flex items-center justify-center gap-1.5 px-2">
                  <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-300 shrink-0" />
                  <span>Interactive: Hover or drag card to tilt with 3D specular reflection</span>
                </div>

                {/* Hardware Credibility Badges */}
                <div className="relative z-10 mt-5 pt-4 border-t border-neutral-200/60 dark:border-white/10 w-full max-w-[560px] grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
                    <span className="block text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white truncate">NTAG216 Chip</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-white/40 block truncate">0.2s Contactless</span>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
                    <span className="block text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white truncate">Zero Battery</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-white/40 block truncate">Inductive RF</span>
                  </div>
                  <div className="p-1.5 sm:p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
                    <span className="block text-[10px] sm:text-[11px] font-bold text-neutral-900 dark:text-white truncate">Zero App</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-white/40 block truncate">iOS & Android</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ================= RIGHT / FUNCTION CONTROL CONSOLE: BY THE SIDE ON DESKTOP, BELOW ON MOBILE ================= */}
            {/* ================= RIGHT / FUNCTION CONTROL CONSOLE: BY THE SIDE ON DESKTOP, BELOW ON MOBILE ================= */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 shadow-sm flex flex-col gap-5 sm:gap-6">
                
                {/* Console Header */}
                <div className="flex items-center justify-between pb-3.5 sm:pb-4 border-b border-neutral-200/60 dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D2F843]/20 border border-[#D2F843]/40 flex items-center justify-center text-[#6c8600] dark:text-[#D2F843]">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-950 dark:text-white tracking-wide">
                        Card Function & Customization
                      </h3>
                      <p className="text-[11px] text-neutral-500 dark:text-white/50">
                        Live hardware configuration console
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Sync</span>
                  </div>
                </div>

                {/* Control 1: Material & Finish Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-2.5 gap-2">
                    <label className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-white/90 uppercase tracking-wider font-mono">
                      1. Material & Finish
                    </label>
                    <span className="text-[10px] sm:text-[11px] text-[#6c8600] dark:text-[#D2F843] font-mono font-medium truncate">
                      {getMaterialLabel(heroMaterial)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {[
                      {
                        id: 'metal_spacegray' as CardMaterial,
                        label: 'Space Gray Steel',
                        price: '₦100,000',
                        weight: '28g Solid Steel',
                        swatch: 'from-slate-500 via-slate-700 to-slate-900 border-slate-400',
                        tag: 'Engraved',
                      },
                      {
                        id: 'metal_gold' as CardMaterial,
                        label: '24K Matte Gold',
                        price: '₦100,000',
                        weight: '28g Gold Plate',
                        swatch: 'from-[#FFE082] via-[#FFB300] to-[#8D6E63] border-[#FFE082]',
                        tag: 'Engraved',
                      },
                      {
                        id: 'plastic_black' as CardMaterial,
                        label: 'Matte Obsidian PVC',
                        price: '₦30,000',
                        weight: '5g Matte PVC',
                        swatch: 'from-neutral-700 via-neutral-900 to-black border-neutral-600',
                        tag: 'UV Printed',
                      },
                      {
                        id: 'plastic_white' as CardMaterial,
                        label: 'Glacier White PVC',
                        price: '₦30,000',
                        weight: '5g Pearl PVC',
                        swatch: 'from-white via-slate-100 to-slate-300 border-white',
                        tag: 'UV Printed',
                      },
                    ].map((item) => {
                      const isSelected = heroMaterial === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setHeroMaterial(item.id)}
                          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[96px] ${
                            isSelected
                              ? 'bg-[#D2F843]/10 dark:bg-[#D2F843]/15 border-[#D2F843] ring-2 ring-[#D2F843]/40 shadow-xs'
                              : 'bg-neutral-50 dark:bg-[#151821] border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br ${item.swatch} border shadow-sm shrink-0`} />
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-white/10 text-neutral-700 dark:text-white/70">
                              {item.tag}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[11px] sm:text-xs font-bold text-neutral-950 dark:text-white leading-snug truncate">
                              {item.label}
                            </span>
                            <span className="block text-[9px] sm:text-[10px] text-neutral-500 dark:text-white/50 leading-tight mt-0.5 truncate">
                              {item.weight}
                            </span>
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-neutral-200/60 dark:border-white/5 flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              {item.price}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#6c8600] dark:text-[#D2F843]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Control 2: Real-time Engraving / Printing Inputs */}
                <div>
                  <label className="block text-xs font-bold text-neutral-900 dark:text-white/90 uppercase tracking-wider font-mono mb-2.5">
                    {heroMaterial.includes('metal') ? '2. Fiber-Laser Engrave Your Identity' : '2. Precision UV Print Your Identity'}
                  </label>

                  <div className="flex flex-col gap-2.5">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-white/60">
                        {heroMaterial.includes('metal') ? 'Laser Engraved Name:' : 'UV Printed Name:'}
                      </span>
                      <div className="flex items-center gap-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-neutral-950 dark:focus-within:border-[#D2F843] transition-colors">
                        <input
                          type="text"
                          value={heroCustomName}
                          onChange={(e) => setHeroCustomName(e.target.value)}
                          placeholder="Your Full Name..."
                          maxLength={32}
                          className="w-full bg-transparent text-base sm:text-xs text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Title / Role */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-white/60">
                        {heroMaterial.includes('metal') ? 'Engraved Executive Title / Role:' : 'Printed Title / Role:'}
                      </span>
                      <div className="flex items-center gap-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-neutral-950 dark:focus-within:border-[#D2F843] transition-colors">
                        <input
                          type="text"
                          value={heroCustomTitle}
                          onChange={(e) => setHeroCustomTitle(e.target.value)}
                          placeholder="e.g. Managing Partner & Founder"
                          maxLength={40}
                          className="w-full bg-transparent text-base sm:text-xs text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Company / Enterprise */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-white/60">Company / Brand:</span>
                        <div className="flex items-center gap-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-neutral-950 dark:focus-within:border-[#D2F843] transition-colors">
                          <input
                            type="text"
                            value={heroCompany}
                            onChange={(e) => setHeroCompany(e.target.value)}
                            placeholder="Company Name"
                            maxLength={28}
                            className="w-full bg-transparent text-base sm:text-xs text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-neutral-500 dark:text-white/60">Bio Handle:</span>
                        <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-neutral-950 dark:focus-within:border-[#D2F843] transition-colors">
                          <span className="text-neutral-400 dark:text-white/40 text-xs font-mono">@</span>
                          <input
                            type="text"
                            value={heroHandle}
                            onChange={(e) => setHeroHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                            placeholder="handle"
                            maxLength={20}
                            className="w-full bg-transparent text-base sm:text-xs text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-white/30 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control 3: Pricing and Direct Order Action */}
                <div className="pt-2 border-t border-neutral-200/60 dark:border-white/10">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-white/50 block">Investment Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-neutral-950 dark:text-white">
                          ₦{getMaterialPrice(heroMaterial).toLocaleString()}
                        </span>
                        <span className="text-xs text-neutral-400 dark:text-white/40 line-through">
                          ₦{getMaterialOriginalPrice(heroMaterial).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                      10% VIP Coupon Applied
                    </span>
                  </div>

                  {/* Primary Order CTA */}
                  <button
                    onClick={handleOrderHeroCard}
                    className="group flex items-center justify-center gap-3 w-full py-3.5 pl-2 pr-6 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md cursor-pointer font-bold text-sm"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200 shadow-xs">
                      <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-200 stroke-[2.5]" />
                    </div>
                    <span>Order This Custom Card</span>
                  </button>

                  <p className="text-[11px] text-neutral-500 dark:text-white/50 text-center mt-2.5 flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>
                      {heroMaterial.includes('metal') ? 'Precision fiber-laser engraved' : 'Precision UV printed'} & dispatched within 24h • Insured delivery via DHL & GIG Logistics
                    </span>
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ================= COMPANION ENGINE: CLOUD BIO & PHONE DISPLAY ================= */}
        {/* Shows what happens on the recipient's phone when they tap this physical card */}
        <div className="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-neutral-200/80 dark:border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs mb-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]" />
              Engine 2: Cloud Bio & vCard Engine
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-neutral-950 dark:text-white">
              What Appears On Their Phone In 0.2 Seconds
            </h3>
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed mt-2">
              When anyone taps your physical card with iPhone or Android, their mobile browser instantly opens your synchronized live executive profile. No app download needed.
            </p>
          </div>

          <div className="max-w-xl mx-auto flex justify-center">
            <LiveBioPreview
              name={heroCustomName}
              title={heroCustomTitle}
              company={heroCompany}
              handle={heroHandle}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* ================= STAGE 3: VALUE PROPOSITIONS & REAL-WORLD PROOF ================= */}
      <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 dark:bg-[#0E1017]/50 border-y border-neutral-200/80 dark:border-white/10 relative z-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-2 sm:px-0">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs mb-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]" />
              Physical Hardware Advantage
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-neutral-950 dark:text-white leading-tight">
              Why Nigeria's Top 1% Have Stopped Using Paper Cards
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed mt-2.5 sm:mt-3">
              Paper cards end up forgotten in trouser pockets, car compartments, or the trash within 24 hours. CHIP guarantees your contact is saved directly into the phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant 0.2s Contact Sync',
                desc: 'Tap your card to any iPhone or Android. Their phone immediately opens your profile with a one-tap "Save Contact" button that downloads your full vCard into their address book.',
                tag: 'No App Required',
              },
              {
                icon: RefreshCw,
                title: 'Infinite Cloud Updates',
                desc: 'Changed your office address, phone line, or job title? Update it in your CHIP dashboard in 5 seconds. Your physical card automatically reflects the latest information forever.',
                tag: 'Zero Reprints',
              },
              {
                icon: Shield,
                title: 'Aerospace Durability',
                desc: 'Waterproof, drop-proof, zero battery, and zero charging ever. Crafted from high-density weighted steel or scratch-resistant matte obsidian PVC.',
                tag: 'Lifetime Hardware',
              },
            ].map((prop, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#D2F843]/15 border border-[#D2F843]/30 flex items-center justify-center text-[#6c8600] dark:text-[#D2F843] mb-3.5 sm:mb-4">
                    <prop.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white/70">
                    {prop.tag}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white mt-2.5 sm:mt-3">{prop.title}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-1.5 sm:mt-2">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Glassmorphic Social Media Ecosystem Section */}
          <div className="mt-12 sm:mt-16 p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 relative overflow-hidden shadow-sm">
            {/* Subtle Gold Ambient Radial Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#D2F843]/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6c8600] dark:text-[#D2F843] font-bold px-3 py-1 rounded-full bg-[#D2F843]/15 border border-[#D2F843]/30 mb-2.5 sm:mb-3">
                Omni-Channel Handover
              </span>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 dark:text-white tracking-tight">
                One Tap Connects All 6 Major Ecosystems
              </h3>
              <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 mt-2 max-w-xl leading-relaxed">
                Empower your prospects to reach you on whichever network they prefer. Our smart squircle engine links directly to your verified profiles with zero friction.
              </p>

              {/* Interactive Luxury Glassmorphic Social Media Icon Set */}
              <div className="mt-6 sm:mt-8 mb-3 sm:mb-4 w-full">
                <SocialMediaIconSet
                  size="lg"
                  showLabels={true}
                  onPlatformClick={(platform) => {
                    const el = document.getElementById('social-toast-notice');
                    if (el) {
                      el.innerText = `✓ Instant Tap: Handing over to your verified ${platform.toUpperCase()} profile`;
                      el.classList.remove('opacity-0');
                      setTimeout(() => el.classList.add('opacity-0'), 2500);
                    }
                  }}
                />
              </div>

              <div
                id="social-toast-notice"
                className="opacity-0 transition-opacity duration-300 text-xs font-mono text-emerald-600 dark:text-[#D2F843] bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mt-2"
              >
                ✓ Tap simulated
              </div>
            </div>
          </div>

          {/* Video Demonstration Proof (Real TikTok Embeds - Lazy-loaded) */}
          <div ref={tiktokSectionRef} className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-neutral-200/80 dark:border-white/10">
            <div className="text-center mb-8 sm:mb-10 px-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#6c8600] dark:text-[#D2F843] font-bold">
                See It In Action
              </span>
              <h3 className="text-xl sm:text-3xl font-bold text-neutral-950 dark:text-white mt-1">
                Real Nigerian Founders & Executives Tapping Live
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto w-full">
              <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-white/10 bg-neutral-950 flex justify-center p-1.5 sm:p-2">
                <blockquote
                  className="tiktok-embed w-full"
                  cite="https://www.tiktok.com/@chipng_nfc/video/7628228439719398664"
                  data-video-id="7628228439719398664"
                  style={{ width: '100%', maxWidth: '500px', margin: 0 }}
                >
                  <section></section>
                </blockquote>
              </div>

              <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-white/10 bg-neutral-950 flex justify-center p-1.5 sm:p-2">
                <blockquote
                  className="tiktok-embed w-full"
                  cite="https://www.tiktok.com/@chipng_nfc/video/7680709423232208146"
                  data-video-id="7680709423232208146"
                  style={{ width: '100%', maxWidth: '500px', margin: 0 }}
                >
                  <section></section>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STAGE 4 & 5: STRATEGIC OFFER & TIERED PRICING ================= */}
      <section id="pricing" className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto content-auto w-full">
        
        {/* Scarcity Notice */}
        <div className="max-w-xl mx-auto mb-8 sm:mb-10 p-3 sm:p-3.5 rounded-2xl sm:rounded-full bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 text-xs text-amber-800 dark:text-amber-200 shadow-2xs text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <span>
              <strong>Lagos Production Hub:</strong> Only <strong>6 Metal blanks</strong> remaining in queue today.
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase bg-amber-500/20 px-3 py-1 rounded-full shrink-0">
            Limited Queue
          </span>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 px-2 sm:px-0">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs mb-3 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            <span className="w-2 h-2 rounded-full bg-[#D2F843]" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.035em] text-neutral-950 dark:text-white leading-tight">
            Buy the hardware once. The core software is yours for life.
          </h2>
          <p className="text-xs sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed mt-2.5 sm:mt-3">
            No monthly subscriptions required for core features. Includes lifetime access to CHIP Core + 3-months of CHIP Pro for free.
          </p>
        </div>

        {/* Three-Tier Differentiated Product Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">
          
          {/* TIER 1: SMART PVC CARD (₦30,000) - STARTER UTILITY */}
          <div className="p-5 sm:p-7 md:p-8 rounded-[28px] sm:rounded-[32px] bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-all flex flex-col justify-between relative shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white/90 border border-neutral-200/60 dark:border-white/10 font-bold">
                  Starter Utility • Speed
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">5g Polymer PVC</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">Smart PVC Card</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                The smart, featherlight daily driver built for rapid networking. Replace endless paper stacks with an instant sub-10ms contactless tap.
              </p>

              <div className="flex items-baseline gap-3 my-5 sm:my-6 p-3.5 sm:p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5">
                <span className="text-3xl sm:text-4xl font-black text-neutral-950 dark:text-white">₦30,000</span>
                <span className="text-neutral-400 dark:text-white/40 line-through text-sm">₦45,000</span>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Save 33%
                </span>
              </div>

              <div className="mb-6">
                <span className="text-[11px] font-mono text-neutral-500 dark:text-white/50 uppercase tracking-wider block mb-3 font-semibold">
                  Utility & Hardware Specifications:
                </span>
                <ul className="flex flex-col gap-2.5 sm:gap-3 text-xs text-neutral-700 dark:text-white/80">
                  {[
                    'Sub-10ms NTAG216 High-Speed Contactless Chip',
                    '5g High-Density Scratch-Resistant Polymer PVC',
                    'Full-Color HD Edge-to-Edge UV Cured Printing',
                    'Instant vCard Download directly to Phonebook',
                    'High-Contrast Dynamic Vector QR Backup',
                    'Lifetime CHIP Core Cloud Hosting (₦0 Monthly Fee)',
                    '3-Months Free CHIP Pro Telemetry & Lead Capture',
                    'Standard Nationwide Dispatch (24–48h Delivery)',
                    '12-Month Contactless Hardware Guarantee',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className={i === 0 ? 'font-bold text-neutral-950 dark:text-white' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleOpenCustomizer('plastic', 'plastic_white')}
              className="mt-4 group flex items-center justify-center gap-2.5 w-full py-3.5 pl-2 pr-5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md cursor-pointer font-bold text-xs sm:text-sm min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200 shadow-xs">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-200 stroke-[2.5]" />
              </div>
              <span>Get Smart PVC (₦30,000)</span>
            </button>
          </div>

          {/* TIER 2: NFC SMART METAL CARD (₦50,000) - PROFESSIONAL FIRST IMPRESSION */}
          <div className="p-5 sm:p-7 md:p-8 rounded-[28px] sm:rounded-[32px] bg-neutral-900 text-white dark:bg-[#151821] border border-neutral-700 dark:border-white/10 hover:border-neutral-500 dark:hover:border-white/30 transition-all flex flex-col justify-between relative shadow-lg">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-bold">
                  Professional Metal
                </span>
                <span className="text-xs font-mono text-neutral-300 font-bold">24g Solid Steel</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white">NFC Smart Metal</h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                Precision-milled 24g solid 304 stainless steel with single-sided fiber laser etching. Five times heavier than PVC with an undeniable metallic table presence.
              </p>

              <div className="flex items-baseline gap-3 my-5 sm:my-6 p-3.5 sm:p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                <span className="text-3xl sm:text-4xl font-black text-white">₦50,000</span>
                <span className="text-neutral-400 line-through text-sm">₦75,000</span>
                <span className="text-xs font-bold font-mono text-emerald-400 ml-auto px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Save 33%
                </span>
              </div>

              <div className="mb-6">
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block mb-3 font-semibold">
                  Engineering & Performance Specs:
                </span>
                <ul className="flex flex-col gap-2.5 sm:gap-3 text-xs text-neutral-200">
                  {[
                    '24g Solid 304 Stainless Steel Core (Heavy Weight)',
                    'Permanent High-Precision Fiber-Laser Front Etch',
                    'Ferrite-Shielded Contactless NFC Antenna (<10ms)',
                    'Brushed Space Gray & Obsidian Anodized Finishes',
                    'Crisp Acoustic "Metallic Clink" on Meeting Tables',
                    'Laser-Annealed Scratch-Proof Backside QR Code',
                    'Lifetime CHIP Core Access + 3-Months CHIP Pro',
                    'Priority 24h Lagos Workshop Fabrication Queue',
                    '12-Month Full Hardware Replacement Warranty',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className={i === 0 || i === 1 ? 'font-bold text-white' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleOpenCustomizer('metal', 'metal_spacegray')}
              className="mt-4 group flex items-center justify-center gap-2.5 w-full py-3.5 pl-2 pr-5 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 active:scale-[0.98] transition-all duration-200 shadow-md cursor-pointer font-bold text-xs sm:text-sm min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200 shadow-xs">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-200 stroke-[2.5]" />
              </div>
              <span>Get Smart Metal (₦50,000)</span>
            </button>
          </div>

          {/* TIER 3: CUSTOM HEAVY METAL EDITION (₦100,000) - BOARDROOM AUTHORITY */}
          <div className="mt-4 md:mt-0 relative p-5 sm:p-7 md:p-8 rounded-[28px] sm:rounded-[32px] bg-neutral-950 text-white dark:bg-[#151821] border-2 border-[#D2F843] shadow-[0_10px_40px_rgba(210,248,67,0.18)] flex flex-col justify-between transform lg:-translate-y-2">
            
            {/* Bestseller Badge */}
            <div className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#D2F843] text-neutral-950 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
              ★ Executive Bestseller • Boardroom Choice
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-[#D2F843]/20 text-[#D2F843] border border-[#D2F843]/40 font-bold">
                  Bespoke Luxury • Authority
                </span>
                <span className="text-xs font-mono text-[#D2F843] font-bold">28g Aerospace Alloy</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white">Custom Heavy Metal</h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
                Ultra-dense 28g aerospace-grade alloy with deep CNC dual-sided fiber engraving. Signals undeniable prestige when closing eight-figure luxury contracts.
              </p>

              <div className="flex items-baseline gap-3 my-5 sm:my-6 p-3.5 sm:p-4 rounded-2xl bg-white/[0.05] border border-white/10">
                <span className="text-3xl sm:text-4xl font-black text-white">₦100,000</span>
                <span className="text-neutral-400 line-through text-sm">₦150,000</span>
                <span className="text-xs font-bold font-mono text-[#D2F843] ml-auto px-2.5 py-1 rounded-full bg-[#D2F843]/15 border border-[#D2F843]/30">
                  Save 33%
                </span>
              </div>

              <div className="mb-6">
                <span className="text-[11px] font-mono text-neutral-300 uppercase tracking-wider block mb-3 font-semibold">
                  Executive Craftsmanship Specs:
                </span>
                <ul className="flex flex-col gap-2.5 sm:gap-3 text-xs text-white/90">
                  {[
                    'Deep Dual-Sided CNC Fiber-Laser Relief Engraving',
                    '28g Ultra-Dense Aerospace-Grade Stainless Alloy',
                    '24K Matte Mirror Gold or Obsidian Black PVD Coating',
                    'Tuned 360° Ceramic Radio-Frequency Induction Loop',
                    'Optional Functional EMV Debit Chip Transplant Ready',
                    '1-on-1 Bespoke Concierge Digital Designer Proof Review',
                    'VIP Same-Day Lagos Bench Queue & Express Courier',
                    '12 Months Free CHIP Pro Telemetry & Lead Capture',
                    'Lifetime Indestructible Hardware & Engraving Warranty',
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D2F843] shrink-0 mt-0.5" />
                      <span className={i < 3 ? 'font-bold text-white' : ''}>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleOpenCustomizer('debit', 'metal_gold')}
              className="mt-4 group flex items-center justify-center gap-2.5 w-full py-3.5 pl-2 pr-5 rounded-full bg-[#D2F843] text-neutral-950 hover:bg-[#bce42d] active:scale-[0.98] transition-all duration-200 shadow-md cursor-pointer font-extrabold text-xs sm:text-sm min-h-[44px]"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200 shadow-xs">
                <ArrowRight className="w-3.5 h-3.5 -rotate-45 group-hover:rotate-0 transition-transform duration-200 stroke-[2.5]" />
              </div>
              <span>Build Custom Metal Card (10% Off)</span>
            </button>
          </div>

        </div>

        {/* Dropped-in Product Comparison Matrix Component */}
        <ProductComparisonMatrix
          onSelectTier={(tier) => {
            if (tier === 'plastic') {
              handleOpenCustomizer('plastic', 'plastic_white');
            } else if (tier === 'metal') {
              handleOpenCustomizer('metal', 'metal_spacegray');
            } else {
              handleOpenCustomizer('debit', 'metal_gold');
            }
          }}
        />
      </section>

      {/* ================= FAQ & ASSURANCE ================= */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-neutral-50/50 dark:bg-[#0E1017] border-t border-neutral-200/80 dark:border-white/10 relative z-10 content-auto">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs mb-4 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]" />
              Got Questions?
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-neutral-950 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-normal mt-2">
              Everything you need to know about CHIP NFC cards and dynamic bio profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                q: 'Does the person receiving my card need an app?',
                a: 'No app is required! When you tap your CHIP card against an iPhone or Android phone, their browser opens your profile instantly in 0.2 seconds. From there, they can click "Save Contact" to directly download your vCard.',
              },
              {
                q: 'Can I change my phone number or links later?',
                a: 'Yes, 100%! Your physical card is linked to your digital CHIP cloud bio. You can log into your dashboard anytime, edit your links, title, or phone numbers, and your physical card will instantly point to your updated information.',
              },
              {
                q: 'How do I submit my custom logo and design?',
                a: 'During customization you can specify your text and handle. Immediately after checkout, you can upload high-resolution vector logos via our dedicated VIP WhatsApp Concierge. PVC cards are precision full-color UV printed with protective coating, while Metal cards are fiber-laser deep engraved. Our production team sends you a digital proof before fabrication.',
              },
              {
                q: 'How fast is delivery across Nigeria?',
                a: 'We manufacture and customize all cards in our Lagos facility. Deliveries within Lagos arrive in 24–48 hours. Nationwide deliveries to Abuja, Port Harcourt, and other states take 2–4 business days via DHL & GIG Logistics.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-7 rounded-[24px] bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 flex flex-col gap-2.5 shadow-xs">
                <h4 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#6c8600] dark:text-[#D2F843] shrink-0 mt-1" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed pl-6.5">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Direct WhatsApp Concierge Help */}
          <div className="mt-14 p-7 sm:p-9 rounded-[32px] bg-neutral-950 text-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Have a Corporate Bulk Order or Custom Request?</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Our VIP Concierge is available 24/7 on WhatsApp for executive assistance.</p>
              </div>
            </div>

            <a
              href="https://wa.me/2348100764154?text=Hello%20CHIP%20NG!%20I%20have%20a%20question%20about%20ordering%20a%20custom%20NFC%20card."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] text-black hover:bg-[#20bd5a] flex items-center gap-2 shrink-0 transition-all shadow-sm"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Makro Homepage Footer */}
      <MakroFooter onNavigate={onNavigate || (() => {})} />

      {/* ================= MODALS & INTERACTIVE FUNNELS ================= */}
      <Suspense fallback={null}>
        {isCustomizerOpen && (
          <CardCustomizerModal
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            initialTier={selectedInitialTier}
            initialMaterial={selectedInitialMaterial}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {isCheckoutOpen && customizationData && (
          <CheckoutOnboardingModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            data={customizationData}
            onNavigate={onNavigate}
          />
        )}
      </Suspense>

      {/* Mobile Sticky Bar with iOS safe-area inset support */}
      <div className="fixed bottom-0 left-0 w-full px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-white/95 dark:bg-[#0A0B0E]/95 backdrop-blur-xl border-t border-neutral-200/80 dark:border-white/10 z-40 md:hidden flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-mono text-[#6c8600] dark:text-[#D2F843] font-bold flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            10% VIP Discount Active
          </span>
          <span className="text-xs font-bold text-neutral-950 dark:text-white truncate">
            PVC ₦30k • Metal ₦50k–₦100k
          </span>
        </div>

        <button
          onClick={() => handleOpenCustomizer('metal')}
          onMouseEnter={preloadFunnelModals}
          className="px-5 py-2.5 rounded-full font-bold text-xs bg-neutral-950 text-white dark:bg-[#D2F843] dark:text-neutral-950 hover:opacity-90 active:scale-95 transition-transform shadow-sm cursor-pointer whitespace-nowrap min-h-[42px] flex items-center justify-center shrink-0"
        >
          <span>Customize Now</span>
        </button>
      </div>

    </div>
  );
}
