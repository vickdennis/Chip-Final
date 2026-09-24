import React, { useState } from 'react';
import { ArrowRight, Share2, Plus, ChevronDown, Sparkles, Smartphone, CheckCircle2, Zap, Download } from 'lucide-react';
import heroPortrait from '../../assets/images/makro_hero_portrait_1790206462182.jpg';

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
    <section className="relative pt-6 pb-20 md:pt-12 md:pb-28 overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Top Hero Layout: Text & CTA on Left, Editorial Portrait on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[580px]">
          
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-7 z-10">
            
            {/* Category Pill Badge with Icon */}
            <div className="inline-flex items-center gap-2 self-start bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-[#D2F843] flex items-center justify-center text-neutral-950">
                <Zap className="w-3 h-3 fill-current text-neutral-950" />
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">
                Smart NFC Cards & Ultimate Link-in-Bio
              </span>
            </div>

            {/* Display Headline */}
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
                <div className="w-10 h-10 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-200 shadow-xs">
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
                className="px-5 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
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
                  professionals & creators
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Editorial Portrait with Floating NFC Metric Cards */}
          <div className="lg:col-span-6 relative flex items-center justify-center mt-6 lg:mt-0">
            
            {/* Ambient Backlight */}
            <div className="absolute w-72 h-72 rounded-full bg-lime-300/15 dark:bg-lime-400/10 blur-3xl pointer-events-none -top-10 right-10"></div>
            
            {/* Image Container with Smooth Bottom Fade */}
            <div className="relative w-full max-w-[460px] mx-auto rounded-3xl overflow-hidden shadow-sm">
              <img
                src={heroPortrait}
                alt="Creator holding smart contactless NFC card"
                className="w-full h-auto object-cover select-none scale-[1.02]"
              />
              
              {/* Measured Scrim & Bottom Gradient Fade into Canvas */}
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/70 to-transparent dark:from-[#0A0B0E] dark:via-[#0A0B0E]/70 dark:to-transparent pointer-events-none"></div>

              {/* Floating Card 1: NFC Taps (Bottom Left) */}
              <div className="absolute bottom-6 left-4 sm:left-6 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-black/5 dark:border-white/10 w-44 transition-transform duration-300 hover:translate-y-[-2px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Card Taps
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-full px-1.5 py-0.5">
                    {currentData.tapGrowth}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                  Direct physical taps
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white tabular-nums">
                    {currentData.taps}
                  </span>
                  <span className="text-[#84A900] dark:text-[#D2F843] text-xs font-semibold flex items-center">
                    ▲
                  </span>
                </div>
              </div>

              {/* Floating Card 2: vCard Saves (Top Right) */}
              <div className="absolute top-8 right-3 sm:right-5 z-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-black/5 dark:border-white/10 w-44 transition-transform duration-300 hover:translate-y-[-2px] rotate-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    vCard Saves
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-full px-1.5 py-0.5">
                    1-Tap
                  </span>
                </div>
                
                {/* 3 Day Row matching image */}
                <div className="grid grid-cols-3 gap-1 text-center mb-3">
                  <div className="bg-[#D2F843] text-neutral-950 rounded-md py-1">
                    <div className="text-[10px] font-bold">1</div>
                    <div className="text-[9px] font-medium">Tap</div>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md py-1">
                    <div className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">2</div>
                    <div className="text-[9px] text-neutral-400">View</div>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-md py-1">
                    <div className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">3</div>
                    <div className="text-[9px] text-neutral-400">Save</div>
                  </div>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white tabular-nums">
                    {currentData.saveRate}
                  </span>
                  <span className="text-emerald-500 text-xs font-semibold flex items-center">
                    ✓
                  </span>
                </div>
              </div>

            </div>

          </div>

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
                  <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
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
                    alert('Profile link copied to clipboard!');
                  }
                }}
                className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
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

          {/* Interactive Projected Visualization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
            
            {/* Left Card: Inbound Deal Volume in ₦ */}
            <div className="md:col-span-4 bg-neutral-50 dark:bg-[#181B24] rounded-2xl p-5 border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Deal Volume Generated
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {currentData.tapGrowth}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight tabular-nums font-mono">
                  {currentData.totalRevenue}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">vCards saved directly</span>
                  <span className="font-semibold text-neutral-900 dark:text-white tabular-nums font-mono">{currentData.vCardSaves} contacts</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Average tap response</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">&lt; 10ms</span>
                </div>
              </div>
            </div>

            {/* Right Card: Interactive Tap & Engagement Bar Chart */}
            <div className="md:col-span-8 bg-neutral-50 dark:bg-[#181B24] rounded-2xl p-6 border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  NFC Physical Taps vs Bio Link Clicks
                </span>
                <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  Hardware Accuracy: 100%
                </span>
              </div>

              {/* Bar visualization */}
              <div className="h-36 flex items-end gap-3 sm:gap-6 pt-4 px-2">
                {currentData.bars.map((bar, idx) => {
                  const isHovered = hoveredBarIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Tooltip on hover */}
                      <div
                        className={`text-[10px] font-mono font-semibold px-2 py-1 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 mb-1.5 transition-all duration-200 whitespace-nowrap ${
                          isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                      >
                        {bar.taps} · {bar.dealVol}
                      </div>

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[48px] bg-neutral-200 dark:bg-neutral-800 rounded-t-lg relative overflow-hidden h-full flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            isHovered
                              ? 'bg-[#D2F843]'
                              : 'bg-neutral-900 dark:bg-neutral-300'
                          }`}
                          style={{ height: `${bar.value}%` }}
                        ></div>
                      </div>

                      {/* Bar label */}
                      <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-2">
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
                  <span>Instant contactless handshake via iOS & Android</span>
                </div>
                <span className="font-mono text-[11px]">Zero app installation</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
