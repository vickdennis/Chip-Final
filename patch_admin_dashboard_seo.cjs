const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

const importBuyBox = `import AdminBuyBoxManager from './AdminBuyBoxManager';`;
const newImports = `import AdminBuyBoxManager from './AdminBuyBoxManager';\nimport AdminSeoManager from './AdminSeoManager';`;
if(!code.includes('AdminSeoManager')) {
  code = code.replace(importBuyBox, newImports);
}

const buyboxTab = `<button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'buybox' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('buybox')}
          >
            <Package className="w-4 h-4 inline mr-1" /> Buy Box
          </button>`;
          
const newTabs = `<button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'buybox' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('buybox')}
          >
            <Package className="w-4 h-4 inline mr-1" /> Buy Box
          </button>
          <button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'seo' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('seo')}
          >
            <LinkIcon className="w-4 h-4 inline mr-1" /> SEO
          </button>`;
          
code = code.replace(buyboxTab, newTabs);

const buyboxRender = `{activeTab === 'buybox' && (
          <AdminBuyBoxManager />
        )}`;

const newRender = `{activeTab === 'buybox' && (
          <AdminBuyBoxManager />
        )}
        {activeTab === 'seo' && (
          <AdminSeoManager />
        )}`;

code = code.replace(buyboxRender, newRender);

code = code.replace(/useState<'analytics' \| 'users' \| 'products' \| 'blog' \| 'leads' \| 'buybox'>/g, "useState<'analytics' | 'users' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo'>");

// Import LinkIcon
code = code.replace("import { Package, Plus, MessageCircle, BarChart, Users, FileText } from 'lucide-react';", "import { Package, Plus, MessageCircle, BarChart, Users, FileText, Link as LinkIcon } from 'lucide-react';");

fs.writeFileSync('src/views/AdminDashboard.tsx', code);
