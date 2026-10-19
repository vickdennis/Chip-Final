import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../App';
import { 
  ExternalLink, 
  Mail, 
  Link as LinkIcon, 
  Share, 
  Globe, 
  Phone, 
  MapPin, 
  UserPlus, 
  X, 
  Copy, 
  QrCode, 
  ShoppingCart, 
  UserCheck, 
  Check, 
  Sparkles, 
  Download 
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { supabase } from '../supabaseClient';
import { SOCIAL_PLATFORMS } from './UserDashboard';
import { SocialMediaIconBadge, SocialIconStyle } from '../components/social/SocialMediaIconBadge';
import { openFlutterwavePayment } from '../utils/flutterwaveClient';
import { QRCodeSVG } from 'qrcode.react';
import BrandLogo from '../components/BrandLogo';
import chipngExactTile from '../assets/images/chipng_exact_tile.png';
import { LeadExchangeModal } from '../components/LeadExchangeModal';
import { ContactVCardModal } from '../components/ContactVCardModal';
import { toast } from '../components/Toast';
import { recordProfileView, recordProfileClick as trackTelemetryClick } from '../utils/telemetryClient';
import { Helmet } from 'react-helmet-async';

export default function PublicProfileView({ onNavigate, username, autoDownloadVCard }: { onNavigate?: (view: ViewState) => void, username?: string | null, autoDownloadVCard?: boolean }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [qrMode, setQrMode] = useState<'none' | 'bio' | 'vcard'>('none');
  const [isVcardCopied, setIsVcardCopied] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isVCardModalOpen, setIsVCardModalOpen] = useState<boolean>(Boolean(autoDownloadVCard));
  const [isInlineQrOpen, setIsInlineQrOpen] = useState(false);
  const [inlineCopiedKey, setInlineCopiedKey] = useState<string | null>(null);

  const copyInlineText = (text: string, key: string, label: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      setInlineCopiedKey(key);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setInlineCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  useEffect(() => {
    if (autoDownloadVCard && profile) {
      setIsVCardModalOpen(true);
      if (!hasDownloaded) {
        setHasDownloaded(true);
        setTimeout(() => {
          downloadVCard(false);
        }, 600);
      }
    }
  }, [profile, autoDownloadVCard, hasDownloaded]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let targetUserId = null;
      let profileData = null;

      // Determine effective username from prop or window URL path
      let effectiveUsername = username;
      if (!effectiveUsername && typeof window !== 'undefined') {
        const rawPath = window.location.pathname.replace(/\/$/, '');
        const segment = rawPath.replace(/^\/+/, '').split('/')[0];
        if (segment && !['login', 'dashboard', 'admin', 'enterprise', 'blog', 'buy-card', 'contact', 'about', 'company', 'updates'].includes(segment)) {
          effectiveUsername = segment;
        }
      }

      if (!effectiveUsername || effectiveUsername === 'vcard') {
        effectiveUsername = 'chipng';
      }

      if (effectiveUsername) {
        let cleanUsername = decodeURIComponent(effectiveUsername).trim();
        if (cleanUsername.endsWith('/vcard')) cleanUsername = cleanUsername.replace(/\/vcard$/, '');
        if (cleanUsername.startsWith('@')) cleanUsername = cleanUsername.slice(1);
        if (!cleanUsername || cleanUsername === 'vcard') cleanUsername = 'chipng';

        console.log("Fetching profile for cleanUsername:", cleanUsername);
        
        // 1. Try exact match
        let { data, error } = await supabase.from('profiles').select('*').eq('username', cleanUsername).maybeSingle();
        
        // 2. Try case-insensitive ilike match
        if (!data) {
          const res = await supabase.from('profiles').select('*').ilike('username', cleanUsername).maybeSingle();
          data = res.data;
          error = res.error;
        }

        // 3. Try lookup across candidates in case of slight casing or spacing differences
        if (!data) {
          const { data: allCandidates } = await supabase.from('profiles').select('*').limit(200);
          if (allCandidates) {
            const found = allCandidates.find(p => 
              p.username && p.username.toLowerCase().trim() === cleanUsername.toLowerCase().trim()
            );
            if (found) data = found;
          }
        }

        if (!data) {
          console.error("Public profile not found in Supabase:", cleanUsername);
          setError('User not found');
          setLoading(false);
          return;
        }

        profileData = data;
        targetUserId = data.id;
      } else {
        // Fetch own profile
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (onNavigate) onNavigate('login');
          return;
        }
        targetUserId = user.id;
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (!data) {
          setError('User profile not initialized');
          setLoading(false);
          return;
        }
        profileData = { ...data, email: user.email };
      }

      // Set profile immediately so user header renders reliably
      setProfile(profileData);

      // Fetch links, socials, products in parallel with error isolation
      try {
        const [linksRes, socialsRes, prodsRes] = await Promise.allSettled([
          supabase.from('links').select('*').eq('profile_id', targetUserId).order('position'),
          supabase.from('social_links').select('*').eq('profile_id', targetUserId),
          supabase.from('products').select('*').eq('profile_id', targetUserId).order('created_at', { ascending: false }),
        ]);

        if (linksRes.status === 'fulfilled' && linksRes.value.data) {
          setLinks(linksRes.value.data);
        }
        if (socialsRes.status === 'fulfilled' && socialsRes.value.data) {
          setSocialLinks(socialsRes.value.data);
        }
        if (prodsRes.status === 'fulfilled' && prodsRes.value.data) {
          setProducts(prodsRes.value.data);
        }
      } catch (e) {
        console.warn('Secondary profile data fetch non-fatal error:', e);
      }

      // Enterprise brand fetch (isolated)
      if (profileData.enterprise_id) {
        try {
          const { data: ent } = await supabase.from('enterprises').select('*').eq('id', profileData.enterprise_id).maybeSingle();
          if (ent) {
            setProfile((prev: any) => (prev ? { ...prev, enterprise: ent } : prev));
          }
        } catch (e) {}
      }

      // View analytics tracking (fire & forget, non-blocking, locally and remotely synced)
      if (effectiveUsername && targetUserId) {
        try {
          const params = new URLSearchParams(window.location.search);
          const rawSource = (params.get('source') || params.get('src') || '').toLowerCase();
          let source = 'web';

          if (rawSource === 'nfc' || params.get('tap') === '1' || params.get('nfc') === '1' || params.get('t') === 'nfc') {
            source = 'nfc';
          } else if (rawSource === 'qr' || params.get('qr') === '1' || params.get('scan') === '1' || params.get('s') === 'qr') {
            source = 'qr';
          } else if (rawSource) {
            source = rawSource;
          }

          recordProfileView(targetUserId, effectiveUsername, source);
        } catch (e) {}
      }

    } catch (err: any) {
      console.error('fetchData error:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getContrastColor = (hex: string) => {
    if (!hex) return 'white';
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };
  
  const layout = profile?.theme || 'default';
  const customBg = profile?.bg_color || '#09090b';
  const customText = profile?.bg_color ? getContrastColor(profile.bg_color) : '#ffffff';
  const bgStyle = { backgroundColor: customBg };
  const textStyle = { color: customText };
  const cardBgClass = customText === '#000000' ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20';
  const cardBorderClass = customText === '#000000' ? 'border-black/10' : 'border-white/10';

  if (loading) {
    return (
      <div className="dark min-h-screen w-full flex items-center justify-center bg-[#09090b] text-white p-0 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" 
        />
        
        <div className="relative z-10 flex flex-col items-center gap-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: 'easeOut' }}
             className="relative"
          >
            <motion.div 
              animate={{ 
                 boxShadow: ['0px 0px 0px rgba(255,255,255,0)', '0px 0px 50px rgba(255,255,255,0.12)', '0px 0px 0px rgba(255,255,255,0)']
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 border border-white/15 bg-white/10 p-2.5 rounded-[2.2rem] backdrop-blur-2xl flex items-center justify-center overflow-hidden shadow-2xl"
            >
               <motion.img 
                  animate={{ scale: [0.96, 1.04, 0.96] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  src={chipngExactTile} 
                  alt="CHIPNG 3D Logo" 
                  className="w-full h-full object-contain filter drop-shadow-2xl"
               />
            </motion.div>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 1 }}
             className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden"
          >
             <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
             />
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="dark min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center text-center p-6">
        <h1 className="font-display text-4xl font-black mb-2 text-current">Profile Not Found</h1>
        <p className="font-sans text-current/40 dark:text-white/40 mb-6">We couldn't find a user with this username.</p>
        <button 
          onClick={() => {
            window.location.href = '/';
          }} 
          className="px-6 py-2 bg-gray-50 dark:bg-black text-current font-mono text-[13px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 dark:bg-black/90 transition-colors"
        >
          Create your own chip.ng
        </button>
      </div>
    );
  }

  const coverUrl = profile?.cover_image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDJdZfBp08ThhJkbous1qpSV80_ElD1o9obSt5AOKNYgq32sqShFsY95dnIhjpFH1wxwvT4gzXvFAZ_IpKEl5CpME0qIY6tV53q3N41VoqzAapRX3JGVjV8t0xHFVojZGp54nQM3lEGjPU5Ju0AxqQw_8APH-7H5hG-vaOeYzXj3cEc4Wj1y2Dlzf4vx24Nocz6VRMn5bSHI36NCSzRpkwk1SSi4ZCVsbVNmmrSByG2hDIeGzM3OSF92uHwBeAQqdzi0PE4r_i8nQQ";

  const totalFollowers = socialLinks.reduce((sum, link) => sum + (link.follower_count || 0), 0);
  const enterpriseColor = profile?.enterprise?.brand_color;

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const recordClick = (linkTitle: string, linkUrl?: string, clickType: string = 'link', linkId?: string) => {
    const targetId = profile?.id;
    if (!targetId) return;
    try {
      trackTelemetryClick(targetId, linkTitle, linkUrl, clickType, linkId, profile?.username);
    } catch(e) {}
  };

  const downloadVCard = (shouldOpenModal: boolean = false) => {
    if (!profile) return;
    if (shouldOpenModal) {
      setIsVCardModalOpen(true);
    }
    recordClick('Saved Contact to Phone (vCard)', undefined, 'vcard');

    const fullName = profile.full_name || profile.username || 'CHIP NG User';
    const names = fullName.trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

    let phonesStr = '';
    if (profile.phone_number) {
      let arr = [];
      try {
        const parsed = JSON.parse(profile.phone_number);
        if (Array.isArray(parsed)) arr = parsed;
        else arr = [profile.phone_number];
      } catch {
        arr = String(profile.phone_number).split(',').map((s: string) => s.trim());
      }
      arr = arr.filter(Boolean);
      phonesStr = arr.map((p: string) => `\nTEL;TYPE=CELL,VOICE;VALUE=uri:tel:${p.replace(/[^0-9+]/g, '')}\nTEL;TYPE=CELL:${p}`).join('');
    }

    const photoStr = profile.cover_image_url ? `\nPHOTO;VALUE=URI:${profile.cover_image_url}` : '';

    const vcard = `BEGIN:VCARD
VERSION:3.0
PRODID:-//CHIP NG Technologies//Contactless Smart Card vCard 3.0//EN
N:${lastName};${firstName};;;
FN:${fullName}
TITLE:${profile.headline || ''}
ORG:CHIP NG Network
EMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email || ''}${phonesStr}
ADR;TYPE=WORK:;;${profile.address || ''};;;;
URL;TYPE=WORK:https://www.chipng.com/@${profile.username}${photoStr}
REV:${new Date().toISOString()}
END:VCARD`;

    try {
      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `${profile.username || 'contact'}.vcf`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Saved ${fullName}'s contact to phonebook (.vcf)`);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      console.warn('Client blob vcard download failed, falling back to server URL:', e);
      try {
        const serverVCardUrl = `/api/vcard/${encodeURIComponent(profile.username || profile.id)}`;
        window.location.href = serverVCardUrl;
      } catch (err) {}
    }
  };

  const getFontFamily = () => {
    switch (profile?.enterprise?.brand_font) {
      case 'mono': return '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
      case 'serif': return '"Playfair Display", ui-serif, Georgia, serif';
      default: return '"Hanken Grotesk", "Inter", sans-serif'; // Revert to previous default font on public profile
    }
  };

  const renderSocialLinks = () => {
    const style = (profile?.social_links_style as SocialIconStyle) || 'color-circle';

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4 px-6 z-10 relative">
        {socialLinks.map((link, i) => (
          <SocialMediaIconBadge
            key={i}
            platform={link.platform}
            style={style}
            size="md"
            href={link.url}
            brandColorOverride={profile?.enterprise?.brand_color}
            onClick={() => recordClick(link.platform || 'Social Link', link.url, 'social', link.id)}
            title={link.platform}
            showHoverEffect={true}
          />
        ))}
      </div>
    );
  };

  


  

  const profileFont = getFontFamily();

  const ogTitle = profile?.full_name 
    ? `${profile.full_name} (@${profile.username}) | Contactless Digital Card & Bio | CHIP NG`
    : 'CHIP NG — Contactless Smart Business Card Profile';
  const ogDesc = profile?.headline 
    ? `${profile.headline}. Connect with ${profile.full_name || profile.username} with one tap on CHIP NG.`
    : 'View verified contactless smart card profile, vCard, social links, and portfolio on CHIP NG.';
  const rawCover = profile?.cover_image_url;
  const ogImageUrl = rawCover 
    ? `https://www.chipng.com/api/cover/${encodeURIComponent(profile.username)}`
    : 'https://www.chipng.com/chipng_3d_logo.jpg';
  const canonicalUrl = profile?.username 
    ? `https://www.chipng.com/@${profile.username}` 
    : (typeof window !== 'undefined' ? window.location.href : 'https://www.chipng.com');

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDesc} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook / WhatsApp / LinkedIn / iMessage */}
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="CHIP NG" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:secure_url" content={ogImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${profile?.full_name || profile?.username || 'User'} Cover Image`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@chipng_nfc" />
        <meta name="twitter:creator" content="@chipng_nfc" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content={`${profile?.full_name || profile?.username || 'User'} Cover Image`} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:image" content={ogImageUrl} />
      </Helmet>

      <div 
        className="dark min-h-screen w-full flex items-center justify-center bg-[#09090b] text-current p-0 sm:p-6 md:p-8 relative overflow-x-hidden" 
        style={{ 
          fontFamily: profileFont,
          ['--font-sans' as any]: profileFont,
          ['--font-display' as any]: profileFont
        }}
      >
      {/* Ambient glass blur backdrop on desktop screens matching current theme background */}
      <div className="absolute inset-0 pointer-events-none filter blur-[140px] opacity-25 hidden sm:block">
        <div className={`w-full h-full ${''}`} style={bgStyle}></div>
      </div>
      
      {/* 9:16 Portrait Viewport Frame on Desktop, full screen on mobile */}
      <div 
        className={`w-full min-h-screen sm:min-h-0 sm:h-[780px] md:h-[820px] sm:w-[420px] md:w-[450px] sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.85)] sm:border sm:border-neutral-800/80 overflow-y-auto scrollbar-hide relative flex flex-col ${''} ${''}`} 
        style={{ backgroundColor: '#09090b', color: '#ffffff' }}
      >
        {/* Theme Relating Animation Layer */}
        
        {/* Buttons at Top */}
        <div className="absolute top-4 w-full flex justify-between items-start px-4 z-50 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => setIsBioModalOpen(true)} 
              className={`bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] uppercase font-bold px-4 py-2 rounded-full shadow-lg transition-colors flex items-center gap-2`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Bio Link
            </button>
            {!username && (
              <button 
                onClick={() => onNavigate && onNavigate('user-dashboard')} 
                className={`bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors`}
               >
                Dashboard
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsExchangeModalOpen(true)}
              className={`px-3.5 py-2 ${cardBgClass} text-current rounded-full shadow-lg flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all pointer-events-auto text-xs font-bold`}
              title="Exchange Contact"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Connect</span>
            </button>
            <button 
              onClick={() => {
                setIsVCardModalOpen(true);
                downloadVCard(false);
              }}
              className={`w-10 h-10 ${cardBgClass} text-current rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all pointer-events-auto cursor-pointer`}
              title="View & Save Contact (vCard)"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bio Link Modal */}
        {isBioModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-gray-50 dark:bg-black/80 backdrop-blur-sm sm:pb-4 pb-12">
            <div className="bg-[#1a1a1a] w-full max-w-[400px] rounded-[32px] overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-[#333]">
              <button 
                onClick={() => setIsBioModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-black/50 text-current hover:bg-gray-50 dark:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-black/10 dark:border-white/10 relative">
                   {qrMode !== 'none' ? (
    <div className="w-full h-full bg-white flex items-center justify-center p-2">
      <QRCodeSVG level="H" 
        value={qrMode === 'bio' ? `https://chipng.com/${profile.username || ''}?source=qr` : `https://chipng.com/${profile.username || ''}/vcard`}
        size={100} marginSize={1}
        imageSettings={{
          src: profile?.cover_image_url || coverUrl,
          x: undefined,
          y: undefined,
          height: 30,
          width: 30,
          excavate: true,
        }}
      />
    </div>
  ) : (
    <img src={profile?.cover_image_url || coverUrl} alt="Cover" className="w-full h-full object-cover" />
  )}
                </div>
                
                <h2 className="text-2xl font-bold text-current mb-2 text-center">This is your<br/>ChipNG bio link!</h2>
                <p className="opacity-60 text-center text-[13px] mb-6 max-w-[280px]">
                  Share your contactless profile with your custom cover image across WhatsApp, Twitter/X, and LinkedIn.
                </p>

                {/* Live Social Card Preview with User Cover Image */}
                <div className="w-full mb-5 rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#151821] text-left shadow-sm">
                  <div className="relative w-full h-36 bg-neutral-900 overflow-hidden">
                    <img 
                      src={profile?.cover_image_url || 'https://www.chipng.com/chipng_3d_logo.jpg'} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                      Shared Link Preview
                    </div>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-[10px] font-mono uppercase text-neutral-400">chipng.com/@{profile.username}</div>
                    <div className="font-bold text-xs truncate text-neutral-900 dark:text-white">
                      {profile.full_name || `@${profile.username}`} | CHIP NG Contactless Profile
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1">
                      {profile.headline || 'Contactless Smart Business Card & Dynamic Link-in-Bio Nigeria'}
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-50 dark:bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className={`w-6 h-6 rounded-2xl ${cardBgClass} text-current flex items-center justify-center font-bold text-[10px] shrink-0`}>
                       NG
                     </div>
                     <span className="text-current text-[13px] truncate font-medium">chipng.com/@{profile.username}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://www.chipng.com/@${profile.username}`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className={`px-4 py-2 ${cardBgClass} hover:bg-[#3a3a3a] text-current rounded-xl text-[13px] font-bold transition-colors shadow-sm cursor-pointer`}
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="w-full bg-gray-50 dark:bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className={`w-6 h-6 rounded-2xl ${cardBgClass} text-current flex items-center justify-center font-bold text-[10px] shrink-0`}>
                       VC
                     </div>
                     <span className="text-current text-[13px] truncate font-medium">chipng.com/{profile.username}/vcard</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://www.chipng.com/${profile.username}/vcard`);
                      setIsVcardCopied(true);
                      setTimeout(() => setIsVcardCopied(false), 2000);
                    }}
                    className={`px-4 py-2 ${cardBgClass} hover:bg-[#3a3a3a] text-current rounded-xl text-[13px] font-bold transition-colors shadow-sm cursor-pointer`}
                  >
                    {isVcardCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Instant 1-Click Social Sharing */}
                <div className="grid grid-cols-3 gap-2 w-full mb-4">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Connect with ${profile.full_name || profile.username} on CHIP NG: https://www.chipng.com/@${profile.username}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Connect with ${profile.full_name || profile.username} on @chipng_nfc:`)}&url=${encodeURIComponent(`https://www.chipng.com/@${profile.username}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>X / Twitter</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.chipng.com/@${profile.username}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>LinkedIn</span>
                  </a>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setQrMode(qrMode === 'bio' ? 'none' : 'bio')}
                      className={`flex-1 py-3.5 rounded-2xl text-current font-bold text-[13px] transition-transform hover:-translate-y-0.5 active:translate-y-0 ${cardBgClass} hover:bg-[#3a3a3a] shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer`}
                    >
                      <QrCode className="w-5 h-5" /> {qrMode === 'bio' ? 'Hide' : 'Bio QR'}
                    </button>
                    
                    <button 
                      onClick={() => setQrMode(qrMode === 'vcard' ? 'none' : 'vcard')}
                      className={`flex-1 py-3.5 rounded-2xl text-current font-bold text-[13px] transition-transform hover:-translate-y-0.5 active:translate-y-0 ${cardBgClass} hover:bg-[#3a3a3a] shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer`}
                    >
                      <QrCode className="w-5 h-5" /> {qrMode === 'vcard' ? 'Hide' : 'Contact QR'}
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const shareUrl = `https://www.chipng.com/@${profile.username}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `${profile.full_name}'s Contactless Profile & Card | CHIP NG`,
                          text: `Connect with ${profile.full_name} on CHIP NG:`,
                          url: shareUrl
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Profile link copied to clipboard!");
                      }
                    }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#4776e6] to-[#8e54e9] shadow-[0_0_20px_rgba(71,118,230,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share className="w-4 h-4" /> SHARE BIO LINK
                  </button>

                  <button 
                    onClick={() => setIsBioModalOpen(false)}
                    className="w-full py-3 opacity-60 font-bold text-[14px] hover:text-current transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow pb-10 relative z-10 flex flex-col">
          {/* Header Section */}
          {layout === 'minimal' ? (
          <section className="relative w-full flex flex-col items-center pt-16 pb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-current/10 mb-4">
              <img src={profile?.cover_image_url || coverUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-black text-current flex items-center gap-2 px-4 text-center">
                {profile?.full_name || "[Data Placeholder]"}
                {profile?.is_verified && (
                  <svg aria-label="Verified" className="w-[16px] h-[16px] text-[#0095f6]" fill="currentColor" viewBox="0 0 40 40">
                    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                  </svg>
                )}
            </h1>
            <p className="font-sans text-[14px] opacity-70 font-medium mb-1 px-6">{profile?.headline || ""}</p>
            <p className="font-mono text-[13px] opacity-60 font-bold mb-3 px-6">@{profile?.username || "username"}</p>
          </section>
        ) : layout === 'split' ? (
          <section className="relative w-full flex flex-row items-center pt-16 pb-4 px-6 gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-current/10 shrink-0">
              <img src={profile?.cover_image_url || coverUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="font-display text-xl font-black text-current flex items-center gap-2">
                  {profile?.full_name || "[Data Placeholder]"}
                  {profile?.is_verified && (
                    <svg aria-label="Verified" className="w-[14px] h-[14px] text-[#0095f6]" fill="currentColor" viewBox="0 0 40 40">
                      <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                    </svg>
                  )}
              </h1>
              <p className="font-sans text-[13px] opacity-70 font-medium mb-1">{profile?.headline || ""}</p>
              <p className="font-mono text-[12px] opacity-60 font-bold mb-2">@{profile?.username || "username"}</p>
            </div>
          </section>
        ) : (
          <section className="relative w-full aspect-square md:aspect-[4/5] bg-black/10">
            <img 
              src={coverUrl}
              alt={profile?.full_name || "Profile"} 
              className="w-full h-full object-cover object-top opacity-85"
            />
            {/* Smooth fade container at top base */}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #09090b 0%, #09090b66 50%, transparent 100%)` }}></div>
            
            <div className="absolute bottom-0 w-full left-0 flex flex-col items-center text-center pb-2">
              <h1 className="font-display text-[32px] font-black text-current leading-tight mb-2 flex items-center gap-2 justify-center flex-wrap px-4">
                {profile?.full_name || "[Data Placeholder]"}
                {profile?.is_verified && (
                  <svg aria-label="Verified" className="w-[18px] h-[18px] lg:w-5 lg:h-5 text-[#0095f6] flex-shrink-0" fill="currentColor" role="img" viewBox="0 0 40 40">
                    <title>Verified</title>
                    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                  </svg>
                )}
              </h1>
              <p className="font-sans text-[14px] opacity-60 font-medium mb-1 px-6">{profile?.headline || ""}</p>
              <p className="font-mono text-[13px] opacity-60 font-bold mb-3 px-6">@{profile?.username || "username"}</p>
              
              {profile?.show_total_followers && totalFollowers > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full mb-2">
                  <Globe className="w-3.5 h-3.5 opacity-60" />
                  <span className="font-mono text-[11px] font-bold text-current uppercase tracking-wider">{formatFollowers(totalFollowers)} Total Followers</span>
                </div>
              )}
            </div>
          </section>)} {renderSocialLinks()}

          <section className="px-6 flex flex-col items-center pt-8">
            <div className="flex flex-col items-center mb-10 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#333] to-transparent my-6"></div>
              
              {profile?.bio && (
                <div className="mb-4 text-center max-w-sm">
                  <p className="font-sans text-[14px] opacity-80 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </section>

          <section className="w-full flex-1 flex flex-col items-center pt-8 pb-8 px-6 rounded-t-[40px] z-10" style={{ ...bgStyle, ...textStyle }}>
            {/* 2-Way Contact Exchange & vCard Download Action Bar */}
            <div className="w-full grid grid-cols-2 gap-2.5 mb-5">
              <button
                onClick={() => setIsExchangeModalOpen(true)}
                className={`py-3.5 px-4 rounded-2xl ${cardBgClass} text-current font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer`}
              >
                <UserCheck className="w-4 h-4 text-[#3b82f6]" style={{ color: enterpriseColor || undefined }} />
                <span>Exchange Contact</span>
              </button>

              <button
                onClick={() => {
                  downloadVCard(true);
                }}
                className={`py-3.5 px-4 rounded-2xl ${cardBgClass} text-current font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer`}
              >
                <UserPlus className="w-4 h-4 text-emerald-500" />
                <span>Save to Phone</span>
              </button>
            </div>

            {/* Dedicated Interactive Contact vCard Showcase Card */}
            <div 
              id="vcard-section"
              className={`w-full rounded-3xl p-5 sm:p-6 mb-6 transition-all ${
                autoDownloadVCard 
                  ? 'bg-[#12141a] border-2 border-[#76BB08] shadow-[0_0_30px_rgba(118,187,8,0.25)] ring-1 ring-[#76BB08]' 
                  : `${cardBgClass} border border-white/10 shadow-lg`
              }`}
            >
              {/* vCard Badge Header */}
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#76BB08] animate-pulse" />
                  <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#76BB08]">
                    Verified Contact vCard 3.0
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsInlineQrOpen(!isInlineQrOpen)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-current text-xs transition-colors cursor-pointer"
                    title="Toggle QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVCardModalOpen(true)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-current text-xs transition-colors cursor-pointer"
                    title="Open Fullscreen Card"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {autoDownloadVCard && (
                <div className="mb-4 px-3 py-2 rounded-xl bg-[#76BB08]/15 border border-[#76BB08]/30 flex items-center gap-2 text-xs font-bold text-[#76BB08]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Direct vCard Route Active • Save to Phonebook or Connect Below</span>
                </div>
              )}

              {/* Identity Row */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#76BB08]/60 p-0.5 bg-neutral-900 shrink-0 shadow-md">
                  <img 
                    src={profile?.cover_image_url || coverUrl} 
                    alt={profile?.full_name || 'Contact'} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-extrabold text-base sm:text-lg text-current truncate leading-tight">
                      {profile?.full_name || profile?.username}
                    </h3>
                    {profile?.is_verified && (
                      <span className="w-4 h-4 rounded-full bg-[#0095f6] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs opacity-75 truncate mt-0.5">
                    {profile?.headline || 'Contactless Smart Business Card'}
                  </p>
                  <span className="font-mono text-[11px] text-[#76BB08] font-bold">
                    @{profile?.username}
                  </span>
                </div>
              </div>

              {/* Inline QR Code View (collapsible) */}
              {isInlineQrOpen && (
                <div className="p-4 bg-white rounded-2xl mb-4 flex flex-col items-center justify-center animate-in fade-in duration-200 shadow-md">
                  <QRCodeSVG
                    value={`https://chipng.com/${profile?.username || ''}/vcard`}
                    size={160}
                    level="H"
                    marginSize={1}
                    imageSettings={{
                      src: profile?.cover_image_url || chipngExactTile,
                      x: undefined,
                      y: undefined,
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                  <p className="text-[11px] font-bold text-neutral-800 mt-2">
                    Scan with camera to instantly save contact
                  </p>
                </div>
              )}

              {/* Contact Detail Rows */}
              <div className="space-y-2 mb-4 text-left">
                {/* Phones */}
                {(() => {
                  if (!profile?.phone_number) return null;
                  let phones: string[] = [];
                  try {
                    const parsed = JSON.parse(profile.phone_number);
                    if (Array.isArray(parsed)) phones = parsed;
                    else phones = [profile.phone_number];
                  } catch {
                    phones = String(profile.phone_number).split(',').map((s: string) => s.trim());
                  }
                  phones = phones.filter(Boolean);
                  if (phones.length === 0) return null;

                  return phones.map((phone, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/20 dark:bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase tracking-wider opacity-60 block font-semibold">
                            {idx === 0 ? 'Mobile / WhatsApp' : `Phone ${idx + 1}`}
                          </span>
                          <span className="font-mono font-bold truncate block text-current">
                            {phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => recordClick('WhatsApp Chat', phone, 'whatsapp')}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                          title="Chat on WhatsApp"
                        >
                          <FaWhatsapp className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                          onClick={() => recordClick('Phone Call', phone, 'phone')}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-current transition-colors"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => copyInlineText(phone, `phone_${idx}`, 'Phone')}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-current transition-colors cursor-pointer"
                          title="Copy"
                        >
                          {inlineCopiedKey === `phone_${idx}` ? <Check className="w-3.5 h-3.5 text-[#76BB08]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ));
                })()}

                {/* Email */}
                {(profile?.contact_email || profile?.email) && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/20 dark:bg-white/5 border border-white/5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider opacity-60 block font-semibold">
                          Work Email
                        </span>
                        <span className="font-sans font-medium truncate block text-current">
                          {profile?.contact_email || profile?.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={`mailto:${profile?.contact_email || profile?.email}`}
                        onClick={() => recordClick('Email Send', profile?.contact_email || profile?.email, 'email')}
                        className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                        title="Send Email"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => copyInlineText(profile?.contact_email || profile?.email, 'email', 'Email')}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-current transition-colors cursor-pointer"
                        title="Copy"
                      >
                        {inlineCopiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-[#76BB08]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Address */}
                {profile?.address && (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/20 dark:bg-white/5 border border-white/5 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider opacity-60 block font-semibold">
                          Office / City
                        </span>
                        <span className="font-sans font-medium truncate block text-current">
                          {profile?.address}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyInlineText(profile?.address, 'address', 'Address')}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-current transition-colors cursor-pointer shrink-0"
                      title="Copy Address"
                    >
                      {inlineCopiedKey === 'address' ? <Check className="w-3.5 h-3.5 text-[#76BB08]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Main Save to Phonebook Action */}
              <button
                type="button"
                onClick={() => downloadVCard(false)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#76BB08] hover:bg-[#85d309] text-neutral-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#76BB08]/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Save Contact to Phonebook (.vcf)</span>
              </button>
              
              <div className="flex items-center justify-between mt-3 pt-2 text-[10px] opacity-60">
                <span>NFC & QR Sync Ready</span>
                <button 
                  type="button"
                  onClick={() => setIsVCardModalOpen(true)}
                  className="hover:underline font-bold text-current cursor-pointer"
                >
                  View Details & Share →
                </button>
              </div>
            </div>

            {/* Contact/Connect Action Strip */}
            <div className="w-full flex flex-col gap-3 mb-8">
              <a href={`mailto:${profile?.contact_email || profile?.email || 'hello@example.com'}`} onClick={() => recordClick('Email Connect', profile?.contact_email || profile?.email, 'email')} className={`w-full ${cardBgClass} rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors`}>
                <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                  <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                    {profile?.contact_email || profile?.email || "your@email.com"}
                  </span>
                </div>
                <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                  <span className="text-current font-sans text-[16px] font-bold tracking-tight">Connect with</span>
                  <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                </div>
              </a>
              {(() => {
                if (!profile?.phone_number) return null;
                let arr = [];
                try {
                  const parsed = JSON.parse(profile.phone_number);
                  if (Array.isArray(parsed)) arr = parsed;
                  else if (profile.phone_number.includes(',')) arr = profile.phone_number.split(',').map(s=>s.trim());
                  else arr = [profile.phone_number];
                } catch(e) {
                  if (profile.phone_number.includes(',')) arr = profile.phone_number.split(',').map(s=>s.trim());
                  else arr = [profile.phone_number];
                }
                arr = arr.filter(Boolean);
                if (arr.length === 0) return null;

                return arr.map((phone, idx) => (
                  <a key={idx} href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={() => recordClick('WhatsApp Connect', phone, 'whatsapp')} className={`w-full ${cardBgClass} rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 dark:hover:bg-black/60 transition-colors mt-2`}>
                    <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                      <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                        {phone}
                      </span>
                    </div>
                    <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                      <span className="text-current font-sans text-[16px] font-bold tracking-tight">WhatsApp connect</span>
                      <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                    </div>
                  </a>
                ));
              })()}
            </div>

            {(() => {
              const galleryImages = links.filter(l => l.size === 'GalleryImage');
              if (galleryImages.length === 0) return null;
              
              const duplicatedGallery = [
                ...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages,
                ...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages
              ];

              return (
                <div className="w-full mb-8 flex flex-col gap-3 overflow-hidden relative group">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1 px-1">Gallery</span>
                  <style>{`
                    @keyframes marquee-gallery {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-10%); }
                    }
                    .animate-marquee-gallery {
                      display: flex;
                      width: max-content;
                      animation: marquee-gallery 20s linear infinite;
                    }
                    .group:hover .animate-marquee-gallery {
                      animation-play-state: paused;
                    }
                  `}</style>
                  <div className="w-full overflow-hidden">
                    <div className="animate-marquee-gallery gap-3 py-1 px-1">
                      {duplicatedGallery.map((img, idx) => (
                        <div key={idx} className="aspect-square w-[100px] sm:w-[120px] md:w-[140px] shrink-0 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-lg relative bg-gray-50 dark:bg-black/20">
                          <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {profile?.address && (
              <div className={`w-full ${cardBgClass} ${cardBorderClass} border p-4 flex items-center gap-4 rounded-xl mb-8`}>
                <div className={`w-10 h-10 ${cardBgClass} text-current rounded-lg flex items-center justify-center shrink-0`} style={{ backgroundColor: enterpriseColor || undefined }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 font-bold">Location</span>
                  <span className="font-sans text-[14px] text-current font-semibold">{profile.address}</span>
                </div>
              </div>
            )}

            {profile?.calendar_link && profile?.show_availability !== false && (
              <a 
                href={profile.calendar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`w-full ${cardBgClass} text-current p-4 flex items-center justify-between rounded-xl cursor-pointer hover:${cardBgClass} transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
              >
                 <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                     <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 font-bold">{profile.booking_provider || 'Book a session'}</span>
                     <span className="font-sans text-[15px] font-bold flex items-center gap-2">View Availability</span>
                   </div>
                 </div>
                 <ExternalLink className="w-5 h-5 text-current" />
              </a>
            )}

            {products.length > 0 && (
              <div className={`w-full flex ${cardBgClass} ${cardBorderClass} border p-1 rounded-full mb-6`}>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`flex-1 py-2 rounded-full font-mono text-[12px] font-bold transition-colors ${activeTab === 'links' ? 'bg-white dark:bg-[#1a1c1c] text-current' : 'opacity-60 hover:text-current'}`}
                >
                  Links
                </button>
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`flex-1 py-2 rounded-full font-mono text-[12px] font-bold transition-colors ${activeTab === 'shop' ? 'bg-white dark:bg-[#1a1c1c] text-current' : 'opacity-60 hover:text-current'}`}
                >
                  Products
                </button>
              </div>
            )}

            {activeTab === 'links' ? (
              <div className={`w-full ${layout === 'bento' ? 'grid grid-cols-2 gap-3' : layout === 'carousel' ? 'flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4' : 'flex flex-col gap-3'}`}>
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest opacity-60 mb-2 px-1">Featured Links</span>
                {links.filter(l => l.size !== 'GalleryImage').length > 0 ? links.filter(l => l.size !== 'GalleryImage').map((link, i) => {
                  const href = link.url?.startsWith('http') ? link.url : `https://${link.url}`;
                  let iconUrl = link.image_url;
                  if (!iconUrl && link.use_link_icon && link.url) {
                    try { iconUrl = `https://icon.horse/icon/${(link.url.replace(/^https?:\/\//, '').split('/')[0])}`; } catch(e){}
                  }
                  
                  if (link.size === 'Big') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         onClick={() => recordClick(link.label, href, 'link', link.id)}
                         className="relative w-full aspect-[4/3] sm:aspect-[2/1] rounded-2xl overflow-hidden flex flex-col items-center justify-center p-4 group border border-black/10 dark:border-white/10 hover:border-black/30 dark:border-white/30 transition-all shadow-md"
                         style={{ 
                           background: iconUrl ? `url('${iconUrl}') center/cover` : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                         }}>
                         {iconUrl && <div className="absolute inset-0 bg-gray-50 dark:bg-black/40 group-hover:bg-gray-50 dark:bg-black/30 transition-colors z-0"></div>}
                        <div className="absolute inset-0 bg-gray-50 dark:bg-black/20 group-hover:bg-gray-50 dark:bg-black/10 transition-colors z-0"></div>
                        
                        {coverUrl && (
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-black/50 z-10 shadow-lg overflow-hidden flex items-center justify-center">
                            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h2 className="relative z-10 font-sans text-xl sm:text-2xl font-bold text-current shadow-sm mt-auto w-full text-center truncate px-4 drop-shadow-md">{link.label}</h2>
                      </a>
                    );
                  }
                  
                  if (link.size === 'Medium') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         onClick={() => recordClick(link.label, href, 'link', link.id)}
                         className={`relative ${cardBgClass} ${cardBorderClass} border text-current p-4 rounded-2xl shadow-sm hover:border-black/30 dark:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full aspect-[2/1] group overflow-hidden`}
                         style={{ 
                           background: iconUrl ? `url('${iconUrl}') center/cover` : '#141414' 
                         }}>
                         {iconUrl && <div className="absolute inset-0 bg-gray-50 dark:bg-black/40 group-hover:bg-gray-50 dark:bg-black/30 transition-colors z-0"></div>}
                         <h2 className="relative z-10 font-sans text-lg font-bold text-current shadow-sm mt-auto w-full text-center truncate px-4 drop-shadow-md">{link.label}</h2>
                      </a>
                    );
                  }
                  
                  if (link.size === 'Small') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         onClick={() => recordClick(link.label, href, 'link', link.id)}
                         className={`relative ${cardBgClass} ${cardBorderClass} border text-current p-3 rounded-xl shadow-sm hover:border-black/30 dark:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full h-24 group overflow-hidden`}
                         style={{ 
                           background: iconUrl ? `url('${iconUrl}') center/cover` : '#141414' 
                         }}>
                         {iconUrl && <div className="absolute inset-0 bg-gray-50 dark:bg-black/40 group-hover:bg-gray-50 dark:bg-black/30 transition-colors z-0"></div>}
                         <h2 className="relative z-10 font-sans text-md font-bold text-current shadow-sm mt-auto w-full text-center truncate px-2 drop-shadow-md">{link.label}</h2>
                      </a>
                    );
                  }

                  // Default Button size
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                       onClick={() => recordClick(link.label, href, 'link', link.id)}
                       className={`${cardBgClass} ${cardBorderClass} border text-current p-4 rounded-xl shadow-sm hover:border-black/30 dark:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full group relative`}>
                       <h2 className="font-sans text-[15px] font-medium truncate text-center">{link.label}</h2>
                    </a>
                  );
                }) : (
                   <div className="w-full border-2 border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center gap-2 mb-3 bg-gray-50 dark:bg-black">
                     <span className="font-mono text-[12px] opacity-60">[Ordered Link Data Placeholder]</span>
                   </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest opacity-60 mb-1 px-1">Digital Products</span>
                {products.map((p) => (
                  <div key={p.id} className={`${cardBgClass} ${cardBorderClass} border rounded-xl p-4 flex flex-col sm:flex-row gap-4 text-left`}>
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg shrink-0" />}
                    <div className="flex flex-col flex-1">
                      <span className="font-sans font-bold text-current text-[16px] leading-tight mb-1">{p.name}</span>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`font-mono text-[12px] font-bold text-current ${cardBgClass} px-2 py-1 rounded-xl self-start leading-none`}>₦{Number(p.price).toLocaleString()}</span>
                        <span className="text-[10px] opacity-50">+ ₦200 fee</span>
                      </div>
                      <p className="text-[13px] opacity-60 mb-4 flex-1 line-clamp-3">{p.description}</p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const txRef = `PROD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                            const priceTotal = Number(p.price) + 200;
                            await openFlutterwavePayment({
                              txRef,
                              amount: priceTotal,
                              currency: 'NGN',
                              customer: {
                                email: profile?.contact_email || profile?.email || 'guest@chipng.com',
                                name: profile?.name || 'Customer',
                              },
                              title: `CHIP NG — ${p.name}`,
                              description: `Digital product instant download: ${p.name}`,
                              meta: {
                                product_id: p.id,
                                seller_id: p.profile_id,
                              },
                              onSuccess: async (response: any) => {
                                const ref = response?.tx_ref || response?.transaction_id || txRef;
                                try {
                                  await supabase.from('purchases').insert({
                                    product_id: p.id,
                                    seller_id: p.profile_id,
                                    buyer_email: 'guest@chipng.com',
                                    amount: p.price,
                                    platform_fee: p.price * 0.05,
                                    net_earnings: p.price * 0.95,
                                    reference: ref,
                                    status: 'success'
                                  });
                                  toast.success('Payment complete! Reference: ' + ref + '. Accessing your purchased item...');
                                  if (p.file_url) {
                                    const link = document.createElement('a');
                                    link.href = p.file_url;
                                    link.setAttribute('download', p.name || 'download');
                                    link.setAttribute('target', '_blank');
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  } else {
                                    toast.info('This product does not have a downloadable file attached.');
                                  }
                                } catch(err) {
                                  console.error(err);
                                  toast.error('Error processing purchase.');
                                }
                              },
                            });
                          } catch (e: any) {
                            toast.error(e?.message || 'Failed to open Flutterwave checkout');
                          }
                        }}
                        className={`w-full ${cardBgClass} text-current hover:bg-gray-200 transition-colors font-mono text-[12px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-auto cursor-pointer`}
                      >
                        Buy Now • ₦{(Number(p.price) + 200).toLocaleString()}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile?.enterprise && (
              <div className="mt-12 flex items-center gap-2 justify-center opacity-60">
                 {profile.enterprise.logo_url && <img src={profile.enterprise.logo_url} className="w-4 h-4 object-contain grayscale" alt="" />}
                 <span className="font-mono text-[10px] uppercase tracking-wider text-current">Part of {profile.enterprise.name}</span>
              </div>
            )}
            
          </section>
        </div>

        {/* Footer at the bottom of the page */}
        <footer className="w-full bg-gray-50 dark:bg-black/40 backdrop-blur-md border-t border-black/10 dark:border-white/10 px-6 py-5 flex flex-col items-center justify-center gap-3 z-10 shrink-0 mt-auto">
           <button onClick={() => { if(onNavigate) { onNavigate('landing'); } else { window.location.href='/'; } }} className={`bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-mono text-[13px] font-bold shadow-md hover:bg-white/30 transition-colors mb-2`}>
             CREATE YOURS
           </button>
           <a href="https://chipng.com" className="opacity-80 hover:opacity-100 transition-opacity flex items-center gap-2">
             <span className="font-mono text-[10px] uppercase font-semibold text-neutral-500 dark:text-neutral-400">Powered by</span>
             <BrandLogo size="xs" />
           </a>
           <div className="flex justify-center gap-6">
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-60 hover:text-current transition-colors">Privacy Policy</a>
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-60 hover:text-current transition-colors">Terms</a>
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-60 hover:text-current transition-colors">Report</a>
           </div>
        </footer>

        {/* 2-Way Contact Exchange Modal */}
        <LeadExchangeModal
          isOpen={isExchangeModalOpen}
          onClose={() => setIsExchangeModalOpen(false)}
          profile={profile}
          onVCardDownload={() => downloadVCard(false)}
        />

        {/* Interactive Contact vCard Modal */}
        <ContactVCardModal
          isOpen={isVCardModalOpen}
          onClose={() => setIsVCardModalOpen(false)}
          profile={profile}
          onSaveToPhone={() => downloadVCard(false)}
          onOpenExchangeModal={() => setIsExchangeModalOpen(true)}
        />

      </div>
    </div>
    </>
  );
}
