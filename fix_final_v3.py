import re

with open('reorder_temp.cjs', 'r') as f:
    code = f.read()

# 1. Add hideMobileNav to AdminLayout
code = code.replace(
    '<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>',
    '<AdminLayout onNavigate={onNavigate} activePath="dashboard" isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} hideMobileNav={true}>\n      <div className="pb-24">'
)
code = code.replace(
    '</AdminLayout>',
    '      </div>\n    </AdminLayout>'
)

# 2. Add Mobile bottom nav
tabs_div = '<div className="mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden hidden md:block" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>'
tabs_end = code.find('</div>\n        </div>', code.find(tabs_div))
if tabs_end != -1:
    tabs_end += 22
    new_bottom_nav = """
        {/* Mobile Custom Nav Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#f4f4f5] dark:bg-black border-t border-black/5 dark:border-white/5 pb-6 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[32px]">
          <div className="flex items-center justify-around h-[64px] px-2 relative">
            
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'analytics' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'analytics' && (
                <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-black rounded-full -z-10" />
              )}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'analytics' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-black' : 'bg-transparent'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'analytics' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Analytics</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('social')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'social' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'social' && (
                <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-black rounded-full -z-10" />
              )}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'social' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-black' : 'bg-transparent'}`}>
                <Share className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'social' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Socials</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('profile')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'profile' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'profile' && (
                <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-black rounded-full -z-10" />
              )}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'profile' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-black' : 'bg-transparent'}`}>
                <UserCircle className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'profile' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Profile</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('ebooks')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'ebooks' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'ebooks' && (
                <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-black rounded-full -z-10" />
              )}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'ebooks' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-black' : 'bg-transparent'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'ebooks' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Ebooks</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[60px] gap-1 transition-all ${activeTab === 'settings' ? 'text-black dark:text-white -translate-y-5' : 'text-black/40 dark:text-white/40'}`}
            >
              {activeTab === 'settings' && (
                <div className="absolute -top-2 w-[72px] h-[72px] bg-[#f4f4f5] dark:bg-black rounded-full -z-10" />
              )}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/20 border-[6px] border-[#f4f4f5] dark:border-black' : 'bg-transparent'}`}>
                <Settings className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-semibold tracking-wide transition-all ${activeTab === 'settings' ? 'opacity-100 translate-y-1' : 'opacity-100'}`}>Settings</span>
            </button>

          </div>
        </nav>
"""
    code = code[:tabs_end] + new_bottom_nav + code[tabs_end:]

# 3. Extract Social Media
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

# 4. Wrap Gallery, nfc, buy-nfc inside settings
# First, remove old settings wrapper from end
old_settings_idx = code.find(") : profile && activeTab === 'settings' ? (")
if old_settings_idx != -1:
    end_of_old_settings = code.find('<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">', old_settings_idx)
    if end_of_old_settings != -1:
        code = code[:old_settings_idx] + code[end_of_old_settings:]

# Insert the settings condition wrapper BEFORE Gallery
gallery_content_start = code.find('<div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">')
if gallery_content_start != -1:
    # ADD THE MISSING </div> FOR EBOOKS HERE!!!
    code = code[:gallery_content_start] + "</div>\n        ) : profile && activeTab === 'settings' ? (\n          <div className=\"space-y-8\">\n" + code[gallery_content_start:]

# Remove nfc condition if exists
code = re.sub(r'<\/div>\s*\) : profile && activeTab === \'nfc\' \? \(\s*', '', code)

# Remove buy-nfc condition
code = re.sub(r'\s*\) : profile && activeTab === \'buy-nfc\' \? \(\s*<div className="grid grid-cols-1 xl:grid-cols-12 gap-8">\s*<div className="xl:col-span-8 flex flex-col gap-8">', '\n<div className="grid grid-cols-1 xl:grid-cols-12 gap-8"><div className="xl:col-span-12 flex flex-col gap-8">', code)

# We need a closing </div> for the `<div className="space-y-8">` we added above settings.
end_marker2 = code.find(") : null}")
if end_marker2 != -1:
    code = code[:end_marker2] + "</div>\n        " + code[end_marker2:]

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Done")
