import React, { useRef } from 'react';
import { 
  X, 
  UserPlus, 
  MessageSquare, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getInternationalWhatsAppUrl } from '../utils/countryData';
import UniversalVideoPlayer, { UniversalVideoPlayerRef, parseUniversalVideoUrl } from './UniversalVideoPlayer';

export { parseUniversalVideoUrl };

interface IntroVideoInterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  fullName?: string;
  username?: string;
  headline?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  onSaveContact?: () => void;
}

export default function IntroVideoInterstitial({
  isOpen,
  onClose,
  videoUrl,
  fullName = 'Executive',
  username = 'user',
  headline = 'CHIP NG Executive Profile',
  avatarUrl,
  phoneNumber,
  onSaveContact
}: IntroVideoInterstitialProps) {
  const playerRef = useRef<UniversalVideoPlayerRef | null>(null);

  if (!isOpen || !videoUrl) return null;

  const waUrl = phoneNumber 
    ? getInternationalWhatsAppUrl(phoneNumber, `Hi ${fullName}, I just watched your intro video on CHIP NG!`) 
    : null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm sm:max-w-md bg-neutral-950 rounded-[32px] overflow-hidden border border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh]">
        
        {/* Top Floating Header with Prominent [X] Cancel Button */}
        <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/95 via-black/50 to-transparent pointer-events-none">
          <div className="flex items-center gap-2.5 pointer-events-auto">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-neutral-800 shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-neutral-800">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white leading-tight truncate max-w-[170px] drop-shadow-sm">
                {fullName}
              </span>
              <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider flex items-center gap-1 drop-shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-[#16a34a]" /> Intro Video
              </span>
            </div>
          </div>

          {/* Prominent High-Contrast Close [X] Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close intro video"
            className="w-10 h-10 rounded-full bg-black/80 hover:bg-black active:scale-95 text-white border border-white/30 flex items-center justify-center transition-all cursor-pointer pointer-events-auto shadow-xl group"
            title="Cancel & view profile"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Universal Video Frame (Supports MP4, MOV, WebM, MKV, YouTube, TikTok, Vimeo, Loom, Instagram, Cloud Streams) */}
        <div className="relative w-full aspect-[9/16] max-h-[68vh] bg-black flex items-center justify-center overflow-hidden">
          <UniversalVideoPlayer
            ref={playerRef}
            url={videoUrl}
            autoPlay={true}
            defaultMuted={false}
            showControlsOverlay={true}
            className="w-full h-full"
          />
        </div>

        {/* Bottom Bar: Quick Action Buttons & Skip */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-t border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            {onSaveContact && (
              <button
                type="button"
                onClick={() => {
                  onSaveContact();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-white text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-[#16a34a]" />
                <span>Save Contact</span>
              </button>
            )}

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-center text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Skip to Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
