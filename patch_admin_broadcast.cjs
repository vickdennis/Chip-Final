const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

const importSeo = `import AdminSeoManager from './AdminSeoManager';`;
const newImports = `import AdminSeoManager from './AdminSeoManager';\nimport AdminBroadcastManager from './AdminBroadcastManager';`;
if(!code.includes('AdminBroadcastManager')) {
  code = code.replace(importSeo, newImports);
}

const seoTab = `<button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'seo' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('seo')}
          >
            <LinkIcon className="w-4 h-4 inline mr-1" /> SEO
          </button>`;
          
const newTabs = `<button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'seo' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('seo')}
          >
            <LinkIcon className="w-4 h-4 inline mr-1" /> SEO
          </button>
          <button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'broadcast' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('broadcast')}
          >
            <Send className="w-4 h-4 inline mr-1" /> Broadcast
          </button>`;
          
code = code.replace(seoTab, newTabs);

const seoRender = `{activeTab === 'seo' && (
          <AdminSeoManager />
        )}`;

const newRender = `{activeTab === 'seo' && (
          <AdminSeoManager />
        )}
        {activeTab === 'broadcast' && (
          <AdminBroadcastManager />
        )}`;

code = code.replace(seoRender, newRender);

code = code.replace(/useState<'analytics' \| 'users' \| 'products' \| 'blog' \| 'leads' \| 'buybox' \| 'seo'>/g, "useState<'analytics' | 'users' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo' | 'broadcast'>");

code = code.replace("FileText, Link as LinkIcon } from 'lucide-react';", "FileText, Link as LinkIcon, Send } from 'lucide-react';");

fs.writeFileSync('src/views/AdminDashboard.tsx', code);
