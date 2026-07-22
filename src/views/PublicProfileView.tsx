import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { ExternalLink, Mail, Link as LinkIcon, Share, Globe, Phone, MapPin, UserPlus, X, Copy, QrCode, ShoppingCart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SOCIAL_PLATFORMS, PREMIUM_THEMES } from './UserDashboard';
import { PaystackButton } from 'react-paystack';
import { QRCodeSVG } from 'qrcode.react';

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
        if (profileData.is_verified) {
          const { data: purchasesData } = await supabase.from('purchases').select('*').eq('seller_id', targetUserId).eq('purchase_type', 'verification').order('created_at', { ascending: false }).limit(1);
          if (purchasesData && purchasesData.length > 0) {
            const latestVerif = purchasesData[0];
            if (latestVerif.status && latestVerif.status.startsWith('expires_')) {
              const expiresAt = parseInt(latestVerif.status.split('_')[1], 10);
              if (Date.now() > expiresAt) {
                profileData.is_verified = false;
                await supabase.from('profiles').update({ is_verified: false }).eq('id', targetUserId);
              }
            }
          }
        }
        setProfile(profileData);
        if (profileData.enterprise_id) {
          const { data: ent } = await supabase.from('enterprises').select('*').eq('id', profileData.enterprise_id).single();
          if (ent) profileData.enterprise = ent;
        }

        // Track profile view
        if (username) {
          supabase.from('profile_views').insert({
             profile_id: targetUserId
          }).then(({error}) => {
             if (error) console.error("View tracking error:", error);
          });
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
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-24 h-24 border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1c1c] p-3 rounded-xl shadow-sm overflow-hidden animate-pulse">
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
      <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center text-center p-6">
        <h1 className="font-display text-4xl font-black mb-2 text-black dark:text-white">Profile Not Found</h1>
        <p className="font-sans text-black dark:text-white/40 dark:text-white/40 mb-6">We couldn't find a user with this username.</p>
        <button 
          onClick={() => {
            window.location.href = '/';
          }} 
          className="px-6 py-2 bg-gray-50 dark:bg-black text-black dark:text-white dark:text-white font-mono text-[13px] font-bold rounded-xl uppercase tracking-widest hover:bg-gray-50 dark:bg-black/90 transition-colors"
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

  const downloadVCard = async () => {
    if (!profile) return;
    
    let photoStr = "";
    if (profile.cover_image_url) {
      try {
        const response = await fetch(profile.cover_image_url);
        const blob = await response.blob();
        const base64data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const parts = base64data.split(',');
        if (parts.length === 2) {
          const mimeTypeMatch = parts[0].match(/:(.*?);/);
          const type = mimeTypeMatch ? mimeTypeMatch[1].split('/')[1].toUpperCase() : 'JPEG';
          photoStr = `\nPHOTO;ENCODING=b;TYPE=${type}:${parts[1]}`;
        }
      } catch (err) {
        console.warn("Failed to fetch profile image for vCard", err);
        // Fallback to URI method if fetch fails (e.g., due to CORS)
        photoStr = `\nPHOTO;VALUE=URI:${profile.cover_image_url}`;
      }
    }

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.full_name || ''}\nTITLE:${profile.headline || ''}\nEMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email || ''}\nTEL;TYPE=CELL:${profile.phone_number || ''}\nADR;TYPE=WORK:;;${profile.address || ''};;;;\nURL:https://chipng.com/${profile.username}${photoStr}\nEND:VCARD`;
    
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
      default: return '"Hanken Grotesk", "Inter", sans-serif'; // Revert to previous default font on public profile
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
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-[#1a1c1c] hover:-translate-y-1 transition-transform shadow-md"
                style={{ color: profile?.enterprise?.brand_color || color }}
              >
                <Icon className="w-6 h-6" />
              </div>
            );
          } else if (style === 'white-icon') {
             iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:-translate-y-1 transition-transform text-black dark:text-white dark:text-white opacity-90 hover:opacity-100"
              >
                <Icon className="w-8 h-8" />
              </div>
            );
          } else if (style === 'original') {
             iconContent = (
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full hover:-translate-y-1 transition-transform shadow-md bg-black/5 dark:bg-white/5 backdrop-blur-sm border border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10"
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

  const renderThemeAnimation = () => {
    if (customBg) return null;
    
    switch (profile?.theme) {
      case 'default':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-gray-50 dark:bg-black">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-gray-200/50 dark:bg-neutral-800/10 blur-[60px] animate-glow-breath"></div>
            <div className="absolute inset-0 opacity-25">
              <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white dark:bg-[#1a1c1c] rounded-full animate-ping [animation-duration:4s]"></div>
              <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 bg-white dark:bg-[#1a1c1c]/80 rounded-full animate-ping [animation-duration:6s]"></div>
              <div className="absolute top-3/4 left-1/4 w-0.5 h-0.5 bg-white dark:bg-[#1a1c1c] rounded-full animate-ping [animation-duration:8s]"></div>
              <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-white dark:bg-[#1a1c1c]/60 rounded-full animate-ping [animation-duration:5s]"></div>
            </div>
          </div>
        );

      case 'glassmorphism':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#0c0a0f]">
            <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] rounded-full bg-indigo-600/50 blur-[50px] animate-drift-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-fuchsia-600/40 blur-[60px] animate-drift-medium"></div>
            <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full bg-cyan-500/30 blur-[45px] animate-drift-slow [animation-delay:-5s]"></div>
            <div className="absolute inset-0 bg-white dark:bg-[#1a1c1c]/[0.02] backdrop-blur-[24px]"></div>
          </div>
        );

      case 'tech_3d':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#09090b]">
            <div 
              className="absolute inset-0 animate-grid-pan opacity-[0.07]" 
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            ></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] border border-zinc-700/10 rounded-full animate-pulse [animation-duration:4s]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] border border-zinc-800/20 rounded-full animate-pulse [animation-duration:6s]"></div>
            <div className="absolute top-1/3 right-10 w-2 h-2 bg-emerald-500 rounded-full animate-ping [animation-duration:3s]"></div>
          </div>
        );

      case 'dark_neon':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#030712]">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-green-500/5 bg-[length:100%_4px] opacity-40"></div>
            <div className="absolute -left-[10%] top-[20%] w-[180px] h-[180px] rounded-full bg-green-500/10 blur-[40px] animate-neon-pulse"></div>
            <div className="absolute -right-[10%] bottom-[20%] w-[220px] h-[220px] rounded-full bg-green-500/15 blur-[50px] animate-neon-pulse [animation-delay:1.5s]"></div>
            <div className="absolute top-4 left-6 text-[8px] font-mono text-green-500/20">SYSTEM: ACTIVE</div>
            <div className="absolute bottom-16 right-6 text-[8px] font-mono text-green-500/20">GRID: 9:16 SECURE</div>
          </div>
        );

      default:
        return null;
    }
  };

  const profileFont = getFontFamily();

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#09090b] text-black dark:text-white dark:text-white p-0 sm:p-6 md:p-8 relative overflow-x-hidden" 
      style={{ 
        fontFamily: profileFont,
        ['--font-sans' as any]: profileFont,
        ['--font-display' as any]: profileFont
      }}
    >
      {/* Ambient glass blur backdrop on desktop screens matching current theme background */}
      <div className="absolute inset-0 pointer-events-none filter blur-[140px] opacity-25 hidden sm:block">
        <div className={`w-full h-full ${!customBg ? currentTheme.bgClass : ''}`} style={bgStyle}></div>
      </div>
      
      {/* 9:16 Portrait Viewport Frame on Desktop, full screen on mobile */}
      <div 
        className={`w-full min-h-screen sm:min-h-0 sm:h-[780px] md:h-[820px] sm:w-[420px] md:w-[450px] sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.85)] sm:border sm:border-neutral-800/80 overflow-y-auto scrollbar-hide relative flex flex-col ${!customBg ? currentTheme.bgClass : ''} ${!customText ? currentTheme.textClass : ''}`} 
        style={{ ...bgStyle, ...textStyle }}
      >
        {/* Theme Relating Animation Layer */}
        {renderThemeAnimation()}

        {/* Buttons at Top */}
        <div className="absolute top-4 w-full flex justify-between items-start px-4 z-50 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button 
              onClick={() => setIsBioModalOpen(true)} 
              className="bg-white dark:bg-[#1a1c1c] text-black dark:text-white font-mono text-[11px] uppercase font-bold px-4 py-2 rounded-full shadow-lg hover:bg-[#f3f3f4] transition-colors flex items-center gap-2"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Bio Link
            </button>
            {!username && (
              <button 
                onClick={() => onNavigate && onNavigate('user-dashboard')} 
                className="bg-black/10 dark:bg-white/10 backdrop-blur-md text-black dark:text-white dark:text-white border border-black/20 dark:border-white/20 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-white dark:bg-[#1a1c1c]/20 transition-colors"
               >
                Dashboard
              </button>
            )}
          </div>
          <button 
            onClick={downloadVCard}
            className="w-10 h-10 bg-white dark:bg-[#1a1c1c] text-black dark:text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f3f3f4] transition-colors pointer-events-auto"
            title="Save Contact"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Bio Link Modal */}
        {isBioModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-gray-50 dark:bg-black/80 backdrop-blur-sm sm:pb-4 pb-12">
            <div className="bg-[#1a1a1a] w-full max-w-[400px] rounded-[32px] overflow-hidden flex flex-col relative animate-in fade-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border border-[#333]">
              <button 
                onClick={() => setIsBioModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-black/50 text-black dark:text-white dark:text-white hover:bg-gray-50 dark:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-3xl overflow-hidden mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-black/10 dark:border-white/10 relative">
                   {showQR ? (
    <div className="w-full h-full bg-white flex items-center justify-center p-2">
      <QRCodeSVG 
        value={`https://chipng.com/${profile.username || ''}`}
        size={130}
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
                
                <h2 className="text-2xl font-bold text-black dark:text-white dark:text-white mb-2 text-center">This is your<br/>ChipNG bio link!</h2>
                <p className="text-gray-500 dark:text-[#a0a0a0] text-center text-[13px] mb-8 max-w-[280px]">
                  You can copy and paste it into all your social media accounts to help increase your exposure and showcase your profile.
                </p>

                <div className="w-full bg-gray-50 dark:bg-black/50 border border-[#333] rounded-2xl p-1.5 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 px-3 overflow-hidden">
                     <div className="w-6 h-6 rounded-2xl bg-white dark:bg-[#1a1c1c] text-black dark:text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                       NG
                     </div>
                     <span className="text-black dark:text-white dark:text-white text-[13px] truncate font-medium">chipng.com/{profile.username}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://chipng.com/${profile.username}`);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="px-4 py-2 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] text-black dark:text-white dark:text-white rounded-xl text-[13px] font-bold transition-colors shadow-sm"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className="w-full py-4 rounded-2xl text-black dark:text-white dark:text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-[#3a3a3a] shadow-sm flex items-center justify-center gap-2"
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
                    className="w-full py-4 rounded-2xl text-black dark:text-white dark:text-white font-bold text-[14px] transition-transform hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#4776e6] to-[#8e54e9] shadow-[0_0_20px_rgba(71,118,230,0.3)] flex items-center justify-center gap-2"
                  >
                    <Share className="w-4 h-4" /> SHARE BIO LINK
                  </button>

                  <button 
                    onClick={() => setIsBioModalOpen(false)}
                    className="w-full py-3 text-gray-500 dark:text-[#a0a0a0] font-bold text-[14px] hover:text-black dark:text-white dark:text-white transition-colors"
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
          <section className="relative w-full aspect-square md:aspect-[4/5] bg-gray-50 dark:bg-black">
            <img 
              src={coverUrl}
              alt={profile?.full_name || "Profile"} 
              className="w-full h-full object-cover object-top opacity-85"
            />
            {/* Smooth fade container at top base */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 w-full left-0 flex flex-col items-center text-center pb-2">
              <h1 className="font-display text-[32px] font-black text-black dark:text-white dark:text-white leading-tight mb-2 flex items-center gap-2 justify-center flex-wrap px-4">
                {profile?.full_name || "[Data Placeholder]"}
                {profile?.is_verified && (
                  <svg aria-label="Verified" className="w-[18px] h-[18px] lg:w-5 lg:h-5 text-[#0095f6] flex-shrink-0" fill="currentColor" role="img" viewBox="0 0 40 40">
                    <title>Verified</title>
                    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                  </svg>
                )}
              </h1>
              <p className="font-sans text-[14px] text-gray-500 dark:text-[#a0a0a0] font-medium mb-1 px-6">{profile?.headline || ""}</p>
              <p className="font-mono text-[13px] text-[#707070] font-bold mb-3 px-6">@{profile?.username || "username"}</p>
              
              {profile?.show_total_followers && totalFollowers > 0 && (
                <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#333333] px-3 py-1.5 rounded-full mb-2">
                  <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-[#a0a0a0]" />
                  <span className="font-mono text-[11px] font-bold text-black dark:text-white dark:text-white uppercase tracking-wider">{formatFollowers(totalFollowers)} Total Followers</span>
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
              <a href={`mailto:${profile?.contact_email || profile?.email || 'hello@example.com'}`} className="w-full bg-white dark:bg-[#1a1c1c] rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors">
                <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                  <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                    {profile?.contact_email || profile?.email || "your@email.com"}
                  </span>
                </div>
                <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                  <span className="text-black dark:text-white dark:text-white font-sans text-[16px] font-bold tracking-tight">Connect with</span>
                  <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                </div>
              </a>
              {profile?.phone_number && (
                <a href={`https://wa.me/${profile.phone_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-white dark:bg-[#1a1c1c] rounded-full p-1.5 flex items-center justify-between shadow-md hover:bg-gray-50 transition-colors mt-2">
                  <div className="pl-5 pr-2 flex-1 overflow-hidden flex items-center">
                    <span className="font-sans text-[19px] text-[#3b82f6] font-medium truncate" style={{ color: enterpriseColor || '#3b82f6' }}>
                      {profile.phone_number}
                    </span>
                  </div>
                  <div className="bg-[#8c8c8c] rounded-full py-1 pl-5 pr-1.5 flex items-center gap-3 shrink-0" style={{ backgroundColor: enterpriseColor || '#8c8c8c' }}>
                    <span className="text-black dark:text-white dark:text-white font-sans text-[16px] font-bold tracking-tight">WhatsApp connect</span>
                    <img src={profile?.cover_image_url || coverUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover" />
                  </div>
                </a>
              )}
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
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-1 px-1">Gallery</span>
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
              <div className="w-full bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] p-4 flex items-center gap-4 rounded-xl mb-8">
                <div className="w-10 h-10 bg-gray-200 dark:bg-[#2a2a2a] text-black dark:text-white dark:text-white rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: enterpriseColor || undefined }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#a0a0a0] font-bold">Location</span>
                  <span className="font-sans text-[14px] text-black dark:text-white dark:text-white font-semibold">{profile.address}</span>
                </div>
              </div>
            )}

            {profile?.calendar_link && profile?.show_availability !== false && (
              <a 
                href={profile.calendar_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-white dark:bg-[#fafafa] text-black dark:text-white p-4 flex items-center justify-between rounded-xl cursor-pointer hover:bg-white dark:bg-[#1a1c1c] transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                 <div className="flex items-center gap-3">
                   <div className="flex flex-col">
                     <span className="font-mono text-[10px] uppercase tracking-wider text-[#505050] font-bold">{profile.booking_provider || 'Book a session'}</span>
                     <span className="font-sans text-[15px] font-bold flex items-center gap-2">View Availability</span>
                   </div>
                 </div>
                 <ExternalLink className="w-5 h-5 text-black dark:text-white" />
              </a>
            )}

            {products.length > 0 && (
              <div className="w-full flex bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] p-1 rounded-full mb-6">
                <button
                  onClick={() => setActiveTab('links')}
                  className={`flex-1 py-2 rounded-full font-mono text-[12px] font-bold transition-colors ${activeTab === 'links' ? 'bg-white dark:bg-[#1a1c1c] text-black dark:text-white' : 'text-[#707070] hover:text-black dark:text-white dark:text-white'}`}
                >
                  Links
                </button>
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`flex-1 py-2 rounded-full font-mono text-[12px] font-bold transition-colors ${activeTab === 'shop' ? 'bg-white dark:bg-[#1a1c1c] text-black dark:text-white' : 'text-[#707070] hover:text-black dark:text-white dark:text-white'}`}
                >
                  Products
                </button>
              </div>
            )}

            {activeTab === 'links' ? (
              <div className="w-full flex flex-col gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-2 px-1">Featured Links</span>
                {links.filter(l => l.size !== 'GalleryImage').length > 0 ? links.filter(l => l.size !== 'GalleryImage').map((link, i) => {
                  const href = link.url?.startsWith('http') ? link.url : `https://${link.url}`;
                  let iconUrl = link.image_url;
                  if (!iconUrl && link.use_link_icon && link.url) {
                    try { iconUrl = `https://icon.horse/icon/${(link.url.replace(/^https?:\/\//, '').split('/')[0])}`; } catch(e){}
                  }
                  
                  if (link.size === 'Big') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
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
                        <h2 className="relative z-10 font-sans text-xl sm:text-2xl font-bold text-black dark:text-white dark:text-white shadow-sm mt-auto w-full text-center truncate px-4 drop-shadow-md">{link.label}</h2>
                      </a>
                    );
                  }
                  
                  if (link.size === 'Medium') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         className="relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] text-black dark:text-white dark:text-white p-4 rounded-2xl shadow-sm hover:border-black/30 dark:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full aspect-[2/1] group overflow-hidden"
                         style={{ 
                           background: iconUrl ? `url('${iconUrl}') center/cover` : '#141414' 
                         }}>
                         {iconUrl && <div className="absolute inset-0 bg-gray-50 dark:bg-black/40 group-hover:bg-gray-50 dark:bg-black/30 transition-colors z-0"></div>}
                         <h2 className="relative z-10 font-sans text-lg font-bold text-black dark:text-white dark:text-white shadow-sm mt-auto w-full text-center truncate px-4 drop-shadow-md">{link.label}</h2>
                      </a>
                    );
                  }
                  
                  if (link.size === 'Small') {
                    return (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                         className="relative bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] text-black dark:text-white dark:text-white p-3 rounded-xl shadow-sm hover:border-black/30 dark:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full h-24 group overflow-hidden"
                         style={{ 
                           background: iconUrl ? `url('${iconUrl}') center/cover` : '#141414' 
                         }}>
                         {iconUrl && <div className="absolute inset-0 bg-gray-50 dark:bg-black/40 group-hover:bg-gray-50 dark:bg-black/30 transition-colors z-0"></div>}
                         <h2 className="relative z-10 font-sans text-md font-bold text-black dark:text-white dark:text-white shadow-sm mt-auto w-full text-center truncate px-2 drop-shadow-md">{link.label}</h2>
                      </a>
                    );
                  }

                  // Default Button size
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                       className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] text-black dark:text-white dark:text-white p-4 rounded-xl shadow-sm hover:border-black/30 dark:border-white/30 hover:bg-[#1a1a1a] transition-colors flex items-center justify-center w-full group relative">
                       <h2 className="font-sans text-[15px] font-medium truncate text-center">{link.label}</h2>
                    </a>
                  );
                }) : (
                   <div className="w-full border-2 border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 flex flex-col items-center justify-center gap-2 mb-3 bg-gray-50 dark:bg-black">
                     <span className="font-mono text-[12px] text-[#505050]">[Ordered Link Data Placeholder]</span>
                   </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#707070] mb-1 px-1">Digital Products</span>
                {products.map((p) => (
                  <div key={p.id} className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4 flex flex-col sm:flex-row gap-4 text-left">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg shrink-0" />}
                    <div className="flex flex-col flex-1">
                      <span className="font-sans font-bold text-black dark:text-white dark:text-white text-[16px] leading-tight mb-1">{p.name}</span>
                      <span className="font-mono text-[12px] font-bold text-black dark:text-white bg-white dark:bg-[#1a1c1c] px-2 py-1 rounded-xl self-start mb-2 leading-none">₦{p.price}</span>
                      <p className="text-[13px] text-gray-500 dark:text-[#a0a0a0] mb-4 flex-1 line-clamp-3">{p.description}</p>
                      <PaystackButton
                        reference={'' + Math.floor((Math.random() * 1000000000) + 1)}
                        email={profile?.contact_email || profile?.email || 'guest@chipng.com'}
                        amount={Math.round(p.price * 100)}
                        publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                        text="Buy Now"
                        onSuccess={async (response: any) => {
                          try {
                            await supabase.from('purchases').insert({
                              product_id: p.id,
                              seller_id: p.profile_id,
                              buyer_email: 'guest@chipng.com',
                              amount: p.price,
                              platform_fee: p.price * 0.05,
                              net_earnings: p.price * 0.95,
                              reference: response.reference,
                              status: 'success'
                            });
                            alert('Payment complete! Reference: ' + response.reference + '. Redirecting to download/access your purchased item...');
                            if (p.file_url) {
                              const link = document.createElement('a');
                              link.href = p.file_url;
                              link.setAttribute('download', p.name || 'download');
                              link.setAttribute('target', '_blank');
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              setTimeout(() => {
                                window.open(p.file_url, '_blank');
                              }, 500);
                            } else {
                              alert('This product does not have a downloadable file or item link attached.');
                            }
                          } catch(err) {
                            console.error(err);
                            alert('Error processing purchase.');
                          }
                        }}
                        onClose={() => {}}
                        className="w-full bg-white dark:bg-[#1a1c1c] text-black dark:text-white hover:bg-gray-200 transition-colors font-mono text-[12px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 mt-auto cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profile?.enterprise && (
              <div className="mt-12 flex items-center gap-2 justify-center opacity-60">
                 {profile.enterprise.logo_url && <img src={profile.enterprise.logo_url} className="w-4 h-4 object-contain grayscale" alt="" />}
                 <span className="font-mono text-[10px] uppercase tracking-wider text-black dark:text-white dark:text-white">Part of {profile.enterprise.name}</span>
              </div>
            )}
            
          </section>
        </div>

        {/* Footer at the bottom of the page */}
        <footer className="w-full bg-gray-50 dark:bg-black/40 backdrop-blur-md border-t border-black/10 dark:border-white/10 px-6 py-5 flex flex-col items-center justify-center gap-3 z-10 shrink-0 mt-auto">
           <button onClick={() => { if(onNavigate) { onNavigate('landing'); } else { window.location.href='/'; } }} className="bg-white dark:bg-[#1a1c1c] text-black dark:text-white px-6 py-2.5 rounded-full font-mono text-[13px] font-bold shadow-md hover:bg-gray-200 transition-colors mb-2">
             CREATE YOURS
           </button>
           <a href="https://chipng.com" className="font-display text-[14px] font-black tracking-widest text-gray-500 dark:text-[#a0a0a0] hover:text-black dark:text-white dark:text-white transition-colors flex items-center gap-1.5"><span className="font-mono text-[10px] uppercase font-medium text-[#505050]">Powered by</span> CHIP NG</a>
           <div className="flex justify-center gap-6">
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-black dark:text-white dark:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-black dark:text-white dark:text-white transition-colors">Terms</a>
             <a href="#" className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#505050] hover:text-black dark:text-white dark:text-white transition-colors">Report</a>
           </div>
        </footer>

      </div>
    </div>
  );
}
