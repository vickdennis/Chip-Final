import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Update useState
code = re.sub(
    r"const \[activeTab, setActiveTab\] = useState<'analytics' \| 'profile' \| 'links' \| 'social' \| 'shop' \| 'appearance' \| 'gallery' \| 'nfc' \| 'buy-nfc'>\('profile'\);",
    "const [activeTab, setActiveTab] = useState<'analytics' | 'social' | 'profile' | 'ebooks' | 'settings'>('profile');",
    code
)

# 2. Add hideMobileNav to AdminLayout
code = code.replace(
    '<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>',
    '<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} hideMobileNav={true}>\n      <div className="pb-24">'
)
code = code.replace(
    '</AdminLayout>',
    '      </div>\n    </AdminLayout>'
)

# 3. Fix the tabs buttons
old_tabs_start = code.find('<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden"')
if old_tabs_start != -1:
    old_tabs_end = code.find('</div>', code.find('</button>', old_tabs_start)) + 6
    outer_div_end = code.find('</div>', old_tabs_end) + 6

    new_tabs = """<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden hidden md:block" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[16px] gap-1">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Analytics
            </button>
            <button 
              onClick={() => setActiveTab('social')}
              className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'social' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Socials
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('ebooks')}
              className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'ebooks' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Ebooks
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
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
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'analytics' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'analytics' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'analytics' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Analytics</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('social')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'social' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'social' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === 'social' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
                <Share className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'social' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Socials</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'profile' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'profile' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
                <UserCircle className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'profile' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Profile</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('ebooks')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'ebooks' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'ebooks' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === 'ebooks' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'ebooks' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Ebooks</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'settings' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'settings' && (
                <div className="absolute -top-3 w-14 h-14 bg-white dark:bg-[#121212] rounded-full shadow-[0_-8px_16px_rgba(0,0,0,0.06)] -z-10" />
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20' : 'bg-transparent'}`}>
                <Settings className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'settings' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Settings</span>
            </button>

          </div>
        </nav>"""
    code = code[:old_tabs_start] + new_tabs + code[outer_div_end:]

# 4. Extract Social Media block and put it in a new conditional block
social_marker = "{/* Social Media */}"
links_marker = "{/* Links */}"

s_start = code.find(social_marker)
l_start = code.find(links_marker)

if s_start != -1 and l_start != -1:
    social_block = code[s_start:l_start]
    # Remove from current place
    code = code[:s_start] + code[l_start:]
    
    # Create the new block
    ebooks_marker = ") : profile && activeTab === 'ebooks' ? ("
    e_start = code.find(ebooks_marker)
    
    if e_start != -1:
        new_social = f""") : profile && activeTab === 'social' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
              {social_block}
            </div>
          </div>
        """
        code = code[:e_start] + new_social + code[e_start:]

# 5. Fix Gallery, NFC, Buy NFC, Appearance -> Settings
# Currently Gallery is not wrapped in a condition (it sits right after ebooks block ends with </div></div>)
gallery_content_start = code.find('<div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">')
# Let's verify it is right above <section ... Public Gallery
if code.find('Public Gallery', gallery_content_start, gallery_content_start + 500) != -1:
    # Insert the settings condition wrapper BEFORE this
    code = code[:gallery_content_start] + ") : profile && activeTab === 'settings' ? (\n          <div className=\"flex flex-col gap-8\">\n" + code[gallery_content_start:]

# Remove nfc condition
nfc_cond = ") : profile && activeTab === 'nfc' ? ("
if nfc_cond in code:
    # We remove `</div>\n        ) : profile && activeTab === 'nfc' ? (`
    code = re.sub(r'<\/div>\s*\) : profile && activeTab === \'nfc\' \? \(', '', code)

# Remove buy-nfc condition
buy_nfc_cond = ") : profile && activeTab === 'buy-nfc' ? ("
if buy_nfc_cond in code:
    code = re.sub(r'\s*\) : profile && activeTab === \'buy-nfc\' \? \(\s*<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">\s*<div className="xl:col-span-8 flex flex-col gap-8">', '\n<div className="grid grid-cols-1 xl:grid-cols-12 gap-8"><div className="xl:col-span-12 flex flex-col gap-8">', code)

# Remove appearance condition
app_cond = ") : profile && activeTab === 'appearance' ? ("
if app_cond in code:
    code = re.sub(r'<\/div>\s*<\/div>\s*\) : profile && activeTab === \'appearance\' \? \(\s*<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">\s*<div className="xl:col-span-12 flex flex-col gap-8">', '</div></div>\n<div className="grid grid-cols-1 xl:grid-cols-12 gap-8"><div className="xl:col-span-12 flex flex-col gap-8">', code)

# Add closing tag for settings block
# Find the end of appearance block which goes into `) : (`
end_marker = "</div>\n        ) : ("
if end_marker in code:
    code = code.replace("</div>\n        ) : (", "</div></div>\n        ) : (")

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Done")
