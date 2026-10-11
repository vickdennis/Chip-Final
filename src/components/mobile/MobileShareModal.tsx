import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, QrCode, Share2, Mail, MessageSquare, Send } from 'lucide-react';
import { toast } from '../Toast';
import { SocialMediaIconBadge } from '../social/SocialMediaIconBadge';

interface MobileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onOpenQr: () => void;
}

export const MobileShareModal: React.FC<MobileShareModalProps> = ({
  isOpen,
  onClose,
  profile,
  onOpenQr,
}) => {
  const username = profile?.username || 'user';
  const fullName = profile?.full_name || username;
  const profileUrl = `https://www.chipng.com/@${username}`;
  const shareText = `Connect with ${fullName} with one tap on CHIP NG: ${profileUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName} on CHIP NG`,
          text: `Connect with ${fullName} with one tap on CHIP NG:`,
          url: profileUrl,
        });
      } catch (e) {}
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleXShare = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(`Connect with me on CHIP NG:`)}&url=${encodeURIComponent(profileUrl)}&via=chipng_nfc`, '_blank');
  };

  const handleTelegramShare = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleEmailShare = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`${fullName}'s Contactless Profile`)}&body=${encodeURIComponent(shareText)}`, '_blank');
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
              <h3 className="text-lg font-bold text-white mb-1">
                Share Your CHIP NG
              </h3>
              <p className="text-xs text-neutral-400">
                Send your digital card profile across any channel in seconds.
              </p>
            </div>

            {/* Quick URL Strip with Copy */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 mb-6">
              <div className="truncate pl-2">
                <span className="text-xs font-mono text-neutral-300 select-all truncate block">
                  {profileUrl}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-[#D2F843] hover:bg-[#c3eb34] text-neutral-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
            </div>

            {/* Social Share Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6 text-center">
              {/* WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-neutral-300">WhatsApp</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={handleXShare}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-neutral-800 border border-white/10 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="font-bold text-sm">𝕏</span>
                </div>
                <span className="text-[11px] font-medium text-neutral-300">X (Twitter)</span>
              </button>

              {/* Telegram */}
              <button
                onClick={handleTelegramShare}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-neutral-300">Telegram</span>
              </button>

              {/* QR Code */}
              <button
                onClick={() => {
                  onClose();
                  onOpenQr();
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-full bg-[#D2F843]/10 border border-[#D2F843]/20 text-[#D2F843] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-neutral-300">QR Code</span>
              </button>
            </div>

            {/* Native Sheet Button */}
            <button
              onClick={handleNativeShare}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mb-2"
            >
              <Share2 className="w-4 h-4" /> Open System Share Sheet
            </button>

            <button
              onClick={handleEmailShare}
              className="w-full py-2.5 text-center text-xs text-neutral-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" /> Share via Email
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
