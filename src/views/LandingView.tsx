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
import { SocialProofToast } from '../components/funnel/SocialProofToast';

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#76BB08] selection:text-neutral-950">
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

        {/* Live Purchase Social Proof Notification Pop-up */}
        <SocialProofToast
          onOrderClick={() => {
            const el = document.getElementById('shop');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </main>

      {/* Makro Institutional Footer */}
      <MakroFooter
        onNavigate={onNavigate}
      />
    </div>
  );
}
