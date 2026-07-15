const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

content = content.replace(/from-\[#141417\]/g, 'from-gray-100 dark:from-[#141417]');
content = content.replace(/to-\[#0A0A0B\]/g, 'to-gray-50 dark:to-[#0A0A0B]');

content = content.replace(/bg-neutral-950/g, 'bg-gray-50 dark:bg-neutral-950');

fs.writeFileSync('src/views/LandingView.tsx', content);
console.log("Fixed LandingView light mode.");
