const fs = require('fs');
const file = 'src/views/UserDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<DashboardAnalytics profile={profile} onUpgrade={() => onNavigate('premium-themes')} />`;
const replacement = `<DashboardAnalytics profile={profile} onUpgrade={() => setActiveTab('appearance')} />`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
