with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

desktop_btn_old = """            <button 
              onClick={() => setActiveTab('analytics')}
              className={`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              Analytics
            </button>"""

desktop_btn_new = """            <button 
              onClick={() => setActiveTab('nfc')}
              className={`shrink-0 px-4 sm:px-6 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center gap-2 ${activeTab === 'nfc' ? 'bg-white dark:bg-[#222] shadow-sm text-black dark:text-white' : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <SmartphoneNfc className="w-4 h-4" />
              Order NFC
            </button>"""

code = code.replace(desktop_btn_old, desktop_btn_new)

mobile_tabs_old = """            {[
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'ebooks', label: 'Ebooks', icon: Wallet },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {"""

mobile_tabs_new = """            {[
              { id: 'nfc', label: 'Order NFC', icon: SmartphoneNfc },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'ebooks', label: 'Ebooks', icon: Wallet },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {"""

code = code.replace(mobile_tabs_old, mobile_tabs_new)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Updated nav tabs")
