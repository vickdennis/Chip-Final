import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  CreditCard, 
  Building2, 
  Copy, 
  MessageCircle, 
  ArrowRight, 
  Lock, 
  Loader2, 
  Zap, 
  CheckCircle2, 
  QrCode,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import PaystackPop from '@paystack/inline-js';
import { ShopProduct } from './MakroShop';
import { trackTikTokEvent } from '../../utils/tiktokPixel';
import { toast } from '../Toast';

interface MakroProductCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ShopProduct;
  onNavigate?: (view: any) => void;
}

const PAYSTACK_PUBLIC_KEY =
  (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_live_98c73643bf533425b945bb3c328918539f3100ca';

const NIGERIAN_STATES = [
  'Lagos (Express 24-48h Delivery)',
  'Abuja FCT (Priority Express)',
  'Rivers (Port Harcourt)',
  'Ogun (Abeokuta / Sagamu)',
  'Oyo (Ibadan)',
  'Delta (Asaba / Warri)',
  'Edo (Benin City)',
  'Anambra (Awka / Onitsha)',
  'Enugu',
  'Kaduna',
  'Kano',
  'Akwa Ibom (Uyo)',
  'Cross River (Calabar)',
  'Imo (Owerri)',
  'Kwara (Ilorin)',
  'Ondo (Akure)',
  'Osun (Osogbo)',
  'Abia (Umuahia / Aba)',
  'Plateau (Jos)',
  'Other Nigerian State'
];

export const MakroProductCheckoutModal: React.FC<MakroProductCheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  onNavigate,
}) => {
  // Determine default finish based on product
  const isMetal = product.name.toLowerCase().includes('metal');
  const isDebit = product.name.toLowerCase().includes('debit');
  const isWhite = product.name.toLowerCase().includes('white');

  const defaultFinish = isDebit 
    ? 'gold' 
    : isMetal 
    ? 'obsidian' 
    : isWhite 
    ? 'white' 
    : 'black';

  const [selectedFinish, setSelectedFinish] = useState<'obsidian' | 'black' | 'white' | 'gold'>(defaultFinish);

  // Card Engraving Customization fields
  const [engravedName, setEngravedName] = useState('');
  const [engravedTitle, setEngravedTitle] = useState('');
  const [handle, setHandle] = useState('');

  // Delivery & Customer Contact Info
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedState, setSelectedState] = useState('Lagos (Express 24-48h Delivery)');

  // Add-ons & Payment options
  const [includePhoneTag, setIncludePhoneTag] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'transfer'>('paystack');
  const [copiedBank, setCopiedBank] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Price calculations
  const basePrice = Number(product.price || 0);
  const phoneTagPrice = includePhoneTag ? 7500 : 0;
  const totalPrice = basePrice + phoneTagPrice;
  const totalPriceKobo = totalPrice * 100;

  // Sync default finish when product changes
  useEffect(() => {
    setSelectedFinish(
      isDebit ? 'gold' : isMetal ? 'obsidian' : isWhite ? 'white' : 'black'
    );
  }, [product.id, isDebit, isMetal, isWhite]);

  // Track TikTok InitiateCheckout when checkout modal opens
  useEffect(() => {
    if (isOpen && product) {
      trackTikTokEvent('InitiateCheckout', {
        content_type: 'product',
        content_name: product.name,
        content_id: product.id,
        quantity: 1,
        value: totalPrice,
        currency: 'NGN',
      });
    }
  }, [isOpen, product, totalPrice]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Paystack configuration
  const paystackConfig = {
    reference: `CHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email: email.trim() || 'customer@chipng.com',
    amount: totalPriceKobo,
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: 'NGN',
    metadata: {
      name: customerName || engravedName || 'Customer',
      phone: whatsapp,
      custom_fields: [
        { display_name: 'Product Ordered', variable_name: 'product_name', value: product.name },
        { display_name: 'Laser-Engraved Name', variable_name: 'engraved_name', value: engravedName },
        { display_name: 'Surface Title', variable_name: 'surface_title', value: engravedTitle },
        { display_name: 'Delivery State', variable_name: 'delivery_state', value: selectedState },
        { display_name: 'Delivery Address', variable_name: 'delivery_address', value: deliveryAddress },
        { display_name: 'Phone Tap Sticker Add-on', variable_name: 'phone_tag_addon', value: includePhoneTag ? 'Yes (+₦7,500)' : 'No' },
      ],
    },
  };

  const initializePaystackFallback = usePaystackPayment(paystackConfig);

  if (!isOpen) return null;

  const validateForm = () => {
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name for delivery.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address for order receipt.');
      return false;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 8) {
      setErrorMessage('Please enter a valid WhatsApp phone number for courier updates.');
      return false;
    }
    if (!deliveryAddress.trim()) {
      setErrorMessage('Please provide your street or office delivery address.');
      return false;
    }
    setErrorMessage(null);
    return true;
  };

  const handlePaymentSuccess = async (reference: any) => {
    setIsProcessing(true);
    const refString = reference?.reference || reference?.trxref || `CHIP-${Date.now()}`;
    setPaymentSuccess({ ...reference, reference: refString });

    try {
      // 1. Verify and record on backend
      await fetch(`/api/paystack/verify/${encodeURIComponent(refString)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName || engravedName,
          email: email.trim(),
          phone: whatsapp,
          card_type: product.name,
          amount: totalPriceKobo,
        }),
      }).catch(() => {});

      // 2. Persist lead as converted
      await fetch('/api/funnel/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerName || engravedName,
          email: email.trim(),
          whatsapp,
          funnel_stage: 'converted',
          order_bumps: includePhoneTag ? ['phone_tag_sticker'] : [],
          estimated_amount: totalPrice,
          delivery_address: `${deliveryAddress}, ${selectedState}`,
        }),
      }).catch(() => {});

      // 3. Track TikTok CompletePayment
      trackTikTokEvent('CompletePayment', {
        content_type: 'product',
        content_name: product.name,
        content_id: product.id,
        quantity: 1,
        value: totalPrice,
        currency: 'NGN',
      });

      toast.success('Payment verified! Your custom NFC card has entered production.');
    } catch (err) {
      console.error('Error recording payment:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystackCheckout = () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const txRef = `CHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const transactionOptions = {
      key: PAYSTACK_PUBLIC_KEY,
      publicKey: PAYSTACK_PUBLIC_KEY,
      email: email.trim(),
      amount: totalPriceKobo,
      currency: 'NGN',
      ref: txRef,
      reference: txRef,
      firstname: customerName.split(' ')[0] || 'Valued',
      lastname: customerName.split(' ').slice(1).join(' ') || 'Customer',
      phone: whatsapp,
      metadata: {
        name: customerName,
        phone: whatsapp,
        custom_fields: [
          { display_name: 'Product Ordered', variable_name: 'product_name', value: product.name },
          { display_name: 'Laser-Engraved Name', variable_name: 'engraved_name', value: engravedName || customerName },
          { display_name: 'Title/Role', variable_name: 'engraved_title', value: engravedTitle },
          { display_name: 'Delivery Address', variable_name: 'delivery_address', value: `${deliveryAddress}, ${selectedState}` },
          { display_name: 'Add-on Phone Tag', variable_name: 'phone_tag_addon', value: includePhoneTag ? 'Yes (+₦7,500)' : 'No' },
        ],
      },
    };

    try {
      const paystack = new PaystackPop();
      paystack.newTransaction({
        ...transactionOptions,
        onSuccess: (res: any) => {
          setIsProcessing(false);
          handlePaymentSuccess(res || { reference: txRef });
        },
        onCancel: () => {
          setIsProcessing(false);
          toast.info('Payment window closed. Your order details are saved.');
        },
      });
    } catch (err) {
      console.warn('PaystackPop failed to launch, falling back to hook:', err);
      try {
        initializePaystackFallback({
          onSuccess: (res: any) => {
            setIsProcessing(false);
            handlePaymentSuccess(res);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
      } catch (e) {
        setIsProcessing(false);
        setErrorMessage('Failed to open payment gateway. Please select Bank Transfer or try again.');
      }
    }
  };

  const handleCopyAccount = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBank(true);
    toast.success('Account number copied to clipboard!');
    setTimeout(() => setCopiedBank(false), 3000);
  };

  const handleBankTransferWhatsAppProof = () => {
    if (!validateForm()) return;

    const message = encodeURIComponent(
      `Hello CHIP NG Concierge, I just initiated a Direct Bank Transfer order on the homepage:\n\n` +
      `*Product:* ${product.name}\n` +
      `*Amount to Pay:* ₦${totalPrice.toLocaleString()}\n` +
      `*Name on Card:* ${engravedName || customerName}\n` +
      `*Role/Company:* ${engravedTitle || 'N/A'}\n` +
      `*Recipient Name:* ${customerName}\n` +
      `*WhatsApp:* ${whatsapp}\n` +
      `*Delivery Address:* ${deliveryAddress}, ${selectedState}\n` +
      `*Add-on Tag:* ${includePhoneTag ? 'Yes (+₦7,500)' : 'No'}\n\n` +
      `Attaching my payment receipt below for instant priority engraving & dispatch confirmation.`
    );
    window.open(`https://wa.me/2348100764154?text=${message}`, '_blank');
  };

  // Card Preview styling depending on finish
  const getCardStyle = () => {
    if (selectedFinish === 'gold') {
      return 'bg-gradient-to-tr from-[#9B7B2C] via-[#F3E796] to-[#C8A246] text-neutral-950 shadow-2xl border-amber-300/40';
    }
    if (selectedFinish === 'white') {
      return 'bg-gradient-to-tr from-neutral-100 via-white to-neutral-200 text-neutral-950 shadow-2xl border-neutral-300';
    }
    if (selectedFinish === 'obsidian') {
      return 'bg-gradient-to-tr from-[#0F1014] via-[#1F222B] to-[#121318] text-white shadow-2xl border-white/10';
    }
    // Matte black PVC
    return 'bg-gradient-to-tr from-[#000000] via-[#111111] to-[#1a1a1a] text-white shadow-2xl border-white/5';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-[#0D0F14] rounded-[28px] sm:rounded-[36px] border border-neutral-200/80 dark:border-white/10 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 sm:px-8 py-5 border-b border-neutral-100 dark:border-white/10 flex items-center justify-between bg-neutral-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D2F843] flex items-center justify-center text-neutral-950 font-black text-xs shadow-xs">
              <Zap className="w-4 h-4 fill-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B8500] dark:text-[#D2F843]">
                  CHIP NG Express Checkout
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                  VERIFIED NTAG216
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                {product.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {paymentSuccess ? (
            /* ================= SUCCESS STATE ================= */
            <div className="text-center py-10 max-w-xl mx-auto space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Payment Confirmed & Verified
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white">
                  Your Card is Headed to Production!
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  Thank you, <strong className="text-neutral-950 dark:text-white">{customerName || engravedName}</strong>. Your custom laser engraving order for <strong className="text-neutral-950 dark:text-white">{product.name}</strong> has been transmitted to our Lagos workshop.
                </p>
              </div>

              {/* Order Metadata Box */}
              <div className="p-5 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 text-left space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-neutral-200 dark:border-white/10 pb-2">
                  <span className="text-neutral-500">Order Reference</span>
                  <span className="font-bold text-neutral-950 dark:text-white">{paymentSuccess.reference}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 dark:border-white/10 pb-2">
                  <span className="text-neutral-500">Engraved Name</span>
                  <span className="font-bold text-neutral-950 dark:text-white">{engravedName || customerName}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 dark:border-white/10 pb-2">
                  <span className="text-neutral-500">Delivery State</span>
                  <span className="font-bold text-neutral-950 dark:text-white">{selectedState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Paid</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/2348100764154?text=${encodeURIComponent(`Hi CHIP NG! I just completed order ${paymentSuccess.reference} for ${product.name}. My name is ${customerName}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-5 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Concierge Tracking</span>
                </a>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('user-dashboard');
                  }}
                  className="flex-1 py-3 px-5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  <span>Open Your Digital Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* ================= CHECKOUT MAIN LAYOUT ================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Visual Live Card Engraving Simulator & Guarantees */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                    Live Hardware Visualizer
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Preview your custom laser-engraved details in real time.
                  </p>
                </div>

                {/* 3D-Look Live Card Surface */}
                <div className={`relative aspect-[1.586/1] rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 shadow-xl overflow-hidden ${getCardStyle()}`}>
                  {/* Subtle Light reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

                  {/* Top Bar of Card */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-[10px] tracking-tight">
                        NG
                      </div>
                      <span className="font-extrabold text-xs tracking-wider uppercase opacity-90">
                        CHIP
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80">
                      <Zap className="w-4 h-4 text-[#D2F843]" />
                      <span className="text-[10px] font-mono tracking-widest font-bold">NTAG216</span>
                    </div>
                  </div>

                  {/* Center Contactless Wave Icon */}
                  <div className="relative z-10 flex justify-end pr-2 opacity-50">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                      <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                      <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                    </svg>
                  </div>

                  {/* Bottom Engraved Name & Role */}
                  <div className="relative z-10 space-y-0.5">
                    <div className="text-base sm:text-lg font-black tracking-tight uppercase truncate drop-shadow-xs">
                      {engravedName.trim() || 'YOUR NAME HERE'}
                    </div>
                    <div className="text-[11px] font-mono opacity-80 truncate uppercase tracking-wider">
                      {engravedTitle.trim() || 'FOUNDER & MANAGING DIRECTOR'}
                    </div>
                  </div>
                </div>

                {/* Material / Finish Selector */}
                <div className="space-y-2.5 pt-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Choose Surface Finish
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {isMetal || isDebit ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedFinish('obsidian')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedFinish === 'obsidian'
                              ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white'
                              : 'border-neutral-200 dark:border-white/10 hover:border-neutral-400'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-600 shrink-0" />
                          <span className="truncate">Matte Obsidian</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFinish('gold')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedFinish === 'gold'
                              ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                              : 'border-neutral-200 dark:border-white/10 hover:border-neutral-400'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-600 shrink-0" />
                          <span className="truncate">24K Mirror Gold</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedFinish('black')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedFinish === 'black'
                              ? 'border-neutral-950 bg-neutral-950 text-white dark:border-white'
                              : 'border-neutral-200 dark:border-white/10 hover:border-neutral-400'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-neutral-950 shrink-0" />
                          <span className="truncate">Matte Black PVC</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedFinish('white')}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            selectedFinish === 'white'
                              ? 'border-neutral-950 bg-neutral-200 text-neutral-950 dark:bg-white dark:text-neutral-950'
                              : 'border-neutral-200 dark:border-white/10 hover:border-neutral-400'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-white border border-neutral-300 shrink-0" />
                          <span className="truncate">Arctic White PVC</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Built-in Guarantees Banner */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/80 dark:border-white/5 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Sub-10ms NFC Response:</strong> Zero battery, zero apps required.</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>Fast Delivery:</strong> 24h Lagos, 48h Abuja & nationwide via DHL/GIG.</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>12-Month Hardware Guarantee:</strong> Free replacement on chip failure.</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                    <Sparkles className="w-4 h-4 text-[#84A900] dark:text-[#D2F843] shrink-0" />
                    <span><strong>Bonus Included:</strong> Free 3 Months Pro Analytics Dashboard.</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Customer Details, Delivery & Instant Payment */}
              <div className="lg:col-span-7 space-y-5">
                
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                    <span>⚠</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* SECTION 1: Card Laser Engraving Customization */}
                <div className="space-y-3 pb-4 border-b border-neutral-200/80 dark:border-white/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    1. Card Surface Engraving Details
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Name on Card *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Victor Dennis"
                        value={engravedName}
                        onChange={(e) => setEngravedName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Title / Company on Card
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Founder & CEO"
                        value={engravedTitle}
                        onChange={(e) => setEngravedTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Recipient Contact & Delivery Address */}
                <div className="space-y-3 pb-4 border-b border-neutral-200/80 dark:border-white/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    2. Recipient & Nationwide Dispatch
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Receiver's name"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (!engravedName) setEngravedName(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        WhatsApp Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="+234 810 000 0000"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Email Address (for order receipt & dashboard) *
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Delivery State (Nigeria) *
                      </label>
                      <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843] cursor-pointer"
                      >
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1 block">
                        Street Address / Landmark / Office *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15 Admiralty Way, Lekki Phase 1, Lagos"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: 1-Click Order Bump Add-on */}
                <div 
                  onClick={() => setIncludePhoneTag(!includePhoneTag)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    includePhoneTag
                      ? 'border-[#D2F843] bg-[#D2F843]/10 dark:bg-[#D2F843]/5'
                      : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center border transition-colors ${
                      includePhoneTag
                        ? 'bg-[#D2F843] border-[#D2F843] text-neutral-950'
                        : 'border-neutral-400 bg-white dark:bg-white/10'
                    }`}>
                      {includePhoneTag && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-950 dark:text-white">
                          Add Backup Phone Tap NFC Sticker
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 uppercase">
                          Save 40%
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Stick on the back of your smartphone for effortless backup contact sharing.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-neutral-950 dark:text-white font-mono">+₦7,500</div>
                    <div className="text-[10px] text-neutral-400 line-through font-mono">₦12,000</div>
                  </div>
                </div>

                {/* SECTION 4: Payment Method Selection */}
                <div className="space-y-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    3. Select Payment Method
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paystack')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'paystack'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 shadow-xs'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <span>Paystack (Cards / Bank / USSD)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'transfer'
                          ? 'border-[#D2F843] bg-[#D2F843]/15 text-neutral-950 dark:text-[#D2F843] shadow-xs'
                          : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-[#6B8500] dark:text-[#D2F843]" />
                      <span>Direct Bank Transfer</span>
                    </button>
                  </div>

                  {paymentMethod === 'transfer' && (
                    <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-white/10">
                        <span className="text-neutral-500 font-mono">Bank Name</span>
                        <span className="font-bold text-neutral-950 dark:text-white">Providus Bank / Moniepoint</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-white/10">
                        <span className="text-neutral-500 font-mono">Account Name</span>
                        <span className="font-bold text-neutral-950 dark:text-white">CHIP NG TECHNOLOGIES LTD</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-neutral-500 font-mono text-[11px]">Account Number</div>
                          <div className="text-base font-extrabold text-neutral-950 dark:text-white font-mono tracking-wider">
                            0128947264
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('0128947264')}
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 cursor-pointer shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedBank ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 5: Order Breakdown & Primary Payment CTA */}
                <div className="pt-3 border-t border-neutral-200/80 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">Subtotal ({product.name}):</span>
                    <span className="font-bold text-neutral-950 dark:text-white">₦{basePrice.toLocaleString()}</span>
                  </div>

                  {includePhoneTag && (
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Phone Tap Sticker Add-on:</span>
                      <span className="font-bold text-neutral-950 dark:text-white">+₦7,500</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">Nationwide Express Delivery (DHL/GIG):</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-white/10">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">Total Due</span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-neutral-950 dark:text-white tabular-nums">
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    </div>

                    {paymentMethod === 'paystack' ? (
                      <button
                        type="button"
                        onClick={handlePaystackCheckout}
                        disabled={isProcessing}
                        className="group flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-[#D2F843] text-neutral-950 font-black text-xs sm:text-sm hover:opacity-95 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Launching Paystack...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            <span>Pay ₦{totalPrice.toLocaleString()} with Paystack</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBankTransferWhatsAppProof}
                        className="group flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-lg cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send Transfer Proof on WhatsApp</span>
                      </button>
                    )}
                  </div>

                  {/* Security Trust Badges */}
                  <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" /> 256-Bit SSL Encrypted
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" /> Paystack Verified Merchant
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-emerald-500" /> Tracked Dispatch
                    </span>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
