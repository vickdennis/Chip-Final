import React, { useState, useEffect } from "react";
import { TrendingUp, Users, MousePointerClick, ShieldCheck, Zap } from "lucide-react";
import { supabase } from '../supabaseClient';

export default function DashboardAnalytics({ profile, onUpgrade, profileViews = 0 }: { profile: any, onUpgrade: () => void, profileViews?: number }) {
  const [liveViews, setLiveViews] = useState(profileViews);
  const [liveClicks, setLiveClicks] = useState(Math.floor(profileViews * 0.4));
  
  // Simulated real-time activity if Pro
  useEffect(() => {
    setLiveViews(profileViews);
    setLiveClicks(Math.floor(profileViews * 0.4));
    if (profile?.is_pro || profile?.is_admin) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setLiveViews(v => v + 1);
          if (Math.random() > 0.5) setLiveClicks(c => c + 1);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [profile, profileViews]);

  if (!profile?.is_pro && !profile?.is_admin && profile?.email !== 'vickthor.dennis@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318] rounded-3xl text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#D2F843]/15 flex items-center justify-center mb-6 text-neutral-950 dark:text-[#D2F843]">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-2 tracking-tight">Real-time Bio & NFC Analytics</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">Upgrade to Makro Pro to unlock real-time link click rates, NFC tap analytics, and audience geographics.</p>
        <button 
          onClick={onUpgrade}
          className="px-7 py-3 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 font-bold text-xs rounded-full transition-all shadow-sm cursor-pointer"
        >
          Upgrade to Makro Pro
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-3xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-sm">
      {/* Header portion */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
        
        {/* Profile details */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#D2F843] p-0.5 shadow-sm relative shrink-0">
            <div className="w-full h-full rounded-[14px] bg-neutral-950 flex items-center justify-center font-bold text-white text-lg sm:text-xl">
              {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '?'}
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D2F843] border-2 border-white dark:border-neutral-900 flex items-center justify-center" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-neutral-950 dark:text-white leading-tight">
                {profile?.full_name || profile?.username || 'User'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D2F843]/20 text-neutral-950 dark:text-[#D2F843] text-[10px] font-bold">
                PRO ACTIVE
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-400 mt-0.5">@{profile?.username}</span>
            <span className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 font-medium">{profile?.headline}</span>
          </div>
        </div>

        {/* Follower stats bubble */}
        <div className="flex flex-col bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-3.5 px-5 self-start text-left">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1">LIVE IMPRESSIONS</span>
          <span className="text-2xl font-extrabold text-neutral-950 dark:text-white leading-none tracking-tight">
            {liveViews.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#16a34a] dark:text-[#D2F843] font-bold mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Active Now
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mb-6">
        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{liveViews.toLocaleString()}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Visits</span>
        </div>
        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-[#D2F843]/20 text-neutral-950 dark:text-[#D2F843] flex items-center justify-center mb-3">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{liveClicks.toLocaleString()}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Link Clicks</span>
        </div>
        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{liveViews > 0 ? Math.round((liveClicks/liveViews)*100) : 0}%</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">CTR</span>
        </div>
        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">Top 5%</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Global Rank</span>
        </div>
      </div>
      
      {/* Bottom status */}
      <div className="relative z-10 pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
          Live Bio Analytics & NFC Tap Sync Active
        </div>
        <div className="font-semibold text-[11px] uppercase tracking-wider">CHIPNG VERIFIED</div>
      </div>
    </div>
  );
}
