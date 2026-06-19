import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { Eye, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function AdminOverviewView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [connectEmail, setConnectEmail] = useState('');
  
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
              <div className="font-display text-[32px] font-extrabold text-[#cfc4c5]">[Data Placeholder]</div>
              <div className="flex items-center gap-1 text-[#10B981] font-mono text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" /> [X]% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Unique Visitors</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-[#cfc4c5]">[Data Placeholder]</div>
              <div className="flex items-center gap-1 text-[#10B981] font-mono text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" /> [X]% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Total Outbound Clicks</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-[#cfc4c5]">[Data Placeholder]</div>
              <div className="flex items-center gap-1 text-[#ba1a1a] font-mono text-[11px] font-bold">
                <TrendingDown className="w-3 h-3" /> [X]% vs last week
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-36">
            <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Average CTR</h3>
            <div className="flex flex-col gap-1">
              <div className="font-display text-[32px] font-extrabold text-[#cfc4c5]">[Data Placeholder]</div>
              <div className="flex items-center gap-1 text-[#10B981] font-mono text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" /> [X]% vs last week
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
                   <tr>
                     <td colSpan={3} className="text-center font-mono text-[12px] text-[#cfc4c5] py-16 bg-[#fcfcfc]">
                       [Ordered Link Data Placeholder]
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
           </div>

           {/* Right */}
           <div className="flex flex-col gap-6">
             <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 h-[220px] flex flex-col relative overflow-hidden">
               <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest mb-4">Traffic Sources (Direct, Social, QR Code, etc.)</h3>
               <div className="flex-1 border-2 border-dashed border-[#e2e2e2] rounded-sm flex items-center justify-center font-mono text-[12px] text-[#cfc4c5] bg-[#f9f9f9]">
                 [Empty Pie/Donut Chart Skeleton]
               </div>
             </div>
             <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 h-[220px] flex flex-col relative overflow-hidden">
               <h3 className="font-mono text-[13px] font-bold text-black uppercase tracking-widest mb-4">Device Type (Mobile vs. Desktop)</h3>
               <div className="flex-1 border-2 border-dashed border-[#e2e2e2] rounded-sm flex items-center justify-center font-mono text-[12px] text-[#cfc4c5] bg-[#f9f9f9]">
                 [Empty Horizontal Bar Chart Skeleton]
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
                   <option>[Last 30 Days]</option>
                   <option>[Last 7 Days]</option>
                   <option>[All Time]</option>
                 </select>
              </div>
              <div className="flex-1 min-h-[300px] border-l-2 border-b-2 border-solid border-[#cfc4c5] relative flex items-center justify-center font-mono text-[12px] text-[#cfc4c5] ml-10 mb-8 pb-4 pl-4 bg-[#fcfcfc]">
                 {/* Chart axes labels */}
                 <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#7e7576] py-2">
                   <span>[Max]</span>
                   <span className="-rotate-90 origin-left transform -translate-y-4">Count</span>
                   <span>0</span>
                 </div>
                 <div className="absolute left-0 -bottom-8 right-0 flex justify-between text-[10px] text-[#7e7576] px-2">
                   <span>[Start Date]</span>
                   <span>Time</span>
                   <span>[End Date]</span>
                 </div>
                 [Empty Line Chart Skeleton]
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
                     value={connectEmail}
                     onChange={(e) => setConnectEmail(e.target.value)}
                     placeholder="[Email Placeholder]" 
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
                   <button className="bg-black text-white px-5 py-2.5 rounded-sm font-mono text-[13px] font-bold hover:bg-black/90 transition-colors w-full sm:w-auto">
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
