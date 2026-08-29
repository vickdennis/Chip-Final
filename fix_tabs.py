import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

old_dropdown = """            {/* Plus Dropdown Group */}
            <div className="relative group pb-4">
              <button 
                onClick={() => setActiveTab('leads')}
                className={`font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${['leads', 'buybox', 'seo', 'broadcast', 'notifications'].includes(activeTab) ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              >
                <Plus className="w-4 h-4" /> Tools
              </button>
              
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40 overflow-hidden flex flex-col p-2">
                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'leads' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('leads')}
                >
                  <Users className="w-4 h-4" /> Leads
                </button>
                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'buybox' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('buybox')}
                >
                  <Package className="w-4 h-4" /> BuyBox
                </button>
                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'seo' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('seo')}
                >
                  <Search className="w-4 h-4" /> SEO
                </button>
                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'broadcast' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('broadcast')}
                >
                  <Send className="w-4 h-4" /> Broadcast
                </button>
                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'notifications' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="w-4 h-4" /> In-App Notifications
                </button>
              </div>
            </div>"""

new_tabs = """            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'leads' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('leads')}
            >
              <Users className="w-4 h-4" /> Leads
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'buybox' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('buybox')}
            >
              <Package className="w-4 h-4" /> BuyBox
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'seo' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('seo')}
            >
              <Search className="w-4 h-4" /> SEO
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'broadcast' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('broadcast')}
            >
              <Send className="w-4 h-4" /> Broadcast
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'notifications' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-4 h-4" /> In-App Notifications
            </button>"""

if old_dropdown in code:
    code = code.replace(old_dropdown, new_tabs)
    with open('src/views/AdminDashboard.tsx', 'w') as f:
        f.write(code)
    print("Successfully replaced dropdown with scrollable tabs.")
else:
    print("Dropdown code not found, let's search for partial match.")

