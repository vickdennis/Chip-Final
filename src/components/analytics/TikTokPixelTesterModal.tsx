import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Play, X, ExternalLink, RefreshCw, Terminal, Activity } from 'lucide-react';
import { 
  TIKTOK_PIXEL_ID, 
  trackTikTokEvent, 
  trackTikTokPageView, 
  checkTikTokPixelStatus 
} from '../../utils/tiktokPixel';

interface TikTokPixelTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TikTokPixelTesterModal: React.FC<TikTokPixelTesterModalProps> = ({ isOpen, onClose }) => {
  const [pixelStatus, setPixelStatus] = useState<any>(null);
  const [logs, setLogs] = useState<Array<{ name: string; time: string; payload?: any }>>([]);
  const [lastTestedEvent, setLastTestedEvent] = useState<string | null>(null);

  const refreshStatus = () => {
    const status = checkTikTokPixelStatus();
    setPixelStatus(status);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStatus();
      if (typeof window !== 'undefined' && window.__tiktokPixelEvents) {
        setLogs(window.__tiktokPixelEvents.map(e => ({ name: e.event, time: e.timestamp, payload: e.params })));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestEvent = (eventName: string, params?: Record<string, any>) => {
    setLastTestedEvent(eventName);
    if (eventName === 'PageView') {
      trackTikTokPageView();
    } else {
      trackTikTokEvent(eventName, params);
    }
    refreshStatus();
    if (typeof window !== 'undefined' && window.__tiktokPixelEvents) {
      setLogs(window.__tiktokPixelEvents.map(e => ({ name: e.event, time: e.timestamp, payload: e.params })));
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#0F0D13] border border-white/15 rounded-3xl p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black border border-white/20 flex items-center justify-center text-[#25F4EE] shadow-[0_0_15px_rgba(37,244,238,0.3)]">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  TikTok Pixel Inspector
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/30 font-mono">
                    Live Diagnostics
                  </span>
                </h3>
                <p className="text-xs text-white/60">Inspect, verify and dispatch test events to TikTok Ads Manager</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <span className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Pixel ID</span>
              <p className="text-sm font-mono font-bold text-[#25F4EE] mt-1 break-all">
                {TIKTOK_PIXEL_ID}
              </p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <span className="text-[11px] text-white/50 uppercase font-mono tracking-wider">SDK State</span>
              <div className="flex items-center gap-2 mt-1">
                {pixelStatus?.initialized ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-300">window.ttq Ready</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">Initializing...</span>
                  </>
                )}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <span className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Script Injection</span>
              <div className="flex items-center gap-2 mt-1">
                {pixelStatus?.hasScriptTag ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-300">Active in DOM</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/70">events.js queued</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Test Buttons Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-[#25F4EE]" />
                Trigger Test Standard Events
              </h4>
              <button 
                onClick={refreshStatus}
                className="text-xs text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => handleTestEvent('PageView')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#25F4EE] transition-colors">
                  1. PageView
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">ttq.page()</div>
              </button>

              <button
                onClick={() => handleTestEvent('ViewContent', {
                  content_type: 'product',
                  content_name: 'Smart Metal NFC Card',
                  content_id: 'metal',
                  value: 50000,
                  currency: 'NGN',
                })}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#25F4EE] transition-colors">
                  2. ViewContent
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">Product View (₦50k)</div>
              </button>

              <button
                onClick={() => handleTestEvent('AddToCart', {
                  content_type: 'product',
                  content_name: 'Smart Plastic NFC (White)',
                  content_id: 'plastic_white',
                  value: 30000,
                  currency: 'NGN',
                })}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#25F4EE] transition-colors">
                  3. AddToCart
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">Customizer selection</div>
              </button>

              <button
                onClick={() => handleTestEvent('InitiateCheckout', {
                  content_type: 'product',
                  content_name: 'Smart Metal NFC (28g)',
                  content_id: 'metal',
                  value: 45000,
                  currency: 'NGN',
                })}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#25F4EE] transition-colors">
                  4. InitiateCheckout
                </div>
                <div className="text-[11px] text-white/50 mt-0.5">Checkout opened</div>
              </button>

              <button
                onClick={() => handleTestEvent('CompletePayment', {
                  content_type: 'product',
                  content_name: 'Smart Metal NFC Card',
                  content_id: 'metal',
                  quantity: 1,
                  value: 50000,
                  currency: 'NGN',
                  order_id: `TEST-${Date.now()}`,
                })}
                className="col-span-2 sm:col-span-2 p-3 rounded-xl bg-gradient-to-r from-[#25F4EE]/15 to-[#FE2C55]/15 hover:from-[#25F4EE]/25 hover:to-[#FE2C55]/25 border border-[#25F4EE]/40 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-bold text-[#25F4EE] group-hover:text-white transition-colors flex items-center justify-between">
                  <span>5. CompletePayment (Conversion)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">Primary Goal</span>
                </div>
                <div className="text-[11px] text-white/70 mt-0.5">Dispatches completed transaction event (₦50,000 NGN)</div>
              </button>
            </div>
          </div>

          {/* Event Dispatch History Console */}
          <div className="mb-6 bg-black/60 border border-white/10 rounded-2xl p-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-white/60">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#25F4EE]" />
                Event Dispatch Stream ({logs.length})
              </span>
              <span className="text-[11px] text-white/40">Open browser console for full payloads</span>
            </div>

            <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {logs.length === 0 ? (
                <div className="text-white/40 italic py-2">No test events fired yet. Click one of the buttons above to test.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2 p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.05]">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span className="font-bold text-[#25F4EE]">{log.name}</span>
                      {log.payload?.value && (
                        <span className="text-white/60">₦{log.payload.value.toLocaleString()} {log.payload.currency}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-white/40">{log.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TikTok Verification Instructions */}
          <div className="p-4 rounded-2xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 text-xs text-white/80">
            <h5 className="font-bold text-white flex items-center gap-2 mb-1.5">
              <span>How to verify in TikTok Ads Manager</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-white/70">
              <li>Open <strong>TikTok Ads Manager</strong> &gt; <strong>Assets</strong> &gt; <strong>Events</strong> &gt; <strong>Web Events</strong>.</li>
              <li>Select Pixel <code className="text-[#25F4EE] bg-black/40 px-1 py-0.5 rounded">{TIKTOK_PIXEL_ID}</code> and navigate to the <strong>Test Events</strong> tab.</li>
              <li>Enter this preview page URL or keep this page open; clicking any button above will stream events live into your TikTok dashboard!</li>
              <li>You can also install the official <strong>TikTok Pixel Helper</strong> Chrome extension to inspect all events in your browser toolbar.</li>
            </ol>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all cursor-pointer"
            >
              Done Testing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
