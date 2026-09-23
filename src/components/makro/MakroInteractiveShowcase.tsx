import React, { useState } from 'react';
import { Sparkles, Smartphone, CreditCard, BarChart2, Check, ArrowRight, Download, Eye, ExternalLink } from 'lucide-react';

export const MakroInteractiveShowcase: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<'forecast' | 'card' | 'leads' | 'invoices'>('forecast');
  const [selectedTheme, setSelectedTheme] = useState<'obsidian' | 'titanium' | 'lime'>('obsidian');
  const [leadSaved, setLeadSaved] = useState(false);

  return (
    <section className="py-20 md:py-28 border-t border-neutral-200/70 dark:border-neutral-800/80 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Interactive Product Showcase
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            See how it works in real-time.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            Click through the interactive components below to experience the elegance and velocity of CHIPNG.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 bg-neutral-200/70 dark:bg-neutral-800/80 rounded-full backdrop-blur-md">
            {[
              { id: 'forecast', label: 'Cashflow AI', icon: Sparkles },
              { id: 'card', label: 'NFC Card Customizer', icon: Smartphone },
              { id: 'leads', label: 'Lead Capture Engine', icon: BarChart2 },
              { id: 'invoices', label: 'Instant Invoicing', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-md'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D2F843] dark:text-neutral-950' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Canvas */}
        <div className="bg-white dark:bg-[#12141B] rounded-3xl p-6 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-xl transition-all min-h-[480px]">
          
          {/* TAB 1: Forecast & Cashflow */}
          {activeTab === 'forecast' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-block px-2.5 py-1 rounded bg-[#D2F843]/20 text-neutral-900 dark:text-[#D2F843] text-xs font-bold font-mono">
                  PREDICTIVE ACCURACY: 99.4%
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Never face an unexpected dry spell again.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Our machine learning model ingests historical transaction frequency, projected contract close dates, and standard payables to map out a clear 180-day forecast.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Instant alerts if monthly burn approaches minimum liquidity</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Scenario modeling: "Can I afford to hire in Q3?"</span>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Try cash forecasting
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Dashboard Mock */}
              <div className="lg:col-span-7 bg-neutral-50 dark:bg-[#181B24] rounded-2xl p-6 border border-neutral-200/60 dark:border-neutral-800 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200/60 dark:border-neutral-800">
                  <div>
                    <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Total Projected Runway</div>
                    <div className="text-3xl font-extrabold text-neutral-950 dark:text-white mt-1 tabular-nums">$94,820.00</div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    +24% vs last quarter
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-600 dark:text-neutral-400">Fixed Operating Expenses</span>
                    <span className="font-mono text-neutral-900 dark:text-white">$3,200/mo</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-neutral-900 dark:bg-neutral-100 h-full w-[35%]"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-600 dark:text-neutral-400">Confirmed Retainers</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">$18,500/mo</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D2F843] h-full w-[78%]"></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-neutral-900 dark:text-white block">AI Optimization Insight</span>
                      <span className="text-neutral-500">Accelerating Invoice #1042 payout adds 18 days to cash runway.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Smart NFC Card Customizer */}
          {activeTab === 'card' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Your physical handshake meets digital velocity.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Crafted in premium aerospace-grade matte black metal, bamboo wood, or minimalist polycarbonate. Re-program your links anytime without re-ordering.
                </p>

                {/* Theme Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Select Card Finish
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTheme('obsidian')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedTheme === 'obsidian'
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-black border border-neutral-600"></span>
                      Matte Obsidian
                    </button>
                    <button
                      onClick={() => setSelectedTheme('titanium')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedTheme === 'titanium'
                          ? 'border-neutral-900 bg-neutral-200 text-neutral-900'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-neutral-300 border border-neutral-400"></span>
                      Titanium Silver
                    </button>
                    <button
                      onClick={() => setSelectedTheme('lime')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedTheme === 'lime'
                          ? 'border-neutral-900 bg-[#D2F843] text-neutral-950 font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#D2F843] border border-neutral-500"></span>
                      Lime Neon Edition
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Order your NFC card
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Realistic 3D Card Simulation */}
              <div className="lg:col-span-7 flex items-center justify-center p-8 bg-neutral-50 dark:bg-[#181B24] rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                <div
                  className={`w-full max-w-[380px] aspect-[1.586/1] rounded-2xl p-6 shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${
                    selectedTheme === 'obsidian'
                      ? 'bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 text-white border border-neutral-700/50'
                      : selectedTheme === 'titanium'
                      ? 'bg-gradient-to-tr from-neutral-200 via-neutral-100 to-neutral-300 text-neutral-900 border border-neutral-300'
                      : 'bg-gradient-to-tr from-neutral-950 via-neutral-900 to-[#1e2410] text-white border border-[#D2F843]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D2F843]"></div>
                      </div>
                      <span className="text-xs font-mono font-bold tracking-widest uppercase">
                        CHIPNG
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xl font-bold tracking-tight">Vickthor Dennis</div>
                    <div className="text-xs opacity-75">Founder & Managing Partner</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono opacity-80 pt-4 border-t border-white/10">
                    <span>NFC ISO/IEC 14443-A</span>
                    <span className="text-[#D2F843] font-semibold">TAP TO CONNECT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Lead Capture Engine */}
          {activeTab === 'leads' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Convert casual encounters into signed contracts.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  When prospects tap your card or view your bio, they get an instantaneous option to download your verified vCard or exchange their details directly.
                </p>

                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 space-y-2">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">Auto-Enrichment Enabled</div>
                  <div className="text-xs text-neutral-500">CHIPNG automatically enriches prospect company name, LinkedIn profile, and email domain in your CRM.</div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Start capturing leads
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Phone Simulator */}
              <div className="lg:col-span-7 flex justify-center bg-neutral-50 dark:bg-[#181B24] p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                <div className="w-full max-w-[320px] bg-white dark:bg-neutral-950 rounded-3xl p-5 shadow-xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full mx-auto bg-neutral-900 text-white flex items-center justify-center font-bold text-xl ring-4 ring-[#D2F843]">
                    VD
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-950 dark:text-white">Vickthor Dennis</h4>
                    <p className="text-xs text-neutral-500">Managing Director · chipng.com/@vickthor</p>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => setLeadSaved(true)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        leadSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90'
                      }`}
                    >
                      {leadSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Contact Saved to Phone!
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Save Contact (vCard)
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => alert('Demo: booking consultation modal opens instantly.')}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-medium border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Book 15-Min Intro Call
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Instant Invoicing */}
          {activeTab === 'invoices' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Get paid in 12 seconds flat.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Generate sleek invoice links directly from your mobile dashboard. Clients pay via Apple Pay, Google Pay, debit card, or local transfer with zero friction.
                </p>
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Instant automatic receipt generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Zero chargeback dispute protection</span>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Issue your first invoice
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Invoice Preview */}
              <div className="lg:col-span-7 bg-neutral-50 dark:bg-[#181B24] p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200/80 dark:border-neutral-800 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-mono text-neutral-400">INVOICE #CHIP-2026-04</div>
                      <div className="text-lg font-bold text-neutral-950 dark:text-white mt-1">Brand Strategy & Advisory</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      READY TO PAY
                    </span>
                  </div>

                  <div className="py-3 border-y border-neutral-100 dark:border-neutral-800 flex justify-between text-sm">
                    <span className="text-neutral-500">Amount Due</span>
                    <span className="font-mono font-bold text-neutral-950 dark:text-white text-base">$4,500.00</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => alert('Demo: Payment provider gateway opened (Paystack / Stripe)')}
                      className="w-full py-2.5 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90"
                    >
                      Pay with Card / Transfer
                    </button>
                    <button
                      onClick={() => alert('Demo: Download PDF receipt')}
                      className="w-full py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
