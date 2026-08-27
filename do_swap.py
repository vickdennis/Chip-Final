import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Desktop Nav Tab
code = re.sub(
    r"onClick=\{\(\) => setActiveTab\('analytics'\)\}([\s\S]*?)activeTab === 'analytics' \?([\s\S]*?)Analytics(\s*)</button>",
    r"onClick={() => setActiveTab('nfc')}\1activeTab === 'nfc' ?\2Order NFC\3</button>",
    code
)

# 2. Mobile Nav Tab
code = re.sub(
    r"\{\s*id:\s*'analytics',\s*label:\s*'Analytics',\s*icon:\s*Activity\s*\}",
    r"{ id: 'nfc', label: 'Order NFC', icon: SmartphoneNfc }",
    code
)

# 3. Swap the components
# Change `activeTab === 'analytics' ?` to `activeTab === 'nfc' ?`
# and `DashboardAnalytics` to `NfcProgrammer`
code = re.sub(
    r"\) : profile && activeTab === 'analytics' \? \([\s\S]*?<DashboardAnalytics[^\>]*/>([\s\S]*?)\) : profile && activeTab === 'profile'",
    r") : profile && activeTab === 'nfc' ? (\n          <div className=\"grid grid-cols-1 xl:grid-cols-12 gap-8\">\n            <div className=\"xl:col-span-12 flex flex-col gap-8\">\n              <NfcProgrammer profile={profile} />\n            </div>\n          </div>\n        ) : profile && activeTab === 'profile'",
    code
)

# Add DashboardAnalytics to the settings tab
settings_start_pattern = r"(\) : profile && activeTab === 'settings' \? \(\s*<div className=\"grid grid-cols-1 xl:grid-cols-12 gap-8\">\s*<div className=\"xl:col-span-12 flex flex-col gap-8\">)"
code = re.sub(
    settings_start_pattern,
    r"\1\n              <DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />",
    code
)

# Remove NfcProgrammer from the end of the settings tab
code = re.sub(
    r"(\s*)<NfcProgrammer profile=\{profile\} />(\s*)</div>(\s*)</div>(\s*)\) : null}",
    r"\2</div>\3</div>\4) : null}",
    code
)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Swapped tabs successfully")
