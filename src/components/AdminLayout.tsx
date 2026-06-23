import React, { useState } from 'react';
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
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  onNavigate: (view: ViewState) => void;
  activePath: 'dashboard' | 'bio';
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AdminLayout({ children, onNavigate, activePath, isDarkMode, toggleDarkMode }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#ffffff] dark:bg-black">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#e2e2e2] dark:border-[#333] bg-[#f3f3f4] dark:bg-[#111] flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center rounded-sm">
              <MemoryStick className="w-6 h-6 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="font-display font-bold text-[#1a1c1c] dark:text-white text-lg tracking-tight leading-tight">Admin Console</h1>
              <p className="text-xs text-[#4c4546] dark:text-[#a0a0a0] font-medium opacity-80">System Overview</p>
            </div>
          </div>
          <button 
            className="md:hidden text-[#1a1c1c] dark:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-4">
          <button 
            onClick={() => {
              onNavigate('user-dashboard');
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-150 ease-in-out font-mono text-[14px] font-medium ${activePath === 'dashboard' ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80' : 'text-[#4c4546] dark:text-[#a0a0a0] hover:bg-[#e8e8e8] dark:hover:bg-[#222]'}`}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" />
            Dashboard
          </button>
          <button 
            onClick={() => {
              onNavigate('enterprise-dashboard');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-sm text-[#4c4546] dark:text-[#a0a0a0] hover:bg-[#e8e8e8] dark:hover:bg-[#222] transition-all duration-150 ease-in-out font-mono text-[14px] font-medium"
          >
            <Users className="w-[18px] h-[18px]" />
            Enterprise Edition
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-[#cfc4c5] dark:border-[#333]">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              onNavigate('landing');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6] dark:hover:bg-[#ba1a1a]/20 transition-all duration-150 ease-in-out rounded-sm font-mono text-[14px] font-medium"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-[#e2e2e2] dark:border-[#333] bg-white dark:bg-black flex items-center justify-between md:justify-end px-4 md:px-8">
          <button 
            className="md:hidden p-2 text-[#1a1c1c] dark:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white transition-colors">
              {isDarkMode ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>

            <div className="w-10 h-10 border border-[#e2e2e2] dark:border-[#333] rounded-sm overflow-hidden p-0.5">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBETENoMAyXnSAZJQp1wOmlvzEUZStuxLWXLrDU-sDjD5lXJrhSbSnZGKRC7qch_0op3y85qfqCF3vlJ_jXZJtIpCfq9TEBPdYhF5jqL0peMwcQa-VUD1vXgjFUdpGCBTX9nD7zT70xgg-JXcdAln6tIhiNK5GsKIqDn45vUk7c9xakdrnQXhNX0-S475zPSDD2HFTVCvkltD0wfVyqXU6npOBvCRFMWfy8UuqI5pLhlN6ufaD0KBV8oBnbXOnTIxKdg0-UrVHTxUY" 
                alt="User Avatar" 
                className="w-full h-full object-cover grayscale opacity-90 rounded-[2px]"
              />
            </div>
          </div>
        </header>
        
        {/* Scrollable Canvas Output */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
