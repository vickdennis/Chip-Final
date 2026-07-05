const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

const importLeads = `import AdminLeadsManager from './AdminLeadsManager';`;
const newImports = `import AdminLeadsManager from './AdminLeadsManager';
import AdminBuyBoxManager from './AdminBuyBoxManager';`;

if (!code.includes('AdminBuyBoxManager')) {
  code = code.replace(importLeads, newImports);
  
  const leadsTab = `<button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'leads' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('leads')}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" /> Leads
          </button>`;
          
  const newTabs = `<button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'leads' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('leads')}
          >
            <MessageCircle className="w-4 h-4 inline mr-1" /> Leads
          </button>
          <button 
            className={\`pb-3 font-mono text-[13px] font-bold uppercase tracking-widest flex items-center gap-2 \${activeTab === 'buybox' ? 'border-b-2 border-black text-black dark:text-white' : 'text-[#7e7576]'}\`}
            onClick={() => setActiveTab('buybox')}
          >
            <Package className="w-4 h-4 inline mr-1" /> Buy Box
          </button>`;
          
  code = code.replace(leadsTab, newTabs);
  
  const leadsRender = `{activeTab === 'leads' && (
          <AdminLeadsManager />
        )}`;
        
  const newRender = `{activeTab === 'leads' && (
          <AdminLeadsManager />
        )}
        {activeTab === 'buybox' && (
          <AdminBuyBoxManager />
        )}`;
        
  code = code.replace(leadsRender, newRender);
  
  code = code.replace(/useState<'analytics' \| 'users' \| 'products' \| 'blog' \| 'leads'>/g, "useState<'analytics' | 'users' | 'products' | 'blog' | 'leads' | 'buybox'>");
  
  fs.writeFileSync('src/views/AdminDashboard.tsx', code);
}
