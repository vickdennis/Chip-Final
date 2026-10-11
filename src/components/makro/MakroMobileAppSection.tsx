import React, { useState } from 'react';
import { ViewState } from '../../App';
import { Apple, Download, Radio, Smartphone, CheckCircle2, ArrowRight, Zap, Shield } from 'lucide-react';
import { recordAppDownload } from '../../utils/telemetryClient';
import { toast } from '../Toast';

interface MakroMobileAppSectionProps {
  onNavigate: (view: ViewState) => void;
}

export const MakroMobileAppSection: React.FC<MakroMobileAppSectionProps> = ({ onNavigate }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (platform: 'ios' | 'android' | 'apk') => {
    setDownloading(platform);
    await recordAppDownload(platform, { source: 'homepage_section', version: '2.4.0' });

    if (platform === 'ios') {
      toast.success('Opening App Store...');
      setTimeout(() => {
        window.open('https://apps.apple.com/app/chip-ng/id6470000000', '_blank');
        setDownloading(null);
      }, 500);
    } else if (platform === 'android') {
      toast.success('Opening Google Play...');
      setTimeout(() => {
        window.open('https://play.google.com/store/apps/details?id=com.chipng.app', '_blank');
        setDownloading(null);
      }, 500);
    } else {
      toast.success('Starting direct APK download (18.4 MB)...');
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '/chipng_exact_tile.png';
        link.download = 'CHIP_NG_v2.4.0_Official.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloading(null);
      }, 700);
    }
  };

  return (
    <section className="py-20 sm:py-28 px-6 sm:px-8 bg-gradient-to-b from-transparent via-neutral-100/50 to-transparent dark:via-[#0c0d12]/50">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[36px] bg-neutral-950 text-white p-8 sm:p-14 lg:p-16 border border-neutral-800 shadow-2xl relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#D2F843]/20 via-blue-600/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-0"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            
            {/* Text & CTAs */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider mb-5">
                <Radio className="w-3.5 h-3.5 text-[#D2F843] animate-pulse" />
                <span>CHIP OS Companion App</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-5">
                Program Your Cards. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-[#D2F843]">
                  Track Every Tap in Real-Time.
                </span>
              </h2>

              <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                The official mobile companion for Nigerian dealmakers. Write NTAG216 microchips on iOS & Android, exchange contacts offline, and view live radar alerts.
              </p>

              {/* Action Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-8">
                <button
                  onClick={() => handleDownload('ios')}
                  disabled={downloading === 'ios'}
                  className="flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-100 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-md active:scale-95"
                >
                  <Apple className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-semibold opacity-70 leading-none">App Store</div>
                    <div className="text-xs sm:text-sm font-extrabold leading-tight">iOS 15.0+</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDownload('android')}
                  disabled={downloading === 'android'}
                  className="flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-2xl bg-white text-neutral-950 hover:bg-neutral-100 transition-all font-bold text-xs sm:text-sm cursor-pointer shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.023 2.023 0 0 1-.22-.96V2.774c0-.36.08-.69.22-.96zm11.603 11.603l2.84 2.84-12.22 7.02 9.38-9.86zm0-2.834L5.832.527l12.22 7.02-2.84 2.84zm1.417 1.417l3.52 2.02c1.07.61 1.07 1.62 0 2.23l-3.52 2.02-2.12-2.12 2.12-2.15z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-semibold opacity-70 leading-none">Google Play</div>
                    <div className="text-xs sm:text-sm font-extrabold leading-tight">Android 8.0+</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDownload('apk')}
                  disabled={downloading === 'apk'}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4 text-[#D2F843]" />
                  <span>Direct APK</span>
                </button>
              </div>

              {/* View Full Info Screen Link */}
              <button
                onClick={() => onNavigate('mobile-app')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D2F843] hover:underline cursor-pointer"
              >
                <span>Explore all app features, device compatibility & manual</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Graphic */}
            <div className="w-full lg:w-96 p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-neutral-400">HARDWARE SPECS</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  VERIFIED NTAG216
                </span>
              </div>
              <div className="space-y-2.5 text-xs text-neutral-300">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#D2F843] shrink-0" />
                  <span>Sub-10ms tag write coupling time</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#D2F843] shrink-0" />
                  <span>Zero monthly hardware subscriptions</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#D2F843] shrink-0" />
                  <span>10,000+ contact offline safe storage</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#D2F843] shrink-0" />
                  <span>Apple Wallet & Google Pay pass sync</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
