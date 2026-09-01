import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { usePaystackPayment } from 'react-paystack';
import { ChevronRight, Shield, Zap, RefreshCw, Star, ArrowRight } from 'lucide-react';

export default function NfcSalesView({ onNavigate }: { onNavigate?: (view: any) => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCard, setSelectedCard] = useState<'black' | 'white' | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  // TikTok Embed Script loader
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const config = {
    reference: (new Date()).getTime().toString(),
    email,
    amount: selectedCard === 'black' ? 35000 * 100 : 30000 * 100, // in kobo
    publicKey: (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_dummy',
    metadata: {
      name,
      phone,
      custom_fields: [
        {
          display_name: 'Card Type',
          variable_name: 'card_type',
          value: selectedCard === 'black' ? 'Black NFC Card' : 'White NFC Card'
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    setShowCheckout(false);
    setPaymentSuccess(reference);
    
    // Save to database
    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          card_type: selectedCard === 'black' ? 'Black Edition' : 'White Edition',
          amount: selectedCard === 'black' ? 3500000 : 3000000,
          payment_reference: reference.reference
        })
      });
    } catch (e) {
      console.error("Failed to save sale to db", e);
    }
  };

  const onClose = () => {
    console.log('Payment closed');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !selectedCard) return;
    initializePayment({ onSuccess, onClose });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#B600A8] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate && onNavigate('landing')}>
            <span className="font-display font-black text-2xl tracking-tighter">CHIP<span className="text-[#B600A8]">NG</span></span>
          </div>
          <button onClick={() => {
            const pricing = document.getElementById('pricing');
            pricing?.scrollIntoView({ behavior: 'smooth' });
          }} className="bg-white text-black font-bold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm">
            Get Yours Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B600A8]/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-mono tracking-wide uppercase">The Future of Networking</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-black leading-[1.1] tracking-tight">
              One Tap.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B600A8] to-orange-400">
                Infinite Impressions.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-lg">
              Stop handing out paper cards that end up in the trash. Upgrade to a premium, custom-designed NFC plastic card that instantly shares your digital profile, contact info, and social links with a single tap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white font-bold px-8 py-4 rounded-full text-lg shadow-[0_0_40px_rgba(182,0,168,0.4)] hover:shadow-[0_0_60px_rgba(182,0,168,0.6)] transition-all flex items-center justify-center gap-2">
                Order Your Card Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-black" />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-sm text-white/60">Trusted by 5,000+ Professionals</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* TikTok Embed 1 */}
            <div className="w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-[#B600A8]/20 border border-white/10 bg-black">
              <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@chipng_nfc/video/7628228439719398664" data-video-id="7628228439719398664" style={{ maxWidth: '605px', minWidth: '325px', margin: 0 }}>
                <section></section>
              </blockquote>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof / Second TikTok */}
      <section className="py-24 px-6 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
             <div className="w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@chipng_nfc/video/7680709423232208146" data-video-id="7680709423232208146" style={{ maxWidth: '605px', minWidth: '325px', margin: 0 }}>
                <section></section>
              </blockquote>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">
              Stand Out in Every Meeting.
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              When everyone else hands over a flimsy paper card, you hand them magic. No apps required. Just tap your premium plastic NFC card to any modern smartphone, and your digital profile instantly appears on their screen.
            </p>
            <ul className="flex flex-col gap-4 mt-6">
              {[
                { icon: Zap, title: "Instant Transfer", desc: "Share your info in less than a second." },
                { icon: RefreshCw, title: "Update Anytime", desc: "Change jobs or numbers? Just update your profile, keep the same card." },
                { icon: Shield, title: "Premium Build", desc: "Durable, waterproof, matte-finish PVC plastic." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="p-3 rounded-xl bg-[#B600A8]/20 text-[#B600A8]">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-white/60">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-black mb-6">Choose Your Style</h2>
          <p className="text-xl text-white/60">One-time payment. No hidden fees. Custom printed with your logo or name.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* White Card */}
          <div className="relative flex flex-col p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
            <div className="w-full aspect-[1.58] bg-white rounded-2xl mb-8 flex items-center justify-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-4 right-4 text-black font-bold">NFC</div>
               <div className="text-2xl font-display font-black text-black">WHITE EDITION</div>
            </div>
            <h3 className="text-3xl font-bold mb-2">White Plastic Card</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black">₦30,000</span>
              <span className="text-white/50 line-through">₦45,000</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {['Premium White PVC Finish', 'Custom Front & Back Printing', 'Integrated NFC Chip', 'Dynamic QR Code included', 'Free Profile Hosting Forever', 'Delivery Nationwide'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-white/80">{feat}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => { setSelectedCard('white'); setShowCheckout(true); }}
              className="w-full py-4 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Get White Card
            </button>
          </div>

          {/* Black Card */}
          <div className="relative flex flex-col p-8 rounded-3xl bg-gradient-to-b from-[#1a1a1a] to-black border border-[#B600A8]/50 shadow-[0_0_30px_rgba(182,0,168,0.15)] transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#B600A8] text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
              Most Popular
            </div>
            <div className="w-full aspect-[1.58] bg-[#0f0f0f] rounded-2xl mb-8 flex items-center justify-center shadow-2xl border border-white/5 relative overflow-hidden">
               <div className="absolute top-4 right-4 text-white font-bold opacity-30">NFC</div>
               <div className="text-2xl font-display font-black text-white">BLACK EDITION</div>
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
            </div>
            <h3 className="text-3xl font-bold mb-2">Black Plastic Card</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black">₦35,000</span>
              <span className="text-white/50 line-through">₦50,000</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {['Premium Matte Black Finish', 'Custom Front & Back Printing', 'Integrated NFC Chip', 'Dynamic QR Code included', 'Free Profile Hosting Forever', 'Delivery Nationwide', 'Priority Processing'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#B600A8]/20 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-3 h-3 text-[#B600A8]" />
                  </div>
                  <span className="text-white/80">{feat}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => { setSelectedCard('black'); setShowCheckout(true); }}
              className="w-full py-4 rounded-xl font-bold text-lg bg-[#B600A8] text-white hover:bg-[#900085] transition-colors shadow-lg shadow-[#B600A8]/20"
            >
              Get Black Card
            </button>
          </div>
        </div>
      </section>

      {/* Third Video / Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#B600A8]/5 backdrop-blur-3xl"></div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight">
              Don't Be Forgotten.<br />Be Saved.
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Join thousands of founders, executives, and creators who have already made the switch. The only business card you'll ever need.
            </p>
            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-black font-bold px-10 py-5 rounded-full text-lg shadow-xl hover:scale-105 transition-transform inline-flex items-center gap-2">
              Claim Your Custom Card <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full lg:w-1/2">
             <div className="w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black">
              <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@chipng_nfc/video/7675867142255938824" data-video-id="7675867142255938824" style={{ maxWidth: '605px', minWidth: '325px', margin: 0 }}>
                <section></section>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-white/10 rounded-3xl p-8 w-full max-w-md relative"
          >
            <button 
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">Complete Your Order</h2>
            <p className="text-white/60 text-sm mb-6">
              You selected the {selectedCard === 'black' ? 'Black' : 'White'} Edition Card (₦{selectedCard === 'black' ? '35,000' : '30,000'}).
            </p>
            
            <form onSubmit={handleCheckout} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#B600A8] focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#B600A8] focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#B600A8] focus:outline-none transition-colors"
                  placeholder="08012345678"
                />
              </div>
              
              <div className="bg-[#B600A8]/10 border border-[#B600A8]/30 rounded-xl p-4 mt-2">
                <p className="text-xs text-[#B600A8] font-medium text-center">
                  After payment, you will be automatically redirected to our WhatsApp to upload your logo and design for printing.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-2 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Pay ₦{selectedCard === 'black' ? '35,000' : '30,000'} Now
              </button>
            </form>
          </motion.div>
        </div>
      )}
      {paymentSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-green-500/30 rounded-3xl p-8 w-full max-w-md text-center relative"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4 text-green-500">Payment Successful!</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Thank you for your order. Your payment reference is <span className="font-mono text-white bg-white/10 px-2 py-1 rounded">{paymentSuccess.reference}</span>.
              <br /><br />
              <strong>Next Step:</strong> Please click the button below to send us a message on WhatsApp. You can upload your logo or card design there so we can start printing immediately.
            </p>
            <a 
              href={`https://wa.me/2348100764154?text=${encodeURIComponent(`Hello! I just paid for my ${selectedCard === 'black' ? 'Black' : 'White'} NFC Card.

My Name: ${name}
Email: ${email}
Payment Ref: ${paymentSuccess.reference}

I would like to upload my card design now.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2"
            >
              Send Design via WhatsApp
            </a>
          </motion.div>
        </div>
      )}
    </div>
  );
}
