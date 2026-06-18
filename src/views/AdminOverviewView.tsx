import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { ViewState } from '../App';
import { MemoryStick, Zap, Users as UsersIcon, Filter, MoreVertical, ArrowRight } from 'lucide-react';

export default function AdminOverviewView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  return (
    <AdminLayout onNavigate={onNavigate} activePath="dashboard">
      <div className="max-w-6xl mx-auto space-y-12 pb-12">
        <header className="flex justify-between items-end border-b border-[#e2e2e2] pb-6">
          <div>
            <h2 className="font-display text-[32px] md:text-[40px] font-extrabold text-black tracking-tight leading-tight mb-1">
              System Health
            </h2>
            <p className="text-[16px] text-[#4c4546]">Real-time metrics and administration overview.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-[pulse_2s_ease-in-out_infinite]"></span>
            <span className="font-mono text-[12px] font-medium text-[#4c4546]">All Systems Operational</span>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-black transition-colors">
            <div className="flex justify-between items-start">
              <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">CPU Usage</h3>
              <MemoryStick className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-display text-[40px] font-extrabold text-black flex items-baseline gap-1">
                42<span className="font-sans text-[18px] font-normal text-[#4c4546]">%</span>
              </div>
              <p className="font-mono text-[11px] text-[#7e7576] mt-1 font-medium">+2.4% from last hour</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-12 bg-[#f3f3f4] opacity-50 flex items-end px-2 pb-2">
              <div className="h-1/2 w-1/5 bg-black opacity-20 mx-0.5 rounded-t-sm"></div>
              <div className="h-3/4 w-1/5 bg-black opacity-20 mx-0.5 rounded-t-sm"></div>
              <div className="h-1/4 w-1/5 bg-black opacity-20 mx-0.5 rounded-t-sm"></div>
              <div className="h-1/2 w-1/5 bg-black opacity-20 mx-0.5 rounded-t-sm"></div>
              <div className="h-full w-1/5 bg-black opacity-20 mx-0.5 rounded-t-sm"></div>
            </div>
          </div>

          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-48 hover:border-black transition-colors">
            <div className="flex justify-between items-start">
              <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">API Latency</h3>
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-display text-[40px] font-extrabold text-black flex items-baseline gap-1">
                124<span className="font-sans text-[18px] font-normal text-[#4c4546]">ms</span>
              </div>
              <p className="font-mono text-[11px] text-[#7e7576] mt-1 font-medium">p95 global average</p>
            </div>
          </div>

          <div className="bg-white border border-[#cfc4c5] rounded-sm p-6 flex flex-col justify-between h-48 hover:border-black transition-colors">
            <div className="flex justify-between items-start">
              <h3 className="font-mono text-[12px] font-bold text-[#4c4546] uppercase tracking-widest">Active Sessions</h3>
              <UsersIcon className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-display text-[40px] font-extrabold text-black flex items-baseline gap-1">
                8,492
              </div>
              <p className="font-mono text-[11px] text-[#7e7576] mt-1 font-medium">Across 12 regions</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-[24px] font-bold text-black tracking-tight">User Directory</h3>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Search ID or Name" 
                className="bg-white font-mono text-[13px] text-[#1a1c1c] border border-[#cfc4c5] rounded-sm px-3 py-1.5 focus:outline-none focus:border-black w-48 transition-colors"
              />
              <button className="bg-white border border-[#cfc4c5] px-3 py-1.5 rounded-sm flex items-center gap-2 font-mono text-[13px] font-medium hover:bg-[#f3f3f4] transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto border border-[#e2e2e2] rounded-sm bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e2e2] bg-[#f9f9f9]">
                  <th className="font-mono text-[12px] font-semibold text-[#4c4546] uppercase tracking-wider py-3 px-6">User / Entity</th>
                  <th className="font-mono text-[12px] font-semibold text-[#4c4546] uppercase tracking-wider py-3 px-6">Status</th>
                  <th className="font-mono text-[12px] font-semibold text-[#4c4546] uppercase tracking-wider py-3 px-6">Role</th>
                  <th className="font-mono text-[12px] font-semibold text-[#4c4546] uppercase tracking-wider py-3 px-6">Last Login</th>
                  <th className="font-mono text-[12px] font-semibold text-[#4c4546] uppercase tracking-wider py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                <tr className="border-b border-[#e2e2e2] hover:bg-[#f9f9f9] transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#e8e8e8] border border-[#cfc4c5] flex items-center justify-center font-mono text-[12px] font-bold text-black">AD</div>
                      <div>
                        <div className="font-medium text-black">Alice Doe</div>
                        <div className="font-mono text-[11px] text-[#7e7576]">alice.d@chip.ng</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="inline-block bg-black text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">Active</span>
                  </td>
                  <td className="py-3 px-6 font-mono text-[13px] text-[#4c4546]">Superadmin</td>
                  <td className="py-3 px-6 font-mono text-[13px] text-[#4c4546]">Just now</td>
                  <td className="py-3 px-6 text-right">
                    <button className="p-1 hover:bg-[#e8e8e8] rounded-sm text-[#4c4546] transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-[#e2e2e2] hover:bg-[#f9f9f9] transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#e8e8e8] border border-[#cfc4c5] flex items-center justify-center font-mono text-[12px] font-bold text-black">BR</div>
                      <div>
                        <div className="font-medium text-black">Bob Rover</div>
                        <div className="font-mono text-[11px] text-[#7e7576]">brover@client.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="inline-block bg-[#e2e2e2] border border-[#cfc4c5] text-black font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">Offline</span>
                  </td>
                  <td className="py-3 px-6 font-mono text-[13px] text-[#4c4546]">Analyst</td>
                  <td className="py-3 px-6 font-mono text-[13px] text-[#4c4546]">2 hours ago</td>
                  <td className="py-3 px-6 text-right">
                    <button className="p-1 hover:bg-[#e8e8e8] rounded-sm text-[#4c4546] transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-[#f9f9f9] transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[#ffdad6] border border-[#ba1a1a]/30 flex items-center justify-center font-mono text-[12px] font-bold text-[#ba1a1a]">CX</div>
                      <div>
                        <div className="font-medium text-black">Charlie X.</div>
                        <div className="font-mono text-[11px] text-[#7e7576]">charlie@external.io</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className="inline-block bg-[#ffdad6] text-[#ba1a1a] font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider">Suspended</span>
                  </td>
                  <td className="py-3 px-6 font-mono text-[13px] text-[#4c4546]">Viewer</td>
                  <td className="py-3 px-6 font-mono text-[13px] text-[#4c4546]">Oct 24, 2026</td>
                  <td className="py-3 px-6 text-right">
                    <button className="p-1 hover:bg-[#e8e8e8] rounded-sm text-[#4c4546] transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pr-2">
            <button className="font-mono text-[12px] font-bold text-black hover:underline flex items-center gap-1 transition-all">
              View all users <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}
