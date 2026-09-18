import React, { useState } from 'react';
import { motion } from 'motion/react';
import { usePaystackPayment } from 'react-paystack';
import { CardCustomizationData } from './CardCustomizerModal';
import { ShieldCheck, CheckCircle2, Copy, MessageCircle, ArrowRight, Sparkles, Building2, CreditCard, ChevronDown, ChevronUp, Lock } from 'lucide-react';

interface CheckoutOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CardCustomizationData;
  onNavigate?: (view: any) => void;
}

export const CheckoutOnboardingModal: React.FC<CheckoutOnboardingModalProps> = ({
  isOpen,
  onClose,
  data,
  onNavigate,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'transfer'>('paystack');
  const [copiedBank, setCopiedBank] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Onboarding profile setup state
  const [profileBio, setProfileBio] = useState('Connecting leaders and creators with next-generation NFC technology.');
  const [profileInstagram, setProfileInstagram] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [onboardingSaved, setOnboardingSaved] = useState(false);

  // Order bumps state within checkout
  const [bumpLaser, setBumpLaser] = useState(data.orderBumps.laserEngraving);
  const [bumpAnalytics, setBumpAnalytics] = useState(data.orderBumps.lifetimeAnalytics);

  if (!isOpen) return null;

  // Base price calculation
  const getBasePrice = () => {
    switch (data.tier) {
      case 'plastic': return 30000;
      case 'debit': return 100000;
      case 'metal':
      default: return 50000;
    }
  };

  const basePrice = getBasePrice();
  const discountAmount = data.appliedDiscount ? Math.round(basePrice * 0.1) : 0;
  const laserPrice = bumpLaser ? 5000 : 0;
  const analyticsPrice = bumpAnalytics ? 10000 : 0;
  const totalAmountNgn = basePrice - discountAmount + laserPrice + analyticsPrice;
  const totalAmountKobo = totalAmountNgn * 100;

  // Paystack config
  const paystackConfig = {
    reference: `CHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: data.email,
    amount: totalAmountKobo,
    publicKey: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_dummy',
    metadata: {
      name: data.customerName,
      phone: data.whatsapp,
      custom_fields: [
        { display_name: 'Card Tier', variable_name: 'card_tier', value: data.tier },
        { display_name: 'Laser Name', variable_name: 'laser_name', value: data.name },
        { display_name: 'Laser Title', variable_name: 'laser_title', value: data.title },
        { display_name: 'Handle', variable_name: 'handle', value: data.handle },
        { display_name: 'Priority Laser Engraving', variable_name: 'bump_laser', value: bumpLaser ? 'Yes' : 'No' },
        { display_name: 'Lifetime Analytics', variable_name: 'bump_analytics', value: bumpAnalytics ? 'Yes' : 'No' },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference: any) => {
    setIsProcessing(true);
    setPaymentSuccess(reference);

    try {
      // Save sale to SQLite database
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.customerName,
          email: data.email,
          phone: data.whatsapp,
          card_type: `${data.tier.toUpperCase()} (${data.material})`,
          amount: totalAmountKobo,
          payment_reference: reference.reference,
        }),
      });

      // Update funnel lead stage to converted
      await fetch('/api/funnel/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          whatsapp: data.whatsapp,
          funnel_stage: 'converted',
          order_bumps: [bumpLaser ? 'laser_engraving' : null, bumpAnalytics ? 'lifetime_analytics' : null].filter(Boolean),
          estimated_amount: totalAmountNgn,
        }),
      });
    } catch (err) {
      console.error('Failed to register converted sale:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackClose = () => {
    // Trigger automated follow-up webhook for abandoned checkout
    fetch('/api/funnel/webhook-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'checkout_abandoned',
        email: data.email,
        whatsapp: data.whatsapp,
        name: data.customerName,
        custom_name: data.name,
        card_type: data.tier,
      }),
    }).catch(() => {});
  };

  const copyBankDetails = () => {
    navigator.clipboard.writeText('0123456789');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const handleSaveOnboarding = () => {
    setOnboardingSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#12141A] border border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[92vh] overflow-y-auto relative shadow-2xl no-scrollbar text-white"
      >
        {/* Close Button */}
        {!paymentSuccess && (
          <button
            onClick={() => {
              handlePaystackClose();
              onClose();
            }}
            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-20"
          >
            ✕
          </button>
        )}

        {/* ================= STAGE 6A: CHECKOUT INTERFACE ================= */}
        {!paymentSuccess ? (
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B600A8] font-bold">
                Stage 6 • Frictionless Checkout
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white mt-0.5">
                Complete Your Custom Card Order
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-1">
                Custom laser-engraved for <strong className="text-white">{data.name}</strong> • Nationwide insured delivery included.
              </p>
            </div>

            {/* Itemized Price Breakdown Table */}
            <div className="bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/80">
                  {data.tier === 'plastic' ? 'Smart Plastic NFC Card' : data.tier === 'debit' ? 'Metal Debit Convert Dual-Chip Card' : 'Smart Metal NFC Card (28g Aerospace)'}
                </span>
                <span className="font-semibold text-white">₦{basePrice.toLocaleString()}</span>
              </div>

              {data.appliedDiscount && (
                <div className="flex justify-between items-center text-sm text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span>VIP Reservation Coupon (10% OFF)</span>
                  </span>
                  <span className="font-bold">-₦{discountAmount.toLocaleString()}</span>
                </div>
              )}

              {/* Order Bump 1 Toggle */}
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bumpLaser}
                    onChange={(e) => setBumpLaser(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B600A8] focus:ring-[#B600A8] bg-black border-white/20"
                  />
                  <span className="text-white/80">Priority Laser Engraving & 24h Queue Pass</span>
                </label>
                <span className="font-mono text-white/90">+{bumpLaser ? '₦5,000' : '₦0'}</span>
              </div>

              {/* Order Bump 2 Toggle */}
              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bumpAnalytics}
                    onChange={(e) => setBumpAnalytics(e.target.checked)}
                    className="w-4 h-4 rounded text-[#B600A8] focus:ring-[#B600A8] bg-black border-white/20"
                  />
                  <span className="text-white/80">Lifetime Lead Capture & Tap Analytics Suite</span>
                </label>
                <span className="font-mono text-white/90">+{bumpAnalytics ? '₦10,000' : '₦0'}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-white/60">
                <span>Insured Nationwide Delivery (DHL / GIG Logistics)</span>
                <span className="text-emerald-400 font-bold uppercase">Free</span>
              </div>

              <div className="pt-3 border-t border-white/15 flex justify-between items-baseline">
                <span className="text-base font-bold text-white">Total Payable</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-[#B600A8]">
                  ₦{totalAmountNgn.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Select Preferred Payment Method
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paystack')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold transition-all cursor-pointer ${
                    paymentMethod === 'paystack'
                      ? 'border-[#B600A8] bg-[#B600A8]/15 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-[#B600A8]" />
                  <span>Card / USSD / Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 text-sm font-bold transition-all cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'border-[#B600A8] bg-[#B600A8]/15 text-white shadow-md'
                      : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Direct Bank Transfer</span>
                </button>
              </div>
            </div>

            {/* Payment Action Pane */}
            {paymentMethod === 'paystack' ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    initializePayment({
                      onSuccess: handlePaystackSuccess,
                      onClose: handlePaystackClose,
                    });
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-950/50 active:scale-98 transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay ₦{totalAmountNgn.toLocaleString()} with Paystack</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-xs text-white/50 pt-2">
                  <span>🔒 256-Bit SSL Encryption</span>
                  <span>•</span>
                  <span>Direct Paystack Integration</span>
                  <span>•</span>
                  <span>Instant Confirmation</span>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/80 uppercase">CHIP NG Official Bank Account</span>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Instant Auto-Confirm
                  </span>
                </div>

                <div className="bg-black/60 rounded-xl p-3 border border-white/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/50 uppercase">Bank Name</span>
                    <span className="text-sm font-bold text-white">Moniepoint Microfinance Bank</span>
                    <span className="text-[10px] text-white/50 uppercase mt-1">Account Number</span>
                    <span className="text-lg font-mono font-black text-amber-300">8100764154</span>
                    <span className="text-[10px] text-white/50 uppercase mt-0.5">Account Name</span>
                    <span className="text-xs font-semibold text-white/80">CHIP TECHNOLOGIES LIMITED</span>
                  </div>

                  <button
                    type="button"
                    onClick={copyBankDetails}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedBank ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-white/60">
                  After transferring <strong>₦{totalAmountNgn.toLocaleString()}</strong>, click the button below to send your transfer receipt directly to our WhatsApp Concierge for instant dispatch queueing:
                </p>

                <a
                  href={`https://wa.me/2348100764154?text=${encodeURIComponent(
                    `Hello CHIP Concierge! I have made a direct bank transfer of ₦${totalAmountNgn.toLocaleString()} for my ${data.tier.toUpperCase()} NFC Card.\n\nName: ${data.customerName}\nLaser Engraved Name: ${data.name}\nHandle: chipng.com/@${data.handle}\nEmail: ${data.email}\nPhone: ${data.whatsapp}\nOrder Total: ₦${totalAmountNgn.toLocaleString()}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    handlePaystackSuccess({ reference: `TRANSFER-${Date.now()}` });
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#25D366] text-black hover:bg-[#20bd5a] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>I Have Transferred • Send Receipt on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        ) : (
          /* ================= STAGE 6B: POST-PURCHASE ONBOARDING ENGINE ================= */
          <div className="flex flex-col gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/40">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Order Confirmed • Reference: {paymentSuccess.reference}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Your Custom Card is Being Handcrafted!
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto mt-2 leading-relaxed">
                Our master technicians in Lagos have received your laser-engraving layout for{' '}
                <strong className="text-white">{data.name}</strong>. While your physical hardware is crafted, let's activate your live digital bio engine right now!
              </p>
            </div>

            {/* Immediate Digital Bio Setup */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 text-left flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-sm text-white">Instant Bio Profile Activation</h4>
                  <span className="text-[11px] text-white/50">Your handle: <strong>chipng.com/@{data.handle}</strong></span>
                </div>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profileLinkedin}
                    onChange={(e) => setProfileLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={profileInstagram}
                    onChange={(e) => setProfileInstagram(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/60 uppercase mb-1">
                  Primary Website / Calendly Link
                </label>
                <input
                  type="url"
                  value={profileWebsite}
                  onChange={(e) => setProfileWebsite(e.target.value)}
                  placeholder="https://yourcompany.com or calendly.com/you"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:border-[#B600A8] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveOnboarding}
                className="mt-1 w-full py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{onboardingSaved ? '✓ Profile Links Synchronized' : 'Save & Publish Digital Profile'}</span>
              </button>
            </div>

            {/* Next Steps Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/2348100764154?text=${encodeURIComponent(
                  `Hello CHIP VIP Concierge! I just completed my order for a ${data.tier.toUpperCase()} card.\n\nOrder Ref: ${paymentSuccess.reference}\nName: ${data.customerName}\nLaser Name: ${data.name}\nHandle: chipng.com/@${data.handle}\n\nI would like to upload my high-resolution logo for laser-engraving now.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm bg-[#25D366] text-black hover:bg-[#20bd5a] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Upload Logo via WhatsApp Concierge</span>
              </a>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('user-dashboard');
                  }}
                  className="py-3.5 px-5 rounded-xl font-bold text-sm bg-white text-black hover:bg-neutral-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
