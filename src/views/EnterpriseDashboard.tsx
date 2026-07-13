import React, { useState, useEffect } from 'react';
import { supabase, adminAuthClient } from '../supabaseClient';
import { ViewState } from '../App';
import { 
  Building2, Users, CreditCard, Palette, BarChart, 
  Settings, LogOut, ArrowLeft, Plus, Check, Trash2, X, Activity, Eye, MousePointerClick
} from 'lucide-react';
import { PaystackButton } from 'react-paystack';

export default function EnterpriseDashboard({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {
  const [loading, setLoading] = useState(true);
  const [enterprise, setEnterprise] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [networkViews, setNetworkViews] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'branding' | 'billing'>('overview');
  
  // Create / Edit Employee State
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employeeForm, setEmployeeForm] = useState({
    email: '', password: '', full_name: '', headline: '', bio: '', username: ''
  });

  // Branding State
  const [brandForm, setBrandForm] = useState({
    name: '', brand_color: '#000000', logo_url: '', brand_font: 'sans'
  });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchEnterpriseData();
  }, []);

  const fetchEnterpriseData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      onNavigate('login');
      return;
    }

    const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (userProfile) setProfile(userProfile);
    
    if (userProfile && userProfile.enterprise_id) {
      const { data: ent } = await supabase.from('enterprises').select('*').eq('id', userProfile.enterprise_id).single();
      if (ent) {
        if (ent.owner_id !== user.id) {
          alert("You belong to an enterprise, but you are not the owner. Access denied to Enterprise Dashboard.");
          onNavigate('user-dashboard');
          return;
        }
        setEnterprise(ent);
        setBrandForm({
          name: ent.name || '',
          brand_color: ent.brand_color || '#000000',
          logo_url: ent.logo_url || '',
          brand_font: ent.brand_font || 'sans'
        });
        
        // Fetch employees
        const { data: emps } = await supabase.from('profiles').select('*').eq('enterprise_id', ent.id);
        if (emps) {
          setEmployees(emps);
          // Fetch analytics for employees
          const empIds = emps.map(e => e.id);
          if (empIds.length > 0) {
            const { data: viewsData, error: viewErr } = await supabase.from('profile_views').select('id', { count: 'exact' }).in('profile_id', empIds);
            if (!viewErr && viewsData) {
               setNetworkViews(viewsData.length || 0);
            }
          }
        }
      }
    }
    setLoading(false);
  };

  const handleCreateEnterpriseSuccess = async (response: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newEntName = prompt("Payment successful! Enter your company name:");
    if (!newEntName) return;

    try {
      // Create enterprise
      const { data: newEnt, error: entError } = await supabase.from('enterprises').insert({
        name: newEntName,
        owner_id: user.id,
        total_seats: 20
      }).select().single();

      if (entError) throw entError;

      // Update current profile
      await supabase.from('profiles').update({
        enterprise_id: newEnt.id,
        is_enterprise_owner: true
      }).eq('id', user.id);

      fetchEnterpriseData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterprise) return;

    try {
      const { error } = await supabase.from('enterprises').update({
        name: brandForm.name,
        brand_color: brandForm.brand_color,
        logo_url: brandForm.logo_url,
        brand_font: brandForm.brand_font
      }).eq('id', enterprise.id);

      if (error) throw error;
      alert("Brand settings updated successfully! Employee profiles will now inherit these guidelines where applicable.");
      fetchEnterpriseData();
    } catch (err: any) {
      alert("Error saving branding: " + err.message);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (employees.length >= (enterprise?.total_seats || 20)) {
      alert("You have reached your seat limit. Update billing to add more seats.");
      return;
    }

    try {
      // Create via adminAuthClient to avoid logging out the enterprise owner
      const { data, error } = await adminAuthClient.auth.signUp({
        email: employeeForm.email,
        password: employeeForm.password,
        options: {
          data: {
            full_name: employeeForm.full_name
          }
        }
      });
      if (error) {
        if (error.message && error.message.toLowerCase().includes('rate limit')) {
          alert('Sign up error: email rate limit exceeded. Please try again later.');
        } else {
          alert("Sign up error: " + error.message);
        }
      } else if (data.user) {
        // Wait for profile trigger to complete
        await new Promise(r => setTimeout(r, 1000));
        
        // Update user profile to link to enterprise
        await supabase.from('profiles').update({
          enterprise_id: enterprise.id,
          username: employeeForm.username || undefined,
          headline: employeeForm.headline || undefined,
          bio: employeeForm.bio || undefined
        }).eq('id', data.user.id);
        
        alert(`Employee ${employeeForm.full_name} created successfully!`);
        setIsCreatingEmployee(false);
        setEmployeeForm({ email: '', password: '', full_name: '', headline: '', bio: '', username: '' });
        fetchEnterpriseData();
      }
    } catch (err: any) {
      alert("Error creating employee: " + err.message);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      const { error } = await supabase.from('profiles').update({
        full_name: employeeForm.full_name,
        username: employeeForm.username,
        headline: employeeForm.headline,
        bio: employeeForm.bio
      }).eq('id', editingEmployee.id);
      
      if (error) throw error;
      
      alert("Employee updated successfully!");
      setEditingEmployee(null);
      setEmployeeForm({ email: '', password: '', full_name: '', headline: '', bio: '', username: '' });
      fetchEnterpriseData();
    } catch (err: any) {
      alert("Error updating employee: " + err.message);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Remove this employee from the enterprise? They will still have an account but won't be linked to your brand.")) return;
    try {
       await supabase.from('profiles').update({
         enterprise_id: null
       }).eq('id', id);
       fetchEnterpriseData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#f3f3f4] dark:bg-[#0a0a0a] flex items-center justify-center font-mono text-sm">Loading Enterprise...</div>;
  }

  if (!enterprise) {
    // Upsell state
    return (
      <div className="min-h-screen bg-[#f3f3f4] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl max-w-xl w-full p-8 rounded-xl shadow-xl border border-black/10 dark:border-white/10 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6 text-black dark:text-white" />
          <h1 className="text-3xl font-sans font-bold tracking-tight mb-4">Enterprise Edition</h1>
          <p className="text-black/60 dark:text-white/60 mb-8 leading-relaxed font-sans text-[15px]">
            Centralize your company's network. Manage employee bio links under one billing account, enforce corporate brand guidelines, and track aggregate networking analytics.
          </p>
          
          <div className="bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl p-4 text-left mb-8 space-y-3">
            <div className="flex items-center gap-2"><Check className="w-5 h-5" /> <span className="font-sans text-[14px]">20+ Seats included</span></div>
            <div className="flex items-center gap-2"><Check className="w-5 h-5" /> <span className="font-sans text-[14px]">Centralized Brand Identity Center</span></div>
            <div className="flex items-center gap-2"><Check className="w-5 h-5" /> <span className="font-sans text-[14px]">Team-wide Analytics & Conversion Tracking</span></div>
            <div className="flex items-center gap-2"><Check className="w-5 h-5" /> <span className="font-sans text-[14px]">Single Billing Invoice</span></div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => onNavigate('user-dashboard')} className="flex-1 py-3 border border-black dark:border-white font-mono text-[13px] font-bold uppercase transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black">
              Go Back
            </button>
            <PaystackButton
              reference={`ENT_${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
              email={profile?.contact_email || profile?.email || 'user@example.com'}
              amount={99000 * 100}
              publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
              text="Buy Now (₦99,000/mo)"
              onSuccess={handleCreateEnterpriseSuccess}
              className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black font-mono text-[13px] font-bold uppercase transition-transform hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard state
  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#0a0a0a] text-black dark:text-white font-sans selection:bg-black selection:text-black dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/10 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5" />
            <h1 className="font-sans font-bold tracking-tight text-[16px]">{enterprise.name} <span className="font-mono font-normal text-black/40 dark:text-white/40 text-xs ml-2 tracking-widest uppercase">Enterprise</span></h1>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] font-bold uppercase tracking-widest">
            <button onClick={() => onNavigate('user-dashboard')} className="hover:opacity-70 transition-opacity flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> User Dashboard</button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide [&::-webkit-scrollbar]:hidden pb-2 md:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'branding', label: 'Brand Center', icon: Palette },
              { id: 'billing', label: 'Billing', icon: CreditCard },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 text-left w-auto md:w-full shrink-0 md:shrink font-mono text-[12px] uppercase font-bold tracking-widest rounded-xl transition-colors ${activeTab === item.id ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-[#f3f3f4] dark:hover:bg-[#111] text-black/60 dark:text-white/60'}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-sans font-bold tracking-tight">Enterprise Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 rounded-xl">
                  <div className="text-black/40 dark:text-white/40 font-mono text-[11px] font-bold uppercase tracking-widest mb-4">Total Seats</div>
                  <div className="text-5xl font-sans font-bold">{employees.length}<span className="text-xl text-black/40 dark:text-white/40">/{enterprise.total_seats}</span></div>
                </div>
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 rounded-xl">
                  <div className="text-black/40 dark:text-white/40 font-mono text-[11px] font-bold uppercase tracking-widest mb-4">Network Views</div>
                  <div className="text-5xl font-sans font-bold flex items-center gap-2">
                    {networkViews} <Activity className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-6 rounded-xl">
                  <div className="text-black/40 dark:text-white/40 font-mono text-[11px] font-bold uppercase tracking-widest mb-4">Avg CTR</div>
                  <div className="text-5xl font-sans font-bold">12.4%</div>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl p-6">
                <h3 className="font-sans font-bold text-lg mb-6">Recent Employee Growth</h3>
                <div className="h-48 flex items-end gap-2 text-black/40 dark:text-white/40 font-mono text-[10px]">
                  {/* Mock Chart */}
                  {[4, 12, 8, 15, 20, 18, 25].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                       <div className="w-full bg-black/10 dark:bg-black/10 dark:bg-white/10 rounded-t-sm transition-all hover:bg-black dark:hover:bg-white" style={{ height: `${(val/25)*100}%` }}></div>
                       <span>Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-end">
                 <div>
                   <h2 className="text-3xl font-sans font-bold tracking-tight mb-2">Team Directory</h2>
                   <p className="text-black/40 dark:text-white/40 font-mono text-[12px]">Manage user accounts & bios centrally.</p>
                 </div>
                 <button 
                   onClick={() => setIsCreatingEmployee(true)}
                   className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl font-mono text-[12px] font-bold uppercase px-6 flex items-center gap-2 hover:opacity-80 transition-opacity"
                 >
                   <Plus className="w-4 h-4" /> Add Employee
                 </button>
              </div>

              {(isCreatingEmployee || editingEmployee) && (
                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-sans font-bold text-xl">{editingEmployee ? `Edit Employee: ${editingEmployee.full_name}` : 'Create New Employee Account'}</h3>
                    <button onClick={() => { setIsCreatingEmployee(false); setEditingEmployee(null); setEmployeeForm({ email: '', password: '', full_name: '', headline: '', bio: '', username: '' }); }} className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-black dark:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-4">
                    {!editingEmployee && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Email</label>
                          <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                        </div>
                        <div>
                          <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Temporary Password</label>
                          <input required type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Full Name</label>
                        <input required type="text" value={employeeForm.full_name} onChange={e => setEmployeeForm({...employeeForm, full_name: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                      </div>
                      <div>
                        <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Username (URL slug)</label>
                        <input type="text" value={employeeForm.username} onChange={e => setEmployeeForm({...employeeForm, username: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Headline</label>
                      <input type="text" value={employeeForm.headline} onChange={e => setEmployeeForm({...employeeForm, headline: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Bio</label>
                      <textarea rows={3} value={employeeForm.bio} onChange={e => setEmployeeForm({...employeeForm, bio: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                    </div>
                    <button type="submit" className="bg-black text-black dark:text-white px-6 py-2 rounded-xl font-mono text-[12px] font-bold uppercase w-full">
                      {editingEmployee ? 'Save Changes' : 'Create Employee Profile'}
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                      <th className="p-4 font-mono text-[11px] font-bold uppercase text-black/40 dark:text-white/40">Name</th>
                      <th className="p-4 font-mono text-[11px] font-bold uppercase text-black/40 dark:text-white/40">Role</th>
                      <th className="p-4 font-mono text-[11px] font-bold uppercase text-black/40 dark:text-white/40">Link</th>
                      <th className="p-4 font-mono text-[11px] font-bold uppercase text-black/40 dark:text-white/40">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-black/10 dark:border-white/10 last:border-0 hover:bg-[#f3f3f4] dark:hover:bg-[#1a1a1a]">
                        <td className="p-4 font-sans text-[14px] font-medium">{emp.full_name}</td>
                        <td className="p-4 font-sans text-[14px] text-black/40 dark:text-white/40">{emp.headline || '-'}</td>
                        <td className="p-4 font-mono text-[12px]">
                          {emp.username ? (
                            <a href={`/${emp.username}`} target="_blank" rel="noreferrer" className="text-black dark:text-white hover:underline">/ {emp.username}</a>
                          ) : '-'}
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <button 
                            onClick={() => {
                              setEditingEmployee(emp);
                              setEmployeeForm({
                                email: '', password: '', full_name: emp.full_name || '', headline: emp.headline || '', bio: emp.bio || '', username: emp.username || ''
                              });
                            }}
                            className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-black dark:text-white transition-colors"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteEmployee(emp.id)} className="text-black/40 dark:text-white/40 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-black/40 dark:text-white/40 font-mono text-sm">No employees added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl">
              <div>
                 <h2 className="text-3xl font-sans font-bold tracking-tight mb-2">Corporate Brand Center</h2>
                 <p className="text-black/40 dark:text-white/40 font-mono text-[12px]">Settings here will reflect globally across all employee profiles.</p>
              </div>

              <form onSubmit={handleSaveBranding} className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl p-6 space-y-6">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Company Name</label>
                  <input required type="text" value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white text-[14px]" />
                </div>
                
                <div>
                  <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Company Logo URL</label>
                  <input type="text" placeholder="https://..." value={brandForm.logo_url} onChange={e => setBrandForm({...brandForm, logo_url: e.target.value})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white font-mono text-[12px]" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Brand Color</label>
                    <div className="flex gap-3 items-center">
                       <input type="color" value={brandForm.brand_color} onChange={e => setBrandForm({...brandForm, brand_color: e.target.value})} className="w-10 h-10 border-0 p-0 rounded-xl cursor-pointer" />
                       <span className="font-mono text-sm uppercase">{brandForm.brand_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-2">Global Typography</label>
                    <select 
                      value={brandForm.brand_font} 
                      onChange={e => setBrandForm({...brandForm, brand_font: e.target.value})}
                      className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-xl bg-transparent outline-none focus:border-black dark:focus:border-white font-sans text-[14px]"
                    >
                      <option value="sans">Inter (Sans-Serif)</option>
                      <option value="mono">JetBrains Mono</option>
                      <option value="serif">Playfair Display</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="bg-black text-black dark:text-white px-6 py-3 rounded-xl font-mono text-[12px] font-bold uppercase w-full hover:bg-opacity-90">
                  Enforce Brand Guidelines
                </button>
              </form>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl">
              <div>
                 <h2 className="text-3xl font-sans font-bold tracking-tight mb-2">Billing & Seats</h2>
                 <p className="text-black/40 dark:text-white/40 font-mono text-[12px]">Manage your enterprise subscription.</p>
              </div>

              <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl p-6 space-y-6">
                 <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-6">
                   <div>
                     <div className="font-sans font-bold text-xl mb-1">Enterprise Tier</div>
                     <div className="font-mono text-[12px] text-black/40 dark:text-white/40 uppercase">Billed Monthly (₦99,000.00)</div>
                   </div>
                   <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-mono text-[10px] font-bold uppercase rounded-xl">Active</span>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-sans font-medium text-sm">Seat Allocation</span>
                     <span className="font-mono text-xs">{employees.length} / {enterprise.total_seats} Used</span>
                   </div>
                   <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-black dark:bg-white" style={{ width: `${(employees.length / enterprise.total_seats) * 100}%`}}></div>
                   </div>
                 </div>

                 <div className="pt-4">
                   <PaystackButton
                     reference={`SEAT_${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
                     email={profile?.contact_email || profile?.email || 'user@example.com'}
                     amount={25000 * 100}
                     publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                     text="Purchase Additional Seats (₦25,000 / 10 seats)"
                     onSuccess={async () => {
                        const { error } = await supabase.from('enterprises').update({
                           total_seats: enterprise.total_seats + 10
                        }).eq('id', enterprise.id);
                        if (!error) {
                           alert('Seats added successfully!');
                           fetchEnterpriseData();
                        } else {
                           alert('Failed to add seats. Contact support.');
                        }
                     }}
                     className="w-full py-2 border border-black dark:border-white font-mono text-[12px] font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                   />
                 </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
