const fs = require('fs');
let content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf-8');

const regex = /<div className="flex gap-4 mb-6 border-b border-black\/10 dark:border-white\/10 overflow-x-auto whitespace-nowrap scrollbar-hide \[\&::-webkit-scrollbar\]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>[\s\S]*?Broadcast\s*<\/button>\s*<\/div>/;

const replacement = `<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-white dark:bg-[#121212] p-1.5 rounded-[16px] gap-1 shadow-sm border border-black/5 dark:border-white/5">
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart2 className="w-4 h-4" /> Analytics
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'users' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'products' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('products')}
            >
              <Package className="w-4 h-4" /> Shop Products
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'blog' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('blog')}
            >
              <FileText className="w-4 h-4" /> Blog
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'leads' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('leads')}
            >
              <MessageCircle className="w-4 h-4" /> Leads
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'buybox' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('buybox')}
            >
              <Package className="w-4 h-4" /> Buy Box
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'seo' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('seo')}
            >
              <LinkIcon className="w-4 h-4" /> SEO
            </button>
            <button 
              className={\`shrink-0 px-4 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'broadcast' ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm' : 'text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
              onClick={() => setActiveTab('broadcast')}
            >
              <Send className="w-4 h-4" /> Broadcast
            </button>
          </div>
        </div>`;

if(regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/views/AdminDashboard.tsx', content);
  console.log("Replaced AdminDashboard tabs successfully.");
} else {
  console.log("Regex failed for AdminDashboard tabs.");
}
