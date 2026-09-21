import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Wifi, RotateCcw, Sparkles } from 'lucide-react';

export type CardMaterial = 'plastic_black' | 'plastic_white' | 'metal_spacegray' | 'metal_gold';

interface Card3DRotatorProps {
  material: CardMaterial;
  customName?: string;
  customTitle?: string;
  customCompany?: string;
  qrUrl?: string;
  isFlipped?: boolean;
  onFlipToggle?: () => void;
  size?: 'standard' | 'hero';
  isTapping?: boolean;
  className?: string;
}

export const Card3DRotator: React.FC<Card3DRotatorProps> = ({
  material,
  customName = 'Victor Dennis',
  customTitle = 'Managing Partner & Founder',
  customCompany = 'CHIP Technologies',
  qrUrl = 'https://chipng.com/@victor',
  isFlipped: controlledFlipped,
  onFlipToggle,
  size = 'standard',
  isTapping = false,
  className = '',
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;
  const toggleFlip = onFlipToggle || (() => setInternalFlipped(prev => !prev));

  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -16;
    const rY = ((x - centerX) / centerX) * 16;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = Math.max(-18, Math.min(18, ((y - centerY) / centerY) * -18));
    const rY = Math.max(-18, Math.min(18, ((x - centerX) / centerX) * 18));

    setRotateX(rX);
    setRotateY(rY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleTouchEnd = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50 });
  };

  // Material style configurations
  const getMaterialConfig = () => {
    switch (material) {
      case 'plastic_white':
        return {
          solidBg: '#FFFFFF',
          bg: 'bg-white',
          gradientOverlay: 'bg-gradient-to-br from-slate-50 via-white to-slate-100',
          border: 'border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
          textColor: 'text-slate-900',
          subTextColor: 'text-slate-600',
          accentColor: 'text-indigo-600',
          chipColor: 'bg-amber-100 border-amber-300',
          badge: 'Smart Matte PVC',
          sheen: 'from-white/80 via-transparent to-white/40',
          backTextColor: 'text-slate-800',
          backMutedColor: 'text-slate-500',
          backBorderColor: 'border-slate-200',
          magStripe: 'bg-neutral-900 border-neutral-800',
        };
      case 'metal_spacegray':
        return {
          solidBg: '#13161D',
          bg: 'bg-[#13161D]',
          gradientOverlay: 'bg-gradient-to-br from-[#1C2028] via-[#242A35] to-[#12151B]',
          border: 'border-slate-500/40 shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.3)]',
          textColor: 'text-white',
          subTextColor: 'text-slate-300',
          accentColor: 'text-sky-400',
          chipColor: 'bg-gradient-to-br from-amber-400/80 to-amber-600 border-amber-300/60',
          badge: '28g Stainless Steel',
          sheen: 'from-white/25 via-transparent to-white/5',
          backTextColor: 'text-white',
          backMutedColor: 'text-white/60',
          backBorderColor: 'border-white/10',
          magStripe: 'bg-black border-neutral-700/60',
        };
      case 'metal_gold':
        return {
          solidBg: '#261A04',
          bg: 'bg-[#261A04]',
          gradientOverlay: 'bg-gradient-to-br from-[#413009] via-[#86631E] to-[#2D1F03]',
          border: 'border-[#F8E3A1]/50 shadow-[0_25px_60px_rgba(218,165,32,0.25),inset_0_1px_2px_rgba(255,245,210,0.6)]',
          textColor: 'text-[#FFF8E7]',
          subTextColor: 'text-[#E8D4A2]',
          accentColor: 'text-amber-200',
          chipColor: 'bg-gradient-to-br from-amber-300 to-amber-500 border-amber-200',
          badge: '24K Mirror Luxe Finish',
          sheen: 'from-amber-200/40 via-transparent to-amber-100/10',
          backTextColor: 'text-[#FFF8E7]',
          backMutedColor: 'text-[#E8D4A2]/70',
          backBorderColor: 'border-[#F8E3A1]/20',
          magStripe: 'bg-[#181002] border-[#F8E3A1]/30',
        };
      case 'plastic_black':
      default:
        return {
          solidBg: '#0A0B0E',
          bg: 'bg-[#0A0B0E]',
          gradientOverlay: 'bg-gradient-to-br from-[#141517] via-[#1A1C20] to-[#0A0B0D]',
          border: 'border-neutral-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]',
          textColor: 'text-white',
          subTextColor: 'text-neutral-400',
          accentColor: 'text-purple-400',
          chipColor: 'bg-neutral-800 border-neutral-600',
          badge: 'Matte Obsidian PVC',
          sheen: 'from-white/20 via-transparent to-white/5',
          backTextColor: 'text-white',
          backMutedColor: 'text-neutral-400',
          backBorderColor: 'border-neutral-800',
          magStripe: 'bg-black border-neutral-800',
        };
    }
  };

  const config = getMaterialConfig();
  const isHero = size === 'hero';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* 3D Perspective Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleFlip}
        style={{ perspective: 1400 }}
        className={`relative w-full aspect-[1.586] cursor-pointer group touch-none ${
          isHero ? 'max-w-[480px] sm:max-w-[530px] md:max-w-[560px]' : 'max-w-[400px]'
        }`}
      >
        {/* Contactless Radio Waves on Tap Simulation */}
        {isTapping && (
          <div className="absolute -inset-4 sm:-inset-8 pointer-events-none z-40 flex items-center justify-center">
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border-2 border-[#25F4EE] animate-ping opacity-80" />
            <div className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-purple-400 animate-ping opacity-50 [animation-delay:250ms]" />
          </div>
        )}

        <motion.div
          animate={{
            rotateX,
            rotateY: isFlipped ? rotateY + 180 : rotateY,
          }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 24,
          }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative rounded-2xl sm:rounded-3xl transition-shadow duration-300 ring-1 ring-white/10"
        >
          {/* ================= FRONT SIDE ================= */}
          <div
            style={{
              transform: 'translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: config.solidBg,
            }}
            className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl ${
              isHero ? 'p-6 sm:p-8 md:p-9' : 'p-5 md:p-7'
            } flex flex-col justify-between overflow-hidden border ${config.bg} ${config.border} z-20`}
          >
            {/* Solid opaque backdrop fill */}
            <div
              className={`absolute inset-0 z-0 ${config.gradientOverlay}`}
              style={{ backgroundColor: config.solidBg }}
            />

            {/* Specular glare overlay */}
            <div
              className={`absolute inset-0 z-0 bg-gradient-to-tr ${config.sheen} pointer-events-none opacity-80 mix-blend-overlay transition-opacity duration-200`}
              style={{
                transform: `translate(${glarePosition.x - 50}%, ${glarePosition.y - 50}%)`,
              }}
            />

            {/* Micro brushed metal grain texture overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Top Row: Brand & NFC Signal */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`${isHero ? 'w-9 h-9 sm:w-10 sm:h-10' : 'w-8 h-8'} rounded-xl bg-black/40 border border-white/20 flex items-center justify-center shadow-inner`}>
                  <span className={`font-display font-black ${isHero ? 'text-sm sm:text-base' : 'text-sm'} tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-300`}>
                    CHIP
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] sm:text-[11px] tracking-widest font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15 w-fit font-bold">
                    {config.badge}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Wifi className={`${isHero ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-5 h-5'} rotate-90 ${config.accentColor}`} />
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase opacity-80 text-white font-semibold">
                  NFC 2.4GHz
                </span>
              </div>
            </div>

            {/* Middle: Smart Chip Visual (for Metal / High-end cards) */}
            <div className="relative z-10 my-auto flex items-center justify-between">
              <div
                className={`${
                  isHero ? 'w-12 h-10 sm:w-14 sm:h-11' : 'w-11 h-9'
                } rounded-lg border flex flex-col justify-between p-1.5 shadow-md relative overflow-hidden ${config.chipColor}`}
              >
                {/* Microchip Contact Pins Architecture */}
                <div className="flex justify-between h-1.5 border-b border-black/25">
                  <span className="w-1.5 h-full bg-black/15 rounded-sm" />
                  <span className="w-1.5 h-full bg-black/15 rounded-sm" />
                </div>
                <div className="flex justify-between h-1.5 border-b border-black/25">
                  <span className="w-2 h-full bg-black/15 rounded-sm" />
                  <span className="w-2 h-full bg-black/15 rounded-sm" />
                </div>
                <div className="flex justify-between h-1.5">
                  <span className="w-1.5 h-full bg-black/15 rounded-sm" />
                  <span className="w-1.5 h-full bg-black/15 rounded-sm" />
                </div>
              </div>

              {/* Laser Engraving Brand Watermark */}
              <div className="text-right">
                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/50 font-bold">
                  Contactless Sync
                </p>
                <p className="text-xs sm:text-sm font-semibold text-white/90">iOS & Android</p>
              </div>
            </div>

            {/* Bottom Row: Laser Engraved Custom Name & Title */}
            <div className="relative z-10 flex justify-between items-end">
              <div className="max-w-[78%]">
                <h3
                  className={`${
                    isHero ? 'text-xl sm:text-2xl md:text-3xl font-black' : 'text-lg md:text-xl font-bold'
                  } tracking-tight truncate leading-tight ${config.textColor}`}
                >
                  {customName || 'Your Name Here'}
                </h3>
                <p
                  className={`${
                    isHero ? 'text-xs sm:text-sm md:text-base font-semibold mt-0.5' : 'text-xs md:text-sm font-medium'
                  } tracking-wide truncate ${config.subTextColor}`}
                >
                  {customTitle || 'Your Title / Role'}
                </p>
                {customCompany && (
                  <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white/50 mt-1 truncate">
                    {customCompany}
                  </p>
                )}
              </div>

              {/* Tap to Flip badge */}
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono uppercase text-white/50 group-hover:text-white/90 transition-colors bg-black/20 px-2 py-1 rounded-md border border-white/10">
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Flip</span>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE (100% NON-TRANSPARENT OPAQUE) ================= */}
          <div
            style={{
              transform: 'rotateY(180deg) translateZ(1px)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              backgroundColor: config.solidBg,
            }}
            className={`absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl ${
              isHero ? 'p-6 sm:p-8 md:p-9' : 'p-5 md:p-7'
            } flex flex-col justify-between overflow-hidden border ${config.bg} ${config.border} z-20 shadow-2xl`}
          >
            {/* Opaque Solid Base Shield */}
            <div
              className={`absolute inset-0 z-0 ${config.gradientOverlay}`}
              style={{ backgroundColor: config.solidBg }}
            />

            {/* Specular Glare on Back */}
            <div
              className={`absolute inset-0 z-0 bg-gradient-to-tr ${config.sheen} pointer-events-none opacity-50 mix-blend-overlay`}
            />

            {/* Magnetic Stripe representation */}
            <div
              className={`absolute ${isHero ? 'top-6 sm:top-8 h-11 sm:h-12' : 'top-5 h-10'} left-0 w-full border-y z-10 ${config.magStripe}`}
            />

            {/* Top row spacing */}
            <div className={`relative z-20 ${isHero ? 'pt-11 sm:pt-14' : 'pt-10'} flex justify-between items-center text-[10px] sm:text-xs font-mono ${config.backMutedColor}`}>
              <span>SECURITY CHIP #9482-NG</span>
              <span>LIFETIME CLOUD SYNC</span>
            </div>

            {/* Center: Dynamic QR code for older non-NFC phones */}
            <div className="relative z-20 flex items-center justify-between gap-4 my-2">
              <div className="p-2 sm:p-2.5 bg-white rounded-xl shadow-lg shrink-0 border border-black/10">
                <QRCodeSVG
                  value={qrUrl}
                  size={isHero ? 78 : 68}
                  level="M"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              <div className={`flex flex-col text-left pr-2 ${config.backTextColor}`}>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Instant Bio Link
                </span>
                <span className={`text-[11px] sm:text-xs leading-snug mt-0.5 ${config.backMutedColor}`}>
                  Scan with any camera or tap phone back to open your live CHIP profile.
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-indigo-400 mt-1 truncate">
                  {qrUrl.replace('https://', '')}
                </span>
              </div>
            </div>

            {/* Bottom: Signature Strip & Legal */}
            <div className={`relative z-20 flex justify-between items-center border-t ${config.backBorderColor} pt-2 text-[9px] sm:text-[10px] font-mono ${config.backMutedColor}`}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>OFFICIAL CHIP HARDWARE</span>
              </div>
              <span>MADE IN LAGOS, NIGERIA</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Helper Interaction Controls */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleFlip}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors cursor-pointer border border-white/10 hover:border-white/25"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Flip Card (Front / Back)</span>
        </button>
        <span className="text-xs text-white/40 hidden sm:inline">Move cursor to tilt in 3D</span>
        <span className="text-xs text-white/40 sm:hidden">Drag with finger to tilt</span>
      </div>
    </div>
  );
};
