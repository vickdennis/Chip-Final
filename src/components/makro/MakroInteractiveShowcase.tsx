import React, { useState } from 'react';
import { Smartphone, CreditCard, BarChart2, Check, ArrowRight, Download, ExternalLink, Zap, Radio, Globe, UserCheck, Shield } from 'lucide-react';

export const MakroInteractiveShowcase: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<'card' | 'bio' | 'leads' | 'telemetry'>('card');
  const [selectedTheme, setSelectedTheme] = useState<'obsidian' | 'gold' | 'titanium' | 'lime'>('obsidian');
  const [leadSaved, setLeadSaved] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');

  const finishPrices = {
    obsidian: { price: '₦50,000', label: 'Matte Obsidian Metal' },
    gold: { price: '₦100,000', label: '24K Gold Mirror Finish' },
    titanium: { price: '₦80,000', label: 'Titanium Silver Alloy' },
    lime: { price: '₦35,000', label: 'CHIP Special Lime PVC' },
  };

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
            Experience CHIPNG in real-time.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            Interact with our smart NFC hardware customizer, live smartphone bio link simulation, and contact exchange engine.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 bg-neutral-200/70 dark:bg-neutral-800/80 rounded-full backdrop-blur-md">
            {[
              { id: 'card', label: 'NFC Card Customizer', icon: CreditCard },
              { id: 'bio', label: 'Link-in-Bio Experience', icon: Smartphone },
              { id: 'leads', label: '2-Way Contact Exchange', icon: UserCheck },
              { id: 'telemetry', label: 'Tap Telemetry', icon: BarChart2 },
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
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
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
          
          {/* TAB 1: Smart NFC Card Customizer */}
          {activeTab === 'card' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-block px-2.5 py-1 rounded bg-[#D2F843]/20 text-neutral-900 dark:text-[#D2F843] text-xs font-bold font-mono">
                  HARDWARE GRADE: AEROSPACE STAINLESS STEEL
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Your physical handshake meets digital velocity.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Crafted in premium heavy metal, brushed titanium, or minimalist matte PVC. Embedded with sub-10ms contactless NFC chips that work with every smartphone.
                </p>

                {/* Theme Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Select Card Finish & Material
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setSelectedTheme('obsidian')}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTheme === 'obsidian'
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-600 shrink-0"></span>
                      <span className="truncate">Matte Obsidian</span>
                    </button>
                    <button
                      onClick={() => setSelectedTheme('gold')}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTheme === 'gold'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-600 shrink-0"></span>
                      <span className="truncate">24K Mirror Gold</span>
                    </button>
                    <button
                      onClick={() => setSelectedTheme('titanium')}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTheme === 'titanium'
                          ? 'border-neutral-400 bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-neutral-300 border border-neutral-400 shrink-0"></span>
                      <span className="truncate">Titanium Alloy</span>
                    </button>
                    <button
                      onClick={() => setSelectedTheme('lime')}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedTheme === 'lime'
                          ? 'border-[#84A900] bg-[#D2F843]/20 text-neutral-950 dark:text-white font-bold'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-[#D2F843] border border-neutral-600 shrink-0"></span>
                      <span className="truncate">Lime Edition PVC</span>
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-neutral-400 font-mono uppercase block">Hardware Price</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white font-mono tabular-nums">
                      {finishPrices[selectedTheme].price}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Free nationwide shipping in Nigeria
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    Order this card finish
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Realistic 3D Card Simulation */}
              <div className="lg:col-span-7 flex items-center justify-center p-8 bg-neutral-50 dark:bg-[#181B24] rounded-2xl border border-neutral-200/60 dark:border-neutral-800 min-h-[360px]">
                <div
                  className={`w-full max-w-[390px] aspect-[1.586/1] rounded-2xl p-6 sm:p-7 shadow-2xl transition-all duration-500 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] ${
                    selectedTheme === 'obsidian'
                      ? 'bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800 text-white border border-neutral-700/50'
                      : selectedTheme === 'gold'
                      ? 'bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-200 text-neutral-950 border border-amber-300 shadow-amber-500/20'
                      : selectedTheme === 'titanium'
                      ? 'bg-gradient-to-tr from-neutral-300 via-neutral-100 to-neutral-400 text-neutral-900 border border-neutral-300'
                      : 'bg-gradient-to-tr from-neutral-950 via-neutral-900 to-[#1e2410] text-white border border-[#D2F843]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D2F843]"></div>
                      </div>
                      <span className="text-xs font-mono font-bold tracking-widest uppercase">
                        CHIP METAL
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#D2F843]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xl font-bold tracking-tight">Vickthor Dennis</div>
                    <div className="text-xs opacity-80">Founder & CEO · CHIPNG</div>
                    <div className="text-[10px] font-mono opacity-60">chipng.com/@vickthor</div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono opacity-80 pt-4 border-t border-white/10">
                    <span>NFC ISO 14443A · 13.56 MHz</span>
                    <span className="text-[#D2F843] font-bold">TAP TO CONNECT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Live Link-in-Bio Smartphone Simulator */}
          {activeTab === 'bio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-block px-2.5 py-1 rounded bg-[#D2F843]/20 text-neutral-900 dark:text-[#D2F843] text-xs font-bold font-mono">
                  LINK-IN-BIO ENGINE: ULTRA FAST &lt;200MS LOAD
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  One dynamic link for your entire digital universe.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Your bio link automatically opens when someone taps your NFC card or clicks your Instagram, Twitter, and LinkedIn bio. Add custom links, portfolio cards, and direct booking calendars.
                </p>

                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Free custom username: <strong>chipng.com/@yourname</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>1-Tap direct vCard contact download</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sell digital products & book sessions in ₦</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    Create your free bio link
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Smartphone Simulator */}
              <div className="lg:col-span-7 flex justify-center bg-neutral-50 dark:bg-[#181B24] p-6 sm:p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                <div className="w-full max-w-[320px] bg-white dark:bg-[#0F1117] rounded-3xl p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-4">
                  {/* Phone Notch */}
                  <div className="w-24 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-2"></div>
                  
                  {/* Avatar */}
                  <div className="relative w-16 h-16 rounded-full mx-auto overflow-hidden ring-4 ring-[#D2F843]">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                      alt="Creator avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-neutral-950 dark:text-white flex items-center justify-center gap-1">
                      Amara Nwosu
                      <span className="w-4 h-4 rounded-full bg-[#D2F843] text-neutral-950 text-[10px] flex items-center justify-center font-bold">✓</span>
                    </h4>
                    <p className="text-xs text-neutral-500">Design Director · Studio Kora</p>
                    <p className="text-[11px] text-neutral-400 mt-1 font-mono">chipng.com/@amara</p>
                  </div>

                  {/* 1-Tap Save Contact Button */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => setLeadSaved(true)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        leadSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90'
                      }`}
                    >
                      {leadSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          vCard Downloaded!
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          Save Contact (1-Tap vCard)
                        </>
                      )}
                    </button>
                    
                    {/* Bio Links */}
                    <div className="space-y-2 pt-1 text-left">
                      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center justify-between text-xs font-medium text-neutral-900 dark:text-white">
                        <span>Portfolio & Selected Works (2026)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center justify-between text-xs font-medium text-neutral-900 dark:text-white">
                        <span>Book 30-Min Strategy Call (₦25,000)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center justify-between text-xs font-medium text-neutral-900 dark:text-white">
                        <span>Connect on LinkedIn & X</span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 2-Way Contact Exchange */}
          {activeTab === 'leads' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Two-way contact exchange in 5 seconds.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  When you tap your NFC card to a prospective client's phone, they can instantly send their contact info back to you. No business card clutter, no typing numbers manually.
                </p>

                <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 space-y-2">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white">Instant CRM Integration</div>
                  <div className="text-xs text-neutral-500">Every contact collected is saved directly to your CHIPNG dashboard and downloadable as CSV / Google Contacts.</div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    Start capturing contacts
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive Contact Exchange Box */}
              <div className="lg:col-span-7 flex justify-center bg-neutral-50 dark:bg-[#181B24] p-6 sm:p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-800">
                <div className="w-full max-w-[360px] bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-full bg-[#D2F843] text-neutral-950 flex items-center justify-center mx-auto mb-2 font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-base font-bold text-neutral-950 dark:text-white">Exchange Details with Vickthor</h4>
                    <p className="text-xs text-neutral-500">Drop your info so we can stay connected</p>
                  </div>

                  {exchangeSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-center space-y-2">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        ✓ Contact Exchanged!
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Details added to Vickthor's verified contact book.
                      </p>
                      <button
                        onClick={() => { setExchangeSuccess(false); setVisitorName(''); setVisitorPhone(''); }}
                        className="text-[11px] text-neutral-500 underline hover:text-neutral-900 dark:hover:text-white pt-2 block mx-auto"
                      >
                        Reset demo
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (visitorName) setExchangeSuccess(true);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="text-[11px] font-mono text-neutral-500 uppercase block mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={visitorName}
                          onChange={(e) => setVisitorName(e.target.value)}
                          placeholder="e.g. Tunde Balogun"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D2F843]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-neutral-500 uppercase block mb-1">Phone Number / WhatsApp</label>
                        <input
                          type="tel"
                          required
                          value={visitorPhone}
                          onChange={(e) => setVisitorPhone(e.target.value)}
                          placeholder="e.g. +234 802 345 6789"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D2F843]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Send My Contact
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Tap Telemetry */}
          {activeTab === 'telemetry' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-5">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Real-time intelligence on every card tap.
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Understand your networking ROI. See exact tap locations, device breakdowns, peak meeting hours, and conversion rates directly in your personal dashboard.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
                    <div className="text-xs text-neutral-500">Device Split</div>
                    <div className="text-base font-bold text-neutral-950 dark:text-white mt-1">72% iOS · 28% Android</div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80">
                    <div className="text-xs text-neutral-500">Tap Speed</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">&lt;8.4ms Instant</div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    View analytics demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Telemetry UI preview */}
              <div className="lg:col-span-7 bg-neutral-50 dark:bg-[#181B24] p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-xs font-mono uppercase text-neutral-500">Live Tap Activity Feed</span>
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Broadcasting
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#D2F843]/20 text-neutral-950 dark:text-[#D2F843] flex items-center justify-center font-mono font-bold text-[10px]">
                        NFC
                      </div>
                      <div>
                        <div className="font-bold text-neutral-950 dark:text-white">Physical Tap · iPhone 16 Pro</div>
                        <div className="text-neutral-500 text-[10px]">Victoria Island, Lagos · 4 mins ago</div>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-mono font-bold">vCard Saved</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-mono font-bold text-[10px]">
                        BIO
                      </div>
                      <div>
                        <div className="font-bold text-neutral-950 dark:text-white">Bio Link Visit · Samsung Galaxy S25</div>
                        <div className="text-neutral-500 text-[10px]">Abuja FCT · 18 mins ago</div>
                      </div>
                    </div>
                    <span className="text-[#84A900] dark:text-[#D2F843] font-mono font-bold">Booked Call (₦25,000)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#D2F843]/20 text-neutral-950 dark:text-[#D2F843] flex items-center justify-center font-mono font-bold text-[10px]">
                        NFC
                      </div>
                      <div>
                        <div className="font-bold text-neutral-950 dark:text-white">Physical Tap · Google Pixel 9</div>
                        <div className="text-neutral-500 text-[10px]">London, UK · 42 mins ago</div>
                      </div>
                    </div>
                    <span className="text-neutral-500 font-mono font-bold">Exchanged Contact</span>
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
