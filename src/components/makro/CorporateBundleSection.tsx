import React, { useState } from 'react';
import { 
  Building2, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Truck, 
  ArrowRight, 
  Download, 
  MessageSquare, 
  CreditCard, 
  Users, 
  Layers, 
  Lock, 
  FileText, 
  ExternalLink,
  ChevronRight,
  PhoneCall,
  X,
  Smartphone,
  Star
} from 'lucide-react';
import { ViewState } from '../../App';
import { openFlutterwavePayment } from '../../utils/flutterwaveClient';
import { toast } from '../Toast';
import BrandLogo from '../BrandLogo';

interface CorporateBundleSectionProps {
  onNavigate?: (view: ViewState) => void;
  isStandalonePage?: boolean;
}

export const CorporateBundleSection: React.FC<CorporateBundleSectionProps> = ({ 
  onNavigate,
  isStandalonePage = false 
}) => {
  // Card Finish Configuration State
  const [pvcFinish, setPvcFinish] = useState<'black' | 'white' | 'split'>('split');
  const [ceoFinish, setCeoFinish] = useState<'obsidian' | 'silver' | 'gold'>('obsidian');

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Customer & Company Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cityState, setCityState] = useState('Lagos (Express 24-48h Delivery)');
  const [ceoCardName, setCeoCardName] = useState('');
  const [notes, setNotes] = useState('');

  // Invoice specifics
  const [taxId, setTaxId] = useState('');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  const BUNDLE_PRICE = 300000;
  const REGULAR_PRICE = 385000;
  const SAVINGS = REGULAR_PRICE - BUNDLE_PRICE;

  const handleStartCheckout = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.trim() || !phone.trim()) {
      setIsCheckoutOpen(true);
      return;
    }

    setIsPaying(true);
    openFlutterwavePayment({
      amount: BUNDLE_PRICE,
      currency: 'NGN',
      title: 'CHIP NG Corporate Bundle (10 PVC + 1 Free CEO Metal)',
      description: `Corporate Fleet Bundle for ${companyName} (10 PVC + 1 Free CEO Metal Card)`,
      customer: {
        email: email.trim(),
        name: contactName.trim(),
        phone_number: phone.trim(),
      },
      meta: {
        product: 'Corporate Fleet Bundle',
        company: companyName,
        pvcFinish,
        ceoFinish,
        ceoCardName: ceoCardName || contactName,
        deliveryAddress: `${deliveryAddress}, ${cityState}`
      },
      onSuccess: (res) => {
        setIsPaying(false);
        setIsCheckoutOpen(false);
        toast.success(`Payment verified! Reference: ${res.transaction_id || res.tx_ref}. Our executive onboarding concierge will reach out via WhatsApp immediately.`);
      },
      onClose: () => {
        setIsPaying(false);
      }
    });
  };

  const handleGenerateProForma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactName || !email || !phone) {
      toast.error('Please fill in your company and contact information');
      return;
    }

    setInvoiceGenerated(true);
    toast.success('Pro-Forma Invoice generated successfully!');
  };

  const getWhatsAppConciergeUrl = () => {
    const text = `Hi CHIP NG! 👋\n\nI want to order the *Corporate Fleet Bundle (10 PVC + 1 Free CEO Metal for ₦300,000)* for my organization.\n\n*Company Name:* ${companyName || '[My Company]'}\n*Contact Person:* ${contactName || '[My Name]'}\n*Selected PVC Finish:* ${pvcFinish === 'split' ? '5 Black + 5 White' : pvcFinish === 'black' ? '10 Matte Black' : '10 Ceramic White'}\n*Selected CEO Metal Finish:* ${ceoFinish.toUpperCase()}\n\nPlease send us the invoice details and artwork specifications.`;
    return `https://wa.me/2348100764154?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="corporate-bundle" className="relative py-16 sm:py-24 bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white transition-colors overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#76BB08]/10 blur-[140px] rounded-full pointer-events-none -z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#76BB08]/15 border border-[#76BB08]/30 text-xs font-extrabold uppercase tracking-widest text-[#76BB08] mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Limited Corporate Executive Special</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.1] mb-6">
            Equip Your Entire Fleet.<br />
            <span className="text-[#76BB08]">10 PVC + 1 Free CEO Metal.</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Eliminate recurring paper card reprint costs forever. Outfit your sales reps, executives, and partners with smart contactless cards backed by centralized team management.
          </p>
        </div>

        {/* Main Bundle Card & Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Column 1: Interactive Visual Mockup Box */}
          <div className="lg:col-span-6 bg-gradient-to-br from-neutral-100 to-white dark:from-[#13151D] dark:to-[#0D0E14] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[480px]">
            {/* Top Ribbon */}
            <div className="flex items-center justify-between gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-black uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#76BB08]" /> 11 Smart Cards Total
              </span>
              <span className="text-xs font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/50">
                SAVE ₦{SAVINGS.toLocaleString()}
              </span>
            </div>

            {/* Visual Card Showcase Stack */}
            <div className="relative py-8 flex items-center justify-center">
              {/* Back PVC Cards Fan */}
              <div className="relative w-64 h-40 sm:w-80 sm:h-48 rounded-2xl bg-gradient-to-tr from-neutral-900 to-neutral-800 text-white p-5 border border-white/20 shadow-2xl -rotate-6 transition-all duration-300 hover:rotate-0">
                <div className="flex justify-between items-start">
                  <BrandLogo size="xs" iconOnly />
                  <span className="text-[10px] font-mono tracking-widest text-neutral-400">10x TEAM CARDS</span>
                </div>
                <div className="mt-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    {companyName || 'CORPORATE FLEET'}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">High-Frequency NTAG216 PVC</div>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[9px] font-mono text-[#76BB08]">
                  <Smartphone className="w-3 h-3" /> Sub-10ms Tap
                </div>
              </div>

              {/* Front Hero: The FREE Executive CEO Metal Card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 sm:w-80 sm:h-48 rounded-2xl bg-gradient-to-br from-neutral-950 via-[#1A1C23] to-[#0A0B0E] text-white p-5 border-2 border-[#76BB08]/60 shadow-[0_20px_50px_rgba(118,187,8,0.25)] rotate-3 transition-transform duration-300 hover:scale-105 hover:rotate-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <BrandLogo size="xs" iconOnly />
                    <span className="px-2 py-0.5 rounded-md bg-[#76BB08] text-neutral-950 text-[9px] font-black uppercase tracking-widest">
                      FREE CEO METAL
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#76BB08]" />
                </div>
                <div className="mt-7">
                  <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white">
                    {ceoCardName || 'CHIEF EXECUTIVE OFFICER'}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    Laser-Engraved Aerospace Steel &bull; ₦50,000 Value
                  </div>
                </div>
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pt-2 border-t border-white/10 text-[9px] font-mono text-neutral-400">
                  <span>UNLIMITED CONTACTLESS TAPS</span>
                  <span className="text-[#76BB08] font-bold">LIFETIME VIP</span>
                </div>
              </div>
            </div>

            {/* Finish Selectors */}
            <div className="pt-6 border-t border-neutral-200/80 dark:border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  10x Team PVC Color:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-neutral-200/60 dark:bg-black/40 border border-neutral-300 dark:border-white/10 gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPvcFinish('split')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      pvcFinish === 'split' ? 'bg-[#76BB08] text-neutral-950 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    5 Black + 5 White
                  </button>
                  <button
                    type="button"
                    onClick={() => setPvcFinish('black')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      pvcFinish === 'black' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    All Black
                  </button>
                  <button
                    type="button"
                    onClick={() => setPvcFinish('white')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      pvcFinish === 'white' ? 'bg-white text-neutral-950 shadow-xs font-bold' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    All White
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  1x Free CEO Metal Finish:
                </span>
                <div className="inline-flex p-1 rounded-xl bg-neutral-200/60 dark:bg-black/40 border border-neutral-300 dark:border-white/10 gap-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setCeoFinish('obsidian')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      ceoFinish === 'obsidian' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Matte Obsidian
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeoFinish('silver')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      ceoFinish === 'silver' ? 'bg-neutral-300 text-neutral-900 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Brushed Steel
                  </button>
                  <button
                    type="button"
                    onClick={() => setCeoFinish('gold')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      ceoFinish === 'gold' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    24K Gold Finish
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Value Stack, Pricing, and Instant Purchase */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {/* Pricing Display */}
              <div className="flex items-baseline justify-between border-b border-neutral-100 dark:border-white/5 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 dark:text-white tracking-tight">
                      ₦{BUNDLE_PRICE.toLocaleString()}
                    </span>
                    <span className="text-lg sm:text-xl text-neutral-400 line-through font-medium">
                      ₦{REGULAR_PRICE.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 mt-1 block">
                    All-Inclusive One-Time Fee &bull; Zero Monthly Subscriptions &bull; 11 Custom Cards
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                    22% OFF
                  </span>
                </div>
              </div>

              {/* What You Receive Checklist */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Included in This Executive Bundle:
                </span>
                
                <div className="space-y-2.5">
                  {[
                    { title: '10x Smart NFC PVC Cards (Matte Black or White)', desc: 'Genuine NXP NTAG216 chip, waterproof, scratch-resistant, custom laser engraved with employee name & company logo.' },
                    { title: '1x Heavyweight Executive CEO Metal Card (FREE — ₦50k value)', desc: 'Precision-weighted aerospace grade stainless steel with matte obsidian or gold coating for the CEO / Managing Director.' },
                    { title: 'Centralized Team Fleet Management Dashboard', desc: 'One central master login to reassign cards, update social/contact details, and track networking analytics across the entire firm.' },
                    { title: '2-Way Contact Exchange & Lead Capture Form', desc: 'Clients can tap and instantly send their name, phone, and inquiry back to your team.' },
                    { title: 'Free Corporate Vector Logo Engraving', desc: 'Upload your high-res company emblem for the metal card.' },
                    { title: 'Priority 24-48h Express Shipping Across Nigeria', desc: 'Free door-to-door insured delivery to your office in Lagos, Abuja, Port Harcourt, and other states.' }
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#76BB08]/20 text-[#76BB08] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-tight block">
                          {feat.title}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5 block">
                          {feat.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="pt-4 border-t border-neutral-100 dark:border-white/5 space-y-3">
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 px-6 rounded-full bg-[#76BB08] hover:bg-[#66a307] text-neutral-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#76BB08]/20 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <CreditCard className="w-5 h-5 text-neutral-950" />
                  <span>Claim Corporate Bundle (₦300k)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="py-3 px-4 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span>Request Corporate Pro-Forma</span>
                  </button>

                  <a
                    href={getWhatsAppConciergeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp VIP Concierge</span>
                  </a>
                </div>
              </div>

              {/* Trust & Guarantee Badges */}
              <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#76BB08]" /> 1-Year Hardware Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500" /> Insured Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" /> NDPR Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Comparison: Paper vs. CHIP NG Fleet */}
        <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-10 mb-16 shadow-xs">
          <div className="max-w-2xl mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Why Forward-Thinking Nigerian Companies Are Switching
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Compare the cost of traditional paper business cards vs. CHIP NG contactless team intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-black/30 border border-neutral-200/80 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-rose-500">The Traditional Paper Way</span>
                <span className="text-xs font-mono font-bold text-neutral-400">Recurring Waste</span>
              </div>
              <ul className="text-xs sm:text-sm space-y-3 text-neutral-600 dark:text-neutral-400">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">&times;</span>
                  <span>₦50,000 to ₦75,000 per employee per year in recurrent card printing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">&times;</span>
                  <span>Entire packs discarded whenever phone numbers, titles, or offices change.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">&times;</span>
                  <span>88% of paper cards are discarded in the trash within 7 days with zero tracking.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-neutral-200 dark:border-white/5 font-mono text-xs text-neutral-500">
                10 Employees &bull; 2-Year Cost: <strong>₦1,200,000+</strong>
              </div>
            </div>

            {/* The CHIP NG Corporate Bundle */}
            <div className="p-6 rounded-2xl bg-[#76BB08]/5 dark:bg-[#76BB08]/10 border-2 border-[#76BB08]/40 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#76BB08]">The CHIP NG Fleet Way</span>
                <span className="text-xs font-mono font-bold text-emerald-500">One-Time Lifetime</span>
              </div>
              <ul className="text-xs sm:text-sm space-y-3 text-neutral-800 dark:text-neutral-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                  <span><strong>₦300,000 Flat One-Time Investment</strong> for 10 Team Cards + 1 Free CEO Metal.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                  <span><strong>Zero Reprints:</strong> Change employee titles, links, or numbers in 2 seconds from the master dashboard.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#76BB08] shrink-0 mt-0.5" />
                  <span><strong>Automated Client Capture:</strong> Prospective clients save your staff contacts and submit their info directly into your CRM.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-[#76BB08]/20 font-mono text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                <span>10 Employees &bull; 2-Year Cost: <strong>₦300,000</strong></span>
                <span className="font-bold text-[#76BB08]">Net Savings: ₦900k+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4 mb-16">
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white tracking-tight text-center mb-6">
            Frequently Asked Questions by Corporate Teams
          </h3>

          {[
            {
              q: 'How do we send our company vector logo and team list for laser engraving?',
              a: 'Once your order is placed, our Dedicated Executive Onboarding Concierge will contact you via WhatsApp and email. You can simply share your high-res vector logo (PNG, SVG, AI, or PDF) along with an Excel list of your 10 team members and the CEO. We create digital 3D proofs for your approval before engraving.'
            },
            {
              q: 'Can we pay via Corporate Bank Transfer against an official Pro-Forma Invoice?',
              a: 'Yes, absolutely! Click "Request Corporate Pro-Forma" above. Our automated invoice generator provides a formal VAT-compliant invoice with our corporate bank details (Moniepoint MFB / Sterling Bank) so your finance team can execute a direct bank wire.'
            },
            {
              q: 'What happens when an employee leaves or changes their role?',
              a: 'No card is ever wasted. Through your centralized Enterprise Fleet Dashboard, you can instantly re-assign the card to a new team member, update their name, email, and routing in under 10 seconds. The physical card works seamlessly with the new profile.'
            },
            {
              q: 'Does the recipient need any app to scan the card?',
              a: 'None! When your team members tap their CHIP NG card against any modern smartphone (iPhone 7 through 16 Pro, and all NFC-enabled Android devices), the browser opens instantly with your corporate link-in-bio and a 1-tap "Save Contact to Phonebook" button.'
            }
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-xs">
              <h4 className="text-sm font-bold text-neutral-950 dark:text-white mb-2">{faq.q}</h4>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="rounded-3xl bg-neutral-950 text-white p-8 sm:p-12 border border-neutral-800 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade Your Organization to Smart Contactless Hardware?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Order your Corporate Fleet Bundle today. Includes 10 Smart PVC Cards + 1 Free CEO Metal Card with custom engraving and insured express delivery across Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#76BB08] hover:bg-[#66a307] text-neutral-950 font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                Claim Bundle for ₦300,000
              </button>
              <a
                href={getWhatsAppConciergeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-[#76BB08]" />
                <span>Speak with Sales on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: Instant Checkout & Customizer Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                  Corporate Fleet Order Configuration
                </h3>
                <p className="text-xs text-neutral-500">
                  10x PVC Cards + 1x Free CEO Metal Card &bull; ₦300,000
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStartCheckout} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Sterling Capital Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Contact Person Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Babatunde Adeleke"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Corporate Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.ng"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0802 345 6789"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Name for the Free CEO Metal Card
                </label>
                <input
                  type="text"
                  value={ceoCardName}
                  onChange={(e) => setCeoCardName(e.target.value)}
                  placeholder="e.g. Dr. Ngozi Okonjo — Managing Director"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Delivery State *
                  </label>
                  <select
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  >
                    <option value="Lagos (Express 24-48h Delivery)">Lagos (Express 24-48h Delivery)</option>
                    <option value="Abuja FCT (Priority Express)">Abuja FCT (Priority Express)</option>
                    <option value="Rivers (Port Harcourt)">Rivers (Port Harcourt)</option>
                    <option value="Oyo (Ibadan)">Oyo (Ibadan)</option>
                    <option value="Ogun (Abeokuta)">Ogun (Abeokuta)</option>
                    <option value="Delta (Asaba / Warri)">Delta (Asaba / Warri)</option>
                    <option value="Edo (Benin City)">Edo (Benin City)</option>
                    <option value="Other Nigerian State">Other Nigerian State (2-4 Days)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Office Street Address *
                  </label>
                  <input
                    required
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Floor 4, Adeola Odeku St, VI"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  />
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>10x Smart PVC Cards:</span>
                  <span>{pvcFinish === 'split' ? '5 Black / 5 White' : pvcFinish.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>1x Free Executive CEO Metal Card:</span>
                  <span className="text-[#76BB08] font-bold">{ceoFinish.toUpperCase()} (₦0.00)</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Priority Insured Delivery:</span>
                  <span className="text-emerald-500 font-bold">FREE NATIONWIDE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-neutral-950 dark:text-white pt-2 border-t border-neutral-200 dark:border-white/5">
                  <span>Total Amount Due:</span>
                  <span className="text-[#76BB08]">₦300,000</span>
                </div>
              </div>

              <button
                disabled={isPaying}
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-[#76BB08] hover:bg-[#66a307] text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4 text-neutral-950" />
                <span>{isPaying ? 'Connecting Payment...' : 'Proceed to Instant Pay (₦300,000)'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Corporate Pro-Forma Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-white">
                  Corporate Pro-Forma Invoice Request
                </h3>
                <p className="text-xs text-neutral-500">
                  Generate VAT-compliant invoice for bank wire transfer
                </p>
              </div>
              <button
                onClick={() => { setIsInvoiceModalOpen(false); setInvoiceGenerated(false); }}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!invoiceGenerated ? (
              <form onSubmit={handleGenerateProForma} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Registered Company Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Horizon Logistics & Infrastructure Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Contact Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Folake Balogun"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Tax ID / TIN / RC Number
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="Optional RC Number"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Accounts Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="finance@horizon.ng"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0803 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#76BB08]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:opacity-90"
                >
                  <FileText className="w-4 h-4 text-[#76BB08]" />
                  <span>Generate Official Pro-Forma Invoice</span>
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-neutral-200 dark:border-white/10 pb-3">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">PRO-FORMA INVOICE</span>
                    <span className="text-[#76BB08]">INV-CHIP-{Date.now().toString().slice(-6)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">BILLED TO:</span>
                    <strong className="text-neutral-900 dark:text-white block">{companyName}</strong>
                    <span className="text-neutral-500">Attn: {contactName} ({phone})</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 dark:border-white/10 space-y-1">
                    <div className="flex justify-between">
                      <span>10x NFC Smart PVC Cards</span>
                      <span>₦300,000.00</span>
                    </div>
                    <div className="flex justify-between text-[#76BB08]">
                      <span>1x Executive CEO Metal Card (Promo)</span>
                      <span>₦0.00</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-2 border-t border-neutral-200 dark:border-white/10 text-neutral-950 dark:text-white">
                      <span>Total Amount Due:</span>
                      <span className="text-[#76BB08]">₦300,000.00</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-black/40 border border-neutral-200/60 dark:border-white/5 space-y-1 mt-3">
                    <span className="text-neutral-400 block font-sans text-[11px] font-bold uppercase">Bank Transfer Details:</span>
                    <div className="text-neutral-900 dark:text-white font-bold">Bank: Moniepoint MFB</div>
                    <div className="text-neutral-900 dark:text-white font-bold">Account: 8254429406</div>
                    <div className="text-neutral-900 dark:text-white font-bold">Account Name: CHIP NG TECHNOLOGIES</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={getWhatsAppConciergeUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Proof on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => window.print()}
                    className="py-3 px-4 rounded-full border border-neutral-200/80 dark:border-white/10 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
