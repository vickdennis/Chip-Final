const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

const blogTab = `          <button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'blog' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('blog')}
          >
            <FileText className="w-4 h-4 inline mr-1" /> Blog
          </button>`;

const newTab = `          <button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'blog' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('blog')}
          >
            <FileText className="w-4 h-4 inline mr-1" /> Blog
          </button>
          <button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'leads' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('leads')}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" /> Leads
          </button>`;

if (!code.includes("setActiveTab('leads')")) {
  code = code.replace(blogTab, newTab);
  fs.writeFileSync('src/views/AdminDashboard.tsx', code);
}
