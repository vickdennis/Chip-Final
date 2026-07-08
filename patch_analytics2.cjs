const fs = require('fs');
const file = 'src/components/DashboardAnalytics.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("useEffect(() => {",
`useEffect(() => {
    setLiveViews(profileViews);
    setLiveClicks(Math.floor(profileViews * 0.4));`);

fs.writeFileSync(file, content);
