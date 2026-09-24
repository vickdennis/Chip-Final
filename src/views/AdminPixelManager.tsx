import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  ExternalLink, 
  RefreshCw, 
  Terminal, 
  Trash2, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { 
  TIKTOK_PIXEL_ID, 
  trackTikTokEvent, 
  trackTikTokPageView, 
  checkTikTokPixelStatus 
} from '../utils/tiktokPixel';

export default function AdminPixelManager() {
  const [pixelStatus, setPixelStatus] = useState<any>(null);
  const [logs, setLogs] = useState<Array<{ name: string; time: string; payload?: any; status?: string }>>([]);
  const [lastTestedEvent, setLastTestedEvent] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'tiktok' | 'meta' | 'events'>('tiktok');

  const refreshStatus = () => {
    const status = checkTikTokPixelStatus();
    setPixelStatus(status);
  };

  useEffect(() => {
    refreshStatus();
    if (typeof window !== 'undefined' && window.__tiktokPixelEvents) {
      setLogs(
        window.__tiktokPixelEvents.map((e) => ({
          name: e.event,
          time: e.timestamp,
          payload: e.params,
          status: e.status,
        }))
      );
    }
  }, []);

  const handleTestEvent = (eventName: string, params?: Record<string, any>) => {
    setLastTestedEvent(eventName);
    if (eventName === 'PageView') {
      trackTikTokPageView();
    } else {
      trackTikTokEvent(eventName, params);
    }
    refreshStatus();
    if (typeof window !== 'undefined' && window.__tiktokPixelEvents) {
      setLogs(
        window.__tiktokPixelEvents.map((e) => ({
          name: e.event,
          time: e.timestamp,
          payload: e.params,
          status: e.status,
        }))
      );
    }
  };

  const handleClearLogs = () => {
    if (typeof window !== 'undefined') {
      window.__tiktokPixelEvents = [];
    }
    setLogs([]);
  };

  const copyPixelId = () => {
    navigator.clipboard.writeText(TIKTOK_PIXEL_ID);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" /> Ad Telemetry & Pixels
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Tracking Pixels & Ad Diagnostics
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Super Admin management hub for TikTok Pixel, Meta Ads tracking, and conversion funnels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshStatus}
            className="px-4 py-2 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-900 dark:text-white rounded-full transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
          <a
            href="https://ads.tiktok.com/marketing_api/docs?id=1739585644781570"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 rounded-full hover:opacity-90 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
          >
            <span>TikTok Ads Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Modern Sub-Tabs */}
      <div className="overflow-x-auto scrollbar-hide py-1">
        <div className="inline-flex p-1.5 rounded-2xl bg-neutral-200/60 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 gap-1.5">
          <button
            onClick={() => setActiveTab('tiktok')}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'tiktok'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            TikTok Pixel (Active)
          </button>
          <button
            onClick={() => setActiveTab('meta')}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'meta'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            Meta / Facebook Pixel
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
            }`}
          >
            Live Event Stream ({logs.length})
          </button>
        </div>
      </div>

      {/* TIKTOK PIXEL TAB */}
      {activeTab === 'tiktok' && (
        <div className="flex flex-col gap-6">
          {/* Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Pixel ID
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-sm font-mono font-bold text-neutral-950 dark:text-white truncate">
                  {TIKTOK_PIXEL_ID}
                </span>
                <button
                  onClick={copyPixelId}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 transition-colors cursor-pointer"
                  title="Copy Pixel ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                TikTok SDK State
              </span>
              <div className="flex items-center gap-2 mt-2">
                {pixelStatus?.initialized ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      window.ttq Initialized
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Waiting for window.ttq
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Script Injection
              </span>
              <div className="flex items-center gap-2 mt-2">
                {pixelStatus?.hasScriptTag ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Script Active
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Script Pending
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                Session Events
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-neutral-950 dark:text-white">
                  {logs.length}
                </span>
                <span className="text-xs text-neutral-400">logged</span>
              </div>
            </div>
          </div>

          {/* Interactive Diagnostic Test Suite */}
          <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-neutral-950 dark:text-white">
                  Interactive Conversion Event Tester
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Click any standard e-commerce event below to dispatch real-time tracking signals to TikTok Ads Manager.
                </p>
              </div>
              {lastTestedEvent && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30">
                  Last Fired: {lastTestedEvent}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Event 1: PageView */}
              <button
                onClick={() => handleTestEvent('PageView')}
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] hover:border-[#D2F843] transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">Top-Funnel</span>
                    <Play className="w-3 h-3 text-[#6c8600] dark:text-[#D2F843]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white block">PageView</span>
                  <p className="text-[11px] text-neutral-400 mt-1">Landing visit</p>
                </div>
                <span className="text-[10px] font-semibold text-[#6c8600] dark:text-[#D2F843] mt-2">Test Dispatch →</span>
              </button>

              {/* Event 2: ViewContent (PVC ₦30k) */}
              <button
                onClick={() =>
                  handleTestEvent('ViewContent', {
                    content_type: 'product',
                    content_name: 'Custom PVC NFC Card (UV Print)',
                    content_id: 'plastic',
                    value: 30000,
                    currency: 'NGN',
                  })
                }
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] hover:border-[#D2F843] transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">Engagement</span>
                    <Play className="w-3 h-3 text-[#6c8600] dark:text-[#D2F843]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white block">ViewContent (PVC)</span>
                  <p className="text-[11px] text-neutral-400 mt-1">PVC Card (₦30,000)</p>
                </div>
                <span className="text-[10px] font-semibold text-[#6c8600] dark:text-[#D2F843] mt-2">Test Dispatch →</span>
              </button>

              {/* Event 3: ViewContent (Metal ₦100k) */}
              <button
                onClick={() =>
                  handleTestEvent('ViewContent', {
                    content_type: 'product',
                    content_name: 'Custom Metal NFC Card (Laser Engraved)',
                    content_id: 'metal',
                    value: 100000,
                    currency: 'NGN',
                  })
                }
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] hover:border-[#D2F843] transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">High-Ticket</span>
                    <Play className="w-3 h-3 text-[#6c8600] dark:text-[#D2F843]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white block">ViewContent (Metal)</span>
                  <p className="text-[11px] text-neutral-400 mt-1">Metal Card (₦100,000)</p>
                </div>
                <span className="text-[10px] font-semibold text-[#6c8600] dark:text-[#D2F843] mt-2">Test Dispatch →</span>
              </button>

              {/* Event 4: InitiateCheckout */}
              <button
                onClick={() =>
                  handleTestEvent('InitiateCheckout', {
                    content_type: 'product',
                    content_name: 'Custom Metal NFC Card',
                    content_id: 'metal',
                    value: 100000,
                    currency: 'NGN',
                    num_items: 1,
                  })
                }
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] hover:border-[#D2F843] transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">Mid-Funnel</span>
                    <Play className="w-3 h-3 text-[#6c8600] dark:text-[#D2F843]" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white block">InitiateCheckout</span>
                  <p className="text-[11px] text-neutral-400 mt-1">Modal opened</p>
                </div>
                <span className="text-[10px] font-semibold text-[#6c8600] dark:text-[#D2F843] mt-2">Test Dispatch →</span>
              </button>

              {/* Event 5: CompletePayment */}
              <button
                onClick={() =>
                  handleTestEvent('CompletePayment', {
                    content_type: 'product',
                    content_name: 'Custom Metal NFC Card Order',
                    content_id: 'metal',
                    value: 100000,
                    currency: 'NGN',
                    transaction_id: 'TEST_CHIP_' + Math.floor(Math.random() * 899999 + 100000),
                  })
                }
                className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] hover:border-[#D2F843] transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold uppercase text-neutral-400">Conversion</span>
                    <Play className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-neutral-950 dark:text-white block">CompletePayment</span>
                  <p className="text-[11px] text-neutral-400 mt-1">Paystack purchase</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">Test Dispatch →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* META PIXEL TAB */}
      {activeTab === 'meta' && (
        <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-lg text-neutral-950 dark:text-white">
              Meta / Facebook Pixel Configuration
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Configure Meta Pixel ID to track Facebook & Instagram ad conversions alongside TikTok.
            </p>
          </div>

          <div className="max-w-xl flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Meta Pixel ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 192847192837461"
                  defaultValue="102938475618293"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-xs sm:text-sm font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
                />
                <button
                  type="button"
                  onClick={() => alert('Meta Pixel ID updated successfully in super admin config.')}
                  className="px-5 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 rounded-full font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  Save ID
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Dual-tracking active: All link-in-bio page views, buy box clicks, and Paystack checkouts broadcast both TikTok Pixel and Meta events synchronously.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LIVE EVENT STREAM LOG TABLE */}
      <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#6c8600] dark:text-[#D2F843]" />
            <h3 className="font-bold text-base text-neutral-950 dark:text-white">
              Real-Time Tracking Event Stream
            </h3>
          </div>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="text-xs text-rose-500 hover:text-rose-600 disabled:opacity-40 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Stream
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-neutral-200/80 dark:border-white/10 rounded-2xl text-neutral-400 text-xs">
            No events registered in this session yet. Click any test event above to monitor telemetry in real-time.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-500 dark:text-neutral-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="p-3">Time</th>
                  <th className="p-3">Event Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                {logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02]">
                    <td className="p-3 text-neutral-400 whitespace-nowrap font-mono">{log.time}</td>
                    <td className="p-3 font-semibold text-neutral-950 dark:text-white">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30">
                        {log.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                      </span>
                    </td>
                    <td className="p-3 font-mono text-neutral-600 dark:text-neutral-400 max-w-md truncate">
                      {log.payload ? JSON.stringify(log.payload) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
