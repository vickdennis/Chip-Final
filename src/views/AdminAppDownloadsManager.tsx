import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Apple, 
  Radio, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  MapPin, 
  Activity, 
  RefreshCw, 
  QrCode, 
  ArrowUpRight, 
  FileDown,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { 
  fetchAppDownloadAnalytics, 
  recordAppDownload, 
  subscribeToDownloadTelemetry, 
  AppDownloadAnalytics, 
  AppDownloadEvent 
} from '../utils/telemetryClient';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '../components/Toast';
import { downloadCsvFile } from '../utils/adminApi';

export default function AdminAppDownloadsManager() {
  const [analytics, setAnalytics] = useState<AppDownloadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<'all' | 'ios' | 'android' | 'apk' | 'pwa'>('all');
  const [qrPlatform, setQrPlatform] = useState<'ios' | 'android' | 'apk' | 'all'>('all');

  const loadData = async () => {
    try {
      const data = await fetchAppDownloadAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load download telemetry', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to live telemetry channel
    const unsubscribe = subscribeToDownloadTelemetry(() => {
      loadData();
    });

    // Auto-poll every 15s to keep counters synced
    const interval = setInterval(loadData, 15000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    toast.success('App download telemetry refreshed');
  };

  const handleSimulateDownload = async (platform: 'ios' | 'android' | 'apk') => {
    setSimulating(true);
    await recordAppDownload(platform, { source: 'super_admin_simulation', version: '2.4.0' });
    toast.success(`Simulated test download for ${platform.toUpperCase()}`);
    setTimeout(async () => {
      await loadData();
      setSimulating(false);
    }, 400);
  };

  const handleExportCsv = () => {
    if (!analytics) return;
    const headers = ['Event ID', 'Platform', 'Device Type', 'Location', 'Version', 'Date'];
    const rows = analytics.recentDownloads.map((dl, idx) => [
      dl.id || `evt_${idx}`,
      dl.platform.toUpperCase(),
      dl.device_type || 'Mobile',
      `${dl.city || 'Lagos'}, ${dl.country || 'Nigeria'}`,
      dl.version || '2.4.0',
      dl.created_at
    ]);

    downloadCsvFile(`chipng_app_downloads_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    toast.success('Downloaded App Telemetry CSV Report');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111318] rounded-3xl p-12 text-center border border-neutral-200/80 dark:border-white/10">
        <div className="w-10 h-10 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-neutral-500">Loading Official Mobile App Telemetry...</p>
      </div>
    );
  }

  const total = analytics?.totalDownloads ?? 0;
  const iosCount = analytics?.byPlatform.ios ?? 0;
  const androidCount = analytics?.byPlatform.android ?? 0;
  const apkCount = analytics?.byPlatform.apk ?? 0;
  const pwaCount = analytics?.byPlatform.pwa ?? 0;

  const iosPercent = total > 0 ? Math.round((iosCount / total) * 100) : 0;
  const androidPercent = total > 0 ? Math.round((androidCount / total) * 100) : 0;
  const apkPercent = total > 0 ? Math.round((apkCount / total) * 100) : 0;
  const pwaPercent = total > 0 ? Math.round((pwaCount / total) * 100) : 0;

  const installGoal = 5000;
  const goalProgressPercent = total > 0 ? Math.min(100, Math.max(2, Math.round((total / installGoal) * 100))) : 0;

  const dailyTrends = analytics?.dailyTrends || [];
  const maxDailyTotal = Math.max(1, ...dailyTrends.map((t) => Number(t.total || 0)));
  const avgPerDay = typeof analytics?.avgPerDay === 'number'
    ? analytics.avgPerDay
    : dailyTrends.length > 0
      ? parseFloat((dailyTrends.reduce((s, d) => s + Number(d.total || 0), 0) / dailyTrends.length).toFixed(1))
      : 0;
  const topLocations = analytics?.topLocations || [];
  const topDevices = analytics?.topDevices || [];

  const filteredDownloads = (analytics?.recentDownloads || []).filter(item => {
    if (selectedPlatformFilter === 'all') return true;
    return item.platform === selectedPlatformFilter;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action Bar */}
      <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#16a34a]/15 via-blue-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#16a34a] mb-2">
              Live Telemetry · v2.4.0
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Official Mobile App Analytics
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
              Real-time monitoring of CHIP OS mobile companion downloads across Apple iOS App Store, Google Play Store, direct APK distribution, and Progressive Web App installations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#151821] hover:bg-neutral-50 dark:hover:bg-white/5 font-semibold text-xs text-neutral-700 dark:text-neutral-300 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#151821] hover:bg-neutral-50 dark:hover:bg-white/5 font-semibold text-xs text-neutral-700 dark:text-neutral-300 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <div className="relative group">
              <button
                onClick={() => handleSimulateDownload('android')}
                disabled={simulating}
                className="px-4 py-2.5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-[#16a34a] dark:text-neutral-950" />
                <span>{simulating ? 'Recording...' : 'Record Test Install'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        
        {/* Total Downloads Card */}
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-neutral-300 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/20 text-neutral-900 dark:text-[#16a34a] flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 tabular-nums">
              {pwaCount > 0 ? `${pwaCount} PWA` : `${goalProgressPercent}% of goal`}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Total App Installs
          </h3>
          <p className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight tabular-nums">
            {total.toLocaleString()}
          </p>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#16a34a] h-full rounded-full transition-all" style={{ width: `${goalProgressPercent}%` }} />
          </div>
          <p className="text-[11px] text-neutral-400 mt-2 font-medium tabular-nums">Goal: {installGoal.toLocaleString()} installs</p>
        </div>

        {/* iOS App Store */}
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-neutral-300 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center font-bold">
              <Apple className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold text-neutral-900 dark:text-white tabular-nums">
              {iosPercent}%
            </span>
          </div>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Apple App Store
          </h3>
          <p className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight tabular-nums">
            {iosCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400 mt-2 font-medium">iOS 16+ with CoreNFC API</p>
        </div>

        {/* Google Play Store */}
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-neutral-300 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {androidPercent}%
            </span>
          </div>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Google Play Store
          </h3>
          <p className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight tabular-nums">
            {androidCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400 mt-2 font-medium">Android 9.0+ NTAG Support</p>
        </div>

        {/* Direct APK Card */}
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-neutral-300 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
              {apkPercent}%
            </span>
          </div>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Direct High-Speed APK
          </h3>
          <p className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight tabular-nums">
            {apkCount.toLocaleString()}
          </p>
          <p className="text-[11px] text-neutral-400 mt-2 font-medium">Direct Sideload · {pwaPercent}% PWA</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-[#111318] p-6 rounded-3xl border border-neutral-200/80 dark:border-white/10 shadow-sm relative overflow-hidden group hover:border-neutral-300 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              Live Ratio
            </span>
          </div>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
            Tap-to-App Rate
          </h3>
          <p className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight tabular-nums">
            {(analytics?.conversionRate ?? 0).toFixed(1)}%
          </p>
          <p className="text-[11px] text-neutral-400 mt-2 font-medium">Installs vs tracked profile views</p>
        </div>

      </div>

      {/* Main Content Layout: Trends & Platform Share + Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: 7-Day Velocity & Regional Breakdown (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 7-Day Velocity Chart Container */}
          <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                  7-Day Download Velocity
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Rolling 7-day verified app download events recorded in database
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-neutral-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-white" /> iOS</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Android</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> APK</span>
              </div>
            </div>

            {/* Visual Bars */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6 pb-2 border-b border-neutral-200/60 dark:border-white/5">
              {dailyTrends.map((trend) => {
                const count = Number(trend.total || 0);
                const heightPercent = count > 0 ? Math.max(8, Math.round((count / maxDailyTotal) * 100)) : 2;
                return (
                  <div key={trend.date} className="flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors tabular-nums">
                      {count}
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-0.5">
                      <div 
                        className={`w-full rounded-lg transition-all ${count > 0 ? 'bg-gradient-to-t from-emerald-600 via-neutral-900 to-[#16a34a] dark:from-emerald-500 dark:via-white dark:to-[#16a34a]' : 'bg-neutral-300/40 dark:bg-white/10'}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider tabular-nums">
                      {trend.date}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 mt-4 gap-2">
              <span className="flex items-center gap-1.5 font-medium tabular-nums">
                <Activity className="w-4 h-4 text-emerald-500" /> 7-Day Average: <strong>{avgPerDay} downloads / day</strong>
              </span>
              <span className="text-[11px] text-neutral-400">
                Live rolling window (UTC)
              </span>
            </div>
          </div>

          {/* Regional Hubs & Devices Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Top Locations */}
            <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 border border-neutral-200/80 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-[#16a34a]" />
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Top Download Locations
                </h3>
              </div>
              {topLocations.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">
                  No download location telemetry recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {topLocations.map(loc => (
                    <div key={loc.city} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">{loc.city}</span>
                        <span className="text-neutral-500 tabular-nums">{loc.count} ({loc.percent}%)</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#16a34a] h-full rounded-full" style={{ width: `${loc.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices Breakdown */}
            <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 border border-neutral-200/80 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-[#16a34a]" />
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Recorded Device Types
                </h3>
              </div>
              {topDevices.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">
                  No device telemetry recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {topDevices.map(dev => (
                    <div key={dev.device} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white capitalize">{dev.device}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{dev.percent}% of installs</div>
                      </div>
                      <span className="text-xs font-extrabold text-neutral-600 dark:text-neutral-300 tabular-nums">{dev.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Live Stream & QR Quick Distribution */}
        <div className="space-y-6">
          
          {/* Live Download Feed */}
          <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200/60 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  Live Download Stream
                </h3>
              </div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Real-Time
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {(['all', 'ios', 'android', 'apk', 'pwa'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatformFilter(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    selectedPlatformFilter === p
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Scrollable Event List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {filteredDownloads.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-400">
                  No downloads recorded for this filter.
                </div>
              ) : (
                filteredDownloads.map((dl, idx) => {
                  const isIos = dl.platform === 'ios';
                  const isAndroid = dl.platform === 'android';
                  const isApk = dl.platform === 'apk';

                  return (
                    <div 
                      key={dl.id || idx}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/15 transition-all flex items-start gap-3"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isIos 
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950' 
                          : isAndroid 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isIos ? <Apple className="w-4 h-4" /> : isAndroid ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                            {dl.device_type || (isIos ? 'iPhone' : 'Android')}
                          </span>
                          <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                            {new Date(dl.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#16a34a] shrink-0" />
                          <span className="truncate">{dl.city || 'Lagos'}, {dl.country || 'Nigeria'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                            v{dl.version || '2.4.0'}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-neutral-200/60 dark:border-white/5 text-[11px] text-center text-neutral-400">
              Auto-updating via Supabase Telemetry Sync
            </div>
          </div>

          {/* Quick QR Testing Card for Admins */}
          <div className="bg-white dark:bg-[#111318] rounded-3xl p-6 border border-neutral-200/80 dark:border-white/10 shadow-sm text-center">
            <h3 className="text-sm font-bold text-neutral-950 dark:text-white mb-1">
              Admin Mobile Test Station
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Scan with your phone camera to test official app installation flow:
            </p>

            <div className="inline-block p-3.5 bg-white rounded-2xl shadow-md border border-neutral-200/80 mb-4">
              <QRCodeSVG
                value="https://www.chipng.com/app"
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <a
                href="/app"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-xs font-bold text-neutral-800 dark:text-white transition-all"
              >
                <span>Open App Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
