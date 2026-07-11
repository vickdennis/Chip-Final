const fs = require('fs');
const file = 'src/views/UserDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("<DashboardAnalytics profile={profile} onUpgrade={() => setActiveTab('appearance')} />",
"<DashboardAnalytics profile={profile} profileViews={profileViews} onUpgrade={() => setActiveTab('appearance')} />");

fs.writeFileSync(file, content);
