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
        
        // Update user profile to link to enterprise using the new user's session
        await adminAuthClient.from('profiles').update({
          enterprise_id: enterprise.id,
          username: employeeForm.username || undefined,
          headline: employeeForm.headline || undefined,
          bio: employeeForm.bio || undefined
        }).eq('id', data.user.id);
        await adminAuthClient.auth.signOut();
        
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
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] flex items-center justify-center font-bold text-xs uppercase tracking-wider text-neutral-400">
        Loading Enterprise Fleet...
      </div>
    );
  }

  if (!enterprise) {
    // Upsell state
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white selection:bg-[#D2F843] selection:text-neutral-950 font-sans flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111318] max-w-xl w-full p-8 sm:p-10 rounded-3xl shadow-sm border border-neutral-200/80 dark:border-white/10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D2F843]/15 text-neutral-950 dark:text-[#D2F843] flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Enterprise Organization Fleet</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
            Centralize your corporate networking. Issue NFC cards, manage employee bio links under one billing account, enforce corporate brand guidelines, and track aggregate tap analytics.
          </p>
          
          <div className="bg-neutral-50/70 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/5 rounded-2xl p-5 text-left mb-8 space-y-3">
            <div className="flex items-center gap-2.5"><Check className="w-5 h-5 text-[#16a34a] dark:text-[#D2F843]" /> <span className="text-sm font-medium">20+ NFC Cards & Bio Seats included</span></div>
            <div className="flex items-center gap-2.5"><Check className="w-5 h-5 text-[#16a34a] dark:text-[#D2F843]" /> <span className="text-sm font-medium">Centralized Brand & Logo Control</span></div>
            <div className="flex items-center gap-2.5"><Check className="w-5 h-5 text-[#16a34a] dark:text-[#D2F843]" /> <span className="text-sm font-medium">Team-wide Tap Telemetry & Conversion Tracking</span></div>
            <div className="flex items-center gap-2.5"><Check className="w-5 h-5 text-[#16a34a] dark:text-[#D2F843]" /> <span className="text-sm font-medium">Single Consolidated Monthly Invoice in ₦</span></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => onNavigate('user-dashboard')} 
              className="flex-1 py-3.5 border border-neutral-200/80 dark:border-white/10 text-neutral-900 dark:text-white rounded-full text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-all"
            >
              Back to Personal
            </button>
            <PaystackButton
              reference={`ENT_${Math.random().toString(36).substring(2, 10).toUpperCase()}`}
              email={profile?.contact_email || profile?.email || 'admin@example.com'}
              amount={99000 * 100}
              publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
              text="Subscribe (₦99,000/mo)"
              onSuccess={handleCreateEnterpriseSuccess}
              className="flex-1 py-3.5 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  }

  // Dashboard state
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0B0E] text-neutral-900 dark:text-white font-sans selection:bg-[#D2F843] selection:text-neutral-950 transition-colors pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/85 dark:bg-[#0A0B0E]/85 backdrop-blur-md border-b border-neutral-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center font-bold text-sm shadow-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#D2F843] mr-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-950 dark:text-white tracking-tight">{enterprise.name}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#D2F843] text-neutral-950">Enterprise Fleet</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('user-dashboard')} 
              className="px-4 py-2 rounded-full border border-neutral-200/80 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4"/> Back to Personal Console
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide pb-2 md:pb-0">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart },
              { id: 'employees', label: 'Team Directory', icon: Users },
              { id: 'branding', label: 'Brand Center', icon: Palette },
              { id: 'billing', label: 'Billing & Seats', icon: CreditCard },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-3 px-4 py-3 text-left w-auto md:w-full shrink-0 md:shrink text-xs font-bold rounded-2xl transition-all ${activeTab === item.id ? 'bg-[#D2F843] text-neutral-950 shadow-sm' : 'hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">Enterprise Overview</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Real-time team engagement and NFC tap telemetry</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Allocated Seats</div>
                  <div className="text-4xl font-extrabold text-neutral-950 dark:text-white">{employees.length}<span className="text-lg font-bold text-neutral-400">/{enterprise.total_seats}</span></div>
                </div>
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Network Profile Views</div>
                  <div className="text-4xl font-extrabold text-neutral-950 dark:text-white flex items-center gap-2">
                    {networkViews} <Activity className="w-6 h-6 text-[#16a34a] dark:text-[#D2F843]" />
                  </div>
                </div>
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 p-6 rounded-3xl shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Average Tap CTR</div>
                  <div className="text-4xl font-extrabold text-neutral-950 dark:text-white">12.4%</div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-base text-neutral-950 dark:text-white mb-6">Weekly Engagement Growth</h3>
                <div className="h-48 flex items-end gap-3 text-neutral-400 text-xs">
                  {[4, 12, 8, 15, 20, 18, 25].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                       <div className="w-full bg-[#D2F843]/20 hover:bg-[#D2F843] rounded-t-xl transition-all" style={{ height: `${(val/25)*100}%` }}></div>
                       <span className="font-medium text-[11px]">Day {i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                 <div>
                   <h2 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">Team Directory</h2>
                   <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Centrally provision and manage employee bio cards & cards.</p>
                 </div>
                 <button 
                   onClick={() => setIsCreatingEmployee(true)}
                   className="bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                 >
                   <Plus className="w-4 h-4" /> Add Team Member
                 </button>
              </div>

              {(isCreatingEmployee || editingEmployee) && (
                <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-base text-neutral-950 dark:text-white">{editingEmployee ? `Edit Employee: ${editingEmployee.full_name}` : 'Provision New Employee Account'}</h3>
                    <button onClick={() => { setIsCreatingEmployee(false); setEditingEmployee(null); setEmployeeForm({ email: '', password: '', full_name: '', headline: '', bio: '', username: '' }); }} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white"><X className="w-5 h-5"/></button>
                  </div>
                  
                  <form onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} className="space-y-4">
                    {!editingEmployee && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Email</label>
                          <input required type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Temporary Password</label>
                          <input required type="password" value={employeeForm.password} onChange={e => setEmployeeForm({...employeeForm, password: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Full Name</label>
                        <input required type="text" value={employeeForm.full_name} onChange={e => setEmployeeForm({...employeeForm, full_name: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Username (Bio URL slug)</label>
                        <input type="text" value={employeeForm.username} onChange={e => setEmployeeForm({...employeeForm, username: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Headline / Department</label>
                      <input type="text" value={employeeForm.headline} onChange={e => setEmployeeForm({...employeeForm, headline: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Bio</label>
                      <textarea rows={3} value={employeeForm.bio} onChange={e => setEmployeeForm({...employeeForm, bio: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm resize-none" />
                    </div>
                    <button type="submit" className="bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider w-full shadow-sm transition-all cursor-pointer">
                      {editingEmployee ? 'Save Changes' : 'Create Employee Profile'}
                    </button>
                  </form>
                </div>
              )}

              <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200/80 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02]">
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Name</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Role</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">Public Link</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-neutral-100 dark:border-white/5 last:border-0 hover:bg-neutral-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-neutral-950 dark:text-white">{emp.full_name}</td>
                        <td className="p-4 text-neutral-500 dark:text-neutral-400">{emp.headline || '-'}</td>
                        <td className="p-4">
                          {emp.username ? (
                            <a href={`/${emp.username}`} target="_blank" rel="noreferrer" className="text-[#0066cc] dark:text-[#58a6ff] hover:underline font-medium">/{emp.username}</a>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setEditingEmployee(emp);
                                setEmployeeForm({
                                  email: '', password: '', full_name: emp.full_name || '', headline: emp.headline || '', bio: emp.bio || '', username: emp.username || ''
                                });
                              }}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-neutral-200/80 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                            >
                              Edit
                            </button>
                            <button onClick={() => handleDeleteEmployee(emp.id)} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-neutral-400 text-sm">No employees added yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                 <h2 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">Corporate Brand Center</h2>
                 <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Settings here will reflect globally across all employee profiles.</p>
              </div>

              <form onSubmit={handleSaveBranding} className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Company Name</label>
                  <input required type="text" value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">Company Logo URL</label>
                  <input type="text" placeholder="https://..." value={brandForm.logo_url} onChange={e => setBrandForm({...brandForm, logo_url: e.target.value})} className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Corporate Color</label>
                    <div className="flex gap-3 items-center">
                       <input type="color" value={brandForm.brand_color} onChange={e => setBrandForm({...brandForm, brand_color: e.target.value})} className="w-10 h-10 border-0 p-0 rounded-xl cursor-pointer" />
                       <span className="text-xs font-bold uppercase tracking-wider">{brandForm.brand_color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Typography</label>
                    <select 
                      value={brandForm.brand_font} 
                      onChange={e => setBrandForm({...brandForm, brand_font: e.target.value})}
                      className="w-full px-4 py-2.5 border border-neutral-200/80 dark:border-white/10 rounded-xl bg-neutral-50 dark:bg-[#151821] text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-[#D2F843]/50 text-sm"
                    >
                      <option value="sans">Inter (Modern Clean)</option>
                      <option value="mono">JetBrains Mono</option>
                      <option value="serif">Editorial Serif</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider w-full shadow-sm transition-all cursor-pointer">
                  Enforce Brand Guidelines
                </button>
              </form>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6 max-w-xl">
              <div>
                 <h2 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">Billing & Seats</h2>
                 <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Manage corporate enterprise license and team seats.</p>
              </div>

              <div className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                 <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-6">
                   <div>
                     <div className="font-bold text-lg mb-0.5">Enterprise Fleet Tier</div>
                     <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase">Billed Monthly (₦99,000.00)</div>
                   </div>
                   <span className="px-3 py-1 bg-[#D2F843] text-neutral-950 text-xs font-bold rounded-full">Active</span>
                 </div>

                 <div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-semibold text-xs">Seat Allocation</span>
                     <span className="text-xs font-bold text-neutral-500">{employees.length} / {enterprise.total_seats} Assigned</span>
                   </div>
                   <div className="h-2 w-full bg-neutral-100 dark:bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-[#D2F843]" style={{ width: `${(employees.length / enterprise.total_seats) * 100}%`}}></div>
                   </div>
                 </div>

                 <div className="pt-2">
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
                     className="w-full py-3 bg-[#D2F843] hover:bg-[#c4eb32] text-neutral-950 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
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
