import React from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroHero } from '../components/makro/MakroHero';
import { MakroMarquee } from '../components/makro/MakroMarquee';
import { MakroBentoFeatures } from '../components/makro/MakroBentoFeatures';
import { MakroShop } from '../components/makro/MakroShop';
import { CorporateBundleSection } from '../components/makro/CorporateBundleSection';
import { MakroInteractiveShowcase } from '../components/makro/MakroInteractiveShowcase';
import { MakroProofStats } from '../components/makro/MakroProofStats';
import { MakroTestimonials } from '../components/makro/MakroTestimonials';
import { MakroFAQ } from '../components/makro/MakroFAQ';
import { MakroCTA } from '../components/makro/MakroCTA';
import { MakroFooter } from '../components/makro/MakroFooter';
import { SeoHead } from '../components/seo/SeoHead';

interface LandingViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export default function LandingView({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}: LandingViewProps) {
  const handleGetStarted = () => {
    if (session) {
      onNavigate('user-dashboard');
    } else {
      onNavigate('login');
    }
  };

  const pathname = typeof window !== 'undefined' ? window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/' : '/';
  const seoMeta =
    pathname === '/pricing'
      ? {
          title: 'CHIP NG 2026 Pricing — Smart PVC (₦30k) & Stainless Steel Metal Cards (₦50k)',
          description:
            'Transparent 2026 pricing for CHIP NG NFC business cards in Nigeria. White PVC (₦30,000), Black PVC (₦35,000), Metal Card (₦50,000), Custom Metal (₦80k–₦100k), Corporate Fleet (₦300k).',
          canonicalPath: '/pricing',
        }
      : pathname === '/faq'
      ? {
          title: 'Frequently Asked Questions — How CHIP NG NFC Cards Work | CHIP NG',
          description:
            'Answers on iPhone & Android NFC compatibility, sub-10ms NTAG216 speed, vCard saving, zero monthly fees, custom metal engraving, and 24h Lagos delivery.',
          canonicalPath: '/faq',
        }
      : pathname === '/app' || pathname === '/android' || pathname === '/download'
      ? {
          title: 'CHIP NG Companion App — Instant NFC Chip Programming & Radar | Android & iOS',
          description:
            'Download the official CHIP NG Mobile App to program NTAG216 smart cards directly from your phone, capture leads, and track analytics in real time.',
          canonicalPath: '/app',
        }
      : {
          title: 'CHIP NG — Smart NFC Business Cards & Link-in-Bio Platform',
          description:
            'The premier contactless NFC smart business cards and dynamic link-in-bio platform in Nigeria. Sub-10ms NTAG216 response, zero app needed. Smart PVC (₦30,000), Smart Metal (₦50,000), Custom Metal (₦80,000–₦100,000).',
          canonicalPath: '/',
        };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#16a34a] selection:text-neutral-950">
      <SeoHead
        title={seoMeta.title}
        description={seoMeta.description}
        canonicalPath={seoMeta.canonicalPath}
        keywords="NFC business card Nigeria, smart business card Lagos, digital business card Nigeria, NFC metal card, link in bio Nigeria, CHIP NG"
      />
      {/* Makro Navigation Top Bar */}
      <MakroNavbar
        currentView="landing"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1">
        {/* Exact Hero Section matching the user image & preview link */}
        <MakroHero
          onGetStarted={handleGetStarted}
          onExploreCards={() => {
            const el = document.getElementById('shop');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Marquee Ticker */}
        <MakroMarquee />

        {/* Makro 4-card Bento Grid */}
        <MakroBentoFeatures
          onAction={handleGetStarted}
        />

        {/* Official Super Admin Shop Reflection Component */}
        <MakroShop
          onNavigate={onNavigate}
        />

        {/* Corporate Fleet Bundle (10 PVC + 1 Free CEO Metal - ₦300k) */}
        <CorporateBundleSection
          onNavigate={onNavigate}
        />

        {/* Interactive Feature Gallery Component */}
        <MakroInteractiveShowcase
          onGetStarted={handleGetStarted}
        />

        {/* Quantified Impact Metrics */}
        <MakroProofStats />

        {/* Founder & Solopreneur Testimonials Bento */}
        <MakroTestimonials />

        {/* FAQ Accordion */}
        <MakroFAQ />

        {/* High-Conversion Bottom CTA Banner */}
        <MakroCTA
          onGetStarted={handleGetStarted}
        />
      </main>

      {/* Makro Institutional Footer */}
      <MakroFooter
        onNavigate={onNavigate}
      />
    </div>
  );
}
