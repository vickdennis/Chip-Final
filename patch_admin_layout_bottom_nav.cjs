const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

const regex = /<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white\/80 dark:bg-\[\#0a0a0a\]\/80 backdrop-blur-2xl border-t border-black\/5 dark:border-white\/5 pb-4 md:pb-0">[\s\S]*?<\/nav>/;

const replacement = `<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#121212] border-t border-black/5 dark:border-white/5 pb-4 md:pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
        <div className="flex items-center justify-around h-[84px] px-2 relative">
          <button 
            onClick={() => onNavigate('user-dashboard')}
            className={\`relative flex flex-col items-center justify-center w-[72px] h-[72px] gap-1.5 transition-all \${activePath === 'dashboard' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
          >
            {activePath === 'dashboard' && (
              <div className="absolute -top-3 w-16 h-16 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
            )}
            <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activePath === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
              <LayoutDashboard className={\`w-6 h-6 \${activePath === 'dashboard' ? '' : ''}\`} />
            </div>
            <span className={\`text-[11px] font-semibold tracking-wide transition-all \${activePath === 'dashboard' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Home</span>
          </button>
          
          <button 
            onClick={() => onNavigate('enterprise-dashboard')}
            className={\`relative flex flex-col items-center justify-center w-[72px] h-[72px] gap-1.5 transition-all \${activePath === 'enterprise' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
          >
            {activePath === 'enterprise' && (
              <div className="absolute -top-3 w-16 h-16 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
            )}
            <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activePath === 'enterprise' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
              <Users className={\`w-6 h-6 \${activePath === 'enterprise' ? '' : ''}\`} />
            </div>
            <span className={\`text-[11px] font-semibold tracking-wide transition-all \${activePath === 'enterprise' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Enterprise</span>
          </button>

          <button 
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-[72px] h-[72px] gap-1.5 text-black/40 dark:text-white/40 transition-all"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-semibold tracking-wide">Logout</span>
          </button>
        </div>
      </nav>`;

if(regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/AdminLayout.tsx', content);
  console.log("Patched AdminLayout bottom nav successfully.");
} else {
  console.log("Regex failed for AdminLayout bottom nav.");
}
