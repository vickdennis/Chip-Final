const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// 1. Update useState
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'analytics' \| 'profile' \| 'links' \| 'social' \| 'shop' \| 'appearance' \| 'gallery' \| 'nfc' \| 'buy-nfc'>\('profile'\);/,
  `const [activeTab, setActiveTab] = useState<'analytics' | 'social' | 'profile' | 'ebooks' | 'settings'>('profile');`
);

// 2. Replace the tab buttons (desktop + mobile)
const oldTabsStart = code.indexOf('<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>');
const oldTabsEnd = code.indexOf('</div>', code.indexOf('</button>', oldTabsStart)) + 6;
const lastDiv = code.indexOf('</div>', oldTabsEnd - 10) + 6; // To capture the outer div correctly.

const newTabs = `<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden hidden md:block" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[16px] gap-1">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={\`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className={\`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'social' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Socials
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={\`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'profile' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('ebooks')}
              className={\`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'ebooks' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Ebooks
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={\`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 \${activeTab === 'settings' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}\`}
            >
              Settings
            </button>
          </div>
        </div>
        
        {/* Mobile Custom Nav Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#121212] border-t border-black/5 dark:border-white/5 pb-6 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          <div className="flex items-center justify-around h-[64px] px-2 relative">
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'analytics' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
            >
              {activeTab === 'analytics' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activeTab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'analytics' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Analytics</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('social')}
              className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'social' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
            >
              {activeTab === 'social' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activeTab === 'social' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
                <Share className="w-5 h-5" />
              </div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'social' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Socials</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'profile' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
            >
              {activeTab === 'profile' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activeTab === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
                <UserCircle className="w-5 h-5" />
              </div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'profile' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Profile</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('ebooks')}
              className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'ebooks' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
            >
              {activeTab === 'ebooks' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activeTab === 'ebooks' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
                <Wallet className="w-5 h-5" />
              </div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'ebooks' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Ebooks</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={\`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all \${activeTab === 'settings' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}\`}
            >
              {activeTab === 'settings' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={\`w-12 h-12 rounded-full flex items-center justify-center transition-all \${activeTab === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}\`}>
                <Settings className="w-5 h-5" />
              </div>
              <span className={\`text-[10px] font-semibold tracking-wide transition-all \${activeTab === 'settings' ? 'opacity-100 translate-y-1' : 'opacity-100'}\`}>Settings</span>
            </button>

          </div>
        </nav>`;

code = code.substring(0, oldTabsStart) + newTabs + code.substring(lastDiv);

// 3. Extract the Social Media block from profile and create the 'social' tab block
const socialStartMarker = `{/* Social Media */}`;
const linksStartMarker = `{/* Links */}`;
const socialStartIdx = code.indexOf(socialStartMarker);
const linksStartIdx = code.indexOf(linksStartMarker);

const socialBlock = code.substring(socialStartIdx, linksStartIdx);
code = code.substring(0, socialStartIdx) + code.substring(linksStartIdx);

const profileBlockEndIdx = code.indexOf(`) : profile && activeTab === 'shop' ? (`);
const newSocialTab = `) : profile && activeTab === 'social' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
              ${socialBlock}
            </div>
          </div>
        `;
code = code.substring(0, profileBlockEndIdx) + newSocialTab + code.substring(profileBlockEndIdx);

// 4. Change 'shop' to 'ebooks'
code = code.replace(
  /\) : profile && activeTab === 'shop' \? \(/,
  `) : profile && activeTab === 'ebooks' ? (`
);

// 5. Change 'gallery', 'nfc', 'buy-nfc', 'appearance' to render inside 'settings' sequentially
// Let's replace `activeTab === 'gallery' ? (` with `activeTab === 'settings' ? (`
// Then, we'll remove the `) : profile && activeTab === ...` for the subsequent ones so they all fall under 'settings'.

// Let's do it safely:
code = code.replace(
  /\) : profile && activeTab === 'gallery' \? \(/,
  `) : profile && activeTab === 'settings' ? ( <div className="space-y-8 flex flex-col gap-8 w-full max-w-4xl mx-auto"> `
);
// Remove nfc wrapper
code = code.replace(
  /<\/div>\s*\) : profile && activeTab === 'nfc' \? \(/,
  ''
);
// Remove buy-nfc wrapper
code = code.replace(
  /\) : profile && activeTab === 'buy-nfc' \? \(\s*<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">\s*<div className="xl:col-span-8 flex flex-col gap-8">/,
  '<div className="grid grid-cols-1 xl:grid-cols-12 gap-8"><div className="xl:col-span-8 flex flex-col gap-8">'
);
// Remove appearance wrapper
code = code.replace(
  /<\/div>\s*<\/div>\s*\) : profile && activeTab === 'appearance' \? \(\s*<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">\s*<div className="xl:col-span-12 flex flex-col gap-8">/,
  '<div className="grid grid-cols-1 xl:grid-cols-12 gap-8"><div className="xl:col-span-12 flex flex-col gap-8">'
);

// Add the final closing div for the <div className="space-y-8 flex flex-col gap-8 w-full max-w-4xl mx-auto"> we added.
const endOfAppearanceIdx = code.indexOf(`</div>\n        ) : (`);
code = code.substring(0, endOfAppearanceIdx) + `</div></div>\n        ) : (` + code.substring(endOfAppearanceIdx + 13);


// Make sure the bottom navigation doesn't get covered, add pb-24 to the AdminLayout in UserDashboard
code = code.replace(
  /<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>/,
  `<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} hideMobileNav={true}>\n    <div className="pb-24">`
);

// Need to close that div before </AdminLayout>
code = code.replace(
  /<\/AdminLayout>/,
  `</div>\n    </AdminLayout>`
);


fs.writeFileSync('src/views/UserDashboard.tsx', code);
console.log("Safely replaced.");
