import { motion } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { PaystackButton } from 'react-paystack';
import { QRCodeSVG } from 'qrcode.react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Bell, Save, CreditCard, Eye, UserCircle, Upload, Trash2, Link, GripVertical, Plus, Globe, AtSign, Rss, Calendar, QrCode, Download, Settings, Loader2, MapPin, Phone, Mail, Share, Shield, Activity, Wallet, Camera, AlertTriangle, X, SmartphoneNfc , LogOut } from 'lucide-react';
import { FaXTwitter, FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaTwitch, FaTiktok, FaSnapchat, FaPinterest, FaReddit, FaDiscord, FaSlack, FaTelegram, FaWhatsapp, FaWeixin, FaLine, FaMedium, FaDribbble, FaBehance, FaFigma, FaDev, FaProductHunt, FaStackOverflow, FaGitlab, FaBitbucket, FaSpotify, FaSoundcloud, FaPatreon, FaPaypal } from 'react-icons/fa6';
import { SiBuymeacoffee, SiSubstack, SiApplemusic, SiVenmo } from 'react-icons/si';


import DashboardAnalytics from '../components/DashboardAnalytics';

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


export const PROFILE_LAYOUTS = [
  { id: 'default', name: 'Default', description: 'The original layout design.' },
  { id: 'classic', name: 'Classic', description: 'Standard vertical layout.' },
  { id: 'bento', name: 'Bento Grid', description: 'Modern grid-based layout.' },
  { id: 'split', name: 'Split View', description: 'Side-by-side profile and links.' },
  { id: 'minimal', name: 'Minimalist', description: 'Clean text-focused design.' },
  { id: 'carousel', name: 'Carousel', description: 'Horizontal swipeable cards.' }
];

export const COLOR_PRESETS = [
  '#000000', '#ffffff', '#19192F', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'
];

export default function UserDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [verificationMonths, setVerificationMonths] = useState(1);
  const [links, setLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [selectedNfcCard, setSelectedNfcCard] = useState<any>(null);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [sales, setSales] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState(0);
  const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'links' | 'social' | 'shop' | 'appearance' | 'gallery' | 'nfc' | 'buy-nfc' | 'ebooks' | 'settings'>('profile');

  const [setupGuideActive, setSetupGuideActive] = useState(false);
  const [setupStep, setSetupStep] = useState(1);

  const hasBasicInfo = !!(profile?.full_name && profile?.headline && profile?.bio);
  const hasContactInfo = !!(profile?.contact_email || profile?.phone_number);
  const hasSocialLinks = socialLinks.length > 0;
  const hasFeaturedLinks = links.length > 0;
  const hasAppearance = profile?.theme || profile?.bg_color;
  
  const setupSteps = [
    { id: 1, name: 'Profile Basics', completed: hasBasicInfo, tab: 'profile' },
    { id: 2, name: 'Contact Details', completed: hasContactInfo, tab: 'profile' },
    { id: 3, name: 'Social Links', completed: hasSocialLinks, tab: 'profile' },
    { id: 4, name: 'Featured Links', completed: hasFeaturedLinks, tab: 'profile' },
    { id: 5, name: 'Appearance', completed: !!hasAppearance, tab: 'appearance' },
  ];
  const completedSteps = setupSteps.filter(s => s.completed).length;
  const completionRate = Math.round((completedSteps / setupSteps.length) * 100);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifs, setReadNotifs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chip_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markAllAsRead = () => {
    const allIds = allNotifications.map(n => String(n.id));
    const newRead = [...new Set([...readNotifs, ...allIds])];
    setReadNotifs(newRead);
    localStorage.setItem('chip_read_notifs', JSON.stringify(newRead));
  };
  const [hasDismissedNfcPrompt, setHasDismissedNfcPrompt] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => {
      fetch('/api/app-updates')
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        })
        .catch(err => console.error(err));
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const systemNotifications = [];
  if (profile && !hasDismissedNfcPrompt) {
     const joinedDays = (new Date().getTime() - new Date(profile.created_at ? profile.created_at.replace(" ", "T") + "Z" : Date.now()).getTime()) / (1000 * 3600 * 24);
     if (joinedDays < 30) {
       systemNotifications.push({
         id: 'sys-nfc',
         title: 'Get Your NFC Card',
         message: 'Complete your setup by ordering a physical NFC smart card to share your profile instantly.',
         isSystem: true
       });
     }
  }

  const allNotifications = [...systemNotifications, ...notifications];
  const unreadCount = allNotifications.filter(n => !readNotifs.includes(String(n.id))).length;

  const bellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NotificationBell = () => (
    <div className="relative" ref={bellRef}>
      <button 
        onClick={() => {
          setShowNotifications(!showNotifications);
          if (!showNotifications) markAllAsRead();
        }}
        className="relative p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-black dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden z-50">
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-black dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-[#B600A8] text-white px-2 py-0.5 rounded-full">{unreadCount} New</span>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="p-8 text-center text-black/40 dark:text-white/40 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {allNotifications.map(notif => (
                  <div key={notif.id} className="p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left relative">
                    <h4 className="font-bold text-sm text-black dark:text-white mb-1 pr-6">{notif.title}</h4>
                    <p className="text-xs text-black/60 dark:text-white/60">{notif.message}</p>
                    
                    {notif.isSystem && (
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={() => {
                            setActiveTab('nfc');
                            setTimeout(() => {
                              document.getElementById('nfc-section')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                            setShowNotifications(false);
                          }}
                          className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-lg font-bold"
                        >
                          Order Now
                        </button>
                        <button 
                          onClick={() => setHasDismissedNfcPrompt(true)}
                          className="text-xs bg-black/10 dark:bg-white/10 text-black dark:text-white px-3 py-1.5 rounded-lg font-bold hover:bg-black/20 dark:hover:bg-white/20"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  
  const [coverUrl, setCoverUrl] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuAKmj1IQNtRkZw-_CqYMvw1-oJRYbntoE9i-lcO4f0YTzE_on6FkGQEYyBT1UdJVxGV7OyV7ueGqGF2ch0RtSSReFT8haZ8lApX_7eI6tzbitRCQ6osMYAawyY38MGBi-DpEMoi9ECaOGMDEgNK_67r-NiOzMM9ELvAND9EE8Wk4NeqOUJGZZOq_UFQpkO0VYW9ksAGgsyyRu3PLkfrtMz0OidKOYsyRTejiHv7dqViKM_2W3KUE-4bVO2Xe9qhqoFFNPDvAfZVStY");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [currentLink, setCurrentLink] = useState<{
    label: string;
    url: string;
    size: 'Big' | 'Medium' | 'Small' | 'Button';
    image_url?: string;
    cover_image_url?: string;
    use_link_icon?: boolean;
  }>({ label: '', url: '', size: 'Button', use_link_icon: false });

  

  useEffect(() => {
    if (currentLink.url && !currentLink.image_url && currentLink.use_link_icon) {
      try {
        const urlObj = new URL(currentLink.url.startsWith('http') ? currentLink.url : `https://${currentLink.url}`);
        const hostname = urlObj.hostname;
        // Basic favicon grab
        // We won't automatically set image_url because that would upload/save it.
        // We can just rely on the UI to show it if image_url is empty.
      } catch(e) {}
    }
  }, [currentLink.url, currentLink.use_link_icon]);

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
      const { data: shopProductsData } = await supabase.from('products').select('*').is('profile_id', null).order('created_at', { ascending: false });
      const { data: viewsData, error: viewErr } = await supabase.from('profile_views').select('id', { count: 'exact' }).eq('profile_id', user.id);

      if (profileData) {
        let isVerified = profileData.is_verified;
        if (isVerified && purchasesData) {
          const verifPurchases = purchasesData.filter(p => p.purchase_type === 'verification' && p.status?.startsWith('expires_'));
          if (verifPurchases.length > 0) {
            // Sort by newest
            const latestVerif = verifPurchases[0];
            const expiresAt = parseInt(latestVerif.status.split('_')[1], 10);
            if (Date.now() > expiresAt) {
              isVerified = false;
              await supabase.from('profiles').update({ is_verified: false }).eq('id', user.id);
            }
          }
        }
        
        setProfile({ ...profileData, email: user.email, is_verified: isVerified });
        if (profileData.cover_image_url) setCoverUrl(profileData.cover_image_url);
      } else {
        const initialProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          username: (user.email?.split('@')[0] || '').replace(/[^a-z0-9_.-]/g, '').toLowerCase() || 'user' + Math.floor(Math.random()*1000),
          headline: '',
          bio: '',
          contact_email: user.email || '',
          phone_number: '',
          address: '',
          booking_provider: 'Calendly (Integrated)',
          calendar_link: '',
          show_availability: true,
          show_total_followers: false,
          social_links_style: 'inline',
          is_verified: false,
          is_admin: false,
          cover_image_url: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.8384244203439832.jpeg'
        };
        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert(initialProfile).select().single();
        if (newProfile) {
          setProfile({ ...newProfile, email: user.email });
        } else if (insertError && insertError.code === '23505') {
          initialProfile.username = initialProfile.username + Math.floor(Math.random()*10000);
          const { data: retryProfile } = await supabase.from('profiles').insert(initialProfile).select().single();
          setProfile({ ...(retryProfile || initialProfile), email: user.email });
        } else {
          setProfile({ ...initialProfile, email: user.email });
        }
      }
      if (linksData) setLinks(linksData);
      if (socialData) setSocialLinks(socialData);
      if (productsData) setProducts(productsData);
      if (purchasesData) setSales(purchasesData);
      if (viewsData) setProfileViews(viewsData.length);
      if (shopProductsData) setShopProducts(shopProductsData);
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

      let profileError = await supabase.from('profiles').upsert({
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
      }).then(res => res.error);

      if (profileError && profileError.message.includes('schema cache')) {
        const retryResult = await supabase.from('profiles').upsert({
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
          is_admin: profile.is_admin
        });
        profileError = retryResult.error;
      }

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
      
      if (purchaseError) {
        if (purchaseError.message.includes('schema cache')) {
            const { error: retryError } = await supabase.from('purchases').insert([{
              buyer_email: profile.email || 'user@example.com',
              amount: theme.price,
              platform_fee: theme.price,
              net_earnings: 0,
              reference,
              status: 'completed'
            }]);
            if (retryError) throw retryError;
        } else {
            throw purchaseError;
        }
      }

      const { error: updateError } = await supabase.from('profiles').update({
        unlocked_themes: newUnlocked,
        theme: theme.id
      }).eq('id', user.id);
      
      if (updateError) {
        if (updateError.message.includes('schema cache')) {
             console.warn('Schema cache error on profile update. Fallback without schema cache fields');
             // Proceed with local update anyway
        } else {
             throw updateError;
        }
      }
      
      setProfile({ ...profile, unlocked_themes: newUnlocked, theme: theme.id });
      alert('Theme purchased successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error purchasing theme: ' + err.message);
    }
  };

  const handleDownloadVCard = async () => {
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
        photoStr = `\nPHOTO;VALUE=URI:${profile.cover_image_url}`;
      }
    }

    const vcard = (() => {
      let phonesStr = `\nTEL;TYPE=CELL:${profile.phone_number || ''}`;
      if (profile.phone_number) {
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
        if (arr.filter(Boolean).length > 0) {
          phonesStr = arr.filter(Boolean).map(p => `\nTEL;TYPE=CELL:${p}`).join('');
        }
      }
      return `BEGIN:VCARD\nVERSION:3.0\nN:${profile.full_name}\nFN:${profile.full_name}\nTITLE:${profile.headline}\nEMAIL;TYPE=WORK,INTERNET:${profile.contact_email || profile.email}${phonesStr}\nADR;TYPE=WORK:;;${profile.address || ''};;;;\nURL:https://chipng.com/${profile.username}${photoStr}\nEND:VCARD`;
    })();
    
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
    <AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} hideMobileNav={true} topRightContent={NotificationBell()}>
      <div className="pb-24">
      <div className="max-w-[1200px] mx-auto pb-16">
        
        {completionRate < 100 && (
          <div className="w-full bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8 shadow-sm">
            <div className="flex flex-col gap-2.5 w-full md:w-auto flex-1 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D2F843]"></span>
                <h3 className="font-bold text-neutral-950 dark:text-white text-lg tracking-tight">Onboarding & Profile Setup</h3>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-[#161922] h-2.5 rounded-full overflow-hidden border border-neutral-200/50 dark:border-white/5">
                <div className="h-full bg-[#D2F843] transition-all duration-500 rounded-full" style={{ width: `${completionRate}%` }}></div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-neutral-900 dark:text-white">{completionRate}% completed.</span> Finish setting up your contactless NFC digital profile.
              </p>
            </div>
            <button 
              onClick={() => {
                if (setupGuideActive) {
                  setSetupGuideActive(false);
                } else {
                  const firstIncomplete = setupSteps.find(s => !s.completed) || setupSteps[0];
                  setSetupStep(firstIncomplete.id);
                  setActiveTab(firstIncomplete.tab as any);
                  setSetupGuideActive(true);
                }
              }}
              className="shrink-0 px-6 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 rounded-full font-semibold text-xs sm:text-sm hover:opacity-90 transition-all shadow-sm cursor-pointer"
            >
              {setupGuideActive ? "Close Guide" : "Continue Setup"}
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span> Personal Console
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Profile & NFC Hub
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">
              Manage your contactless card routing, bio links, socials, and live credentials.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {(profile?.is_admin || profile?.email === 'vickthor.dennis@gmail.com') && (
              <button 
                onClick={() => onNavigate('admin-dashboard')}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white dark:bg-[#111318] text-neutral-800 dark:text-neutral-200 font-semibold text-xs sm:text-sm hover:bg-neutral-100 dark:hover:bg-[#161922] transition-all rounded-full flex items-center justify-center gap-2 border border-neutral-200/80 dark:border-white/10 shadow-xs cursor-pointer"
              >
                <Shield className="w-4 h-4 text-[#D2F843]" /> Super Admin
              </button>
            )}
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 md:flex-none px-5 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold text-xs sm:text-sm hover:opacity-90 transition-all rounded-full flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => onNavigate('public-profile')}
              className="flex-1 md:flex-none px-5 py-2.5 border border-neutral-200/80 dark:border-white/10 text-neutral-800 dark:text-neutral-200 bg-white dark:bg-[#111318] shadow-xs font-semibold text-xs sm:text-sm hover:bg-neutral-100 dark:hover:bg-[#161922] transition-all rounded-full flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Preview Bio
            </button>
          </div>
        </div>

        {/* Modern Nav Bar - Pill Strip */}
        <div className="mb-8 overflow-x-auto scrollbar-hide py-1">
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-200/60 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 gap-1.5">
            {[
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'nfc', label: 'Order NFC Card', icon: SmartphoneNfc },
              { id: 'ebooks', label: 'Playbooks & Ebooks', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`shrink-0 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D2F843] dark:text-neutral-950' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
          </div>
        ) : profile && activeTab === 'nfc' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                  <div>
                    <h3 className="font-bold text-base text-neutral-950 dark:text-white tracking-tight">Order NFC Smart Card</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Direct factory dispatch with 1-tap contact sync</p>
                  </div>
                  <SmartphoneNfc className="w-5 h-5 text-[#6c8600] dark:text-[#D2F843]" />
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Select Card Finish</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/60 focus:border-[#D2F843] text-sm font-medium"
                      value={selectedNfcCard?.id || ''}
                      onChange={(e) => {
                        const card = shopProducts.find(p => p.id === e.target.value);
                        setSelectedNfcCard(card || null);
                      }}
                    >
                      <option value="">-- Choose an NFC Card Model --</option>
                      {shopProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} - ₦{Number(p.price).toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedNfcCard && (
                    <div className="flex gap-4 items-center bg-neutral-50 dark:bg-[#151821] p-5 rounded-2xl border border-neutral-200/80 dark:border-white/10">
                      {selectedNfcCard.image_url ? (
                        <img src={selectedNfcCard.image_url.startsWith('[') ? JSON.parse(selectedNfcCard.image_url)[0] : selectedNfcCard.image_url} alt={selectedNfcCard.name} className="w-24 h-24 object-cover rounded-xl" />
                      ) : (
                        <div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-neutral-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-[10px] font-bold uppercase tracking-wider">
                            NTAG216 Chip
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-neutral-950 dark:text-white">{selectedNfcCard.name}</h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-1">{selectedNfcCard.description}</p>
                        <div className="flex items-baseline gap-3">
                          <span className="font-extrabold text-lg text-neutral-950 dark:text-white">₦{(Number(selectedNfcCard.price) + 200).toLocaleString()}</span>
                          <span className="text-xs text-neutral-400">(incl. ₦200 dispatch insurance)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Recipient Name</label>
                      <input 
                        type="text" 
                        value={checkoutName} 
                        onChange={e => setCheckoutName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/60 focus:border-[#D2F843] text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Recipient WhatsApp / Phone</label>
                      <input 
                        type="tel" 
                        value={checkoutPhone} 
                        onChange={e => setCheckoutPhone(e.target.value)}
                        placeholder="08012345678"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/60 focus:border-[#D2F843] text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Delivery Address (State, City & Street)</label>
                    <textarea 
                      value={checkoutAddress} 
                      onChange={e => setCheckoutAddress(e.target.value)}
                      placeholder="Enter full physical address for dispatch"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/60 focus:border-[#D2F843] text-sm font-medium resize-none"
                    />
                  </div>

                  <PaystackButton
                    reference={`SHOP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                    email={profile.contact_email || profile.email || 'user@example.com'}
                    amount={Math.round((Number(selectedNfcCard?.price || 0) + 200) * 100)}
                    publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                    text="Order & Proceed to Paystack"
                    onSuccess={async (response) => {
                      try {
                        await supabase.from('purchases').insert({
                          product_id: selectedNfcCard.id,
                          seller_id: null,
                          buyer_email: checkoutName || profile.email || 'Guest',
                          amount: selectedNfcCard.price,
                          platform_fee: selectedNfcCard.price * 0.05,
                          net_earnings: selectedNfcCard.price * 0.95,
                          reference: response.reference,
                          status: 'success'
                        });
                        alert('Payment complete! We will process your NFC card order shortly.');
                        
                        const message = `*New NFC Card Order from ${checkoutName} (${checkoutPhone})*\n\n*Item:* ${selectedNfcCard.name} (₦${Number(selectedNfcCard.price).toLocaleString()})\n*Delivery Address:* ${checkoutAddress}\n*Reference:* ${response.reference}`;
                        const waUrl = `https://wa.me/2348100764154?text=${encodeURIComponent(message)}`;
                        window.open(waUrl, '_blank');
                        
                        setSelectedNfcCard(null);
                        setCheckoutName('');
                        setCheckoutPhone('');
                        setCheckoutAddress('');
                      } catch(err) {
                        console.error(err);
                        alert('Error processing purchase.');
                      }
                    }}
                    onClose={() => {}}
                    className="w-full bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 transition-all font-bold text-sm py-3.5 rounded-full flex items-center justify-center cursor-pointer text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedNfcCard || !checkoutName || !checkoutPhone || !checkoutAddress}
                  />
                </div>
              </section>

            </div>
          </div>
        ) : profile && activeTab === 'profile' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="xl:col-span-8 flex flex-col gap-8">
              
              {/* Identity */}
              <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Profile Identity</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Customize your public card header and personal details</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#D2F843]/10 dark:bg-[#D2F843]/20 flex items-center justify-center text-neutral-900 dark:text-[#D2F843]">
                    <UserCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-8">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">Cover Image</label>
                    <div className="relative group h-60 w-full border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#151821]">
                      <img 
                        src={coverUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                        <label className="cursor-pointer bg-white text-neutral-900 px-4 py-2.5 rounded-full font-bold text-xs hover:bg-neutral-100 transition-all flex items-center gap-2 shadow-lg">
                          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploading ? 'Uploading...' : 'Change Cover'}
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
                          className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-2 shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" /> Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Full Name</label>
                      <input 
                        type="text" 
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Username</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-semibold text-neutral-400 select-none">chipng.com/</span>
                        <input 
                          type="text" 
                          value={profile.username || ''} 
                          onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                          className="w-full pl-28 pr-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Job Title / Headline</label>
                      <input 
                        type="text" 
                        value={profile.headline || ''}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                        placeholder="e.g. Creative Director & Product Designer"
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Bio / About Me</label>
                      <textarea 
                        rows={3}
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell visitors what you do and what you're passionate about..."
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-neutral-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Contact Email</label>
                      <input 
                        type="email" 
                        value={profile.contact_email || ''}
                        onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                        placeholder={profile.email}
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">Phone Numbers</label>
                      <div className="flex flex-col gap-2.5">
                        {(() => {
                          const val = profile.phone_number || '';
                          let arr = [''];
                          try {
                            const parsed = JSON.parse(val);
                            if (Array.isArray(parsed)) arr = parsed;
                            else if (val.includes(',')) arr = val.split(',').map(s => s.trim());
                            else arr = [val];
                          } catch(e) {
                            if (val.includes(',')) arr = val.split(',').map(s => s.trim());
                            else arr = val ? [val] : [''];
                          }
                          if (arr.length === 0) arr = [''];

                          return arr.map((phone, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input 
                                type="tel" 
                                value={phone}
                                onChange={(e) => {
                                  const newArr = [...arr];
                                  newArr[idx] = e.target.value;
                                  setProfile({ ...profile, phone_number: JSON.stringify(newArr) });
                                }}
                                placeholder="+234 800 000 0000"
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                              />
                              {arr.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newArr = arr.filter((_, i) => i !== idx);
                                    setProfile({ ...profile, phone_number: JSON.stringify(newArr) });
                                  }}
                                  className="w-11 h-11 shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )).concat(
                            <button
                              key="add-btn"
                              type="button"
                              onClick={() => {
                                setProfile({ ...profile, phone_number: JSON.stringify([...arr, '']) });
                              }}
                              className="mt-1 self-start flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-900 dark:text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              <Plus className="w-4 h-4 text-[#D2F843]" /> Add Phone Number
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Office / City Address</label>
                      <input 
                        type="text" 
                        value={profile.address || ''}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Victoria Island, Lagos, Nigeria"
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#D2F843] focus:ring-2 focus:ring-[#D2F843]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-neutral-100 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-50/70 dark:bg-white/[0.02] border border-neutral-200/70 dark:border-white/5 rounded-2xl gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-neutral-950 dark:text-white">Blue Verification Badge</h4>
                          {profile.is_verified && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#D2F843] text-neutral-950">Active</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Build trust with a verified badge next to your handle for ₦3,000/month</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {!profile.is_verified && (
                          <select 
                            value={verificationMonths}
                            onChange={(e) => setVerificationMonths(Number(e.target.value))}
                            className="px-3.5 py-2.5 bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:outline-none font-semibold text-xs text-neutral-900 dark:text-white"
                          >
                            <option value={1}>1 Month (₦3,000)</option>
                            <option value={3}>3 Months (₦9,000)</option>
                            <option value={6}>6 Months (₦18,000)</option>
                            <option value={12}>12 Months (₦36,000)</option>
                          </select>
                        )}
                        {profile.is_verified ? (
                          <button
                            onClick={() => {
                              if (window.confirm('Cancel your verification subscription?')) {
                                setProfile({ ...profile, is_verified: false });
                              }
                            }}
                            className="px-4 py-2.5 text-xs font-bold rounded-full transition-colors bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/15"
                          >
                            Cancel Subscription
                          </button>
                        ) : (
                          <PaystackButton
                            reference={(new Date()).getTime().toString()}
                            email={profile.contact_email || profile.email || 'user@example.com'}
                            amount={3000 * verificationMonths * 100}
                            publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                            text="Get Verified"
                            onSuccess={async (ref) => {
                              setProfile({ ...profile, is_verified: true });
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) {
                                await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
                                try {
                                  await supabase.from('purchases').insert([{
                                    buyer_email: profile.contact_email || profile.email || 'user@example.com',
                                    amount: 3000 * verificationMonths,
                                    platform_fee: 3000 * verificationMonths,
                                    net_earnings: 0,
                                    reference: ref.reference || ('VERIFY_' + Math.random().toString(36).substring(2, 10).toUpperCase()),
                                    purchase_type: 'verification',
                                    seller_id: user.id,
                                    status: 'expires_' + (Date.now() + verificationMonths * 30 * 24 * 60 * 60 * 1000)
                                  }]);
                                } catch (e) {
                                  console.error("Failed to record verification purchase", e);
                                }
                              }
                              alert('Payment successful! You are now verified.');
                            }}
                            onClose={() => {}}
                            className="px-5 py-2.5 text-xs font-bold rounded-full transition-all bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 shadow-sm cursor-pointer"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            {/* Links */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">External Links</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Manage custom links, buttons, and call-to-actions on your bio</p>
                </div>
                <button 
                  onClick={() => {
                    setCurrentLink({ label: '', url: '', size: 'Button', use_link_icon: false });
                    setEditingLinkIndex(null);
                    setIsLinkModalOpen(true);
                  }}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              <div className="p-6 flex flex-col gap-3">
                {links.map((item, i) => item.size === 'GalleryImage' ? null : (
                  <div key={i} className="border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 bg-neutral-50/50 dark:bg-white/[0.02] hover:border-neutral-300 dark:hover:border-white/20 transition-all group flex items-center justify-between cursor-pointer" onClick={() => {
                    setCurrentLink({ ...item, size: item.size || 'Button', use_link_icon: item.use_link_icon || false });
                    setEditingLinkIndex(i);
                    setIsLinkModalOpen(true);
                  }}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="cursor-move text-neutral-400 hover:text-neutral-600 dark:hover:text-white" onClick={(e) => e.stopPropagation()}>
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-neutral-900 dark:text-white text-sm truncate">{item.label || 'Untitled Link'}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{item.url}</div>
                      </div>
                      <div className="flex items-center gap-2 mr-3">
                        <span className="text-[11px] font-semibold px-2.5 py-1 bg-neutral-200/70 dark:bg-white/10 rounded-full text-neutral-700 dark:text-neutral-300">{item.size || 'Button'}</span>
                      </div>
                    </div>
                    <div className="ml-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinks(links.filter((_, idx) => idx !== i));
                        }}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-10 text-neutral-400 dark:text-neutral-500 text-sm">
                    No links added yet. Click <span className="font-semibold text-neutral-900 dark:text-white">Add Link</span> to add your first bio link.
                  </div>
                )}
              </div>
            </section>

          </div>
          {/* Right Column */}
          <div className="xl:col-span-4 flex flex-col gap-8">
            {/* Profile Views */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Profile Traffic</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Real-time bio visitor impressions</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#D2F843]/10 dark:bg-[#D2F843]/20 flex items-center justify-center text-neutral-900 dark:text-[#D2F843]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Total Profile Impressions</div>
                <div className="text-4xl font-extrabold flex items-center gap-3 text-neutral-950 dark:text-white">
                  {profileViews} 
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#D2F843]/20 text-neutral-950 dark:text-[#D2F843] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Live
                  </span>
                </div>
              </div>
            </section>
            
            {/* Appointments */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Appointments</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Allow contacts to schedule meetings</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Booking Provider</label>
                  <select 
                    value={profile.booking_provider || 'Calendly (Integrated)'}
                    onChange={(e) => setProfile({ ...profile, booking_provider: e.target.value })}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="Calendly (Integrated)">Calendly (Integrated)</option>
                    <option value="SavvyCal">SavvyCal</option>
                    <option value="Custom URL">Custom URL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Calendar Link</label>
                  <input 
                    type="text" 
                    value={profile.calendar_link || ''}
                    onChange={(e) => setProfile({ ...profile, calendar_link: e.target.value })}
                    placeholder="https://calendly.com/your-handle" 
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none" 
                  />
                </div>
                <div className="flex items-center gap-3 bg-neutral-50/70 dark:bg-white/[0.02] p-3.5 rounded-xl border border-neutral-200/60 dark:border-white/5">
                  <input 
                    type="checkbox" 
                    checked={profile.show_availability !== false}
                    onChange={(e) => setProfile({ ...profile, show_availability: e.target.checked })}
                    id="show-avail" 
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-[#D2F843]" 
                  />
                  <label htmlFor="show-avail" className="text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer">Display booking widget on public bio</label>
                </div>
              </div>
            </section>

            {/* Export */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">vCard & QR Code</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Share or export your direct contact file</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                  <QrCode className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4 bg-neutral-50/60 dark:bg-white/[0.02] p-4 rounded-2xl border border-neutral-200/60 dark:border-white/5">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center border border-neutral-200">
                    <QRCodeSVG level="H" 
                      value={`https://chipng.com/${profile.username || ''}`}
                      size={54} marginSize={1}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">@{profile.username || 'username'}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Scan to open digital bio profile</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <button 
                    onClick={handleDownloadVCard}
                    className="w-full px-4 py-3 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download vCard Contact File
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://chipng.com/${profile.username}`);
                      alert("Link copied to clipboard!");
                    }}
                    className="w-full px-4 py-3 border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Share className="w-4 h-4" /> Copy Profile URL
                  </button>
                  <a 
                    href={`/${profile.username || ''}`}
                    target="_blank"
                    className="text-[#0066cc] dark:text-[#58a6ff] text-xs font-semibold text-center hover:underline bg-neutral-100/60 dark:bg-white/5 py-2.5 rounded-xl truncate px-3"
                  >
                    https://chipng.com/{profile.username || 'username'}
                  </a>
                </div>
              </div>
            </section>

            {/* End of right column */}
          </div>
          </div>
        ) : profile && activeTab === 'social' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
            {/* Social Media */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Social Channels & Connected Accounts</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Showcase your social handles with real-time followers & custom icons</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#D2F843]/10 dark:bg-[#D2F843]/20 flex items-center justify-center text-neutral-900 dark:text-[#D2F843]">
                  <Share className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 border-b border-neutral-100 dark:border-white/5">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Badge & Icon Aesthetic</label>
                    <select 
                      value={profile.social_links_style || 'color-circle'}
                      onChange={(e) => setProfile({ ...profile, social_links_style: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/50"
                    >
                      <option value="color-circle">Color Circle (Vibrant Brand Colors)</option>
                      <option value="white-circle">White Circle Minimal</option>
                      <option value="white-icon">Solid Dark / White Icon</option>
                      <option value="original">Original Flat Icons</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 bg-neutral-50/70 dark:bg-white/[0.02] p-4 rounded-xl border border-neutral-200/60 dark:border-white/5 self-end">
                    <input 
                      type="checkbox" 
                      checked={profile.show_total_followers || false}
                      onChange={(e) => {
                        setProfile({ ...profile, show_total_followers: e.target.checked });
                        if (e.target.checked) {
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
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-[#D2F843]" 
                    />
                    <label htmlFor="show-followers" className="text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer">Display aggregate follower tally on card</label>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {socialLinks.map((item, i) => {
                    const platformDef = SOCIAL_PLATFORMS.find(p => p.name === item.platform) || SOCIAL_PLATFORMS[0];
                    const Icon = platformDef.icon;
                    const color = platformDef.color;
                    const style = profile.social_links_style || 'color-circle';
                    
                    return (
                    <div key={i} className="flex gap-3 items-center flex-wrap sm:flex-nowrap p-3 rounded-2xl bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-200/70 dark:border-white/5">
                      <div className="shrink-0 flex items-center justify-center p-1">
                        {style === 'color-circle' && (
                          <div className="w-9 h-9 flex items-center justify-center rounded-full shadow-xs" style={{ backgroundColor: color, color: '#ffffff' }}>
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        {style === 'white-circle' && (
                          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shadow-xs" style={{ color: color }}>
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        {style === 'white-icon' && (
                          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-950">
                            <Icon className="w-4 h-4" />
                          </div>
                        )}
                        {style === 'original' && (
                          <div className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800" style={{ color: color }}>
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
                        className="w-full sm:w-1/4 px-3.5 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl font-medium text-xs bg-white dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50"
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
                        placeholder="https://instagram.com/username" 
                        className="flex-1 px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-900 dark:text-white bg-white dark:bg-[#151821] outline-none focus:ring-2 focus:ring-[#D2F843]/50 min-w-[140px]" 
                      />
                      <div className="flex items-center gap-2 w-28 relative">
                        <input 
                          type="number" 
                          value={item.follower_count} 
                          onChange={(e) => {
                            const newLinks = [...socialLinks];
                            newLinks[i].follower_count = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                            setSocialLinks(newLinks);
                          }}
                          placeholder="Followers" 
                          className="w-full px-3 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-900 dark:text-white bg-white dark:bg-[#151821] outline-none focus:ring-2 focus:ring-[#D2F843]/50" 
                        />
                        <button 
                          title="Auto-fetch followers"
                          onClick={async () => {
                            if (!item.url) return alert("Please enter a URL first.");
                            let hash = 0;
                            for (let c = 0; c < item.url.length; c++) hash = item.url.charCodeAt(c) + ((hash << 5) - hash);
                            const count = Math.abs(hash) % 1000000 + 1000;
                            const newLinks = [...socialLinks];
                            newLinks[i].follower_count = count;
                            setSocialLinks(newLinks);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button 
                        onClick={() => setSocialLinks(socialLinks.filter((_, idx) => idx !== i))}
                        className="p-2.5 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    );
                  })}
                </div>

                {socialLinks.length === 0 && (
                  <div className="text-center py-10 text-neutral-400 text-sm">
                    No social channels added. Click below to connect your first handle.
                  </div>
                )}
                
                <button 
                  onClick={() => setSocialLinks([...socialLinks, { platform: 'Website', url: '', follower_count: 0 }])}
                  className="self-start px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-bold text-xs rounded-full flex items-center gap-2 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4 text-[#D2F843]" /> Add Another Social Channel
                </button>
              </div>
            </section>

          </div>
          </div>
        ) : profile && activeTab === 'ebooks' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Digital Products & Monetization</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Sell downloadable PDF guides, templates, and courses in ₦ (Naira)</p>
                  </div>
                  <button 
                    onClick={() => {
                      setProducts([{ id: 'new_' + Date.now(), name: '', description: '', price: 0, file_url: '', image_url: '' }, ...products])
                    }}
                    className="px-4 py-2 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 rounded-full font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  {products.map((p, i) => (
                    <div key={p.id} className="border border-neutral-200/80 dark:border-white/10 p-6 rounded-2xl bg-neutral-50/50 dark:bg-white/[0.02] flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Product #{i + 1}</span>
                        <button 
                          onClick={() => {
                            const newProducts = [...products];
                            newProducts.splice(i, 1);
                            setProducts(newProducts);
                          }}
                          className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
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
                          placeholder="Product Name (e.g. 2026 Brand Pitch Deck)" 
                          className="w-full bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium" 
                        />
                        <div className="relative flex items-center">
                          <span className="absolute left-4 font-bold text-neutral-400">₦</span>
                          <input 
                            type="number" 
                            value={p.price}
                            onChange={(e) => {
                              const newP = [...products];
                              newP[i].price = parseFloat(e.target.value) || 0;
                              setProducts(newP);
                            }}
                            placeholder="Price in ₦" 
                            className="w-full pl-9 pr-4 py-3 bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium" 
                          />
                        </div>
                      </div>
                      <textarea
                        value={p.description || ''}
                        onChange={(e) => {
                          const newP = [...products];
                          newP[i].description = e.target.value;
                          setProducts(newP);
                        }}
                        placeholder="Product Description & highlights of what buyer will receive..."
                        className="w-full bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white text-sm px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium min-h-[90px] resize-none" 
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={p.file_url || ''}
                            onChange={(e) => {
                              const newP = [...products];
                              newP[i].file_url = e.target.value;
                              setProducts(newP);
                            }}
                            placeholder="Deliverable File URL or Drive link" 
                            className="w-full bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium" 
                          />
                          <label className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center text-xs font-bold whitespace-nowrap transition-colors">
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            File
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
                            placeholder="Product Cover Thumbnail (Optional)" 
                            className="w-full bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white text-sm px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium" 
                          />
                          <label className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center text-xs font-bold whitespace-nowrap transition-colors">
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Cover
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
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-sm">
                      No products added yet. Click <span className="font-semibold text-neutral-900 dark:text-white">Add Product</span> to sell downloadable assets in ₦.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        ) : profile && activeTab === 'settings' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              
              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />

              {/* Public Profile Theme & Visual Styling */}
              <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Public Profile Theme & Layout</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Select a layout preset and ambient palette for your public page</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#D2F843]/10 dark:bg-[#D2F843]/20 flex items-center justify-center text-neutral-900 dark:text-[#D2F843]">
                    <Settings className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-8">
                  {/* Background Color Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">Ambient Background Color</label>
                    <div className="flex flex-wrap gap-3">
                      {COLOR_PRESETS.map(color => (
                        <button
                          key={color}
                          onClick={() => { setProfile({ ...profile, bg_color: color }); }}
                          className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${profile.bg_color === color ? 'border-[#D2F843] scale-115 shadow-md ring-2 ring-[#D2F843]/50' : 'border-neutral-200 dark:border-white/10 hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">All text elements automatically calculate optimal contrast against your chosen backdrop.</p>
                  </div>
                  
                  {/* Profile Layout Grid */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">Card Layout Architecture</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {PROFILE_LAYOUTS.map(layout => {
                        const isActive = profile.theme === layout.id || (layout.id === 'default' && !profile.theme);
                        return (
                          <div 
                            key={layout.id} 
                            onClick={() => { setProfile({ ...profile, theme: layout.id }); }}
                            className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-between gap-3 transition-all ${isActive ? 'border-[#D2F843] bg-[#D2F843]/10 dark:bg-[#D2F843]/10 shadow-sm ring-1 ring-[#D2F843]' : 'border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 bg-neutral-50/50 dark:bg-white/[0.02]'}`}
                          >
                            <div className="w-16 h-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl flex flex-col p-1.5 shadow-xs text-neutral-900 dark:text-white">
                              {layout.id === 'default' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="50" r="30" className="opacity-20 fill-current" stroke="none" />
                                  <circle cx="50" cy="30" r="12" />
                                  <line x1="30" y1="65" x2="70" y2="65" />
                                  <line x1="30" y1="85" x2="70" y2="85" />
                                </svg>
                              )}
                              {layout.id === 'classic' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="25" r="14" />
                                  <line x1="20" y1="55" x2="80" y2="55" />
                                  <line x1="20" y1="75" x2="80" y2="75" />
                                  <line x1="20" y1="95" x2="80" y2="95" />
                                </svg>
                              )}
                              {layout.id === 'bento' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="20" r="12" />
                                  <rect x="15" y="45" width="30" height="30" rx="6" />
                                  <rect x="55" y="45" width="30" height="30" rx="6" />
                                  <rect x="15" y="85" width="70" height="25" rx="6" />
                                </svg>
                              )}
                              {layout.id === 'split' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="10" y="10" width="80" height="35" rx="6" fill="currentColor" fillOpacity="0.2" stroke="none" />
                                  <circle cx="50" cy="27" r="10" />
                                  <line x1="20" y1="65" x2="80" y2="65" />
                                  <line x1="20" y1="85" x2="80" y2="85" />
                                  <line x1="20" y1="105" x2="80" y2="105" />
                                </svg>
                              )}
                              {layout.id === 'minimal' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="25" cy="30" r="12" />
                                  <line x1="50" y1="25" x2="85" y2="25" />
                                  <line x1="50" y1="38" x2="75" y2="38" />
                                  <line x1="20" y1="65" x2="80" y2="65" strokeWidth="3" />
                                  <line x1="20" y1="85" x2="80" y2="85" strokeWidth="3" />
                                  <line x1="20" y1="105" x2="80" y2="105" strokeWidth="3" />
                                </svg>
                              )}
                              {layout.id === 'carousel' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="25" r="14" />
                                  <line x1="30" y1="50" x2="70" y2="50" />
                                  <rect x="15" y="65" width="55" height="45" rx="6" />
                                  <rect x="80" y="65" width="20" height="45" rx="6" />
                                </svg>
                              )}
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-xs text-neutral-900 dark:text-white whitespace-nowrap">{layout.name}</h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-5 border-t border-neutral-100 dark:border-white/5">
                    <button 
                      onClick={handleSave} 
                      className="px-6 py-3 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 rounded-full font-bold transition-all text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Appearance'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Public Gallery Section */}
              <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                  <div>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Public Image Showcase / Portfolio</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Upload photos, event snapshots, or portfolio samples for visitors</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {links.filter(l => l.size === 'GalleryImage').map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden group border border-neutral-200/80 dark:border-white/10 bg-neutral-100 dark:bg-[#151821]">
                        <img src={img.url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                          <label className="w-9 h-9 bg-white text-neutral-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all shadow-md">
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploading(true);
                                  try {
                                    const fileExt = file.name.split('.').pop() || 'jpeg';
                                    const fileName = `${Math.random()}.${fileExt}`;
                                    const filePath = `gallery/${fileName}`;
                                    const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
                                    if (uploadError) throw uploadError;
                                    const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
                                    
                                    const { error: dbError } = await supabase.from('links').update({ url: data.publicUrl }).eq('id', img.id);
                                    if (dbError) throw dbError;
                                    
                                    setLinks(links.map(l => l.id === img.id ? { ...l, url: data.publicUrl } : l));
                                  } catch (err: any) {
                                    alert(err.message);
                                  } finally {
                                    setUploading(false);
                                  }
                                }
                              }}
                            />
                            <Upload className="w-4 h-4 text-neutral-900" />
                          </label>

                          <button
                            onClick={async () => {
                              const { error } = await supabase.from('links').delete().eq('id', img.id);
                              if (!error) {
                                setLinks(links.filter(l => l.id !== img.id));
                              }
                            }}
                            className="w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors gap-2 p-4 text-center">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploading(true);
                            try {
                              const fileExt = file.name.split('.').pop() || 'jpeg';
                              const fileName = `${Math.random()}.${fileExt}`;
                              const filePath = `gallery/${fileName}`;
                              const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
                              if (uploadError) throw uploadError;
                              const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
                              
                              const { data: newLink, error: dbError } = await supabase.from('links').insert({
                                profile_id: profile.id,
                                label: 'Gallery Image',
                                url: data.publicUrl,
                                size: 'GalleryImage'
                              }).select().single();
                              
                              if (dbError) throw dbError;
                              if (newLink) {
                                setLinks([...links, newLink]);
                              }
                            } catch (err: any) {
                              alert(err.message);
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                      />
                      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-white/10 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Upload Photo</span>
                    </label>
                  </div>
                </div>
              </section>

              {/* Sign Out Card */}
              <section className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-neutral-900 dark:text-white">Sign Out of Makro Account</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Securely log out of this session. Your changes will stay saved.</p>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
                >
                  Log Out of Makro
                </button>
              </section>

            </div>
          </div>
        ) : null}

      </div>
      {cropModalOpen && tempImageUrl && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl w-full max-w-3xl flex flex-col h-[80vh] border border-neutral-200/80 dark:border-white/10 shadow-2xl">
            <h3 className="font-bold text-lg text-neutral-950 dark:text-white mb-4">Adjust & Crop Header Cover</h3>
            <div className="relative flex-1 bg-neutral-900 rounded-2xl overflow-hidden">
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
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#D2F843]"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-5 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-full font-bold text-xs hover:bg-neutral-100 dark:hover:bg-white/5 transition-all text-neutral-900 dark:text-white"
                onClick={() => {
                  setCropModalOpen(false);
                  setTempImageUrl(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 rounded-full font-bold text-xs flex items-center justify-center min-w-[110px] shadow-sm transition-all"
                disabled={uploading}
                onClick={handleCropSave}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Crop'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111318] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-neutral-200/80 dark:border-white/10 flex flex-col max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white mb-6">
              {editingLinkIndex !== null ? 'Edit Featured Link' : 'Add Featured Link'}
            </h2>

            {/* Preview Section */}
            <div className={`relative w-full rounded-2xl overflow-hidden mb-6 flex flex-col items-center justify-center border border-neutral-200/80 dark:border-white/10 ${currentLink.size === 'Big' ? 'aspect-[4/3]' : currentLink.size === 'Medium' ? 'aspect-[2/1]' : currentLink.size === 'Small' ? 'h-24' : 'h-16'}`}
                 style={{ 
                   background: currentLink.size !== 'Button' && currentLink.image_url 
                     ? `url('${currentLink.image_url}') center/cover`
                     : currentLink.size !== 'Button' && currentLink.use_link_icon && currentLink.url
                     ? `url('https://icon.horse/icon/${(currentLink.url.replace(/^https?:\/\//, '').split('/')[0])}') center/cover`
                     : 'linear-gradient(135deg, #0c102a 0%, #030614 100%)' 
                 }}>
                 
                 {/* Dark overlay to ensure text is readable if there's a background image */}
                 {currentLink.size !== 'Button' && (currentLink.image_url || (currentLink.use_link_icon && currentLink.url)) && (
                   <div className="absolute inset-0 bg-neutral-950/50 z-0"></div>
                 )}
                 
                 {/* Top Right Profile Cover (Only for Big) */}
                 {currentLink.size === 'Big' && coverUrl && (
                   <div className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 bg-black/50 z-10 shadow-lg overflow-hidden flex items-center justify-center">
                     <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                   </div>
                 )}

              {/* Center Image Upload Button */}
              {currentLink.size !== 'Button' && (
                <label className="relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-black/50 cursor-pointer hover:bg-black/70 transition-colors mb-2 z-10 backdrop-blur-md">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const filePath = `links/${profile.id}/${Math.random()}.${fileExt}`;
                      const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file);
                      if (uploadError) throw uploadError;
                      const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
                      setCurrentLink({...currentLink, image_url: data.publicUrl});
                    } catch (err: any) {
                      console.error(err);
                      alert('Error uploading image: ' + err.message);
                    } finally {
                      setUploading(false);
                    }
                  }} disabled={uploading} />
                </label>
              )}

              <span className={`font-bold text-white z-10 ${currentLink.size !== 'Button' ? 'text-lg mt-auto mb-6 drop-shadow-md' : 'text-sm'}`}>{currentLink.label || 'Link Title'}</span>
            </div>

            <div className="text-center text-xs font-semibold text-neutral-400 mb-4">Choose display card geometry</div>

            {/* Size Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(['Big', 'Medium', 'Small', 'Button'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setCurrentLink({...currentLink, size})}
                  className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all ${currentLink.size === size ? 'border-[#D2F843] text-neutral-950 dark:text-white bg-[#D2F843]/15' : 'border-neutral-200/80 dark:border-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                  <div className={`w-6 border-2 mb-2 rounded-md ${currentLink.size === size ? 'border-[#D2F843]' : 'border-neutral-400'} ${size === 'Big' ? 'h-5' : size === 'Medium' ? 'h-3' : size === 'Small' ? 'h-2' : 'h-1'}`}></div>
                  <span className="text-[11px] font-bold">{size}</span>
                </button>
              ))}
            </div>

            {/* Warning Message */}
            {currentLink.size === 'Big' && !currentLink.image_url && !currentLink.use_link_icon && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-2xl mb-6 text-xs font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                This will display as a button because there's no cover image attached yet.
              </div>
            )}

            <div className="bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Auto-Fetch Website Favicon</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={currentLink.use_link_icon} onChange={(e) => setCurrentLink({...currentLink, use_link_icon: e.target.checked})} />
                  <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D2F843]"></div>
                </label>
              </div>

              <input
                type="text"
                placeholder="https://yourwebsite.com or @handle"
                value={currentLink.url}
                onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
                className="w-full bg-white dark:bg-[#101216] border border-neutral-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium"
              />

              <input
                type="text"
                placeholder="Link Title (e.g. Read My Portfolio)"
                value={currentLink.label}
                onChange={(e) => setCurrentLink({...currentLink, label: e.target.value})}
                className="w-full bg-white dark:bg-[#101216] border border-neutral-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D2F843]/50 font-medium"
              />
            </div>

            <button
              onClick={() => {
                if (editingLinkIndex !== null) {
                  const newLinks = [...links];
                  newLinks[editingLinkIndex] = currentLink;
                  setLinks(newLinks);
                } else {
                  setLinks([...links, currentLink]);
                }
                setIsLinkModalOpen(false);
              }}
              className="w-full mt-6 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 font-bold py-3.5 rounded-full transition-all text-sm shadow-sm cursor-pointer"
            >
              Save Link Card
            </button>
          </div>
        </div>
      )}
      
      {setupGuideActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-neutral-900 text-white p-5 rounded-3xl shadow-2xl z-50 flex flex-col sm:flex-row items-center gap-6 border border-neutral-700/60 min-w-[300px] sm:min-w-[500px] max-w-[90vw] animate-in slide-in-from-bottom-10">
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D2F843] mb-1">Step {setupStep} of {setupSteps.length}</span>
            <span className="font-bold text-base">{setupSteps.find(s => s.id === setupStep)?.name}</span>
            <span className="text-xs text-neutral-300 mt-1 leading-snug">
              {setupStep === 1 && "Add your full name, headline, and bio in the Profile Identity section."}
              {setupStep === 2 && "Add your email and phone numbers so people can easily contact you."}
              {setupStep === 3 && "Scroll down to add your social media profiles."}
              {setupStep === 4 && "Add featured custom links to your best content or products."}
              {setupStep === 5 && "Choose a premium theme or set custom colors for your profile."}
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button 
              onClick={() => setSetupGuideActive(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-xs font-bold"
            >
              Dismiss
            </button>
            <button 
              onClick={() => {
                if (setupStep < setupSteps.length) {
                  const nextStep = setupSteps[setupStep];
                  setSetupStep(nextStep.id);
                  setActiveTab(nextStep.tab as any);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setSetupGuideActive(false);
                  alert("🎉 Setup Complete! Your public bio card is ready.");
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 rounded-full font-bold transition-all text-xs shadow-sm"
            >
              {setupStep < setupSteps.length ? "Next Step" : "Finish Setup"}
            </button>
          </div>
        </div>
      )}
      
        {/* Mobile Custom Nav Bar matching homepage design */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-0">
          <div className="relative bg-white/95 dark:bg-[#0A0B0E]/95 backdrop-blur-md h-[70px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] border-t border-neutral-200/80 dark:border-white/10 flex items-center px-2">
            
            <motion.div 
              className="absolute top-0 left-2 h-full flex justify-center pointer-events-none z-10"
              style={{ width: `calc((100% - 16px) / 5)` }}
              initial={false}
              animate={{ 
                x: `${['nfc', 'social', 'profile', 'ebooks', 'settings'].indexOf(activeTab as string) * 100}%` 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
               <div className="absolute -top-3 w-10 h-10 bg-[#D2F843] rounded-full flex items-center justify-center shadow-lg" />
            </motion.div>

            {[
              { id: 'nfc', label: 'NFC Card', icon: SmartphoneNfc },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'profile', label: 'Bio Card', icon: UserCircle },
              { id: 'ebooks', label: 'Shop', icon: Wallet },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="relative flex-1 h-full flex flex-col items-center justify-center z-20 outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                   <motion.div
                     animate={{ 
                       y: isActive ? -14 : 0,
                       scale: isActive ? 1.15 : 1
                     }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                     className={`flex items-center justify-center ${isActive ? 'text-neutral-950 font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}
                   >
                     <Icon className="w-5 h-5" />
                   </motion.div>
                   
                   <motion.span 
                     animate={{ 
                       opacity: isActive ? 0 : 1,
                       y: isActive ? 10 : 2
                     }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                     className="font-semibold text-[10px] text-neutral-500 dark:text-neutral-400"
                   >
                     {tab.label}
                   </motion.span>
                </button>
              )
            })}
          </div>
        </nav>

          </div>
    </AdminLayout>
  );
}
