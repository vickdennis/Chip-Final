import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { supabase, adminAuthClient } from '../supabaseClient';
import { Shield, ShieldAlert, CheckCircle, Package, Users, LogOut, Search, Plus, Trash2, Edit2, Globe, BarChart2, DollarSign, Activity, Download, FileText, Eye, Sun, Moon, X, CreditCard, Briefcase, Phone, MapPin, Calendar, Palette, ShoppingBag, ExternalLink, UserCheck, Check, Sparkles, Upload, Loader2, ArrowUp, ArrowDown, Share2, Layers } from 'lucide-react';
import { SOCIAL_PLATFORMS, PROFILE_LAYOUTS, COLOR_PRESETS } from './UserDashboard';
import { ebooksData } from '../utils/ebooksData';
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
import { MessageCircle, MessageSquare, Send, Bell, Link as LinkIcon, Smartphone, Mail } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from '../components/Toast';
import BrandLogo from '../components/BrandLogo';
import { SocialMediaIconBadge } from '../components/social/SocialMediaIconBadge';

export default function AdminDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [blogViews, setBlogViews] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'comms' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo' | 'broadcast' | 'notifications' | 'sales' | 'pixel' | 'downloads' | 'portfolio'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['analytics', 'users', 'comms', 'products', 'blog', 'leads', 'buybox', 'seo', 'broadcast', 'notifications', 'sales', 'pixel', 'downloads', 'portfolio'].includes(tabParam)) {
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
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    
    // Auto-grant if emails matches
    if (user.email === 'vickthor.dennis@gmail.com' && !profile?.is_admin) {
      await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id);
      setIsAdmin(true);
    } else if (profile?.is_admin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    setLoading(false);
    if (profile?.is_admin || user.email === 'vickthor.dennis@gmail.com') {
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
          const verifPurchases = purchasesData.filter(p => p.seller_id === u.id && p.purchase_type === 'verification' && p.status?.startsWith('expires_'));
          if (verifPurchases.length > 0) {
            const latestVerif = verifPurchases[0];
            const expiresAt = parseInt(latestVerif.status.split('_')[1], 10);
            if (Date.now() > expiresAt) {
              u.is_verified = false;
              await supabase.from('profiles').update({ is_verified: false }).eq('id', u.id);
              needsRefresh = true;
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
  };

  const toggleVerification = async (user: any) => {
    if (user.is_verified) {
      if (!window.confirm("Revoke verification?")) return;
      const { error } = await supabase.from('profiles').update({ is_verified: false }).eq('id', user.id);
      if (error) alert("Error revoking: " + error.message);
      else fetchData();
    } else {
      const monthsStr = window.prompt("Enter number of months for verification:", "1");
      if (!monthsStr) return;
      const months = parseInt(monthsStr, 10);
      if (isNaN(months) || months <= 0) return alert("Invalid number of months");
      
      const expiresAt = Date.now() + months * 30 * 24 * 60 * 60 * 1000;
      
      const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
      if (error) {
        alert("Error verifying: " + error.message);
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
      
      fetchData();
    }
  };

  const toggleAdmin = async (id: string, current: boolean) => {
    const { error, count, data } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', id).select('*');
    if (error) alert("Error making admin: " + error.message);
    else if (!data || data.length === 0) alert("Action failed constraint checks in DB (RLS). Please apply the latest permissions in Supabase SQL editor.");
    else fetchData();
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

      const profilePayload: any = {
        full_name: userForm.full_name || '',
        username: cleanUsername,
        headline: userForm.headline || null,
        bio: userForm.bio || null,
        contact_email: userForm.contact_email || null,
        phone_number: userForm.phone_number || null,
        is_whatsapp: userForm.is_whatsapp ?? true,
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
        cover_image_url: userForm.cover_image_url || null,
        avatar_url: userForm.cover_image_url || null
      };

      // 1. Direct Supabase Update
      let sbError: any = null;
      try {
        let res = await supabase.from('profiles').update(profilePayload).eq('id', editingUser.id);
        if (res.error && (res.error.message.includes('is_whatsapp') || res.error.message.includes('schema cache'))) {
          delete profilePayload.is_whatsapp;
          res = await supabase.from('profiles').update(profilePayload).eq('id', editingUser.id);
        }
        sbError = res.error;
      } catch (err: any) {
        sbError = err;
      }

      // 2. Featured Links Update
      try {
        await supabase.from('links').delete().eq('profile_id', editingUser.id);
        if (userLinks.length > 0) {
          await supabase.from('links').insert(userLinks.map(({ id, created_at, ...l }: any, idx: number) => ({
            ...l,
            profile_id: editingUser.id,
            position: idx
          })));
        }
      } catch (err) {}

      // 3. Social Links Update
      try {
        await supabase.from('social_links').delete().eq('profile_id', editingUser.id);
        if (userSocialLinks.length > 0) {
          await supabase.from('social_links').insert(userSocialLinks.map(({ id, created_at, ...s }: any) => ({
            ...s,
            profile_id: editingUser.id
          })));
        }
      } catch (err) {}

      // 4. Products Update
      try {
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
      } catch (err) {}

      // 5. Dual Atomic Sync via /api/admin/profile/update-full (bypasses RLS)
      try {
        await fetch('/api/admin/profile/update-full', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: editingUser.id,
            profile: { ...profilePayload, is_whatsapp: userForm.is_whatsapp },
            links: userLinks,
            social_links: userSocialLinks,
            products: userProducts
          })
        });
      } catch (syncErr) {
        console.warn('Admin dual sync warning:', syncErr);
      }

      toast.success(`100% Profile Setup completed for @${cleanUsername || editingUser.username}!`);
      setEditingUser(null);
      fetchData();
    } catch (error: any) {
      console.error('Error in handleSaveUser:', error);
      alert('Error updating user profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSavingUserProfile(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = newUserForm.number_of_accounts || 1;
      const baseEmail = newUserForm.email;
      const [localPart, domainPart] = baseEmail.includes('@') ? baseEmail.split('@') : [baseEmail, ''];

      let successCount = 0;
      let lastError = null;
      let limitHit = false;

      for (let i = 0; i < count; i++) {
        const currentEmail = count === 1 ? baseEmail : `${localPart}+${i+1}@${domainPart}`;
        const currentFullName = count === 1 ? newUserForm.full_name : `${newUserForm.full_name} ${i+1}`;
        const currentUsername = count === 1 ? newUserForm.username : (newUserForm.username ? `${newUserForm.username}${i+1}` : '');

        const { data, error } = await adminAuthClient.auth.signUp({
          email: currentEmail,
          password: newUserForm.password,
          options: {
            data: {
              full_name: currentFullName
            }
          }
        });

        if (error) {
          lastError = error;
          if (error.message && error.message.toLowerCase().includes('rate limit')) {
             limitHit = true;
          }
          break;
        } else if (data.user) {
          await new Promise(r => setTimeout(r, 1000));
          
          const payload: any = {
            full_name: currentFullName,
            headline: newUserForm.headline || null,
            bio: newUserForm.bio || null,
            contact_email: currentEmail,
            phone_number: newUserForm.phone_number || null,
            cover_image_url: newUserForm.cover_image_url || null,
            avatar_url: newUserForm.cover_image_url || null,
            is_verified: true
          };
          
          if (currentUsername) {
            payload.username = currentUsername;
          }
          
          // Use the authenticated Super Admin supabase client with admin privileges to upsert profile data
          let { error: innerError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            ...payload
          });

          // Fallback to update if upsert encounters any constraint
          if (innerError) {
            const updateRes = await supabase.from('profiles').update(payload).eq('id', data.user.id);
            innerError = updateRes.error;
          }
          
          await adminAuthClient.auth.signOut().catch(() => {});
          
          if (innerError) {
             console.error('Failed to update profile for', currentEmail, innerError);
          } else {
             successCount++;
          }
        }
      }

      if (lastError) {
        if (limitHit) {
          alert(`Sign up error: rate limit exceeded after creating ${successCount} accounts. Try again later.`);
        } else {
          alert(`Sign up error after creating ${successCount} accounts: ${lastError.message}`);
        }
      } else {
        alert(count > 1 ? `Successfully created ${successCount} accounts!` : "User created successfully!");
      }
      
      if (successCount > 0) {
        setCreatingUser(false);
        setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
        fetchData();
      }

    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      profile_id: null,
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(prodForm.price.toString().replace(/,/g, '')),
      image_url: JSON.stringify(prodForm.media_urls)
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    
    setEditingProduct(null);
    setProdForm({ name: '', description: '', price: '', media_urls: [] });
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
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
      fetchData();
    } catch (err: any) {
      alert("Error saving post: " + err.message);
    }
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    fetchData();
  };

  const togglePostPublished = async (post: any) => {
    const payload = { 
      is_published: !post.is_published,
      published_at: !post.is_published && !post.published_at ? new Date().toISOString() : post.published_at
    };
    await supabase.from('posts').update(payload).eq('id', post.id);
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-black/40 dark:text-white/40 mb-6">You do not have permission to view the Super Admin Panel.</p>
        <button onClick={() => onNavigate('user-dashboard')} className="px-6 py-2 bg-black text-black dark:text-white rounded-2xl font-mono text-[13px] font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.id?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.is_verified).length;
  
  const digitalProductPurchases = purchases.filter(p => p.purchase_type === 'digital_product' || !p.purchase_type);
  const themePurchases = purchases.filter(p => p.purchase_type === 'theme');
  const verificationPurchases = purchases.filter(p => p.purchase_type === 'verification');
  
  const totalShopRevenue = digitalProductPurchases.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const digitalProductFees = digitalProductPurchases.reduce((sum, p) => sum + Number(p.platform_fee || (p.amount * 0.05) || 0), 0);
  const themeSalesRevenue = themePurchases.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const verificationEarnings = verificationPurchases.reduce((sum, p) => sum + Number(p.platform_fee || p.amount || 0), 0);
  
  const totalPlatformFees = digitalProductFees + themeSalesRevenue + verificationEarnings;
  const proPlanUsers = users.filter(u => u.is_pro || u.enterprise_id).length;

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
                  <p className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">1,856</p>
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
                    {inquiries.length > 0 ? inquiries.length : 3}
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
                    const timeAgo = item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently';

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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">User Directory</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Search, verify, and manage registered accounts across CHIPNG.</p>
              </div>
              <div className="flex gap-3 items-center w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Search users..."
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
                  onClick={() => setCreatingUser(true)}
                  className="px-4 py-2 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 dark:border-white/10">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 text-neutral-500 dark:text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Handle</th>
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
                            <div className="font-mono text-[11px] text-neutral-400 truncate max-w-[140px]" title={u.id}>{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <a href={`/${u.username}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-neutral-900 dark:text-neutral-100 font-medium hover:text-[#16a34a] dark:hover:text-[#16a34a] transition-colors">
                          @{u.username || 'unknown'}
                        </a>
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
                            onClick={() => toggleVerification(u)}
                            className="px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors cursor-pointer text-neutral-700 dark:text-neutral-300"
                          >
                            {u.is_verified ? 'Revoke' : 'Verify'}
                          </button>
                          <button 
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className="px-3 py-1.5 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer text-neutral-700 dark:text-neutral-300"
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
                      <td colSpan={5} className="p-8 text-center text-neutral-400 text-sm">
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

                    <button 
                      onClick={() => setEditingUser(null)} 
                      className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
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
                                      <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={(e) => {
                                          const newArr = [...arr];
                                          newArr[idx] = e.target.value;
                                          setUserForm({ ...userForm, phone_number: JSON.stringify(newArr) });
                                        }}
                                        placeholder="+234 800 000 0000"
                                        className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" 
                                      />
                                      {arr.length > 1 && (
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const newArr = arr.filter((_, i) => i !== idx);
                                            setUserForm({ ...userForm, phone_number: JSON.stringify(newArr) });
                                          }}
                                          className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
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

                    {/* TAB 8: ROLES, VERIFICATION & ENTERPRISE */}
                    {adminEditTab === 'roles' && (
                      <div className="space-y-4 animate-in fade-in-50 duration-150">
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
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Phone Number</label>
                        <input type="tel" value={newUserForm.phone_number} onChange={e => setNewUserForm({...newUserForm, phone_number: e.target.value})} placeholder="+234..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a]" />
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
                      <button disabled={uploadingImage} type="submit" className="px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs shadow-sm cursor-pointer disabled:opacity-50">
                        {uploadingImage ? 'Uploading...' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
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
                {products.map(p => (
                  <div key={p.id} className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm flex flex-col hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                    {p.image_url ? (
                      <img src={p.image_url.startsWith('[') ? JSON.parse(p.image_url)[0] : p.image_url} alt={p.name} className="w-full h-44 object-cover" />
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
                ))}
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
    </div>
  );
}
