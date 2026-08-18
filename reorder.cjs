const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// The active tab values need to be updated.
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'analytics' \| 'social' \| 'profile' \| 'ebooks' \| 'settings'>\('profile'\);/,
  `const [activeTab, setActiveTab] = useState<'analytics' | 'social' | 'profile' | 'ebooks' | 'settings'>('profile');`
);

// We'll replace the entire tab bar in UserDashboard with a new custom bottom navigation bar for mobile, and keep the desktop one.
// Let's first fix the desktop top tabs to match the new structure, and add the bottom nav.

const topTabsRegex = /<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide \[\&::-webkit-scrollbar\]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>\s*<div className="inline-flex bg-black\/5 dark:bg-white\/5 p-1\.5 rounded-\[16px\] gap-1">[\s\S]*?<\/div>\s*<\/div>/;

const newTopTabs = `<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden hidden md:block" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[16px] gap-1">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'social' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Socials
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'profile' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('ebooks')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'ebooks' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Ebooks
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={\`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'settings' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Settings
            </button>
          </div>
        </div>`;

if(topTabsRegex.test(code)) {
  code = code.replace(topTabsRegex, newTopTabs);
}

// Now we need to modify the block rendering.
// Find the chunks.
const blockProfileStart = `) : profile && activeTab === 'profile' ? (`;
const blockShopStart = `) : profile && activeTab === 'shop' ? (`;
const blockGalleryStart = `) : profile && activeTab === 'gallery' ? (`;
const blockNfcStart = `) : profile && activeTab === 'nfc' ? (`;
const blockBuyNfcStart = `) : profile && activeTab === 'buy-nfc' ? (`;
const blockAppearanceStart = `) : profile && activeTab === 'appearance' ? (`;

// We'll replace the block shop with ebooks
code = code.replace(blockShopStart, `) : profile && activeTab === 'ebooks' ? (`);

// We need to merge gallery, nfc, buy-nfc, appearance into settings
// Let's just create a new settings block that encompasses them, or we can just render them conditionally inside settings.
// Easier: replace their conditions with `) : profile && activeTab === 'settings' ? (` and combine them. 

// Actually, I can just use a much simpler regex approach or manual editing via AST.
// It's probably easier to just replace `activeTab === 'appearance'` with `activeTab === 'settings'`
// and delete the other `) : profile && activeTab === '...' ? (` wrapping layers to merge them.
// Let's do that:
code = code.replace(
  /\) : profile && activeTab === 'appearance' \? \(/,
  `) : profile && activeTab === 'settings' ? (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">`
);

// We need to remove the wrapper for gallery
code = code.replace(
  /\) : profile && activeTab === 'gallery' \? \(\s*<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">/,
  ''
);

// We need to remove the wrapper for nfc
code = code.replace(
  /\) : profile && activeTab === 'nfc' \? \(\s*<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">/,
  ''
);

// We need to remove the wrapper for buy-nfc
code = code.replace(
  /\) : profile && activeTab === 'buy-nfc' \? \(\s*<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">/,
  ''
);

// We need to remove the closing divs that belonged to gallery, nfc, buy-nfc
// Each block had `</div>\n        ) : profile && `
// Since we removed the start, we need to remove the closing `</div>` right before the next `) : profile &&`
code = code.replace(
  /<\/div>\s*\) : profile && activeTab === 'gallery' \? \(/,
  ''
);
// Wait, the order in code is shop -> gallery -> nfc -> buy-nfc -> appearance
// Let's check the exact order first!
fs.writeFileSync('reorder_temp.cjs', code);
