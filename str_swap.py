with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

analytics_block = """        ) : profile && activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />
            </div>
          </div>"""

nfc_block = """        ) : profile && activeTab === 'nfc' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <NfcProgrammer profile={profile} />
            </div>
          </div>"""

code = code.replace(analytics_block, nfc_block)

settings_block_start = """        ) : profile && activeTab === 'settings' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">"""

settings_block_new = """        ) : profile && activeTab === 'settings' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />"""

code = code.replace(settings_block_start, settings_block_new)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Did string swap")
