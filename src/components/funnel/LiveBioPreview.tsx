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
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: MessageCircle, label: 'WhatsApp', color: 'hover:bg-emerald-500/20 text-emerald-400' },
                { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-500/20 text-blue-400' },
                { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-500/20 text-pink-400' },
                { icon: Twitter, label: 'X / Twitter', color: 'hover:bg-sky-500/20 text-sky-400' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 transition-all cursor-pointer ${item.color}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[8px] font-medium text-white/70 mt-1">{item.label}</span>
                </div>
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
