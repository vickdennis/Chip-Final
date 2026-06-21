import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { Shield, ShieldAlert, CheckCircle, Package, Users, LogOut, Search, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminDashboard({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'products'>('users');
  const [search, setSearch] = useState('');

  // Product form state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', image_url: '' });

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onNavigate('login');
      return;
    }

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
    if (!error) fetchData();
  };

  const toggleAdmin = async (id: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', id);
    if (!error) fetchData();
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
    <div className="min-h-screen bg-[#f3f3f4] pb-20">
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
        <div className="flex gap-4 mb-6 border-b border-[#cfc4c5]">
          <button 
            className={`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flexItems-center gap-2 ${activeTab === 'users' ? 'border-b-2 border-black text-black' : 'text-[#7e7576]'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-4 h-4 inline mr-1" /> Users
          </button>
          <button 
            className={`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-[#7e7576]'}`}
            onClick={() => setActiveTab('products')}
          >
            <Package className="w-4 h-4 inline mr-1" /> Shop Products
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white rounded-md shadow-sm border border-[#cfc4c5] p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-sans">User Management</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7e7576]" />
                <input 
                  type="text" 
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-[#cfc4c5] rounded-md outline-none focus:border-black font-sans text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e2e2e2] text-[#7e7576] font-mono text-[11px] uppercase tracking-widest">
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
                            className="px-3 py-1 bg-[#f3f3f4] hover:bg-[#e2e2e2] rounded-[4px] font-mono text-[11px] font-bold transition-colors"
                          >
                            {u.is_verified ? 'Revoke Verif.' : 'Verify'}
                          </button>
                          <button 
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className="px-3 py-1 bg-[#f3f3f4] hover:bg-[#e2e2e2] rounded-[4px] font-mono text-[11px] font-bold transition-colors"
                            disabled={u.email === 'vickthor.dennis@gmail.com'}
                          >
                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-6 rounded-md shadow-sm border border-[#cfc4c5] h-fit">
              <h3 className="font-sans font-bold text-lg mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase mb-1">Name</label>
                  <input required value={prodForm.name} onChange={e=>setProdForm({...prodForm, name: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] rounded-sm text-[13px] font-sans" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase mb-1">Price (₦)</label>
                  <input required type="number" step="0.01" value={prodForm.price} onChange={e=>setProdForm({...prodForm, price: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] rounded-sm text-[13px] font-sans" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase mb-1">Image URL</label>
                  <input value={prodForm.image_url} onChange={e=>setProdForm({...prodForm, image_url: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] rounded-sm text-[13px] font-sans" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase mb-1">Description</label>
                  <textarea rows={3} value={prodForm.description} onChange={e=>setProdForm({...prodForm, description: e.target.value})} className="w-full px-3 py-2 border border-[#cfc4c5] rounded-sm text-[13px] font-sans" />
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="flex-1 bg-black text-white py-2 rounded-sm font-mono text-[13px] font-bold">
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={() => { setEditingProduct(null); setProdForm({name:'', price:'', desc:'', image_url:''}); }} className="px-4 py-2 bg-[#f3f3f4] text-black rounded-sm font-mono text-[13px] font-bold">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white border border-[#cfc4c5] rounded-md overflow-hidden shadow-sm flex flex-col">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold font-sans text-[15px]">{p.name}</h4>
                        <span className="font-mono font-bold text-black bg-[#f3f3f4] px-2 py-0.5 rounded-sm text-[12px]">₦{p.price}</span>
                      </div>
                      <p className="text-[13px] text-[#7e7576] flex-1 mb-4">{p.description}</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingProduct(p);
                            setProdForm({ name: p.name, description: p.description || '', price: p.price.toString(), image_url: p.image_url || '' });
                          }}
                          className="flex-1 py-1.5 flex items-center justify-center gap-1 border border-[#cfc4c5] rounded-[4px] hover:bg-[#f3f3f4] transition-colors font-mono text-[11px] font-bold"
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
                  <div className="col-span-2 p-8 text-center text-[#7e7576] font-mono text-[13px] bg-white border border-dashed border-[#cfc4c5] rounded-md">
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
