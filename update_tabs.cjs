const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// Change valid activeTab values
content = content.replace(
  /const \[activeTab, setActiveTab\] = useState<'analytics' \| 'profile' \| 'links' \| 'social' \| 'shop' \| 'appearance' \| 'gallery' \| 'nfc' \| 'buy-nfc'>\('profile'\);/,
  `const [activeTab, setActiveTab] = useState<'analytics' | 'social' | 'profile' | 'ebooks' | 'settings'>('profile');`
);

// We need to move Socials out of profile, and group settings.
// I'll do this by matching the blocks. This is a bit complex for a simple replace.
