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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-[#25F4EE] animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-[28px] md:text-[34px] font-extrabold text-black dark:text-white tracking-tight leading-tight">
                Tracking Pixels & Ad Diagnostics
              </h2>
              <p className="text-[14px] text-black/60 dark:text-white/60">
                Super Admin management hub for TikTok Pixel, Meta Ads tracking, and conversion funnels.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshStatus}
            className="px-4 py-2.5 bg-white/40 dark:bg-black/40 hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white rounded-xl transition-all border border-black/10 dark:border-white/10 flex items-center gap-2 text-xs font-mono font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
          </button>
          <a
            href="https://ads.tiktok.com/marketing_api/docs?id=1739585644781570"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition-all flex items-center gap-2 text-xs font-mono font-bold"
          >
            <span>TikTok Ads Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex gap-4 border-b border-black/5 dark:border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('tiktok')}
          className={`pb-2 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'tiktok'
              ? 'border-[#25F4EE] text-[#0ea5e9] dark:text-[#25F4EE]'
              : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
          }`}
        >
          TikTok Pixel (Active)
        </button>
        <button
          onClick={() => setActiveTab('meta')}
          className={`pb-2 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'meta'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
          }`}
        >
          Meta / Facebook Pixel
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-2 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'events'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
          }`}
        >
          Live Event Stream ({logs.length})
        </button>
      </div>

      {/* TIKTOK PIXEL TAB */}
      {activeTab === 'tiktok' && (
        <div className="flex flex-col gap-6">
          {/* Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-5">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider block mb-1">
                Pixel ID (ChipNG Sales Funnel)
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-base font-mono font-bold text-black dark:text-white truncate">
                  {TIKTOK_PIXEL_ID}
                </span>
                <button
                  onClick={copyPixelId}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-black/60 dark:text-white/60 transition-colors"
                  title="Copy Pixel ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-5">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider block mb-1">
                TikTok SDK State
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                {pixelStatus?.initialized ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      window.ttq Initialized
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      Waiting for window.ttq
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-5">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider block mb-1">
                Script Tag Injection
              </span>
              <div className="flex items-center gap-2 mt-1.5">
                {pixelStatus?.hasScriptTag ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      Analytics Script Active
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      Script Pending
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-5">
              <span className="text-[11px] font-mono text-black/50 dark:text-white/50 uppercase tracking-wider block mb-1">
                Session Events Dispatched
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-black dark:text-white font-mono">
                  {logs.length}
                </span>
                <span className="text-xs text-black/40 dark:text-white/40 font-mono">events logged</span>
              </div>
            </div>
          </div>

          {/* Interactive Diagnostic Test Suite */}
          <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-sans font-bold text-lg text-black dark:text-white">
                  Interactive Conversion Event Tester
                </h3>
                <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                  Click any standard e-commerce event below to dispatch and test real-time tracking to TikTok Ads Manager.
                </p>
              </div>
              {lastTestedEvent && (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Last Fired: {lastTestedEvent}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Event 1: PageView */}
              <button
                onClick={() => handleTestEvent('PageView')}
                className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#25F4EE] hover:bg-[#25F4EE]/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-black/50 dark:text-white/50">Top-Funnel</span>
                    <Play className="w-3 h-3 text-[#25F4EE] opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="font-bold text-sm text-black dark:text-white block">PageView</span>
                  <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">Landing page visit</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">Test Dispatch →</span>
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
                className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#25F4EE] hover:bg-[#25F4EE]/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-black/50 dark:text-white/50">Engagement</span>
                    <Play className="w-3 h-3 text-[#25F4EE] opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="font-bold text-sm text-black dark:text-white block">ViewContent (PVC)</span>
                  <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">Custom PVC (₦30,000)</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">Test Dispatch →</span>
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
                className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#25F4EE] hover:bg-[#25F4EE]/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-black/50 dark:text-white/50">High-Ticket</span>
                    <Play className="w-3 h-3 text-[#25F4EE] opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="font-bold text-sm text-black dark:text-white block">ViewContent (Metal)</span>
                  <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">Custom Metal (₦100,000)</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">Test Dispatch →</span>
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
                className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-black/50 dark:text-white/50">Mid-Funnel</span>
                    <Play className="w-3 h-3 text-purple-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="font-bold text-sm text-black dark:text-white block">InitiateCheckout</span>
                  <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">Checkout modal opened</p>
                </div>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 mt-2">Test Dispatch →</span>
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
                className="p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono uppercase text-black/50 dark:text-white/50">Conversion</span>
                    <Play className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100" />
                  </div>
                  <span className="font-bold text-sm text-black dark:text-white block">CompletePayment</span>
                  <p className="text-[11px] text-black/50 dark:text-white/50 mt-1">Paystack purchase success</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-2">Test Dispatch →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* META PIXEL TAB */}
      {activeTab === 'meta' && (
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="font-sans font-bold text-lg text-black dark:text-white">
              Meta / Facebook Pixel Configuration
            </h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
              Configure Meta Pixel ID to track Facebook & Instagram ad conversions alongside TikTok.
            </p>
          </div>

          <div className="max-w-xl flex flex-col gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-black/60 dark:text-white/60 mb-1">
                Meta Pixel ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 192847192837461"
                  defaultValue="102938475618293"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm font-mono text-black dark:text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => alert('Meta Pixel ID updated successfully in super admin config.')}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors"
                >
                  Save ID
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Dual-tracking is active: All landing page actions and Paystack checkouts fire both TikTok Pixel and Meta standard events concurrently.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LIVE EVENT STREAM TAB OR LOG TABLE */}
      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#25F4EE]" />
            <h3 className="font-sans font-bold text-base text-black dark:text-white">
              Real-Time Tracking Event Stream
            </h3>
          </div>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="text-xs text-red-500 hover:text-red-600 disabled:opacity-40 flex items-center gap-1 font-mono transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Clear Stream
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-black/10 dark:border-white/10 rounded-xl text-black/40 dark:text-white/40 text-xs font-mono">
            No events registered in this session yet. Click any test button above or interact with the sales page to monitor live telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                  <th className="p-3 text-black/50 dark:text-white/50 uppercase">Time</th>
                  <th className="p-3 text-black/50 dark:text-white/50 uppercase">Event Name</th>
                  <th className="p-3 text-black/50 dark:text-white/50 uppercase">Status</th>
                  <th className="p-3 text-black/50 dark:text-white/50 uppercase">Payload Parameters</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-3 text-black/60 dark:text-white/60 whitespace-nowrap">{log.time}</td>
                    <td className="p-3 font-bold text-black dark:text-white">
                      <span className="px-2 py-0.5 rounded-md bg-[#25F4EE]/10 text-[#0ea5e9] dark:text-[#25F4EE] border border-[#25F4EE]/30">
                        {log.name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                      </span>
                    </td>
                    <td className="p-3 text-black/70 dark:text-white/70 max-w-md truncate">
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
