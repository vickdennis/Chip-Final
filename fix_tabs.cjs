const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const targetTabs = `<div className="flex border-b border-black/10 dark:border-white/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={\`shrink-0 px-4 sm:px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'analytics' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={\`shrink-0 px-4 sm:px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'profile' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
          >
            Profile Links
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={\`shrink-0 px-4 sm:px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'shop' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
          >
            Digital Products
          </button>
          <button 
            onClick={() => setActiveTab('style')}
            className={\`shrink-0 px-4 sm:px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'style' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
          >
            Theme & Style
          </button>
        </div>`;

const replacementTabs = `<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[16px] gap-1">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={\`shrink-0 px-5 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all \${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={\`shrink-0 px-5 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all \${activeTab === 'profile' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Profile Links
            </button>
            <button 
              onClick={() => setActiveTab('shop')}
              className={\`shrink-0 px-5 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all \${activeTab === 'shop' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Digital Products
            </button>
            <button 
              onClick={() => setActiveTab('style')}
              className={\`shrink-0 px-5 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all \${activeTab === 'style' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Theme & Style
            </button>
          </div>
        </div>`;

if(content.includes('Analytics')) {
  // It might be slightly different so I will use a regex to replace it
  const match = content.match(/<div className="flex border-b border-black\/10[^>]*>[\s\S]*?Theme & Style[\s\S]*?<\/button>\s*<\/div>/);
  if(match) {
    content = content.replace(match[0], replacementTabs);
    fs.writeFileSync('src/views/UserDashboard.tsx', content);
    console.log("Replaced tabs with Segmented Control");
  } else {
    console.log("Regex match failed for tabs");
  }
}
