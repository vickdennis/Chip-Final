const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf-8');

// 1. Rewrite the Top Header and Tabs
const headerAndTabsRegex = /<header className="bg-white\/80 dark:bg-black\/80 backdrop-blur-xl border-b border-black\/5 dark:border-white\/5 text-black dark:text-white p-5 sticky top-0 z-20 flex justify-between items-center">[\s\S]*?<div className="max-w-6xl mx-auto mt-8 px-4">\s*{\/\* Tabs \*\/}\s*<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide \[\&::-webkit-scrollbar\]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>[\s\S]*?<\/div>\s*<\/div>/;

const newHeaderAndTabs = `
      <header className="bg-[#f4f4f5] dark:bg-black border-b border-black/5 dark:border-white/5 text-black dark:text-white p-5 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-black dark:bg-white shadow-md">
            <Shield className="w-5 h-5 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight leading-tight">Super Admin Hub</h1>
            <p className="text-[11px] text-black/50 dark:text-white/50 font-medium uppercase tracking-widest">Command Center</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode} className="p-2 rounded-full text-black/60 dark:text-white/60 active:bg-black/5 dark:active:bg-white/5">
            <Globe className="w-5 h-5" />
          </button>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              onNavigate('landing');
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6">
        {/* Modern Nav Bar */}
        <div className="mb-10 flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-1">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            <button 
              className={\`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap \${activeTab === 'analytics' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
            <button 
              className={\`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap \${activeTab === 'users' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button 
              className={\`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap \${activeTab === 'products' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
              onClick={() => setActiveTab('products')}
            >
              Shop
            </button>
            <button 
              className={\`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap \${activeTab === 'blog' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
              onClick={() => setActiveTab('blog')}
            >
              Blog
            </button>

            {/* Plus Dropdown Group */}
            <div className="relative group pb-4">
              <button 
                className={\`font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 \${['leads', 'buybox', 'seo', 'broadcast'].includes(activeTab) ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}\`}
              >
                <Plus className="w-4 h-4" /> Tools
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 overflow-hidden flex flex-col p-2">
                <button 
                  className={\`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors \${activeTab === 'leads' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}\`}
                  onClick={() => setActiveTab('leads')}
                >
                  <Users className="w-4 h-4" /> Leads
                </button>
                <button 
                  className={\`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors \${activeTab === 'buybox' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}\`}
                  onClick={() => setActiveTab('buybox')}
                >
                  <Package className="w-4 h-4" /> Buy Box
                </button>
                <button 
                  className={\`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors \${activeTab === 'seo' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}\`}
                  onClick={() => setActiveTab('seo')}
                >
                  <Search className="w-4 h-4" /> SEO
                </button>
                <button 
                  className={\`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors \${activeTab === 'broadcast' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}\`}
                  onClick={() => setActiveTab('broadcast')}
                >
                  <Send className="w-4 h-4" /> Broadcast
                </button>
              </div>
            </div>

          </div>
        </div>
`;

code = code.replace(headerAndTabsRegex, newHeaderAndTabs);

// Update background styling
code = code.replace(
    '<div className="min-h-screen bg-black/5 dark:bg-white/5 pb-20">',
    '<div className="min-h-screen bg-[#f9f9f9] dark:bg-[#000000] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black pb-20">'
);

fs.writeFileSync('src/views/AdminDashboard.tsx', code);
console.log('Done rewriting AdminDashboard layout');
