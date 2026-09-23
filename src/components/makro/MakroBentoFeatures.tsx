import React, { useState } from 'react';
import { ArrowUpRight, Zap, CreditCard, Sparkles, Smartphone, ShieldCheck, BarChart3, Users } from 'lucide-react';
import bentoIllustration from '../../assets/images/makro_finance_analytics_1790206472350.jpg';

export const MakroBentoFeatures: React.FC<{ onAction?: () => void }> = ({ onAction }) => {
  const [activeSimulation, setActiveSimulation] = useState<'conservative' | 'aggressive'>('conservative');

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Complete Financial & Identity Stack
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Designed for builders who value precision and calm.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            Eliminate fragmented spreadsheets and messy link aggregators. Everything you need to forecast, connect, and convert.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Bento Card 1: 7 cols - AI Cashflow & Forecasting */}
          <div className="lg:col-span-7 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full text-xs">
                  <button
                    onClick={() => setActiveSimulation('conservative')}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      activeSimulation === 'conservative'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Conservative
                  </button>
                  <button
                    onClick={() => setActiveSimulation('aggressive')}
                    className={`px-3 py-1 rounded-full font-medium transition-all ${
                      activeSimulation === 'aggressive'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    High Growth
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                Predictive Cashflow & Revenue Runway
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mb-6">
                Our AI continuously evaluates client payment cycles, subscription churn, and scheduled payables to generate rock-solid cash predictions.
              </p>

              {/* Graphic container */}
              <div className="rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 relative bg-neutral-50 dark:bg-[#181B24] p-5">
                <img
                  src={bentoIllustration}
                  alt="AI Financial Analytics"
                  className="w-full h-48 sm:h-56 object-cover rounded-xl"
                />
                <div className="mt-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {activeSimulation === 'conservative' ? 'Safe Runway: 14.2 Months' : 'Expanded Runway: 26.8 Months'}
                    </span>
                  </div>
                  <span className="text-[#84A900] dark:text-[#D2F843] font-semibold">
                    {activeSimulation === 'conservative' ? '+$12,400 Target' : '+$48,900 Target'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Automatic bank reconciliation</span>
              <span className="font-mono">Syncs every 10 min</span>
            </div>
          </div>

          {/* Bento Card 2: 5 cols - Instant NFC & Smart Touchpoints */}
          <div className="lg:col-span-5 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#D2F843] text-neutral-950 flex items-center justify-center mb-6">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                NFC Tap & Instant Digital Card
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
                One tap against any smartphone instantly opens your digital portfolio, calendar, and vCard with zero apps required.
              </p>

              {/* Card visual mock */}
              <div className="p-5 rounded-2xl bg-neutral-950 text-white dark:bg-black relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#D2F843]"></div>
                    </div>
                    <span className="text-xs font-mono tracking-widest text-neutral-400">CHIP METAL</span>
                  </div>
                  <Zap className="w-4 h-4 text-[#D2F843]" />
                </div>
                
                <div className="space-y-1">
                  <div className="text-lg font-bold tracking-tight">Vickthor Dennis</div>
                  <div className="text-xs text-neutral-400">Founder & CEO · Solopreneur</div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>NFC 13.56 MHz</span>
                  <span className="text-emerald-400">Ready to Tap</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Works with iOS & Android</span>
              <span className="font-semibold text-neutral-900 dark:text-white">Zero App Installs</span>
            </div>
          </div>

          {/* Bento Card 3: 5 cols - Invoicing & Direct Payments */}
          <div className="lg:col-span-5 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-6">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                Automated Invoicing & Global Payouts
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
                Send professional invoices, accept card or local bank transfers, and eliminate overdue accounts with intelligent gentle reminders.
              </p>

              {/* Invoicing preview list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white">Design Retainer #1042</div>
                      <div className="text-[10px] text-neutral-500">Apex Media LLC</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-neutral-950 dark:text-white">$3,800.00</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Paid Instantly</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white">Sprint Deliverable #1043</div>
                      <div className="text-[10px] text-neutral-500">Kora Studios</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-neutral-950 dark:text-white">$6,500.00</div>
                    <div className="text-[10px] text-amber-600 font-medium">Due in 2 days</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Local & International payments</span>
              <span className="font-mono">Instant settlement</span>
            </div>
          </div>

          {/* Bento Card 4: 7 cols - Dynamic Link Hub & Lead Engine */}
          <div className="lg:col-span-7 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-6">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                High-Conversion Link Hub & Lead Funnel
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mb-6">
                Turn profile visitors into qualified leads. Embed consultation calendars, capture email contacts, and distribute portfolios seamlessly.
              </p>

              {/* Conversion Stats Pill Matrix */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tabular-nums">
                    42.8%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Contact Save Rate
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tabular-nums">
                    3.8x
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Faster Discovery
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#84A900] dark:text-[#D2F843] tabular-nums">
                    99.8%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Deliverability
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Automatic CRM Lead Sync</span>
              <span className="text-emerald-500 font-semibold">Live in 60 seconds</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
