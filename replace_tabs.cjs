const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const regex = /<div className="flex border-b border-black\/10 dark:border-white\/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide \[\&::-webkit-scrollbar\]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>[\s\S]*?Buy NFC Card\s*<\/button>\s*<\/div>/;

const replacement = `<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[16px] gap-1">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'profile' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Profile Links
            </button>
            <button 
              onClick={() => setActiveTab('shop')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'shop' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Digital Products
            </button>
            <button 
              onClick={() => setActiveTab('appearance')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'appearance' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Appearance
            </button>
            <button 
              onClick={() => setActiveTab('gallery')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'gallery' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Gallery
            </button>
            <button 
              onClick={() => setActiveTab('nfc')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'nfc' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              <SmartphoneNfc className="w-4 h-4" />
              Program Card
            </button>
            <button 
              onClick={() => setActiveTab('buy-nfc')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'buy-nfc' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              <SmartphoneNfc className="w-4 h-4" />
              Buy NFC Card
            </button>
          </div>
        </div>`;

if(regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log("Replaced tabs successfully.");
} else {
  console.log("Regex failed.");
}
