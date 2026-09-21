'use client';

import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';

import { Card3DRotator, CardMaterial } from '../components/funnel/Card3DRotator';
import { LiveBioPreview } from '../components/funnel/LiveBioPreview';
import { CardCustomizerModal, CardCustomizationData } from '../components/funnel/CardCustomizerModal';
import { CheckoutOnboardingModal } from '../components/funnel/CheckoutOnboardingModal';
import { SocialProofToast } from '../components/funnel/SocialProofToast';
import { SocialMediaIconSet, SocialPlatform } from '../components/social/SocialMediaIconSet';
import { TikTokPixelTesterModal } from '../components/analytics/TikTokPixelTesterModal';
import { trackTikTokEvent } from '../utils/tiktokPixel';

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

export default function NfcSalesView({ onNavigate }: { onNavigate?: (view: any) => void }) {
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

  // 3. Modals & Funnel State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPixelTesterOpen, setIsPixelTesterOpen] = useState(false);
  const [selectedInitialTier, setSelectedInitialTier] = useState<'plastic' | 'metal' | 'debit'>('metal');
  const [selectedInitialMaterial, setSelectedInitialMaterial] = useState<CardMaterial>('metal_spacegray');
  const [customizationData, setCustomizationData] = useState<CardCustomizationData | null>(null);

  // 4. Scarcity & Urgency Timer (15 Minutes)
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [hasDiscountLocked, setHasDiscountLocked] = useState(false);

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

  // TikTok embed script lazy loader
  useEffect(() => {
    let script: HTMLScriptElement;
    const timer = setTimeout(() => {
      script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }, 2500);

    return () => {
      clearTimeout(timer);
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
          badge: '🚀 Tech Founders & Venture Capital Edition',
          headline: 'Pitch Less. Connect Instantly. Close More Term Sheets.',
          subheadline:
            'For Startup Founders, Tech Operators, and Angel Investors. Hand VCs, clients, and talent your live pitch deck, Calendly booking link, and portfolio in one single contactless tap.',
          socialProof: 'Used by Founders backed by Y Combinator, Techstars, Ventures Platform, and Google for Startups.',
          ctaPrimary: 'Build Founder Smart Card (10% Off)',
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

    // Track TikTok AddToCart event
    const itemPrice = tier === 'plastic' 
      ? (material === 'plastic_white' ? 30000 : 35000) 
      : tier === 'debit' ? 100000 : 50000;

    trackTikTokEvent('AddToCart', {
      content_type: 'product',
      content_name: `${tier.toUpperCase()} NFC Card (${material || 'default'})`,
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
    <div className="min-h-screen bg-[#07090D] text-white selection:bg-[#B600A8] selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Dynamic Social Proof & Urgency Bar */}
      <SocialProofToast
        remainingStock={6}
        discountSecondsLeft={secondsLeft}
        hasDiscount={hasDiscountLocked}
      />

      {/* Background Ambience Light Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#B600A8]/20 via-purple-900/10 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[160px] pointer-events-none z-0" />

      {/* Top Header Navigation */}
      <header className="relative z-30 w-full border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div 
            onClick={() => onNavigate && onNavigate('landing')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B600A8] to-purple-800 flex items-center justify-center font-display font-black text-white text-base shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform">
              C
            </div>
            <span className="font-display font-black text-xl tracking-tight text-white">
              CHIP<span className="text-[#B600A8]">.NG</span>
            </span>
          </div>

          {/* Quick CTA & Guarantee */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setIsPixelTesterOpen(true)}
              title="Test & Inspect TikTok Pixel Events"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono bg-black/60 border border-[#25F4EE]/40 text-[#25F4EE] hover:bg-[#25F4EE]/10 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
              <span className="hidden sm:inline">TikTok Pixel</span>
              <span className="sm:hidden">Pixel</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Lagos Workshop Active</span>
            </div>

            <button
              onClick={() => handleOpenCustomizer('metal')}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer hover:border-[#B600A8]/50"
            >
              Build Your Card
            </button>
          </div>
        </div>
      </header>

      {/* ================= STAGE 1 & 2: TRAFFIC ALIGNMENT & OPTIMIZED HERO ================= */}
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 z-10 max-w-7xl mx-auto">
        
        {/* Persona Switcher Tab Strip (Traffic Alignment) */}
        <div className="flex flex-col items-center mb-8">
          <div className="inline-flex p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            {[
              { id: 'founder', label: '🚀 Founders & VCs', icon: Briefcase },
              { id: 'executive', label: '👔 Executives & C-Suite', icon: Building2 },
              { id: 'creator', label: '🎨 Creators & Media', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPersona(tab.id as PersonaType)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  persona === tab.id
                    ? 'bg-gradient-to-r from-[#B600A8] to-purple-700 text-white shadow-md shadow-purple-950/60'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {utmSource && (
            <span className="text-[10px] font-mono text-white/40 mt-2">
              Personalized campaign matched for <strong className="text-white uppercase">{utmSource}</strong>
            </span>
          )}
        </div>

        {/* Hero Copywriting Block */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <FadeIn y={15}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B600A8]/15 border border-[#B600A8]/30 text-[#E395F7] text-xs font-mono uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{personaContent.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight leading-[1.15] text-white">
              {personaContent.headline}
            </h1>

            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
              {personaContent.subheadline}
            </p>

            {/* Persona highlights pill row */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5 text-xs text-white/80 font-mono">
              {personaContent.keyPillars.map((pillar, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{pillar}</span>
                </span>
              ))}
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8">
              <button
                onClick={() => handleOpenCustomizer('metal')}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-base bg-gradient-to-r from-[#B600A8] via-purple-600 to-[#7621B0] text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-950/60 active:scale-95 transition-all"
              >
                <span>{personaContent.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('pricing');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-full font-bold text-sm bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Compare Pricing Tiers</span>
              </button>
            </div>

            <p className="text-xs text-white/50 mt-4 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>{personaContent.socialProof}</span>
            </p>
          </FadeIn>
        </div>

        {/* ================= DUAL-ENGINE INTERACTIVE SHOWCASE ================= */}
        {/* Shows 3D Card Rotator + Live Bio Preview side-by-side */}
        <div className="bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#B600A8] font-bold">
                The Dual-Engine Experience
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Physical Hardware + Cloud Bio Engine
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Rotate the 3D card on the left. Tap or preview the instantaneous live mobile bio profile on the right.
              </p>
            </div>

            {/* Quick Material Switcher for Hero */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10 shrink-0">
              {[
                { id: 'metal_spacegray', label: 'Space Gray Steel' },
                { id: 'metal_gold', label: '24K Matte Gold' },
                { id: 'plastic_black', label: 'Matte Obsidian' },
                { id: 'plastic_white', label: 'Glacier White' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setHeroMaterial(m.id as CardMaterial)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    heroMaterial === m.id
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Engine: 3D Card Rotator */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-[#B600A8]" />
                <span>Engine 1: Aerospace Physical Card</span>
              </span>

              <Card3DRotator
                material={heroMaterial}
                customName={heroCustomName}
                customTitle={heroCustomTitle}
                customCompany={heroCompany}
                qrUrl={`https://chipng.com/@${heroHandle}`}
                className="w-full"
              />

              {/* Quick Input Sync Controls */}
              <div className="mt-6 w-full max-w-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Name:</span>
                  <input
                    type="text"
                    value={heroCustomName}
                    onChange={(e) => setHeroCustomName(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                    placeholder="Type name to reflect on 3D card..."
                  />
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Title:</span>
                  <input
                    type="text"
                    value={heroCustomTitle}
                    onChange={(e) => setHeroCustomTitle(e.target.value)}
                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                    placeholder="Type title..."
                  />
                </div>
              </div>
            </div>

            {/* Right Engine: Live Bio Profile Phone Mockup */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine 2: Cloud Bio & vCard Engine</span>
              </span>

              <LiveBioPreview
                name={heroCustomName}
                title={heroCustomTitle}
                company={heroCompany}
                handle={heroHandle}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= STAGE 3: VALUE PROPOSITIONS & REAL-WORLD PROOF ================= */}
      <section className="py-20 px-4 sm:px-6 bg-white/[0.02] border-y border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              Why Nigeria's Top 1% Have Stopped Using Paper Cards
            </h2>
            <p className="text-sm sm:text-base text-white/70 mt-3">
              Paper cards end up forgotten in trouser pockets, car compartments, or the trash within 24 hours. CHIP guarantees your contact is saved directly into the phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="p-6 rounded-3xl bg-black/40 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#B600A8]/20 border border-[#B600A8]/30 flex items-center justify-center text-[#B600A8] mb-4">
                    <prop.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-white/10 text-white/70">
                    {prop.tag}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-3">{prop.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed mt-2">{prop.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Glassmorphic Social Media Ecosystem Section */}
          <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-white/[0.04] to-black/60 border border-white/10 relative overflow-hidden backdrop-blur-md">
            {/* Subtle Gold Ambient Radial Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 mb-3">
                Omni-Channel Handover
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white tracking-tight">
                One Tap Connects All 6 Major Ecosystems
              </h3>
              <p className="text-sm sm:text-base text-white/60 mt-2 max-w-xl leading-relaxed">
                Empower your prospects to reach you on whichever network they prefer. Our smart squircle engine links directly to your verified profiles with zero friction.
              </p>

              {/* Interactive Luxury Glassmorphic Social Media Icon Set */}
              <div className="mt-8 mb-4">
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
                className="opacity-0 transition-opacity duration-300 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full mt-2"
              >
                ✓ Tap simulated
              </div>
            </div>
          </div>

          {/* Video Demonstration Proof (Real TikTok Embeds) */}
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="text-center mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B600A8] font-bold">
                See It In Action
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Real Nigerian Founders & Executives Tapping Live
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black flex justify-center p-2">
                <blockquote
                  className="tiktok-embed"
                  cite="https://www.tiktok.com/@chipng_nfc/video/7628228439719398664"
                  data-video-id="7628228439719398664"
                  style={{ maxWidth: '605px', minWidth: '320px', margin: 0 }}
                >
                  <section></section>
                </blockquote>
              </div>

              <div className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black flex justify-center p-2">
                <blockquote
                  className="tiktok-embed"
                  cite="https://www.tiktok.com/@chipng_nfc/video/7680709423232208146"
                  data-video-id="7680709423232208146"
                  style={{ maxWidth: '605px', minWidth: '320px', margin: 0 }}
                >
                  <section></section>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STAGE 4 & 5: STRATEGIC OFFER & TIERED PRICING ================= */}
      <section id="pricing" className="py-24 px-4 sm:px-6 relative z-10 max-w-7xl mx-auto">
        
        {/* Scarcity Notice */}
        <div className="max-w-xl mx-auto mb-10 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Lagos Hub Batch #18:</strong> Only <strong>6 Metal blanks</strong> remaining in stock for today’s production run.
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-300 font-bold uppercase bg-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
            Limited Queue
          </span>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white">
            Choose Your Hardware Tier
          </h2>
          <p className="text-sm sm:text-base text-white/70 mt-3">
            One-time payment. Zero subscription fees. Free lifetime digital profile hosting and nationwide delivery included.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          
          {/* TIER 1A: SMART PLASTIC (WHITE) */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-white/10 text-white/80">
                Starter Hardware
              </span>
              <h3 className="text-2xl font-bold text-white mt-4">Smart Plastic NFC (White)</h3>
              <p className="text-xs text-white/60 mt-1">High-density glacier white pearl PVC with instant contactless chip & dynamic QR.</p>

              <div className="flex items-baseline gap-2 my-6">
                <span className="text-4xl font-black text-white">₦30,000</span>
                <span className="text-white/40 line-through text-sm">₦45,000</span>
                <span className="text-[11px] font-bold text-emerald-400 ml-auto">Save 33%</span>
              </div>

              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-white/80">
                {[
                  'Clean Pearl Glacier White Finish',
                  'Instant 0.2s NFC Contactless Chip',
                  'Dynamic Backside Laser/Silk QR Code',
                  'Free Digital Profile Hosting Forever',
                  'One-Tap vCard Phonebook Sync',
                  'Nationwide Delivery in Nigeria',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleOpenCustomizer('plastic', 'plastic_white')}
              className="mt-8 w-full py-4 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              Customize Smart Plastic (White)
            </button>
          </div>

          {/* TIER 1B: SMART PLASTIC (BLACK) */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-white/10 text-white/80">
                Starter Hardware
              </span>
              <h3 className="text-2xl font-bold text-white mt-4">Smart Plastic NFC (Black)</h3>
              <p className="text-xs text-white/60 mt-1">High-density matte obsidian PVC with instant contactless chip & dynamic QR.</p>

              <div className="flex items-baseline gap-2 my-6">
                <span className="text-4xl font-black text-white">₦35,000</span>
                <span className="text-white/40 line-through text-sm">₦50,000</span>
                <span className="text-[11px] font-bold text-emerald-400 ml-auto">Save 30%</span>
              </div>

              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-white/80">
                {[
                  'Deep Matte Obsidian Black Finish',
                  'Instant 0.2s NFC Contactless Chip',
                  'Dynamic Backside Laser/Silk QR Code',
                  'Free Digital Profile Hosting Forever',
                  'One-Tap vCard Phonebook Sync',
                  'Nationwide Delivery in Nigeria',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleOpenCustomizer('plastic', 'plastic_black')}
              className="mt-8 w-full py-4 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              Customize Smart Plastic (Black)
            </button>
          </div>

          {/* TIER 2: SMART METAL (MOST POPULAR / CRO BESTSELLER) */}
          <div className="relative p-7 rounded-3xl bg-gradient-to-b from-[#1E1824] via-[#120F17] to-black border-2 border-[#B600A8] shadow-[0_0_50px_rgba(182,0,168,0.25)] flex flex-col justify-between transform xl:-translate-y-4">
            
            {/* Bestseller Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#B600A8] to-purple-600 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
              ★ Most Popular • Executive Pick
            </div>

            <div>
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-[#B600A8]/20 text-[#E0A3F8] border border-[#B600A8]/30">
                28g Weighted Steel
              </span>
              <h3 className="text-2xl font-bold text-white mt-4">Smart Metal NFC</h3>
              <p className="text-xs text-white/60 mt-1">Deep fiber-laser etched stainless steel with matte titanium finish.</p>

              <div className="flex items-baseline gap-2 my-6">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#B600A8]">
                  ₦50,000
                </span>
                <span className="text-white/40 line-through text-sm">₦75,000</span>
                <span className="text-[11px] font-bold text-emerald-400 ml-auto">Save 33%</span>
              </div>

              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-white/80">
                {[
                  'Heavyweight 28g Aerospace Stainless Steel',
                  'Precision Fiber Laser Etched Name & Logo',
                  'Space Gray or 24K Matte Gold Finish',
                  'Priority Production Queue (24h Dispatch)',
                  'Dynamic Contactless Chip + Dynamic QR',
                  'Lifetime Cloud Profile & vCard Engine',
                  'Insured DHL / GIG Express Shipping',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B600A8] shrink-0" />
                    <span className={i === 0 || i === 1 ? 'font-bold text-white' : ''}>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleOpenCustomizer('metal', 'metal_spacegray')}
              className="mt-8 w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#B600A8] via-purple-600 to-[#7621B0] text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-950/60 active:scale-98 transition-all"
            >
              <span>Build Custom Metal Card (10% Off)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* TIER 3: METAL DEBIT CONVERT (LUXURY DUAL-CHIP) */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                👑 Luxury Dual-Chip
              </span>
              <h3 className="text-2xl font-bold text-white mt-4">Metal Debit Convert</h3>
              <p className="text-xs text-white/60 mt-1">
                Converts your existing bank card into a heavyweight metal card with EMV payment + CHIP NFC networking.
              </p>

              <div className="flex items-baseline gap-2 my-6">
                <span className="text-4xl font-black text-white">₦100,000</span>
                <span className="text-white/40 line-through text-sm">₦140,000</span>
                <span className="text-[11px] font-bold text-emerald-400 ml-auto">Save 28%</span>
              </div>

              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-white/80">
                {[
                  'EMV Banking Chip Transplant (Pay for dinners)',
                  'Integrated CHIP NFC Digital Networking',
                  '24K Gold Mirror or Stealth Black Steel',
                  'Heavyweight 32g Luxury Weight',
                  'Full Laser Engraving (Front & Back)',
                  'VIP Private Concierge Delivery',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleOpenCustomizer('debit', 'metal_gold')}
              className="mt-8 w-full py-4 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              Order Metal Debit Convert
            </button>
          </div>
        </div>
      </section>

      {/* ================= FAQ & ASSURANCE ================= */}
      <section className="py-20 px-4 sm:px-6 bg-white/[0.02] border-t border-white/10 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-white/60 mt-2">
              Everything you need to know about CHIP NFC cards and dynamic bio profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                a: 'During customization you can specify your text and handle. Immediately after checkout, you can upload high-resolution vector logos via our dedicated VIP WhatsApp Concierge, where our master engravers will send you a digital proof before laser etching.',
              },
              {
                q: 'How fast is delivery across Nigeria?',
                a: 'We manufacture and laser-engrave all cards in our Lagos facility. Deliveries within Lagos arrive in 24–48 hours. Abuja, Port Harcourt, and other states take 2–4 business days via DHL Express or GIG Logistics.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2">
                <h4 className="font-bold text-sm sm:text-base text-white flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#B600A8] shrink-0 mt-1" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>

          {/* Direct WhatsApp Concierge Help */}
          <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-black via-white/5 to-black border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Have a Corporate Bulk Order or Custom Request?</h4>
                <p className="text-xs text-white/60">Our VIP Concierge is available 24/7 on WhatsApp for executive assistance.</p>
              </div>
            </div>

            <a
              href="https://wa.me/2348100764154?text=Hello%20CHIP%20NG!%20I%20have%20a%20question%20about%20ordering%20a%20custom%20NFC%20card."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#25D366] text-black hover:bg-[#20bd5a] flex items-center gap-2 shrink-0 transition-all"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 border-t border-white/10 text-center text-xs font-mono text-white/40">
        <p>© {new Date().getFullYear()} CHIP NG Technologies Limited. All rights reserved.</p>
        <p className="mt-1">Crafted with precision for Nigeria's ambitious founders, executives, and creators.</p>
        <button
          onClick={() => setIsPixelTesterOpen(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-[#25F4EE]/70 hover:text-[#25F4EE] transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] animate-pulse" />
          Test TikTok Pixel Events (Pixel ID: DAO7GLRC77U5LL2S2TIG)
        </button>
      </footer>

      {/* ================= MODALS & INTERACTIVE FUNNELS ================= */}
      
      {/* TikTok Pixel Inspector & Test Diagnostic Tool */}
      <TikTokPixelTesterModal
        isOpen={isPixelTesterOpen}
        onClose={() => setIsPixelTesterOpen(false)}
      />

      {/* 1. Multi-Step Card Customizer & Lead Capture (Interest & Urgency) */}
      <CardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        initialTier={selectedInitialTier}
        initialMaterial={selectedInitialMaterial}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* 2. Seamless Paystack & Post-Purchase Onboarding Engine (Action) */}
      {customizationData && (
        <CheckoutOnboardingModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          data={customizationData}
          onNavigate={onNavigate}
        />
      )}

      {/* Mobile Sticky Bar */}
      <div className="fixed bottom-0 left-0 w-full p-3.5 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40 md:hidden flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-emerald-400 font-bold">10% VIP Coupon Available</span>
          <span className="text-sm font-bold text-white">Smart Metal ₦50,000</span>
        </div>

        <button
          onClick={() => handleOpenCustomizer('metal')}
          className="px-6 py-2.5 rounded-full font-bold text-xs bg-gradient-to-r from-[#B600A8] to-purple-600 text-white shadow-lg shadow-purple-950/60"
        >
          Customize Now
        </button>
      </div>

    </div>
  );
}
