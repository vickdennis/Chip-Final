const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

content = content.replace(/bg-\[#111\]/g, 'bg-white dark:bg-[#111]');
content = content.replace(/bg-white dark:bg-black\/80/g, 'bg-black/40 dark:bg-black/80');

fs.writeFileSync('src/views/LandingView.tsx', content);
console.log("Fixed checkout modal background.");
