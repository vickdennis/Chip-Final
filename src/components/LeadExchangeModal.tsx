import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, User, Phone, Mail, Building2, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { toast } from './Toast';

interface LeadExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onVCardDownload?: () => void;
}

export const LeadExchangeModal: React.FC<LeadExchangeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onVCardDownload
}) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name.');
      return;
    }
    if (!whatsapp.trim() && !email.trim()) {
      toast.error('Please enter either your WhatsApp phone number or email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profile?.id,
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim(),
          company: company.trim(),
          message: message.trim(),
          source: 'profile_nfc_tap',
          city: 'Lagos'
        })
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success(`Contact shared with ${profile?.full_name || 'user'}!`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to submit contact details.');
      }
    } catch (e: any) {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#12141A] border border-white/15 rounded-[32px] p-6 sm:p-8 w-full max-w-md relative shadow-2xl text-white animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D2F843] animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#D2F843] font-bold">
                2-Way Contact Exchange
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Connect with {profile?.full_name || 'Cardholder'}
            </h3>
            <p className="text-xs text-white/60 mt-1 mb-6 leading-relaxed">
              Share your details directly to {profile?.full_name?.split(' ')[0] || 'their'} CHIP CRM so you can easily stay in touch.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">
                  Your Full Name *
                </label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#D2F843] transition-colors">
                  <User className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Victor Dennis"
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">
                  WhatsApp / Phone Number *
                </label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#D2F843] transition-colors">
                  <Phone className="w-4 h-4 text-white/40 shrink-0" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+234 810 000 0000"
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-white/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#D2F843] transition-colors">
                    <Mail className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-transparent text-base sm:text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">
                    Company / Title
                  </label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#D2F843] transition-colors">
                    <Building2 className="w-4 h-4 text-white/40 shrink-0" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Role & Brand"
                      className="w-full bg-transparent text-base sm:text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/70 uppercase mb-1">
                  Note / Context
                </label>
                <div className="flex items-start gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-[#D2F843] transition-colors">
                  <MessageSquare className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Met at Lagos Tech Week, let's discuss the partnership..."
                    className="w-full bg-transparent text-base sm:text-xs text-white placeholder-white/30 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#D2F843] text-neutral-950 hover:bg-[#bce42d] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sharing Contact...</span>
                  </>
                ) : (
                  <>
                    <span>Share My Contact</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-4 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white">
              Contact Details Shared!
            </h3>
            <p className="text-xs text-white/70 max-w-xs mx-auto mt-2 leading-relaxed">
              Your details have been delivered to {profile?.full_name || 'the cardholder'}. You can now save their verified vCard directly to your phonebook:
            </p>

            {onVCardDownload && (
              <button
                onClick={() => {
                  onVCardDownload();
                  onClose();
                }}
                className="mt-5 w-full py-3 rounded-full font-bold text-xs sm:text-sm bg-white text-neutral-950 hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <span>Save {profile?.full_name?.split(' ')[0] || 'Their'} Contact to Phone</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="mt-2.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer py-1"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
