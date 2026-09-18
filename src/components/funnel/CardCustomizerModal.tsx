import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card3DRotator, CardMaterial } from './Card3DRotator';
import { Sparkles, CheckCircle2, Shield, ArrowRight, ArrowLeft, Tag, Lock, HelpCircle } from 'lucide-react';

export interface CardCustomizationData {
  tier: 'plastic' | 'metal' | 'debit';
  material: CardMaterial;
  name: string;
  title: string;
  company: string;
  handle: string;
  customerName: string;
  email: string;
  whatsapp: string;
  appliedDiscount: boolean;
  orderBumps: {
    laserEngraving: boolean; // +5,000
    lifetimeAnalytics: boolean; // +10,000
  };
}

interface CardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: 'plastic' | 'metal' | 'debit';
  onProceedToCheckout: (data: CardCustomizationData) => void;
}

export const CardCustomizerModal: React.FC<CardCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialTier = 'metal',
  onProceedToCheckout,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [tier, setTier] = useState<'plastic' | 'metal' | 'debit'>(initialTier);
  const [material, setMaterial] = useState<CardMaterial>(
    initialTier === 'plastic' ? 'plastic_black' : initialTier === 'debit' ? 'metal_gold' : 'metal_spacegray'
  );

  const [cardName, setCardName] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardCompany, setCardCompany] = useState('');
  const [handle, setHandle] = useState('');

  // Lead capture fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [discountUnlocked, setDiscountUnlocked] = useState(false);

  // Order Bumps
  const [bumpLaser, setBumpLaser] = useState(false);
  const [bumpAnalytics, setBumpAnalytics] = useState(false);

  if (!isOpen) return null;

  // Handle tier selection and default matching material
  const handleTierSelect = (selectedTier: 'plastic' | 'metal' | 'debit') => {
    setTier(selectedTier);
    if (selectedTier === 'plastic') {
      setMaterial('plastic_black');
    } else if (selectedTier === 'metal') {
      setMaterial('metal_spacegray');
    } else {
      setMaterial('metal_gold');
    }
  };

  // Base price in NGN
  const getBasePrice = () => {
    switch (tier) {
      case 'plastic': return 30000;
      case 'debit': return 100000;
      case 'metal':
      default: return 50000;
    }
  };

  // Handle lead submission & discount claim
  const handleClaimDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !whatsapp) return;

    setIsSubmittingLead(true);
    setDiscountUnlocked(true);

    const customizationData: CardCustomizationData = {
      tier,
      material,
      name: cardName || fullName || 'Victor Dennis',
      title: cardTitle || 'Founder & CEO',
      company: cardCompany || 'Company Name',
      handle: handle || (cardName ? cardName.toLowerCase().replace(/\s+/g, '') : 'myname'),
      customerName: fullName || cardName,
      email,
      whatsapp,
      appliedDiscount: true,
      orderBumps: {
        laserEngraving: bumpLaser,
        lifetimeAnalytics: bumpAnalytics,
      },
    };

    try {
      await fetch('/api/funnel/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName || cardName,
          email,
          whatsapp,
          card_type: tier,
          custom_name: cardName,
          custom_title: cardTitle,
          funnel_stage: 'customization_saved',
          order_bumps: [
            bumpLaser ? 'laser_engraving' : null,
            bumpAnalytics ? 'lifetime_analytics' : null,
          ].filter(Boolean),
          estimated_amount: getBasePrice(),
        }),
      });
    } catch (err) {
      console.warn('Lead capture background sync error:', err);
    } finally {
      setIsSubmittingLead(false);
      onProceedToCheckout(customizationData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#12141A] border border-white/15 rounded-3xl p-5 sm:p-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto relative shadow-2xl no-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20"
        >
          ✕
        </button>

        {/* Funnel Progress Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 pr-12">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B600A8] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-display font-black text-white">
              CHIP Customization Studio
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <span className={`px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-[#B600A8] text-white font-bold' : 'bg-white/5'}`}>
              1. Material
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-[#B600A8] text-white font-bold' : 'bg-white/5'}`}>
              2. Engraving
            </span>
            <span>→</span>
            <span className={`px-2.5 py-1 rounded-full ${step >= 3 ? 'bg-[#B600A8] text-white font-bold' : 'bg-white/5'}`}>
              3. Reserve (10% Off)
            </span>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Live 3D Preview (Synced with form inputs) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/40 rounded-2xl p-4 border border-white/5">
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider mb-2">
              Live Interactive 3D Render
            </span>
            
            <Card3DRotator
              material={material}
              customName={cardName || 'Your Name Here'}
              customTitle={cardTitle || 'Managing Partner'}
              customCompany={cardCompany || 'CHIP Card'}
              qrUrl={`https://chipng.com/@${handle || 'you'}`}
              className="w-full"
            />

            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 w-full text-center">
              <span className="text-xs text-white/70 block">
                Selected Tier: <strong className="text-white uppercase">{tier}</strong>
              </span>
              <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#B600A8] to-purple-400">
                ₦{getBasePrice().toLocaleString()}
              </span>
              {discountUnlocked && (
                <span className="text-xs text-emerald-400 block mt-0.5">
                  ✓ 10% VIP Coupon Activated (-₦{(getBasePrice() * 0.1).toLocaleString()})
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Multi-Step Interactive Form */}
          <div className="lg:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              {/* STEP 1: TIER & MATERIAL */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Select Hardware Tier</h3>
                    <p className="text-xs text-white/60">Choose the foundation for your physical NFC card.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'plastic', label: 'Smart Plastic', price: '₦30,000', badge: 'Entry' },
                      { id: 'metal', label: 'Smart Metal', price: '₦50,000', badge: 'Bestseller (28g)' },
                      { id: 'debit', label: 'Metal Debit Convert', price: '₦100,000', badge: 'Dual-Chip Luxe' },
                    ].map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleTierSelect(t.id as any)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          tier === t.id
                            ? 'border-[#B600A8] bg-[#B600A8]/15 shadow-lg shadow-purple-950/40'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                            {t.badge}
                          </span>
                          {tier === t.id && <CheckCircle2 className="w-4 h-4 text-[#B600A8]" />}
                        </div>
                        <h4 className="font-bold text-sm text-white mt-2 leading-tight">{t.label}</h4>
                        <p className="text-xs font-semibold text-white/80 mt-1">{t.price}</p>
                      </div>
                    ))}
                  </div>

                  {/* Material Finishes */}
                  <div className="mt-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider block mb-2">
                      Choose Finish & Tone
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'metal_spacegray', label: 'Space Gray Steel', desc: 'Titanium matte' },
                        { id: 'metal_gold', label: '24K Matte Gold', desc: 'Brushed brass' },
                        { id: 'plastic_black', label: 'Obsidian Black', desc: 'Matte PVC' },
                        { id: 'plastic_white', label: 'Glacier White', desc: 'Pearl PVC' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMaterial(m.id as CardMaterial)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            material === m.id
                              ? 'border-[#B600A8] bg-white/10 text-white'
                              : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block truncate">{m.label}</span>
                          <span className="text-[10px] opacity-60 block truncate">{m.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/30"
                  >
                    <span>Proceed to Laser Engraving Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: ENGRAVING & BIO PREVIEW */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Laser Engraving Layout</h3>
                      <p className="text-xs text-white/60">This will be physically laser-etched onto your card.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                      Full Name for Card
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Victor Dennis"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                        Professional Title / Headline
                      </label>
                      <input
                        type="text"
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        placeholder="e.g. Managing Director"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                        Company / Brand
                      </label>
                      <input
                        type="text"
                        value={cardCompany}
                        onChange={(e) => setCardCompany(e.target.value)}
                        placeholder="e.g. Apex Ventures"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                      Desired CHIP Username
                    </label>
                    <div className="flex items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden px-3">
                      <span className="text-xs font-mono text-white/40">chipng.com/@</span>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="yourhandle"
                        className="w-full py-2.5 px-1 bg-transparent text-white focus:outline-none text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!fullName && cardName) setFullName(cardName);
                      setStep(3);
                    }}
                    className="mt-2 w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/30"
                  >
                    <span>Lock Custom Design & Claim 10% Discount</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 3: LEAD CAPTURE & 10% DISCOUNT INCENTIVE */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-1 border border-amber-500/30">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Instant 10% Reservation Discount</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Reserve Your Custom Engraving</h3>
                      <p className="text-xs text-white/60">
                        Save your custom card build so it won't be lost. Unlocks 10% off your checkout today.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs text-white/50 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                  </div>

                  <form onSubmit={handleClaimDiscount} className="flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                          WhatsApp Phone Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+234 810 000 0000"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/70 uppercase mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@company.com"
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    {/* Order Bumps Preview */}
                    <div className="mt-2 pt-3 border-t border-white/10">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2">
                        Recommended Order Bumps (Optional)
                      </span>

                      <div className="flex flex-col gap-2">
                        {/* Bump 1: Laser Engraving */}
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bumpLaser}
                            onChange={(e) => setBumpLaser(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-[#B600A8] focus:ring-[#B600A8] bg-black border-white/20"
                          />
                          <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">
                                Priority Custom Fiber-Laser Engraving
                              </span>
                              <span className="text-xs font-bold text-amber-300">+₦5,000</span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                              High-contrast laser etching for corporate logos & signatures. Cuts queue time for 24h dispatch.
                            </p>
                          </div>
                        </label>

                        {/* Bump 2: Lifetime Analytics */}
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bumpAnalytics}
                            onChange={(e) => setBumpAnalytics(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-[#B600A8] focus:ring-[#B600A8] bg-black border-white/20"
                          />
                          <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">
                                Lifetime Lead Capture & Analytics Suite
                              </span>
                              <span className="text-xs font-bold text-amber-300">+₦10,000</span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                              Capture contact details from anyone who taps your card into exportable CSV + tap geo-analytics.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="mt-3 w-full py-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-[#B600A8] to-purple-600 text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-900/40 active:scale-98 transition-all"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>
                        {isSubmittingLead
                          ? 'Applying 10% VIP Coupon...'
                          : `Claim 10% Discount & Checkout (Save ₦${(getBasePrice() * 0.1).toLocaleString()})`}
                      </span>
                    </button>

                    <p className="text-[11px] text-center text-white/50 flex items-center justify-center gap-1.5 mt-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Zero Spam Guarantee • WhatsApp Concierge support included</span>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
