import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { supabase, adminAuthClient } from '../supabaseClient';
import { Shield, ShieldAlert, CheckCircle, AlertCircle, Package, Users, LogOut, Search, Plus, Trash2, Edit2, Globe, BarChart2, DollarSign, Activity, Download, FileText, Eye, EyeOff, Key, Copy, Lock, Sun, Moon, X, CreditCard, Briefcase, Phone, MapPin, Calendar, Palette, ShoppingBag, ExternalLink, UserCheck, Check, Sparkles, Upload, Loader2, ArrowUp, ArrowDown, Share2, Layers, FileSpreadsheet, Database } from 'lucide-react';
import { SOCIAL_PLATFORMS, PROFILE_LAYOUTS, COLOR_PRESETS } from './UserDashboard';
import { ebooksData } from '../utils/ebooksData';
import { parseCsvText, mapCsvRowsToProfiles, convertGoogleUrlToCsvExport, downloadGoogleSheetsTemplateCsv, ParsedFormUser } from '../utils/googleFormParser';
import AdminBlogManager from './AdminBlogManager';
import AdminLeadsManager from './AdminLeadsManager';
import AdminBuyBoxManager from './AdminBuyBoxManager';
import AdminSeoManager from './AdminSeoManager';
import AdminBroadcastManager from './AdminBroadcastManager';
import AdminNotificationManager from './AdminNotificationManager';
import AdminSalesManager from './AdminSalesManager';
import AdminPixelManager from './AdminPixelManager';
import AdminAppDownloadsManager from './AdminAppDownloadsManager';
import { AdminPortfolioManager } from './AdminPortfolioManager';
import AdminUserCommsManager from './AdminUserCommsManager';
import AdminEmailManager from './AdminEmailManager';
import { MessageCircle, MessageSquare, Send, Bell, Link as LinkIcon, Smartphone, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from '../components/Toast';
import BrandLogo from '../components/BrandLogo';
import { SocialMediaIconBadge } from '../components/social/SocialMediaIconBadge';
import InternationalPhoneInput from '../components/InternationalPhoneInput';
import { getAdminAuthHeaders, parseTimestamp, getProductPreviewImage, SUPER_ADMIN_ALLOWLIST } from '../utils/adminApi';

export default function AdminDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [blogViews, setBlogViews] = useState<number>(0);
  const [appDownloadsTotal, setAppDownloadsTotal] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; confirmLabel?: string; onConfirm: () => Promise<void> | void } | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'email' | 'comms' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo' | 'broadcast' | 'notifications' | 'sales' | 'pixel' | 'downloads' | 'portfolio'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['analytics', 'users', 'email', 'comms', 'products', 'blog', 'leads', 'buybox', 'seo', 'broadcast', 'notifications', 'sales', 'pixel', 'downloads', 'portfolio'].includes(tabParam)) {
        return tabParam as any;
      }
    }
    return 'analytics';
  });
  const [editSlug, setEditSlug] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('edit') || undefined;
    }
    return undefined;
  });
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'verified' | 'unverified'>('all');

  // Product form state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', media_urls: [] as string[] });

  // User form state - 100% Profile Setup
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    username: '',
    headline: '',
    bio: '',
    contact_email: '',
    phone_number: '',
    is_whatsapp: true,
    address: '',
    booking_provider: 'Calendly (Integrated)',
    calendar_link: '',
    show_availability: true,
    show_total_followers: false,
    social_links_style: 'color-circle',
    is_verified: false,
    is_admin: false,
    theme: 'default',
    bg_color: '#000000',
    text_color: '#ffffff',
    use_gradient: false,
    enterprise_id: '',
    cover_image_url: ''
  });
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const [userSocialLinks, setUserSocialLinks] = useState<any[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [adminEditTab, setAdminEditTab] = useState<'identity' | 'contact' | 'scheduling' | 'links' | 'socials' | 'store' | 'appearance' | 'roles'>('identity');
  const [savingUserProfile, setSavingUserProfile] = useState(false);
  const [enterprisesList, setEnterprisesList] = useState<any[]>([]);

  // Blog form state
  const [editingPost, setEditingPost] = useState<any>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', slug: '', content: '', excerpt: '', cover_image_url: '', meta_title: '', meta_description: '', keywords: '', is_published: false });

  // Create user state
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingUserLoading, setCreatingUserLoading] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // User Passwords Vault State (Super Admin Only)
  const [userCredentials, setUserCredentials] = useState<Record<string, string>>({});
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [settingPasswordUser, setSettingPasswordUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [savingPasswordLoading, setSavingPasswordLoading] = useState<boolean>(false);
  const [passwordModalError, setPasswordModalError] = useState<string>('');
  const [showModalPassword, setShowModalPassword] = useState<boolean>(true);

  // Google Form Automated Profile Ingestion State
  const [showGoogleFormModal, setShowGoogleFormModal] = useState<boolean>(false);
  const [googleFormTab, setGoogleFormTab] = useState<'portal' | 'import' | 'template' | 'script'>('portal');
  const [googleFormUrl, setGoogleFormUrl] = useState<string>('');
  const [googleFormContent, setGoogleFormContent] = useState<string>('');
  const [isParsingGoogleForm, setIsParsingGoogleForm] = useState<boolean>(false);
  const [parsedProfiles, setParsedProfiles] = useState<ParsedFormUser[]>([]);
  const [isBatchCreating, setIsBatchCreating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; success: number; errors: number }>({ current: 0, total: 0, success: 0, errors: 0 });
  const [batchCompleted, setBatchCompleted] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [onboardingSubmissions, setOnboardingSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(false);
  const [copiedOnboardingSql, setCopiedOnboardingSql] = useState<boolean>(false);

  const fetchOnboardingSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const map = new Map<string, any>();

      // 1. Fetch from serverless API (aggregates database submissions)
      try {
        const authHeaders = await getAdminAuthHeaders();
        const res = await fetch('/api/onboarding/submissions', { headers: authHeaders });
        if (res.ok) {
          const apiData = await res.json().catch(() => ({}));
          if (Array.isArray(apiData.submissions)) {
            apiData.submissions.forEach((sub: any) => {
              if (!sub || typeof sub !== 'object') return;
              const k = String(sub.email || sub.username || sub.id || '').toLowerCase().trim();
              if (k) map.set(k, sub);
            });
          }
        }
      } catch (e) {}

      // 2. Direct Supabase query: public.onboarding_submissions
      try {
        const { data, error } = await supabase
          .from('onboarding_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error && Array.isArray(data)) {
          data.forEach(sub => {
            if (!sub || typeof sub !== 'object') return;
            const k = String(sub.email || sub.username || sub.id || '').toLowerCase().trim();
            if (k && !map.has(k)) map.set(k, sub);
          });
        }
      } catch (e) {}

      // 3. Direct Supabase query: public.email_campaigns (provider = 'onboarding_submission')
      try {
        const { data: campData } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('provider', 'onboarding_submission')
          .order('created_at', { ascending: false })
          .limit(50);
        if (Array.isArray(campData)) {
          campData.forEach(c => {
            const meta = c.metadata || {};
            const item = {
              id: c.id,
              full_name: meta.full_name || c.sender_name || 'Client',
              email: meta.email || c.sender_email,
              username: meta.username || c.resend_batch_id || 'client',
              headline: meta.headline || 'Executive Member',
              bio: meta.bio || '',
              phone_number: meta.phone_number || '',
              address: meta.address || 'Lagos, Nigeria',
              card_tier: meta.card_tier || 'pvc-black',
              avatar_url: meta.avatar_url || null,
              logo_url: meta.logo_url || null,
              socials: meta.socials || [],
              suggested_password: meta.suggested_password || 'ChipNg_2026!',
              status: c.status || 'pending_activation',
              created_at: c.created_at
            };
            const k = String(item.email || item.username || item.id || '').toLowerCase().trim();
            if (k && !map.has(k)) map.set(k, item);
          });
        }
      } catch (e) {}

      // 4. Local storage fallback
      try {
        const localSubs = JSON.parse(localStorage.getItem('chipng_onboarding_submissions') || '[]');
        if (Array.isArray(localSubs)) {
          localSubs.forEach(s => {
            if (!s || typeof s !== 'object') return;
            const k = String(s.email || s.username || s.id || '').toLowerCase().trim();
            if (k && !map.has(k)) map.set(k, s);
          });
        }
      } catch (e) {}

      setOnboardingSubmissions(Array.from(map.values()));
    } catch (e) {
      console.warn('Failed to fetch onboarding submissions:', e);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleInstantProvisionSubmission = async (sub: any) => {
    if (!sub.email || !sub.full_name) {
      toast.error('Email and full name are required to provision account.');
      return;
    }
    const cleanEmail = String(sub.email).trim().toLowerCase();
    const cleanUsername = sub.username ? String(sub.username).toLowerCase().replace(/[^a-z0-9_.-]/g, '') : cleanEmail.split('@')[0];
    const password = sub.suggested_password || 'ChipNg_2026!';

    toast.info(`Creating & saving 100% profile for @${cleanUsername}...`);
    try {
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: cleanEmail,
          password,
          full_name: sub.full_name,
          username: cleanUsername,
          headline: sub.headline || 'Executive Member',
          bio: sub.bio || '',
          phone_number: sub.phone_number || '',
          cover_image_url: sub.avatar_url || ''
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        toast.success(`User @${cleanUsername} successfully created and all info saved!`);
        const createdUserId = data.user?.id;
        if (createdUserId && Array.isArray(sub.socials) && sub.socials.length > 0) {
          try {
            const socialsToInsert = sub.socials.map((s: any) => ({
              profile_id: createdUserId,
              platform: s.platform || 'website',
              url: s.url || ''
            })).filter((s: any) => s.url);
            if (socialsToInsert.length > 0) {
              await supabase.from('social_links').insert(socialsToInsert);
            }
          } catch (_socErr) {}
        }
        try {
          await supabase.from('onboarding_submissions').update({ status: 'activated', updated_at: new Date().toISOString() }).eq('email', cleanEmail);
        } catch (_e) {}
        fetchData();
        fetchOnboardingSubmissions();
      } else {
        toast.error(data.error || 'Failed to provision user. Opening editor...');
        setNewUserForm({
          email: cleanEmail,
          password,
          full_name: sub.full_name || '',
          username: cleanUsername,
          headline: sub.headline || 'Executive Member',
          bio: sub.bio || '',
          phone_number: sub.phone_number || '',
          cover_image_url: sub.avatar_url || '',
          number_of_accounts: 1
        });
        setCreatingUser(true);
        setShowGoogleFormModal(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error provisioning user account.');
    }
  };

  // Direct Inquiries & Support Feedback state
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [unreadInquiriesCount, setUnreadInquiriesCount] = useState<number>(0);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, bucket: string = 'covers') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);
    try {
      // 1. Read file as base64 Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

      // 2. Upload via reliable /api/upload
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, filename: file.name })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.url) {
            setter(json.url);
            return;
          }
        }
      } catch (e) {}

      // 3. Fallback to Supabase if session exists
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (!uploadError) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        setter(data.publicUrl);
        return;
      }

      // 4. Fallback to Data URL
      setter(dataUrl);
    } catch (error: any) {
      console.warn("Upload fallback error:", error);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    checkAdmin();

    // Listen to real-time broadcast and events from direct inquiries & contact form
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('chipng_inquiries_channel');
        bc.onmessage = () => {
          fetchData();
        };
      }
    } catch (e) {}

    const handleInquiryEvent = () => fetchData();
    window.addEventListener('chipng_new_inquiry', handleInquiryEvent);

    return () => {
      if (bc) try { bc.close(); } catch (e) {}
      window.removeEventListener('chipng_new_inquiry', handleInquiryEvent);
    };
  }, []);

  const checkAdmin = async () => {
    let user: any = null;
    try {
      const { data: userData } = await supabase.auth.getUser();
      user = userData?.user;
    } catch (e) {}

    if (!user) {
      const { data: sessionData } = await supabase.auth.getSession();
      user = sessionData?.session?.user || null;
    }

    if (!user) {
      onNavigate('login');
      return;
    }
    setCurrentUserId(user.id);

    let { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    
    const userEmailLower = (user.email || '').toLowerCase().trim();
    const isSuperAdminEmail = SUPER_ADMIN_ALLOWLIST.includes(userEmailLower);

    // Auto-grant only if email matches strict super admin allowlist
    if (isSuperAdminEmail && !profile?.is_admin) {
      await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
      setIsAdmin(true);
    } else if (profile?.is_admin || isSuperAdminEmail) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    setLoading(false);
    if (profile?.is_admin || isSuperAdminEmail) {
      fetchData();
    }
  };

  const fetchData = async () => {
    const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: productsData } = await supabase.from('products').select('*').is('profile_id', null).order('created_at', { ascending: false });
    const { data: purchasesData } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
    const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    const { count: blogViewsCount } = await supabase.from('blog_views').select('*', { count: 'exact', head: true });
    
    try {
      const { data: entData } = await supabase.from('enterprises').select('id, name, brand_color');
      if (entData) setEnterprisesList(entData);
    } catch (e) {}
    
    if (usersData && purchasesData) {
      const updatedUsers = [...usersData];
      let needsRefresh = false;
      for (const u of updatedUsers) {
        if (u.is_verified) {
          const verifPurchases = purchasesData.filter(p => p && p.seller_id === u.id && p.purchase_type === 'verification' && typeof p.status === 'string' && p.status.startsWith('expires_'));
          if (verifPurchases.length > 0) {
            const latestVerif = verifPurchases[0];
            const parts = (latestVerif.status || '').split('_');
            if (parts.length > 1) {
              const expiresAt = parseInt(parts[1], 10);
              if (!isNaN(expiresAt) && Date.now() > expiresAt) {
                u.is_verified = false;
                await supabase.from('profiles').update({ is_verified: false }).eq('id', u.id);
                needsRefresh = true;
              }
            }
          }
        }
      }
      setUsers(updatedUsers);
    } else if (usersData) {
      setUsers(usersData);
    }
    
    if (productsData) setProducts(productsData);
    if (purchasesData) setPurchases(purchasesData);
    if (postsData) setPosts(postsData);
    if (blogViewsCount !== null) setBlogViews(blogViewsCount);

    // Fetch Super Admin User Credentials Vault (Lowest priority: profiles.raw_password -> Backend Vault -> Newest Supabase admin_user_credentials)
    try {
      const credMap: Record<string, string> = {};

      // 1. Baseline fallback from profiles.raw_password
      if (usersData && Array.isArray(usersData)) {
        for (const u of usersData) {
          if (u.raw_password) {
            const loginEmailKey = String(u.email || '').toLowerCase().trim();
            const contactEmailKey = String(u.contact_email || '').toLowerCase().trim();
            if (loginEmailKey) credMap[loginEmailKey] = u.raw_password;
            if (contactEmailKey) credMap[contactEmailKey] = u.raw_password;
            if (u.id) credMap[u.id] = u.raw_password;
          }
        }
      }

      // 2. Query backend credentials vault (SQLite + Supabase merge)
      try {
        const authHeaders = await getAdminAuthHeaders();
        const credRes = await fetch('/api/admin/user-credentials', { headers: authHeaders });
        if (credRes.ok) {
          const credData = await credRes.json();
          if (credData?.credentials) {
            Object.assign(credMap, credData.credentials);
          }
        }
      } catch (apiErr) {}

      // 3. Direct Supabase admin_user_credentials ordered ascending by updated_at (newest update wins)
      try {
        const { data: credRows } = await supabase
          .from('admin_user_credentials')
          .select('*')
          .order('updated_at', { ascending: true });
        if (credRows && Array.isArray(credRows)) {
          for (const row of credRows) {
            if (row.email && row.password) credMap[row.email.toLowerCase().trim()] = row.password;
            if (row.user_id && row.password) credMap[row.user_id] = row.password;
          }
        }
      } catch (spErr) {}

      setUserCredentials(credMap);
    } catch (e) {}

    // Fetch Direct Inquiries & Support Feedback
    try {
      let leadList: any[] = [];
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) leadList = data;
      }
      if (leadList.length === 0) {
        const { data: spLeads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (spLeads) {
          leadList = spLeads.map((l: any) => {
            let meta: any = {};
            if (l.city && typeof l.city === 'string' && l.city.startsWith('{')) {
              try { meta = JSON.parse(l.city); } catch (e) {}
            }
            return {
              ...l,
              email: l.email || meta.email || (l.whatsapp && l.whatsapp.includes('@') ? l.whatsapp : ''),
              company: l.company || meta.topic || '',
              message: l.message || meta.message || '',
              status: l.status || meta.status || 'new',
              source: l.source || meta.source || 'profile',
              city: meta.city || (typeof l.city === 'string' && !l.city.startsWith('{') ? l.city : 'Lagos')
            };
          });
        }
      }
      if (typeof window !== 'undefined') {
        const localCache = JSON.parse(localStorage.getItem('chipng_inquiries_cache') || '[]');
        if (Array.isArray(localCache) && localCache.length > 0) {
          const existingIds = new Set(leadList.map(l => l.id || `${l.name}_${l.email}`));
          for (const item of localCache) {
            const key = item.id || `${item.name}_${item.email}`;
            if (!existingIds.has(key)) {
              leadList.unshift(item);
              existingIds.add(key);
            }
          }
        }
      }
      const directOnly = leadList.filter(l => 
        l.source === 'direct_inquiry' || 
        l.source === 'contact_page' || 
        l.post_slug === 'contact_inquiry' || 
        (!!l.message && l.message.length > 5)
      );
      setInquiries(directOnly);
      setUnreadInquiriesCount(directOnly.filter(l => !l.status || l.status === 'new').length);
    } catch (e) {}

    // Fetch real app downloads count
    try {
      const dlRes = await fetch('/api/app/downloads');
      if (dlRes.ok) {
        const dlJson = await dlRes.json();
        if (typeof dlJson.totalDownloads === 'number') {
          setAppDownloadsTotal(dlJson.totalDownloads);
        }
      }
    } catch (e) {}

    // Auto-sync onboarding submissions
    try {
      fetchOnboardingSubmissions();
    } catch (e) {}
  };

  const toggleVerification = async (user: any) => {
    try {
      if (user.is_verified) {
        const { error } = await supabase.from('profiles').update({ is_verified: false }).eq('id', user.id);
        if (error) {
          toast.error("Error revoking: " + error.message);
        } else {
          toast.info(`Revoked verification for ${user.full_name || user.username || 'user'}`);
          fetchData();
        }
      } else {
        const months = 12;
        const expiresAt = Date.now() + months * 30 * 24 * 60 * 60 * 1000;
        
        const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
        if (error) {
          toast.error("Error verifying: " + error.message);
          return;
        }
        
        await supabase.from('purchases').insert([{
          seller_id: user.id,
          buyer_email: user.contact_email || user.email || user.username || 'admin_verified',
          amount: 0,
          platform_fee: 0,
          net_earnings: 0,
          reference: 'ADMIN_VERIF_' + Math.random().toString(36).substring(2, 9),
          status: 'expires_' + expiresAt,
          purchase_type: 'verification'
        }]);
        
        toast.success(`Verified ${user.full_name || user.username || 'user'} (12 Months VIP Badge Active)`);
        fetchData();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update verification status');
    }
  };

  const toggleAdmin = async (id: string, current: boolean) => {
    try {
      const { error, data } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', id).select('*');
      if (error) {
        toast.error("Error updating admin role: " + error.message);
      } else if (!data || data.length === 0) {
        toast.info("Action failed constraint checks in DB (RLS). Please verify admin credentials.");
      } else {
        toast.success(current ? "Revoked admin privileges" : "Granted Super Admin role successfully");
        fetchData();
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update admin role');
    }
  };

  const triggerEbookDownload = (bookId: string, title: string) => {
    const book = ebooksData.find(b => b.id === bookId);
    if (!book) return;

    const blob = new Blob([book.content], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}_ebook.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    setSavingUserProfile(true);

    try {
      const cleanUsername = userForm.username
        ? String(userForm.username).toLowerCase().replace(/[^a-z0-9_.-]/g, '')
        : null;

      // Clean profile payload: only include valid columns in public.profiles table
      const profilePayload: any = {
        full_name: userForm.full_name || '',
        username: cleanUsername,
        headline: userForm.headline || null,
        bio: userForm.bio || null,
        contact_email: userForm.contact_email || null,
        phone_number: userForm.phone_number || null,
        address: userForm.address || null,
        booking_provider: userForm.booking_provider || 'Calendly (Integrated)',
        calendar_link: userForm.calendar_link || null,
        show_availability: userForm.show_availability !== false,
        show_total_followers: !!userForm.show_total_followers,
        social_links_style: userForm.social_links_style || 'color-circle',
        is_verified: !!userForm.is_verified,
        is_admin: !!userForm.is_admin,
        theme: userForm.theme || 'default',
        bg_color: userForm.bg_color || '#000000',
        text_color: userForm.text_color || '#ffffff',
        use_gradient: !!userForm.use_gradient,
        enterprise_id: userForm.enterprise_id || null,
        cover_image_url: userForm.cover_image_url || null
      };

      let apiUpdated = false;
      let directUpdated = false;
      let lastErrorMessage = '';

      // 1. Dual Atomic Sync via authoritative /api/admin/profile/update-full (bypasses RLS)
      try {
        const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
        const fullRes = await fetch('/api/admin/profile/update-full', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            profile_id: editingUser.id,
            profile: { ...profilePayload, is_whatsapp: userForm.is_whatsapp },
            links: userLinks,
            social_links: userSocialLinks,
            products: userProducts
          })
        });
        if (fullRes.ok) {
          apiUpdated = true;
        } else {
          const errData = await fullRes.json().catch(() => ({}));
          lastErrorMessage = errData.error || fullRes.statusText;
          console.warn('Admin profile update-full notice:', errData);
        }
      } catch (syncErr: any) {
        lastErrorMessage = syncErr?.message || '';
        console.warn('Admin dual sync warning:', syncErr);
      }

      // 2. Direct Supabase Update (using clean verified schema columns)
      try {
        const { error: profErr } = await supabase.from('profiles').update(profilePayload).eq('id', editingUser.id);
        if (!profErr) {
          directUpdated = true;
        } else {
          lastErrorMessage = profErr.message;
        }
      } catch (err: any) {
        lastErrorMessage = err?.message || lastErrorMessage;
        console.warn('Direct supabase update note:', err);
      }

      // 3. Featured Links Update
      try {
        await supabase.from('links').delete().eq('profile_id', editingUser.id);
        if (Array.isArray(userLinks) && userLinks.length > 0) {
          await supabase.from('links').insert(userLinks.map(({ id, created_at, ...l }: any, idx: number) => ({
            ...l,
            profile_id: editingUser.id,
            position: idx
          })));
        }
      } catch (err) {}

      // 4. Social Links Update
      try {
        await supabase.from('social_links').delete().eq('profile_id', editingUser.id);
        if (Array.isArray(userSocialLinks) && userSocialLinks.length > 0) {
          await supabase.from('social_links').insert(userSocialLinks.map(({ id, created_at, ...s }: any) => ({
            ...s,
            profile_id: editingUser.id
          })));
        }
      } catch (err) {}

      // 5. Products Update
      try {
        if (Array.isArray(userProducts)) {
          const existingProducts = await supabase.from('products').select('id').eq('profile_id', editingUser.id);
          const incomingIds = userProducts.map(p => p.id).filter(id => id && !String(id).startsWith('new_'));
          const toDelete = (existingProducts.data || []).filter((p: any) => !incomingIds.includes(p.id)).map((p: any) => p.id);
          if (toDelete.length > 0) {
            await supabase.from('products').delete().in('id', toDelete);
          }
          for (const p of userProducts) {
            const { created_at, ...prodData } = p;
            if (prodData.id && String(prodData.id).startsWith('new_')) {
              delete prodData.id;
            }
            await supabase.from('products').upsert({ ...prodData, profile_id: editingUser.id });
          }
        }
      } catch (err) {}

      if (!apiUpdated && !directUpdated) {
        toast.error('Failed to update user profile: ' + (lastErrorMessage || 'Permission or network error.'));
        return;
      }

      toast.success(`100% Profile Setup completed for @${cleanUsername || editingUser.username || 'user'}!`);
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      console.error('Error in handleSaveUser:', error);
      toast.error('Error updating user profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSavingUserProfile(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUserLoading(true);
    try {
      const count = Math.max(1, Math.min(100, Number(newUserForm.number_of_accounts) || 1));
      const baseEmail = newUserForm.email.trim();
      const [localPart, domainPart] = baseEmail.includes('@') ? baseEmail.split('@') : [baseEmail, ''];

      let successCount = 0;
      let lastErrorMessage = '';

      for (let i = 0; i < count; i++) {
        const currentEmail = count === 1 ? baseEmail : `${localPart}+${i+1}@${domainPart}`;
        const currentFullName = count === 1 ? newUserForm.full_name : `${newUserForm.full_name} ${i+1}`;
        const currentUsername = count === 1 ? newUserForm.username : (newUserForm.username ? `${newUserForm.username}${i+1}` : '');

        // 1. Try server provision endpoint first
        let createdSuccessfully = false;
        try {
          const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
          const res = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              email: currentEmail,
              password: newUserForm.password,
              full_name: currentFullName,
              username: currentUsername || undefined,
              headline: newUserForm.headline || undefined,
              bio: newUserForm.bio || undefined,
              phone_number: newUserForm.phone_number || undefined,
              cover_image_url: newUserForm.cover_image_url || undefined
            })
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success) {
            createdSuccessfully = true;
            successCount++;
          } else {
            lastErrorMessage = data.error || data.message || `Failed to create ${currentEmail}`;
          }
        } catch (netErr: any) {
          lastErrorMessage = netErr.message || 'Network error';
        }

        // 2. Client-side fallback if server was unreachable
        if (!createdSuccessfully && !lastErrorMessage.toLowerCase().includes('already taken')) {
          try {
            const { data, error } = await adminAuthClient.auth.signUp({
              email: currentEmail,
              password: newUserForm.password,
              options: {
                data: {
                  full_name: currentFullName
                }
              }
            });

            if (!error && data?.user) {
              const payload: any = {
                full_name: currentFullName,
                headline: newUserForm.headline || null,
                bio: newUserForm.bio || null,
                contact_email: currentEmail,
                email: currentEmail,
                phone_number: newUserForm.phone_number || null,
                cover_image_url: newUserForm.cover_image_url || null,
                is_verified: true
              };
              if (currentUsername) {
                payload.username = currentUsername;
              }

              await supabase.from('profiles').upsert({
                id: data.user.id,
                raw_password: newUserForm.password,
                ...payload
              });

              try {
                await supabase.from('admin_user_credentials').upsert({
                  user_id: data.user.id,
                  email: currentEmail.toLowerCase().trim(),
                  password: newUserForm.password,
                  updated_at: new Date().toISOString()
                }, { onConflict: 'email' });
              } catch (_upsertErr) {}

              try {
                await adminAuthClient.auth.signOut();
              } catch (_signOutErr) {}
              successCount++;
              createdSuccessfully = true;
            } else if (error) {
              lastErrorMessage = error.message;
            }
          } catch (e: any) {
            lastErrorMessage = e.message;
          }
        }

        if (!createdSuccessfully && count > 1) {
          break;
        }
      }

      if (successCount > 0) {
        // Record in state credentials immediately
        setUserCredentials(prev => {
          const updated = { ...prev };
          const baseEmail = newUserForm.email.trim().toLowerCase();
          const [localPart, domainPart] = baseEmail.includes('@') ? baseEmail.split('@') : [baseEmail, ''];
          for (let i = 0; i < count; i++) {
            const currentEmail = count === 1 ? baseEmail : `${localPart}+${i+1}@${domainPart}`;
            updated[currentEmail] = newUserForm.password;
          }
          return updated;
        });
        toast.success(count > 1 ? `Successfully created ${successCount} accounts!` : 'User account created successfully!');
        setCreatingUser(false);
        setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
        fetchData();
      } else {
        toast.error(`Unable to create account: ${lastErrorMessage || 'Please verify email and password.'}`);
      }
    } catch (err: any) {
      console.error('handleCreateUser error:', err);
      toast.error(err.message || 'Failed to create user account.');
    } finally {
      setCreatingUserLoading(false);
    }
  };

  const getUserStoredPassword = (u: any): string => {
    if (!u) return '';
    const loginEmailKey = String(u?.email || '').toLowerCase().trim();
    const contactEmailKey = String(u?.contact_email || '').toLowerCase().trim();
    const creds = (userCredentials && typeof userCredentials === 'object') ? userCredentials : {};
    return (
      (u?.id ? creds[u.id] : undefined) ||
      (loginEmailKey ? creds[loginEmailKey] : undefined) ||
      (contactEmailKey ? creds[contactEmailKey] : undefined) ||
      u?.raw_password ||
      ''
    );
  };

  const openManagePasswordModal = (u: any) => {
    const existingPass = getUserStoredPassword(u);
    setPasswordModalError('');
    setShowModalPassword(true);
    setSettingPasswordUser(u);
    setNewPasswordInput(existingPass);
  };

  const handleSaveUserPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settingPasswordUser) return;

    const cleanPassword = newPasswordInput.trim();
    if (!cleanPassword) {
      setPasswordModalError('Please enter a new password.');
      return;
    }
    if (cleanPassword.length < 6) {
      const minErr = 'Password must be at least 6 characters for Supabase Authentication.';
      setPasswordModalError(minErr);
      toast.error(minErr);
      return;
    }

    setSavingPasswordLoading(true);
    setPasswordModalError('');
    const targetUserId = settingPasswordUser.id;
    const loginEmail = (settingPasswordUser.email || settingPasswordUser.contact_email || '').toLowerCase().trim();
    const contactEmail = (settingPasswordUser.contact_email || '').toLowerCase().trim();

    try {
      let authUpdated = false;
      let vaultUpdated = false;
      let resolvedAuthId: string = targetUserId;
      let resolvedEmail: string = loginEmail;
      let errorMsg = '';

      // 1. Call Supabase Stored Procedure (updates Supabase Auth encrypted_password + email_confirmed_at + profiles + admin_user_credentials)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('admin_set_user_password', {
          target_user_id: targetUserId,
          new_plain_password: cleanPassword
        });
        if (!rpcError && (rpcData?.success || rpcData === true)) {
          authUpdated = true;
          vaultUpdated = true;
          if (rpcData?.user_id) resolvedAuthId = String(rpcData.user_id).trim();
          if (rpcData?.email) resolvedEmail = String(rpcData.email).toLowerCase().trim();
        } else if (rpcError) {
          const rawRpcMsg = String(rpcError.message || '');
          if (rpcError.code === '23503' || rawRpcMsg.includes('admin_user_credentials_user_id_fkey')) {
            errorMsg = 'This profile does not have a matching Supabase Auth user account yet.';
          } else {
            errorMsg = rawRpcMsg;
          }
        }
      } catch (rpcErr: any) {
        errorMsg = rpcErr?.message || 'Supabase password update failed.';
      }

      // 2. Backend Proxy Sync (updates Auth via Service Role / RPC if Step 1 failed and persists vault in SQLite + Supabase)
      try {
        const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
        const res = await fetch('/api/admin/set-user-password', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: resolvedAuthId || targetUserId,
            profile_id: targetUserId,
            email: resolvedEmail || loginEmail,
            password: cleanPassword,
            skip_auth_rpc: authUpdated
          })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          if (data.authUpdated) authUpdated = true;
          if (data.vaultUpdated !== false) vaultUpdated = true;
          if (data.user_id) resolvedAuthId = String(data.user_id).trim();
          if (data.email) resolvedEmail = String(data.email).toLowerCase().trim();
        } else if (!authUpdated && data?.error) {
          errorMsg = data.error;
        }
      } catch (_backendErr) {}

      // 3. Ensure Supabase vault & profiles.raw_password are synced cleanly using resolved auth user/email
      if (authUpdated) {
        try {
          const vaultEmailKey = resolvedEmail || loginEmail || contactEmail;
          if (vaultEmailKey) {
            const { error: credErr } = await supabase.from('admin_user_credentials').upsert({
              user_id: resolvedAuthId || targetUserId,
              email: vaultEmailKey,
              password: cleanPassword,
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' });
            if (!credErr) vaultUpdated = true;
          }

          const profileUpdate: Record<string, any> = {
            raw_password: cleanPassword,
            updated_at: new Date().toISOString()
          };
          if (!settingPasswordUser.email && resolvedEmail) {
            profileUpdate.email = resolvedEmail;
          }
          if (!settingPasswordUser.contact_email && resolvedEmail) {
            profileUpdate.contact_email = resolvedEmail;
          }
          await supabase.from('profiles').update(profileUpdate).eq('id', targetUserId);
        } catch (_syncErr) {}
      }

      if (authUpdated) {
        setUserCredentials(prev => {
          const updated = { ...prev, [targetUserId]: cleanPassword };
          if (resolvedAuthId) updated[resolvedAuthId] = cleanPassword;
          if (resolvedEmail) updated[resolvedEmail] = cleanPassword;
          if (loginEmail) updated[loginEmail] = cleanPassword;
          if (contactEmail) updated[contactEmail] = cleanPassword;
          return updated;
        });
        setUsers(prev => prev.map(u => u.id === targetUserId ? {
          ...u,
          raw_password: cleanPassword,
          email: u.email || resolvedEmail || u.email,
          contact_email: u.contact_email || resolvedEmail || u.contact_email
        } : u));
        toast.success(`Password updated for ${settingPasswordUser.full_name || settingPasswordUser.username || resolvedEmail || loginEmail}! User can log in immediately.`);
        setSettingPasswordUser(null);
        setNewPasswordInput('');
        setPasswordModalError('');
      } else {
        const finalErr = errorMsg || 'Failed to update Supabase Authentication password. Verify the user has an Auth account and your SQL RPC is active.';
        setPasswordModalError(finalErr);
        toast.error(finalErr);
      }
    } catch (err: any) {
      const msg = err?.message || 'Error updating password.';
      setPasswordModalError(msg);
      toast.error(msg);
    } finally {
      setSavingPasswordLoading(false);
    }
  };

  // Google Form parsing and profile batch generation
  const handleParseGoogleForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleFormUrl.trim() && !googleFormContent.trim()) {
      toast.error('Please enter a Google Form / Sheet URL or paste your submission rows.');
      return;
    }

    setIsParsingGoogleForm(true);
    try {
      // 1. If raw content is pasted, parse immediately client-side
      if (googleFormContent.trim()) {
        const rows = parseCsvText(googleFormContent.trim());
        if (rows.length >= 2) {
          const profiles = mapCsvRowsToProfiles(rows);
          if (profiles.length > 0) {
            setParsedProfiles(profiles);
            setBatchCompleted(false);
            setBatchResults([]);
            toast.success(`Successfully parsed ${profiles.length} profiles from submissions!`);
            setIsParsingGoogleForm(false);
            return;
          }
        }
      }

      // 2. Call backend proxy endpoint
      const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/admin/parse-google-form', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: googleFormUrl.trim(),
          content: googleFormContent.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && Array.isArray(data.users) && data.users.length > 0) {
        setParsedProfiles(data.users);
        setBatchCompleted(false);
        setBatchResults([]);
        toast.success(`Successfully parsed ${data.users.length} profiles from Google Form submissions!`);
      } else {
        toast.error(data.error || 'Could not parse Google Form submissions. Check that the Sheet link is accessible or paste CSV rows.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error processing Google Form submissions.');
    } finally {
      setIsParsingGoogleForm(false);
    }
  };

  const handleToggleSelectProfile = (index: number) => {
    setParsedProfiles(prev => prev.map((p, i) => i === index ? { ...p, selected: !p.selected } : p));
  };

  const handleSelectAllProfiles = (selectAll: boolean) => {
    setParsedProfiles(prev => prev.map(p => ({ ...p, selected: selectAll })));
  };

  const handleBatchCreateGoogleProfiles = async () => {
    const selected = parsedProfiles.filter(p => p.selected !== false);
    if (selected.length === 0) {
      toast.error('Please select at least one profile to create.');
      return;
    }

    setIsBatchCreating(true);
    setBatchProgress({ current: 0, total: selected.length, success: 0, errors: 0 });
    const results: any[] = [];

    try {
      // 1. Try batch backend API first
      try {
        const headers = await getAdminAuthHeaders({ 'Content-Type': 'application/json' });
        const res = await fetch('/api/admin/batch-create-profiles', {
          method: 'POST',
          headers,
          body: JSON.stringify({ users: selected })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.results)) {
            setBatchResults(data.results);
            setBatchCompleted(true);
            setBatchProgress({
              current: selected.length,
              total: selected.length,
              success: data.createdCount || selected.length,
              errors: (data.results || []).filter((r: any) => !r.success).length
            });
            toast.success(`Batch complete: Created ${data.createdCount} accounts!`);
            fetchData();
            setIsBatchCreating(false);
            return;
          }
        }
      } catch (backendErr) {}

      // 2. Client-side sequential creation fallback
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        setBatchProgress({ current: i + 1, total: selected.length, success: successCount, errors: errorCount });

        try {
          const cleanEmail = item.email.trim().toLowerCase();
          const cleanPass = item.password || 'Chip2026!secure';

          // Create auth user
          let userId: string | null = null;
          const { data: authData, error: authErr } = await adminAuthClient.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: { data: { full_name: item.full_name } }
          });

          if (authData?.user) {
            userId = authData.user.id;
          } else if (authErr) {
            const { data: prof } = await supabase.from('profiles').select('id').eq('contact_email', cleanEmail).maybeSingle();
            userId = prof?.id || null;
          }

          if (userId) {
            await supabase.from('profiles').upsert({
              id: userId,
              full_name: item.full_name,
              username: item.username,
              headline: item.headline || null,
              bio: item.bio || null,
              contact_email: cleanEmail,
              phone_number: item.phone_number || null,
              address: item.address || null,
              calendar_link: item.calendar_link || null,
              cover_image_url: item.cover_image_url || null,
              theme: item.theme || 'default',
              is_verified: true,
              raw_password: cleanPass,
              updated_at: new Date().toISOString()
            });

            await supabase.from('admin_user_credentials').upsert({
              user_id: userId,
              email: cleanEmail,
              password: cleanPass,
              updated_at: new Date().toISOString()
            }, { onConflict: 'email' });

            if (item.socials && Array.isArray(item.socials)) {
              for (const s of item.socials) {
                if (s.platform && s.url) {
                  try {
                    await supabase.from('social_links').upsert({
                      profile_id: userId,
                      platform: s.platform,
                      url: s.url
                    });
                  } catch (_socialErr) {}
                }
              }
            }

            successCount++;
            results.push({
              email: cleanEmail,
              username: item.username,
              full_name: item.full_name,
              password: cleanPass,
              success: true,
              profileUrl: `https://chipng.com/@${item.username}`
            });
          } else {
            errorCount++;
            results.push({ email: cleanEmail, success: false, error: 'Could not resolve user ID' });
          }
        } catch (itemErr: any) {
          errorCount++;
          results.push({ email: item.email, success: false, error: itemErr.message });
        }
      }

      setBatchResults(results);
      setBatchCompleted(true);
      setBatchProgress({ current: selected.length, total: selected.length, success: successCount, errors: errorCount });
      toast.success(`Batch complete: Created ${successCount} accounts!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error executing batch creation.');
    } finally {
      setIsBatchCreating(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(prodForm.price.toString().replace(/,/g, ''));
    if (!prodForm.name.trim() || isNaN(numericPrice) || numericPrice < 0) {
      toast.error('Please enter a valid product name and numeric price.');
      return;
    }

    const payload = {
      profile_id: null,
      name: prodForm.name.trim(),
      description: prodForm.description,
      price: numericPrice,
      image_url: JSON.stringify(prodForm.media_urls)
    };

    try {
      const { error } = editingProduct
        ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
        : await supabase.from('products').insert([payload]);

      if (error) {
        toast.error('Failed to save product: ' + error.message);
        return;
      }

      toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      setEditingProduct(null);
      setProdForm({ name: '', description: '', price: '', media_urls: [] });
      fetchData();
    } catch (err: any) {
      toast.error('Failed to save product: ' + (err?.message || 'Unknown error'));
    }
  };

  const deleteProduct = (id: string) => {
    setConfirmModal({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this hardware product from the catalog?',
      confirmLabel: 'Delete Product',
      onConfirm: async () => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          toast.error('Error deleting product: ' + error.message);
        } else {
          toast.success('Product deleted.');
          fetchData();
        }
      },
    });
  };

  const handleSavePost = async (e: React.FormEvent, forcePublish?: boolean) => {
    e.preventDefault();
    const isPublished = forcePublish !== undefined ? forcePublish : postForm.is_published;
    
    let parsedKeywords: string[] = [];
    if (postForm.keywords) {
      if (typeof postForm.keywords === 'string') {
        parsedKeywords = postForm.keywords.split(',').map(k => k.trim());
      } else if (Array.isArray(postForm.keywords)) {
        parsedKeywords = postForm.keywords;
      }
    }

    const payload = {
      title: postForm.title,
      slug: postForm.slug || postForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      content: postForm.content,
      excerpt: postForm.excerpt,
      cover_image_url: postForm.cover_image_url,
      meta_title: postForm.meta_title,
      meta_description: postForm.meta_description,
      keywords: parsedKeywords,
      is_published: isPublished,
      published_at: isPublished && (!editingPost || !editingPost.published_at) ? new Date().toISOString() : (editingPost?.published_at || null)
    };

    try {
      if (editingPost) {
        const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert([payload]);
        if (error) throw error;
      }
      
      setEditingPost(null);
      setCreatingPost(false);
      setPostForm({ title: '', slug: '', content: '', excerpt: '', cover_image_url: '', meta_title: '', meta_description: '', keywords: '', is_published: false });
      toast.success(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
      fetchData();
    } catch (err: any) {
      toast.error("Error saving post: " + err.message);
    }
  };

  const deletePost = (id: string) => {
    setConfirmModal({
      title: 'Delete Blog Post',
      message: 'Are you sure you want to permanently delete this article?',
      confirmLabel: 'Delete Post',
      onConfirm: async () => {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) {
          toast.error('Error deleting post: ' + error.message);
        } else {
          toast.success('Post deleted.');
          fetchData();
        }
      },
    });
  };

  const togglePostPublished = async (post: any) => {
    const payload = { 
      is_published: !post.is_published,
      published_at: !post.is_published && !post.published_at ? new Date().toISOString() : post.published_at
    };
    const { error } = await supabase.from('posts').update(payload).eq('id', post.id);
    if (error) {
      toast.error('Error updating post status: ' + error.message);
    } else {
      fetchData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-black/40 dark:text-white/40 mb-6">You do not have permission to view the Super Admin Panel.</p>
        <button onClick={() => onNavigate('user-dashboard')} className="px-6 py-2.5 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-2xl font-mono text-[13px] font-bold transition-opacity cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    if (userFilter === 'admin' && !u.is_admin) return false;
    if (userFilter === 'verified' && !u.is_verified) return false;
    if (userFilter === 'unverified' && u.is_verified) return false;

    const q = (search || '').toLowerCase().trim();
    if (!q) return true;
    return (
      String(u.full_name || '').toLowerCase().includes(q) || 
      String(u.username || '').toLowerCase().includes(q) ||
      String(u.contact_email || '').toLowerCase().includes(q) ||
      String(u.email || '').toLowerCase().includes(q) ||
      String(u.phone_number || '').toLowerCase().includes(q) ||
      String(u.headline || '').toLowerCase().includes(q) ||
      String(u.id || '').toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u && u.is_verified).length;
  
  const digitalProductPurchases = purchases.filter(p => p && (p.purchase_type === 'digital_product' || !p.purchase_type));
  const themePurchases = purchases.filter(p => p && p.purchase_type === 'theme');
  const verificationPurchases = purchases.filter(p => p && p.purchase_type === 'verification');
  
  const totalShopRevenue = digitalProductPurchases.reduce((sum, p) => sum + Number(p?.amount || 0), 0);
  const digitalProductFees = digitalProductPurchases.reduce((sum, p) => sum + Number(p?.platform_fee || (Number(p?.amount || 0) * 0.05) || 0), 0);
  const themeSalesRevenue = themePurchases.reduce((sum, p) => sum + Number(p?.amount || 0), 0);
  const verificationEarnings = verificationPurchases.reduce((sum, p) => sum + Number(p?.platform_fee || p?.amount || 0), 0);
  
  const totalPlatformFees = digitalProductFees + themeSalesRevenue + verificationEarnings;
  const proPlanUsers = users.filter(u => u && (u.is_pro || u.enterprise_id)).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#16a34a] selection:text-neutral-950 font-sans transition-colors pb-24">
      {/* Top Navbar matching homepage MakroNavbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAFAFA]/85 dark:bg-[#0A0B0E]/85 border-b border-neutral-200/80 dark:border-white/10 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center group focus:outline-none cursor-pointer"
              aria-label="CHIPNG Home"
            >
              <BrandLogo size="md" />
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-3 h-3" /> Super Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('user-dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#161922] transition-all shadow-xs cursor-pointer"
            >
              <span>Personal Console</span>
            </button>

            <button
              onClick={() => onNavigate('landing')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-[#111318] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#161922] transition-all shadow-xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* Sign Out */}
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                onNavigate('landing');
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-8">
        {/* Header Title Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span> Command Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
            Super Admin Control Center
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-1">
            Manage link-in-bio members, NFC hardware store inventory, conversion pixels, and system leads.
          </p>
        </div>

        {/* Modern Nav Bar - Pill Strip matching homepage */}
        <div className="mb-8 overflow-x-auto scrollbar-hide py-1">
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-200/60 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 gap-1.5">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart2 },
              { id: 'downloads', label: 'App Downloads', icon: Smartphone },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'comms', label: 'Contact Extractor & Outreach', icon: MessageSquare },
              { id: 'products', label: 'Shop', icon: Package },
              { id: 'blog', label: 'Blog', icon: FileText },
              { id: 'leads', label: 'Inquiries & Leads', icon: MessageCircle },
              { id: 'buybox', label: 'Buy Box', icon: Package },
              { id: 'seo', label: 'SEO', icon: Search },
              { id: 'sales', label: 'NFC Sales', icon: DollarSign },
              { id: 'broadcast', label: 'Broadcast', icon: Send },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'pixel', label: 'Pixels & Tracking', icon: Activity },
              { id: 'portfolio', label: 'Portfolio CMS', icon: Briefcase },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#16a34a] dark:text-neutral-950' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'leads' && unreadInquiriesCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black animate-pulse shadow-xs">
                      {unreadInquiriesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'analytics' && (
          <div className="space-y-8 mb-8">
            {/* 6 High-Impact Operational KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Members</span>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Total Users</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{totalUsers}</p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                    <CheckCircle className="w-3 h-3" /> {verifiedUsers} Verified
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Store</span>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Shop Sales</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">₦{totalShopRevenue.toLocaleString()}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    {digitalProductPurchases.length} digital orders
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Earnings</span>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Platform Revenue</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">₦{totalPlatformFees.toLocaleString()}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    Take fees + themes
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Reach</span>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Blog Views</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{blogViews}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                    {posts.length} articles
                  </p>
                </div>
              </div>

              {/* KPI 5: App Downloads */}
              <div 
                onClick={() => setActiveTab('downloads')}
                className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-[#16a34a] dark:hover:border-[#16a34a]/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Live Telemetry</span>
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">App Installs</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{appDownloadsTotal.toLocaleString()}</p>
                  <div className="text-[11px] text-[#16a34a] dark:text-[#16a34a] mt-2 flex items-center justify-between font-bold">
                    <span>Android & iOS</span>
                    <span>Radar →</span>
                  </div>
                </div>
              </div>

              {/* KPI 6: Direct Inquiries & Support Feedback */}
              <div 
                onClick={() => setActiveTab('leads')}
                className="bg-white dark:bg-[#111318] p-5 sm:p-6 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-emerald-500/60 dark:hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </div>
                  {unreadInquiriesCount > 0 ? (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse">
                      {unreadInquiriesCount} New
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-neutral-400 uppercase">Live Inbox</span>
                  )}
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Direct Inquiries</h3>
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                    {inquiries.length}
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center justify-between font-bold">
                    <span>Support Feedback</span>
                    <span>View Inbox →</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Inquiries & Support Feedback Stream on Super Admin Dashboard */}
            <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-neutral-100 dark:border-white/5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                      Direct Inquiries & Support Feedback
                    </h2>
                    {unreadInquiriesCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                        {unreadInquiriesCount} Action Needed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Real-time stream of inquiries, feedback, and enterprise deployment requests sent via chipng.com/contact.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('leads')}
                  className="px-4 py-2 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <span>Open Full Inquiries Pipeline</span>
                  <span>→</span>
                </button>
              </div>

              {inquiries.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs space-y-2">
                  <MessageCircle className="w-8 h-8 mx-auto opacity-40 text-neutral-400" />
                  <p className="font-semibold text-neutral-600 dark:text-neutral-300">No customer inquiries yet</p>
                  <p className="text-[11px] text-neutral-500">Messages sent via "Direct Inquiries and Support" on the contact page will appear here instantly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inquiries.slice(0, 6).map((item, idx) => {
                    const isNew = !item.status || item.status === 'new';
                    const isResolved = item.status === 'resolved';
                    const topic = item.company || 'Direct Inquiry';
                    const parsedDate = parseTimestamp(item.created_at);
                    const timeAgo = parsedDate ? parsedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently';

                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => setActiveTab('leads')}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                          isNew 
                            ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] border-emerald-500/30 hover:border-emerald-500/60 shadow-xs' 
                            : 'bg-neutral-50/60 dark:bg-[#141620] border-neutral-200/70 dark:border-white/5 hover:border-neutral-300 dark:hover:border-white/15'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-sm text-neutral-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {item.name || 'Anonymous User'}
                              </div>
                              <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                                {item.email || item.whatsapp || 'Direct Inquiries Form'}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              isNew 
                                ? 'bg-emerald-500 text-white' 
                                : isResolved 
                                ? 'bg-neutral-200 dark:bg-white/10 text-neutral-600 dark:text-neutral-400' 
                                : 'bg-blue-500 text-white'
                            }`}>
                              {isNew ? 'New' : isResolved ? 'Resolved' : 'In Review'}
                            </span>
                          </div>

                          <div className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                            {topic}
                          </div>

                          <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-3 leading-relaxed">
                            "{item.message || 'Customer requested contact via direct support.'}"
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-200/50 dark:border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                          <span>{timeAgo}</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                            Reply & Manage →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-[#111318] rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">User Directory</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Search, verify, and manage registered accounts across CHIPNG.</p>
              </div>
              <div className="flex gap-3 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Search name, email, @handle, phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-full text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#16a34a]/60 focus:border-[#16a34a] transition-all"
                  />
                </div>
                <button 
                  onClick={() => setActiveTab('comms')}
                  className="px-4 py-2 border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-xs cursor-pointer text-neutral-800 dark:text-neutral-200 whitespace-nowrap"
                  title="Open Contact Extractor & Outreach"
                >
                  <MessageSquare className="w-4 h-4 text-[#16a34a]" /> Direct Outreach
                </button>
                <button 
                  onClick={() => {
                    setShowGoogleFormModal(true);
                    setBatchCompleted(false);
                    setBatchResults([]);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  title="Automate user creation from Google Form or Sheet"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Import from Google Form
                </button>
                <button 
                  onClick={() => setCreatingUser(true)}
                  className="px-4 py-2 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </div>
            </div>

            {/* Quick Filter Badges for lookup */}
            <div className="flex flex-wrap items-center gap-2 mb-5 pb-3 border-b border-neutral-100 dark:border-white/5">
              <span className="text-xs font-semibold text-neutral-400 mr-1">Lookup:</span>
              <button
                type="button"
                onClick={() => setUserFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  userFilter === 'all'
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 hover:opacity-80'
                }`}
              >
                All Users ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('admin')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  userFilter === 'admin'
                    ? 'bg-[#16a34a] text-white shadow-xs'
                    : 'bg-[#16a34a]/15 text-[#16a34a] hover:bg-[#16a34a]/25'
                }`}
              >
                <Shield className="w-3 h-3" /> Super Admins ({users.filter(u => u.is_admin).length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('verified')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  userFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:opacity-80'
                }`}
              >
                <CheckCircle className="w-3 h-3" /> Verified ({users.filter(u => u.is_verified).length})
              </button>
              <button
                type="button"
                onClick={() => setUserFilter('unverified')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  userFilter === 'unverified'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:opacity-80'
                }`}
              >
                <AlertCircle className="w-3 h-3" /> Unverified ({users.filter(u => !u.is_verified).length})
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Handle</th>
                    <th className="py-3.5 px-4">Password</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {u.cover_image_url ? (
                            <img src={u.cover_image_url} alt="" className="w-9 h-9 rounded-full object-cover border border-neutral-200 dark:border-white/10" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-[#1C202B] text-neutral-700 dark:text-neutral-200 font-bold flex items-center justify-center text-xs">
                              {(u.full_name || 'U').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-neutral-950 dark:text-white text-sm">{u.full_name || 'No Name'}</div>
                            {(u.email || u.contact_email) ? (
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[190px]" title={u.email || u.contact_email}>
                                {u.email || u.contact_email}
                              </div>
                            ) : (
                              <div className="font-mono text-[11px] text-neutral-400 truncate max-w-[140px]" title={u.id}>{u.id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <a href={`/${u.username}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-neutral-900 dark:text-neutral-100 font-medium hover:text-[#16a34a] dark:hover:text-[#16a34a] transition-colors">
                          @{u.username || 'unknown'}
                        </a>
                      </td>
                      {/* Password Column (Super Admin Only) */}
                      <td className="py-3.5 px-4">
                        {(() => {
                          const pass = getUserStoredPassword(u);
                          const isRevealed = Boolean(u?.id && revealedPasswords && revealedPasswords[u.id]);

                          if (pass) {
                            return (
                              <div className="inline-flex items-center gap-1.5 bg-neutral-100 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 px-2.5 py-1 rounded-xl">
                                <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 select-all tracking-wide">
                                  {isRevealed ? pass : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                  className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                  title={isRevealed ? 'Hide Password' : 'Show Password'}
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (navigator?.clipboard?.writeText) {
                                      navigator.clipboard.writeText(pass);
                                      toast.success('Password copied to clipboard!');
                                    }
                                  }}
                                  className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                                  title="Copy Password"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openManagePasswordModal(u)}
                                  className="p-1 text-neutral-400 hover:text-[#16a34a] transition-colors cursor-pointer"
                                  title="Manage User Password"
                                >
                                  <Key className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-neutral-400 bg-neutral-100/60 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                ••••••••
                              </span>
                              <button
                                type="button"
                                onClick={() => openManagePasswordModal(u)}
                                className="px-2.5 py-1 rounded-lg bg-[#16a34a]/10 hover:bg-[#16a34a]/20 text-[#16a34a] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Set / Manage User Password"
                              >
                                <Key className="w-3 h-3" /> Set
                              </button>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 text-[11px] font-medium">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 text-[11px] font-bold uppercase tracking-wider">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-neutral-400 uppercase">User</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openManagePasswordModal(u)}
                            className="px-3 py-1.5 rounded-full border border-[#16a34a]/35 bg-[#16a34a]/10 hover:bg-[#16a34a]/20 text-[#16a34a] font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            title="Manage User Password"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Manage Password</span>
                          </button>
                          <button 
                            onClick={() => toggleVerification(u)}
                            className="px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                          >
                            {u.is_verified ? 'Revoke' : 'Verify'}
                          </button>
                          <button 
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className="px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
                            disabled={u.id === currentUserId}
                          >
                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserForm({
                                full_name: u.full_name || '',
                                username: u.username || '',
                                headline: u.headline || '',
                                bio: u.bio || '',
                                contact_email: u.contact_email || '',
                                phone_number: u.phone_number || '',
                                is_whatsapp: u.is_whatsapp !== false,
                                address: u.address || '',
                                booking_provider: u.booking_provider || 'Calendly (Integrated)',
                                calendar_link: u.calendar_link || '',
                                show_availability: u.show_availability !== false,
                                show_total_followers: !!u.show_total_followers,
                                social_links_style: u.social_links_style || 'color-circle',
                                is_verified: !!u.is_verified,
                                is_admin: !!u.is_admin,
                                theme: u.theme || 'default',
                                bg_color: u.bg_color || '#000000',
                                text_color: u.text_color || '#ffffff',
                                use_gradient: !!u.use_gradient,
                                enterprise_id: u.enterprise_id || '',
                                cover_image_url: u.cover_image_url || u.avatar_url || u.photo_url || ''
                              });
                              setAdminEditTab('identity');
                              setUserLinks([]);
                              setUserSocialLinks([]);
                              setUserProducts([]);

                              // Fetch all 3 sub-collections for 100% setup
                              supabase.from('links').select('*').eq('profile_id', u.id).order('position').then(({ data }) => {
                                if (data) setUserLinks(data);
                              });
                              supabase.from('social_links').select('*').eq('profile_id', u.id).then(({ data }) => {
                                if (data) setUserSocialLinks(data);
                              });
                              supabase.from('products').select('*').eq('profile_id', u.id).order('created_at', { ascending: false }).then(({ data }) => {
                                if (data) setUserProducts(data);
                              });
                            }}
                            className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer text-neutral-700 dark:text-neutral-300"
                            title="Edit 100% of User Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-neutral-400 text-sm">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 100% Profile Setup Modal for Admin */}
            {editingUser && (
              <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-7 w-full max-w-4xl shadow-2xl my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      {userForm.cover_image_url ? (
                        <img src={userForm.cover_image_url} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-200 dark:border-white/10" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#16a34a]/20 text-[#16a34a] font-black flex items-center justify-center text-base">
                          {(userForm.full_name || editingUser.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-neutral-950 dark:text-white">
                            {userForm.full_name || `@${editingUser.username}`}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16a34a] text-white">
                            100% Admin Control
                          </span>
                          {userForm.is_verified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 text-[10px] font-bold">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs text-neutral-400">@{userForm.username || editingUser.username}</span>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <a
                            href={`/${userForm.username || editingUser.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-[#16a34a] hover:underline flex items-center gap-1"
                          >
                            <span>Live Profile</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openManagePasswordModal(editingUser)}
                        className="px-3 py-1.5 rounded-full border border-[#16a34a]/35 bg-[#16a34a]/10 hover:bg-[#16a34a]/20 text-[#16a34a] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Manage Password</span>
                      </button>
                      <button 
                        onClick={() => setEditingUser(null)} 
                        className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Tab Navigation Strip */}
                  <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-neutral-100 dark:border-white/5 scrollbar-none">
                    {[
                      { id: 'identity', label: 'Identity & Bio', icon: Users },
                      { id: 'contact', label: 'Contact & WhatsApp', icon: Phone },
                      { id: 'scheduling', label: 'Appointments', icon: Calendar },
                      { id: 'links', label: `Links (${userLinks.length})`, icon: LinkIcon },
                      { id: 'socials', label: `Socials (${userSocialLinks.length})`, icon: Globe },
                      { id: 'store', label: `Store (${userProducts.length})`, icon: ShoppingBag },
                      { id: 'appearance', label: 'Theme & Style', icon: Palette },
                      { id: 'roles', label: 'Privileges', icon: Shield }
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = adminEditTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAdminEditTab(tab.id as any)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                              : 'bg-neutral-100/70 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-white/10'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Contents (Scrollable) */}
                  <div className="flex-1 overflow-y-auto py-4 px-1 pr-2 space-y-4 max-h-[60vh]">
                    
                    {/* TAB 1: IDENTITY & BIO */}
                    {adminEditTab === 'identity' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name *</label>
                            <input 
                              value={userForm.full_name || ''} 
                              onChange={e => setUserForm({...userForm, full_name: e.target.value})} 
                              placeholder="e.g. Victor Okoye"
                              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Username Handle *</label>
                            <div className="flex items-center px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl focus-within:border-[#16a34a] focus-within:ring-1 focus-within:ring-[#16a34a]">
                              <span className="text-xs text-neutral-400 mr-1 select-none font-mono">chipng.com/</span>
                              <input 
                                value={userForm.username || ''} 
                                onChange={e => setUserForm({...userForm, username: e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, '')})} 
                                placeholder="username"
                                className="w-full bg-transparent text-sm font-semibold text-neutral-950 dark:text-white outline-none" 
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Headline / Job Title</label>
                          <input 
                            value={userForm.headline || ''} 
                            onChange={e => setUserForm({...userForm, headline: e.target.value})} 
                            placeholder="e.g. Founder & Chief Executive Officer"
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" 
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Bio / About Me</label>
                          <textarea 
                            rows={3} 
                            value={userForm.bio || ''} 
                            onChange={e => setUserForm({...userForm, bio: e.target.value})} 
                            placeholder="Write a compelling biography for this profile..."
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] resize-none" 
                          />
                        </div>

                        {/* Cover Image Manager */}
                        <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Cover Image / Profile Banner</label>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-300 dark:border-white/10">
                              <img src={userForm.cover_image_url || 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=600'} alt="Cover" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 w-full space-y-2">
                              <input 
                                value={userForm.cover_image_url || ''} 
                                onChange={e => setUserForm({...userForm, cover_image_url: e.target.value})} 
                                placeholder="https://... cover image URL"
                                className="w-full px-3.5 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none" 
                              />
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                  <span>{uploadingImage ? 'Uploading...' : 'Upload Cover'}</span>
                                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, url => setUserForm({...userForm, cover_image_url: url}))} />
                                </label>
                                <button 
                                  type="button" 
                                  onClick={() => setUserForm({...userForm, cover_image_url: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=600'})}
                                  className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-white/10 text-neutral-600 dark:text-neutral-400 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                                >
                                  Reset Default
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: CONTACT & WHATSAPP */}
                    {adminEditTab === 'contact' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Contact Email</label>
                          <input 
                            type="email" 
                            value={userForm.contact_email || ''} 
                            onChange={e => setUserForm({...userForm, contact_email: e.target.value})} 
                            placeholder="user@example.com"
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" 
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Phone Number(s)</label>
                          <div className="space-y-2">
                            {(() => {
                              const val = userForm.phone_number || '';
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

                              return (
                                <>
                                  {arr.map((phone, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <div className="flex-1 min-w-0">
                                        <InternationalPhoneInput
                                          value={phone}
                                          onChange={(newPhone) => {
                                            const newArr = [...arr];
                                            newArr[idx] = newPhone;
                                            setUserForm({ ...userForm, phone_number: JSON.stringify(newArr) });
                                          }}
                                          placeholder="e.g. 800 000 0000 or 7911 123456"
                                        />
                                      </div>
                                      {arr.length > 1 && (
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const newArr = arr.filter((_, i) => i !== idx);
                                            setUserForm({ ...userForm, phone_number: JSON.stringify(newArr) });
                                          }}
                                          className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
                                          title="Remove phone number"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button
                                    type="button"
                                    onClick={() => setUserForm({ ...userForm, phone_number: JSON.stringify([...arr, '']) })}
                                    className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 text-[#16a34a]" /> Add Phone Number
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>

                        {/* WhatsApp Indicator Toggle */}
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                              <FaWhatsapp className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">WhatsApp Enabled Number</span>
                                {userForm.is_whatsapp ? (
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
                                Enables 1-tap WhatsApp direct chat on the user&apos;s public profile and marks WhatsApp in downloaded vCards.
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={userForm.is_whatsapp}
                              onChange={(e) => setUserForm({ ...userForm, is_whatsapp: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Office / City Address</label>
                          <input 
                            value={userForm.address || ''} 
                            onChange={e => setUserForm({...userForm, address: e.target.value})} 
                            placeholder="e.g. Victoria Island, Lagos, Nigeria"
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" 
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 3: SCHEDULING & APPOINTMENTS */}
                    {adminEditTab === 'scheduling' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
                          <div>
                            <span className="text-sm font-bold text-neutral-900 dark:text-white block">Show Availability on Public Bio</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">Displays a prominent booking button for instant appointments</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={userForm.show_availability}
                              onChange={(e) => setUserForm({ ...userForm, show_availability: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16a34a]"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Booking Provider</label>
                          <select
                            value={userForm.booking_provider || 'Calendly (Integrated)'}
                            onChange={e => setUserForm({...userForm, booking_provider: e.target.value})}
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none"
                          >
                            <option value="Calendly (Integrated)">Calendly (Integrated)</option>
                            <option value="Cal.com">Cal.com</option>
                            <option value="Google Meet">Google Meet</option>
                            <option value="Custom Meeting Link">Custom Meeting Link</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Calendar Booking URL</label>
                          <input 
                            value={userForm.calendar_link || ''} 
                            onChange={e => setUserForm({...userForm, calendar_link: e.target.value})} 
                            placeholder="https://calendly.com/your-calendar-link"
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" 
                          />
                        </div>
                      </div>
                    )}

                    {/* TAB 4: FEATURED LINKS (FULL CRUD) */}
                    {adminEditTab === 'links' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">Featured Profile Links</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Configure interactive links, banners, and tiles</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUserLinks([
                                ...userLinks,
                                { label: 'New Link', url: 'https://', size: 'Button', type: 'link', position: userLinks.length }
                              ]);
                            }}
                            className="px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Link
                          </button>
                        </div>

                        {userLinks.length === 0 ? (
                          <div className="p-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl">
                            No links configured for this profile yet. Click &quot;Add Link&quot; above to setup their first link.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userLinks.map((link, idx) => (
                              <div key={idx} className="p-3.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full">
                                  <input 
                                    value={link.label || ''} 
                                    onChange={e => {
                                      const updated = [...userLinks];
                                      updated[idx] = { ...updated[idx], label: e.target.value };
                                      setUserLinks(updated);
                                    }}
                                    placeholder="Link Label / Title"
                                    className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none"
                                  />
                                  <input 
                                    value={link.url || ''} 
                                    onChange={e => {
                                      const updated = [...userLinks];
                                      updated[idx] = { ...updated[idx], url: e.target.value };
                                      setUserLinks(updated);
                                    }}
                                    placeholder="https://..."
                                    className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                                  />
                                  <select
                                    value={link.size || 'Button'}
                                    onChange={e => {
                                      const updated = [...userLinks];
                                      updated[idx] = { ...updated[idx], size: e.target.value };
                                      setUserLinks(updated);
                                    }}
                                    className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                                  >
                                    <option value="Button">Button Bar</option>
                                    <option value="Small">Small Tile</option>
                                    <option value="Medium">Medium Banner</option>
                                    <option value="Big">Big Hero Card</option>
                                  </select>
                                </div>
                                <div className="flex items-center gap-1.5 self-end sm:self-center">
                                  {idx > 0 && (
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const updated = [...userLinks];
                                        const temp = updated[idx - 1];
                                        updated[idx - 1] = updated[idx];
                                        updated[idx] = temp;
                                        setUserLinks(updated);
                                      }}
                                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {idx < userLinks.length - 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const updated = [...userLinks];
                                        const temp = updated[idx + 1];
                                        updated[idx + 1] = updated[idx];
                                        updated[idx] = temp;
                                        setUserLinks(updated);
                                      }}
                                      className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button 
                                    type="button" 
                                    onClick={() => setUserLinks(userLinks.filter((_, i) => i !== idx))}
                                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Link"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 5: SOCIAL CHANNELS (FULL CRUD) */}
                    {adminEditTab === 'socials' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Social Icons Style</label>
                            <select
                              value={userForm.social_links_style || 'color-circle'}
                              onChange={e => setUserForm({...userForm, social_links_style: e.target.value})}
                              className="w-full px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                            >
                              <option value="color-circle">Color Circle Badges</option>
                              <option value="grayscale-circle">Grayscale Monochrome</option>
                              <option value="card">Social Card Boxes</option>
                              <option value="inline">Inline Minimalist</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between pt-4 sm:pt-0">
                            <div>
                              <span className="text-xs font-bold text-neutral-900 dark:text-white block">Show Total Followers Badge</span>
                              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Displays network count sum</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userForm.show_total_followers}
                                onChange={(e) => setUserForm({ ...userForm, show_total_followers: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16a34a]"></div>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <h4 className="text-sm font-bold text-neutral-950 dark:text-white">Social Media Channels</h4>
                          <button
                            type="button"
                            onClick={() => {
                              setUserSocialLinks([
                                ...userSocialLinks,
                                { platform: 'LinkedIn', url: 'https://', follower_count: 0 }
                              ]);
                            }}
                            className="px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Channel
                          </button>
                        </div>

                        {userSocialLinks.length === 0 ? (
                          <div className="p-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl">
                            No social networks added yet. Click &quot;Add Channel&quot; above.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userSocialLinks.map((s, idx) => {
                              // Auto-heal numeric index string if saved from previous bug
                              const currentPlatform = !isNaN(Number(s.platform)) && SOCIAL_PLATFORMS[Number(s.platform)]
                                ? SOCIAL_PLATFORMS[Number(s.platform)].name
                                : (s.platform || 'LinkedIn');

                              return (
                                <div key={idx} className="p-3 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-xs">
                                      <SocialMediaIconBadge platform={currentPlatform} style="color-circle" size="sm" />
                                    </div>
                                    <select
                                      value={currentPlatform}
                                      onChange={e => {
                                        const updated = [...userSocialLinks];
                                        updated[idx] = { ...updated[idx], platform: e.target.value };
                                        setUserSocialLinks(updated);
                                      }}
                                      className="flex-1 sm:w-44 px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none shrink-0"
                                    >
                                      {SOCIAL_PLATFORMS.map(p => (
                                        <option key={p.name} value={p.name}>{p.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <input 
                                    value={s.url || ''} 
                                    onChange={e => {
                                      const updated = [...userSocialLinks];
                                      updated[idx] = { ...updated[idx], url: e.target.value };
                                      setUserSocialLinks(updated);
                                    }}
                                    placeholder="Profile / Channel URL"
                                    className="flex-1 w-full px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                                  />
                                  <input 
                                    type="number"
                                    value={s.follower_count ?? ''} 
                                    onChange={e => {
                                      const updated = [...userSocialLinks];
                                      updated[idx] = { ...updated[idx], follower_count: parseInt(e.target.value) || 0 };
                                      setUserSocialLinks(updated);
                                    }}
                                    placeholder="Followers"
                                    className="w-full sm:w-28 px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => setUserSocialLinks(userSocialLinks.filter((_, i) => i !== idx))}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer self-end sm:self-center"
                                    title="Remove Channel"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 6: DIGITAL STORE & PRODUCTS */}
                    {adminEditTab === 'store' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-neutral-950 dark:text-white">User Digital Store & Catalog</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Products sold directly from this user&apos;s contactless profile</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUserProducts([
                                ...userProducts,
                                { id: `new_${Date.now()}`, name: 'New Product', price: 15000, description: '', image_url: '', file_url: '' }
                              ]);
                            }}
                            className="px-3.5 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Product
                          </button>
                        </div>

                        {userProducts.length === 0 ? (
                          <div className="p-8 text-center text-neutral-400 text-xs border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl">
                            No products in this user&apos;s digital store. Click &quot;Add Product&quot; to seed a catalog item.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userProducts.map((p, idx) => (
                              <div key={idx} className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                                    <input 
                                      value={p.name || ''} 
                                      onChange={e => {
                                        const updated = [...userProducts];
                                        updated[idx] = { ...updated[idx], name: e.target.value };
                                        setUserProducts(updated);
                                      }}
                                      placeholder="Product Name"
                                      className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-semibold text-neutral-950 dark:text-white outline-none"
                                    />
                                    <div className="flex items-center px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl">
                                      <span className="text-xs text-neutral-400 font-bold mr-1">₦</span>
                                      <input 
                                        type="number"
                                        value={p.price ?? ''} 
                                        onChange={e => {
                                          const updated = [...userProducts];
                                          updated[idx] = { ...updated[idx], price: parseFloat(e.target.value) || 0 };
                                          setUserProducts(updated);
                                        }}
                                        placeholder="Price in Naira"
                                        className="w-full bg-transparent text-xs font-bold text-neutral-950 dark:text-white outline-none"
                                      />
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => setUserProducts(userProducts.filter((_, i) => i !== idx))}
                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer shrink-0"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea 
                                  rows={2}
                                  value={p.description || ''} 
                                  onChange={e => {
                                    const updated = [...userProducts];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setUserProducts(updated);
                                  }}
                                  placeholder="Product description and details..."
                                  className="w-full px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none resize-none"
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <input 
                                    value={p.image_url || ''} 
                                    onChange={e => {
                                      const updated = [...userProducts];
                                      updated[idx] = { ...updated[idx], image_url: e.target.value };
                                      setUserProducts(updated);
                                    }}
                                    placeholder="Product Image URL"
                                    className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                                  />
                                  <input 
                                    value={p.file_url || ''} 
                                    onChange={e => {
                                      const updated = [...userProducts];
                                      updated[idx] = { ...updated[idx], file_url: e.target.value };
                                      setUserProducts(updated);
                                    }}
                                    placeholder="Digital Download File URL"
                                    className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 7: THEME & APPEARANCE */}
                    {adminEditTab === 'appearance' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Profile Layout</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {PROFILE_LAYOUTS.map(layout => {
                              const isSelected = (userForm.theme || 'default') === layout.id;
                              return (
                                <button
                                  key={layout.id}
                                  type="button"
                                  onClick={() => setUserForm({ ...userForm, theme: layout.id })}
                                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'border-[#16a34a] bg-[#16a34a]/10 ring-1 ring-[#16a34a]' 
                                      : 'border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#151821] hover:bg-neutral-100 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <div className="font-bold text-xs text-neutral-950 dark:text-white flex items-center justify-between">
                                    <span>{layout.name}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                                  </div>
                                  <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{layout.description}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Background Color & Presets */}
                        <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl space-y-3">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Background Color</label>
                          <div className="flex items-center gap-3">
                            <input 
                              type="color" 
                              value={userForm.bg_color || '#000000'} 
                              onChange={e => setUserForm({...userForm, bg_color: e.target.value})}
                              className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                            />
                            <input 
                              type="text" 
                              value={userForm.bg_color || '#000000'} 
                              onChange={e => setUserForm({...userForm, bg_color: e.target.value})}
                              placeholder="#000000"
                              className="px-3 py-2 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-neutral-950 dark:text-white outline-none w-32"
                            />
                            <div className="flex flex-wrap gap-1.5 flex-1">
                              {COLOR_PRESETS.map((color, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setUserForm({...userForm, bg_color: color})}
                                  style={{ backgroundColor: color }}
                                  className="w-6 h-6 rounded-full border border-black/20 dark:border-white/20 transition-transform hover:scale-110 cursor-pointer"
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Text Color & Gradient */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl space-y-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Text Color</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="color" 
                                value={userForm.text_color || '#ffffff'} 
                                onChange={e => setUserForm({...userForm, text_color: e.target.value})}
                                className="w-9 h-9 rounded-xl cursor-pointer border-0 p-0 bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={userForm.text_color || '#ffffff'} 
                                onChange={e => setUserForm({...userForm, text_color: e.target.value})}
                                className="px-3 py-1.5 bg-white dark:bg-[#1c202b] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-neutral-950 dark:text-white outline-none w-28"
                              />
                            </div>
                          </div>

                          <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-neutral-900 dark:text-white block">Use Gradient Glow</span>
                              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">Smooth atmospheric background</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={userForm.use_gradient}
                                onChange={(e) => setUserForm({ ...userForm, use_gradient: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16a34a]"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 8: ROLES, VERIFICATION, PASSWORD & ENTERPRISE */}
                    {adminEditTab === 'roles' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
                        {/* Manage User Password Card */}
                        <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#16a34a]/15 text-[#16a34a] flex items-center justify-center shrink-0">
                              <Key className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-neutral-900 dark:text-white block">Manage User Password</span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
                                {getUserStoredPassword(editingUser)
                                  ? 'Update or copy this user’s login password across Supabase Auth & Credentials Vault.'
                                  : 'Set a login password so this user can sign in immediately.'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => openManagePasswordModal(editingUser)}
                            className="px-4 py-2 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{getUserStoredPassword(editingUser) ? 'Change Password' : 'Set Password'}</span>
                          </button>
                        </div>

                        {/* Verified Toggle */}
                        <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-neutral-900 dark:text-white block">Official Blue Verification Badge</span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">Displays the authentic blue checkmark on profile and card touchpoints</span>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={userForm.is_verified}
                              onChange={(e) => setUserForm({ ...userForm, is_verified: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </div>

                        {/* Super Admin Privilege Toggle */}
                        <div className="p-4 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-2xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#16a34a]/15 text-[#16a34a] flex items-center justify-center shrink-0">
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-neutral-900 dark:text-white block">Super Admin Access</span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">Grants complete platform management and editorial permissions</span>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={userForm.is_admin}
                              disabled={editingUser.id === currentUserId}
                              onChange={(e) => setUserForm({ ...userForm, is_admin: e.target.checked })}
                              className="sr-only peer disabled:opacity-50"
                            />
                            <div className="w-11 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16a34a]"></div>
                          </label>
                        </div>

                        {/* Enterprise Assignment */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Enterprise Organization</label>
                          <select
                            value={userForm.enterprise_id || ''}
                            onChange={e => setUserForm({...userForm, enterprise_id: e.target.value})}
                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none"
                          >
                            <option value="">No Enterprise (Independent Account)</option>
                            {enterprisesList.map(ent => (
                              <option key={ent.id} value={ent.id}>{ent.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-white/5 mt-auto">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
                      <span className="font-semibold text-neutral-900 dark:text-white">Admin Guarantee:</span> Saves profile, links, socials, store & styles simultaneously.
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button 
                        type="button" 
                        onClick={() => setEditingUser(null)} 
                        className="px-5 py-2.5 rounded-full border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        disabled={savingUserProfile}
                        onClick={() => handleSaveUser()}
                        className="px-6 py-2.5 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 min-w-[170px]"
                      >
                        {savingUserProfile ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving 100% Profile...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Save 100% Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {creatingUser && (
              <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-neutral-950 dark:text-white">Create New User</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Provision fresh accounts on the network</p>
                    </div>
                    <button 
                      onClick={() => setCreatingUser(false)} 
                      className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Number of Accounts</label>
                      <input required type="number" min="1" max="100" value={newUserForm.number_of_accounts} onChange={e => setNewUserForm({...newUserForm, number_of_accounts: parseInt(e.target.value) || 1})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                      <p className="text-[11px] text-neutral-400 mt-1">If &gt;1, creates aliases like user+1@email.com</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Email *</label>
                      <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Password *</label>
                      <input required type="password" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name *</label>
                      <input required value={newUserForm.full_name} onChange={e => setNewUserForm({...newUserForm, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Username</label>
                        <input value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} placeholder="Optional handle" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
                          <span>Phone Number</span>
                          <span className="text-[10px] text-emerald-500 font-medium">All Countries</span>
                        </label>
                        <InternationalPhoneInput
                          value={newUserForm.phone_number}
                          onChange={phone => setNewUserForm({ ...newUserForm, phone_number: phone })}
                          placeholder="e.g. 800 000 0000 or 7911 123456"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Headline / Job Title</label>
                      <input value={newUserForm.headline} onChange={e => setNewUserForm({...newUserForm, headline: e.target.value})} placeholder="e.g. Founder & CEO | Tech Entrepreneur" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Bio / Description</label>
                      <textarea rows={2} value={newUserForm.bio} onChange={e => setNewUserForm({...newUserForm, bio: e.target.value})} placeholder="Brief executive bio or company summary..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] resize-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Profile Photo / Cover Image (Social Cards)</label>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-neutral-200 dark:border-white/10 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          {newUserForm.cover_image_url ? (
                            <img src={newUserForm.cover_image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Upload className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 flex gap-2">
                          <input 
                            value={newUserForm.cover_image_url} 
                            onChange={e => setNewUserForm({...newUserForm, cover_image_url: e.target.value})} 
                            placeholder="Image URL or upload..." 
                            className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a]" 
                          />
                          <label className="px-3 py-2 bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-neutral-700 dark:text-neutral-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, url => setNewUserForm(prev => ({ ...prev, cover_image_url: url })), 'covers')} />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-neutral-200/80 dark:border-white/10">
                      <button type="button" onClick={() => setCreatingUser(false)} className="px-5 py-2.5 rounded-full border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer">
                        Cancel
                      </button>
                      <button disabled={uploadingImage || creatingUserLoading} type="submit" className="px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2">
                        {creatingUserLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        <span>{creatingUserLoading ? 'Creating Account...' : (uploadingImage ? 'Uploading...' : 'Create Account')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Manage User Password Modal (Super Admin Only) */}
            {settingPasswordUser && (
              <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#16a34a]/15 text-[#16a34a] flex items-center justify-center">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-neutral-950 dark:text-white">
                          Manage User Password
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {settingPasswordUser.full_name || settingPasswordUser.username || settingPasswordUser.email || settingPasswordUser.contact_email}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setSettingPasswordUser(null);
                        setNewPasswordInput('');
                        setPasswordModalError('');
                      }} 
                      className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveUserPassword} className="space-y-4">
                    <div className="p-3 bg-neutral-50 dark:bg-[#151821] rounded-2xl border border-neutral-200/60 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                      <div className="flex justify-between gap-2">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Login Email:</span>
                        <span className="font-mono truncate">{settingPasswordUser.email || settingPasswordUser.contact_email || 'None'}</span>
                      </div>
                      {settingPasswordUser.contact_email && settingPasswordUser.email && settingPasswordUser.contact_email !== settingPasswordUser.email && (
                        <div className="flex justify-between gap-2">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Card Email:</span>
                          <span className="font-mono truncate">{settingPasswordUser.contact_email}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-2">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Handle:</span>
                        <span className="font-mono">@{settingPasswordUser.username || 'unknown'}</span>
                      </div>
                    </div>

                    {passwordModalError && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium leading-relaxed">
                        {passwordModalError}
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                          New Password * <span className="normal-case font-normal text-neutral-400">(min 6 chars)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%';
                            let gen = '';
                            for (let i = 0; i < 12; i++) {
                              gen += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            setNewPasswordInput(gen);
                            setPasswordModalError('');
                            toast.info('Generated new strong password');
                          }}
                          className="text-[11px] text-[#16a34a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" /> Auto-Generate
                        </button>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          required
                          minLength={6}
                          type={showModalPassword ? 'text' : 'password'}
                          value={newPasswordInput}
                          onChange={e => {
                            setNewPasswordInput(e.target.value);
                            if (passwordModalError) setPasswordModalError('');
                          }}
                          placeholder="Enter or generate password (6+ chars)..."
                          className="w-full pl-4 pr-20 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-mono font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]"
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowModalPassword(prev => !prev)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                            title={showModalPassword ? 'Hide Password' : 'Show Password'}
                          >
                            {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          {newPasswordInput.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator?.clipboard?.writeText) {
                                  navigator.clipboard.writeText(newPasswordInput.trim());
                                  toast.success('Password copied to clipboard!');
                                }
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy Password"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
                        Updates both Supabase Authentication (enabling immediate sign-in) and the Super Admin Credentials Vault.
                      </p>
                    </div>

                    <div className="flex gap-2.5 justify-end pt-3 border-t border-neutral-200/80 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => {
                          setSettingPasswordUser(null);
                          setNewPasswordInput('');
                          setPasswordModalError('');
                        }}
                        className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingPasswordLoading || newPasswordInput.trim().length < 6}
                        className="px-5 py-2 rounded-full bg-neutral-950 text-white dark:bg-[#16a34a] dark:text-neutral-950 hover:opacity-90 font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {savingPasswordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>{savingPasswordLoading ? 'Saving...' : 'Save Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Google Form Profile Automation & Import Modal */}
            {showGoogleFormModal && (
              <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl my-8 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
                  {/* Modal Header */}
                  <div className="p-5 sm:p-6 border-b border-neutral-200/80 dark:border-white/10 flex items-center justify-between gap-4 bg-neutral-50/50 dark:bg-[#151821]/50">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-950 dark:text-white flex items-center gap-2">
                          <span>Automate User Creation via Google Form</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            Workflow Automation
                          </span>
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Submit a Google Form responses sheet or paste rows to instantly create complete public profiles and credentials.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowGoogleFormModal(false);
                        setBatchCompleted(false);
                      }} 
                      className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="px-6 border-b border-neutral-200/80 dark:border-white/10 flex gap-4 text-xs font-bold bg-white dark:bg-[#111318] overflow-x-auto">
                    <button
                      onClick={() => {
                        setGoogleFormTab('portal');
                        fetchOnboardingSubmissions();
                      }}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        googleFormTab === 'portal'
                          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>Live Client Portal ({onboardingSubmissions.length})</span>
                    </button>
                    <button
                      onClick={() => setGoogleFormTab('import')}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        googleFormTab === 'import'
                          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Import Sheet / CSV ({parsedProfiles.length})</span>
                    </button>
                    <button
                      onClick={() => setGoogleFormTab('template')}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        googleFormTab === 'template'
                          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>Form Blueprint & CSV</span>
                    </button>
                    <button
                      onClick={() => setGoogleFormTab('script')}
                      className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                        googleFormTab === 'script'
                          ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Apps Script Webhook</span>
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* TAB 0: LIVE CLIENT ONBOARDING PORTAL */}
                    {googleFormTab === 'portal' && (
                      <div className="space-y-6">
                        {/* Direct Onboarding Link Share Banner */}
                        <div className="p-5 bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.03] to-transparent rounded-3xl border border-emerald-500/30 space-y-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-base text-neutral-950 dark:text-white">Official Client Onboarding Portal</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  Live & Permanent
                                </span>
                              </div>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                Send this link directly to clients or team executives. They complete their details, social links, and card choice without needing a Google account.
                              </p>
                            </div>
                            <a
                              href="/onboarding"
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                            >
                              <span>Preview Portal</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 flex items-center px-3.5 py-2.5 bg-white dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl font-mono text-xs text-neutral-900 dark:text-white select-all">
                              <span className="truncate">https://chipng.com/onboarding</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (navigator?.clipboard?.writeText) {
                                  navigator.clipboard.writeText('https://chipng.com/onboarding');
                                }
                                toast.success('Copied https://chipng.com/onboarding to clipboard!');
                              }}
                              className="px-4 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </button>
                            <a
                              href="https://wa.me/?text=Hi%2C%20please%20complete%20your%20CHIP%20NG%20contactless%20smart%20business%20card%20and%20public%20profile%20here%3A%20https%3A%2F%2Fchipng.com%2Fonboarding"
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                            >
                              <FaWhatsapp className="w-4 h-4" />
                              <span>Share via WhatsApp</span>
                            </a>
                          </div>
                        </div>

                        {/* Recent Onboarding Submissions Table */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                                Incoming Client Submissions ({onboardingSubmissions.length})
                              </h4>
                              {isLoadingSubmissions && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />}
                            </div>
                            <button
                              type="button"
                              onClick={fetchOnboardingSubmissions}
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              Refresh Submissions
                            </button>
                          </div>

                          {onboardingSubmissions.length === 0 ? (
                            <div className="p-8 text-center border border-dashed border-neutral-200 dark:border-white/10 rounded-2xl space-y-2">
                              <Globe className="w-8 h-8 mx-auto text-neutral-400" />
                              <p className="text-xs font-medium text-neutral-500">No client submissions yet.</p>
                              <p className="text-[11px] text-neutral-400">Share your portal link <strong className="text-emerald-500">https://chipng.com/onboarding</strong> with clients to collect profile responses.</p>
                            </div>
                          ) : (
                            <div className="border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden overflow-x-auto max-h-80">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-neutral-50 dark:bg-[#151821] text-neutral-500 border-b border-neutral-200/80 dark:border-white/10 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-2.5 px-3">Client Name & Email</th>
                                    <th className="py-2.5 px-3">Handle</th>
                                    <th className="py-2.5 px-3">Card Tier</th>
                                    <th className="py-2.5 px-3">Phone</th>
                                    <th className="py-2.5 px-3 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                                  {onboardingSubmissions.filter(sub => sub && typeof sub === 'object').map((sub, idx) => (
                                    <tr key={sub.id || idx} className="hover:bg-neutral-50/80 dark:hover:bg-white/[0.02]">
                                      <td className="py-2.5 px-3">
                                        <div className="font-bold text-neutral-900 dark:text-white">{sub.full_name || 'Client'}</div>
                                        <div className="font-mono text-[11px] text-neutral-500">{sub.email || 'No email provided'}</div>
                                      </td>
                                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                        @{sub.username || 'client'}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                                          {sub.card_tier || 'NFC Smart Card'}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-[11px] text-neutral-600 dark:text-neutral-400">
                                        {sub.phone_number || 'N/A'}
                                      </td>
                                      <td className="py-2.5 px-3 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          {sub.status === 'activated' && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                              Active
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => handleInstantProvisionSubmission(sub)}
                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                                            title="Instantly create account and persist all bio, avatar, socials, and contact data into Supabase profiles"
                                          >
                                            <UserCheck className="w-3 h-3" />
                                            <span>{sub.status === 'activated' ? 'Re-Sync' : 'Auto Provision'}</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setNewUserForm({
                                                email: sub.email || '',
                                                password: sub.suggested_password || 'ChipNg_2026!',
                                                full_name: sub.full_name || '',
                                                username: sub.username || '',
                                                headline: sub.headline || 'Member',
                                                bio: sub.bio || '',
                                                phone_number: sub.phone_number || '',
                                                cover_image_url: sub.avatar_url || '',
                                                number_of_accounts: 1
                                              });
                                              setCreatingUser(true);
                                              setShowGoogleFormModal(false);
                                              toast.info(`Loaded ${sub.full_name || 'client'}'s details into user creator.`);
                                            }}
                                            className="px-2 py-1 bg-neutral-200 dark:bg-white/10 hover:bg-neutral-300 dark:hover:bg-white/20 text-neutral-800 dark:text-white font-semibold text-[11px] rounded-lg cursor-pointer transition-all"
                                            title="Customize in full editor"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Supabase Schema & Dual-Persistence Setup Banner */}
                        <div className="p-4 bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-white/10 rounded-2xl space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Database className="w-4 h-4 text-emerald-500" />
                                <span className="font-bold text-xs text-neutral-900 dark:text-white">Supabase Onboarding Table Setup</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                  Dual-Persistence Active
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                                All submissions are automatically secured across Supabase storage and alert your email (<strong className="text-neutral-900 dark:text-white">vickthor.dennis@gmail.com</strong>). Run this script in your Supabase SQL editor to enable the native <code className="text-emerald-600 dark:text-emerald-400 font-mono">public.onboarding_submissions</code> table.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const sql = `-- CHIP NG Onboarding & Email Logs Schema
CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT,
  headline TEXT DEFAULT 'Executive Member',
  bio TEXT,
  phone_number TEXT,
  address TEXT DEFAULT 'Lagos, Nigeria',
  card_tier TEXT DEFAULT 'pvc-black',
  avatar_url TEXT,
  logo_url TEXT,
  socials JSONB DEFAULT '[]'::jsonb,
  suggested_password TEXT,
  status TEXT DEFAULT 'pending_activation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit onboarding profiles" ON public.onboarding_submissions;
CREATE POLICY "Public can submit onboarding profiles"
  ON public.onboarding_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view onboarding submissions" ON public.onboarding_submissions;
CREATE POLICY "Anyone can view onboarding submissions"
  ON public.onboarding_submissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can update onboarding submissions" ON public.onboarding_submissions;
CREATE POLICY "Anyone can update onboarding submissions"
  ON public.onboarding_submissions FOR UPDATE
  USING (true);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id TEXT,
  recipient TEXT NOT NULL,
  subject TEXT,
  resend_message_id TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read email logs" ON public.email_logs;
CREATE POLICY "Public can read email logs"
  ON public.email_logs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can insert email logs" ON public.email_logs;
CREATE POLICY "Public can insert email logs"
  ON public.email_logs FOR INSERT
  WITH CHECK (true);

GRANT ALL ON TABLE public.onboarding_submissions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.email_logs TO anon, authenticated, service_role;`;
                                  if (navigator?.clipboard?.writeText) {
                                    navigator.clipboard.writeText(sql);
                                  }
                                  setCopiedOnboardingSql(true);
                                  toast.success('Copied Supabase SQL schema to clipboard!');
                                  setTimeout(() => setCopiedOnboardingSql(false), 2500);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                {copiedOnboardingSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedOnboardingSql ? 'Copied SQL' : 'Copy Supabase SQL'}</span>
                              </button>
                              <a
                                href="https://supabase.com/dashboard/project/oxrzkdzcagvmgfuthyjd/sql/new"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                              >
                                <span>Supabase SQL Editor</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 1: IMPORT & AUTO-CREATE */}
                    {googleFormTab === 'import' && (
                      <div className="space-y-6">
                        {/* URL & Content Input */}
                        <form onSubmit={handleParseGoogleForm} className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                              Google Form Response Sheet Link (or Google Sheet CSV URL)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={googleFormUrl}
                                onChange={e => setGoogleFormUrl(e.target.value)}
                                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                                className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              />
                              <button
                                type="submit"
                                disabled={isParsingGoogleForm || (!googleFormUrl.trim() && !googleFormContent.trim())}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                              >
                                {isParsingGoogleForm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                <span>{isParsingGoogleForm ? 'Parsing...' : 'Parse Submissions'}</span>
                              </button>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                              Tip: In your Google Form, click the <strong className="text-emerald-600 dark:text-emerald-400">Responses</strong> tab → click <strong className="text-emerald-600 dark:text-emerald-400">Link to Sheets</strong> → copy and paste the Google Sheet URL here.
                            </p>
                          </div>

                          {/* Collapsible raw paste alternative */}
                          <details className="text-xs group">
                            <summary className="cursor-pointer text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold select-none flex items-center gap-1">
                              <span>Or paste copied spreadsheet rows / CSV directly</span>
                              <span className="text-[10px] text-neutral-400">(click to toggle)</span>
                            </summary>
                            <div className="mt-2 space-y-2">
                              <textarea
                                rows={4}
                                value={googleFormContent}
                                onChange={e => setGoogleFormContent(e.target.value)}
                                placeholder="Timestamp,Full Name,Email Address,Desired Username,Job Title,Bio,Phone Number,LinkedIn,Instagram,Website..."
                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-emerald-500 resize-none"
                              />
                              <button
                                type="button"
                                onClick={handleParseGoogleForm}
                                disabled={isParsingGoogleForm || !googleFormContent.trim()}
                                className="px-4 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
                              >
                                Parse Pasted Text
                              </button>
                            </div>
                          </details>
                        </form>

                        {/* Batch Creation Progress Indicator */}
                        {isBatchCreating && (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                              <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                <span>Batch Creating User Profiles & Accounts...</span>
                              </span>
                              <span>{batchProgress.current} / {batchProgress.total}</span>
                            </div>
                            <div className="w-full h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-600 transition-all duration-300" 
                                style={{ width: `${(batchProgress.current / Math.max(1, batchProgress.total)) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Batch Results Summary Banner */}
                        {batchCompleted && (
                          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <span>Automation Complete! {batchProgress.success} user accounts created successfully.</span>
                              </div>
                              <button
                                onClick={() => {
                                  const text = batchResults
                                    .filter(r => r.success)
                                    .map(r => `Name: ${r.full_name}\nEmail: ${r.email}\nUsername: @${r.username}\nPassword: ${r.password}\nProfile: ${r.profileUrl}\n---`)
                                    .join('\n');
                                  navigator.clipboard?.writeText(text);
                                  toast.success('All user credentials copied to clipboard!');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy All Credentials</span>
                              </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto divide-y divide-emerald-200 dark:divide-emerald-800/60 text-xs font-mono">
                              {batchResults.map((res, i) => (
                                <div key={i} className="py-2 flex items-center justify-between gap-3">
                                  <div className="truncate">
                                    <span className="font-bold text-neutral-900 dark:text-white">{res.full_name}</span>
                                    <span className="text-neutral-500 ml-2">({res.email})</span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="bg-white dark:bg-black/50 px-2 py-0.5 rounded border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-neutral-200">
                                      pass: {res.password}
                                    </span>
                                    {res.username && (
                                      <a
                                        href={`/@${res.username}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-600 hover:underline flex items-center gap-1"
                                      >
                                        <span>View Profile</span>
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Parsed Submissions Table */}
                        {parsedProfiles.length > 0 && !batchCompleted && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                                  Found {parsedProfiles.length} Profile Submissions
                                </span>
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAllProfiles(true)}
                                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 rounded-lg hover:bg-emerald-500/20 cursor-pointer"
                                  >
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectAllProfiles(false)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:opacity-80 cursor-pointer"
                                  >
                                    Deselect All
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={handleBatchCreateGoogleProfiles}
                                disabled={isBatchCreating || parsedProfiles.filter(p => p.selected !== false).length === 0}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                              >
                                {isBatchCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                <span>Create {parsedProfiles.filter(p => p.selected !== false).length} Accounts & Profiles</span>
                              </button>
                            </div>

                            <div className="border border-neutral-200/80 dark:border-white/10 rounded-2xl overflow-hidden overflow-x-auto max-h-96">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-neutral-50 dark:bg-[#151821] text-neutral-500 border-b border-neutral-200/80 dark:border-white/10 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-2.5 px-3 w-10 text-center">✓</th>
                                    <th className="py-2.5 px-3">Full Name & Email</th>
                                    <th className="py-2.5 px-3">Handle</th>
                                    <th className="py-2.5 px-3">Headline / Title</th>
                                    <th className="py-2.5 px-3">Phone & Location</th>
                                    <th className="py-2.5 px-3">Socials</th>
                                    <th className="py-2.5 px-3">Password</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-white/5">
                                  {parsedProfiles.map((p, idx) => (
                                    <tr 
                                      key={idx}
                                      className={`transition-colors ${p.selected !== false ? 'hover:bg-neutral-50/80 dark:hover:bg-white/[0.02]' : 'opacity-40 bg-neutral-100/30'}`}
                                    >
                                      <td className="py-2.5 px-3 text-center">
                                        <input
                                          type="checkbox"
                                          checked={p.selected !== false}
                                          onChange={() => handleToggleSelectProfile(idx)}
                                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <div className="font-bold text-neutral-900 dark:text-white">{p.full_name}</div>
                                        <div className="font-mono text-[11px] text-neutral-500">{p.email}</div>
                                      </td>
                                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                        @{p.username}
                                      </td>
                                      <td className="py-2.5 px-3 max-w-[180px] truncate" title={p.headline}>
                                        <div className="truncate font-medium text-neutral-800 dark:text-neutral-200">{p.headline || 'Member'}</div>
                                        {p.bio && <div className="truncate text-[10px] text-neutral-400">"{p.bio}"</div>}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <div>{p.phone_number || 'None'}</div>
                                        <div className="text-[10px] text-neutral-400">{p.address || ''}</div>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        {p.socials && p.socials.length > 0 ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                                            {p.socials.length} links
                                          </span>
                                        ) : (
                                          <span className="text-neutral-400 text-[10px]">None</span>
                                        )}
                                      </td>
                                      <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                                        {p.password}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: GOOGLE FORM TEMPLATE & FIELD BLUEPRINT */}
                    {googleFormTab === 'template' && (
                      <div className="space-y-6">
                        {/* Notice regarding Google Dynamic Links */}
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
                            <span className="font-bold">Why did the previous forms.gle link show "Dynamic Link Not Found"?</span>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
                              Google Forms shortlinks (<code className="font-mono">forms.gle/...</code>) are private Firebase Dynamic Links generated exclusively inside your personal Google account when you click <strong>Send → Shorten URL</strong>. To eliminate broken links, download our verified CSV template below (which opens in Google Sheets with 1 click) or share your live in-app onboarding portal link (<strong className="text-emerald-500">https://chipng.com/onboarding</strong>).
                            </p>
                          </div>
                        </div>

                        <div className="p-5 bg-neutral-50 dark:bg-[#151821] rounded-2xl border border-neutral-200/80 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="font-bold text-base text-neutral-950 dark:text-white flex items-center gap-2">
                              <span>Official CHIP NG Onboarding Blueprint & Template</span>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              Import this template directly into Google Sheets or Google Forms to gather complete contactless card profiles.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                downloadGoogleSheetsTemplateCsv();
                                toast.success('Downloaded chipng_client_onboarding_template.csv');
                              }}
                              className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download CSV Template (.csv)</span>
                            </button>
                            <a
                              href="https://forms.new"
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <span>Create Form in Google</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Questions Blueprint List */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
                            Required & Optional Form Fields for 100% Profile Creation
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">1. Full Name</span>
                                <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Required</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer. The official executive or client name that appears on the card.</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">2. Email Address</span>
                                <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">Required</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer. Used for login authentication, lead alerts, and inquiry routing.</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">3. Desired Username / Handle</span>
                                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Recommended</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer. Becomes chipng.com/@username. If omitted, CHIP NG auto-generates.</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">4. Professional Headline / Job Title</span>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Optional</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer. e.g. "Founder & Managing Director | Makro Global"</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">5. Bio / About You</span>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Optional</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Paragraph. A brief personal or brand summary displayed on the public card.</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">6. Phone & WhatsApp</span>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Optional</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer. Enables 1-tap WhatsApp chat and direct dialing on NFC tap.</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">7. Social Profiles (LinkedIn, IG, X, etc.)</span>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Optional</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer URLs. Parsed into interactive badges on the profile.</p>
                            </div>

                            <div className="p-4 rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white dark:bg-white/[0.01] space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-neutral-900 dark:text-white">8. Booking / Calendly Link</span>
                                <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-100 dark:bg-white/10 px-2 py-0.5 rounded-full">Optional</span>
                              </div>
                              <p className="text-neutral-500 text-[11px]">Short answer URL. Enables the "Book Appointment" button on the profile.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: 1-CLICK APPS SCRIPT GENERATOR */}
                    {googleFormTab === 'script' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-neutral-700 dark:text-neutral-300 space-y-1.5">
                          <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-500" />
                            <span>Generate the Complete Google Form in 5 Seconds</span>
                          </div>
                          <p>
                            1. Open <strong>script.google.com</strong> or your Google Drive → New → More → Google Apps Script.<br />
                            2. Paste this snippet and click <strong>Run</strong>.<br />
                            3. It automatically creates the complete CHIP NG Onboarding Google Form linked to a response Sheet in your Google account!
                          </p>
                        </div>

                        <div className="relative">
                          <pre className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 text-[11px] font-mono overflow-x-auto max-h-72 border border-neutral-800 leading-relaxed">
{`function createCHIPNGOnboardingForm() {
  var form = FormApp.create('CHIP NG — Client Profile Onboarding Form');
  form.setDescription('Please complete this form to set up your CHIP NG contactless smart card and public digital profile.');

  // 1. Account Basics
  form.addTextItem().setTitle('Full Name').setRequired(true);
  form.addTextItem().setTitle('Email Address').setRequired(true);
  form.addTextItem().setTitle('Desired Username (@handle)').setHelpText('e.g. victor.dennis (becomes chipng.com/@victor.dennis)');
  
  // 2. Identity & Role
  form.addTextItem().setTitle('Professional Headline / Job Title').setHelpText('e.g. Founder & CEO | Tech Entrepreneur');
  form.addParagraphTextItem().setTitle('Bio / Executive Summary').setHelpText('A brief summary about you or your brand');
  form.addTextItem().setTitle('Phone Number / WhatsApp');
  form.addTextItem().setTitle('Location / City & Country');
  form.addTextItem().setTitle('Company / Enterprise Name');
  
  // 3. Social & Web Channels
  form.addTextItem().setTitle('LinkedIn Profile URL');
  form.addTextItem().setTitle('Instagram Profile URL');
  form.addTextItem().setTitle('Twitter / X Profile URL');
  form.addTextItem().setTitle('Website / Portfolio Link');
  form.addTextItem().setTitle('Calendly / Meeting Booking Link');
  form.addTextItem().setTitle('Profile Photo / Headshot URL');
  
  // 4. Preferred Theme
  var themeItem = form.addListItem().setTitle('Preferred Card & Profile Theme');
  themeItem.setChoiceValues(['Default Stealth Black', 'Clean Minimal White', 'Emerald Green', 'Royal Gold', 'Makro Tech Teal']);
  
  Logger.log('Form created: ' + form.getEditUrl());
  Logger.log('Shareable Form URL: ' + form.getPublishedUrl());
}`}
                          </pre>
                          <button
                            type="button"
                            onClick={() => {
                              const scriptCode = `function createCHIPNGOnboardingForm() {\n  var form = FormApp.create('CHIP NG — Client Profile Onboarding Form');\n  form.setDescription('Please complete this form to set up your CHIP NG contactless smart card and public digital profile.');\n\n  // 1. Account Basics\n  form.addTextItem().setTitle('Full Name').setRequired(true);\n  form.addTextItem().setTitle('Email Address').setRequired(true);\n  form.addTextItem().setTitle('Desired Username (@handle)').setHelpText('e.g. victor.dennis (becomes chipng.com/@victor.dennis)');\n  \n  // 2. Identity & Role\n  form.addTextItem().setTitle('Professional Headline / Job Title').setHelpText('e.g. Founder & CEO | Tech Entrepreneur');\n  form.addParagraphTextItem().setTitle('Bio / Executive Summary').setHelpText('A brief summary about you or your brand');\n  form.addTextItem().setTitle('Phone Number / WhatsApp');\n  form.addTextItem().setTitle('Location / City & Country');\n  form.addTextItem().setTitle('Company / Enterprise Name');\n  \n  // 3. Social & Web Channels\n  form.addTextItem().setTitle('LinkedIn Profile URL');\n  form.addTextItem().setTitle('Instagram Profile URL');\n  form.addTextItem().setTitle('Twitter / X Profile URL');\n  form.addTextItem().setTitle('Website / Portfolio Link');\n  form.addTextItem().setTitle('Calendly / Meeting Booking Link');\n  form.addTextItem().setTitle('Profile Photo / Headshot URL');\n  \n  // 4. Preferred Theme\n  var themeItem = form.addListItem().setTitle('Preferred Card & Profile Theme');\n  themeItem.setChoiceValues(['Default Stealth Black', 'Clean Minimal White', 'Emerald Green', 'Royal Gold', 'Makro Tech Teal']);\n  \n  Logger.log('Form created: ' + form.getEditUrl());\n  Logger.log('Shareable Form URL: ' + form.getPublishedUrl());\n}`;
                              navigator.clipboard?.writeText(scriptCode);
                              toast.success('Google Apps Script copied to clipboard!');
                            }}
                            className="absolute top-3 right-3 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border border-white/10"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Script</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'email' && (
          <AdminEmailManager users={users} onRefresh={fetchData} />
        )}

        {activeTab === 'comms' && (
          <AdminUserCommsManager users={users} onRefresh={fetchData} />
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 h-fit">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16a34a]/15 text-[#16a34a] dark:text-[#16a34a] border border-[#16a34a]/30 text-xs font-semibold uppercase tracking-wider mb-2">
                Inventory Sync
              </div>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-4">
                {editingProduct ? 'Edit NFC Card / Product' : 'Add NFC Card / Product'}
              </h3>
              
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Product Name</label>
                  <input required value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})} placeholder="e.g. Matte Obsidian NFC Business Card" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Price (₦)</label>
                  <input required type="text" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})} placeholder="e.g. 25000" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Product Media (Images & Videos)</label>
                  
                  {prodForm.media_urls.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2 mb-2">
                      {prodForm.media_urls.map((url, i) => (
                        <div key={i} className="relative w-20 h-20 flex-shrink-0 group rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10">
                          {url.match(/\.(mp4|webm)$/i) ? (
                            <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} className="w-full h-full object-cover" alt="" />
                          )}
                          <button type="button" onClick={() => setProdForm({...prodForm, media_urls: prodForm.media_urls.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    multiple
                    onChange={async (e) => {
                      if (!e.target.files) return;
                      const files = Array.from(e.target.files);
                      const urls = [...prodForm.media_urls];
                      setUploadingImage(true);
                      for (const file of files) {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `${Math.random()}.${fileExt}`;
                        try {
                           const { error } = await supabase.storage.from('covers').upload(fileName, file);
                           if (!error) {
                             const { data } = supabase.storage.from('covers').getPublicUrl(fileName);
                             urls.push(data.publicUrl);
                           }
                        } catch(err) {}
                      }
                      setProdForm({...prodForm, media_urls: urls});
                      setUploadingImage(false);
                    }}
                    className="w-full text-xs text-neutral-500 dark:text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-200/70 dark:file:bg-white/10 file:text-neutral-900 dark:file:text-white hover:file:bg-neutral-300 cursor-pointer" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Description</label>
                  <textarea rows={3} value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})} placeholder="Hardware specifications, NFC chip details..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
                </div>
                <div className="flex gap-3 mt-2">
                  <button disabled={uploadingImage} type="submit" className="flex-1 py-3 px-5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50">
                    {uploadingImage ? 'Uploading...' : (editingProduct ? 'Update Product' : 'Create Product')}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={() => { setEditingProduct(null); setProdForm({name:'', price:'', description:'', media_urls: []}); }} className="px-5 py-3 rounded-full border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">Active Shop Inventory</h3>
                <span className="text-xs text-neutral-400">{products.length} Products synced to Homepage</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => {
                  const previewImg = getProductPreviewImage(p.image_url);
                  return (
                  <div key={p.id} className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                    {previewImg ? (
                      <img src={previewImg} alt={p.name} className="w-full h-44 object-cover" />
                    ) : (
                      <div className="w-full h-44 bg-neutral-100 dark:bg-[#151821] flex items-center justify-center text-neutral-400">
                        <CreditCard className="w-10 h-10 stroke-[1.5]" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-neutral-950 dark:text-white text-base leading-snug">{p.name}</h4>
                        <span className="font-bold text-neutral-950 dark:text-white bg-[#16a34a]/20 text-[#16a34a] dark:text-[#16a34a] px-2.5 py-1 rounded-full text-xs shrink-0">
                          ₦{Number(p.price).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 flex-1 mb-4 line-clamp-2">{p.description}</p>
                      
                      <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-white/5">
                        <button 
                          onClick={() => {
                            setEditingProduct(p);
                            let media = [];
                            try { media = JSON.parse(p.image_url); } catch { if (p.image_url) media = [p.image_url]; }
                            setProdForm({ name: p.name, description: p.description || '', price: p.price.toString(), media_urls: media });
                          }}
                          className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-xs font-semibold cursor-pointer text-neutral-800 dark:text-neutral-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 border border-rose-200 dark:border-rose-900/40 text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
                {products.length === 0 && (
                  <div className="col-span-2 p-12 text-center text-neutral-400 text-sm bg-white dark:bg-[#111318] border border-dashed border-neutral-200 dark:border-white/10 rounded-3xl">
                    No active hardware products found. Use the inventory form to publish your first NFC card.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <AdminBlogManager initialEditSlug={editSlug} />
        )}
        {activeTab === 'leads' && (
          <AdminLeadsManager />
        )}
        {activeTab === 'buybox' && (
          <AdminBuyBoxManager />
        )}
        {activeTab === 'seo' && (
          <AdminSeoManager />
        )}
        {activeTab === 'broadcast' && (
          <AdminBroadcastManager />
        )}
        {activeTab === 'notifications' && (
          <AdminNotificationManager />
        )}
        {activeTab === 'sales' && (
          <AdminSalesManager />
        )}
        {activeTab === 'pixel' && (
          <AdminPixelManager />
        )}
        {activeTab === 'downloads' && (
          <AdminAppDownloadsManager />
        )}
        {activeTab === 'portfolio' && (
          <AdminPortfolioManager />
        )}
      </div>

      {/* Confirmation Modal (replaces browser confirm dialogs) */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">{confirmModal.title}</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{confirmModal.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal(null);
                  await fn();
                }}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                {confirmModal.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
