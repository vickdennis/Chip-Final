const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const targetState = `const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'links' | 'social' | 'shop' | 'appearance' | 'gallery' | 'nfc' | 'buy-nfc'>('profile');`;

const insertState = `const [activeTab, setActiveTab] = useState<'analytics' | 'profile' | 'links' | 'social' | 'shop' | 'appearance' | 'gallery' | 'nfc' | 'buy-nfc'>('profile');

  const [setupGuideActive, setSetupGuideActive] = useState(false);
  const [setupStep, setSetupStep] = useState(1);

  const hasBasicInfo = !!(profile?.full_name && profile?.headline && profile?.bio);
  const hasContactInfo = !!(profile?.contact_email || profile?.phone_number);
  const hasSocialLinks = socialLinks.length > 0;
  const hasFeaturedLinks = links.length > 0;
  const hasAppearance = profile?.theme || profile?.bg_color;
  
  const setupSteps = [
    { id: 1, name: 'Profile Basics', completed: hasBasicInfo, tab: 'profile' },
    { id: 2, name: 'Contact Details', completed: hasContactInfo, tab: 'profile' },
    { id: 3, name: 'Social Links', completed: hasSocialLinks, tab: 'profile' },
    { id: 4, name: 'Featured Links', completed: hasFeaturedLinks, tab: 'profile' },
    { id: 5, name: 'Appearance', completed: !!hasAppearance, tab: 'appearance' },
  ];
  const completedSteps = setupSteps.filter(s => s.completed).length;
  const completionRate = Math.round((completedSteps / setupSteps.length) * 100);`;

if (content.includes(targetState)) {
  content = content.replace(targetState, insertState);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log("Patched state.");
} else {
  console.log("Target state not found.");
}
