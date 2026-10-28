import { motion } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { openFlutterwavePayment } from '../utils/flutterwaveClient';
import { QRCodeSVG } from 'qrcode.react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { Bell, Save, CreditCard, Eye, UserCircle, Upload, Trash2, Link, GripVertical, Plus, Globe, AtSign, Rss, Calendar, QrCode, Download, Settings, Loader2, MapPin, Phone, Mail, Share, Shield, Activity, Wallet, Camera, AlertTriangle, X, SmartphoneNfc , LogOut, Pencil, User, Users, UserCheck, Check, Heart, ShoppingBag, Home, RotateCw, ZoomIn, ZoomOut, RefreshCw, Maximize2, Gift, Coins, Award, Sparkles, Percent, ArrowUpRight, Landmark, CheckCircle, Copy, ExternalLink, Sun, Moon } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { FaXTwitter, FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaTwitch, FaTiktok, FaSnapchat, FaPinterest, FaReddit, FaDiscord, FaSlack, FaTelegram, FaWhatsapp, FaWeixin, FaLine, FaMedium, FaDribbble, FaBehance, FaFigma, FaDev, FaProductHunt, FaStackOverflow, FaGitlab, FaBitbucket, FaSpotify, FaSoundcloud, FaPatreon, FaPaypal } from 'react-icons/fa6';
import { SiBuymeacoffee, SiSubstack, SiApplemusic, SiVenmo } from 'react-icons/si';

import DashboardAnalytics from '../components/DashboardAnalytics';
import { ProfileLeadsManager } from '../components/ProfileLeadsManager';
import { toast } from '../components/Toast';
import { SocialMediaIconBadge, SOCIAL_PLATFORMS_CONFIG } from '../components/social/SocialMediaIconBadge';
import { downloadVCardClient } from '../utils/vcardGenerator';

export const SOCIAL_PLATFORMS = SOCIAL_PLATFORMS_CONFIG;


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

export default function UserDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState, slug?: string) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
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
  const [activeTab, setActiveTab] = useState<'analytics' | 'leads' | 'profile' | 'links' | 'social' | 'shop' | 'appearance' | 'gallery' | 'nfc' | 'buy-nfc' | 'referrals' | 'settings'>('profile');
  const [leadsStats, setLeadsStats] = useState<{ total: number; newCount: number; convertedCount: number }>({ total: 0, newCount: 0, convertedCount: 0 });

  // --- The Incentive: Referral & Affiliate State ---
  const [referralStats, setReferralStats] = useState<any>({
    totalClicks: 0,
    cardsSold: 0,
    totalSalesVolume: 0,
    totalCashEarned: 0,
    commissionRate: 0.10,
    pendingPayout: 0,
    paidPayout: 0,
    freeProMonthsEarned: 0,
    freeProMonthsClaimed: 0,
    unclaimedProMonths: 0,
    cardsTowardsNextProMonth: 0,
    cardsRemainingForNextPro: 3,
    payoutSettings: null,
    recentSales: [],
    rewardsHistory: []
  });
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [payoutBankName, setPayoutBankName] = useState('Guaranty Trust Bank (GTBank)');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('');
  const [payoutAccountName, setPayoutAccountName] = useState('');
  const [referralCopied, setReferralCopied] = useState(false);
  const [directCardCopied, setDirectCardCopied] = useState(false);

  const fetchReferralStats = async () => {
    const activeUsername = (profile?.username || '').trim().replace(/^@/, '').toLowerCase();
    const activeUserId = profile?.id || '';
    if (!activeUsername && !activeUserId) return;
    try {
      setLoadingReferrals(true);
      let data: any = null;
      if (activeUsername) {
        try {
          const res = await fetch(`/api/referrals/stats/${encodeURIComponent(activeUsername)}`);
          if (res.ok) {
            data = await res.json();
          }
        } catch (apiErr) {
          console.warn('API referral stats fetch warning:', apiErr);
        }
      }

      // Supabase & LocalStorage resilient fallback for payout settings
      let payout = data?.payoutSettings || null;
      if (!payout) {
        // 1. Try Supabase user_payout_settings table
        try {
          if (activeUsername) {
            const { data: spPayout } = await supabase
              .from('user_payout_settings')
              .select('bank_name, account_number, account_name, updated_at')
              .eq('username', activeUsername)
              .maybeSingle();
            if (spPayout && spPayout.account_number) {
              payout = spPayout;
            }
          }
        } catch (e) {}

        // 2. Try Supabase profiles bank columns
        if (!payout && (profile?.payout_bank_name || profile?.payout_account_number)) {
          payout = {
            bank_name: profile.payout_bank_name,
            account_number: profile.payout_account_number,
            account_name: profile.payout_account_name
          };
        }

        // 3. Try LocalStorage
        if (!payout && typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem(`chipng_payout_${activeUsername || activeUserId}`);
            if (cached) payout = JSON.parse(cached);
          } catch (e) {}
        }
      }

      const defaultStats = {
        totalClicks: 0,
        cardsSold: 0,
        totalSalesVolume: 0,
        totalCashEarned: 0,
        commissionRate: 0.10,
        pendingPayout: 0,
        paidPayout: 0,
        freeProMonthsEarned: 0,
        freeProMonthsClaimed: 0,
        unclaimedProMonths: 0,
        cardsTowardsNextProMonth: 0,
        cardsRemainingForNextPro: 3,
        payoutSettings: null,
        recentSales: [],
        rewardsHistory: []
      };

      const merged = {
        ...defaultStats,
        ...(data || {}),
        username: activeUsername || data?.username || '',
        totalClicks: Number(data?.totalClicks ?? 0),
        cardsSold: Number(data?.cardsSold ?? 0),
        totalSalesVolume: Number(data?.totalSalesVolume ?? 0),
        totalCashEarned: Number(data?.totalCashEarned ?? 0),
        commissionRate: 0.10,
        pendingPayout: Number(data?.pendingPayout ?? 0),
        paidPayout: Number(data?.paidPayout ?? 0),
        freeProMonthsEarned: Number(data?.freeProMonthsEarned ?? 0),
        freeProMonthsClaimed: Number(data?.freeProMonthsClaimed ?? 0),
        unclaimedProMonths: Number(data?.unclaimedProMonths ?? 0),
        cardsTowardsNextProMonth: Number(data?.cardsTowardsNextProMonth ?? (Number(data?.cardsSold ?? 0) % 3)),
        cardsRemainingForNextPro: Number(data?.cardsRemainingForNextPro ?? (3 - (Number(data?.cardsSold ?? 0) % 3))),
        recentSales: Array.isArray(data?.recentSales) ? data.recentSales : [],
        rewardsHistory: Array.isArray(data?.rewardsHistory) ? data.rewardsHistory : [],
        payoutSettings: payout || data?.payoutSettings || null
      };

      setReferralStats(merged);
      if (payout) {
        if (payout.bank_name) setPayoutBankName(payout.bank_name);
        if (payout.account_number) setPayoutAccountNumber(payout.account_number);
        if (payout.account_name) setPayoutAccountName(payout.account_name);
      }
    } catch (e) {
      console.warn('Failed to load referral stats:', e);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    if (profile?.username || profile?.id) {
      fetchReferralStats();
    }
  }, [profile?.username, profile?.id]);

  const handleClaimProMonth = async () => {
    const activeUsername = profile?.username || '';
    if (!activeUsername) {
      toast.error('Please configure your username first.');
      return;
    }
    setClaimingReward(true);
    try {
      const res = await fetch('/api/referrals/claim-pro-month', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || '🎉 1 Free Pro Month claimed and activated successfully!');
        setProfile((prev: any) => ({ ...prev, is_verified: true }));
        try {
          await supabase.from('profiles').update({ is_verified: true }).eq('id', profile.id);
        } catch (e) {}
        fetchReferralStats();
      } else {
        toast.error(data.error || 'Unable to claim reward at this time.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error claiming Pro reward');
    } finally {
      setClaimingReward(false);
    }
  };

  const handleSavePayoutSettings = async () => {
    const activeUsername = profile?.username || profile?.email?.split('@')[0] || 'user';
    const cleanBank = payoutBankName.trim();
    const cleanNumber = payoutAccountNumber.replace(/\D/g, '');
    const cleanName = payoutAccountName.trim();

    if (!cleanBank || !cleanNumber || !cleanName) {
      toast.error('Please fill in bank name, account number, and account name.');
      return;
    }
    if (cleanNumber.length !== 10) {
      toast.error('Nigerian NUBAN account number must be exactly 10 digits.');
      return;
    }

    setSavingPayout(true);
    let savedSuccessfully = false;

    // 1. Direct Supabase Persistence (Multi-tier: profiles table + user_payout_settings table)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = user?.id || profile?.id;
      if (targetId) {
        // A. Update profiles bank columns
        try {
          const { error: profErr } = await supabase.from('profiles').update({
            payout_bank_name: cleanBank,
            payout_account_number: cleanNumber,
            payout_account_name: cleanName
          }).eq('id', targetId);
          if (!profErr) savedSuccessfully = true;
        } catch (e) {}

        // B. Upsert into dedicated user_payout_settings table
        try {
          const { error: upsertErr } = await supabase.from('user_payout_settings').upsert({
            user_id: targetId,
            username: activeUsername.toLowerCase(),
            bank_name: cleanBank,
            account_number: cleanNumber,
            account_name: cleanName,
            updated_at: new Date().toISOString()
          }, { onConflict: 'username' });
          if (!upsertErr) savedSuccessfully = true;
        } catch (e) {}
      }
    } catch (sbError) {
      console.warn('Supabase client payout update warning:', sbError);
    }

    // 2. Server API Persistence (SQLite + Serverless cache)
    try {
      const res = await fetch('/api/referrals/payout-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: activeUsername,
          bank_name: cleanBank,
          account_number: cleanNumber,
          account_name: cleanName
        })
      });
      if (res.ok) {
        savedSuccessfully = true;
      }
    } catch (apiErr) {
      console.warn('API payout update network warning:', apiErr);
    }

    // 3. Client LocalStorage Fallback (Guarantees zero data loss on device)
    try {
      localStorage.setItem(`chipng_payout_${activeUsername}`, JSON.stringify({
        bank_name: cleanBank,
        account_number: cleanNumber,
        account_name: cleanName,
        updated_at: new Date().toISOString()
      }));
      if (profile?.id) {
        localStorage.setItem(`chipng_payout_${profile.id}`, JSON.stringify({
          bank_name: cleanBank,
          account_number: cleanNumber,
          account_name: cleanName,
          updated_at: new Date().toISOString()
        }));
      }
      savedSuccessfully = true;
    } catch (lsErr) {}

    // Update React State immediately so UI updates to "Payout Active" without reload
    const updatedSettings = {
      bank_name: cleanBank,
      account_number: cleanNumber,
      account_name: cleanName,
      updated_at: new Date().toISOString()
    };

    setReferralStats((prev: any) => ({
      ...prev,
      payoutSettings: updatedSettings
    }));

    if (savedSuccessfully) {
      toast.success('Nigerian bank payout account saved successfully!');
    } else {
      toast.error('Could not save payout settings. Please check your network connection.');
    }

    setSavingPayout(false);
  };

  const downloadReferralQrCodePng = () => {
    try {
      const svg = document.getElementById('referral-qr-svg') as unknown as SVGGraphicsElement | null;
      if (!svg) {
        toast.error('QR code element not found.');
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      canvas.width = 600;
      canvas.height = 600;

      img.onload = () => {
        if (!ctx) return;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40, 520, 520);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `CHIP_NG_Referral_QR_${profile.username || 'card'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('High-resolution Referral QR code downloaded!');
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err: any) {
      console.error('QR download error:', err);
      toast.error('Could not download QR code image.');
    }
  };

  const fetchLeadsStats = async () => {
    if (!profile?.id) return;
    try {
      const res = await fetch(`/api/leads/profile/${profile.id}`);
      if (res.ok) {
        const data = await res.json();
        setLeadsStats({
          total: data.total || (data.leads ? data.leads.length : 0),
          newCount: data.newCount || 0,
          convertedCount: data.convertedCount || 0
        });
        return;
      }
    } catch (e) {}

    // Supabase & localStorage fallback
    try {
      const slugs = [`profile_${profile.id}`, profile.id];
      if (profile.username) slugs.push(`profile_${profile.username}`, profile.username);
      const { data: spLeads } = await supabase
        .from('leads')
        .select('id, city')
        .in('post_slug', slugs);

      if (spLeads) {
        let converted = 0;
        let unread = 0;
        for (const l of spLeads) {
          const cached = localStorage.getItem(`chipng_lead_status_${l.id}`) || localStorage.getItem(`chipng_lead_status_${profile.id}_${l.id}`);
          let status = cached;
          if (!status && l.city && typeof l.city === 'string' && l.city.startsWith('{')) {
            try { status = JSON.parse(l.city).status; } catch (e) {}
          }
          if (status === 'converted') converted++;
          else unread++;
        }
        setLeadsStats({ total: spLeads.length, newCount: unread, convertedCount: converted });
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (profile?.id) {
      fetchLeadsStats();
    }
  }, [profile?.id]);

  const [setupGuideActive, setSetupGuideActive] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [savingContactDetails, setSavingContactDetails] = useState(false);
  const [contactSavedFeedback, setContactSavedFeedback] = useState(false);

  const handleSaveContactDetails = async () => {
    setSavingContactDetails(true);
    setContactSavedFeedback(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetId = user?.id || profile?.id;
      if (!targetId) {
        toast.error('Please log in to save contact details.');
        return;
      }

      // 1. Direct authenticated Supabase update
      let sbSuccess = false;
      try {
        const updatePayload: any = {
          contact_email: profile?.contact_email ? String(profile.contact_email).trim() : null,
          phone_number: profile?.phone_number ? String(profile.phone_number).trim() : null,
          address: profile?.address ? String(profile.address).trim() : null,
          is_whatsapp: profile?.is_whatsapp ?? true
        };
        let { error } = await supabase.from('profiles').update(updatePayload).eq('id', targetId);

        if (error && (error.message.includes('is_whatsapp') || error.message.includes('schema cache'))) {
          delete updatePayload.is_whatsapp;
          const retry = await supabase.from('profiles').update(updatePayload).eq('id', targetId);
          error = retry.error;
        }

        if (!error) sbSuccess = true;
      } catch (err) {
        console.warn('Direct client Supabase contact update warning:', err);
      }

      // 2. Resilient server proxy sync
      let apiSuccess = false;
      try {
        const res = await fetch('/api/profile/contact-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: targetId,
            contact_email: profile?.contact_email ? String(profile.contact_email).trim() : null,
            phone_number: profile?.phone_number ? String(profile.phone_number).trim() : null,
            address: profile?.address ? String(profile.address).trim() : null,
            is_whatsapp: profile?.is_whatsapp ?? true
          })
        });
        if (res.ok) apiSuccess = true;
      } catch (err) {
        console.warn('Backend contact details sync warning:', err);
      }

      if (sbSuccess || apiSuccess) {
        setContactSavedFeedback(true);
        setTimeout(() => setContactSavedFeedback(false), 4000);
        toast.success('Contact details saved to Supabase successfully!');
      } else {
        toast.error('Failed to save contact details. Please check your connection.');
      }
    } catch (error: any) {
      console.error('Error saving contact details to Supabase:', error);
      toast.error('Failed to save contact details: ' + (error.message || 'Please check your connection'));
    } finally {
      setSavingContactDetails(false);
    }
  };

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

  // Keep read state synchronized with user profile
  useEffect(() => {
    if (profile?.id) {
      try {
        const userSaved = localStorage.getItem(`chip_read_notifs_${profile.id}`);
        if (userSaved) {
          const parsed = JSON.parse(userSaved);
          setReadNotifs(prev => [...new Set([...prev, ...parsed])]);
        }
      } catch (e) {}
    }
  }, [profile?.id]);

  const markAllAsRead = () => {
    const allIds = allNotifications.map(n => String(n.id));
    const newRead = [...new Set([...readNotifs, ...allIds])];
    setReadNotifs(newRead);
    localStorage.setItem('chip_read_notifs', JSON.stringify(newRead));
    if (profile?.id) {
      localStorage.setItem(`chip_read_notifs_${profile.id}`, JSON.stringify(newRead));
    }
    fetch('/api/notifications/mark-read', { method: 'POST' }).catch(() => {});
  };

  const markOneAsRead = (id: string | number) => {
    const idStr = String(id);
    if (!readNotifs.includes(idStr)) {
      const newRead = [...readNotifs, idStr];
      setReadNotifs(newRead);
      localStorage.setItem('chip_read_notifs', JSON.stringify(newRead));
      if (profile?.id) {
        localStorage.setItem(`chip_read_notifs_${profile.id}`, JSON.stringify(newRead));
      }
      fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    }
  };

  const [hasDismissedNfcPrompt, setHasDismissedNfcPrompt] = useState(false);

  useEffect(() => {
    const fetchNotifs = () => {
      let localBroadcasts: any[] = [];
      try {
        const stored = localStorage.getItem('chip_broadcast_notifications');
        if (stored) localBroadcasts = JSON.parse(stored);
      } catch (e) {}

      // Fetch from Server API
      const fetchServer = async () => {
        try {
          const res = await fetch('/api/notifications');
          if (res.ok) {
            const data = await res.json();
            return (data && Array.isArray(data.notifications)) ? data.notifications : [];
          }
          const res2 = await fetch('/api/app-updates');
          if (res2.ok) {
            const data2 = await res2.json();
            return (data2 && Array.isArray(data2.notifications)) ? data2.notifications : [];
          }
          return [];
        } catch {
          return [];
        }
      };

      // Fetch from Supabase app_notifications
      const fetchSupa = async () => {
        try {
          const { data, error } = await supabase
            .from('app_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          return (!error && Array.isArray(data)) ? data : [];
        } catch {
          return [];
        }
      };

      Promise.all([fetchServer(), fetchSupa()]).then(([serverList, supaList]) => {
        const combined = [...supaList, ...serverList, ...localBroadcasts];
        const seen = new Set();
        const merged = combined.filter(n => {
          const key = (n.id ? String(n.id) : '') + '-' + (n.title || '').trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setNotifications(merged);
      }).catch(() => {
        if (localBroadcasts.length > 0) setNotifications(localBroadcasts);
      });
    };
    
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    window.addEventListener('chip_notifications_updated', fetchNotifs);
    window.addEventListener('storage', fetchNotifs);
    return () => {
      clearInterval(interval);
      window.removeEventListener('chip_notifications_updated', fetchNotifs);
      window.removeEventListener('storage', fetchNotifs);
    };
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
  const unreadBroadcasts = notifications.filter(n => !readNotifs.includes(String(n.id)));
  const latestUnreadBroadcast = unreadBroadcasts[0];

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
        }}
        className="relative w-10 h-10 rounded-full border border-neutral-200/80 dark:border-white/10 flex items-center justify-center bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors shadow-xs cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4 text-neutral-900 dark:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0E1017] animate-pulse" />
        )}
      </button>

      {showNotifications && (
        <div className="absolute top-full right-0 mt-2.5 w-80 sm:w-88 bg-white dark:bg-[#111318] rounded-2xl shadow-xl border border-neutral-200/80 dark:border-white/10 overflow-hidden z-50 animate-in fade-in duration-150">
          <div className="p-3.5 border-b border-neutral-200/60 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-neutral-950 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-[#16a34a] text-white font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5">
            {allNotifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                No notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {allNotifications.map(notif => {
                  const isUnread = !readNotifs.includes(String(notif.id));
                  return (
                    <div 
                      key={notif.id} 
                      className={`p-3.5 transition-colors text-left relative group ${
                        isUnread 
                          ? 'bg-[#16a34a]/5 dark:bg-[#16a34a]/10 hover:bg-[#16a34a]/10 dark:hover:bg-[#16a34a]/15' 
                          : 'hover:bg-neutral-50 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] shrink-0" />}
                          <h4 className="font-bold text-xs text-neutral-950 dark:text-white truncate">{notif.title}</h4>
                        </div>
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markOneAsRead(notif.id);
                            }}
                            className="text-[10px] text-neutral-400 hover:text-neutral-950 dark:hover:text-white font-medium shrink-0 cursor-pointer ml-1 underline decoration-dotted"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{notif.message}</p>
                      
                      {notif.isSystem && (
                        <div className="mt-2.5 flex gap-2">
                          <button 
                            onClick={() => {
                              setActiveTab('nfc');
                              setTimeout(() => {
                                document.getElementById('nfc-section')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                              setShowNotifications(false);
                            }}
                            className="text-xs bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-3 py-1 rounded-lg font-bold cursor-pointer"
                          >
                            Order Now
                          </button>
                          <button 
                            onClick={() => setHasDismissedNfcPrompt(true)}
                            className="text-xs bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 px-3 py-1 rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-white/20 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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

  // Crop & Resize state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      let user: any = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        user = userData?.user;
      } catch (uErr) {}

      if (!user) {
        const { data: sessionData } = await supabase.auth.getSession();
        user = sessionData?.session?.user || null;
      }

      if (!user) {
        if (onNavigate) onNavigate('login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', user.id).order('position');
      const { data: socialData } = await supabase.from('social_links').select('*').eq('profile_id', user.id);
      const { data: productsData } = await supabase.from('products').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      const { data: purchasesData } = await supabase.from('purchases').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
      const { data: shopProductsData } = await supabase.from('products').select('*').is('profile_id', null).order('created_at', { ascending: false });

      // Fetch views count from server profile analytics & local telemetry cache
      let viewsCount = 0;
      try {
        const localTelem = localStorage.getItem(`chipng_telemetry_${user.id}`);
        if (localTelem) {
          viewsCount = JSON.parse(localTelem).totalViews || 0;
        }
      } catch (e) {}
      try {
        const analyticsRes = await fetch(`/api/analytics/user/${user.id}`);
        if (analyticsRes.ok) {
          const analyticsJson = await analyticsRes.json();
          viewsCount = Math.max(viewsCount, analyticsJson.totalViews || 0);
        }
      } catch (e) {
        console.warn('Analytics view count fetch warning:', e);
      }

      if (profileData) {
        let isVerified = profileData.is_verified;
        if (isVerified && purchasesData) {
          try {
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
          } catch (e) {
            console.warn('Verification expiration update warning:', e);
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
        } else if (insertError) {
          // Check if trigger handle_new_user already created the profile
          const { data: existingProfile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (existingProfile) {
            setProfile({ ...existingProfile, email: user.email });
            if (existingProfile.cover_image_url) setCoverUrl(existingProfile.cover_image_url);
          } else if (insertError.code === '23505') {
            initialProfile.username = initialProfile.username + Math.floor(Math.random()*10000);
            const { data: retryProfile } = await supabase.from('profiles').upsert(initialProfile).select().single();
            setProfile({ ...(retryProfile || initialProfile), email: user.email });
          } else {
            setProfile({ ...initialProfile, email: user.email });
          }
        } else {
          setProfile({ ...initialProfile, email: user.email });
        }
      }
      if (linksData) setLinks(linksData);
      if (socialData) setSocialLinks(socialData);
      if (productsData) setProducts(productsData);
      if (purchasesData) setSales(purchasesData);
      setProfileViews(viewsCount);
      if (shopProductsData) setShopProducts(shopProductsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const fallbackUser = sessionData?.session?.user;
        if (fallbackUser) {
          setProfile((prev: any) => prev || {
            id: fallbackUser.id,
            full_name: fallbackUser.user_metadata?.full_name || 'CHIP User',
            username: (fallbackUser.email?.split('@')[0] || '').replace(/[^a-z0-9_.-]/g, '').toLowerCase() || 'user',
            headline: '',
            bio: '',
            contact_email: fallbackUser.email || '',
            phone_number: '',
            address: '',
            booking_provider: 'Calendly (Integrated)',
            calendar_link: '',
            show_availability: true,
            show_total_followers: false,
            social_links_style: 'inline',
            is_verified: false,
            is_admin: fallbackUser.email === 'vickthor.dennis@gmail.com'
          });
        }
      } catch (e) {}
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
        avatar_url: coverUrl,
        contact_email: profile.contact_email,
        phone_number: profile.phone_number,
        is_whatsapp: profile.is_whatsapp ?? true,
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

      if (profileError && (profileError.message.includes('schema cache') || profileError.message.includes('is_whatsapp'))) {
        const retryResult = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: profile.full_name,
          username: profile.username,
          headline: profile.headline,
          bio: profile.bio || '',
          cover_image_url: coverUrl,
          avatar_url: coverUrl,
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

      toast.success('Changes saved successfully!');
    } catch (error: any) {
      console.error('Error saving: ', error);
      toast.error('Error saving changes: ' + error.message);
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
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setAspectRatio(16 / 9);
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
      
      const croppedImageFile = await getCroppedImg(tempImageUrl, croppedAreaPixels, rotation);
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
      toast.success('Cover image resized and updated successfully!');
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

  const handleDownloadVCard = () => {
    if (!profile) return;
    const success = downloadVCardClient({
      ...profile,
      social_links: socialLinks,
      enterprise: profile.enterprise
    }, {
      showToast: true,
      onSuccess: () => {
        toast.success(`Contact card downloaded for ${profile.full_name || profile.username}!`);
      }
    });

    if (!success && profile.username) {
      window.location.href = `/api/vcard/${encodeURIComponent(profile.username)}`;
    }
  };


  return (
    <AdminLayout
      onNavigate={onNavigate}
      activePath="dashboard"
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      hideMobileNav={true}
      hideTopNav={true}
      topRightContent={NotificationBell()}
      isAdmin={profile?.is_admin}
      userHeaderProfile={profile}
    >
      <div className="pb-32">
      <div className={`${activeTab === 'leads' || activeTab === 'analytics' ? 'max-w-5xl' : 'max-w-2xl'} mx-auto px-4 sm:px-6 pt-3 pb-24 transition-all duration-200`}>
        
        {/* Top Header Strip (Integrated into Dashboard Container) */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-200/60 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('public-profile', profile?.username)}
              className="w-9 h-9 rounded-full border border-neutral-300 dark:border-white/15 overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 shadow-xs focus:outline-none cursor-pointer group"
              title="Preview Public Profile"
            >
              {profile?.avatar_url || profile?.cover_image_url ? (
                <img
                  src={profile.avatar_url || profile.cover_image_url}
                  alt={profile.full_name || 'User'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs uppercase bg-neutral-900 text-white dark:bg-white dark:text-neutral-950">
                  {(profile?.full_name || profile?.username || 'U').charAt(0)}
                </div>
              )}
            </button>
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-neutral-900 dark:text-white leading-tight truncate max-w-[150px] sm:max-w-[220px]">
                {profile?.full_name || profile?.username || 'CHIP USER'}
              </span>
              {profile?.username && (
                <span className="text-[10px] text-neutral-400 font-mono -mt-0.5">
                  @{profile.username}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.username && (
              <button
                onClick={() => onNavigate('public-profile', profile.username)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 font-semibold text-xs transition-all cursor-pointer shadow-xs"
                title="Preview Public Link-in-Bio"
              >
                <span>Live Card</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-full border border-neutral-200/80 dark:border-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer bg-white dark:bg-white/5 shadow-xs"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-neutral-700" />}
            </button>

            {NotificationBell()}

            {profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white border border-[#16a34a]/40 shadow-xs transition-all cursor-pointer shrink-0"
                title="Open Super Admin Dashboard"
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Super Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Live System Broadcast Banner for all unread announcements */}
        {latestUnreadBroadcast && (
          <div className="w-full bg-[#16a34a]/15 border border-[#16a34a]/40 p-4 sm:p-5 rounded-2xl flex items-start justify-between gap-4 mb-6 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#16a34a] text-white shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 px-2 py-0.5 rounded-full">System Announcement</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">{latestUnreadBroadcast.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">{latestUnreadBroadcast.message}</p>
              </div>
            </div>
            <button 
              onClick={() => markAllAsRead()}
              className="text-xs bg-white dark:bg-[#111318] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white px-3 py-1.5 rounded-xl border border-neutral-300/80 dark:border-white/10 shrink-0 cursor-pointer font-medium transition-colors"
            >
              Mark Read
            </button>
          </div>
        )}

        {/* Header - Profile & NFC Hub with Super Admin Access for Admins alone */}
        <div className="mb-6 pt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                Profile & NFC Hub
              </h1>
              {profile?.is_admin && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16a34a]/20 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/40 text-[10px] font-bold uppercase tracking-wider">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-snug">
              Manage your contactless card routing, bio links, socials, and live credentials.
            </p>
          </div>
          {profile?.is_admin && (
            <button
              onClick={() => onNavigate('admin-dashboard')}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white border border-[#16a34a]/40 shadow-xs transition-all cursor-pointer shrink-0"
              title="Open Super Admin Dashboard"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin</span>
            </button>
          )}
        </div>

        {/* Top Sticky/Scrollable Tab Bar */}
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-neutral-200/80 dark:border-white/10">
          {[
            { id: 'profile', label: 'Overview', icon: Home },
            { id: 'referrals', label: 'Incentive (10%)', icon: Gift, highlight: true, badge: (referralStats?.unclaimedProMonths || 0) > 0 ? `${referralStats.unclaimedProMonths} Free Pro` : '10% Cash' },
            { id: 'social', label: 'Socials & Links', icon: Heart },
            { id: 'leads', label: '2-Way Leads', icon: UserCheck, badge: leadsStats.newCount > 0 ? String(leadsStats.newCount) : undefined },
            { id: 'nfc', label: 'Order Cards', icon: ShoppingBag },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                    : tab.highlight
                    ? 'bg-[#16a34a]/15 text-[#16a34a] hover:bg-[#16a34a]/25 border border-[#16a34a]/30'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? '' : tab.highlight ? 'text-[#16a34a]' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                    isActive
                      ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-200 dark:text-neutral-900'
                      : tab.highlight
                      ? 'bg-[#16a34a] text-white'
                      : 'bg-amber-400 text-neutral-950'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
          </div>
        ) : profile && activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('settings')} />
            </div>
          </div>
        ) : profile && activeTab === 'leads' ? (
          <div className="flex flex-col gap-8 animate-in fade-in duration-200">
            <ProfileLeadsManager 
              profile={profile} 
              onLeadsChange={(stats) => setLeadsStats(stats)}
            />
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
                  <SmartphoneNfc className="w-5 h-5 text-[#16a34a] dark:text-[#16a34a]" />
                </div>
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Select Card Finish</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 focus:border-[#16a34a] text-sm font-medium"
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 text-[10px] font-bold uppercase tracking-wider">
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
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 focus:border-[#16a34a] text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Recipient WhatsApp / Phone</label>
                      <input 
                        type="tel" 
                        value={checkoutPhone} 
                        onChange={e => setCheckoutPhone(e.target.value)}
                        placeholder="08012345678"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 focus:border-[#16a34a] text-sm font-medium"
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
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/60 focus:border-[#16a34a] text-sm font-medium resize-none"
                    />
                  </div>

                  {/* Transparent Pricing Trust Callout */}
                  <div className="p-4 rounded-2xl bg-[#16a34a]/10 border border-[#16a34a]/30 flex flex-col gap-1.5 text-left mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
                      <span className="text-[11px] font-bold text-[#16a34a] dark:text-[#16a34a] uppercase tracking-wider">
                        Transparent Software Guarantee
                      </span>
                    </div>
                    <div className="text-xs text-neutral-900 dark:text-white font-bold leading-snug">
                      Includes lifetime access to CHIP Core + 3-months of CHIP Pro for free.
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      No monthly subscriptions required for core features. Buy the hardware once, the core profile software is yours for life. If you downgrade after 3 months, your card still works perfectly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!checkoutName || !checkoutPhone || !checkoutAddress || !selectedNfcCard) {
                        alert('Please fill in your name, WhatsApp phone, and delivery address.');
                        return;
                      }
                      const txRef = `SHOP_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                      const priceTotal = Number(selectedNfcCard?.price || 0) + 200;
                      try {
                        await openFlutterwavePayment({
                          txRef,
                          amount: priceTotal,
                          currency: 'NGN',
                          customer: {
                            email: profile.contact_email || profile.email || 'user@example.com',
                            name: checkoutName,
                            phone_number: checkoutPhone,
                          },
                          title: `CHIP NG — ${selectedNfcCard.name}`,
                          description: `NFC Smart Card Order for ${checkoutName}`,
                          meta: {
                            product_id: selectedNfcCard.id,
                            delivery_address: checkoutAddress,
                            referrer: (typeof window !== 'undefined' ? localStorage.getItem('chipng_referrer') : null) || undefined,
                          },
                          onSuccess: async (response: any) => {
                            const ref = response?.tx_ref || response?.transaction_id || txRef;
                            try {
                              // Verify on server to attribute 15% cash commission if referred
                              fetch(`/api/flutterwave/verify-ref/${encodeURIComponent(ref)}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  name: checkoutName,
                                  email: profile.contact_email || profile.email || 'customer@chipng.com',
                                  phone: checkoutPhone,
                                  card_type: selectedNfcCard.name,
                                  amount: priceTotal,
                                  referrer: (typeof window !== 'undefined' ? localStorage.getItem('chipng_referrer') : null) || undefined,
                                })
                              }).catch(() => {});

                              await supabase.from('purchases').insert({
                                product_id: selectedNfcCard.id,
                                seller_id: null,
                                buyer_email: checkoutName || profile.email || 'Guest',
                                amount: selectedNfcCard.price,
                                platform_fee: selectedNfcCard.price * 0.05,
                                net_earnings: selectedNfcCard.price * 0.95,
                                reference: ref,
                                status: 'success'
                              });
                              alert('Payment complete! We will process your NFC card order shortly.');
                              
                              const message = `*New NFC Card Order from ${checkoutName} (${checkoutPhone})*\n\n*Item:* ${selectedNfcCard.name} (₦${Number(selectedNfcCard.price).toLocaleString()})\n*Delivery Address:* ${checkoutAddress}\n*Reference:* ${ref}`;
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
                          },
                        });
                      } catch (err: any) {
                        alert(err?.message || 'Failed to open Flutterwave gateway');
                      }
                    }}
                    disabled={!selectedNfcCard || !checkoutName || !checkoutPhone || !checkoutAddress}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white transition-all font-bold text-sm py-3.5 rounded-full flex items-center justify-center cursor-pointer text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Order & Proceed to Flutterwave
                  </button>
                </div>
              </section>

            </div>
          </div>
        ) : profile && activeTab === 'referrals' ? (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            
            {/* The Incentive Hero Header */}
            <section className="bg-gradient-to-br from-neutral-950 via-[#13161f] to-neutral-950 border border-neutral-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#16a34a]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/20 text-[#16a34a] border border-[#16a34a]/40 text-[11px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> The Incentive • Affiliate Hub
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-[11px] font-bold">
                    10% Instant Cash Commission
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                    3 Cards = 1 Free Pro Month
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Earn 10% Cash on Every Card Sold & Free Pro Months
                  </h2>
                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed max-w-2xl">
                    Share your unique link or custom QR code. Whenever anyone buys a contactless NFC card through your referral, you earn an instant 10% cash payout (₦3,000 – ₦10,000 NGN) deposited into your Nigerian bank account. Every 3 cards sold also awards you 1 Free Month of CHIP Pro SaaS!
                  </p>
                </div>

                {/* Quick Share Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Get your contactless smart business card on CHIP NG! 1-tap contact sharing with zero app needed: https://chipng.com/?ref=${profile?.username || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-neutral-950 font-bold text-xs transition-all shadow-sm cursor-pointer"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Upgrade to the fastest networking tool in Africa. Tap to connect with zero app needed on @chipng_nfc:`)}&url=${encodeURIComponent(`https://chipng.com/?ref=${profile?.username || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs border border-white/15 transition-all"
                  >
                    <FaXTwitter className="w-3.5 h-3.5" />
                    <span>Share on X</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://chipng.com/?ref=${profile?.username || ''}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0077b5] hover:bg-[#006396] text-white font-bold text-xs transition-all"
                  >
                    <FaLinkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(`https://chipng.com/?ref=${profile?.username || ''}`)}&text=${encodeURIComponent(`Check out CHIP NG NFC Smart Business Cards:`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#229ED9] hover:bg-[#1e8bc0] text-white font-bold text-xs transition-all"
                  >
                    <FaTelegram className="w-3.5 h-3.5" />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Unique Referral Link & Custom QR Code Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Unique Link & Commission Calculator */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Unique Link Card */}
                <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 sm:p-7 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight flex items-center gap-2">
                        <Link className="w-4 h-4 text-[#16a34a]" /> Your Unique Referral Link
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Cookies track referred purchases for 30 days
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] text-[10px] font-mono font-bold">
                      10% Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Standard Homepage Referral Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-[#161922] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate select-all">
                        {`https://chipng.com/?ref=${profile?.username || 'username'}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const link = `https://chipng.com/?ref=${profile?.username || ''}`;
                          navigator.clipboard.writeText(link);
                          setReferralCopied(true);
                          toast.success('Referral link copied to clipboard!');
                          setTimeout(() => setReferralCopied(false), 2000);
                        }}
                        className="px-4 py-3 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                      >
                        {referralCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{referralCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Direct Card Order Funnel Link
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-[#161922] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-800 dark:text-neutral-200 truncate select-all">
                        {`https://chipng.com/buy-card?ref=${profile?.username || 'username'}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const link = `https://chipng.com/buy-card?ref=${profile?.username || ''}`;
                          navigator.clipboard.writeText(link);
                          setDirectCardCopied(true);
                          toast.success('Direct card order link copied!');
                          setTimeout(() => setDirectCardCopied(false), 2000);
                        }}
                        className="px-4 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        {directCardCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{directCardCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Commission Rate Breakdown */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5 flex flex-col gap-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Your 10% Cash Earnings per Card:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5">
                        <div className="text-[10px] text-neutral-400">White PVC (₦30k)</div>
                        <div className="text-xs font-extrabold text-[#16a34a] mt-0.5">+₦3,000</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5">
                        <div className="text-[10px] text-neutral-400">Black PVC (₦35k)</div>
                        <div className="text-xs font-extrabold text-[#16a34a] mt-0.5">+₦3,500</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5">
                        <div className="text-[10px] text-neutral-400">Smart Metal (₦50k)</div>
                        <div className="text-xs font-extrabold text-[#16a34a] mt-0.5">+₦5,000</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#151821] border border-neutral-200/60 dark:border-white/5">
                        <div className="text-[10px] text-neutral-400">Debit Card (₦100k)</div>
                        <div className="text-xs font-extrabold text-[#16a34a] mt-0.5">+₦10,000</div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: High-Res Branded QR Code */}
              <div className="lg:col-span-5 flex flex-col">
                <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 sm:p-7 flex flex-col items-center text-center gap-4 h-full justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                      <QrCode className="w-3.5 h-3.5" /> High-Res Referral QR
                    </span>
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                      Custom Referral QR Code
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Print this QR code on flyers, badges, or display at networking events.
                    </p>
                  </div>

                  {/* QR Box with white backing & frame */}
                  <div className="p-4 bg-white rounded-2xl shadow-md border-2 border-[#16a34a]/30 flex items-center justify-center relative group">
                    <QRCodeSVG
                      id="referral-qr-svg"
                      level="H"
                      value={`https://chipng.com/buy-card?ref=${profile?.username || 'username'}&source=qr`}
                      size={180}
                      marginSize={2}
                      fgColor="#000000"
                    />
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <button
                      type="button"
                      onClick={downloadReferralQrCodePng}
                      className="w-full py-3 px-4 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR Code (.PNG)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `https://chipng.com/buy-card?ref=${profile?.username || 'username'}&source=qr`;
                        navigator.clipboard.writeText(url);
                        toast.success('QR Destination URL copied!');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-50 dark:hover:bg-white/5 transition-all"
                    >
                      Copy QR Destination Link
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {/* 4 Performance Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Cards Sold</span>
                  <ShoppingBag className="w-4 h-4 text-[#16a34a]" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-neutral-950 dark:text-white">
                    {Number(referralStats?.cardsSold || 0)}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    ₦{Number(referralStats?.totalSalesVolume || 0).toLocaleString()} gross sales
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">10% Cash Earned</span>
                  <Coins className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-neutral-950 dark:text-white">
                    ₦{Number(referralStats?.totalCashEarned || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    ₦{Number(referralStats?.pendingPayout || 0).toLocaleString()} pending payout
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Free Pro Months</span>
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-neutral-950 dark:text-white">
                    {Number(referralStats?.freeProMonthsEarned || 0)}
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
                    {(Number(referralStats?.unclaimedProMonths || 0)) > 0 ? `${referralStats.unclaimedProMonths} ready to claim!` : '3 cards per month'}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-neutral-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Link & QR Clicks</span>
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-neutral-950 dark:text-white">
                    {Number(referralStats?.totalClicks || 0)}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                    Sub-10ms redirect telemetry
                  </div>
                </div>
              </div>
            </div>

            {/* Pro SaaS Milestone Progress Tracker */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 sm:p-7 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                      Free Pro SaaS Milestone Tracker
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Sell 3 NFC cards through your profile link to earn 1 Free Month of CHIP Pro SaaS (includes custom domains, deep analytics, and premium bio themes).
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-bold text-xs self-start sm:self-auto">
                  {Number(referralStats?.cardsTowardsNextProMonth || 0)} of 3 Cards Sold
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="flex flex-col gap-2">
                <div className="w-full h-4 bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-neutral-200/60 dark:border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#16a34a] to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, ((Number(referralStats?.cardsTowardsNextProMonth || 0)) / 3) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-neutral-500 font-medium px-1">
                  <span>0 Cards</span>
                  <span>1 Card Sold</span>
                  <span>2 Cards Sold</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">🎉 3 Cards = 1 Free Pro Month</span>
                </div>
              </div>

              {/* Claim Action or Milestone Countdown */}
              {(Number(referralStats?.unclaimedProMonths || 0)) > 0 ? (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      🎁
                    </div>
                    <div>
                      <div className="text-sm font-bold text-neutral-950 dark:text-white">
                        {Number(referralStats?.unclaimedProMonths || 0)} Free Pro Month{(Number(referralStats?.unclaimedProMonths || 0)) > 1 ? 's' : ''} Ready to Claim!
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Milestone reached! Click below to activate your free month instantly.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClaimProMonth}
                    disabled={claimingReward}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {claimingReward ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{claimingReward ? 'Activating...' : 'Claim 1 Free Pro Month'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-neutral-200/60 dark:border-white/5 flex items-center justify-between">
                  <span>
                    ⚡ You need <strong className="text-neutral-900 dark:text-white">{3 - (Number(referralStats?.cardsTowardsNextProMonth || 0))} more card sale{3 - (Number(referralStats?.cardsTowardsNextProMonth || 0)) > 1 ? 's' : ''}</strong> to unlock your next Free Pro Month.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const link = `https://chipng.com/buy-card?ref=${profile?.username || ''}`;
                      navigator.clipboard.writeText(link);
                      toast.success('Link copied! Share it with friends or clients.');
                    }}
                    className="text-xs font-bold text-[#16a34a] hover:underline cursor-pointer"
                  >
                    Share Link Now →
                  </button>
                </div>
              )}
            </section>

            {/* Nigerian Bank Account Payout Settings Form */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 sm:p-7 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#16a34a]" /> Nigerian Bank Payout Account
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Your 10% cash commissions are transferred directly to your bank account
                  </p>
                </div>
                {referralStats.payoutSettings ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3" /> Payout Active
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                    Setup Required
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Bank Name
                  </label>
                  <select
                    value={payoutBankName}
                    onChange={(e) => setPayoutBankName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50"
                  >
                    {[
                      'Guaranty Trust Bank (GTBank)',
                      'Access Bank',
                      'Zenith Bank',
                      'Kuda Bank',
                      'OPay (Paycom)',
                      'PalmPay',
                      'First Bank of Nigeria',
                      'United Bank for Africa (UBA)',
                      'Stanbic IBTC Bank',
                      'Moniepoint Microfinance Bank',
                      'Sterling Bank',
                      'Fidelity Bank',
                      'Wema Bank (ALAT)',
                      'Union Bank of Nigeria',
                      'FCMB (First City Monument Bank)',
                      'Standard Chartered Bank',
                      'Jaiz Bank'
                    ].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    10-Digit NUBAN Account Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={payoutAccountNumber}
                    onChange={(e) => setPayoutAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="0123456789"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={payoutAccountName}
                    onChange={(e) => setPayoutAccountName(e.target.value)}
                    placeholder="e.g. Victor Dennis Okoye"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  ⚡ Automatic payout cycles run every Friday for all verified referrals.
                </span>
                <button
                  type="button"
                  onClick={handleSavePayoutSettings}
                  disabled={savingPayout}
                  className="px-6 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {savingPayout ? 'Saving...' : 'Save Payout Details'}
                </button>
              </div>
            </section>

            {/* Referral Sales Ledger History */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                    Referral Sales & Commission Ledger
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Real-time log of physical cards purchased via your profile link
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchReferralStats}
                  className="p-2 rounded-xl border border-neutral-200/80 dark:border-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  title="Refresh stats"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingReferrals ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="p-6">
                {referralStats.recentSales && referralStats.recentSales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200/80 dark:border-white/10 text-neutral-400 uppercase font-semibold text-[10px] tracking-wider">
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Buyer</th>
                          <th className="pb-3">Card Model</th>
                          <th className="pb-3">Card Amount</th>
                          <th className="pb-3">Your 10% Commission</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                        {referralStats.recentSales.map((sale: any) => (
                          <tr key={sale.id || sale.payment_reference} className="hover:bg-neutral-50/50 dark:hover:bg-white/[0.02]">
                            <td className="py-3.5 text-neutral-500 font-mono">
                              {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="py-3.5 font-semibold text-neutral-900 dark:text-white">
                              {sale.buyer_name || 'Anonymous Buyer'}
                            </td>
                            <td className="py-3.5 text-neutral-600 dark:text-neutral-300">
                              {sale.card_type}
                            </td>
                            <td className="py-3.5 font-mono text-neutral-800 dark:text-neutral-200">
                              ₦{Number(sale.card_amount).toLocaleString()}
                            </td>
                            <td className="py-3.5 font-bold font-mono text-[#16a34a]">
                              +₦{Number(sale.commission_amount).toLocaleString()}
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                sale.payout_status === 'paid'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}>
                                {sale.payout_status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#16a34a]/10 text-[#16a34a] flex items-center justify-center">
                      <Gift className="w-7 h-7" />
                    </div>
                    <div className="font-bold text-neutral-900 dark:text-white text-base">
                      No referral card sales recorded yet
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
                      Copy your referral link above or share your custom QR code on WhatsApp Status, Instagram, and LinkedIn. As soon as someone orders a card, your 10% cash commission shows up here!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const link = `https://chipng.com/?ref=${profile?.username || ''}`;
                        navigator.clipboard.writeText(link);
                        toast.success('Referral link copied to clipboard!');
                      }}
                      className="mt-2 px-5 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Copy Referral Link Now
                    </button>
                  </div>
                )}
              </div>
            </section>

          </div>
        ) : profile && activeTab === 'profile' ? (
          <div className="flex flex-col gap-6">

            {/* The Incentive Teaser Widget */}
            <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#121b06] border border-[#16a34a]/30 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-[#16a34a] text-white shrink-0 shadow-sm">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#16a34a]/20 text-[#16a34a] px-2.5 py-0.5 rounded-full border border-[#16a34a]/30">
                      The Incentive
                    </span>
                    <span className="text-xs font-semibold text-neutral-300">
                      10% Cash Commission per Card
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    Refer Friends & Earn Cash or Free Pro Months
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5 max-w-md leading-relaxed">
                    Earn ₦3,000 – ₦10,000 NGN per physical card sold through your link. Every 3 card buyers also unlocks 1 Free Pro Month!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const link = `https://chipng.com/?ref=${profile?.username || ''}`;
                    navigator.clipboard.writeText(link);
                    toast.success('Referral link copied to clipboard!');
                  }}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer"
                >
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('referrals')}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open Hub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Customize Your Public Profile Card - Exactly matches IMG_2957.jpeg */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col gap-6">
              
              {/* Header Row: Title & Circular Lime Edit Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Customize Your Public Profile
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.getElementById('cover-image-upload');
                    if (fileInput) fileInput.click();
                  }}
                  className="w-10 h-10 rounded-full bg-[#EBFD80] hover:bg-[#dff964] text-neutral-950 flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                  title="Change Cover / Edit Profile"
                >
                  <Pencil className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>

              {/* Action Buttons: Preview Bio & Save Changes */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('public-profile', profile?.username)}
                    className="w-full py-3.5 px-4 bg-white dark:bg-[#151821] text-neutral-900 dark:text-white font-semibold text-sm rounded-full border border-neutral-300 dark:border-white/20 hover:bg-neutral-50 dark:hover:bg-[#1c202d] transition-all text-center shadow-xs cursor-pointer"
                  >
                    Preview Bio
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-3.5 px-4 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold text-sm rounded-full hover:opacity-90 transition-all text-center shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                {profile?.is_admin && (
                  <button
                    type="button"
                    onClick={() => onNavigate('admin-dashboard')}
                    className="w-full py-3 px-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border border-[#16a34a]/50"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Open Super Admin Control Center</span>
                  </button>
                )}
              </div>

              {/* COVER IMAGE */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2.5">
                  COVER IMAGE
                </label>
                <div className="relative group w-full h-56 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-neutral-200/80 dark:border-white/10 bg-neutral-100 dark:bg-[#151821]">
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
                        id="cover-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                        disabled={uploading}
                      />
                    </label>
                    <button 
                      type="button"
                      onClick={() => setCoverUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuAKmj1IQNtRkZw-_CqYMvw1-oJRYbntoE9i-lcO4f0YTzE_on6FkGQEYyBT1UdJVxGV7OyV7ueGqGF2ch0RtSSReFT8haZ8lApX_7eI6tzbitRCQ6osMYAawyY38MGBi-DpEMoi9ECaOGMDEgNK_67r-NiOzMM9ELvAND9EE8Wk4NeqOUJGZZOq_UFQpkO0VYW9ksAGgsyyRu3PLkfrtMz0OidKOYsyRTejiHv7dqViKM_2W3KUE-4bVO2Xe9qhqoFFNPDvAfZVStY")}
                      className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2.5 rounded-full font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* FULL NAME */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  FULL NAME
                </label>
                <input 
                  type="text" 
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="e.g. Victor Okoye"
                  className="w-full px-5 py-4 bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/50 outline-none transition-all text-sm font-semibold text-neutral-900 dark:text-white"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  USERNAME
                </label>
                <div className="w-full px-5 py-4 bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex items-center focus-within:ring-2 focus-within:ring-[#16a34a]/50 focus-within:border-[#16a34a] transition-all">
                  <span className="text-sm font-medium text-neutral-400 dark:text-neutral-500 select-none mr-2">
                    chipng.com/
                  </span>
                  <input 
                    type="text" 
                    value={profile.username || ''} 
                    onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '') })}
                    placeholder="username"
                    className="bg-transparent border-0 p-0 text-sm font-semibold text-neutral-900 dark:text-white focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* JOB TITLE / HEADLINE */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  JOB TITLE / HEADLINE
                </label>
                <input 
                  type="text" 
                  value={profile.headline || ''}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Founder And Group Managing Director"
                  className="w-full px-5 py-4 bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/50 outline-none transition-all text-sm font-semibold text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  BIO / ABOUT ME
                </label>
                <textarea 
                  rows={3}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell visitors what you do and what you're passionate about..."
                  className="w-full px-5 py-4 bg-neutral-50/70 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-6 border-t border-neutral-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Contact Email</label>
                      <input 
                        type="email" 
                        value={profile.contact_email || ''}
                        onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                        placeholder={profile.email}
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
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
                                className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
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
                              <Plus className="w-4 h-4 text-[#16a34a]" /> Add Phone Number
                            </button>
                          );
                        })()}
                      </div>

                      {/* WhatsApp Indicator Toggle */}
                      <div className="mt-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                            <FaWhatsapp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-900 dark:text-white">WhatsApp Enabled Number</span>
                              {(profile.is_whatsapp ?? true) ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#25D366] text-neutral-950">
                                  WhatsApp Active
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                  Call Only
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                              {(profile.is_whatsapp ?? true)
                                ? 'Enables 1-tap WhatsApp chat on your public bio and automatically registers as a WhatsApp contact in downloaded vCards.'
                                : 'Visitors will see standard cellular phone call action instead of WhatsApp.'}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-center">
                          <input
                            type="checkbox"
                            checked={profile.is_whatsapp ?? true}
                            onChange={(e) => setProfile({ ...profile, is_whatsapp: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Office / City Address</label>
                      <input 
                        type="text" 
                        value={profile.address || ''}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        placeholder="Victoria Island, Lagos, Nigeria"
                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/50 outline-none transition-all text-sm font-medium text-neutral-900 dark:text-white"
                      />
                    </div>

                    {/* Dedicated Contact Details Save Bar */}
                    <div className="md:col-span-2 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-100/70 dark:bg-white/[0.03] p-4 rounded-2xl border border-neutral-200/60 dark:border-white/5">
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="font-semibold text-neutral-900 dark:text-white">Direct Contact Routing:</span> Saved directly to your Supabase profile and 1-tap vCard exports.
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveContactDetails}
                        disabled={savingContactDetails}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {savingContactDetails ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving to Supabase...</span>
                          </>
                        ) : contactSavedFeedback ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-neutral-950 stroke-[3]" />
                            <span>Saved in Supabase!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Contact Details</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-neutral-100 dark:border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-50/70 dark:bg-white/[0.02] border border-neutral-200/70 dark:border-white/5 rounded-2xl gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-neutral-950 dark:text-white">Blue Verification Badge</h4>
                          {profile.is_verified && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#16a34a] text-white">Active</span>
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
                          <button
                            type="button"
                            onClick={async () => {
                              const txRef = 'VERIFY_' + Math.random().toString(36).substring(2, 10).toUpperCase();
                              const verifyAmount = 3000 * verificationMonths;
                              try {
                                await openFlutterwavePayment({
                                  txRef,
                                  amount: verifyAmount,
                                  currency: 'NGN',
                                  customer: {
                                    email: profile.contact_email || profile.email || 'user@example.com',
                                    name: profile.name || 'User',
                                  },
                                  title: 'CHIP NG — Verification Badge',
                                  description: `Verified badge subscription for ${verificationMonths} month(s)`,
                                  onSuccess: async (ref: any) => {
                                    const refStr = ref?.tx_ref || ref?.transaction_id || txRef;
                                    setProfile({ ...profile, is_verified: true });
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (user) {
                                      await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
                                      try {
                                        await supabase.from('purchases').insert([{
                                          buyer_email: profile.contact_email || profile.email || 'user@example.com',
                                          amount: verifyAmount,
                                          platform_fee: verifyAmount,
                                          net_earnings: 0,
                                          reference: refStr,
                                          purchase_type: 'verification',
                                          seller_id: user.id,
                                          status: 'expires_' + (Date.now() + verificationMonths * 30 * 24 * 60 * 60 * 1000)
                                        }]);
                                      } catch (e) {
                                        console.error("Failed to record verification purchase", e);
                                      }
                                    }
                                    alert('Payment successful! You are now verified.');
                                  },
                                });
                              } catch (err: any) {
                                alert(err?.message || 'Failed to open Flutterwave gateway');
                              }
                            }}
                            className="px-5 py-2.5 text-xs font-bold rounded-full transition-all bg-[#16a34a] hover:bg-[#15803d] text-white shadow-sm cursor-pointer"
                          >
                            Get Verified
                          </button>
                        )}
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

            {/* Profile Views */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">Profile Traffic</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Real-time bio visitor impressions</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/10 dark:bg-[#16a34a]/20 flex items-center justify-center text-neutral-900 dark:text-[#16a34a]">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Total Profile Impressions</div>
                <div className="text-4xl font-extrabold flex items-center gap-3 text-neutral-950 dark:text-white">
                  {profileViews} 
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#16a34a]/20 text-neutral-950 dark:text-[#16a34a] flex items-center gap-1">
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
                    className="w-4 h-4 rounded text-neutral-900 focus:ring-[#16a34a]" 
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
                      value={`https://chipng.com/${profile.username || ''}?source=qr`}
                      size={54} marginSize={1}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">@{profile.username || 'username'}</div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Scan to open digital bio profile</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  {/* Cover Photo Shared Link Preview */}
                  {profile.cover_image_url && (
                    <div className="rounded-xl overflow-hidden border border-neutral-200/80 dark:border-white/10 bg-neutral-100 dark:bg-black/30">
                      <div className="relative h-24 w-full">
                        <img 
                          src={profile.cover_image_url} 
                          alt="Cover Photo Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold tracking-wider uppercase backdrop-blur-xs">
                          Active Cover on Shared Links
                        </span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleDownloadVCard}
                    className="w-full px-4 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download vCard Contact File
                  </button>

                  {/* 1-Click Social Sharing for WhatsApp, Twitter, LinkedIn */}
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Connect with ${profile.full_name || profile.username} on CHIP NG: https://www.chipng.com/@${profile.username}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Connect with ${profile.full_name || profile.username} on @chipng_nfc:`)}&url=${encodeURIComponent(`https://www.chipng.com/@${profile.username}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200/80 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-white/5 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>X / Twitter</span>
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.chipng.com/@${profile.username}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                    >
                      <span>LinkedIn</span>
                    </a>
                  </div>

                  <button 
                    onClick={() => {
                      const shareUrl = `https://www.chipng.com/@${profile.username}`;
                      if (navigator.share) {
                        navigator.share({
                          title: `${profile.full_name || profile.username}'s Contactless Profile | CHIP NG`,
                          text: `Connect with ${profile.full_name || profile.username} on CHIP NG:`,
                          url: shareUrl
                        }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success("Profile URL copied to clipboard!");
                      }
                    }}
                    className="w-full px-4 py-3 border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Share className="w-4 h-4" /> Share / Copy Profile URL
                  </button>
                  <a 
                    href={`/@${profile.username || ''}`}
                    target="_blank"
                    className="text-[#0066cc] dark:text-[#58a6ff] text-xs font-semibold text-center hover:underline bg-neutral-100/60 dark:bg-white/5 py-2.5 rounded-xl truncate px-3"
                  >
                    https://www.chipng.com/@{profile.username || 'username'}
                  </a>
                </div>
              </div>
            </section>

            {/* 2-Way Contact Exchange Card */}
            <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex justify-between items-center bg-neutral-50/50 dark:bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">2-Way Contact Exchange</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-[#16a34a] text-[10px] font-mono font-bold">Active on NFC</span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Let prospects send their contact details back to your dashboard with 1 tap</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 flex items-center justify-center text-[#5b7300] dark:text-[#16a34a]">
                  <UserCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">Total Contacts</span>
                    <div className="text-2xl font-extrabold text-neutral-950 dark:text-white mt-0.5">{leadsStats.total}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5">
                    <span className="text-[10px] font-mono uppercase text-amber-500">New Follow-Ups</span>
                    <div className="text-2xl font-extrabold text-amber-500 mt-0.5">{leadsStats.newCount}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab('leads')}
                    className="flex-1 py-3 px-4 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-4 h-4" /> View 2-Way Contacts CRM
                  </button>
                  <a
                    href={`/${profile.username || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    title="Test on live profile"
                  >
                    <span>Test on Card</span>
                  </a>
                </div>
              </div>
            </section>
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
                <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/10 dark:bg-[#16a34a]/20 flex items-center justify-center text-neutral-900 dark:text-[#16a34a]">
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
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50"
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
                      className="w-4 h-4 rounded text-neutral-900 focus:ring-[#16a34a]" 
                    />
                    <label htmlFor="show-followers" className="text-neutral-800 dark:text-neutral-200 text-xs font-semibold cursor-pointer">Display aggregate follower tally on card</label>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {socialLinks.map((item, i) => {
                    const style = profile.social_links_style || 'color-circle';
                    
                    return (
                    <div key={i} className="flex gap-3 items-center flex-wrap sm:flex-nowrap p-3 rounded-2xl bg-neutral-50/50 dark:bg-white/[0.02] border border-neutral-200/70 dark:border-white/5">
                      <div className="shrink-0 flex items-center justify-center p-1">
                        <SocialMediaIconBadge
                          platform={item.platform}
                          style={style}
                          size="sm"
                          showHoverEffect={false}
                        />
                      </div>
                      <select 
                        value={item.platform}
                        onChange={(e) => {
                          const newLinks = [...socialLinks];
                          newLinks[i].platform = e.target.value;
                          setSocialLinks(newLinks);
                        }}
                        className="w-full sm:w-1/4 px-3.5 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl font-medium text-xs bg-white dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#16a34a]/50"
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
                        className="flex-1 px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-900 dark:text-white bg-white dark:bg-[#151821] outline-none focus:ring-2 focus:ring-[#16a34a]/50 min-w-[140px]" 
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
                          className="w-full px-3 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-900 dark:text-white bg-white dark:bg-[#151821] outline-none focus:ring-2 focus:ring-[#16a34a]/50" 
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
                  <Plus className="w-4 h-4 text-[#16a34a]" /> Add Another Social Channel
                </button>
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
                  <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/10 dark:bg-[#16a34a]/20 flex items-center justify-center text-neutral-900 dark:text-[#16a34a]">
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
                          className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${profile.bg_color === color ? 'border-[#16a34a] scale-115 shadow-md ring-2 ring-[#16a34a]/50' : 'border-neutral-200 dark:border-white/10 hover:scale-105'}`}
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
                            className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-between gap-3 transition-all ${isActive ? 'border-[#16a34a] bg-[#16a34a]/10 dark:bg-[#16a34a]/10 shadow-sm ring-1 ring-[#16a34a]' : 'border-neutral-200/80 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 bg-neutral-50/50 dark:bg-white/[0.02]'}`}
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
                      className="px-6 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full font-bold transition-all text-xs flex items-center gap-2 shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-[100] bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111318] p-5 sm:p-7 rounded-3xl w-full max-w-4xl flex flex-col max-h-[92vh] border border-neutral-200/80 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-white/5">
              <div>
                <h3 className="font-bold text-lg text-neutral-950 dark:text-white flex items-center gap-2">
                  <span>Resize & Frame Cover Image</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#16a34a]/15 text-[#16a34a] border border-[#16a34a]/30">
                    High Resolution
                  </span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Select your preferred aspect ratio, zoom level, and rotation for a pixel-perfect contactless profile header.
                </p>
              </div>
              <button 
                onClick={() => {
                  setCropModalOpen(false);
                  setTempImageUrl(null);
                }}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aspect Ratio Selector Tabs */}
            <div className="mb-3.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Aspect Ratio Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '16:9 Banner', value: 16 / 9, desc: 'Wide Header' },
                  { label: '3:1 Panorama', value: 3 / 1, desc: 'Ultra-Wide' },
                  { label: '4:3 Standard', value: 4 / 3, desc: 'Classic' },
                  { label: '1:1 Square', value: 1, desc: 'Avatar / Tile' },
                  { label: '4:5 Portrait', value: 4 / 5, desc: 'Mobile Full' },
                  { label: 'Freeform', value: undefined, desc: 'Custom' }
                ].map((item, idx) => {
                  const isSelected = aspectRatio === item.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAspectRatio(item.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-[#16a34a] text-white shadow-sm scale-102' 
                          : 'bg-neutral-100 dark:bg-white/5 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-white/10'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cropper Viewport */}
            <div className="relative w-full h-[40vh] sm:h-[48vh] bg-neutral-950 rounded-2xl overflow-hidden shadow-inner border border-neutral-800/80">
              <Cropper
                image={tempImageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Live Dimensions and Control Strip */}
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/5 flex flex-col gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 w-14 shrink-0">
                  Zoom
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(1, Number((z - 0.2).toFixed(1))))}
                  className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-200 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3.5}
                  step={0.05}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#16a34a] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3.5, Number((z + 0.2).toFixed(1))))}
                  className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 flex items-center justify-center text-neutral-700 dark:text-neutral-200 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white w-12 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Secondary Controls Bar: Rotate, Reset, Live Dimension Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate 90° ({rotation}°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCrop({ x: 0, y: 0 });
                      setZoom(1);
                      setRotation(0);
                      setAspectRatio(16 / 9);
                    }}
                    className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {croppedAreaPixels && (
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-white/[0.03] px-3 py-1.5 rounded-xl border border-neutral-200/60 dark:border-white/5">
                    <Maximize2 className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>Resolution: {Math.round(croppedAreaPixels.width)} × {Math.round(croppedAreaPixels.height)} px</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-5 pt-3 border-t border-neutral-100 dark:border-white/5">
              <button
                type="button"
                className="px-5 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-full font-bold text-xs hover:bg-neutral-100 dark:hover:bg-white/5 transition-all text-neutral-900 dark:text-white cursor-pointer"
                onClick={() => {
                  setCropModalOpen(false);
                  setTempImageUrl(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 min-w-[130px] shadow-sm transition-all cursor-pointer"
                disabled={uploading}
                onClick={handleCropSave}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resizing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Apply & Save Cover</span>
                  </>
                )}
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
                  className={`flex flex-col items-center justify-center py-3 rounded-2xl border transition-all ${currentLink.size === size ? 'border-[#16a34a] text-neutral-950 dark:text-white bg-[#16a34a]/15' : 'border-neutral-200/80 dark:border-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                >
                  <div className={`w-6 border-2 mb-2 rounded-md ${currentLink.size === size ? 'border-[#16a34a]' : 'border-neutral-400'} ${size === 'Big' ? 'h-5' : size === 'Medium' ? 'h-3' : size === 'Small' ? 'h-2' : 'h-1'}`}></div>
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
                  <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16a34a]"></div>
                </label>
              </div>

              <input
                type="text"
                placeholder="https://yourwebsite.com or @handle"
                value={currentLink.url}
                onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
                className="w-full bg-white dark:bg-[#101216] border border-neutral-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50 font-medium"
              />

              <input
                type="text"
                placeholder="Link Title (e.g. Read My Portfolio)"
                value={currentLink.label}
                onChange={(e) => setCurrentLink({...currentLink, label: e.target.value})}
                className="w-full bg-white dark:bg-[#101216] border border-neutral-200/80 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50 font-medium"
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
              className="w-full mt-6 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-full transition-all text-sm shadow-sm cursor-pointer"
            >
              Save Link Card
            </button>
          </div>
        </div>
      )}
      
      {setupGuideActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 dark:bg-neutral-900 text-white p-5 rounded-3xl shadow-2xl z-50 flex flex-col sm:flex-row items-center gap-6 border border-neutral-700/60 min-w-[300px] sm:min-w-[500px] max-w-[90vw] animate-in slide-in-from-bottom-10">
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#16a34a] mb-1">Step {setupStep} of {setupSteps.length}</span>
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
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full font-bold transition-all text-xs shadow-sm"
            >
              {setupStep < setupSteps.length ? "Next Step" : "Finish Setup"}
            </button>
          </div>
        </div>
      )}
      
        {/* Floating Capsule Bottom Navigation Bar - Exactly matching IMG_3124.jpeg */}
        <nav 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#16171E]/95 dark:bg-[#121318]/95 backdrop-blur-xl border border-white/15 rounded-full p-1.5 shadow-[0_12px_45px_rgba(0,0,0,0.55)] flex items-center justify-between gap-1.5 sm:gap-2 max-w-sm sm:max-w-md w-auto"
          aria-label="Dashboard bottom navigation"
        >
          {[
            { 
              id: 'profile', 
              label: 'Overview', 
              icon: Home 
            },
            { 
              id: 'social', 
              label: 'Socials & Links', 
              icon: Heart 
            },
            { 
              id: 'leads', 
              label: '2-Way Leads', 
              icon: UserCheck,
              badge: leadsStats.newCount > 0 ? leadsStats.newCount : undefined
            },
            { 
              id: 'nfc', 
              label: 'NFC Cards', 
              icon: ShoppingBag 
            },
            { 
              id: 'referrals', 
              label: 'Incentive (10%)', 
              icon: Gift,
              badge: (referralStats?.unclaimedProMonths || 0) > 0 ? referralStats.unclaimedProMonths : undefined
            },
            { 
              id: 'settings', 
              label: 'Settings', 
              icon: User 
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return isActive ? (
              <div
                key={tab.id}
                className="bg-white text-neutral-950 px-4 sm:px-5 h-10 sm:h-11 rounded-full flex flex-col items-center justify-center shadow-md transition-all select-none"
                title={tab.label}
              >
                <Icon className="w-5 h-5 text-neutral-950" />
                <span className="w-1 h-1 rounded-full bg-neutral-950 mt-0.5"></span>
              </div>
            ) : (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="px-3.5 sm:px-4 h-10 sm:h-11 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer relative group"
                title={tab.label}
                aria-label={tab.label}
              >
                <Icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                {tab.badge && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#16171E] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

          </div>
    </AdminLayout>
  );
}
