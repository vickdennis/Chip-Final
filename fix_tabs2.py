import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

pattern = r"\{/\* Plus Dropdown Group \*/\}.*?</button>\s*</div>\s*</div>"
replacement = """            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'leads' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('leads')}
            >
              <Users className="w-4 h-4" /> Leads
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'buybox' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('buybox')}
            >
              <Package className="w-4 h-4" /> Buy Box
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'seo' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('seo')}
            >
              <Search className="w-4 h-4" /> SEO
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'broadcast' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('broadcast')}
            >
              <Send className="w-4 h-4" /> Broadcast
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'notifications' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-4 h-4" /> In-App Notifications
            </button>"""

new_code = re.sub(pattern, replacement, code, flags=re.DOTALL)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(new_code)

print("Successfully replaced dropdown with scrollable tabs using regex.")

