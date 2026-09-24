import React, { useState } from 'react';
import { Zap, CreditCard, Sparkles, Smartphone, ShieldCheck, BarChart3, Users, Check, ArrowRight } from 'lucide-react';
import bentoIllustration from '../../assets/images/makro_finance_analytics_1790206472350.jpg';

export const MakroBentoFeatures: React.FC<{ onAction?: () => void }> = ({ onAction }) => {
  const [activeChipType, setActiveChipType] = useState<'metal' | 'pvc'>('metal');

  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA] dark:bg-[#0A0B0E] transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Hardware + Software Ecosystem
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Designed for modern professionals who make every handshake count.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
            Eliminate wasted paper business cards and clunky link trees. One contactless tap or dynamic URL shares your entire brand, booking schedule, and portfolio.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Bento Card 1: 7 cols - NFC Tap Speed & Antenna Technology */}
          <div className="lg:col-span-7 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                  <Zap className="w-5 h-5 text-[#84A900] dark:text-[#D2F843]" />
                </div>
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-full text-xs">
                  <button
                    onClick={() => setActiveChipType('metal')}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      activeChipType === 'metal'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Metal RFID
                  </button>
                  <button
                    onClick={() => setActiveChipType('pvc')}
                    className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                      activeChipType === 'pvc'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Matte PVC
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                Sub-10ms Contactless NFC Hardware
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mb-6">
                Our cards feature high-frequency NTAG216 microchips with multi-layer ferrite shielding. Tap against any modern iPhone or Android to trigger your profile in under 10 milliseconds without any app installed.
              </p>

              {/* Graphic container */}
              <div className="rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 relative bg-neutral-50 dark:bg-[#181B24] p-5">
                <img
                  src={bentoIllustration}
                  alt="NFC Hardware Analytics"
                  className="w-full h-48 sm:h-56 object-cover rounded-xl"
                />
                <div className="mt-4 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {activeChipType === 'metal' ? 'Shielded Ceramic Antenna: 100% Signal' : 'High-Flex PVC Coil: Universal Range'}
                    </span>
                  </div>
                  <span className="text-[#84A900] dark:text-[#D2F843] font-semibold">
                    {activeChipType === 'metal' ? 'Zero Battery Required' : '100% Waterproof'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Universal iOS & Android compatibility</span>
              <span className="font-mono">Instant browser launch</span>
            </div>
          </div>

          {/* Bento Card 2: 5 cols - Instant NFC & Smart Touchpoints */}
          <div className="lg:col-span-5 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-[#D2F843] text-neutral-950 flex items-center justify-center mb-6">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                1-Tap vCard Phone Book Save
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
                Never get lost in someone's desk drawer. One tap prompts the recipient's phone to download and save your full contact card—complete with profile photo, phone number, email, and company title.
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
                  <div className="text-xs text-neutral-400">Founder & CEO · CHIPNG</div>
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

          {/* Bento Card 3: 5 cols - Link in Bio & Digital Storefront */}
          <div className="lg:col-span-5 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-6">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                Link-in-Bio & Creator Storefront
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mb-6">
                Monetize your audience with your own digital store. Sell e-books, accept consultation retainers, and receive direct payments in ₦ (Naira) straight to your bank account.
              </p>

              {/* Creator store preview list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white">1-on-1 Growth Consultation</div>
                      <div className="text-[10px] text-neutral-500">Direct booking via Bio</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-neutral-950 dark:text-white">₦45,000</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Instant Payout</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-900 dark:text-white">NFC Smart Metal Card</div>
                      <div className="text-[10px] text-neutral-500">Direct Hardware Order</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-neutral-950 dark:text-white">₦50,000</div>
                    <div className="text-[10px] text-amber-600 font-medium">Dispatched</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Paystack & Card integrated</span>
              <span className="font-mono">Instant settlement in ₦</span>
            </div>
          </div>

          {/* Bento Card 4: 7 cols - Dynamic Link Hub & Lead Engine */}
          <div className="lg:col-span-7 bg-white dark:bg-[#12141B] rounded-3xl p-7 sm:p-9 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-6">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-950 dark:text-white tracking-tight mb-2">
                Real-Time Tap Analytics & Contact Capture
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mb-6">
                Turn every physical or digital encounter into a verified contact. When prospects view your profile, they can submit their phone and email back to you with our 2-way contact exchange.
              </p>

              {/* Conversion Stats Pill Matrix */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tabular-nums font-mono">
                    48.2%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    vCard Save Rate
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tabular-nums font-mono">
                    1-Tap
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    No App Needed
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181B24] border border-neutral-200/60 dark:border-neutral-800 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#84A900] dark:text-[#D2F843] tabular-nums font-mono">
                    100%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Dynamic Link Updates
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Automatic Contact Sync & Export</span>
              <span className="text-emerald-500 font-semibold">Syncs instantly</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
