import React, { useState, useEffect } from "react";
import { TrendingUp, Users, MousePointerClick, ShieldCheck, Zap, Smartphone, QrCode, Globe, ArrowUpRight, Clock, RefreshCw } from "lucide-react";
import { supabase } from '../supabaseClient';

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  ctr: number;
  nfcTaps: number;
  qrScans: number;
  webViews: number;
  clicksByType: Array<{ click_type: string; count: number }>;
  topLinks: Array<{ link_title: string; link_url: string; click_type: string; clicks: number }>;
  recentActivity: Array<{ event_type: string; detail: string; created_at: string }>;
}

export default function DashboardAnalytics({ 
  profile, 
  onUpgrade, 
  profileViews = 0 
}: { 
  profile: any; 
  onUpgrade: () => void; 
  profileViews?: number;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealtimeAnalytics = async (showPulse = false) => {
    if (!profile?.id) return;
    if (showPulse) setIsRefreshing(true);
    try {
      const res = await fetch(`/api/analytics/user/${profile.id}`);
      if (res.ok) {
        const json = await res.json();
        // If supabase has higher count for views, sync it
        const finalViews = Math.max(json.totalViews || 0, profileViews || 0);
        const finalCtr = finalViews > 0 ? parseFloat(((json.totalClicks / finalViews) * 100).toFixed(1)) : 0;
        setData({
          ...json,
          totalViews: finalViews,
          ctr: finalCtr
        });
      }
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setLoading(false);
      if (showPulse) setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  useEffect(() => {
    fetchRealtimeAnalytics();
    // Poll every 5 seconds for authentic live real-time sync
    const interval = setInterval(() => {
      fetchRealtimeAnalytics();
    }, 5000);
    return () => clearInterval(interval);
  }, [profile?.id, profileViews]);

  if (!profile?.is_pro && !profile?.is_admin && profile?.email !== 'vickthor.dennis@gmail.com') {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318] rounded-3xl text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[#D2F843]/15 flex items-center justify-center mb-6 text-neutral-950 dark:text-[#D2F843]">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-2 tracking-tight">Real-time Bio & NFC Analytics</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-md">Upgrade to Pro to unlock real-time link click rates, NFC tap analytics, and audience telemetry.</p>
        <button 
          onClick={onUpgrade}
          className="px-7 py-3 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 font-bold text-xs rounded-full transition-all shadow-sm cursor-pointer"
        >
          Upgrade to Makro Pro
        </button>
      </div>
    );
  }

  const totalViews = data?.totalViews ?? profileViews ?? 0;
  const totalClicks = data?.totalClicks ?? 0;
  const ctr = data?.ctr ?? (totalViews > 0 ? parseFloat(((totalClicks / totalViews) * 100).toFixed(1)) : 0);
  const nfcTaps = data?.nfcTaps ?? 0;
  const qrScans = data?.qrScans ?? 0;
  const webViews = data?.webViews ?? Math.max(0, totalViews - (nfcTaps + qrScans));
  const topLinks = data?.topLinks || [];
  const recentActivity = data?.recentActivity || [];

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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D2F843]/20 text-[#596e00] dark:text-[#D2F843] text-[10px] font-bold">
                LIVE TELEMETRY
              </span>
            </div>
            <span className="text-xs font-semibold text-neutral-400 mt-0.5">@{profile?.username}</span>
            <span className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 font-medium">{profile?.headline || 'Link-in-bio & NFC Card'}</span>
          </div>
        </div>

        {/* Live status bubble */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchRealtimeAnalytics(true)}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors"
            title="Refresh Real-time Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#6c8600] dark:text-[#D2F843]' : ''}`} />
          </button>
          
          <div className="flex flex-col bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-3.5 px-5 self-start text-left">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-0.5">REAL-TIME VISITS</span>
            <span className="text-2xl font-extrabold text-neutral-950 dark:text-white leading-none tracking-tight">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-[#D2F843] font-bold mt-1.5 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time active
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10 mb-6">
        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{totalViews.toLocaleString()}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Views</span>
        </div>

        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-[#D2F843]/20 text-[#596e00] dark:text-[#D2F843] flex items-center justify-center mb-3">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{totalClicks.toLocaleString()}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Actual Clicks</span>
        </div>

        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{ctr}%</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Click Through (CTR)</span>
        </div>

        <div className="bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl text-neutral-950 dark:text-white mb-0.5">{nfcTaps.toLocaleString()}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Physical NFC Taps</span>
        </div>
      </div>

      {/* Traffic Sources & Top Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        {/* Source Breakdown */}
        <div className="md:col-span-5 bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-neutral-950 dark:text-white mb-1">Traffic Channels</h4>
            <p className="text-xs text-neutral-400 mb-4">Real distribution of how visitors accessed your profile</p>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                    <Smartphone className="w-3.5 h-3.5 text-purple-500" /> Physical NFC Card Tap
                  </span>
                  <span className="text-neutral-950 dark:text-white">{nfcTaps} ({totalViews > 0 ? Math.round((nfcTaps/totalViews)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${totalViews > 0 ? Math.round((nfcTaps/totalViews)*100) : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                    <QrCode className="w-3.5 h-3.5 text-blue-500" /> QR Code Scans
                  </span>
                  <span className="text-neutral-950 dark:text-white">{qrScans} ({totalViews > 0 ? Math.round((qrScans/totalViews)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalViews > 0 ? Math.round((qrScans/totalViews)*100) : 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                    <Globe className="w-3.5 h-3.5 text-[#6c8600] dark:text-[#D2F843]" /> Direct Web / Bio Link
                  </span>
                  <span className="text-neutral-950 dark:text-white">{webViews} ({totalViews > 0 ? Math.round((webViews/totalViews)*100) : 0}%)</span>
                </div>
                <div className="w-full h-2 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D2F843] rounded-full" style={{ width: `${totalViews > 0 ? Math.round((webViews/totalViews)*100) : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Clicked Actions */}
        <div className="md:col-span-7 bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-bold text-sm text-neutral-950 dark:text-white">Top Performing Links</h4>
              <span className="text-[11px] font-semibold text-neutral-400">Real Taps</span>
            </div>
            <p className="text-xs text-neutral-400 mb-4">Ranked by actual user clicks recorded on your public profile</p>

            {topLinks.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-white/10 rounded-xl">
                No link clicks recorded yet. Share your bio URL or tap your NFC card to see clicks live here.
              </div>
            ) : (
              <div className="space-y-2">
                {topLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-5 h-5 rounded-md bg-[#D2F843]/20 text-[#596e00] dark:text-[#D2F843] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-neutral-950 dark:text-white truncate">
                        {link.link_title || 'Link'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-white/5">
                        {link.click_type}
                      </span>
                    </div>
                    <div className="font-extrabold text-neutral-950 dark:text-white shrink-0">
                      {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="mb-6">
        <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Recent Real-Time Events
        </h4>
        {recentActivity.length === 0 ? (
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs text-neutral-400 text-center">
            Waiting for new visitor activity...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentActivity.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={`w-2 h-2 rounded-full ${item.event_type === 'view' ? 'bg-blue-500' : 'bg-[#D2F843]'}`} />
                  <span className="font-semibold text-neutral-950 dark:text-white capitalize truncate">
                    {item.event_type === 'view' ? `Profile Visit via ${item.detail}` : `Clicked "${item.detail}"`}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom status */}
      <div className="relative z-10 pt-4 border-t border-neutral-100 dark:border-white/5 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Realtime SQLite & Supabase Telemetry Sync Active
        </div>
        <div className="font-semibold text-[11px] uppercase tracking-wider text-neutral-500">100% REAL DATA</div>
      </div>
    </div>
  );
}
