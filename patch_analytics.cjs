const fs = require('fs');
let file = 'src/components/DashboardAnalytics.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const [liveViews, setLiveViews] = useState(profileViews);
  const [liveClicks, setLiveClicks] = useState(Math.floor(profileViews * 0.4));
  
  // Simulated real-time activity if Pro
  useEffect(() => {
    setLiveViews(profileViews);
    setLiveClicks(Math.floor(profileViews * 0.4));
    if (profile?.is_pro || profile?.is_admin) {
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          setLiveViews(v => v + 1);
          if (Math.random() > 0.5) setLiveClicks(c => c + 1);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [profile, profileViews]);`;

const replacement = `  const [liveViews, setLiveViews] = useState(profileViews);
  const [liveClicks, setLiveClicks] = useState(profile?.clicks || 0);
  
  useEffect(() => {
    setLiveViews(profileViews);
    setLiveClicks(profile?.clicks || 0);
  }, [profile, profileViews]);`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
