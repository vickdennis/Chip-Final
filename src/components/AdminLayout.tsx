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
    <div className="flex h-screen overflow-hidden bg-[#000000]">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#050505] flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              style={{
                background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
              }}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/20 shadow-[0_2px_10px_rgba(182,0,168,0.25)]"
            >
              <MemoryStick className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg tracking-tight leading-tight">Admin Console</h1>
              <p className="text-xs text-white/60 font-medium opacity-80">System Overview</p>
            </div>
          </div>
          <button 
            className="md:hidden text-white"
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
            style={activePath === 'dashboard' ? {
              background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
              boxShadow: '0px 2px 4px rgba(181, 1, 167, 0.2)',
            } : undefined}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ease-in-out font-mono text-[14px] font-medium ${activePath === 'dashboard' ? 'text-white border border-white/10' : 'text-white/60 hover:bg-white/5'}`}
          >
            <LayoutDashboard className="w-[18px] h-[18px]" />
            Dashboard
          </button>
          <button 
            onClick={() => {
              onNavigate('enterprise-dashboard');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-white/5 transition-all duration-150 ease-in-out font-mono text-[14px] font-medium"
          >
            <Users className="w-[18px] h-[18px]" />
            Enterprise Edition
          </button>
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              onNavigate('landing');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-[#ba1a1a] hover:bg-[#ffdad6] dark:hover:bg-[#ba1a1a]/20 transition-all duration-150 ease-in-out rounded-xl font-mono text-[14px] font-medium"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 shrink-0 border-b border-white/10 bg-[#050505] flex items-center justify-between md:justify-end px-4 md:px-8">
          <button 
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-white transition-colors">
              {isDarkMode ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>

            <div className="w-10 h-10 border border-white/10 rounded-xl overflow-hidden p-0.5">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBETENoMAyXnSAZJQp1wOmlvzEUZStuxLWXLrDU-sDjD5lXJrhSbSnZGKRC7qch_0op3y85qfqCF3vlJ_jXZJtIpCfq9TEBPdYhF5jqL0peMwcQa-VUD1vXgjFUdpGCBTX9nD7zT70xgg-JXcdAln6tIhiNK5GsKIqDn45vUk7c9xakdrnQXhNX0-S475zPSDD2HFTVCvkltD0wfVyqXU6npOBvCRFMWfy8UuqI5pLhlN6ufaD0KBV8oBnbXOnTIxKdg0-UrVHTxUY" 
                alt="User Avatar" 
                className="w-full h-full object-cover grayscale opacity-90 rounded-[2px]"
              />
            </div>
          </div>
        </header>
        
        {/* Scrollable Canvas Output */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {/* Background radial soft light halo matching the signature color pattern */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15 dark:opacity-25 z-0">
            <div 
              className="absolute w-[350px] md:w-[650px] h-[350px] md:h-[650px] rounded-full filter blur-[100px] md:blur-[140px]"
              style={{
                background: 'radial-gradient(circle, rgba(182, 0, 168, 0.25) 0%, rgba(118, 33, 176, 0.15) 50%, rgba(24, 1, 31, 0.05) 100%)'
              }}
            />
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
