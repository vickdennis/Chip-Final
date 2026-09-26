import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { supabase, adminAuthClient } from '../supabaseClient';
import { Shield, ShieldAlert, CheckCircle, Package, Users, LogOut, Search, Plus, Trash2, Edit2, Globe, BarChart2, DollarSign, Activity, Download, FileText, Eye, Sun, Moon, X, CreditCard } from 'lucide-react';
import { SOCIAL_PLATFORMS } from './UserDashboard';
import { ebooksData } from '../utils/ebooksData';
import AdminBlogManager from './AdminBlogManager';
import AdminLeadsManager from './AdminLeadsManager';
import AdminBuyBoxManager from './AdminBuyBoxManager';
import AdminSeoManager from './AdminSeoManager';
import AdminBroadcastManager from './AdminBroadcastManager';
import AdminNotificationManager from './AdminNotificationManager';
import AdminSalesManager from './AdminSalesManager';
import AdminPixelManager from './AdminPixelManager';
import { MessageCircle, Send, Bell, Link as LinkIcon } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

export default function AdminDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [blogViews, setBlogViews] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo' | 'broadcast' | 'notifications' | 'sales' | 'pixel'>('analytics');
  const [search, setSearch] = useState('');

  // Product form state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', media_urls: [] as string[] });

  // User form state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ full_name: '', username: '', headline: '', bio: '', contact_email: '', phone_number: '', cover_image_url: '', social_links_style: 'color-circle' });
  const [userSocialLinks, setUserSocialLinks] = useState<any[]>([]);

  // Blog form state
  const [editingPost, setEditingPost] = useState<any>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', slug: '', content: '', excerpt: '', cover_image_url: '', meta_title: '', meta_description: '', keywords: '', is_published: false });

  // Create user state
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void, bucket: string = 'covers') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingImage(true);
    try {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) {
        throw uploadError;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setter(data.publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onNavigate('login');
      return;
    }
    setCurrentUserId(user.id);

    let { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    
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

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const { error, count, data } = await supabase.from('profiles').update({
        full_name: userForm.full_name,
        username: userForm.username || null,
        headline: userForm.headline || null,
        bio: userForm.bio || null,
        contact_email: userForm.contact_email || null,
        phone_number: userForm.phone_number || null,
        cover_image_url: userForm.cover_image_url || null,
        social_links_style: userForm.social_links_style || 'color-circle'
      }).eq('id', editingUser.id).select('*');
      
      if (error) {
        alert("Error updating user: " + error.message);
      } else if (!data || data.length === 0) {
        alert("Update failed! Row-level security prevented modification. Please apply the updated supabase_schema.sql policies.");
      } else {
        const { error: delError } = await supabase.from('social_links').delete().eq('profile_id', editingUser.id);
        if (delError) {
          console.error("Error deleting social links:", delError);
        }
        if (userSocialLinks.length > 0) {
          const { error: insError } = await supabase.from('social_links').insert(userSocialLinks.map(s => ({
            profile_id: editingUser.id,
            platform: s.platform,
            url: s.url
          })));
          if (insError) {
            alert("Error saving social links: " + insError.message);
          }
        }
        setEditingUser(null);
        setUserForm({ full_name: '', username: '', headline: '', bio: '', contact_email: '', phone_number: '', cover_image_url: '', social_links_style: 'color-circle' });
        setUserSocialLinks([]);
        fetchData();
      }
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
            is_verified: true
          };
          
          if (currentUsername) {
            payload.username = currentUsername;
          }
          
          const { error: innerError } = await adminAuthClient.from('profiles').update(payload).eq('id', data.user.id);
          
          await adminAuthClient.auth.signOut();
          
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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#D2F843] selection:text-neutral-950 font-sans transition-colors pb-24">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6b8500] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D2F843]"></span> Command Hub
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
              { id: 'users', label: 'Users', icon: Users },
              { id: 'products', label: 'Shop', icon: Package },
              { id: 'blog', label: 'Blog', icon: FileText },
              { id: 'leads', label: 'Leads', icon: MessageCircle },
              { id: 'buybox', label: 'Buy Box', icon: Package },
              { id: 'seo', label: 'SEO', icon: Search },
              { id: 'sales', label: 'NFC Sales', icon: DollarSign },
              { id: 'broadcast', label: 'Broadcast', icon: Send },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'pixel', label: 'Pixels & Tracking', icon: Activity },
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D2F843] dark:text-neutral-950' : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-[#111318] p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Members</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Total Users</h3>
                <p className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{totalUsers}</p>
                <div className="text-[12px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> {verifiedUsers} Verified Accounts
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#111318] p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Store</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Total Shop Sales</h3>
                <p className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">₦{totalShopRevenue.toLocaleString()}</p>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                  From {digitalProductPurchases.length} digital purchases
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111318] p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Earnings</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Platform Revenue</h3>
                <p className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">₦{totalPlatformFees.toLocaleString()}</p>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 flex flex-col gap-0.5">
                  <span>Shop Take (5%): ₦{digitalProductFees.toLocaleString()}</span>
                  <span>Theme Upgrades: ₦{themeSalesRevenue.toLocaleString()}</span>
                  <span>Verification: ₦{verificationEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#111318] p-6 sm:p-7 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Reach</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Total Blog Views</h3>
                <p className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">{blogViews}</p>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-2 font-medium">
                  Across {posts.length} published articles
                </p>
              </div>
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
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-full text-xs sm:text-sm font-medium text-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/60 focus:border-[#D2F843] transition-all"
                  />
                </div>
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
                        <a href={`/${u.username}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-neutral-900 dark:text-neutral-100 font-medium hover:text-[#596e00] dark:hover:text-[#D2F843] transition-colors">
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-[11px] font-bold uppercase tracking-wider">
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
                              setUserForm({ full_name: u.full_name || '', username: u.username || '', headline: u.headline || '', bio: u.bio || '', contact_email: u.contact_email || '', phone_number: u.phone_number || '', cover_image_url: u.cover_image_url || '', social_links_style: u.social_links_style || 'color-circle' });
                              setUserSocialLinks([]);
                              supabase.from('social_links').select('*').eq('profile_id', u.id).then(({data}) => {
                                if(data) setUserSocialLinks(data);
                              });
                            }}
                            className="p-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs transition-colors flex items-center justify-center cursor-pointer text-neutral-700 dark:text-neutral-300"
                            title="Edit Profile"
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

            {/* Modals for User Management */}
            {editingUser && (
              <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-neutral-950 dark:text-white">Edit User Profile</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Update contact and bio info for @{editingUser.username}</p>
                    </div>
                    <button 
                      onClick={() => setEditingUser(null)} 
                      className="p-2 rounded-full text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name</label>
                      <input value={userForm.full_name || ''} onChange={e => setUserForm({...userForm, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Username</label>
                      <input value={userForm.username || ''} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Headline / Job Title</label>
                      <input value={userForm.headline || ''} onChange={e => setUserForm({...userForm, headline: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Bio</label>
                      <textarea rows={3} value={userForm.bio || ''} onChange={e => setUserForm({...userForm, bio: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Contact Email</label>
                        <input type="email" value={userForm.contact_email || ''} onChange={e => setUserForm({...userForm, contact_email: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Phone Number</label>
                        <input type="tel" value={userForm.phone_number || ''} onChange={e => setUserForm({...userForm, phone_number: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-neutral-200/80 dark:border-white/10">
                      <button 
                        type="button" 
                        onClick={() => setEditingUser(null)} 
                        className="px-5 py-2.5 rounded-full border border-neutral-200/80 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-2.5 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-90 font-semibold text-xs shadow-sm cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
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
                      <input required type="number" min="1" max="100" value={newUserForm.number_of_accounts} onChange={e => setNewUserForm({...newUserForm, number_of_accounts: parseInt(e.target.value) || 1})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                      <p className="text-[11px] text-neutral-400 mt-1">If &gt;1, creates aliases like user+1@email.com</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Email *</label>
                      <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Password *</label>
                      <input required type="password" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Full Name *</label>
                      <input required value={newUserForm.full_name} onChange={e => setNewUserForm({...newUserForm, full_name: e.target.value})} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Username</label>
                        <input value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} placeholder="Optional handle" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Phone Number</label>
                        <input type="tel" value={newUserForm.phone_number} onChange={e => setNewUserForm({...newUserForm, phone_number: e.target.value})} placeholder="+234..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
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

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white dark:bg-[#111318] p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 h-fit">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 text-xs font-semibold uppercase tracking-wider mb-2">
                Inventory Sync
              </div>
              <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-4">
                {editingProduct ? 'Edit NFC Card / Product' : 'Add NFC Card / Product'}
              </h3>
              
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Product Name</label>
                  <input required value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})} placeholder="e.g. Matte Obsidian NFC Business Card" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">Price (₦)</label>
                  <input required type="text" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})} placeholder="e.g. 25000" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
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
                  <textarea rows={3} value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})} placeholder="Hardware specifications, NFC chip details..." className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border border-neutral-200/80 dark:border-white/10 rounded-xl text-sm font-medium text-neutral-950 dark:text-white outline-none focus:border-[#D2F843] focus:ring-1 focus:ring-[#D2F843]" />
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
                        <span className="font-bold text-neutral-950 dark:text-white bg-[#D2F843]/20 text-[#596e00] dark:text-[#D2F843] px-2.5 py-1 rounded-full text-xs shrink-0">
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

              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white">Digital Guides & Playbooks</h3>
                  <span className="text-xs text-neutral-400">Bundled assets</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ebooksData.map(b => (
                    <div key={b.id} className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-5 flex flex-col items-start text-left hover:border-neutral-300 dark:hover:border-white/20 transition-all">
                      <span className="text-[10px] bg-[#D2F843]/15 text-[#6c8600] dark:text-[#D2F843] border border-[#D2F843]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold mb-2">{b.category}</span>
                      <h4 className="font-bold text-neutral-950 dark:text-white text-sm leading-snug mb-1">{b.title}</h4>
                      <p className="text-xs text-neutral-400 mb-4">By {b.author}</p>
                      <button
                        onClick={() => triggerEbookDownload(b.id, b.title)}
                        className="mt-auto w-full py-2 flex items-center justify-center gap-2 rounded-full border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-xs font-semibold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Asset
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <AdminBlogManager />
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
      </div>
    </div>
  );
}
