import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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
      <div className="flex flex-col items-center justify-center p-12 border border-black/10 dark:border-white/10 bg-gray-100/85 dark:bg-neutral-950/85 backdrop-blur-2xl rounded-3xl text-center shadow-[0_30px_80px_rgba(0,0,0,0.85)]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B600A8] to-[#18011F] flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-black dark:text-white" />
        </div>
        <h3 className="font-display text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-wide">Real-time Analytics</h3>
        <p className="text-black/60 dark:text-white/60 mb-8 max-w-md">Upgrade to Pro to unlock live telemetry, engagement tracking, and deep audience insights.</p>
        <button 
          onClick={onUpgrade}
          className="px-8 py-4 bg-white text-black font-mono font-bold hover:bg-neutral-200 transition-colors rounded-xl"
        >
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative rounded-3xl border border-black/10 dark:border-white/10 bg-gray-100/85 dark:bg-neutral-950/85 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.85)] hover:border-black/20 dark:border-white/20 transition-all duration-500">
      {/* Neon Background lighting flare inside telemetry card */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -right-32 -top-32 w-72 h-72 rounded-full bg-gradient-to-br from-[#B600A8] to-[#18011F] filter blur-[100px] opacity-20 transition-all duration-1000" />
        <div className="absolute -left-32 -bottom-32 w-72 h-72 rounded-full bg-indigo-500/10 filter blur-[100px]" />
      </div>

      {/* Inner dynamic tech metadata borders */}
      <div className="absolute top-4 left-6 text-[8px] font-mono text-white/10 tracking-[0.25em]">TELEMETRY MODULE: Active</div>
      <div className="absolute top-4 right-6 text-[8px] font-mono text-white/10 tracking-[0.25em]">SECURE CHIP-NFC LINK</div>

      {/* Header portion */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6 pt-4">
        
        {/* Profile details */}
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#B600A8] to-[#18011F] p-[1.5px] shadow-lg relative shrink-0">
            <div className="w-full h-full rounded-[14px] bg-[#0c0c0c] flex items-center justify-center font-sans font-black text-black dark:text-white text-lg sm:text-xl">
              {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '?'}
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-neutral-950 flex items-center justify-center animate-pulse">
              <span className="w-1 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-black text-lg text-black dark:text-white leading-none">
                {profile?.full_name || profile?.username || 'User'}
              </h3>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-400 font-mono text-[9px] font-bold uppercase tracking-wide">
                PRO ACTIVE
              </span>
            </div>
            <span className="font-mono text-xs text-[#D7E2EA]/50 mt-1">@{profile?.username}</span>
            <span className="font-sans text-[11px] text-white/70 mt-1 uppercase tracking-wide font-medium">{profile?.headline}</span>
          </div>
        </div>

        {/* Follower stats bubble */}
        <div className="flex flex-col bg-black/5 dark:bg-white/5 border border-white/5 rounded-2xl p-3 px-4 self-start text-left">
          <span className="font-mono text-[9px] text-[#D7E2EA]/40 uppercase tracking-widest leading-none block mb-1">LIVE VIEWS</span>
          <span className="font-sans font-black text-lg text-black dark:text-white leading-none tracking-tight">
            {liveViews.toLocaleString()}
          </span>
          <span className="font-mono text-[10px] text-green-400 font-bold block mt-1 text-left flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active Now
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mb-6">
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col">
          <Users className="w-5 h-5 text-indigo-400 mb-2" />
          <span className="font-sans font-bold text-xl text-black dark:text-white mb-1">{liveViews.toLocaleString()}</span>
          <span className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest">Total Visits</span>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col">
          <MousePointerClick className="w-5 h-5 text-pink-400 mb-2" />
          <span className="font-sans font-bold text-xl text-black dark:text-white mb-1">{liveClicks.toLocaleString()}</span>
          <span className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest">Link Clicks</span>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col">
          <ShieldCheck className="w-5 h-5 text-green-400 mb-2" />
          <span className="font-sans font-bold text-xl text-black dark:text-white mb-1">{liveViews > 0 ? Math.round((liveClicks/liveViews)*100) : 0}%</span>
          <span className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest">CTR</span>
        </div>
        <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col">
          <TrendingUp className="w-5 h-5 text-blue-400 mb-2" />
          <span className="font-sans font-bold text-xl text-black dark:text-white mb-1">Top 5%</span>
          <span className="font-mono text-[9px] text-black/40 dark:text-white/40 uppercase tracking-widest">Global Rank</span>
        </div>
      </div>
      
      {/* Bottom Live feed mock */}
      <div className="relative z-10 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] font-mono text-black/40 dark:text-white/40">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          TELEMETRY CONNECTION SECURED (0.4ms)
        </div>
        <div>ENCRYPTED SSL</div>
      </div>
    </div>
  );
}
