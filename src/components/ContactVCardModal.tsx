import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Smartphone,
  QrCode,
  Globe
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from './Toast';

interface ContactVCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSaveToPhone?: () => void;
  onOpenExchangeModal?: () => void;
}

export const ContactVCardModal: React.FC<ContactVCardModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveToPhone,
  onOpenExchangeModal,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !profile) return null;

  const fullName = profile.full_name || profile.username || 'CHIP NG User';
  const headline = profile.headline || 'Contactless Digital Identity';
  const email = profile.contact_email || profile.email || '';
  const address = profile.address || '';
  const avatarUrl = profile.cover_image_url || 'https://www.chipng.com/chipng_3d_logo.jpg';
  const vcardDirectUrl = `https://www.chipng.com/${encodeURIComponent(profile.username || '')}/vcard`;
  const profileUrl = `https://www.chipng.com/@${encodeURIComponent(profile.username || '')}`;

  // Parse phone numbers
  let phoneNumbers: string[] = [];
  if (profile.phone_number) {
    try {
      const parsed = JSON.parse(profile.phone_number);
      if (Array.isArray(parsed)) phoneNumbers = parsed.filter(Boolean);
      else if (typeof profile.phone_number === 'string') {
        phoneNumbers = profile.phone_number.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    } catch {
      if (typeof profile.phone_number === 'string') {
        phoneNumbers = profile.phone_number.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
  }

  const copyToClipboard = (text: string, key: string, label: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownloadClick = () => {
    setIsDownloading(true);
    try {
      if (onSaveToPhone) {
        onSaveToPhone();
      } else {
        // Direct download trigger
        window.location.href = vcardDirectUrl;
      }
      toast.success(`Saving ${fullName}'s contact to phone...`);
    } catch (e) {
      console.warn('vCard download trigger error:', e);
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${fullName}'s Verified Contact Card`,
      text: `Save ${fullName}'s contact details and vCard via CHIP NG:`,
      url: `${profileUrl}/vcard`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      copyToClipboard(`${profileUrl}/vcard`, 'share', 'Contact card link');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-[#111318] border border-neutral-800 text-white rounded-[32px] p-6 sm:p-8 w-full max-w-md relative shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#76BB08]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#76BB08] animate-pulse" />
            <span>VERIFIED vCARD 3.0</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQr(!showQr)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                showQr 
                  ? 'bg-[#76BB08] text-neutral-950 border-[#76BB08]' 
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-700'
              }`}
              title="Toggle QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              title="Share Contact"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contact Identity Card Preview */}
        {!showQr ? (
          <div className="flex flex-col items-center text-center relative z-10 mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-[#76BB08] p-0.5 shadow-xl bg-neutral-900">
                <img 
                  src={avatarUrl} 
                  alt={fullName}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e: any) => { e.target.src = 'https://www.chipng.com/chipng_3d_logo.jpg'; }}
                />
              </div>
              {profile.is_verified && (
                <div 
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0095f6] text-white flex items-center justify-center shadow-md border-2 border-[#111318]" 
                  title="Verified Contact"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              {fullName}
            </h2>
            <p className="text-sm text-neutral-300 font-medium mt-0.5 line-clamp-1 max-w-xs">
              {headline}
            </p>
            <span className="text-xs font-mono text-[#76BB08] font-bold mt-1">
              @{profile.username || 'chipng'}
            </span>

            {profile.bio && (
              <p className="text-xs text-neutral-400 mt-2.5 max-w-sm line-clamp-2 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center relative z-10 mb-6 py-2">
            <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-[#76BB08] mb-3">
              <QRCodeSVG
                value={`https://chipng.com/${profile.username || ''}/vcard`}
                size={160}
                level="H"
                marginSize={1}
                imageSettings={{
                  src: avatarUrl,
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>
            <p className="text-xs font-bold text-neutral-300">
              Scan with any iPhone or Android camera
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Instantly prompts to save {fullName} to contacts
            </p>
          </div>
        )}

        {/* Contact Details Fields */}
        <div className="space-y-2.5 relative z-10 mb-6">
          {/* Phone Numbers */}
          {phoneNumbers.length > 0 ? (
            phoneNumbers.map((phone, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between gap-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <span className="text-[10px] font-mono uppercase text-neutral-500 block font-semibold">
                      {idx === 0 ? 'Mobile / WhatsApp' : `Phone ${idx + 1}`}
                    </span>
                    <span className="text-sm font-mono font-bold text-neutral-100 truncate block">
                      {phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 transition-colors"
                    title="Open WhatsApp"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(phone, `phone_${idx}`, 'Phone number')}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedKey === `phone_${idx}` ? (
                      <Check className="w-3.5 h-3.5 text-[#76BB08]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl text-xs text-neutral-400 text-center">
              No public direct phone listed. Use email or bio link below.
            </div>
          )}

          {/* Email */}
          {email && (
            <div className="flex items-center justify-between gap-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block font-semibold">
                    Work Email
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-neutral-100 truncate block">
                    {email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`mailto:${email}`}
                  className="p-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 transition-colors"
                  title="Send Email"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => copyToClipboard(email, 'email', 'Email address')}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  {copiedKey === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-[#76BB08]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Office Address / Location */}
          {address && (
            <div className="flex items-center justify-between gap-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 block font-semibold">
                    Office / City
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-neutral-100 truncate block">
                    {address}
                  </span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(address, 'address', 'Address')}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer shrink-0"
                title="Copy Address"
              >
                {copiedKey === 'address' ? (
                  <Check className="w-3.5 h-3.5 text-[#76BB08]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Bio Link */}
          <div className="flex items-center justify-between gap-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#76BB08]/15 text-[#76BB08] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-[10px] font-mono uppercase text-neutral-500 block font-semibold">
                  Official Bio Link
                </span>
                <span className="text-xs sm:text-sm font-mono text-neutral-300 truncate block">
                  chipng.com/@{profile.username}
                </span>
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(profileUrl, 'profile_url', 'Profile URL')}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer shrink-0"
              title="Copy Profile Link"
            >
              {copiedKey === 'profile_url' ? (
                <Check className="w-3.5 h-3.5 text-[#76BB08]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-col gap-2.5 relative z-10">
          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm bg-[#76BB08] hover:bg-[#85d309] text-neutral-950 flex items-center justify-center gap-2 shadow-lg shadow-[#76BB08]/25 hover:shadow-[#76BB08]/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Save Contact to Phonebook (.vcf)</span>
          </button>

          {onOpenExchangeModal && (
            <button
              onClick={() => {
                onClose();
                onOpenExchangeModal();
              }}
              className="w-full py-3 px-5 rounded-2xl font-bold text-xs bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 hover:border-neutral-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Exchange Contact Details (2-Way)</span>
            </button>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-neutral-500 text-center mt-4">
          Natively compatible with Apple Contacts, Google Contacts & Outlook
        </p>
      </div>
    </div>
  );
};
