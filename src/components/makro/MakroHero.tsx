import React, { useState } from 'react';
import { ArrowRight, Share2, Plus, ChevronDown, Sparkles, Smartphone, CheckCircle2, Zap, Download } from 'lucide-react';
import { NfcMotionGrid } from './NfcMotionGrid';
import { toast } from '../Toast';
import { recordAppDownload } from '../../utils/telemetryClient';

interface MakroHeroProps {
  onGetStarted: () => void;
  onExploreCards?: () => void;
}

export const MakroHero: React.FC<MakroHeroProps> = ({ onGetStarted, onExploreCards }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | '180'>('30');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Dynamic Tap & Link-in-Bio analytics data depending on selected timeframe (all values in ₦)
  const pulseData = {
    '30': {
      taps: '14,850',
      tapGrowth: '+38%',
      saveRate: '98.4%',
      activeCardRate: '100%',
      statusText: 'Sub-10ms NFC tap response active across all devices',
      bars: [
        { label: 'W1', value: 65, taps: '2,900 taps', dealVol: '₦380,000' },
        { label: 'W2', value: 78, taps: '3,450 taps', dealVol: '₦520,000' },
        { label: 'W3', value: 88, taps: '4,100 taps', dealVol: '₦680,000' },
        { label: 'W4', value: 96, taps: '4,400 taps', dealVol: '₦850,000' },
      ],
      vCardSaves: '3,420',
      totalRevenue: '₦2,430,000',
    },
    '90': {
      taps: '46,200',
      tapGrowth: '+52%',
      saveRate: '98.9%',
      activeCardRate: '100%',
      statusText: 'All NFC profiles operating with zero latency',
      bars: [
        { label: 'M1', value: 70, taps: '13,200 taps', dealVol: '₦1,850,000' },
        { label: 'M2', value: 85, taps: '15,800 taps', dealVol: '₦2,400,000' },
        { label: 'M3', value: 98, taps: '17,200 taps', dealVol: '₦3,100,000' },
      ],
      vCardSaves: '11,200',
      totalRevenue: '₦7,350,000',
    },
    '180': {
      taps: '108,000',
      tapGrowth: '+74%',
      saveRate: '99.2%',
      activeCardRate: '100%',
      statusText: 'Institutional NFC fleet synchronization active',
      bars: [
        { label: 'Q1', value: 72, taps: '48,000 taps', dealVol: '₦6,800,000' },
        { label: 'Q2', value: 92, taps: '60,000 taps', dealVol: '₦9,200,000' },
      ],
      vCardSaves: '27,800',
      totalRevenue: '₦16,000,000',
    },
  };

  const currentData = pulseData[selectedPeriod];

  return (
    <section className="relative pt-8 pb-20 md:pt-14 md:pb-28 overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      {/* Full-Screen Tilted Motion Grid Backdrop (8 Columns across entire viewport) */}
      <NfcMotionGrid variant="fullscreen" />

      {/* Cinematic Contrast Scrims for Text Legibility & Depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA]/95 via-[#FAFAFA]/85 to-transparent dark:from-[#0A0B0E]/95 dark:via-[#0A0B0E]/85 dark:to-transparent lg:w-3/5 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-radial-[at_20%_40%] from-[#FAFAFA]/90 via-[#FAFAFA]/60 to-transparent dark:from-[#0A0B0E]/90 dark:via-[#0A0B0E]/60 dark:to-transparent pointer-events-none z-[1]" />
      <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent dark:from-[#0A0B0E] dark:via-[#0A0B0E]/70 dark:to-transparent pointer-events-none z-[1]" />
      <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/85 to-transparent dark:from-[#0A0B0E] dark:via-[#0A0B0E]/85 dark:to-transparent pointer-events-none z-[1]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        
        {/* Top Hero Layout: Text & CTA on Left, Floating Metrics HUD on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px]">
          
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-8 xl:col-span-7 flex flex-col justify-center space-y-7 z-10">
            
            {/* Category Pill Badge with Icon */}
            <div className="inline-flex items-center gap-2 self-start bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-[#16a34a] flex items-center justify-center text-neutral-950">
                <Zap className="w-3 h-3 fill-current text-neutral-950" />
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
                Smart NFC Cards &amp; Ultimate Link-in-Bio
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.04em] text-neutral-950 dark:text-white leading-[1.04]">
              One tap to connect.
              <br />
              <span className="text-neutral-950 dark:text-white">
                Your entire world.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed max-w-lg">
              Ditch paper business cards forever. Share your verified digital portfolio, contact info, and booking links instantly with a physical NFC tap or one sleek bio link.
            </p>

            {/* Action Row & Social Proof */}
            <div className="pt-2 flex flex-wrap items-center gap-5 sm:gap-6">
              {/* Primary Pill Button with Lime Arrow Circle */}
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-3 pl-2 pr-6 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#16a34a] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200 shadow-xs">
                  <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-200 stroke-[2.5]" />
                </div>
                <span className="text-base font-semibold tracking-tight whitespace-nowrap">
                  Claim your handle
                </span>
              </button>

              {/* Secondary Button: Browse Cards */}
              <button
                onClick={() => {
                  const shopEl = document.getElementById('shop');
                  if (shopEl) {
                    shopEl.scrollIntoView({ behavior: 'smooth' });
                  } else if (onExploreCards) {
                    onExploreCards();
                  }
                }}
                className="px-5 py-3 rounded-full border border-neutral-300/90 dark:border-neutral-700/90 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md text-sm font-semibold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Browse NFC Cards
              </button>

              {/* Solopreneur Social Proof */}
              <div className="flex items-center gap-3 pt-1 sm:pt-0">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-neutral-950 object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Creator avatar"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-neutral-950 object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Creator avatar"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-neutral-950 object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Creator avatar"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-neutral-950 object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Creator avatar"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 leading-tight">
                  <span className="font-semibold text-neutral-900 dark:text-white block">
                    Trusted by 25,000+
                  </span>
                  professionals &amp; creators
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Open viewport area showcasing full-screen contactless motion animation */}
          <div className="lg:col-span-4 xl:col-span-5 hidden lg:block pointer-events-none" />

        </div>

        {/* Bottom Bento Card: Interactive Tap & Profile Pulse */}
        <div className="mt-12 sm:mt-16 bg-white dark:bg-[#12141B] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-neutral-200/80 dark:border-neutral-800 transition-all">
          
          {/* Bento Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-4">
              {/* Double-dot icon container */}
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white"></span>
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Tap & Profile Pulse
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                    {currentData.statusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Controls: Time Filter Pill Dropdown & Share / Add actions */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              
              {/* Period Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white transition-colors cursor-pointer"
                >
                  <span>
                    {selectedPeriod === '30' ? 'Past 30 days' : selectedPeriod === '90' ? 'Past 90 days' : 'Past 6 months'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {periodDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 py-1.5 z-30">
                    <button
                      onClick={() => { setSelectedPeriod('30'); setPeriodDropdownOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
                    >
                      Past 30 days
                      {selectedPeriod === '30' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                    <button
                      onClick={() => { setSelectedPeriod('90'); setPeriodDropdownOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
                    >
                      Past 90 days
                      {selectedPeriod === '90' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                    <button
                      onClick={() => { setSelectedPeriod('180'); setPeriodDropdownOpen(false); }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between"
                    >
                      Past 6 months
                      {selectedPeriod === '180' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Share Icon */}
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Profile link copied to clipboard!');
                  }
                }}
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Black Circular + Button */}
              <button
                onClick={onGetStarted}
                className="w-9 h-9 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Create profile"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Demonstration Card inside Tap & Profile Pulse */}
          <div className="pt-6">
            <div className="relative rounded-3xl overflow-hidden bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl">
              
              {/* Header Video Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3.5 bg-neutral-900/90 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Live Demonstration
                  </span>
                  <span className="text-neutral-400 text-xs hidden sm:inline">&bull; Real Nigerian Founders Tapping Live</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#16a34a] bg-[#16a34a]/15 px-2.5 py-0.5 rounded-full border border-[#16a34a]/30">
                    &lt; 10ms Response
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
                    Zero App Required
                  </span>
                  <a
                    href="https://vt.tiktok.com/ZSbxthsFt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white underline decoration-white/30 transition-colors"
                  >
                    Open in HD &rarr;
                  </a>
                </div>
              </div>

              {/* Embedded Video Showcase */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] md:aspect-[2.35/1] max-h-[500px] bg-neutral-950 flex items-center justify-center overflow-hidden">
                <iframe
                  src="https://www.tiktok.com/player/v1/7693087938665581831?autoplay=0&loop=1&music_info=0&description=0"
                  title="CHIP NG Contactless Tap Demonstration"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Bottom Feature Highlights inside Card */}
              <div className="p-4 sm:p-5 bg-neutral-900/90 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#16a34a] shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Sub-10ms Induction</div>
                    <div className="text-[11px] text-neutral-400">Activates instantly through thick cases</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Zero App Installation</div>
                    <div className="text-[11px] text-neutral-400">Works natively on iOS & Android</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#16a34a] shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">1-Tap Direct vCard Save</div>
                    <div className="text-[11px] text-neutral-400">Instantly saves to recipient's phonebook</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
