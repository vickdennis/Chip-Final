import React from 'react';
import { 
  Eye, 
  Users, 
  Calendar, 
  Share2, 
  QrCode, 
  Wifi, 
  ArrowUpRight, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { MobileTab } from '../../types/mobile';

interface MobileHomeTabProps {
  profile: any;
  viewsCount: number;
  leadsStats: { total: number; newCount: number; convertedCount: number };
  onNavigateTab: (tab: MobileTab) => void;
  onOpenQr: () => void;
  onOpenShare: () => void;
  onOpenNfc: () => void;
  onViewPublicProfile: () => void;
}

export const MobileHomeTab: React.FC<MobileHomeTabProps> = ({
  profile,
  viewsCount = 0,
  leadsStats,
  onNavigateTab,
  onOpenQr,
  onOpenShare,
  onOpenNfc,
  onViewPublicProfile,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const username = profile?.username || 'user';
  const fullName = profile?.full_name || username;
  const firstName = fullName.split(' ')[0] || 'Friend';

  // Calculate profile completion score
  const checks = [
    { label: 'Full name', done: !!profile?.full_name },
    { label: 'Headline', done: !!profile?.headline },
    { label: 'Profile avatar', done: !!profile?.cover_image_url },
    { label: 'Bio summary', done: !!profile?.bio },
    { label: 'Contact WhatsApp / Phone', done: !!profile?.phone_number },
    { label: 'Appointment Link', done: !!profile?.calendar_link },
  ];
  const completedCount = checks.filter(c => c.done).length;
  const completionPercentage = Math.round((completedCount / checks.length) * 100);

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* Welcome Greeting Strip */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-neutral-400 block uppercase tracking-wider">
            {getGreeting()},
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 font-sans">
            {firstName}
            {profile?.is_verified && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#3b82f6] text-white text-[9px] font-bold" title="Verified CHIP NG Cardholder">
                ✓
              </span>
            )}
          </h2>
        </div>

        <button
          onClick={onViewPublicProfile}
          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Preview</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#D2F843]" />
        </button>
      </div>

      {/* Hero 3D Card Interactive Preview Widget */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-neutral-900 via-[#12141c] to-neutral-950 border border-white/10 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#D2F843]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-44">
          {/* Top card bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-widest text-white font-mono">CHIP<span className="text-[#D2F843]">NG</span></span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                NTAG216 NFC
              </span>
            </div>
            <Wifi className="w-5 h-5 text-[#D2F843]" />
          </div>

          {/* User Name & Bio on Card */}
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white tracking-tight truncate">
              {fullName}
            </h3>
            <p className="text-xs text-neutral-400 truncate max-w-xs font-medium">
              {profile?.headline || 'Verified Digital Business Profile'}
            </p>
            <p className="text-[11px] font-mono text-neutral-500 truncate">
              chipng.com/@{username}
            </p>
          </div>

          {/* 1-Tap Quick Action Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <button
              onClick={onOpenShare}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D2F843]" /> Share
            </button>
            <button
              onClick={onOpenQr}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-[#D2F843]" /> QR Code
            </button>
            <button
              onClick={onOpenNfc}
              className="flex-1 py-2 px-3 rounded-xl bg-[#D2F843] hover:bg-[#c3eb34] active:scale-[0.98] text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Wifi className="w-3.5 h-3.5" /> Tap NFC
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Real-Time Analytics
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Profile Views */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Profile Taps</span>
              <Eye className="w-4 h-4 text-[#D2F843]" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                {viewsCount.toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono mt-1">
                Sub-10ms cloud visits
              </div>
            </div>
          </div>

          {/* Captured Leads */}
          <div 
            onClick={() => onNavigateTab('leads')}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 flex flex-col justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium">Total Leads</span>
              <Users className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-mono">
                {leadsStats.total.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                {leadsStats.newCount} new to contact <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar */}
      {completionPercentage < 100 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#12141a] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D2F843]" />
              <span className="text-xs font-bold text-white">Profile {completionPercentage}% Complete</span>
            </div>
            <button
              onClick={() => onNavigateTab('profile')}
              className="text-xs font-semibold text-[#D2F843] hover:underline cursor-pointer"
            >
              Complete Now →
            </button>
          </div>

          <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-[#D2F843] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-400">
            Profiles with a photo, headline, and calendar link convert 3.8x more leads during in-person meetings.
          </p>
        </div>
      )}

      {/* Quick Launchpad Shortcuts */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
          CHIP NG Modules
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Shop Hardware */}
          <div
            onClick={() => onNavigateTab('shop')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#D2F843] transition-colors">
                  Hardware Card Store
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Order Smart Matte PVC, Brushed Metal, or Debit Cards
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>

          {/* Leads CRM */}
          <div
            onClick={() => onNavigateTab('leads')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#D2F843] transition-colors">
                  2-Way Contact CRM
                </h4>
                <p className="text-[11px] text-neutral-400">
                  View and convert contacts gathered from card taps
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>

          {/* Appointments / Calendar */}
          <div
            onClick={() => onNavigateTab('more')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#D2F843] transition-colors">
                  Appointments & Calendar
                </h4>
                <p className="text-[11px] text-neutral-400">
                  {profile?.calendar_link ? 'Calendly link connected' : 'Connect Calendly / Cal.com link'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
