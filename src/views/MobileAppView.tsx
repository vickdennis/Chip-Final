import React, { useState } from 'react';
import { ViewState } from '../App';
import { MakroNavbar } from '../components/makro/MakroNavbar';
import { MakroFooter } from '../components/makro/MakroFooter';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  Download, 
  Apple, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Wifi, 
  Lock, 
  RefreshCw, 
  Bell, 
  Users, 
  ArrowRight, 
  Check, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { recordAppDownload } from '../utils/telemetryClient';
import { toast } from '../components/Toast';

interface MobileAppViewProps {
  onNavigate: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  session?: any;
}

export default function MobileAppView({
  onNavigate,
  isDarkMode,
  toggleDarkMode,
  session
}: MobileAppViewProps) {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'nfc' | 'telemetry' | 'offline' | 'wallet'>('nfc');
  const [downloadingPlatform, setDownloadingPlatform] = useState<string | null>(null);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDownloadClick = async (platform: 'ios' | 'android' | 'apk' | 'pwa') => {
    setDownloadingPlatform(platform);
    await recordAppDownload(platform, { source: 'mobile_app_page', version: '2.4.0' });
    
    if (platform === 'ios') {
      toast.success('Redirecting to Apple App Store...');
      setTimeout(() => {
        window.open('https://apps.apple.com/app/chip-ng/id6470000000', '_blank');
        setDownloadingPlatform(null);
      }, 600);
    } else if (platform === 'android') {
      toast.success('Redirecting to Google Play Store...');
      setTimeout(() => {
        window.open('https://play.google.com/store/apps/details?id=com.chipng.app', '_blank');
        setDownloadingPlatform(null);
      }, 600);
    } else if (platform === 'apk') {
      toast.success('Starting official CHIP NG Android APK download (2.9 MB)...');
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '/CHIP_NG_v2.4.0.apk';
        link.download = 'CHIP_NG_v2.4.0_Official.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadingPlatform(null);
      }, 500);
    } else {
      toast.success('Added to home screen installation queue!');
      setDownloadingPlatform(null);
    }
  };

  const featureTabs = [
    {
      id: 'nfc',
      title: 'NFC Tag Programmer',
      icon: Radio,
      headline: 'Sub-10ms Hardware Writing & Lock',
      description: 'Reprogram your NTAG216 chip anytime with your phone’s built-in antenna. Write custom vCard data, dynamic links, or lock permissions with bank-grade encryption.',
      badge: 'NTAG216 Engine',
      stats: '<10ms Write Speed'
    },
    {
      id: 'telemetry',
      title: 'Live Tap Telemetry',
      icon: Bell,
      headline: 'Instant Push Alerts on Every Tap',
      description: 'Receive real-time push notifications the moment a client taps your physical card in Lagos, Abuja, London, or New York. Track device type and location.',
      badge: 'Real-Time Radar',
      stats: '100% Instant Delivery'
    },
    {
      id: 'offline',
      title: 'Offline Contact Safe',
      icon: Users,
      headline: 'Exchange Contacts with Zero Internet',
      description: 'Never worry about roaming or spotty network coverage. All 2-way contact exchanges are safely encrypted on-device and auto-sync to cloud when online.',
      badge: 'Zero Network Required',
      stats: '10,000+ Offline Contacts'
    },
    {
      id: 'wallet',
      title: 'Apple & Google Pass',
      icon: Zap,
      headline: 'Add to Native Digital Wallet',
      description: 'Generate an official NFC & QR pass for Apple Wallet and Google Pay with a single tap. Have a contactless backup ready even if you forget your physical card.',
      badge: 'Native Wallet Integration',
      stats: '1-Tap Pass Export'
    }
  ];

  const devicesList = [
    { brand: 'Apple', model: 'iPhone 16, 16 Plus, 16 Pro, 16 Pro Max', status: 'Full Background NFC', year: '2024' },
    { brand: 'Apple', model: 'iPhone 15, 15 Plus, 15 Pro, 15 Pro Max', status: 'Full Background NFC', year: '2023' },
    { brand: 'Apple', model: 'iPhone 14, 13, 12, 11 series', status: 'Full Background NFC', year: '2019-2022' },
    { brand: 'Apple', model: 'iPhone XR, XS, XS Max', status: 'Full Background NFC', year: '2018' },
    { brand: 'Samsung', model: 'Galaxy S24, S23, S22, S21 series', status: 'Full NFC Ready', year: '2021-2024' },
    { brand: 'Samsung', model: 'Galaxy Z Fold 6/5, Z Flip 6/5', status: 'Full NFC Ready', year: '2022-2024' },
    { brand: 'Google', model: 'Pixel 9, 8, 7, 6 series', status: 'Native NFC Active', year: '2021-2024' },
    { brand: 'Xiaomi / Redmi', model: 'Xiaomi 14, 13, Redmi Note 13 Pro (NFC)', status: 'Native NFC Active', year: '2023-2024' },
    { brand: 'Tecno / Infinix', model: 'Camon 30 Premier, Note 40 Pro (NFC models)', status: 'Native NFC Active', year: '2023-2024' },
  ];

  const filteredDevices = devicesList.filter(d => 
    d.brand.toLowerCase().includes(deviceSearch.toLowerCase()) || 
    d.model.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  const faqs = [
    {
      q: 'Do recipients of my card need to download this mobile app?',
      a: 'No! Card recipients require absolutely zero app to interact with your physical card. When you tap your CHIP NG card on an iPhone or Android phone, their native browser automatically opens your verified link-in-bio profile and 1-tap vCard address book download.'
    },
    {
      q: 'What is the purpose of the official mobile app?',
      a: 'The official companion app is for card owners and founders. It gives you direct access to reprogram your physical NTAG216 chip, view real-time tap telemetry notifications, manage your digital storefront products, and access offline contact lists.'
    },
    {
      q: 'Can I write to multiple NFC smart cards with one account?',
      a: 'Yes. The CHIP NG mobile app allows you to program unlimited cards, key fobs, NFC metal cards, and desk plaques from a single dashboard console.'
    },
    {
      q: 'How does the direct APK download work?',
      a: 'For Nigerian and African professionals who prefer direct downloads without using Google Play Services, you can download the verified standalone .apk file (18.4 MB) directly to your Android device for instant 1-click installation.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-neutral-100 transition-colors duration-200 flex flex-col">
      <MakroNavbar 
        currentView="mobile-app"
        onNavigate={onNavigate}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        session={session}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 px-6 sm:px-8 overflow-hidden">
          {/* Subtle Ambient Backdrops */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#D2F843]/15 via-blue-500/10 to-purple-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
              
              {/* Left Column: Headline & Action Buttons */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-200/80 dark:bg-white/10 border border-neutral-300/80 dark:border-white/15 text-xs font-bold uppercase tracking-wider mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#D2F843] animate-pulse"></span>
                  Official Mobile Suite • v2.4.0
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.08] mb-6">
                  The Contactless OS <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-neutral-700 to-[#6b8500] dark:from-white dark:via-neutral-200 dark:to-[#D2F843]">
                    in Your Pocket.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                  Reprogram your physical NTAG216 smart cards in under 10ms, receive instant tap radar alerts across Nigeria, and store 10,000+ offline contacts. Zero subscription fees.
                </p>

                {/* Primary Download Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-8">
                  {/* Apple App Store */}
                  <button
                    onClick={() => handleDownloadClick('ios')}
                    disabled={downloadingPlatform === 'ios'}
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-all shadow-md cursor-pointer group active:scale-95"
                  >
                    <Apple className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-semibold tracking-wider opacity-70 leading-none">Download on the</div>
                      <div className="text-sm font-extrabold leading-tight">App Store</div>
                    </div>
                  </button>

                  {/* Google Play Store */}
                  <button
                    onClick={() => handleDownloadClick('android')}
                    disabled={downloadingPlatform === 'android'}
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 transition-all shadow-md cursor-pointer group active:scale-95"
                  >
                    <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a2.023 2.023 0 0 1-.22-.96V2.774c0-.36.08-.69.22-.96zm11.603 11.603l2.84 2.84-12.22 7.02 9.38-9.86zm0-2.834L5.832.527l12.22 7.02-2.84 2.84zm1.417 1.417l3.52 2.02c1.07.61 1.07 1.62 0 2.23l-3.52 2.02-2.12-2.12 2.12-2.15z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-[10px] uppercase font-semibold tracking-wider opacity-70 leading-none">Get it on</div>
                      <div className="text-sm font-extrabold leading-tight">Google Play</div>
                    </div>
                  </button>

                  {/* Direct APK Download */}
                  <a
                    href="/CHIP_NG_v2.4.0.apk"
                    download="CHIP_NG_v2.4.0_Official.apk"
                    onClick={() => recordAppDownload('apk', { source: 'mobile_app_page', version: '2.4.0' })}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-200/80 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/15 text-neutral-900 dark:text-white border border-neutral-300/80 dark:border-white/15 font-bold text-xs sm:text-sm transition-all cursor-pointer group active:scale-95"
                  >
                    <Download className="w-4 h-4 text-[#D2F843] group-hover:translate-y-0.5 transition-transform" />
                    <span>Download APK (2.9 MB)</span>
                  </a>
                </div>

                {/* Compatibility Micro-Bar */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> iOS 15.0+ Compatible
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Android 8.0+ Ready
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Lifetime Updates
                  </span>
                </div>
              </div>

              {/* Right Column: Official Android APK Distribution & Spec Card */}
              <div className="w-full lg:w-[460px] flex flex-col items-center">
                {/* Official Hardware & Package Card */}
                <div className="w-full max-w-[400px] bg-neutral-900 text-white rounded-[36px] p-6 shadow-2xl border border-neutral-800 relative">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#D2F843] text-neutral-950 flex items-center justify-center font-black text-xs">
                        NG
                      </div>
                      <div>
                        <div className="font-extrabold text-sm tracking-tight">CHIP NG Android Suite</div>
                        <div className="text-[10px] text-neutral-400 font-mono">com.chipng.app • v2.4.0</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-bold">
                      VERIFIED APK
                    </span>
                  </div>

                  <div className="py-5 space-y-3.5">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Package Type</span>
                      <span className="font-bold text-white font-mono">Standalone Signed APK</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">File Size</span>
                      <span className="font-bold text-[#D2F843] font-mono">2.9 MB (Fast Download)</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Target Architecture</span>
                      <span className="font-bold text-white font-mono">Universal ARM64 / x86</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">NFC Engine</span>
                      <span className="font-bold text-emerald-400 font-mono">NTAG216 (Sub-10ms)</span>
                    </div>
                  </div>

                  <a
                    href="/CHIP_NG_v2.4.0.apk"
                    download="CHIP_NG_v2.4.0_Official.apk"
                    onClick={() => recordAppDownload('apk', { source: 'mobile_app_spec_card', version: '2.4.0' })}
                    className="w-full py-3.5 rounded-2xl bg-[#D2F843] text-neutral-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer hover:bg-[#c3e83b] transition-all"
                  >
                    <Download className="w-4 h-4 fill-current" /> Download Official APK Now
                  </a>
                </div>

                {/* Desktop QR Scan Pill */}
                <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex items-center gap-4 max-w-sm">
                  <div className="p-1.5 bg-white rounded-xl shrink-0 border border-neutral-200">
                    <QRCodeSVG 
                      value="https://www.chipng.com/CHIP_NG_v2.4.0.apk" 
                      size={54} 
                      level="M" 
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-neutral-950 dark:text-white">Scan with Camera</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Scan QR to download the Android APK directly to phone</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section className="py-16 sm:py-24 bg-white dark:bg-[#0c0d12] border-y border-neutral-200/80 dark:border-white/5 px-6 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-[#6b8500] dark:text-[#D2F843] uppercase tracking-wider mb-2">
                Engineered for African Hardware Dominance
              </h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Everything you need to command your contactless identity.
              </h3>
            </div>

            {/* Interactive Feature Tabs */}
            <div className="flex justify-center mb-10 overflow-x-auto scrollbar-hide">
              <div className="inline-flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 gap-1.5">
                {featureTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeFeatureTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFeatureTab(tab.id as any)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tab Showcase Box */}
            {featureTabs.filter(t => t.id === activeFeatureTab).map((item) => (
              <div key={item.id} className="p-8 sm:p-12 rounded-3xl bg-neutral-50 dark:bg-[#14161f] border border-neutral-200/80 dark:border-white/10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in duration-300">
                <div className="flex-1 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] font-bold text-xs uppercase mb-3">
                    {item.badge}
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white mb-3">
                    {item.headline}
                  </h4>
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" /> Bank-grade encryption
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-500" /> {item.stats}
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-72 p-6 rounded-2xl bg-white dark:bg-[#0c0d12] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col gap-3">
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Hardware Protocol</div>
                  <div className="font-mono text-sm text-neutral-950 dark:text-white font-semibold">ISO/IEC 14443-A (13.56 MHz)</div>
                  <div className="border-t border-neutral-100 dark:border-white/5 pt-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Guaranteed sub-10ms NFC coupling response on all Nigerian carrier networks.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Device Compatibility Search Matrix */}
        <section className="py-16 sm:py-24 px-6 sm:px-8 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight mb-2">
              Device Hardware Compatibility
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Verify your smartphone’s native background NFC capabilities before downloading.
            </p>
          </div>

          <div className="mb-6 max-w-md mx-auto">
            <input 
              type="text"
              placeholder="Search your phone (e.g. iPhone 15, Samsung S24)..."
              value={deviceSearch}
              onChange={(e) => setDeviceSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843] transition-all shadow-xs"
            />
          </div>

          <div className="bg-white dark:bg-[#111318] rounded-3xl border border-neutral-200/80 dark:border-white/10 overflow-hidden shadow-sm">
            <div className="divide-y divide-neutral-100 dark:divide-white/5">
              {filteredDevices.map((d, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">{d.brand}</span>
                    <h5 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white">{d.model}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 bg-neutral-100/60 dark:bg-[#0c0d12] border-t border-neutral-200/80 dark:border-white/5 px-6 sm:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight text-center mb-10">
              Mobile App Frequently Asked Questions
            </h3>

            <div className="space-y-3.5">
              {faqs.map((f, i) => (
                <div 
                  key={i} 
                  className="rounded-2xl bg-white dark:bg-[#14161f] border border-neutral-200/80 dark:border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base flex items-center justify-between text-neutral-950 dark:text-white cursor-pointer"
                  >
                    <span>{f.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-white/5 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MakroFooter onNavigate={onNavigate} />
    </div>
  );
}
