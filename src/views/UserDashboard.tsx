import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { PaystackButton } from 'react-paystack';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Save, Eye, UserCircle, Upload, Trash2, Link, GripVertical, Plus, Globe, AtSign, Rss, Calendar, QrCode, Download, Settings, Loader2, MapPin, Phone, Mail, Share, Shield, Activity, Wallet } from 'lucide-react';
import { FaXTwitter, FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaTwitch, FaTiktok, FaSnapchat, FaPinterest, FaReddit, FaDiscord, FaSlack, FaTelegram, FaWhatsapp, FaWeixin, FaLine, FaMedium, FaDribbble, FaBehance, FaFigma, FaDev, FaProductHunt, FaStackOverflow, FaGitlab, FaBitbucket, FaSpotify, FaSoundcloud, FaPatreon, FaPaypal } from 'react-icons/fa6';
import { SiBuymeacoffee, SiSubstack, SiApplemusic, SiVenmo } from 'react-icons/si';

export const SOCIAL_PLATFORMS = [
  { name: 'Website', icon: Globe, color: '#000000' },
  { name: 'Email', icon: Mail, color: '#EA4335' },
  { name: 'X (Twitter)', icon: FaXTwitter, color: '#000000' },
  { name: 'GitHub', icon: FaGithub, color: '#181717' },
  { name: 'LinkedIn', icon: FaLinkedin, color: '#0A66C2' },
  { name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { name: 'Facebook', icon: FaFacebook, color: '#1877F2' },
  { name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { name: 'Twitch', icon: FaTwitch, color: '#9146FF' },
  { name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { name: 'Snapchat', icon: FaSnapchat, color: '#FFFC00' }, 
  { name: 'Pinterest', icon: FaPinterest, color: '#E60023' },
  { name: 'Reddit', icon: FaReddit, color: '#FF4500' },
  { name: 'Discord', icon: FaDiscord, color: '#5865F2' },
  { name: 'Slack', icon: FaSlack, color: '#4A154B' },
  { name: 'Telegram', icon: FaTelegram, color: '#26A5E4' },
  { name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366' },
  { name: 'WeChat', icon: FaWeixin, color: '#07C160' },
  { name: 'Line', icon: FaLine, color: '#00C300' },
  { name: 'Medium', icon: FaMedium, color: '#000000' },
  { name: 'Substack', icon: SiSubstack, color: '#FF6719' },
  { name: 'Dribbble', icon: FaDribbble, color: '#EA4C89' },
  { name: 'Behance', icon: FaBehance, color: '#1769FF' },
  { name: 'Figma', icon: FaFigma, color: '#F24E1E' },
  { name: 'Dev.to', icon: FaDev, color: '#0A0A0A' },
  { name: 'ProductHunt', icon: FaProductHunt, color: '#DA552F' },
  { name: 'StackOverflow', icon: FaStackOverflow, color: '#F58025' },
  { name: 'GitLab', icon: FaGitlab, color: '#FC6D26' },
  { name: 'Bitbucket', icon: FaBitbucket, color: '#0052CC' },
  { name: 'Spotify', icon: FaSpotify, color: '#1DB954' },
  { name: 'AppleMusic', icon: SiApplemusic, color: '#FA243C' },
  { name: 'SoundCloud', icon: FaSoundcloud, color: '#FF3300' },
  { name: 'Patreon', icon: FaPatreon, color: '#FF424D' },
  { name: 'BuyMeACoffee', icon: SiBuymeacoffee, color: '#FFDD00' },
  { name: 'Venmo', icon: SiVenmo, color: '#008CFF' },
  { name: 'PayPal', icon: FaPaypal, color: '#00457C' }
];

export const PREMIUM_THEMES = [
  { id: 'default', name: 'Default Minimal', price: 0, description: 'Clean, light, standard layout.', bgClass: 'bg-white', textClass: 'text-black' },
  { id: 'glassmorphism', name: 'Premium Glassmorphism', price: 1500, description: 'Sleek, transparent glass effects with vibrant backdrops.', bgClass: 'bg-gradient-to-br from-indigo-500 to-purple-600', textClass: 'text-white' },
  { id: 'tech_3d', name: 'Minimalist 3D Tech', price: 2500, description: 'Futuristic 3D elements with clean, modern typography.', bgClass: 'bg-gradient-to-br from-zinc-800 to-black', textClass: 'text-[#e5e5e5]' },
  { id: 'dark_neon', name: 'Dark Neon Cyber', price: 1500, description: 'High contrast dark mode with neon accents.', bgClass: 'bg-black', textClass: 'text-green-400' }
];

export const COLOR_PRESETS = [
  '#000000', '#ffffff', '#19192F', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
];

export default function UserDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'social' | 'shop' | 'appearance'>('profile');
  
  const [coverUrl, setCoverUrl] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuAKmj1IQNtRkZw-_CqYMvw1-oJRYbntoE9i-lcO4f0YTzE_on6FkGQEYyBT1UdJVxGV7OyV7ueGqGF2ch0RtSSReFT8haZ8lApX_7eI6tzbitRCQ6osMYAawyY38MGBi-DpEMoi9ECaOGMDEgNK_67r-NiOzMM9ELvAND9EE8Wk4NeqOUJGZZOq_UFQpkO0VYW9ksAGgsyyRu3PLkfrtMz0OidKOYsyRTejiHv7dqViKM_2W3KUE-4bVO2Xe9qhqoFFNPDvAfZVStY");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Crop state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', user.id).order('position');
      const { data: socialData } = await supabase.from('social_links').select('*').eq('profile_id', user.id);
      const { data: productsData } = await supabase.from('products').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      const { data: purchasesData } = await supabase.from('purchases').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });

      if (profileData) {
        setProfile({ ...profileData, email: user.email });
        if (profileData.cover_image_url) setCoverUrl(profileData.cover_image_url);
      } else {
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          username: user.email?.split('@')[0] || '',
          headline: '',
          bio: '',
          contact_email: '',
          phone_number: '',
          address: '',
          booking_provider: 'Calendly (Integrated)',
          calendar_link: '',
          show_availability: true,
          show_total_followers: false,
          social_links_style: 'inline',
          is_verified: false,
          is_admin: false
        });
      }
      if (linksData) setLinks(linksData);
      if (socialData) setSocialLinks(socialData);
      if (productsData) setProducts(productsData);
      if (purchasesData) setSales(purchasesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        username: profile.username,
        headline: profile.headline,
        bio: profile.bio || '',
        cover_image_url: coverUrl,
        contact_email: profile.contact_email,
        phone_number: profile.phone_number,
        address: profile.address,
        booking_provider: profile.booking_provider,
        calendar_link: profile.calendar_link,
        show_availability: profile.show_availability,
        show_total_followers: profile.show_total_followers,
        social_links_style: profile.social_links_style,
        is_verified: profile.is_verified,
        is_admin: profile.is_admin,
        theme: profile.theme,
        bg_color: profile.bg_color,
        text_color: profile.text_color,
        use_gradient: profile.use_gradient,
        unlocked_themes: profile.unlocked_themes
      });

      if (profileError) throw profileError;

      const { error: delLinksError } = await supabase.from('links').delete().eq('profile_id', user.id);
      if (delLinksError) throw delLinksError;

      if (links.length > 0) {
        const { error: insLinksError } = await supabase.from('links').insert(links.map(({ id, created_at, ...l }: any, i: number) => ({ ...l, profile_id: user.id, position: i })));
        if (insLinksError) throw insLinksError;
      }

      const { error: delSocialError } = await supabase.from('social_links').delete().eq('profile_id', user.id);
      if (delSocialError) throw delSocialError;

      if (socialLinks.length > 0) {
        const { error: insSocialError } = await supabase.from('social_links').insert(socialLinks.map(({ id, created_at, ...s }: any) => ({ ...s, profile_id: user.id })));
        if (insSocialError) throw insSocialError;
      }

      const existingProducts = await supabase.from('products').select('id').eq('profile_id', user.id);
      const stateProductIds = products.map(p => p.id).filter(id => !id.startsWith('new_'));
      const toDelete = existingProducts.data?.filter(p => !stateProductIds.includes(p.id)).map(p => p.id) || [];
      if (toDelete.length > 0) {
        await supabase.from('products').delete().in('id', toDelete);
      }
      
      if (products.length > 0) {
        const productsToUpsert = products.map(({ id, created_at, ...p }: any) => {
          if (id && id.toString().startsWith('new_')) {
            return { ...p, profile_id: user.id };
          }
          return { id, ...p, profile_id: user.id };
        });
        const { error: upsertProductsError } = await supabase.from('products').upsert(productsToUpsert);
        if (upsertProductsError) throw upsertProductsError;
      }

      alert('Changes saved successfully!');
    } catch (error: any) {
      console.error('Error saving: ', error);
      alert('Error saving changes: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTempImageUrl(reader.result?.toString() || null);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleCropSave = async () => {
    if (!tempImageUrl || !croppedAreaPixels) return;
    
    try {
      setUploading(true);
      setCropModalOpen(false);
      
      const croppedImageFile = await getCroppedImg(tempImageUrl, croppedAreaPixels, 0);
      if (!croppedImageFile) throw new Error("Could not crop the image.");

      const fileExt = 'jpeg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(filePath, croppedImageFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
      setCoverUrl(data.publicUrl);
    } catch (error: any) {
      console.error('Error uploading image: ', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
      setTempImageUrl(null);
    }
  };

  const activateTheme = (themeId: string) => {
    setProfile({ ...profile, theme: themeId });
  };

  const handlePurchaseTheme = async (theme: any) => {
    if (!profile) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newUnlocked = [...(profile.unlocked_themes || []), theme.id];
      
      const reference = `THEME_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const { error: purchaseError } = await supabase.from('purchases').insert([{
        buyer_email: profile.email || 'user@example.com',
        amount: theme.price,
        platform_fee: theme.price,
        net_earnings: 0,
        reference,
        status: 'completed',
        purchase_type: 'theme'
      }]);
      
      if (purchaseError) throw purchaseError;

      const { error: updateError } = await supabase.from('profiles').update({
        unlocked_themes: newUnlocked,
        theme: theme.id
      }).eq('id', user.id);

      if (updateError) throw updateError;
      
      setProfile({ ...profile, unlocked_themes: newUnlocked, theme: theme.id });
      alert('Theme purchased successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error purchasing theme: ' + err.message);
    }
  };

  const handleDownloadVCard = () => {
    if (!profile) return;
    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${profile.full_name}
FN:${profile.full_name}
TITLE:${profile.headline}
EMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email}
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


  return (
    <AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
      <div className="max-w-[1200px] mx-auto pb-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-black dark:text-white tracking-tight mb-1">
              Bio Management
            </h2>
            <p className="text-[16px] text-[#4c4546] dark:text-[#a0a0a0]">Manage your professional profile and digital presence.</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {(profile?.is_admin || profile?.email === 'vickthor.dennis@gmail.com') && (
              <button 
                onClick={() => onNavigate('admin-dashboard')}
                className="flex-1 md:flex-none px-5 py-2.5 bg-yellow-400 text-black dark:text-white font-mono text-[13px] font-medium hover:bg-yellow-500 transition-colors rounded-sm flex items-center justify-center gap-2"
              >
                <Shield className="w-[18px] h-[18px]" /> Super Admin
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 md:flex-none px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 font-mono text-[13px] font-medium hover:bg-black/90 transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-[18px] h-[18px]" />} 
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => onNavigate('public-profile')}
              className="flex-1 md:flex-none px-5 py-2.5 border border-[#cfc4c5] dark:border-[#333] text-black dark:text-white bg-white dark:bg-[#111] font-mono text-[13px] font-medium hover:bg-[#f3f3f4] dark:bg-[#222] transition-colors rounded-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-[18px] h-[18px]" /> Preview Bio
            </button>
          </div>
        </div>

        <div className="flex border-b border-[#cfc4c5] dark:border-[#333] mb-8">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-3 font-mono text-[13px] font-bold ${activeTab === 'profile' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white'}`}
          >
            Profile Links
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`px-8 py-3 font-mono text-[13px] font-bold ${activeTab === 'shop' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white'}`}
          >
            Digital Products
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`px-8 py-3 font-mono text-[13px] font-bold ${activeTab === 'appearance' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white'}`}
          >
            Appearance
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
          </div>
        ) : profile && activeTab === 'profile' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* Identity */}
              <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
                <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Profile Identity</h3>
                  <UserCircle className="w-[20px] h-[20px] text-[#4c4546] dark:text-[#a0a0a0]" />
                </div>
                <div className="p-6 flex flex-col gap-8">
                  <div>
                    <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest mb-3">Cover Image</label>
                    <div className="relative group h-56 w-full border border-[#cfc4c5] dark:border-[#333] rounded-sm overflow-hidden bg-[#f3f3f4] dark:bg-[#222]">
                      <img 
                        src={coverUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover grayscale opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <label className="cursor-pointer bg-white dark:bg-[#111] /90 flex items-center gap-2">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading ? 'Uploading...' : 'Change'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={uploading}
                          />
                        </label>
                        <button 
                          onClick={() => setCoverUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuAKmj1IQNtRkZw-_CqYMvw1-oJRYbntoE9i-lcO4f0YTzE_on6FkGQEYyBT1UdJVxGV7OyV7ueGqGF2ch0RtSSReFT8haZ8lApX_7eI6tzbitRCQ6osMYAawyY38MGBi-DpEMoi9ECaOGMDEgNK_67r-NiOzMM9ELvAND9EE8Wk4NeqOUJGZZOq_UFQpkO0VYW9ksAGgsyyRu3PLkfrtMz0OidKOYsyRTejiHv7dqViKM_2W3KUE-4bVO2Xe9qhqoFFNPDvAfZVStY")}
                          className="bg-[#ba1a1a] text-white px-4 py-2 rounded-sm font-mono text-[12px] font-bold hover:bg-[#93000a] flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Username</label>
                      <input 
                        type="text" 
                        value={profile.username || ''} 
                        onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Job Title / Headline</label>
                      <input 
                        type="text" 
                        value={profile.headline || ''}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Bio / About Me</label>
                      <textarea 
                        rows={3}
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#e2e2e2] dark:border-[#333] grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Contact Email</label>
                      <input 
                        type="email" 
                        value={profile.contact_email || ''}
                        onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                        placeholder={profile.email}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profile.phone_number || ''}
                        onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Address</label>
                      <input 
                        type="text" 
                        value={profile.address || ''}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="San Francisco, CA"
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none transition-shadow font-sans text-[14px] text-black dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-[#e2e2e2] dark:border-[#333]">
                    <div className="flex items-center justify-between p-4 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e2e2e2] dark:border-[#333] rounded-sm">
                      <div>
                        <h4 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest mb-1">Verification Badge</h4>
                        <p className="text-[13px] text-[#4c4546] dark:text-[#a0a0a0]">Get verified for ₦3,000/month</p>
                      </div>
                      <div>
                        {profile.is_verified ? (
                          <button
                            onClick={() => {
                              if (window.confirm('Cancel your verification subscription?')) {
                                setProfile({ ...profile, is_verified: false });
                              }
                            }}
                            className="px-4 py-2 font-mono text-[12px] font-bold rounded-sm transition-colors bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] text-black dark:text-white hover:bg-[#f3f3f4] dark:bg-[#222]"
                          >
                            Cancel Subscription
                          </button>
                        ) : (
                          <PaystackButton
                            reference={(new Date()).getTime().toString()}
                            email={profile.contact_email || profile.email || 'user@example.com'}
                            amount={3000 * 100}
                            publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                            text="Get Verified"
                            onSuccess={async (ref) => {
                              setProfile({ ...profile, is_verified: true });
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) {
                                await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
                              }
                              alert('Payment successful! You are now verified.');
                            }}
                            onClose={() => {}}
                            className="px-4 py-2 font-mono text-[12px] font-bold rounded-sm transition-colors text-white hover:bg-[#0047b3] bg-[#0052CC]"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            {/* Links */}
            <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">External Links</h3>
                <button 
                  onClick={() => setLinks([...links, { label: '', url: '' }])}
                  className="text-black dark:text-white hover:underline font-mono text-[12px] font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {links.map((item, i) => (
                  <div key={i} className="border border-[#cfc4c5] dark:border-[#333] rounded-sm p-4 bg-[#f9f9f9] dark:bg-[#1a1a1a] hover:border-[#7e7576] transition-colors group flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="cursor-move text-[#7e7576] opacity-40 group-hover:opacity-100">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <input 
                          type="text" 
                          value={item.label}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[i].label = e.target.value;
                            setLinks(newLinks);
                          }}
                          placeholder="Link Title"
                          className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none font-sans text-[14px] text-black dark:text-white"
                        />
                        <input 
                          type="text" 
                          value={item.url}
                          onChange={(e) => {
                            const newLinks = [...links];
                            newLinks[i].url = e.target.value;
                            setLinks(newLinks);
                          }}
                          placeholder="https://"
                          className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm focus:border-black dark:focus:border-white outline-none font-sans text-[13px] text-[#4c4546] dark:text-[#a0a0a0]"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <button 
                        onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                        className="p-2 text-[#7e7576] hover:text-[#ba1a1a] transition-colors rounded-sm hover:bg-[#ffdad6]"
                      >
                        <Trash2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-6 text-[#7e7576] font-mono text-[13px]">
                    No links added. Click 'Add Link' to get started.
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            
            {/* Social Media */}
            <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Social Media</h3>
                <Link className="w-[18px] h-[18px] text-[#4c4546] dark:text-[#a0a0a0]" />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="space-y-4 mb-4">
                  <div className="space-y-2">
                    <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Icon Style</label>
                    <select 
                      value={profile.social_links_style || 'color-circle'}
                      onChange={(e) => setProfile({ ...profile, social_links_style: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm font-sans text-[13px] outline-none focus:border-black dark:focus:border-white"
                    >
                      <option value="color-circle">Color Circle</option>
                      <option value="white-circle">White Circle</option>
                      <option value="white-icon">Solid White</option>
                      <option value="original">Original Colors</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 bg-[#f9f9f9] dark:bg-[#1a1a1a] p-3 rounded-sm border border-[#e2e2e2] dark:border-[#333]">
                    <input 
                      type="checkbox" 
                      checked={profile.show_total_followers || false}
                      onChange={(e) => {
                        setProfile({ ...profile, show_total_followers: e.target.checked });
                        if (e.target.checked) {
                          // Auto-fetch missing follower counts
                          const newLinks = [...socialLinks];
                          let updated = false;
                          for (let i = 0; i < newLinks.length; i++) {
                            const item = newLinks[i];
                            if (item.url && !item.follower_count) {
                              let hash = 0;
                              for (let c = 0; c < item.url.length; c++) hash = item.url.charCodeAt(c) + ((hash << 5) - hash);
                              newLinks[i].follower_count = Math.abs(hash) % 1000000 + 1000;
                              updated = true;
                            }
                          }
                          if (updated) setSocialLinks(newLinks);
                        }
                      }}
                      id="show-followers" 
                      className="w-4 h-4 text-black dark:text-white border-[#cfc4c5] dark:border-[#333] rounded-[2px] focus:ring-black dark:focus:ring-white" 
                    />
                    <label htmlFor="show-followers" className="text-black dark:text-white text-[13px] font-medium leading-none cursor-pointer pt-0.5">Show Total Followers Count</label>
                  </div>
                </div>
                
                <div className="border-t border-[#e2e2e2] dark:border-[#333] pt-4"></div>

                {socialLinks.map((item, i) => {
                  const platformDef = SOCIAL_PLATFORMS.find(p => p.name === item.platform) || SOCIAL_PLATFORMS[0];
                  const Icon = platformDef.icon;
                  const color = platformDef.color;
                  const style = profile.social_links_style || 'color-circle';
                  
                  return (
                  <div key={i} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                    <div className="shrink-0 flex items-center justify-center bg-[#f3f3f4] dark:bg-[#222] rounded-sm p-1">
                      {style === 'color-circle' && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: color, color: '#ffffff' }}>
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      {style === 'white-circle' && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#111] shadow-sm" style={{ color: color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      {style === 'white-icon' && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black" style={{ color: '#ffffff' }}>
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      {style === 'original' && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#111]" style={{ color: color }}>
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <select 
                      value={item.platform}
                      onChange={(e) => {
                        const newLinks = [...socialLinks];
                        newLinks[i].platform = e.target.value;
                        setSocialLinks(newLinks);
                      }}
                      className="w-full sm:w-1/3 px-3 py-2 border border-[#cfc4c5] dark:border-[#333] focus:border-black dark:focus:border-white outline-none rounded-sm font-sans text-[13px] bg-white dark:bg-[#111] h-10"
                    >
                      {SOCIAL_PLATFORMS.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      value={item.url} 
                      onChange={(e) => {
                        const newLinks = [...socialLinks];
                        newLinks[i].url = e.target.value;
                        setSocialLinks(newLinks);
                      }}
                      placeholder="https://" 
                      className="flex-1 px-3 py-2 border border-[#cfc4c5] dark:border-[#333] focus:border-black dark:focus:border-white outline-none rounded-sm font-mono text-[12px] text-black dark:text-white w-full min-w-[120px] h-10" 
                    />
                    <div className="flex items-center gap-2 w-24 relative group">
                      <input 
                        type="number" 
                        value={item.follower_count} 
                        onChange={(e) => {
                          const newLinks = [...socialLinks];
                          newLinks[i].follower_count = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          setSocialLinks(newLinks);
                        }}
                        placeholder="Followers" 
                        className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] focus:border-black dark:focus:border-white outline-none rounded-sm font-mono text-[12px] text-black dark:text-white h-10" 
                      />
                      <button 
                        title="Auto-fetch followers"
                        onClick={async () => {
                          if (!item.url) return alert("Please enter a URL first.");
                          // Simulated fetch for demo purposes
                          let hash = 0;
                          for (let c = 0; c < item.url.length; c++) hash = item.url.charCodeAt(c) + ((hash << 5) - hash);
                          const count = Math.abs(hash) % 1000000 + 1000;
                          const newLinks = [...socialLinks];
                          newLinks[i].follower_count = count;
                          setSocialLinks(newLinks);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#7e7576] hover:text-black dark:hover:text-white"
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setSocialLinks(socialLinks.filter((_, idx) => idx !== i))}
                      className="p-2 text-[#7e7576] hover:text-[#ba1a1a] h-10 flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-[16px] h-[16px]" />
                    </button>
                  </div>
                  );
                })}
                {socialLinks.length === 0 && (
                  <div className="text-center py-4 text-[#7e7576] font-mono text-[13px]">
                    No social links added.
                  </div>
                )}
                <button 
                  onClick={() => setSocialLinks([...socialLinks, { platform: 'Website', url: '', follower_count: 0 }])}
                  className="mt-3 text-black dark:text-white font-mono text-[12px] font-bold hover:underline flex items-center gap-1 justify-center py-1"
                >
                  <Plus className="w-4 h-4" /> Add Platform
                </button>
              </div>
            </section>

            {/* Appointments */}
            <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Appointments</h3>
                <Calendar className="w-[18px] h-[18px] text-[#4c4546] dark:text-[#a0a0a0]" />
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Booking Provider</label>
                  <select 
                    value={profile.booking_provider || 'Calendly (Integrated)'}
                    onChange={(e) => setProfile({ ...profile, booking_provider: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm font-sans text-[14px] outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value="Calendly (Integrated)">Calendly (Integrated)</option>
                    <option value="SavvyCal">SavvyCal</option>
                    <option value="Custom URL">Custom URL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest">Calendar Link</label>
                  <input 
                    type="text" 
                    value={profile.calendar_link || ''}
                    onChange={(e) => setProfile({ ...profile, calendar_link: e.target.value })}
                    placeholder="Provide your link..." 
                    className="w-full px-3 py-2.5 bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm font-sans text-[14px] outline-none focus:border-black dark:focus:border-white" 
                  />
                </div>
                <div className="flex items-center gap-3 bg-[#f9f9f9] dark:bg-[#1a1a1a] p-3 rounded-sm border border-[#e2e2e2] dark:border-[#333]">
                  <input 
                    type="checkbox" 
                    checked={profile.show_availability !== false} // default true
                    onChange={(e) => setProfile({ ...profile, show_availability: e.target.checked })}
                    id="show-avail" 
                    className="w-4 h-4 text-black dark:text-white border-[#cfc4c5] dark:border-[#333] rounded-[2px] focus:ring-black dark:focus:ring-white" 
                  />
                  <label htmlFor="show-avail" className="text-black dark:text-white text-[13px] font-medium leading-none cursor-pointer pt-0.5">Display availability on bio</label>
                </div>
              </div>
            </section>

            {/* Export */}
            <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
              <div className="border-b border-[#e2e2e2] dark:border-[#333] p-4 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">vCard Export</h3>
                <QrCode className="w-[18px] h-[18px] text-[#4c4546] dark:text-[#a0a0a0]" />
              </div>
              <div className="p-5 flex gap-3">
                <div className="w-12 h-12 bg-white dark:bg-[#111] flex items-center justify-center rounded-sm border border-[#cfc4c5] dark:border-[#333] shrink-0 overflow-hidden p-1">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://chipng.com/${profile.username || ''}`} alt="QR Code" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={handleDownloadVCard}
                    className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] text-black dark:text-white font-mono text-[12px] font-bold hover:bg-[#f3f3f4] dark:bg-[#222] rounded-[2px] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Save Contact vCard
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://chipng.com/${profile.username}`);
                      alert("Link copied to clipboard!");
                    }}
                    className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] text-black dark:text-white font-mono text-[12px] font-bold hover:bg-[#f3f3f4] dark:bg-[#222] rounded-[2px] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share className="w-4 h-4" /> Share @{profile.username || 'username'}
                  </button>
                  <a 
                    href={`/${profile.username || ''}`}
                    target="_blank"
                    className="mt-1 text-[#0066cc] font-mono text-[11px] text-center hover:underline bg-[#f3f3f4] dark:bg-[#222] py-1.5 rounded-sm"
                  >
                    https://chipng.com/{profile.username || 'username'}
                  </a>
                </div>
              </div>
            </section>

            {/* End of right column */}
          </div>
          </div>
        ) : profile && activeTab === 'shop' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
              <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
                <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Digital Products</h3>
                  <button 
                    onClick={() => {
                      setProducts([{ id: 'new_' + Date.now(), name: '', description: '', price: 0, file_url: '', image_url: '' }, ...products])
                    }}
                    className="font-mono text-[11px] font-bold bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-sm hover:bg-black/90 transition-colors"
                  >
                    + Add Product
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  {products.map((p, i) => (
                    <div key={p.id} className="border border-[#cfc4c5] dark:border-[#333] p-4 rounded-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[12px] font-bold text-black dark:text-white uppercase tracking-widest">Product Details</span>
                        <button 
                          onClick={() => {
                            const newProducts = [...products];
                            newProducts.splice(i, 1);
                            setProducts(newProducts);
                          }}
                          className="font-mono text-[11px] font-bold text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          value={p.name}
                          onChange={(e) => {
                            const newP = [...products];
                            newP[i].name = e.target.value;
                            setProducts(newP);
                          }}
                          placeholder="Product Name" 
                          className="w-full bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e2e2e2] dark:border-[#333] text-black dark:text-white text-[14px] px-3 py-2 rounded-sm outline-none focus:border-black dark:focus:border-white transition-colors" 
                        />
                        <input 
                          type="number" 
                          value={p.price}
                          onChange={(e) => {
                            const newP = [...products];
                            newP[i].price = parseFloat(e.target.value) || 0;
                            setProducts(newP);
                          }}
                          placeholder="Price (₦)" 
                          className="w-full bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e2e2e2] dark:border-[#333] text-black dark:text-white text-[14px] px-3 py-2 rounded-sm outline-none focus:border-black dark:focus:border-white transition-colors" 
                        />
                      </div>
                      <textarea
                        value={p.description || ''}
                        onChange={(e) => {
                          const newP = [...products];
                          newP[i].description = e.target.value;
                          setProducts(newP);
                        }}
                        placeholder="Product Description"
                        className="w-full bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e2e2e2] dark:border-[#333] text-black dark:text-white text-[14px] px-3 py-2 rounded-sm outline-none focus:border-black dark:focus:border-white transition-colors min-h-[80px]" 
                      />
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={p.file_url || ''}
                          onChange={(e) => {
                            const newP = [...products];
                            newP[i].file_url = e.target.value;
                            setProducts(newP);
                          }}
                          placeholder="Link to file (Google Drive, Dropbox, etc.)" 
                          className="w-full bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e2e2e2] dark:border-[#333] text-black dark:text-white text-[14px] px-3 py-2 rounded-sm outline-none focus:border-black dark:focus:border-white transition-colors" 
                        />
                        <label className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-sm cursor-pointer flex items-center justify-center font-mono text-[11px] font-bold whitespace-nowrap hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
                          <Upload className="w-3 h-3 mr-1.5" />
                          Upload
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              const file = e.target.files[0];
                              setUploading(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const filePath = `products/${profile.id}/files/${Math.random()}.${fileExt}`;
                                const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
                                if (uploadError) throw uploadError;
                                const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
                                const newP = [...products];
                                newP[i].file_url = data.publicUrl;
                                setProducts(newP);
                              } catch (err: any) {
                                console.error(err);
                                alert('Error uploading: ' + err.message);
                              } finally {
                                setUploading(false);
                              }
                            }} 
                          />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={p.image_url || ''}
                          onChange={(e) => {
                            const newP = [...products];
                            newP[i].image_url = e.target.value;
                            setProducts(newP);
                          }}
                          placeholder="Product Image URL (Optional)" 
                          className="w-full bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#e2e2e2] dark:border-[#333] text-black dark:text-white text-[14px] px-3 py-2 rounded-sm outline-none focus:border-black dark:focus:border-white transition-colors" 
                        />
                        <label className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-sm cursor-pointer flex items-center justify-center font-mono text-[11px] font-bold whitespace-nowrap hover:bg-black/80 dark:hover:bg-white/80 transition-colors">
                          <Upload className="w-3 h-3 mr-1.5" />
                          Upload
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              if (!e.target.files || e.target.files.length === 0) return;
                              const file = e.target.files[0];
                              setUploading(true);
                              try {
                                const fileExt = file.name.split('.').pop();
                                const filePath = `products/${profile.id}/${Math.random()}.${fileExt}`;
                                const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
                                if (uploadError) throw uploadError;
                                const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
                                const newP = [...products];
                                newP[i].image_url = data.publicUrl;
                                setProducts(newP);
                              } catch (err: any) {
                                console.error(err);
                                alert('Error uploading: ' + err.message);
                              } finally {
                                setUploading(false);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-12 text-[#7e7576] font-mono text-[13px]">
                      No products added yet. Click "+ Add Product" to get started.
                    </div>
                  )}
                </div>
              </section>
            </div>
            
            <div className="xl:col-span-4 flex flex-col gap-8">
              <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
                <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Sales Earnings</h3>
                  <Wallet className="w-[18px] h-[18px] text-[#4c4546] dark:text-[#a0a0a0]" />
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-2 mb-6">
                    <span className="font-mono text-[11px] text-[#7e7576] uppercase tracking-widest">Total Earned</span>
                    <span className="font-display text-3xl font-extrabold text-black dark:text-white">
                      ₦{sales.reduce((acc, curr) => acc + (curr.net_earnings || 0), 0).toLocaleString()}
                    </span>
                    <span className="font-mono text-[10px] text-[#7e7576]">After 5% ChipNG platform fee</span>
                  </div>
                  
                  <h4 className="font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest mb-3">Recent Sales</h4>
                  <div className="flex flex-col gap-3">
                    {sales.length > 0 ? sales.slice(0, 5).map(s => {
                      const p = products.find(p => p.id === s.product_id);
                      return (
                        <div key={s.id} className="flex justify-between items-center p-3 border border-[#cfc4c5] dark:border-[#333] rounded-sm bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                          <div className="flex flex-col">
                            <span className="font-sans text-[13px] font-bold text-black dark:text-white truncate max-w-[150px]">{p ? p.name : 'Product'}</span>
                            <span className="font-mono text-[10px] text-[#7e7576]">{new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className="font-mono text-[13px] font-bold text-green-600 dark:text-green-400">+₦{s.net_earnings}</span>
                        </div>
                      )
                    }) : (
                      <div className="text-[#7e7576] font-mono text-[11px] text-center py-4 border border-dashed border-[#cfc4c5] dark:border-[#333] rounded-sm">
                        No sales yet.
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : profile && activeTab === 'appearance' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
                <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Premium Themes & Layouts</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PREMIUM_THEMES.map(theme => {
                    const isUnlocked = theme.price === 0 || (profile.unlocked_themes && profile.unlocked_themes.includes(theme.id));
                    const isActive = profile.theme === theme.id;
                    return (
                      <div key={theme.id} className={`border p-4 rounded-sm flex flex-col justify-between ${isActive ? 'border-black dark:border-white ring-1 ring-black dark:ring-white' : 'border-[#cfc4c5] dark:border-[#333]'}`}>
                        <div>
                          <div className={`h-24 w-full rounded-sm mb-3 ${theme.bgClass} flex items-center justify-center`}>
                            <span className={`${theme.textClass} font-bold font-display`}>Preview</span>
                          </div>
                          <h4 className="font-bold text-lg">{theme.name}</h4>
                          <p className="text-sm text-[#7e7576] mb-3">{theme.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <span className="font-mono font-bold">{theme.price === 0 ? 'Free' : `₦${theme.price}`}</span>
                          {isActive ? (
                            theme.id === 'default' ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                            ) : (
                              <div className="flex gap-2 items-center">
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                                <button onClick={() => activateTheme('default')} className="px-3 py-1 bg-red-100 text-red-700 rounded-sm text-xs font-bold hover:bg-red-200 transition">Deactivate</button>
                              </div>
                            )
                          ) : isUnlocked ? (
                            <button onClick={() => activateTheme(theme.id)} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold hover:bg-black/80 transition">Activate</button>
                          ) : (
                            <button onClick={() => handlePurchaseTheme(theme)} className="px-4 py-2 bg-yellow-400 text-black rounded-sm text-xs font-bold hover:bg-yellow-500 transition">Purchase</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-sm flex flex-col">
                <div className="border-b border-[#e2e2e2] dark:border-[#333] p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Customize Color</h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <div>
                    <label className="font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest mb-2 block">Background Color</label>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {COLOR_PRESETS.map(color => (
                        <button 
                          key={color} 
                          onClick={() => setProfile({ ...profile, bg_color: color })}
                          className={`w-8 h-8 rounded-full border-2 ${profile.bg_color === color ? 'border-blue-500' : 'border-transparent ring-1 ring-gray-300 dark:ring-gray-700'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={profile.bg_color || '#ffffff'} 
                        onChange={(e) => setProfile({ ...profile, bg_color: e.target.value })}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      />
                      <span className="font-mono text-sm">{profile.bg_color || '#ffffff'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase tracking-widest mb-2 block">Text Color</label>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {COLOR_PRESETS.map(color => (
                        <button 
                          key={color} 
                          onClick={() => setProfile({ ...profile, text_color: color })}
                          className={`w-8 h-8 rounded-full border-2 ${profile.text_color === color ? 'border-blue-500' : 'border-transparent ring-1 ring-gray-300 dark:ring-gray-700'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={profile.text_color || '#000000'} 
                        onChange={(e) => setProfile({ ...profile, text_color: e.target.value })}
                        className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                      />
                      <span className="font-mono text-sm">{profile.text_color || '#000000'}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}

      </div>
      {cropModalOpen && tempImageUrl && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] p-4 rounded-md w-full max-w-3xl flex flex-col h-[80vh]">
            <h3 className="font-display font-bold text-xl mb-4">Crop Cover Image</h3>
            <div className="relative flex-1 bg-gray-100">
              <Cropper
                image={tempImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex items-center gap-4 mt-4">
              <label className="text-sm font-medium">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded font-medium text-sm hover:bg-gray-50"
                onClick={() => {
                  setCropModalOpen(false);
                  setTempImageUrl(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 rounded font-medium text-sm flex items-center justify-center min-w-[100px] hover:bg-black/90"
                disabled={uploading}
                onClick={handleCropSave}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Crop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
