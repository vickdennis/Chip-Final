const fs = require('fs');
const file = 'src/components/DashboardAnalytics.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace props
content = content.replace("export default function DashboardAnalytics({ profile, onUpgrade }: { profile: any, onUpgrade: () => void }) {",
"export default function DashboardAnalytics({ profile, onUpgrade, profileViews = 0 }: { profile: any, onUpgrade: () => void, profileViews?: number }) {");

// replace liveViews initialization
content = content.replace("const [liveViews, setLiveViews] = useState(profile?.profile_views || 0);",
"const [liveViews, setLiveViews] = useState(profileViews);");

// replace liveClicks initialization
content = content.replace("const [liveClicks, setLiveClicks] = useState(Math.floor((profile?.profile_views || 0) * 0.4));",
"const [liveClicks, setLiveClicks] = useState(Math.floor(profileViews * 0.4));");

// replace effect dependency
content = content.replace("}, [profile]);", "}, [profile, profileViews]);");

fs.writeFileSync(file, content);
