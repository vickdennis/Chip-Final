import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { Eye, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function AdminOverviewView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock metrics state
  const [metrics, setMetrics] = useState({
    pageViews: 0,
    uniqueVisitors: 0,
    outboundClicks: 0,
    ctr: 0.0
  });
  
  useEffect(() => {
    fetchData();
    // Simulate fetching metrics
    setMetrics({
      pageViews: Math.floor(Math.random() * 10000) + 1500,
      uniqueVisitors: Math.floor(Math.random() * 8000) + 1000,
      outboundClicks: Math.floor(Math.random() * 5000) + 500,
      ctr: (Math.random() * 15 + 2)
    });
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: linksData } = await supabase.from('links').select('*').eq('profile_id', user.id).order('position');

      if (profileData) {
        setProfile({ ...profileData, email: user.email });
      }
      if (linksData) setLinks(linksData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContactEmail = async () => {
    if (!profile) return;
    try {
      await supabase.from('profiles').update({ email: profile.email }).eq('id', profile.id);
      alert('Email changes requested (Note: Auth email cannot be changed through this UI directly, but we can save it to profile if contact_email was available.)');
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <AdminLayout onNavigate={onNavigate} activePath="dashboard">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Zone 1: Top Navigation & Profile Status Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#e2e2e2] pb-6 gap-4">
          <div>
            <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-black tracking-tight leading-tight mb-1">
              Dashboard
            </h2>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
              <span className="font-mono text-[13px] text-[#4c4546]">Profile is Live</span>
              <span className="font-sans text-[13px] text-[#7e7576]">· Last updated [timestamp placeholder]</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('public-profile')}
              className="bg-black text-white px-5 py-2.5 rounded-sm font-mono text-[13px] font-bold hover:bg-black/90 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </button>
            <div className="w-10 h-10 rounded-full bg-[#f3f3f4] border border-[#cfc4c5] overflow-hidden flex items-center justify-center">
              <span className="font-mono text-[14px] font-bold text-black">A</span>
            </div>
          </div>
        </header>

        {/* Zone 2: KPI Summary Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Total Page Views</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-black">{metrics.pageViews.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-[#10B981] font-mono text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" /> 12% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Unique Visitors</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-black">{metrics.uniqueVisitors.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-[#10B981] font-mono text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" /> 8% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Total Outbound Clicks</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-black">{metrics.outboundClicks.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-[#ba1a1a] font-mono text-[11px] font-bold">
                <TrendingDown className="w-3 h-3" /> 2% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Average CTR</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-black">{metrics.ctr.toFixed(1)}%</div>
              <div className="flex items-center gap-1 text-[#10B981] font-mono text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" /> 1.5% vs last week
              </div>
            </div>
          </div>
        </section>

        {/* Zone 3: Analytics & Engagement Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Left */}
           <div className="bg-white border border-[#cfc4c5] rounded-sm flex flex-col">
             <div className="border-b border-[#e2e2e2] p-5 flex justify-between items-center bg-[#f9f9f9]">
               <div className="flex items-center gap-3">
                 <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">Top Performing Links</h3>
                 <span className="bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                   <RefreshCw className="w-3 h-3" /> Live Sync
                 </span>
               </div>
               <button className="text-black font-mono text-[12px] font-bold hover:underline">Reorder Links</button>
             </div>
             <div className="p-0 overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[400px]">
                 <thead>
                   <tr className="border-b border-[#e2e2e2]">
                     <th className="font-mono text-[11px] font-bold text-[#7e7576] uppercase tracking-wider py-4 px-5">Platform/Link Name</th>
                     <th className="font-mono text-[11px] font-bold text-[#7e7576] uppercase tracking-wider py-4 px-5 w-24">Clicks</th>
                     <th className="font-mono text-[11px] font-bold text-[#7e7576] uppercase tracking-wider py-4 px-5 w-24 text-right">CTR</th>
                   </tr>
                 </thead>
                 <tbody>
                   {links.length > 0 ? links.map((link, i) => (
                     <tr key={i} className="border-b border-[#e2e2e2] hover:bg-[#f9f9f9]">
                       <td className="py-4 px-5">
                         <div className="font-sans text-[14px] font-medium text-black">{link.label}</div>
                         <div className="font-mono text-[11px] text-[#7e7576] truncate max-w-[200px]">{link.url}</div>
                       </td>
                       <td className="font-mono text-[13px] text-black py-4 px-5">{Math.floor(Math.random() * 1000)}</td>
                       <td className="font-mono text-[13px] text-[#10B981] py-4 px-5 text-right font-bold">{(Math.random() * 15).toFixed(1)}%</td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={3} className="text-center font-mono text-[12px] text-[#cfc4c5] py-16 bg-[#fcfcfc]">
                         No links available
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>

           {/* Right */}
           <div className="flex flex-col gap-6">
             <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 h-[220px] flex flex-col relative overflow-hidden">
               <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest mb-4">Traffic Sources</h3>
               <div className="flex-1 flex items-center justify-center -ml-4">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={[
                       { name: 'Direct', value: 400 },
                       { name: 'Social', value: 300 },
                       { name: 'QR Code', value: 300 }
                     ]} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">
                       <Cell fill="#000000" />
                       <Cell fill="#10B981" />
                       <Cell fill="#3B82F6" />
                     </Pie>
                     <Tooltip />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="flex flex-col gap-2 ml-4">
                   <div className="flex items-center gap-2 font-mono text-[11px]"><span className="w-2 h-2 bg-black"></span>Direct</div>
                   <div className="flex items-center gap-2 font-mono text-[11px]"><span className="w-2 h-2 bg-[#10B981]"></span>Social</div>
                   <div className="flex items-center gap-2 font-mono text-[11px]"><span className="w-2 h-2 bg-[#3B82F6]"></span>QR</div>
                 </div>
               </div>
             </div>
             <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 h-[220px] flex flex-col relative overflow-hidden">
               <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest mb-4">Device Type</h3>
               <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart layout="vertical" data={[
                     { name: 'Mobile', value: 800 },
                     { name: 'Desktop', value: 200 }
                   ]} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4c4546' }} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                       <Cell fill="#000000" />
                       <Cell fill="#cfc4c5" />
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
        </section>

        {/* Zone 4: Historical Trends & Control Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Left */}
           <div className="lg:col-span-8 bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">Page Views & Clicks over Time</h3>
                 <select className="border border-[#cfc4c5] rounded-sm px-3 py-1.5 font-mono text-[12px] text-black outline-none focus:border-black bg-white cursor-pointer hover:border-[#7e7576]">
                   <option>Last 30 Days</option>
                   <option>Last 7 Days</option>
                   <option>All Time</option>
                 </select>
              </div>
              <div className="flex-1 min-h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={[
                     { date: '1', views: 400, clicks: 240 },
                     { date: '5', views: 300, clicks: 139 },
                     { date: '10', views: 200, clicks: 980 },
                     { date: '15', views: 278, clicks: 390 },
                     { date: '20', views: 189, clicks: 480 },
                     { date: '25', views: 239, clicks: 380 },
                     { date: '30', views: 349, clicks: 430 }
                   ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e7576' }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#7e7576' }} dx={-10} />
                     <Tooltip contentStyle={{ borderRadius: '2px', borderColor: '#cfc4c5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                     <Line type="monotone" dataKey="views" stroke="#000000" strokeWidth={2} dot={{ r: 4, fill: '#000000' }} activeDot={{ r: 6 }} />
                     <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981' }} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Right: Quick Settings */}
           <div className="lg:col-span-4 bg-white border border-[#cfc4c5] rounded-sm flex flex-col h-full">
              <div className="border-b border-[#e2e2e2] p-5 bg-[#f9f9f9]">
                 <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest">Page Controls</h3>
              </div>
              <div className="p-6 flex flex-col gap-6 flex-1">
                 <div className="space-y-2">
                   <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">"Connect with" Email</label>
                   <input 
                     type="email" 
                     value={profile?.email || ''}
                     onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                     placeholder="Connect Email" 
                     className="w-full px-4 py-2.5 bg-white border border-[#cfc4c5] rounded-sm focus:border-black outline-none transition-shadow font-sans text-[14px] text-black" 
                   />
                 </div>
                 <div className="space-y-3">
                   <label className="block font-mono text-[11px] font-bold text-[#4c4546] uppercase tracking-widest">Accent Color</label>
                   <div className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-black ring-2 ring-offset-2 ring-black cursor-pointer shadow-sm"></div>
                     <div className="w-8 h-8 rounded-full bg-[#10B981] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                     <div className="w-8 h-8 rounded-full bg-[#3B82F6] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                     <div className="w-8 h-8 rounded-full bg-[#ba1a1a] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                     <div className="w-8 h-8 rounded-full bg-[#F59E0B] cursor-pointer hover:scale-110 transition-transform shadow-sm"></div>
                   </div>
                 </div>
                 <div className="mt-auto pt-8 flex flex-col sm:flex-row items-center justify-between border-t border-[#e2e2e2] gap-4">
                   <button className="text-[#ba1a1a] font-mono text-[12px] font-bold hover:underline transition-all">Reset to Default</button>
                   <button 
                     onClick={handleSaveContactEmail}
                     className="bg-black text-white px-5 py-2.5 rounded-sm font-mono text-[13px] font-bold hover:bg-black/90 transition-colors w-full sm:w-auto"
                   >
                     Save Changes
                   </button>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </AdminLayout>
  );
}
