import React, { useState, useEffect } from 'react';
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
    phoneTagSticker: boolean; // +7,500 (Normally ₦12,000)
    vipAnalyticsQueue: boolean; // +5,000
    laserEngraving?: boolean;
    lifetimeAnalytics?: boolean;
  };
}

interface CardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTier?: 'plastic' | 'metal' | 'debit';
  initialMaterial?: CardMaterial;
  onProceedToCheckout: (data: CardCustomizationData) => void;
}

export const CardCustomizerModal: React.FC<CardCustomizerModalProps> = ({
  isOpen,
  onClose,
  initialTier = 'metal',
  initialMaterial,
  onProceedToCheckout,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [tier, setTier] = useState<'plastic' | 'metal' | 'debit'>(initialTier);
  const [material, setMaterial] = useState<CardMaterial>(() => {
    if (initialMaterial) return initialMaterial;
    if (initialTier === 'plastic') return 'plastic_white';
    if (initialTier === 'debit') return 'metal_gold';
    return 'metal_spacegray';
  });

  const [cardName, setCardName] = useState('');
  const [cardTitle, setCardTitle] = useState('');
  const [cardCompany, setCardCompany] = useState('');
  const [handle, setHandle] = useState('');

  // Sync state when modal opens or initial props update
  useEffect(() => {
    if (isOpen) {
      setTier(initialTier);
      if (initialMaterial) {
        setMaterial(initialMaterial);
      } else if (initialTier === 'plastic') {
        setMaterial('plastic_white');
      } else if (initialTier === 'debit') {
        setMaterial('metal_gold');
      } else {
        setMaterial('metal_spacegray');
      }
    }
  }, [isOpen, initialTier, initialMaterial]);

  // Lead capture fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [discountUnlocked, setDiscountUnlocked] = useState(false);

  // Order Bumps
  const [bumpPhoneTag, setBumpPhoneTag] = useState(false);
  const [bumpVipQueue, setBumpVipQueue] = useState(false);

  if (!isOpen) return null;

  // Handle tier selection and default matching material
  const handleTierSelect = (selectedTier: 'plastic' | 'metal' | 'debit', defaultMat?: CardMaterial) => {
    setTier(selectedTier);
    if (defaultMat) {
      setMaterial(defaultMat);
    } else if (selectedTier === 'plastic') {
      setMaterial('plastic_white');
    } else if (selectedTier === 'metal') {
      setMaterial('metal_spacegray');
    } else {
      setMaterial('metal_gold');
    }
  };

  // Base price in NGN: White PVC Card: ₦30,000, Black PVC Card (Custom UV Print): ₦35,000
  const getBasePrice = () => {
    if (material === 'plastic_black') {
      return 35000;
    }
    return 30000;
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
      appliedDiscount: false,
      orderBumps: {
        phoneTagSticker: bumpPhoneTag,
        vipAnalyticsQueue: bumpVipQueue,
        laserEngraving: bumpVipQueue,
        lifetimeAnalytics: bumpVipQueue,
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
            bumpPhoneTag ? 'phone_tag_sticker' : null,
            bumpVipQueue ? 'vip_analytics_queue' : null,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-6 pb-3.5 sm:pb-4 border-b border-white/10 pr-10 sm:pr-12 gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B600A8] animate-pulse shrink-0" />
            <h2 className="text-lg sm:text-2xl font-display font-black text-white truncate">
              CHIP Customization Studio
            </h2>
          </div>

          {/* Desktop Steps Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white/50">
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

          {/* Mobile Steps Indicator */}
          <div className="sm:hidden flex items-center justify-between text-[11px] font-mono w-full">
            <span className="text-white/70">
              Step <strong className="text-white">{step}</strong> of 3: {step === 1 ? 'Material & Tier' : step === 2 ? 'Engraving Layout' : 'Claim 10% Off'}
            </span>
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? 'w-5 bg-[#B600A8]' : s < step ? 'w-2.5 bg-emerald-500' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
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
                Selected Card: <strong className="text-white uppercase">{material === 'plastic_black' ? 'Black PVC (Custom UV Print)' : 'White PVC (Custom Print)'}</strong>
              </span>
              <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#76BB08]">
                ₦{getBasePrice().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Right Column: Multi-Step Interactive Form */}
          <div className="lg:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              {/* STEP 1: PVC CARD SELECTION */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Select Your NFC Smart PVC Card</h3>
                    <p className="text-xs text-white/60">Built with embedded NXP NTAG216 chip. Sub-10ms response, zero app needed.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      {
                        id: 'plastic_white',
                        material: 'plastic_white' as CardMaterial,
                        label: 'White PVC Card',
                        sublabel: 'Custom Print',
                        price: '₦30,000',
                        originalPrice: '₦45,000',
                        badge: 'Clean Minimalist',
                        desc: 'Sleek ceramic white polymer with full-bleed custom color print. Embedded NTAG216 chip & dynamic QR code.',
                      },
                      {
                        id: 'plastic_black',
                        material: 'plastic_black' as CardMaterial,
                        label: 'Black PVC Card',
                        sublabel: 'Custom UV Print',
                        price: '₦35,000',
                        originalPrice: '₦50,000',
                        badge: '★ Most Popular • VIP',
                        desc: 'Industrial matte black polymer with tactile high-definition UV print. Scratch & waterproof with instant tap.',
                      },
                    ].map((t) => {
                      const isSelected = material === t.material;
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            setTier('plastic');
                            setMaterial(t.material);
                          }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#76BB08] bg-[#76BB08]/15 shadow-lg shadow-emerald-950/40 scale-[1.01]'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                                t.material === 'plastic_black'
                                  ? 'bg-[#76BB08]/20 text-[#76BB08] border border-[#76BB08]/40'
                                  : 'bg-white/10 text-white/80 border border-white/20'
                              }`}>
                                {t.badge}
                              </span>
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-[#76BB08]" />}
                            </div>
                            <h4 className="font-extrabold text-base text-white mt-1 leading-tight">{t.label}</h4>
                            <p className="text-xs font-semibold text-[#76BB08]">{t.sublabel}</p>
                            
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-2xl font-black text-white">{t.price}</span>
                            </div>
                            
                            <p className="text-xs text-white/70 mt-2 leading-relaxed">{t.desc}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                            <span>Sub-10ms NTAG216</span>
                            <span className="text-emerald-400 font-bold">24-48h Lagos Dispatch</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm bg-[#76BB08] hover:bg-[#85d309] text-neutral-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#76BB08]/20 transition-all active:scale-[0.98]"
                  >
                    <span>Proceed to Card Customization & Print Details</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: ENGRAVING / PRINTING & BIO PREVIEW */}
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
                      <h3 className="text-lg font-bold text-white">
                        {tier === 'metal' ? 'Laser Engraving Layout' : 'Card Printing Layout'}
                      </h3>
                      <p className="text-xs text-white/60">
                        {tier === 'metal'
                          ? 'This will be physically fiber-laser etched onto your metal card.'
                          : 'This will be precision UV printed onto your PVC card.'}
                      </p>
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
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-base sm:text-sm"
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
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-base sm:text-sm"
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
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-base sm:text-sm"
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
                        className="w-full py-2.5 px-1 bg-transparent text-white focus:outline-none text-base sm:text-sm font-mono"
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
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#76BB08]/20 text-[#76BB08] text-xs font-bold mb-1 border border-[#76BB08]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reserve Custom Order</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {tier === 'metal' ? 'Reserve Your Custom Engraving' : 'Reserve Your Custom Printing'}
                      </h3>
                      <p className="text-xs text-white/60">
                        Save your custom card build and contact details to proceed directly to checkout.
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
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-base sm:text-sm"
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
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-base sm:text-sm"
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
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none text-base sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Order Bumps Preview */}
                    <div className="mt-2 pt-3 border-t border-white/10">
                      <span className="text-xs font-bold text-white/80 uppercase tracking-wider block mb-2">
                        Recommended Order Bumps (Optional)
                      </span>

                      <div className="flex flex-col gap-2">
                        {/* Bump 1: Phone Tap Sticker */}
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bumpPhoneTag}
                            onChange={(e) => setBumpPhoneTag(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-[#B600A8] focus:ring-[#B600A8] bg-black border-white/20"
                          />
                          <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">
                                YES! Add the ChipNG Phone Tap Sticker
                              </span>
                              <span className="text-xs font-bold text-amber-300">
                                +₦7,500 <span className="text-[10px] text-white/40 line-through">₦12,000</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                              Never leave home without your network. Stick this ultra-thin, frequency-shielded NFC disc to the back of your phone case. Works even when your wallet is in your bag or car.
                            </p>
                          </div>
                        </label>

                        {/* Bump 2: VIP Production & Lifetime Analytics */}
                        <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={bumpVipQueue}
                            onChange={(e) => setBumpVipQueue(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded text-[#B600A8] focus:ring-[#B600A8] bg-black border-white/20"
                          />
                          <div className="flex-1 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-white">
                                YES! Upgrade to VIP Production & Lifetime Advanced Analytics
                              </span>
                              <span className="text-xs font-bold text-amber-300">+₦5,000</span>
                            </div>
                            <p className="text-[11px] text-white/60 leading-tight mt-0.5">
                              {tier === 'metal'
                                ? 'Jump to the front of the laser-engraving line for expedited 24-hour dispatch, plus unlock real-time link click heatmaps, contact download tracking, and profile view analytics for life.'
                                : 'Jump to the front of the UV printing queue for expedited 24-hour dispatch, plus unlock real-time link click heatmaps, contact download tracking, and profile view analytics for life.'}
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
