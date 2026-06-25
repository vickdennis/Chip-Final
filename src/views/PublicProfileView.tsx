import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { ExternalLink, Mail, Link as LinkIcon, Share, Globe, Phone, MapPin, UserPlus, X, Copy, QrCode, ShoppingCart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SOCIAL_PLATFORMS, PREMIUM_THEMES } from './UserDashboard';
import { PaystackButton } from 'react-paystack';

export default function PublicProfileView({ onNavigate, username }: { onNavigate?: (view: ViewState) => void, username?: string | null }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Cart & Checkout States
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');

  useEffect(() => {
    fetchData();
  }, [username]);

  const fetchData = async () => {
    try {
      let targetUserId = null;
      let profileData = null;

      if (username) {
        // Fetch public profile by username
        console.log("Fetching profile for username:", username);
        const { data, error } = await supabase.from('profiles').select('*').ilike('username', username).single();
        console.log("Fetched data:", data, "Error:", error);
        if (error || !data) {
          console.error("Failed to fetch public profile:", error);
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
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        profileData = { ...data, email: user.email };
      }

      const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', targetUserId).order('position');
      const { data: socialData } = await supabase.from('social_links').select('*').eq('profile_id', targetUserId);
      const { data: productsData } = await supabase.from('products').select('*').eq('profile_id', targetUserId).order('created_at', { ascending: false });

      if (profileData) {
        setProfile(profileData);
        if (profileData.enterprise_id) {
          const { data: ent } = await supabase.from('enterprises').select('*').eq('id', profileData.enterprise_id).single();
          if (ent) profileData.enterprise = ent;
        }
      }
      if (linksData) setLinks(linksData);
      if (socialData) setSocialLinks(socialData);
      if (productsData) setProducts(productsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 border border-[#e2e2e2] bg-white p-3 rounded-sm shadow-sm overflow-hidden animate-pulse">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfMfGw30AK_ubznqFEGAgwiCyiaRj9m4reZICGiUR5WxHaUy8SzdPiuG5buvBu5WeAA9DB0111CklZcTTlQ2ffzcoYwgviMD3gHxBZOKmlT7sVtHT15n3eEE9D6dZdIY2jZVRXWH6thF_rcsUZISiNG0A3D8d4OafozFaTHHwjQDXmtaSWZFHDoh8H0bhPXXn4PYQI7APYWU_vvzbtvxvU0iUv2zWnGvTvI73n1MlLXKIU7YIc5G1LUb6JHI0mPPjJOCIhne8BNGU" 
            alt="CHIP NG Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
        <h1 className="font-display text-4xl font-black mb-2 text-black">Profile Not Found</h1>
        <p className="font-sans text-[#7e7576] mb-6">We couldn't find a user with this username.</p>
        <button 
          onClick={() => {
            window.location.href = '/';
          }} 
          className="px-6 py-2 bg-black text-white font-mono text-[13px] font-bold rounded-sm uppercase tracking-widest hover:bg-black/90 transition-colors"
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

  const downloadVCard = () => {
    if (!profile) return;
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.full_name || ''}
TITLE:${profile.headline || ''}
EMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email || ''}
TEL;TYPE=CELL:${profile.phone_number || ''}
ADR;TYPE=WORK:;;${profile.address || ''};;;;
URL:https://chipng.com/${profile.username}
END:VCARD`;
    
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.username || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFontFamily = () => {
    switch (profile?.enterprise?.brand_font) {
      case 'mono': return '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
      case 'serif': return '"Playfair Display", ui-serif, Georgia, serif';
      default: return undefined; // use tailwind default
    }
  };

  const renderSocialLinks = () => {
    const style = profile?.social_links_style || 'color-circle';

    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4 px-6 z-10 relative">
        {socialLinks.map((link, i) => {
          const platformDef = SOCIAL_PLATFORMS.find(p => p.name === link.platform);
          const Icon = platformDef?.icon || Globe;
          const color = platformDef?.color || '#333333';
          
          let iconContent;
          if (style === 'color-circle') {
            iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:-translate-y-1 transition-transform shadow-md"
                style={{ backgroundColor: profile?.enterprise?.brand_color || color, color: '#ffffff' }}
              >
                <Icon className="w-6 h-6" />
              </div>
            );
          } else if (style === 'white-circle') {
             iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:-translate-y-1 transition-transform shadow-md"
                style={{ color: profile?.enterprise?.brand_color || color }}
              >
                <Icon className="w-6 h-6" />
              </div>
            );
          } else if (style === 'white-icon') {
             iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:-translate-y-1 transition-transform text-white opacity-90 hover:opacity-100"
              >
                <Icon className="w-8 h-8" />
              </div>
            );
          } else if (style === 'original') {
             iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:-translate-y-1 transition-transform shadow-md bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10"
                style={{ color: color }}
              >
                <Icon className="w-6 h-6" />
              </div>
            );
          } else {
            // Default
            iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:-translate-y-1 transition-transform shadow-md"
                style={{ backgroundColor: color, color: '#ffffff' }}
              >
                <Icon className="w-6 h-6" />
              </div>
            );
          }

          return (
            <a 
              key={i} 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer" 
            >
              {iconContent}
            </a>
          );
        })}
      </div>
    );
  };

  const currentTheme = PREMIUM_THEMES.find(t => t.id === profile?.theme) || PREMIUM_THEMES[0];
  const customBg = profile?.bg_color;
  const customText = profile?.text_color;

  const bgStyle = customBg ? { backgroundColor: customBg } : {};
  const textStyle = customText ? { color: customText } : {};

  return (
    <div className={`h-[100dvh] sm:min-h-screen flex flex-col items-center ${!customBg ? currentTheme.bgClass : ''}`} style={{ fontFamily: getFontFamily(), ...bgStyle }}>
      <div className={`w-full max-w-[480px] sm:shadow-2xl overflow-hidden relative h-[100dvh] flex flex-col border-x ${!customBg ? currentTheme.bgClass : ''} ${!customText ? currentTheme.textClass : ''}`} style={{ ...bgStyle, ...textStyle, borderColor: 'rgba(255,255,255,0.1)' }}>
        
        {/* Buttons at Top */}
        <div className="absolute top-4 w-full flex justify-between items-start px-4 z-50 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => setIsBioModalOpen(true)} 
              className="bg-white text-black font-mono text-[11px] uppercase font-bold px-4 py-2 rounded-full shadow-lg hover:bg-[#f3f3f4] transition-colors flex items-center gap-2"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Bio Link
            </button>
            {!username && (
              <button 
                onClick={() => onNavigate && onNavigate('user-dashboard')} 
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-white/20 transition-colors"
               >
                Dashboard
              </button>
            )}
          </div>
          <button 
            onClick={downloadVCard}
            className="w-10 h-10 bg-white text-black rounded-full shadow-lg flex items-center justify-center hover:bg-[#f3f3f4] transition-colors pointer-events-auto"
            title="Save Contact"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Bio Link Modal */}
        {isBioModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm sm:pb-4 pb-12">
            <div className="bg-[#1a1a1a] w-full max-w-[400px] rounded-[32px] overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-[#333]">
              <button 
                onClick={() => setIsBioModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/10 relative">
                   <img src={showQR ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chipng.com/${profile.username || ''}` : coverUrl} alt="Cover/QR" className={`w-full h-full ${showQR ? 'object-contain bg-white p-2' : 'object-cover'}`} />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 text-center">This is your<br/>ChipNG bio link!</h2>
                <p className="text-[#a0a0a0] text-center text-[13px] mb-8 max-w-[280px]">
                  You can copy and paste it into all your social media accounts to help increase your exposure and showcase your profile.
                </p>

                <div className="w-full bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-[10px] shrink-0">
                       NG
                     </div>
                     <span className="text-white text-[13px] truncate font-medium">chipng.com/{profile.username}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://chipng.com/${profile.username}`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-xl text-[13px] font-bold transition-colors shadow-sm"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="w-full py-4 rounded-2xl text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-[#2a2a2a] hover:bg-[#3a3a3a] shadow-sm flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> {showQR ? 'Show Profile Image' : 'Show QR Code'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${profile.full_name}'s Profile`,
                          url: `https://chipng.com/${profile.username}`
                        });
                      } else {
                        navigator.clipboard.writeText(`https://chipng.com/${profile.username}`);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="w-full py-4 rounded-2xl text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#4776e6] to-[#8e54e9] shadow-[0_0_20px_rgba(71,118,230,0.3)] flex items-center justify-center gap-2"
                  >
                    <Share className="w-4 h-4" /> SHARE BIO LINK
                  </button>

                  <button 
                    onClick={() => setIsBioModalOpen(false)}
                    className="w-full py-3 text-[#a0a0a0] font-bold text-[14px] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-10 scrollbar-hide shrink-0">
          {/* Header Section */}
          <section className="relative w-full aspect-square md:aspect-[4/5] bg-black">
            <img 
              src={coverUrl}
              alt={profile?.full_name || "Profile"} 
              className="w-full h-full object-cover object-top opacity-85"
            />
            {/* Smooth fade container at top base */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 w-full left-0 flex flex-col items-center text-center pb-2">
              <h1 className="font-display text-[32px] font-black text-white leading-tight mb-2 flex items-center gap-2 justify-center flex-wrap px-4">
                {profile?.full_name || "[Data Placeholder]"}
                {profile?.is_verified && (
                  <svg aria-label="Verified" className="w-[18px] h-[18px] lg:w-5 lg:h-5 text-[#0095f6] flex-shrink-0" fill="currentColor" role="img" viewBox="0 0 40 40">
                    <title>Verified</title>
                    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                  </svg>
                )}
              </h1>
              <p className="font-sans text-[14px] text-[#a0a0a0] font-medium mb-1 px-6">{profile?.headline || ""}</p>
              <p className="font-mono text-[13px] text-[#707070] font-bold mb-3 px-6">@{profile?.username || "username"}</p>
              
              {profile?.show_total_followers && totalFollowers > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full mb-2">
                  <Globe className="w-3.5 h-3.5 text-[#a0a0a0]" />
                  <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">{formatFollowers(totalFollowers)} Total Followers</span>
                </div>
              )}
            </div>
          </section>

          {renderSocialLinks()}

          <section className="px-6 flex flex-col items-center pt-8">
            <div className="flex flex-col items-center mb-10 w-full">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#333] to-transparent my-6"></div>
              
              {profile?.bio && (
                <div className="mb-4 text-center max-w-sm">
                  <p className="font-sans text-[14px] text-[#e0e0e0] leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Contact/Connect Action Strip */}
            <div className="w-full flex flex-col gap-3 mb-8">
              <a href={`mailto:${profile?.contact_email || profile?.email || 'hello@example.com'}`} className="w-full bg-white rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors">
                <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                  <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                    {profile?.contact_email || profile?.email || "your@email.com"}
                  </span>
                </div>
                <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                  <span className="text-white font-sans text-[16px] font-bold tracking-tight">Connect with</span>
                  <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                </div>
              </a>
              {profile?.phone_number && (
                <a href={`tel:${profile.phone_number}`} className="w-full bg-[#141414] border border-[#2a2a2a] p-3 flex items-center justify-between rounded-xl cursor-pointer hover:border-[#4a4a4a] transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center group-hover:bg-[#3a3a3a] transition-colors" style={{ backgroundColor: enterpriseColor || undefined }}>
                       <Phone className="w-4 h-4" />
                     </div>
                     <div className="flex flex-col overflow-hidden max-w-[140px]">
                       <span className="font-mono text-[10px] uppercase tracking-wider text-[#a0a0a0] font-bold">Call</span>
                       <span className="font-sans text-[13px] text-white font-semibold truncate">{profile.phone_number}</span>
                     </div>
                   </div>
                </a>
              )}
            </div>

            {profile?.address && (
              <div className="w-full bg-[#141414] border border-[#2a2a2a] p-4 flex items-center gap-4 rounded-xl mb-8">
                <div className="w-10 h-10 bg-[#2a2a2a] text-white rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: enterpriseColor || undefined }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#a0a0a0] font-bold">Location</span>
                  <span className="font-sans text-[14px] text-white font-semibold">{profile.address}</span>
                </div>
              </div>
            )}

            {profile?.calendar_link && profile?.show_availability !== false && (
              <a 
                href={profile.calendar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-[#fafafa] text-black p-4 flex items-center justify-between rounded-xl cursor-pointer hover:bg-white transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                 <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                     <span className="font-mono text-[10px] uppercase tracking-wider text-[#505050] font-bold">{profile.booking_provider || 'Book a session'}</span>
                     <span className="font-sans text-[15px] font-bold flex items-center gap-2">View Availability</span>
                   </div>
                 </div>
                 <ExternalLink className="w-5 h-5 text-black" />
              </a>
            )}

            {products.length > 0 && (
              <div className="w-full flex bg-[#141414] border border-[#2a2a2a] p-1 rounded-full mb-6">
                <button
                  onClick={() => setActiveTab('links')}
                  className={`flex-1 py-2 rounded-full font-mono text-[12px] font-bold transition-colors ${activeTab === 'links' ? 'bg-white text-black' : 'text-[#707070] hover:text-white'}`}
                >
                  Links
                </button>
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`flex-1 py-2 rounded-full font-mono text-[12px] font-bold transition-colors ${activeTab === 'shop' ? 'bg-white text-black' : 'text-[#707070] hover:text-white'}`}
                >
                  Products
                </button>
              </div>
            )}

            {activeTab === 'links' ? (
              <div className="w-full flex flex-col gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-2 px-1">Featured Links</span>
                {links.length > 0 ? links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url?.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#141414] border border-[#2a2a2a] text-white p-4 rounded-xl shadow-sm hover:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center w-full group"
                  >
                    <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/10 transition-colors" style={{ backgroundColor: enterpriseColor ? `${enterpriseColor}40` : undefined, color: enterpriseColor || undefined }}>
                      <LinkIcon className="w-4 h-4 text-white" style={{ color: enterpriseColor || undefined }} />
                    </div>
                    <h2 className="font-sans text-[15px] font-medium flex-1 truncate">{link.label}</h2>
                    <ExternalLink className="w-4 h-4 text-[#707070] flex-shrink-0 ml-2 group-hover:text-white transition-colors" />
                  </a>
                )) : (
                   <div className="w-full border-2 border-dashed border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center gap-2 mb-3 bg-black">
                     <span className="font-mono text-[12px] text-[#505050]">[Ordered Link Data Placeholder]</span>
                   </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-1 px-1">Digital Products</span>
                {products.map((p) => (
                  <div key={p.id} className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 flex flex-col sm:flex-row gap-4 text-left">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg shrink-0" />}
                    <div className="flex flex-col flex-1">
                      <span className="font-sans font-bold text-white text-[16px] leading-tight mb-1">{p.name}</span>
                      <span className="font-mono text-[12px] font-bold text-black bg-white px-2 py-1 rounded-sm self-start mb-2 leading-none">₦{p.price}</span>
                      <p className="text-[13px] text-[#a0a0a0] mb-4 flex-1 line-clamp-3">{p.description}</p>
                      <button
                        onClick={() => {
                          setCart([...cart, p]);
                        }}
                        className="w-full bg-white text-black hover:bg-gray-200 transition-colors font-mono text-[12px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-auto"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile?.enterprise && (
              <div className="mt-12 flex items-center gap-2 justify-center opacity-60">
                 {profile.enterprise.logo_url && <img src={profile.enterprise.logo_url} className="w-4 h-4 object-contain grayscale" alt="" />}
                 <span className="font-mono text-[10px] uppercase tracking-wider text-white">Part of {profile.enterprise.name}</span>
              </div>
            )}
            
          </section>
        </div>

        {/* Persistent Footer */}
        <footer className="w-full bg-black/20 backdrop-blur-md border-t border-white/10 px-6 py-5 flex flex-col items-center justify-center gap-3 z-10 shrink-0">
           <button onClick={() => { if(onNavigate) { onNavigate('landing'); } else { window.location.href='/'; } }} className="bg-white text-black px-6 py-2.5 rounded-full font-mono text-[13px] font-bold shadow-md hover:bg-gray-200 transition-colors mb-2">
             CREATE YOURS
           </button>
           <a href="https://chipng.com" className="font-display text-[14px] font-black tracking-widest text-[#a0a0a0] hover:text-white transition-colors flex items-center gap-1.5"><span className="font-mono text-[10px] uppercase font-medium text-[#505050]">Powered by</span> CHIP NG</a>
           <div className="flex justify-center gap-6">
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-white transition-colors">Terms</a>
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-white transition-colors">Report</a>
           </div>
        </footer>

      </div>

      {cart.length > 0 && (
        <button
          onClick={() => setIsCheckoutModalOpen(true)}
          className="fixed bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-50 flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        </button>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-[#333] w-full max-w-md rounded-2xl overflow-hidden relative">
            <div className="flex justify-between items-center p-4 border-b border-[#333]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Checkout</h3>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-[#a0a0a0] hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-lg border border-[#333]">
                    <span className="text-sm font-semibold text-white">{item.name}</span>
                    <span className="text-sm font-mono text-[#a0a0a0]">₦{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center py-2 border-t border-b border-[#333]">
                <span className="font-bold text-white uppercase text-sm">Total</span>
                <span className="font-bold text-white font-mono text-lg">₦{cart.reduce((sum, item) => sum + Number(item.price), 0)}</span>
              </div>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Your Full Name" 
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="Your Phone Number" 
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              
              <PaystackButton
                reference={'' + Math.floor((Math.random() * 1000000000) + 1)}
                email={profile?.contact_email || profile?.email || 'guest@chipng.com'}
                amount={Math.round(cart.reduce((sum, item) => sum + Number(item.price), 0) * 100)}
                publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                text="Pay Now"
                onSuccess={async (response: any) => {
                  try {
                    // Save purchases in DB
                    for (const item of cart) {
                      await supabase.from('purchases').insert({
                        product_id: item.id,
                        seller_id: item.profile_id,
                        buyer_email: checkoutName || 'Guest',
                        amount: item.price,
                        platform_fee: item.price * 0.05,
                        net_earnings: item.price * 0.95,
                        reference: response.reference + '-' + Math.random().toString(36).substr(2, 5),
                        status: 'success'
                      });
                    }
                    alert('Payment complete! Redirecting to WhatsApp to claim your order...');
                    
                    const message = `*New Order from ${checkoutName || 'Guest'} (${checkoutPhone || 'No phone'})*\n\n*Items:*\n` + 
                                    cart.map(item => `- ${item.name} (₦${item.price})`).join('\n') + 
                                    `\n\n*Total:* ₦${cart.reduce((sum, item) => sum + Number(item.price), 0)}\n` +
                                    `*Reference:* ${response.reference}`;
                    
                    const waUrl = `https://wa.me/2348100764154?text=${encodeURIComponent(message)}`;
                    window.open(waUrl, '_blank');
                    
                    setCart([]);
                    setIsCheckoutModalOpen(false);
                  } catch(err) {
                    console.error(err);
                    alert('Error processing purchase.');
                  }
                }}
                onClose={() => {}}
                className="w-full bg-white text-black hover:bg-gray-200 transition-colors font-mono text-[14px] font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!checkoutName || !checkoutPhone || cart.length === 0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
