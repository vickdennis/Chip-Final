import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { supabase, adminAuthClient } from '../supabaseClient';
import { Shield, ShieldAlert, CheckCircle, Package, Users, LogOut, Search, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users');
  const [search, setSearch] = useState('');

  // Product form state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', image_url: '' });

  // User form state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ full_name: '', username: '', headline: '', bio: '', contact_email: '', phone_number: '', cover_image_url: '' });

  // Create user state
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '' });
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
    const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    
    if (usersData) setUsers(usersData);
    if (productsData) setProducts(productsData);
  };

  const toggleVerification = async (id: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !current }).eq('id', id);
    if (error) alert("Error verifying: " + error.message);
    else fetchData();
  };

  const toggleAdmin = async (id: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', id);
    if (error) alert("Error making admin: " + error.message);
    else fetchData();
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const { error } = await supabase.from('profiles').update({
        full_name: userForm.full_name,
        username: userForm.username || null,
        headline: userForm.headline || null,
        bio: userForm.bio || null,
        contact_email: userForm.contact_email || null,
        phone_number: userForm.phone_number || null,
        cover_image_url: userForm.cover_image_url || null
      }).eq('id', editingUser.id);
      
      if (error) {
        alert("Error updating user: " + error.message);
      } else {
        setEditingUser(null);
        setUserForm({ full_name: '', username: '', headline: '', bio: '', contact_email: '', phone_number: '', cover_image_url: '' });
        fetchData();
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await adminAuthClient.auth.signUp({
        email: newUserForm.email,
        password: newUserForm.password,
        options: {
          data: {
            full_name: newUserForm.full_name
          }
        }
      });
      if (error) {
        alert("Sign up error: " + error.message);
      } else if (data.user) {
        // Give the trigger a moment to run
        await new Promise(r => setTimeout(r, 1000));
        
        const payload: any = {
          full_name: newUserForm.full_name,
          headline: newUserForm.headline || null,
          bio: newUserForm.bio || null,
          contact_email: newUserForm.email,
          phone_number: newUserForm.phone_number || null,
          cover_image_url: newUserForm.cover_image_url || null,
          is_verified: true
        };
        
        if (newUserForm.username) {
          payload.username = newUserForm.username;
        }
        
        // Use main supabase client (admin session) to update newly created profile
        const { error: innerError } = await supabase.from('profiles').update(payload).eq('id', data.user.id);
        
        if (innerError) {
          alert('User created but failed to update profile details: ' + innerError.message);
        } else {
          alert("User created successfully!");
        }
        setCreatingUser(false);
        setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(prodForm.price),
      image_url: prodForm.image_url
    };

    if (editingProduct) {
      await supabase.from('products').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('products').insert([payload]);
    }
    
    setEditingProduct(null);
    setProdForm({ name: '', description: '', price: '', image_url: '' });
    fetchData();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono">Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-[#7e7576] mb-6">You do not have permission to view the Super Admin Panel.</p>
        <button onClick={() => onNavigate('user-dashboard')} className="px-6 py-2 bg-black text-white rounded-md font-mono text-[13px] font-bold">
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

  return (
    <div className="min-h-screen bg-[#f3f3f4] dark:bg-[#222] pb-20">
      <header className="bg-black text-white p-4 sticky top-0 z-20 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          <h1 className="font-mono text-[16px] font-bold tracking-widest uppercase">Super Admin</h1>
        </div>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            onNavigate('login');
          }}
          className="flex items-center gap-2 text-white/70 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#cfc4c5] dark:border-[#333]">
          <button 
            className={`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flexItems-center gap-2 ${activeTab === 'users' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-4 h-4 inline mr-1" /> Users
          </button>
          <button 
            className={`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === 'products' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}`}
            onClick={() => setActiveTab('products')}
          >
            <Package className="w-4 h-4 inline mr-1" /> Shop Products
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-[#111] rounded-md shadow-sm border border-[#cfc4c5] dark:border-[#333] p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sans">User Management</h2>
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7e7576]" />
                  <input 
                    type="text" 
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-md outline-none focus:border-black dark:focus:border-white font-sans text-sm"
                  />
                </div>
                <button
                  onClick={() => setCreatingUser(true)}
                  className="px-4 py-2 bg-black text-white rounded-md font-mono text-[13px] font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e2e2] dark:border-[#333] text-[#7e7576] font-mono text-[11px] uppercase tracking-widest">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-[#f3f3f4] hover:bg-[#fafafa]">
                      <td className="py-3 px-4">
                        <div className="font-sans font-bold text-[14px]">{u.full_name || 'No Name'}</div>
                        <div className="font-mono text-[11px] text-[#7e7576] truncate w-32" title={u.id}>{u.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <a href={`/${u.username}`} target="_blank" className="font-mono text-[13px] text-[#0066cc] hover:underline">@{u.username}</a>
                      </td>
                      <td className="py-3 px-4">
                        {u.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-full font-mono text-[10px] font-bold uppercase">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-mono text-[10px] font-bold uppercase">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {u.is_admin ? (
                          <span className="inline-flex flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full font-mono text-[10px] font-bold uppercase">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-gray-400 uppercase">User</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleVerification(u.id, u.is_verified)}
                            className="px-3 py-1 bg-[#f3f3f4] dark:bg-[#222] hover:bg-[#e2e2e2] rounded-[4px] font-mono text-[11px] font-bold transition-colors"
                          >
                            {u.is_verified ? 'Revoke Verif.' : 'Verify'}
                          </button>
                          <button 
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className="px-3 py-1 bg-[#f3f3f4] dark:bg-[#222] hover:bg-[#e2e2e2] rounded-[4px] font-mono text-[11px] font-bold transition-colors disabled:opacity-50"
                            disabled={u.id === currentUserId}
                          >
                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserForm({ full_name: u.full_name || '', username: u.username || '', headline: u.headline || '', bio: u.bio || '', contact_email: u.contact_email || '', phone_number: u.phone_number || '', cover_image_url: u.cover_image_url || '' });
                            }}
                            className="px-3 py-1 bg-[#f3f3f4] dark:bg-[#222] hover:bg-[#e2e2e2] rounded-[4px] font-mono text-[11px] font-bold transition-colors flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modals for User Management */}
            {editingUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111] rounded-md p-6 w-full max-w-md shadow-xl my-8">
                  <h3 className="font-sans font-bold text-lg mb-4">Edit User Profile</h3>
                  <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Full Name</label>
                      <input value={userForm.full_name || ''} onChange={e => setUserForm({...userForm, full_name: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Username</label>
                      <input value={userForm.username || ''} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Headline/Job Title</label>
                      <input value={userForm.headline || ''} onChange={e => setUserForm({...userForm, headline: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Bio</label>
                      <textarea rows={3} value={userForm.bio || ''} onChange={e => setUserForm({...userForm, bio: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Contact Email</label>
                      <input type="email" value={userForm.contact_email || ''} onChange={e => setUserForm({...userForm, contact_email: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Phone Number</label>
                      <input type="tel" value={userForm.phone_number || ''} onChange={e => setUserForm({...userForm, phone_number: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Cover Image</label>
                      {userForm.cover_image_url && <img src={userForm.cover_image_url} className="w-full h-24 object-cover mb-2 rounded-sm" />}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => setUserForm({...userForm, cover_image_url: url}))}
                        className="w-full text-[13px]" 
                      />
                      {userForm.cover_image_url && (
                        <input value={userForm.cover_image_url || ''} onChange={e => setUserForm({...userForm, cover_image_url: e.target.value})} className="w-full mt-2 px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" placeholder="Or paste image URL..." />
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button disabled={uploadingImage} type="submit" className="flex-1 bg-black text-white py-2 rounded-sm font-mono text-[13px] font-bold disabled:opacity-50">
                        {uploadingImage ? 'Uploading...' : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 bg-[#f3f3f4] dark:bg-[#222] text-black dark:text-white rounded-sm font-mono text-[13px] font-bold">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {creatingUser && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                <div className="bg-white dark:bg-[#111] rounded-md p-6 w-full max-w-md shadow-xl my-8">
                  <h3 className="font-sans font-bold text-lg mb-2">Create New User</h3>
                  <p className="font-sans text-xs text-[#7e7576] mb-4">Warning: Creating a user will log you in as them temporarily.</p>
                  <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Email *</label>
                      <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Password *</label>
                      <input required type="password" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Full Name *</label>
                      <input required value={newUserForm.full_name} onChange={e => setNewUserForm({...newUserForm, full_name: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Username</label>
                      <input value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} placeholder="Optional" className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Phone Number</label>
                      <input type="tel" value={newUserForm.phone_number} onChange={e => setNewUserForm({...newUserForm, phone_number: e.target.value})} placeholder="Optional" className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Headline/Job Title</label>
                      <input value={newUserForm.headline} onChange={e => setNewUserForm({...newUserForm, headline: e.target.value})} placeholder="Optional" className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Bio</label>
                      <textarea rows={3} value={newUserForm.bio} onChange={e => setNewUserForm({...newUserForm, bio: e.target.value})} placeholder="Optional bio" className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Cover Image</label>
                      {newUserForm.cover_image_url && <img src={newUserForm.cover_image_url} className="w-full h-24 object-cover mb-2 rounded-sm" />}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => setNewUserForm({...newUserForm, cover_image_url: url}))}
                        className="w-full text-[13px]" 
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button disabled={uploadingImage} type="submit" className="flex-1 bg-black text-white py-2 rounded-sm font-mono text-[13px] font-bold disabled:opacity-50">
                        {uploadingImage ? 'Uploading...' : 'Create User'}
                      </button>
                      <button type="button" onClick={() => setCreatingUser(false)} className="px-4 py-2 bg-[#f3f3f4] dark:bg-[#222] text-black dark:text-white rounded-sm font-mono text-[13px] font-bold">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white dark:bg-[#111] p-6 rounded-md shadow-sm border border-[#cfc4c5] dark:border-[#333] h-fit">
              <h3 className="font-sans font-bold text-lg mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Name</label>
                  <input required value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Price (₦)</label>
                  <input required type="number" step="0.01" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Image Upload</label>
                  {prodForm.image_url && <img src={prodForm.image_url} className="w-full h-24 object-cover mb-2 rounded-sm border border-[#cfc4c5] dark:border-[#333]" />}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, (url) => setProdForm({...prodForm, image_url: url}), 'covers')}
                    className="w-full text-[13px]" 
                  />
                  <div className="mt-2">
                    <label className="block font-mono text-[10px] font-bold text-[#7e7576] uppercase mb-1">Or Image URL</label>
                    <input value={prodForm.image_url} onChange={e=>setProdForm({...prodForm, image_url: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[12px] font-sans" />
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] dark:text-[#a0a0a0] uppercase mb-1">Description</label>
                  <textarea rows={3} value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] dark:border-[#333] rounded-sm text-[13px] font-sans" />
                </div>
                <div className="flex gap-2 mt-2">
                  <button disabled={uploadingImage} type="submit" className="flex-1 bg-black text-white py-2 rounded-sm font-mono text-[13px] font-bold disabled:opacity-50">
                    {uploadingImage ? 'Uploading...' : (editingProduct ? 'Update' : 'Create')}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={() => { setEditingProduct(null); setProdForm({name:'', price:'', description:'', image_url:''}); }} className="px-4 py-2 bg-[#f3f3f4] dark:bg-[#222] text-black dark:text-white rounded-sm font-mono text-[13px] font-bold">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white dark:bg-[#111] border border-[#cfc4c5] dark:border-[#333] rounded-md overflow-hidden shadow-sm flex flex-col">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold font-sans text-[15px]">{p.name}</h4>
                        <span className="font-mono font-bold text-black dark:text-white bg-[#f3f3f4] dark:bg-[#222] px-2 py-0.5 rounded-sm text-[12px]">₦{p.price}</span>
                      </div>
                      <p className="text-[13px] text-[#7e7576] flex-1 mb-4">{p.description}</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm({ name: p.name, description: p.description || '', price: p.price.toString(), image_url: p.image_url || '' });
                          }}
                          className="flex-1 py-1.5 flex items-center justify-center gap-1 border border-[#cfc4c5] dark:border-[#333] rounded-[4px] hover:bg-[#f3f3f4] dark:bg-[#222] transition-colors font-mono text-[11px] font-bold"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="px-3 py-1.5 border border-red-200 text-red-500 rounded-[4px] hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-2 p-8 text-center text-[#7e7576] font-mono text-[13px] bg-white dark:bg-[#111] border border-dashed border-[#cfc4c5] dark:border-[#333] rounded-md">
                    No products found. Use the form to add some.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
