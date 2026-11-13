import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Globe, 
  Lock, 
  ArrowRight, 
  Upload, 
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { toast } from '../components/Toast';
import InternationalPhoneInput from '../components/InternationalPhoneInput';
import { getInternationalWhatsAppUrl } from '../utils/countryData';
import { useCurrency } from '../context/CurrencyContext';

interface ClientOnboardingViewProps {
  onNavigate?: (view: any) => void;
}

const CARD_TIERS = [
  {
    id: 'pvc-black',
    name: 'NFC Smart Black PVC Card',
    priceNgn: 35000,
    description: 'Ultra-durable matte black polymer with embedded NTAG216 high-speed chip (<10ms response).',
    color: 'from-neutral-900 to-neutral-800 border-neutral-700 text-white'
  },
  {
    id: 'pvc-white',
    name: 'NFC Smart White PVC Card',
    priceNgn: 30000,
    description: 'Clean minimalist white finish, waterproof, zero app required for client taps.',
    color: 'from-neutral-100 to-white border-neutral-300 text-neutral-900'
  },
  {
    id: 'metal-matte',
    name: 'NFC Smart Metal Card (Executive)',
    priceNgn: 50000,
    description: 'Solid surgical-grade stainless steel with luxury matte coating and dual NFC + QR.',
    color: 'from-zinc-900 via-neutral-800 to-stone-900 border-emerald-500/40 text-emerald-400'
  },
  {
    id: 'metal-debit-custom',
    name: 'Custom Metal Debit Card + Laser Engraving',
    priceMinNgn: 80000,
    priceMaxNgn: 100000,
    description: 'Handcrafted bespoke metal card with precision laser engraving of your signature or corporate brand.',
    color: 'from-amber-950 via-neutral-900 to-black border-amber-500/40 text-amber-300'
  }
];

export default function ClientOnboardingView({ onNavigate }: ClientOnboardingViewProps) {
  const { formatNgn } = useCurrency();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [desiredUsername, setDesiredUsername] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Lagos, Nigeria');
  const [selectedCardTier, setSelectedCardTier] = useState('pvc-black');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // Social & Web Links
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [website, setWebsite] = useState('');
  const [bookingLink, setBookingLink] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const cleanUsername = (desiredUsername || fullName.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'yourname';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalUsername = cleanUsername.toLowerCase().trim();
      const generatedPassword = 'Chip_' + Math.random().toString(36).substring(2, 8) + '!';

      const rawWa = (whatsapp.trim() || phone.trim());
      const waUrl = rawWa 
        ? (rawWa.startsWith('http') ? rawWa : getInternationalWhatsAppUrl(rawWa))
        : null;

      const socialsList = [
        waUrl ? { platform: 'whatsapp', url: waUrl } : null,
        linkedin ? { platform: 'linkedin', url: linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}` } : null,
        instagram ? { platform: 'instagram', url: instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}` } : null,
        twitter ? { platform: 'twitter', url: twitter.startsWith('http') ? twitter : `https://x.com/${twitter.replace('@', '')}` } : null,
        website ? { platform: 'website', url: website.startsWith('http') ? website : `https://${website}` } : null,
        bookingLink ? { platform: 'calendly', url: bookingLink.startsWith('http') ? bookingLink : `https://${bookingLink}` } : null,
      ].filter(Boolean);

      const payload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        username: finalUsername,
        headline: headline.trim() || 'Executive Member',
        bio: bio.trim(),
        phone_number: phone.trim(),
        address: address.trim(),
        card_tier: selectedCardTier,
        avatar_url: avatarUrl.trim() || null,
        logo_url: logoUrl.trim() || null,
        socials: socialsList,
        suggested_password: generatedPassword,
        status: 'pending_activation',
        created_at: new Date().toISOString()
      };

      // 1. Submit to official backend endpoint (notifies admin via Resend + persists to database)
      let apiSaved = false;
      try {
        const res = await fetch('/api/onboarding/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resData = await res.json().catch(() => ({}));
          if (resData.success !== false) {
            apiSaved = true;
          }
        }
      } catch (apiErr) {
        console.warn('Backend onboarding API dispatch note:', apiErr);
      }

      // 2. Client-side database redundancy: Try public.onboarding_submissions
      try {
        await supabase.from('onboarding_submissions').insert([payload]);
      } catch (_subErr) {}

      // 2b. Direct profile synchronization: If user is authenticated or profile exists, persist immediately so they won't have to enter info twice
      try {
        const { data: authData } = await supabase.auth.getUser();
        const currentUserId = authData?.user?.id;
        if (currentUserId) {
          await supabase.from('profiles').update({
            full_name: payload.full_name,
            username: payload.username,
            headline: payload.headline,
            bio: payload.bio,
            phone_number: payload.phone_number,
            address: payload.address,
            avatar_url: payload.avatar_url || undefined,
            contact_email: payload.email,
            email: payload.email,
            card_tier: payload.card_tier,
            updated_at: new Date().toISOString()
          }).eq('id', currentUserId);

          if (socialsList.length > 0) {
            const socialsToUpsert = socialsList.map((s: any) => ({
              profile_id: currentUserId,
              platform: s.platform,
              url: s.url
            }));
            await supabase.from('social_links').upsert(socialsToUpsert);
          }
        }
      } catch (_syncErr) {}

      // 3. Client-side database redundancy: Fallback to public.email_campaigns
      try {
        await supabase.from('email_campaigns').insert([{
          title: `Onboarding: ${payload.full_name} (@${payload.username})`,
          subject_template: `Onboarding: ${payload.full_name}`,
          body_template: `Card: ${payload.card_tier} | Phone: ${payload.phone_number || 'N/A'}`,
          sender_name: payload.full_name,
          sender_email: payload.email,
          provider: 'onboarding_submission',
          total_recipients: 1,
          sent_count: 1,
          status: 'pending_activation',
          resend_batch_id: payload.username,
          metadata: payload,
          created_at: payload.created_at
        }]);
      } catch (_campErr) {}

      // 4. Local storage backup for offline/instant preview on current client
      try {
        const localSubs = JSON.parse(localStorage.getItem('chipng_onboarding_submissions') || '[]');
        localSubs.unshift({ ...payload, id: 'sub_' + Date.now() });
        localStorage.setItem('chipng_onboarding_submissions', JSON.stringify(localSubs.slice(0, 50)));
      } catch (e) {}

      setSubmitted(true);
      toast.success('Your onboarding submission has been received! Our team will configure your NFC chip and public profile shortly.');
    } catch (err: any) {
      console.error('Submission error:', err);
      const safeMsg = (err?.message && err.message !== '[object Object]') ? err.message : 'Unable to submit profile. Please try again.';
      toast.error(safeMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyProfilePreviewLink = () => {
    const url = `https://chipng.com/@${cleanUsername}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    toast.success('Copied profile link!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-white/5 bg-[#0B0E14]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                CHIP<span className="text-emerald-500">NG</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Client Onboarding
              </span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href="/login" 
              className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a 
              href="/" 
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-white border border-white/10 transition-all"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {submitted ? (
          <div className="bg-[#0F131C] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Profile Submission Received!
              </h1>
              <p className="text-sm text-neutral-400">
                Thank you, <strong className="text-white">{fullName}</strong>. Your contactless smart business card profile and NFC credentials have been queued for fast-track activation.
              </p>
            </div>

            {/* Profile URL Preview Card */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-2xl max-w-md mx-auto text-left space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Your Reserved Public URL</span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-neutral-900/80 rounded-xl border border-white/5 font-mono text-xs text-white">
                <span className="truncate">https://chipng.com/@{cleanUsername}</span>
                <button
                  onClick={copyProfilePreviewLink}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`/@${cleanUsername}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <span>View Profile Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-white/10 text-neutral-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
              >
                Submit Another Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero App Required • Sub-10ms Contactless Response</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Setup Your CHIP NG Smart Profile
              </h1>
              <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
                Complete this official onboarding form to have your public digital profile, vCard, QR code, and contactless NFC chip programmed by the CHIP NG engineering team.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: Personal & Identity */}
              <div className="bg-[#0F131C] border border-white/5 rounded-3xl p-5 sm:p-7 space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <User className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      1. Executive Identity
                    </h2>
                    <p className="text-[11px] text-neutral-400">The primary details engraved and shown on your card.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Victor Dennis"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. victor@company.com"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Desired Username / Handle
                    </label>
                    <div className="flex items-center px-3 bg-neutral-900/90 border border-white/10 rounded-xl focus-within:border-emerald-500">
                      <span className="text-xs text-neutral-500 font-mono">chipng.com/@</span>
                      <input
                        type="text"
                        value={desiredUsername}
                        onChange={e => setDesiredUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder={cleanUsername}
                        className="w-full px-2 py-2.5 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Professional Headline / Job Title
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      placeholder="e.g. Founder & Managing Director | Makro Global"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Executive Bio / About You
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Brief 2-3 sentence overview of what you do, your achievements, or your brand mission."
                    className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center justify-between">
                      <span>Mobile Number (All Countries)</span>
                      <span className="text-[10px] text-emerald-400 font-medium">WhatsApp Enabled</span>
                    </label>
                    <InternationalPhoneInput
                      value={phone}
                      onChange={setPhone}
                      placeholder="e.g. 803 123 4567 or 7911 123456"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Location / City
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. London, UK / New York, USA / Lagos, Nigeria"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Physical Card Selection */}
              <div className="bg-[#0F131C] border border-white/5 rounded-3xl p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      2. Physical NFC Hardware Selection
                    </h2>
                    <p className="text-[11px] text-neutral-400">Choose the card material you would like manufactured and programmed.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {CARD_TIERS.map(tier => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedCardTier(tier.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedCardTier === tier.id
                          ? 'border-emerald-500 bg-emerald-500/[0.06] shadow-lg shadow-emerald-950/20'
                          : 'border-white/10 bg-neutral-900/60 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm text-white">{tier.name}</span>
                          <span className="font-extrabold text-xs text-emerald-400">
                            {tier.priceMinNgn && tier.priceMaxNgn
                              ? `${formatNgn(tier.priceMinNgn)} - ${formatNgn(tier.priceMaxNgn)}`
                              : formatNgn(tier.priceNgn || 0)}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{tier.description}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-semibold">
                        <span className="text-neutral-500">NTAG216 Chip • Zero App</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                          selectedCardTier === tier.id ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-white/20'
                        }`}>
                          {selectedCardTier === tier.id && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Social & Digital Links */}
              <div className="bg-[#0F131C] border border-white/5 rounded-3xl p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      3. Social & Business Links
                    </h2>
                    <p className="text-[11px] text-neutral-400">Added as interactive 1-tap badges on your public bio link.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      WhatsApp (Number or Link)
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="e.g. +1 555 123 4567, +44 7911..., or +234..."
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      LinkedIn URL or Username
                    </label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Instagram Handle or URL
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Twitter / X Handle or URL
                    </label>
                    <input
                      type="text"
                      value={twitter}
                      onChange={e => setTwitter(e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Company Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      Calendly / Booking Link
                    </label>
                    <input
                      type="url"
                      value={bookingLink}
                      onChange={e => setBookingLink(e.target.value)}
                      placeholder="https://calendly.com/..."
                      className="w-full px-4 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/50 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <span>Submitting Profile...</span>
                  ) : (
                    <>
                      <span>Submit Profile & Program Card</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-neutral-500 mt-3 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Protected by 256-bit encryption. Handled securely by CHIP NG Technologies.</span>
                </p>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
