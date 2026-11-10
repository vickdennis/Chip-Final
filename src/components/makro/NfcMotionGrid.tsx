import React, { useState } from 'react';
import { Zap, Smartphone, ExternalLink, Sparkles, CheckCircle2, X } from 'lucide-react';

export interface NfcMotionProfile {
  id: string;
  name: string;
  role: string;
  handle: string;
  image: string;
  category: string;
  followers?: string;
  badge?: string;
}

export const MOTION_PROFILES: NfcMotionProfile[] = [
  {
    id: 'nath-ude',
    name: 'Nath Ude',
    role: 'Group Chief Executive Officer (CEO)',
    handle: '@n.ude',
    image: '/assets/aistudio/IMG_3559_bd016bff.jpeg',
    category: 'Executive & Banking',
    badge: 'Verified Executive'
  },
  {
    id: 'stickman',
    name: 'Stickman Maniac',
    role: 'Digital Marketing Expert',
    handle: '@stickman',
    image: '/assets/aistudio/IMG_3560_5302d608.jpeg',
    category: 'Creator & Media',
    followers: '635.4K Followers'
  },
  {
    id: 'jesse-king',
    name: 'JesseKing',
    role: 'Professional Bongo Player & Talking Drummer',
    handle: '@jesseking',
    image: '/assets/aistudio/IMG_3561_d9ba0231.jpeg',
    category: 'Music & Performance',
    badge: 'Verified Artist'
  },
  {
    id: 'hemmy-sax',
    name: 'HemmySax',
    role: 'Celebrity Saxophonist',
    handle: '@hemmysax',
    image: '/assets/aistudio/IMG_3562_62ffe1a2.jpeg',
    category: 'Celebrity & Entertainment',
    badge: 'Celebrity'
  },
  {
    id: 'stephen',
    name: 'Stephen Asiedu Acquah',
    role: 'Student & Creator',
    handle: '@Stephenanane358@gmail.com',
    image: '/assets/aistudio/IMG_3563_49469e95.jpeg',
    category: 'Education & Tech',
    badge: 'Verified'
  },
  {
    id: 'propertyloop',
    name: 'PropertyLoop',
    role: 'Real Estate Marketplace',
    handle: '@propertyloop',
    image: '/assets/aistudio/IMG_3564_e0123d34.jpeg',
    category: 'Real Estate & PropTech',
    badge: 'Corporate'
  },
  {
    id: 'tony-zola',
    name: 'Tony Zola Classic Ltd.',
    role: 'Interior and Exterior Design & Finishing',
    handle: '@tonyzola370',
    image: '/assets/aistudio/IMG_3565_df2404d1.jpeg',
    category: 'Architecture & Design',
    badge: 'Enterprise'
  },
  {
    id: 'amos',
    name: 'Dr. Napoleon Saviour Amos',
    role: 'Ambassador & CEO, Dreemz Interior Concepts',
    handle: '@dreemz',
    image: '/assets/aistudio/IMG_3567_c8a47be2.jpeg',
    category: 'Executive & Leadership',
    badge: 'Ambassador'
  }
];

// Columns Setup
const COL_1 = [
  MOTION_PROFILES[7], // Dr. Napoleon
  MOTION_PROFILES[3], // HemmySax
  MOTION_PROFILES[5], // PropertyLoop
  MOTION_PROFILES[1], // Stickman
];

const COL_2 = [
  MOTION_PROFILES[0], // Nath Ude
  MOTION_PROFILES[6], // Tony Zola
  MOTION_PROFILES[2], // JesseKing
  MOTION_PROFILES[4], // Stephen
];

const COL_3 = [
  MOTION_PROFILES[5], // PropertyLoop
  MOTION_PROFILES[7], // Dr. Napoleon
  MOTION_PROFILES[4], // Stephen
  MOTION_PROFILES[3], // HemmySax
];

const COL_4 = [
  MOTION_PROFILES[1], // Stickman
  MOTION_PROFILES[2], // JesseKing
  MOTION_PROFILES[0], // Nath Ude
  MOTION_PROFILES[6], // Tony Zola
];

const COL_5 = [
  MOTION_PROFILES[3], // HemmySax
  MOTION_PROFILES[1], // Stickman
  MOTION_PROFILES[7], // Dr. Napoleon
  MOTION_PROFILES[5], // PropertyLoop
];

const COL_6 = [
  MOTION_PROFILES[6], // Tony Zola
  MOTION_PROFILES[0], // Nath Ude
  MOTION_PROFILES[4], // Stephen
  MOTION_PROFILES[2], // JesseKing
];

const COL_7 = [
  MOTION_PROFILES[2], // JesseKing
  MOTION_PROFILES[7], // Dr. Napoleon
  MOTION_PROFILES[6], // Tony Zola
  MOTION_PROFILES[0], // Nath Ude
];

const COL_8 = [
  MOTION_PROFILES[4], // Stephen
  MOTION_PROFILES[5], // PropertyLoop
  MOTION_PROFILES[1], // Stickman
  MOTION_PROFILES[3], // HemmySax
];

export interface NfcMotionGridProps {
  activeChipType?: 'metal' | 'pvc';
  variant?: 'bento' | 'hero' | 'fullscreen';
  className?: string;
  showHud?: boolean;
  children?: React.ReactNode;
}

export const NfcMotionGrid: React.FC<NfcMotionGridProps> = ({ 
  activeChipType = 'metal',
  variant = 'bento',
  className = '',
  showHud = true,
  children
}) => {
  const [selectedProfile, setSelectedProfile] = useState<NfcMotionProfile | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const isFullscreen = variant === 'fullscreen';
  const isHero = variant === 'hero';

  const renderCard = (profile: NfcMotionProfile, keyPrefix: string) => {
    return (
      <div
        key={`${keyPrefix}-${profile.id}`}
        onClick={() => setSelectedProfile(profile)}
        className={`group/card relative aspect-[9/18] rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl shadow-black/40 cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:border-[#16a34a] hover:shadow-2xl hover:shadow-[#16a34a]/20 shrink-0 select-none ${
          isFullscreen 
            ? 'w-[125px] sm:w-[145px] md:w-[165px] lg:w-[185px] opacity-85 hover:opacity-100' 
            : 'w-[125px] sm:w-[155px] md:w-[175px] lg:w-[190px]'
        }`}
      >
        {/* Real Profile Screenshot Image */}
        <img
          src={profile.image}
          alt={profile.name}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/card:scale-105"
        />

        {/* Gloss / Sheen Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 opacity-70 group-hover/card:opacity-40 transition-opacity pointer-events-none" />

        {/* Hover Info Pill */}
        <div className="absolute bottom-2 inset-x-2 p-2 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 opacity-0 group-hover/card:opacity-100 transition-all duration-200 translate-y-2 group-hover/card:translate-y-0 z-10">
          <p className="text-[10px] sm:text-xs font-bold text-white truncate leading-tight">
            {profile.name}
          </p>
          <p className="text-[9px] text-[#16a34a] font-medium truncate mt-0.5">
            {profile.handle}
          </p>
        </div>

        {/* Live NFC Status Indicator Dot */}
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#16a34a] ring-2 ring-black/80 shadow-xs z-10" />
      </div>
    );
  };

  let containerBaseClass = "relative w-full h-[320px] sm:h-[390px] md:h-[450px] overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-950 border border-neutral-800 shadow-inner group/motion";
  
  if (isFullscreen) {
    containerBaseClass = "absolute inset-0 w-full h-full overflow-hidden bg-[#0A0B0E] group/motion select-none";
  } else if (isHero) {
    containerBaseClass = "relative w-full max-w-[480px] sm:max-w-[520px] lg:max-w-[480px] h-[480px] sm:h-[530px] md:h-[560px] mx-auto overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-800/80 shadow-2xl group/motion";
  }

  return (
    <div 
      className={`${containerBaseClass} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <style>{`
        @keyframes nfcDriftUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes nfcDriftDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-nfc-col-up-1 {
          animation: nfcDriftUp 34s linear infinite;
        }
        .animate-nfc-col-down-2 {
          animation: nfcDriftDown 28s linear infinite;
        }
        .animate-nfc-col-up-3 {
          animation: nfcDriftUp 32s linear infinite;
        }
        .animate-nfc-col-down-4 {
          animation: nfcDriftDown 30s linear infinite;
        }
        .animate-nfc-col-up-5 {
          animation: nfcDriftUp 36s linear infinite;
        }
        .animate-nfc-col-down-6 {
          animation: nfcDriftDown 27s linear infinite;
        }
        .animate-nfc-col-up-7 {
          animation: nfcDriftUp 33s linear infinite;
        }
        .animate-nfc-col-down-8 {
          animation: nfcDriftDown 29s linear infinite;
        }
        .motion-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Tilted / Rotated Perspective Stage (Matching Reference Video) */}
      <div className={`absolute flex items-center justify-center pointer-events-auto ${
        isFullscreen 
          ? "-inset-x-32 -inset-y-48 sm:-inset-x-48 sm:-inset-y-64"
          : "-inset-x-16 -inset-y-36 sm:-inset-x-24 sm:-inset-y-44"
      }`}>
        <div 
          className={`flex gap-3 sm:gap-4 md:gap-5 transform -rotate-12 transition-transform duration-700 ease-out origin-center ${
            isFullscreen
              ? "scale-[1.12] sm:scale-[1.18] lg:scale-[1.25]"
              : "scale-[1.06] sm:scale-110 md:scale-[1.18]"
          }`}
        >
          {/* Column 1: Up */}
          <div 
            className={`flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-up-1 ${isPaused ? 'motion-paused' : ''}`}
          >
            {[...COL_1, ...COL_1].map((p, i) => renderCard(p, `c1-${i}`))}
          </div>

          {/* Column 2: Down */}
          <div 
            className={`flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-down-2 ${isPaused ? 'motion-paused' : ''}`}
          >
            {[...COL_2, ...COL_2].map((p, i) => renderCard(p, `c2-${i}`))}
          </div>

          {/* Column 3: Up */}
          <div 
            className={`flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-up-3 ${isPaused ? 'motion-paused' : ''}`}
          >
            {[...COL_3, ...COL_3].map((p, i) => renderCard(p, `c3-${i}`))}
          </div>

          {/* Column 4: Down */}
          <div 
            className={`flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-down-4 ${isPaused ? 'motion-paused' : ''}`}
          >
            {[...COL_4, ...COL_4].map((p, i) => renderCard(p, `c4-${i}`))}
          </div>

          {/* Extra Columns for Full Screen Mode */}
          {isFullscreen && (
            <>
              {/* Column 5: Up */}
              <div 
                className={`flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-up-5 ${isPaused ? 'motion-paused' : ''}`}
              >
                {[...COL_5, ...COL_5].map((p, i) => renderCard(p, `c5-${i}`))}
              </div>

              {/* Column 6: Down */}
              <div 
                className={`hidden sm:flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-down-6 ${isPaused ? 'motion-paused' : ''}`}
              >
                {[...COL_6, ...COL_6].map((p, i) => renderCard(p, `c6-${i}`))}
              </div>

              {/* Column 7: Up */}
              <div 
                className={`hidden md:flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-up-7 ${isPaused ? 'motion-paused' : ''}`}
              >
                {[...COL_7, ...COL_7].map((p, i) => renderCard(p, `c7-${i}`))}
              </div>

              {/* Column 8: Down */}
              <div 
                className={`hidden lg:flex flex-col gap-3 sm:gap-4 shrink-0 will-change-transform animate-nfc-col-down-8 ${isPaused ? 'motion-paused' : ''}`}
              >
                {[...COL_8, ...COL_8].map((p, i) => renderCard(p, `c8-${i}`))}
              </div>
            </>
          )}

          {!isFullscreen && (
            <div 
              className={`hidden sm:flex flex-col gap-3 sm:gap-4.5 shrink-0 will-change-transform animate-nfc-col-down-4 ${isPaused ? 'motion-paused' : ''}`}
            >
              {[...COL_4, ...COL_4].map((p, i) => renderCard(p, `c4b-${i}`))}
            </div>
          )}
        </div>
      </div>

      {/* Cinematic Edge Fade Gradients (Top & Bottom Vignettes) */}
      {!isFullscreen && (
        <>
          <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-neutral-950 via-neutral-950/70 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-neutral-950/90 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-neutral-950/90 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Floating HUD Badge Top: Shows on bento or hero (when showHud is true) */}
      {showHud && !isFullscreen && (
        <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16a34a]"></span>
          </span>
          <span className="text-[11px] font-mono font-semibold tracking-tight text-neutral-200">
            {isHero ? 'Live Contactless Profiles' : 'Sub-10ms Tap Matrix'}
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-emerald-400 font-bold">
            {isHero ? '25,000+ Taps' : activeChipType === 'metal' ? 'NTAG216 Shielded' : 'NTAG216 High-Flex'}
          </span>
        </div>
      )}

      {/* Floating HUD Badge Top-Right: Interaction Indicator */}
      {showHud && !isHero && !isFullscreen && (
        <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-neutral-300 text-[10px] font-mono pointer-events-none">
          <Sparkles className="w-3 h-3 text-[#16a34a]" />
          <span className="hidden xs:inline">Hover to Pause • Click to Inspect</span>
          <span className="xs:hidden">Live Taps</span>
        </div>
      )}

      {/* Floating Bottom Bar: Only for bento mode when not overlaid by hero children */}
      {!isHero && !isFullscreen && (
        <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 z-20 flex items-center justify-between px-3.5 py-2 rounded-xl sm:rounded-2xl bg-neutral-900/85 backdrop-blur-md border border-white/10 text-white shadow-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0" />
            <span className="text-[11px] sm:text-xs font-medium text-neutral-300 truncate">
              {activeChipType === 'metal' ? 'Shielded Ceramic Antenna • 100% Signal' : 'High-Flex PVC Coil • Universal Range'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#16a34a] font-bold text-[10px] sm:text-xs">
              {activeChipType === 'metal' ? 'Zero Battery' : '100% Waterproof'}
            </span>
          </div>
        </div>
      )}

      {/* Injected Children */}
      {children && (
        <div className="absolute inset-0 z-20 pointer-events-none [&>*]:pointer-events-auto">
          {children}
        </div>
      )}

      {/* Interactive Card Inspection Modal */}
      {selectedProfile && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setSelectedProfile(null)}
        >
          <div 
            className="relative w-full max-w-sm rounded-2xl sm:rounded-3xl bg-neutral-900 border border-white/15 p-5 shadow-2xl flex flex-col items-center text-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Image Preview */}
            <div className="w-32 aspect-[9/18] rounded-2xl overflow-hidden border border-white/20 shadow-lg">
              <img
                src={selectedProfile.image}
                alt={selectedProfile.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#16a34a]/20 text-[#16a34a] text-[10px] font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3 h-3" /> {selectedProfile.category}
              </div>
              <h4 className="text-base font-extrabold text-white">
                {selectedProfile.name}
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                {selectedProfile.role}
              </p>
              <p className="text-xs font-mono text-[#16a34a] mt-1">
                {selectedProfile.handle}
              </p>
            </div>

            <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>NFC Response: &lt;10ms</span>
              <span className="text-emerald-400">Zero App Needed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
