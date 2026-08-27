import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Desktop Nav Tab
code = code.replace("onClick={() => setActiveTab('analytics')}", "onClick={() => setActiveTab('nfc')}")
code = code.replace("activeTab === 'analytics' ?", "activeTab === 'nfc' ?")
code = code.replace("              Analytics\n            </button>", "              Order NFC\n            </button>")

# 2. Mobile Nav Tab
old_mobile_tabs = """            {[
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'ebooks', label: 'Ebooks', icon: Wallet },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {"""
new_mobile_tabs = """            {[
              { id: 'nfc', label: 'Order NFC', icon: SmartphoneNfc },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'ebooks', label: 'Ebooks', icon: Wallet },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {"""
code = code.replace(old_mobile_tabs, new_mobile_tabs)

# 3. Swap the components
old_analytics_block = """        ) : profile && activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />
            </div>
          </div>"""
          
new_nfc_block = """        ) : profile && activeTab === 'nfc' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <NfcProgrammer profile={profile} />
            </div>
          </div>"""
code = code.replace(old_analytics_block, new_nfc_block)

# Remove NfcProgrammer from Settings block
# It looks like: 
#              </div>
#              <NfcProgrammer profile={profile} />
#            </div>
#          </div>
#        ) : null}

code = code.replace("              </div>\n              <NfcProgrammer profile={profile} />\n            </div>", "              </div>\n            </div>")

# Add DashboardAnalytics to Settings block
# Add it before the Sign Out section.
settings_start = """        ) : profile && activeTab === 'settings' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">"""
new_settings_start = """        ) : profile && activeTab === 'settings' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />"""
code = code.replace(settings_start, new_settings_start)

# But wait, we just replaced `activeTab === 'analytics' ?` with `activeTab === 'nfc' ?` at the top of the file!
# Ah, I replaced it globally:
# code = code.replace("activeTab === 'analytics' ?", "activeTab === 'nfc' ?")
# So `old_analytics_block` won't match if it was already changed by the previous `replace` !
