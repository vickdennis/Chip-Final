import React, { useState } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { MakroCTA } from '../components/makro/MakroCTA';
import { Sparkles, Zap, Smartphone, Check, ArrowRight, Tag } from 'lucide-react';

interface MakroUpdatesViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export const MakroUpdatesView: React.FC<MakroUpdatesViewProps> = ({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'hardware' | 'payments'>('all');

  const updates = [
    {
      version: 'v2.8.0',
      date: 'September 2026',
      category: 'ai',
      badge: 'AI Finance',
      title: 'Autonomous Multi-Month Cashflow Scenario Engine',
      description:
        'You can now stress-test what happens if a major client delays invoice settlement by 30 or 60 days. Our new probabilistic simulation engine alerts you in advance with mitigation tactics.',
      highlights: [
        'Interactive 180-day runway graph slider',
        'Automatic detection of seasonal revenue patterns',
        'Direct integration with Paystack & Stripe settlement schedules',
      ],
    },
    {
      version: 'v2.7.2',
      date: 'August 2026',
      category: 'hardware',
      badge: 'NFC & Profile',
      title: 'Instant Apple Wallet & Google Pass Sync',
      description:
        'Physical card owners can now generate a dynamic, NFC-enabled Apple Wallet pass with one click. Share your profile directly from your lock screen even if your card is in your bag.',
      highlights: [
        'Cryptographically signed .pkpass distribution',
        'Real-time link changes update the pass dynamically',
        'Offline QR fallback rendered natively on Apple Watch and Android',
      ],
    },
    {
      version: 'v2.6.0',
      date: 'July 2026',
      category: 'payments',
      badge: 'Invoicing',
      title: 'Zero-Redirect Invoicing & Direct WhatsApp Checkout',
      description:
        'Share instant invoice links that clients can settle right inside WhatsApp or mobile Safari with Face ID. Average checkout duration dropped to under 14 seconds.',
      highlights: [
        'One-tap payment via Apple Pay, Google Pay, and USSD',
        'Automated polite receipt delivery to client email & SMS',
        'Instant multi-currency conversion for foreign clients (USD, GBP, EUR, NGN)',
      ],
    },
    {
      version: 'v2.5.0',
      date: 'June 2026',
      category: 'hardware',
      badge: 'Hardware',
      title: 'Titanium Matte Aerospace Finish Cards Released',
      description:
        'Unveiling our ultra-luxury metal cards crafted from CNC-machined titanium with laser-etched custom signatures and dual-frequency NFC antennas for 360-degree tap reliability.',
      highlights: [
        'Waterproof, scratch-resistant ceramic coating',
        'Sub-10ms antenna handshake frequency',
        'Lifetime hardware replacement guarantee for Pro members',
      ],
    },
  ];

  const filteredUpdates = updates.filter(
    (u) => activeFilter === 'all' || u.category === activeFilter
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors flex flex-col justify-between">
      <MakroNavbar
        currentView={'updates' as ViewState}
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1">
        {/* Hero */}
        <section className="pt-16 pb-14 md:pt-24 md:pb-20">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3.5 py-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Product Changelog & Roadmap
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
              Continuous velocity. Every week.
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Follow our regular releases, architectural improvements, and new capabilities as we refine the ultimate platform for solopreneurs.
            </p>

            {/* Filter Tabs */}
            <div className="pt-6 flex justify-center">
              <div className="inline-flex p-1.5 bg-neutral-200/60 dark:bg-neutral-800 rounded-full">
                {[
                  { id: 'all', label: 'All Updates' },
                  { id: 'ai', label: 'AI Finance' },
                  { id: 'hardware', label: 'NFC & Hardware' },
                  { id: 'payments', label: 'Invoicing & Payments' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      activeFilter === tab.id
                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Updates Timeline List */}
        <section className="py-12 pb-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 space-y-12">
            {filteredUpdates.map((item, idx) => (
              <article
                key={idx}
                className="bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
                      {item.version}
                    </span>
                    <span className="text-xs font-semibold text-[#84A900] dark:text-[#D2F843]">
                      {item.badge}
                    </span>
                  </div>
                  <time className="text-xs font-medium text-neutral-500 font-mono">
                    {item.date}
                  </time>
                </div>

                <div className="pt-6 space-y-4">
                  <h2 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-3 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Key Highlights
                    </div>
                    {item.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <MakroCTA onGetStarted={() => onNavigate('login')} />
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
};
