import React, { useState } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { COMMERCIAL_PAGES, CommercialPageInfo } from '../data/commercialPagesData';
import { 
  Zap, 
  Smartphone, 
  RefreshCw, 
  BarChart, 
  Shield, 
  Truck, 
  MessageCircle, 
  QrCode, 
  Building2, 
  Users, 
  Check, 
  CreditCard, 
  Globe, 
  Download, 
  Sliders, 
  Radio, 
  ArrowRight, 
  ChevronDown, 
  PhoneCall, 
  Star,
  CheckCircle2
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import chipngExactTile from '../assets/images/chipng_exact_tile.png';

interface CommercialLandingViewProps {
  slug: string;
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export default function CommercialLandingView({
  slug,
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}: CommercialLandingViewProps) {
  const page: CommercialPageInfo = COMMERCIAL_PAGES[slug] || COMMERCIAL_PAGES['nfc-business-card-nigeria'];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Icon mapping
  const renderIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Zap': return <Zap className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'RefreshCw': return <RefreshCw className={className} />;
      case 'BarChart': return <BarChart className={className} />;
      case 'Truck': return <Truck className={className} />;
      case 'MessageCircle': return <MessageCircle className={className} />;
      case 'QrCode': return <QrCode className={className} />;
      case 'Building2': return <Building2 className={className} />;
      case 'Users': return <Users className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Download': return <Download className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Shield':
      default: return <Shield className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between selection:bg-[#D2F843] selection:text-neutral-950 font-sans">
      <MakroNavbar
        currentView="landing"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#D2F843] animate-pulse"></span>
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono tracking-tight">
                    {page.heroBadge}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.08]">
                  {page.headline}
                </h1>

                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed max-w-2xl">
                  {page.subheadline}
                </p>

                {page.locationFocus && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#6b8500] dark:text-[#D2F843] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span>
                    <span>Service Territory: {page.locationFocus}</span>
                  </div>
                )}

                <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-5">
                  <button
                    onClick={() => onNavigate('nfc-sales')}
                    className="group flex items-center gap-3 pl-2 pr-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center group-hover:translate-x-0.5 transition-transform shadow-xs">
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">
                      Order Your CHIP Card
                    </span>
                  </button>

                  <a
                    href="https://wa.me/2348100764154?text=Hi%20CHIP%20NG%2C%20I%20am%20interested%20in%20an%20NFC%20Smart%20Business%20Card.%20Please%20share%20details."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>

                <div className="pt-2 flex items-center gap-3 text-xs text-neutral-500">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span>Rated 4.9/5 by 25,000+ Nigerian Founders & Professionals</span>
                </div>
              </div>

              {/* Right: Exact 3D Visual Card Card */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full max-w-[380px] bg-gradient-to-b from-white to-neutral-50 dark:from-[#12141B] dark:to-[#0D0E12] rounded-3xl p-8 border border-neutral-200/80 dark:border-white/10 shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={chipngExactTile} 
                      alt="CHIP NG 3D Emblem" 
                      className="w-36 h-36 object-contain filter drop-shadow-xl animate-pulse" 
                    />
                  </div>
                  
                  <div className="space-y-3 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] font-mono text-[11px] font-bold">
                      SMART NFC HARDWARE
                    </div>
                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
                      Instant 1-Tap Activation
                    </h3>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Embedded with NXP NTAG216 high-frequency contactless coil. Opens your dynamic bio link on all iPhones & Androids with zero app installation.
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-neutral-200/60 dark:border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Fast Lagos Delivery:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">24–48 Hours</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Nationwide Express:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">DHL & GIG Logistics</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Profile Updates:</span>
                      <span className="font-semibold text-emerald-600 dark:text-[#D2F843]">Unlimited Lifetime Free</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Detailed Overview */}
        <section className="py-16 md:py-20 bg-white dark:bg-[#07080B] border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Why {page.targetAudience} Choose CHIP NG
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {page.overview}
            </p>
          </div>
        </section>

        {/* Key Benefits Grid */}
        <section className="py-20 md:py-24 bg-[#FAFAFA] dark:bg-[#0A0B0E] border-b border-neutral-200/80 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6b8500] dark:text-[#D2F843]">
                Engineered for High-Stakes Networking
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-2">
                Everything You Need to Connect & Convert
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.keyBenefits.map((b, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#12141B] rounded-2xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] flex items-center justify-center">
                    {renderIcon(b.icon)}
                  </div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                    {b.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Use-Cases & Proof */}
        {page.useCases && page.useCases.length > 0 && (
          <section className="py-20 md:py-24 bg-white dark:bg-[#07080B] border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-12">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6b8500] dark:text-[#D2F843]">
                  Field Tested in Nigeria
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight mt-2">
                  How Nigerian Professionals Use CHIP NG
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {page.useCases.map((uc, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-3xl bg-neutral-50 dark:bg-[#12141B] border border-neutral-200/80 dark:border-neutral-800 space-y-4 shadow-sm"
                  >
                    <div className="text-xs font-mono font-bold text-[#6b8500] dark:text-[#D2F843] uppercase tracking-wider">
                      {uc.role}
                    </div>
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                      Scenario: {uc.scenario}
                    </div>
                    <blockquote className="text-sm text-neutral-600 dark:text-neutral-300 italic border-l-2 border-[#D2F843] pl-4">
                      "{uc.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Technical Hardware Specs */}
        {page.technicalSpecs && page.technicalSpecs.length > 0 && (
          <section className="py-16 md:py-20 bg-[#FAFAFA] dark:bg-[#0A0B0E] border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="max-w-4xl mx-auto px-6 sm:px-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-8 text-center">
                Hardware Specifications & Build Quality
              </h2>

              <div className="bg-white dark:bg-[#12141B] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden divide-y divide-neutral-200/60 dark:divide-neutral-800">
                {page.technicalSpecs.map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 text-sm">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-400 font-mono text-xs uppercase">
                      {spec.label}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white mt-1 sm:mt-0">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        {page.faqs && page.faqs.length > 0 && (
          <section className="py-20 md:py-24 bg-white dark:bg-[#07080B] border-b border-neutral-200/80 dark:border-neutral-800">
            <div className="max-w-3xl mx-auto px-6 sm:px-8">
              <h2 className="text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-10 text-center">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {page.faqs.map((faq, i) => {
                  const isOpen = openFaqIndex === i;
                  return (
                    <div
                      key={i}
                      className="border border-neutral-200/80 dark:border-neutral-800 rounded-2xl overflow-hidden bg-[#FAFAFA] dark:bg-[#12141B]"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                        className="w-full text-left p-5 flex items-center justify-between font-bold text-sm sm:text-base text-neutral-900 dark:text-white cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/60 dark:border-neutral-800/60 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Conversion CTA Banner */}
        <section className="py-20 bg-neutral-950 text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono font-bold text-[#D2F843]">
              FAST DISPATCH • 24–48 HOURS IN LAGOS
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Ready to Upgrade Your Business Card?
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto">
              Join 25,000+ Nigerian professionals closing more deals with smart NFC technology. Custom laser engraving included.
            </p>
            <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={() => onNavigate('nfc-sales')}
                className="px-8 py-3.5 rounded-full bg-[#D2F843] text-neutral-950 font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all shadow-xl cursor-pointer"
              >
                Order Your Card Now
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="px-7 py-3.5 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-colors cursor-pointer"
              >
                Create Free Bio Profile
              </button>
            </div>
          </div>
        </section>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
