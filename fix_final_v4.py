import re

with open('reorder_temp.cjs', 'r') as f:
    code = f.read()

# I am going to delete the entire rest of the file from `activeTab === 'ebooks'` and rewrite it properly.
# But `reorder_temp.cjs` already has modified `ebooks` and `appearance`.
# Let's extract the exact components from `reorder_temp.cjs`.

ebooks_start = code.find(") : profile && activeTab === 'ebooks' ? (")
end_of_file = code.find(") : null}")
if ebooks_start != -1 and end_of_file != -1:
    before_ebooks = code[:ebooks_start]
    after_ternary = code[end_of_file:]
    
    # We will just write a completely new `ebooks` and `settings` block by extracting the sections.
    # We need:
    # 1. ebooks block (starts at `ebooks_start + 41`)
    # 2. gallery block
    # 3. nfc block
    # 4. buy-nfc block
    # 5. appearance block

    # Let's find them using `<h3 className="font-mono...`
    
    # Ebooks section:
    ebooks_h3 = code.find('>Digital Products</h3>')
    ebooks_section_start = code.rfind('<section', 0, ebooks_h3)
    ebooks_section_end = code.find('</section>', ebooks_section_start) + 10

    # Gallery section:
    gallery_h3 = code.find('>Public Gallery</h3>')
    gallery_section_start = code.rfind('<section', 0, gallery_h3)
    gallery_section_end = code.find('</section>', gallery_section_start) + 10

    # NFC Component
    nfc_comp_start = code.find('<NfcProgrammer')
    nfc_comp_end = code.find('/>', nfc_comp_start) + 2

    # Buy NFC section:
    buy_h3 = code.find('>Order NFC Card</h3>')
    buy_section_start = code.rfind('<section', 0, buy_h3)
    buy_section_end = code.find('</section>', buy_section_start) + 10

    # Appearance section:
    app_h3 = code.find('>Premium Themes & Layouts</h3>')
    app_section_start = code.rfind('<section', 0, app_h3)
    app_section_end = code.find('</section>', app_section_start) + 10

    ebooks_content = code[ebooks_section_start:ebooks_section_end]
    gallery_content = code[gallery_section_start:gallery_section_end]
    nfc_content = code[nfc_comp_start:nfc_comp_end]
    buy_content = code[buy_section_start:buy_section_end]
    app_content = code[app_section_start:app_section_end]

    new_blocks = f""") : profile && activeTab === 'ebooks' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
              {ebooks_content}
            </div>
          </div>
        ) : profile && activeTab === 'settings' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              {app_content}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {buy_content}
                {gallery_content}
              </div>
              {nfc_content}
            </div>
          </div>
        """
    
    code = before_ebooks + new_blocks + after_ternary

# Also apply the mobile nav and hideMobileNav
code = code.replace(
    '<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>',
    '<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} hideMobileNav={true}>\n      <div className="pb-24">'
)
code = code.replace(
    '</AdminLayout>',
    '      </div>\n    </AdminLayout>'
)

tabs_div = '<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden hidden md:block"'
if tabs_div not in code:
    tabs_div_old = '<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden"'
    tabs_start = code.find(tabs_div_old)
    if tabs_start != -1:
        tabs_end = code.find('</div>\n        </div>', tabs_start) + 22
        
        new_bottom_nav = """
        <div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden hidden md:block" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="inline-flex bg-black/5 dark:bg-white/5 p-1.5 rounded-[16px] gap-1">
            <button onClick={() => setActiveTab('analytics')} className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>Analytics</button>
            <button onClick={() => setActiveTab('social')} className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'social' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>Socials</button>
            <button onClick={() => setActiveTab('profile')} className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>Profile</button>
            <button onClick={() => setActiveTab('ebooks')} className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'ebooks' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>Ebooks</button>
            <button onClick={() => setActiveTab('settings')} className={`shrink-0 px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}>Settings</button>
          </div>
        </div>
        
        {/* Mobile Custom Nav Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f4f4f5] dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5 pb-6 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          <div className="flex items-center justify-around h-[64px] px-2 relative">
            <button onClick={() => setActiveTab('analytics')} className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'analytics' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}>
              {activeTab === 'analytics' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}`}><Activity className="w-5 h-5" /></div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'analytics' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Analytics</span>
            </button>
            <button onClick={() => setActiveTab('social')} className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'social' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}>
              {activeTab === 'social' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'social' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}`}><Share className="w-5 h-5" /></div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'social' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Socials</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'profile' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}>
              {activeTab === 'profile' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}`}><UserCircle className="w-5 h-5" /></div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'profile' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Profile</span>
            </button>
            <button onClick={() => setActiveTab('ebooks')} className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'ebooks' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}>
              {activeTab === 'ebooks' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'ebooks' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}`}><Wallet className="w-5 h-5" /></div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'ebooks' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Ebooks</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'settings' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}>
              {activeTab === 'settings' && <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-[#0a0a0a] rounded-full -z-10" />}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-[#0a0a0a]' : 'bg-transparent'}`}><Settings className="w-5 h-5" /></div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'settings' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Settings</span>
            </button>
          </div>
        </nav>
        """
        code = code[:tabs_start] + new_bottom_nav + code[tabs_end:]

# 4. Extract Social Media from profile
social_start = code.find('{/* Social Media */}')
links_start = code.find('{/* Links */}')
if social_start != -1 and links_start != -1:
    social_block = code[social_start:links_start]
    code = code[:social_start] + code[links_start:]
    
    ebooks_marker = ") : profile && activeTab === 'ebooks' ? ("
    e_idx = code.find(ebooks_marker)
    if e_idx != -1:
        new_social = f""") : profile && activeTab === 'social' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
              {social_block}
            </div>
          </div>
        """
        code = code[:e_idx] + new_social + code[e_idx:]


with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Done")
