import React from 'react';
import { ViewState } from '../App';
import { supabase } from '../supabaseClient';
import { 
  MemoryStick, 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  History,
  Plus,
  HelpCircle,
  LogOut,
  Search,
  Bell
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onNavigate: (view: ViewState) => void;
  activePath: 'dashboard' | 'bio';
}

export default function AdminLayout({ children, onNavigate, activePath }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#ffffff]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#e2e2e2] bg-[#f3f3f4] flex flex-col shrink-0">
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm">
              <MemoryStick className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#1a1c1c] text-lg tracking-tight leading-tight">Admin Console</h1>
              <p className="text-xs text-[#4c4546] font-medium opacity-80">System Overview</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-4">
          <button 
            onClick={() => onNavigate('user-dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-150 ease-in-out font-mono text-[14px] font-medium ${activePath === 'dashboard' ? 'bg-black text-white' : 'text-[#4c4546] hover:bg-[#e8e8e8]'}`}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" />
            Dashboard
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-[#cfc4c5]">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              onNavigate('landing');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6] transition-all duration-150 ease-in-out rounded-sm font-mono text-[14px] font-medium"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-[#e2e2e2] bg-white flex items-center justify-between px-8">
          <div className="relative w-96 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#4c4546]" />
            <input 
              type="text" 
              placeholder="Search systems, logs, or users..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#e2e2e2] rounded-sm focus:border-black focus:ring-0 font-mono text-[14px] text-[#1a1c1c] placeholder-[#4c4546] transition-colors outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 border border-[#cfc4c5] px-1.5 rounded bg-[#f3f3f4]">
              <span className="font-mono text-[10px] text-[#4c4546]">⌘K</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 border border-[#e2e2e2] rounded-sm flex items-center justify-center text-[#1a1c1c] hover:bg-[#f3f3f4] transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border border-white"></span>
            </button>
            <div className="w-10 h-10 border border-[#e2e2e2] rounded-sm overflow-hidden p-0.5 cursor-pointer">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBETENoMAyXnSAZJQp1wOmlvzEUZStuxLWXLrDU-sDjD5lXJrhSbSnZGKRC7qch_0op3y85qfqCF3vlJ_jXZJtIpCfq9TEBPdYhF5jqL0peMwcQa-VUD1vXgjFUdpGCBTX9nD7zT70xgg-JXcdAln6tIhiNK5GsKIqDn45vUk7c9xakdrnQXhNX0-S475zPSDD2HFTVCvkltD0wfVyqXU6npOBvCRFMWfy8UuqI5pLhlN6ufaD0KBV8oBnbXOnTIxKdg0-UrVHTxUY" 
                alt="User Avatar" 
                className="w-full h-full object-cover grayscale opacity-90 rounded-[2px]"
              />
            </div>
          </div>
        </header>
        
        {/* Scrollable Canvas Output */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
