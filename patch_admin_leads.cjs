const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

if (!code.includes("import AdminLeadsManager")) {
    code = code.replace(
        "import AdminBlogManager from './AdminBlogManager';",
        "import AdminBlogManager from './AdminBlogManager';\nimport AdminLeadsManager from './AdminLeadsManager';\nimport { MessageCircle } from 'lucide-react';"
    );
}

if (!code.includes("activeTab === 'leads'")) {
    const blogTabHtml = `onClick={() => setActiveTab('blog')}
            >
              <Rss className="w-4 h-4 inline mr-1" /> Blog
            </button>`;
    
    const leadsTabHtml = `onClick={() => setActiveTab('blog')}
            >
              <Rss className="w-4 h-4 inline mr-1" /> Blog
            </button>
            <button 
              className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest \${activeTab === 'leads' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white transition-colors'}\`}
              onClick={() => setActiveTab('leads')}
            >
              <MessageCircle className="w-4 h-4 inline mr-1" /> Leads
            </button>`;
            
    code = code.replace(blogTabHtml, leadsTabHtml);
}

if (!code.includes("<AdminLeadsManager />")) {
    const renderBlogHtml = `{activeTab === 'blog' && (
          <AdminBlogManager />
        )}`;
        
    const renderLeadsHtml = `{activeTab === 'blog' && (
          <AdminBlogManager />
        )}
        {activeTab === 'leads' && (
          <AdminLeadsManager />
        )}`;
        
    code = code.replace(renderBlogHtml, renderLeadsHtml);
}

fs.writeFileSync('src/views/AdminDashboard.tsx', code);
