const fs = require('fs');
const file = 'src/views/UserDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `        ) : profile && activeTab === 'profile' ? (`;

const replacement = `        ) : profile && activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-12 flex flex-col gap-8">
              <DashboardAnalytics profile={profile} onUpgrade={() => onNavigate('premium-themes')} />
            </div>
          </div>
        ) : profile && activeTab === 'profile' ? (`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
