import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '../Toast';
import chipngExactTile from '../../assets/images/chipng_exact_tile.png';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const MobileQrModal: React.FC<MobileQrModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const username = profile?.username || 'user';
  const profileUrl = `https://www.chipng.com/@${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Profile URL copied to clipboard!');
  };

  const handleDownloadQr = () => {
    try {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 1000;
      canvas.height = 1000;

      img.onload = () => {
        if (!ctx) return;
        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 1000, 1000);
        ctx.drawImage(img, 100, 100, 800, 800);

        const a = document.createElement('a');
        a.download = `chipng-${username}-qr.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        toast.success('QR Code downloaded!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      toast.error('Failed to download image. Try sharing the link.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || username}'s CHIP NG Profile`,
          text: `Scan my smart business card or visit my profile:`,
          url: profileUrl,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
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
            className="w-full sm:max-w-sm bg-[#111318] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative max-h-[90vh] overflow-y-auto"
          >
            {/* Pull Bar */}
            <div className="w-10 h-1 bg-white/20 rounded-full mb-4 sm:hidden" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <h3 className="text-lg font-bold text-white mb-1">
              Your Smart QR Code
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              Anyone can scan this with their smartphone camera to open your verified profile instantly.
            </p>

            {/* High-Contrast QR Card */}
            <div
              ref={qrRef}
              className="p-5 rounded-3xl bg-white shadow-xl border border-white/20 flex flex-col items-center justify-center relative mb-5"
            >
              <QRCodeSVG
                value={profileUrl}
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: chipngExactTile,
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
            </div>

            {/* Profile Identity Pill */}
            <div className="mb-6 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D2F843]" />
              <span className="text-xs font-mono font-medium text-neutral-300">
                chipng.com/@{username}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mb-2">
              <button
                onClick={handleDownloadQr}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Save PNG
              </button>
              <button
                onClick={handleShare}
                className="py-3 px-4 rounded-xl bg-[#D2F843] hover:bg-[#c3eb34] active:scale-[0.98] text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share QR
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 text-center text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Profile URL
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
