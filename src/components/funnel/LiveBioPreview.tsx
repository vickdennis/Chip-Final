import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, UserCheck, Download, Share2, Globe, Linkedin, Instagram, Twitter, MessageCircle, Sparkles } from 'lucide-react';

interface LiveBioPreviewProps {
  name: string;
  title: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
  handle?: string;
  className?: string;
}

export const LiveBioPreview: React.FC<LiveBioPreviewProps> = ({
  name = 'Victor Dennis',
  title = 'Managing Partner',
  company = 'CHIP Technologies',
  bio = 'Bridging high-level African enterprises with next-generation contactless networking hardware & digital bio engines.',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  handle = 'victor',
  className = '',
}) => {
  const [tapped, setTapped] = useState(false);
  const [vCardSaved, setVCardSaved] = useState(false);

  const triggerTapSimulation = () => {
    setTapped(true);
    setTimeout(() => setTapped(false), 2000);
  };

  const handleSaveContact = () => {
    setVCardSaved(true);
    setTimeout(() => setVCardSaved(false), 3000);
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Smartphone Frame (iPhone 16 Pro style) */}
      <div className="relative w-full max-w-[310px] aspect-[9/18.5] bg-[#0A0C10] rounded-[44px] p-3 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_0_8px_#1F232B,0_0_0_10px_#0D1016] border border-white/10 overflow-hidden">
        
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-end px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/80" />
        </div>

        {/* Tap Simulation Ripple Indicator */}
        <AnimatePresence>
          {tapped && (
            <motion.div
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 2.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center"
            >
              <div className="w-48 h-48 rounded-full border-4 border-[#B600A8]/80 bg-[#B600A8]/20 shadow-[0_0_80px_rgba(182,0,168,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screen Content Container (Scrollable) */}
        <div className="relative w-full h-full bg-gradient-to-b from-neutral-900 via-neutral-950 to-black rounded-[34px] overflow-y-auto overflow-x-hidden text-white flex flex-col justify-between pt-10 pb-6 px-4 no-scrollbar">
          
          {/* Top Status Bar Mock */}
          <div className="flex justify-between items-center text-[10px] font-mono text-white/50 px-2 mb-2">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-white/70" />
              <span>5G</span>
              <div className="w-4 h-2 rounded-sm border border-white/70 flex items-center p-0.5">
                <div className="w-full h-full bg-white rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mt-2">
            {/* Avatar with animated gradient border */}
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#B600A8] via-purple-500 to-amber-400 shadow-xl shadow-purple-950/40">
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-500 border-2 border-black flex items-center justify-center shadow-md">
                <UserCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Name & Headline */}
            <h4 className="font-bold text-base tracking-tight leading-tight text-white flex items-center gap-1">
              <span>{name || 'Your Full Name'}</span>
            </h4>
            <p className="text-xs font-medium text-[#D7A3F8] mt-0.5">
              {title || 'Professional Title'}
            </p>
            {company && (
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/50 mt-0.5">
                {company}
              </p>
            )}

            {/* Handle badge */}
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white/70 border border-white/10">
              chipng.com/@{handle || 'handle'}
            </span>

            {/* Micro Bio */}
            <p className="text-[11px] text-white/70 mt-3 px-1 leading-relaxed line-clamp-3">
              {bio}
            </p>
          </div>

          {/* Key Call to Action: Save Contact */}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleSaveContact}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{vCardSaved ? '✓ Contact Saved to Phone!' : 'Save Contact (vCard)'}</span>
            </button>

            <button
              onClick={triggerTapSimulation}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Wifi className="w-3 h-3 text-[#B600A8]" />
              <span>Simulate Contactless Tap</span>
            </button>
          </div>

          {/* Social Links Matrix */}
          <div className="mt-4 flex flex-col gap-2">
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 text-left px-1">
              Connect Directly
            </span>
            
            <div className="grid grid-cols-6 gap-1.5">
              {[
                { platform: 'whatsapp', label: 'WhatsApp', color: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20' },
                { platform: 'linkedin', label: 'LinkedIn', color: 'hover:border-blue-500/50 hover:shadow-blue-500/20' },
                { platform: 'instagram', label: 'Instagram', color: 'hover:border-pink-500/50 hover:shadow-pink-500/20' },
                { platform: 'x', label: 'X', color: 'hover:border-white/50 hover:shadow-white/20' },
                { platform: 'youtube', label: 'YouTube', color: 'hover:border-red-500/50 hover:shadow-red-500/20' },
                { platform: 'tiktok', label: 'TikTok', color: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:border-amber-500/50 ${item.color}`}
                  title={item.label}
                >
                  <div className="w-5 h-5 flex items-center justify-center text-white/80 hover:text-white">
                    {item.platform === 'instagram' && (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {item.platform === 'linkedin' && (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                    )}
                    {item.platform === 'whatsapp' && (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        <path d="M9.5 9.5c.3-.6.6-.6.9-.6h.6c.2 0 .4.1.5.4.3.7.8 1.9.9 2 .1.2.1.3 0 .5s-.3.3-.4.5c-.1.2-.3.4-.1.7.3.5.7 1 1.2 1.4.6.5 1.2.8 1.7 1 .3.1.5 0 .7-.2.2-.2.6-.7.8-.9.2-.3.4-.2.6-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3 0 .2 0 1.2-.5 1.7-.5.5-1.1.7-1.8.7-1.5 0-3.3-1-4.8-2.5-1.5-1.5-2.5-3.3-2.5-4.8 0-.7.2-1.3.7-1.8z" />
                      </svg>
                    )}
                    {item.platform === 'x' && (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                    {item.platform === 'youtube' && (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                      </svg>
                    )}
                    {item.platform === 'tiktok' && (
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.48c.32-.32.6-.67.84-1.05V10.8a8.27 8.27 0 0 0 4.79 1.52v-3.45a4.85 4.85 0 0 1-2-.18z" />
                      </svg>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Featured Link Card */}
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer mt-1">
              <div className="flex items-center gap-2 truncate pr-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="text-[10px] font-medium text-white truncate">Book a 15-Min Meeting</span>
              </div>
              <Share2 className="w-3 h-3 text-white/40 shrink-0" />
            </div>
          </div>

          {/* CHIP Brand Footer */}
          <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-center gap-1 text-[9px] font-mono text-white/40">
            <Sparkles className="w-2.5 h-2.5 text-[#B600A8]" />
            <span>POWERED BY CHIP NG DUAL-ENGINE</span>
          </div>
        </div>
      </div>

      {/* Instruction Badge below preview */}
      <div className="mt-3 flex items-center gap-2 text-xs font-mono text-white/60">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Live vCard & Bio Engine (Instant Load, No App Needed)</span>
      </div>
    </div>
  );
};
