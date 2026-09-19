import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card3DRotator, CardMaterial } from './Card3DRotator';
import { CardCustomizationData } from './CardCustomizerModal';
import {
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ArrowRight,
  Wifi,
  Shield,
  Layers,
  Eye,
  Sliders,
  Check,
} from 'lucide-react';

interface AerospaceCardCustomizerProps {
  onProceedToCheckout: (data: CardCustomizationData) => void;
  className?: string;
  defaultName?: string;
  defaultTitle?: string;
  defaultHandle?: string;
}

interface CardColumnState {
  frontArt: string | null;
  frontFileName: string | null;
  backArt: string | null;
  backFileName: string | null;
  name: string;
  title: string;
  handle: string;
  isFlipped: boolean;
  showLaserText: boolean;
}

export const AerospaceCardCustomizer: React.FC<AerospaceCardCustomizerProps> = ({
  onProceedToCheckout,
  className = '',
  defaultName = 'Victor Dennis',
  defaultTitle = 'Managing Partner & Founder',
  defaultHandle = 'victor',
}) => {
  // Mobile / Viewport active column tab
  const [activeMobileTab, setActiveMobileTab] = useState<'white' | 'black'>('white');

  // State for Column 1: Glacier White Card (₦30,000)
  const [whiteCard, setWhiteCard] = useState<CardColumnState>({
    frontArt: null,
    frontFileName: null,
    backArt: null,
    backFileName: null,
    name: defaultName,
    title: defaultTitle,
    handle: defaultHandle,
    isFlipped: false,
    showLaserText: true,
  });

  // State for Column 2: Obsidian Black Card (₦35,000)
  const [blackCard, setBlackCard] = useState<CardColumnState>({
    frontArt: null,
    frontFileName: null,
    backArt: null,
    backFileName: null,
    name: defaultName,
    title: defaultTitle,
    handle: defaultHandle,
    isFlipped: false,
    showLaserText: true,
  });

  // Shared Customer Checkout inputs (for frictionless 1-click proceed)
  const [customerName, setCustomerName] = useState('Victor Dennis');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Hidden file input refs
  const whiteFrontInputRef = useRef<HTMLInputElement>(null);
  const whiteBackInputRef = useRef<HTMLInputElement>(null);
  const blackFrontInputRef = useRef<HTMLInputElement>(null);
  const blackBackInputRef = useRef<HTMLInputElement>(null);

  // File upload processing logic with validation
  const handleFileUpload = (
    color: 'white' | 'black',
    side: 'front' | 'back',
    file: File
  ) => {
    setInputError(null);

    // Validate mime type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setInputError('Please upload a valid image file (PNG, JPG, SVG, or WEBP).');
      return;
    }

    // Validate size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      setInputError('File size exceeds 12MB limit. Please upload an optimized file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      if (color === 'white') {
        setWhiteCard((prev) => ({
          ...prev,
          ...(side === 'front'
            ? { frontArt: dataUrl, frontFileName: file.name, isFlipped: false }
            : { backArt: dataUrl, backFileName: file.name, isFlipped: true }),
        }));
      } else {
        setBlackCard((prev) => ({
          ...prev,
          ...(side === 'front'
            ? { frontArt: dataUrl, frontFileName: file.name, isFlipped: false }
            : { backArt: dataUrl, backFileName: file.name, isFlipped: true }),
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file selection
  const triggerUpload = (color: 'white' | 'black', side: 'front' | 'back') => {
    if (color === 'white') {
      if (side === 'front') whiteFrontInputRef.current?.click();
      else whiteBackInputRef.current?.click();
    } else {
      if (side === 'front') blackFrontInputRef.current?.click();
      else blackBackInputRef.current?.click();
    }
  };

  // Remove uploaded artwork
  const removeArtwork = (color: 'white' | 'black', side: 'front' | 'back') => {
    if (color === 'white') {
      setWhiteCard((prev) => ({
        ...prev,
        ...(side === 'front'
          ? { frontArt: null, frontFileName: null }
          : { backArt: null, backFileName: null }),
      }));
    } else {
      setBlackCard((prev) => ({
        ...prev,
        ...(side === 'front'
          ? { frontArt: null, frontFileName: null }
          : { backArt: null, backFileName: null }),
      }));
    }
  };

  // Bundling ordering payload logic for Paystack checkout
  const handleOrderCard = (color: 'white' | 'black') => {
    const cardState = color === 'white' ? whiteCard : blackCard;

    // Default email/phone fallbacks if empty to avoid checkout halt
    const activeEmail = customerEmail.trim() || 'customer@chipng.com';
    const activePhone = customerPhone.trim() || '08000000000';
    const activeCustomerName = customerName.trim() || cardState.name || 'Executive Cardholder';

    const orderPayload: CardCustomizationData = {
      tier: 'plastic',
      material: color === 'white' ? 'plastic_white' : 'plastic_black',
      name: cardState.name || 'Victor Dennis',
      title: cardState.title || 'Managing Director',
      company: 'CHIP Hardware Member',
      handle: cardState.handle || 'member',
      customerName: activeCustomerName,
      email: activeEmail,
      whatsapp: activePhone,
      appliedDiscount: true, // Auto apply 10% coupon
      orderBumps: {
        laserEngraving: false,
        lifetimeAnalytics: false,
      },
      // Core additions for Aerospace Custom Cards
      customArtworkFront: cardState.frontArt,
      customArtworkBack: cardState.backArt,
      artworkColor: color,
      hasEmvChip: false,
      hardwareType: 'Aerospace NFC Smart Card (No EMV Chip)',
      productCategory: 'AEROSPACE PHYSICAL CARD',
    };

    onProceedToCheckout(orderPayload);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Hidden file inputs for Column 1 (White) */}
      <input
        ref={whiteFrontInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload('white', 'front', file);
          e.target.value = '';
        }}
      />
      <input
        ref={whiteBackInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload('white', 'back', file);
          e.target.value = '';
        }}
      />

      {/* Hidden file inputs for Column 2 (Black) */}
      <input
        ref={blackFrontInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload('black', 'front', file);
          e.target.value = '';
        }}
      />
      <input
        ref={blackBackInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload('black', 'back', file);
          e.target.value = '';
        }}
      />

      {/* ================= STAGE HEADER & HARDWARE DISTINCTION ================= */}
      <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#B600A8]/20 via-purple-500/10 to-[#7621B0]/20 border border-[#B600A8]/40 text-[#E395F7] text-xs font-mono uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Engine 1 • Step 6 Live Studio</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white leading-tight">
          AEROSPACE PHYSICAL CARD
        </h2>

        <p className="mt-3 text-sm sm:text-base text-white/70 max-w-2xl mx-auto">
          Interactive Dual-Column Customization Engine. Upload your high-resolution custom artwork for both front & back with live real-time 3D simulation.
        </p>

        {/* CRITICAL HARDWARE DISTINCTION BANNER */}
        <div className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-black to-purple-950/40 border border-emerald-500/30 text-left shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Wifi className="w-4 h-4 rotate-90" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Critical Hardware Specification
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Pure Contactless NFC • No EMV Chip
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                These cards are high-speed contactless smart networking cards embedded with an internal NTAG216 copper antenna coil. They feature a <strong className="text-white">100% flush, seamless surface without EMV contact banking chip cutouts</strong>, giving you an immaculate edge-to-edge canvas for custom branding and instant 0.2s vCard synchronization.
              </p>
            </div>
          </div>
        </div>

        {/* Error notification banner if any upload error */}
        {inputError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden items-center justify-center p-1.5 mb-8 rounded-2xl bg-white/5 border border-white/10 max-w-xs mx-auto">
        <button
          onClick={() => setActiveMobileTab('white')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeMobileTab === 'white'
              ? 'bg-white text-black shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          White Edition (₦30k)
        </button>
        <button
          onClick={() => setActiveMobileTab('black')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeMobileTab === 'black'
              ? 'bg-[#B600A8] text-white shadow-md'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Black Edition (₦35k)
        </button>
      </div>

      {/* ================= DUAL-COLUMN CUSTOMIZATION MODULE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">

        {/* ------------------------------------------------------------- */}
        {/* COLUMN 1: WHITE CUSTOM NFC PLASTIC CARD (₦30,000)             */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent border border-white/15 backdrop-blur-xl flex flex-col justify-between transition-all relative overflow-hidden shadow-2xl ${
            activeMobileTab === 'black' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Ambient subtle light glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-300/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div>
            {/* Header / Pricing Badge */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white border border-slate-300 shadow-sm" />
                <span className="text-xs font-mono uppercase tracking-wider text-white/80 font-bold">
                  Glacier Pearl Edition
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 border border-emerald-400/20 font-bold">
                Save 33% (10% Coupon Applied)
              </span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  White Custom NFC Plastic Card
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  High-density glacier white matte PVC with internal NTAG216 chip.
                </p>
              </div>
              <div className="flex items-baseline gap-2 mt-2 sm:mt-0">
                <span className="text-3xl font-black text-white">₦30,000</span>
                <span className="text-xs text-white/40 line-through">₦45,000</span>
              </div>
            </div>

            {/* Hardware badge callout */}
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>100% Flush Surface • Internal Contactless NFC • Zero EMV Cutout</span>
            </div>

            {/* 3D LIVE PREVIEW CONTAINER */}
            <div className="my-6 p-4 sm:p-6 rounded-2xl bg-black/60 border border-white/10 shadow-inner flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/60 mb-3 px-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interactive 3D Engine: {whiteCard.isFlipped ? 'Back Face' : 'Front Face'}</span>
                </span>
                <span className="text-white/40">Move cursor to tilt 3D</span>
              </div>

              {/* 3D Rotator Component */}
              <Card3DRotator
                material="plastic_white"
                customName={whiteCard.name}
                customTitle={whiteCard.title}
                customCompany="CHIP Executive"
                qrUrl={`https://chipng.com/@${whiteCard.handle}`}
                isFlipped={whiteCard.isFlipped}
                onFlipToggle={() => setWhiteCard((p) => ({ ...p, isFlipped: !p.isFlipped }))}
                customArtworkFront={whiteCard.frontArt}
                customArtworkBack={whiteCard.backArt}
                hideEmvChip={true}
                showLaserText={whiteCard.showLaserText}
                cardCategoryLabel="AEROSPACE WHITE"
                className="w-full"
              />

              {/* Face Switcher Controls */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setWhiteCard((p) => ({ ...p, isFlipped: false }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    !whiteCard.isFlipped
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Inspect Front
                </button>
                <button
                  type="button"
                  onClick={() => setWhiteCard((p) => ({ ...p, isFlipped: true }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    whiteCard.isFlipped
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Inspect Back
                </button>
                <button
                  type="button"
                  onClick={() => setWhiteCard((p) => ({ ...p, isFlipped: !p.isFlipped }))}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                  title="Flip 180°"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ARTWORK UPLOAD ACTION BUTTONS (FRONT & BACK) */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs font-mono text-white/80">
                <span className="uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#B600A8]" />
                  <span>Custom Artwork Ingestion</span>
                </span>
                <span className="text-white/40 text-[10px]">1050 × 600 px • 300 DPI</span>
              </div>

              {/* Front Art Upload Box */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Front Face Artwork</span>
                  </span>
                  {whiteCard.frontArt ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Loaded</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white/40">Optional Upload</span>
                  )}
                </div>

                {whiteCard.frontArt ? (
                  <div className="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={whiteCard.frontArt}
                        alt="Front Thumbnail"
                        className="w-12 h-7 object-cover rounded border border-white/20 shrink-0"
                      />
                      <span className="text-xs text-white truncate">{whiteCard.frontFileName || 'Custom_Front_Art.png'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => triggerUpload('white', 'front')}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white font-mono"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArtwork('white', 'front')}
                        className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        title="Remove Art"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpload('white', 'front')}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-400/60 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Upload Custom Art (Front)</span>
                  </button>
                )}
              </div>

              {/* Back Art Upload Box */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Back Face Artwork</span>
                  </span>
                  {whiteCard.backArt ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Loaded</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white/40">Optional Upload</span>
                  )}
                </div>

                {whiteCard.backArt ? (
                  <div className="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={whiteCard.backArt}
                        alt="Back Thumbnail"
                        className="w-12 h-7 object-cover rounded border border-white/20 shrink-0"
                      />
                      <span className="text-xs text-white truncate">{whiteCard.backFileName || 'Custom_Back_Art.png'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => triggerUpload('white', 'back')}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white font-mono"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArtwork('white', 'back')}
                        className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        title="Remove Art"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpload('white', 'back')}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-400/60 bg-white/[0.02] hover:bg-white/[0.05] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Upload Custom Art (Back)</span>
                  </button>
                )}
              </div>

              {/* Optional Text Overlay Switcher */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-white/80">Display Laser Text on Card</span>
                <button
                  type="button"
                  onClick={() => setWhiteCard((p) => ({ ...p, showLaserText: !p.showLaserText }))}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                    whiteCard.showLaserText
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {whiteCard.showLaserText ? 'Visible' : 'Hidden (Pure Art)'}
                </button>
              </div>

              {/* Quick Cardholder Info inputs */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  value={whiteCard.name}
                  onChange={(e) => setWhiteCard((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Cardholder Name"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  value={whiteCard.title}
                  onChange={(e) => setWhiteCard((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Job Title"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          {/* ORDER ACTION BUTTON (WHITE) */}
          <div className="mt-8 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleOrderCard('white')}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-900 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-slate-950/40"
            >
              <Lock className="w-4 h-4 text-slate-800" />
              <span>Order Custom White Card • ₦30,000</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
            <p className="text-center text-[10px] text-white/50 mt-2 font-mono">
              Fast 24-48h Lagos Dispatch • Nationwide Insured Delivery
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COLUMN 2: BLACK CUSTOM NFC PLASTIC CARD (₦35,000)             */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1C1525] via-[#100D15] to-black border-2 border-[#B600A8]/60 backdrop-blur-xl flex flex-col justify-between transition-all relative overflow-hidden shadow-[0_0_50px_rgba(182,0,168,0.25)] ${
            activeMobileTab === 'white' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Bestseller Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#B600A8] to-purple-600 text-white px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
            ★ Executive Stealth Bestseller
          </div>

          {/* Ambient purple glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div>
            {/* Header / Pricing Badge */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/10 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-black border border-white/40 shadow-sm" />
                <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">
                  Obsidian Stealth Edition
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#B600A8]/20 text-white border border-[#B600A8]/40 font-bold">
                Save 30% (10% Coupon Applied)
              </span>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Black Custom NFC Plastic Card
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  Deep matte obsidian PVC with scratch-resistant oleophobic coating.
                </p>
              </div>
              <div className="flex items-baseline gap-2 mt-2 sm:mt-0">
                <span className="text-3xl font-black text-white">₦35,000</span>
                <span className="text-xs text-white/40 line-through">₦50,000</span>
              </div>
            </div>

            {/* Hardware badge callout */}
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>100% Flush Surface • Internal Contactless NFC • Zero EMV Cutout</span>
            </div>

            {/* 3D LIVE PREVIEW CONTAINER */}
            <div className="my-6 p-4 sm:p-6 rounded-2xl bg-black/80 border border-white/10 shadow-inner flex flex-col items-center">
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/60 mb-3 px-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Interactive 3D Engine: {blackCard.isFlipped ? 'Back Face' : 'Front Face'}</span>
                </span>
                <span className="text-white/40">Move cursor to tilt 3D</span>
              </div>

              {/* 3D Rotator Component */}
              <Card3DRotator
                material="plastic_black"
                customName={blackCard.name}
                customTitle={blackCard.title}
                customCompany="CHIP Executive"
                qrUrl={`https://chipng.com/@${blackCard.handle}`}
                isFlipped={blackCard.isFlipped}
                onFlipToggle={() => setBlackCard((p) => ({ ...p, isFlipped: !p.isFlipped }))}
                customArtworkFront={blackCard.frontArt}
                customArtworkBack={blackCard.backArt}
                hideEmvChip={true}
                showLaserText={blackCard.showLaserText}
                cardCategoryLabel="AEROSPACE BLACK"
                className="w-full"
              />

              {/* Face Switcher Controls */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setBlackCard((p) => ({ ...p, isFlipped: false }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    !blackCard.isFlipped
                      ? 'bg-[#B600A8] text-white font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Inspect Front
                </button>
                <button
                  type="button"
                  onClick={() => setBlackCard((p) => ({ ...p, isFlipped: true }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                    blackCard.isFlipped
                      ? 'bg-[#B600A8] text-white font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                  }`}
                >
                  Inspect Back
                </button>
                <button
                  type="button"
                  onClick={() => setBlackCard((p) => ({ ...p, isFlipped: !p.isFlipped }))}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
                  title="Flip 180°"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ARTWORK UPLOAD ACTION BUTTONS (FRONT & BACK) */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs font-mono text-white/80">
                <span className="uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#B600A8]" />
                  <span>Custom Artwork Ingestion</span>
                </span>
                <span className="text-white/40 text-[10px]">1050 × 600 px • 300 DPI</span>
              </div>

              {/* Front Art Upload Box */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Front Face Artwork</span>
                  </span>
                  {blackCard.frontArt ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Loaded</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white/40">Optional Upload</span>
                  )}
                </div>

                {blackCard.frontArt ? (
                  <div className="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={blackCard.frontArt}
                        alt="Front Thumbnail"
                        className="w-12 h-7 object-cover rounded border border-white/20 shrink-0"
                      />
                      <span className="text-xs text-white truncate">{blackCard.frontFileName || 'Custom_Front_Art.png'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => triggerUpload('black', 'front')}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white font-mono"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArtwork('black', 'front')}
                        className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        title="Remove Art"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpload('black', 'front')}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-purple-500/30 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Upload Custom Art (Front)</span>
                  </button>
                )}
              </div>

              {/* Back Art Upload Box */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Back Face Artwork</span>
                  </span>
                  {blackCard.backArt ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Loaded</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-white/40">Optional Upload</span>
                  )}
                </div>

                {blackCard.backArt ? (
                  <div className="flex items-center justify-between gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2.5 truncate">
                      <img
                        src={blackCard.backArt}
                        alt="Back Thumbnail"
                        className="w-12 h-7 object-cover rounded border border-white/20 shrink-0"
                      />
                      <span className="text-xs text-white truncate">{blackCard.backFileName || 'Custom_Back_Art.png'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => triggerUpload('black', 'back')}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-white font-mono"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => removeArtwork('black', 'back')}
                        className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300"
                        title="Remove Art"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerUpload('black', 'back')}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-purple-500/30 hover:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>Upload Custom Art (Back)</span>
                  </button>
                )}
              </div>

              {/* Optional Text Overlay Switcher */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-white/80">Display Laser Text on Card</span>
                <button
                  type="button"
                  onClick={() => setBlackCard((p) => ({ ...p, showLaserText: !p.showLaserText }))}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                    blackCard.showLaserText
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {blackCard.showLaserText ? 'Visible' : 'Hidden (Pure Art)'}
                </button>
              </div>

              {/* Quick Cardholder Info inputs */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  value={blackCard.name}
                  onChange={(e) => setBlackCard((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Cardholder Name"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  value={blackCard.title}
                  onChange={(e) => setBlackCard((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Job Title"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          {/* ORDER ACTION BUTTON (BLACK) */}
          <div className="mt-8 pt-5 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleOrderCard('black')}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#B600A8] via-purple-600 to-[#7621B0] text-white hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-950/60"
            >
              <Lock className="w-4 h-4 text-purple-200" />
              <span>Order Custom Black Card • ₦35,000</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
            <p className="text-center text-[10px] text-white/50 mt-2 font-mono">
              Fast 24-48h Lagos Dispatch • Nationwide Insured Delivery
            </p>
          </div>
        </div>

      </div>

      {/* ================= REASSURANCE & CRO TRUST SIGNALS ================= */}
      <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {[
          { label: '0.2s Contactless Tap', sub: 'iPhone & Android native' },
          { label: 'Embedded NTAG216', sub: 'High-frequency chip' },
          { label: 'Lifetime Cloud Bio', sub: 'Zero monthly fees' },
          { label: 'Official Lagos Craft', sub: 'DHL / GIG Logistics' },
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <p className="text-xs font-bold text-white">{item.label}</p>
            <p className="text-[10px] font-mono text-white/50 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
