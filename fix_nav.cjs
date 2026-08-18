const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const navCode = `
        {/* Mobile Custom Nav Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f4f4f5] dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5 pb-6 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          <div className="flex items-center justify-around h-[64px] px-2 relative">
            <button onClick={() => setActiveTab('analytics')} className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'analytics' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}>
              {activeTab === 'analytics' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all \${activeTab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}\`}><Activity className="w-5 h-5" /></div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'analytics' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Analytics</span>
            </button>
            <button onClick={() => setActiveTab('social')} className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'social' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}>
              {activeTab === 'social' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all \${activeTab === 'social' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}\`}><Share className="w-5 h-5" /></div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'social' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Socials</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'profile' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}>
              {activeTab === 'profile' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all \${activeTab === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}\`}><UserCircle className="w-5 h-5" /></div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'profile' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Profile</span>
            </button>
            <button onClick={() => setActiveTab('ebooks')} className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'ebooks' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}>
              {activeTab === 'ebooks' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all \${activeTab === 'ebooks' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}\`}><Wallet className="w-5 h-5" /></div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'ebooks' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Ebooks</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'settings' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}>
              {activeTab === 'settings' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={\`w-14 h-14 rounded-full flex items-center justify-center transition-all \${activeTab === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}\`}><Settings className="w-5 h-5" /></div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'settings' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Settings</span>
            </button>
          </div>
        </nav>
`;

code = code.replace(
  /          <\/div>\n    <\/AdminLayout>/,
  `      ${navCode}\n          </div>\n    </AdminLayout>`
);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
console.log('Done');
