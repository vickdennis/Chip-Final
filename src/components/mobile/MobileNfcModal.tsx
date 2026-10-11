import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Wifi, CheckCircle2, AlertCircle, Copy, ExternalLink, Play } from 'lucide-react';
import { toast } from '../Toast';

interface MobileNfcModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const MobileNfcModal: React.FC<MobileNfcModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);
  const username = profile?.username || 'user';
  const profileUrl = `https://www.chipng.com/@${username}?tap=1`;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasNfc = 'NDEFReader' in window;
      setNfcSupported(hasNfc);
    }
  }, []);

  const handleCopyNfcUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('NFC Profile URL copied!');
  };

  const handleSimulateTap = () => {
    setIsSimulatingTap(true);
    setTimeout(() => {
      setIsSimulatingTap(false);
      window.open(profileUrl, '_blank');
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full sm:max-w-md bg-[#111318] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            {/* Pull Bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#D2F843]/10 border border-[#D2F843]/20 text-[#D2F843] flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                NFC Smart Business Card
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                No app needed for the recipient. One contactless tap opens your digital profile instantly.
              </p>
            </div>

            {/* Device Compatibility Status Banner */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-5 flex items-start gap-3">
              {nfcSupported ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#D2F843] shrink-0 mt-0.5" />
              )}
              <div className="text-left text-xs leading-relaxed">
                <div className="font-semibold text-white mb-0.5">
                  {nfcSupported
                    ? 'Web NFC API Detected on this device'
                    : 'Universal Background NFC Active'}
                </div>
                <p className="text-neutral-400 text-[11px]">
                  All modern iPhones (XR to 16 Pro) and 95%+ of Android phones read CHIP NG cards natively without any third-party app or settings changes.
                </p>
              </div>
            </div>

            {/* How to Tap Guide */}
            <div className="space-y-3 mb-6 text-left">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                How to Tap with Others:
              </h4>

              <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  iOS
                </div>
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-white">iPhones:</span> Tap against the top-front or top-back near the camera lens.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  AND
                </div>
                <div className="text-xs text-neutral-300">
                  <span className="font-semibold text-white">Android:</span> Tap against the center-back of the phone (ensure NFC is enabled in quick settings).
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <button
                onClick={handleSimulateTap}
                disabled={isSimulatingTap}
                className="w-full py-3.5 rounded-2xl bg-[#D2F843] hover:bg-[#c3eb34] active:scale-[0.98] text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#D2F843]/15 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                {isSimulatingTap ? 'Reading NFC signal...' : 'Simulate Live NFC Card Tap'}
              </button>

              <button
                onClick={handleCopyNfcUrl}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy NFC Profile Link
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
