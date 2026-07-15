const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

content = content.replace(/text-white\/70/g, 'text-black/70 dark:text-white/70');
content = content.replace(/text-white\/90/g, 'text-black/90 dark:text-white/90');

fs.writeFileSync('src/views/LandingView.tsx', content);
console.log("Patched LandingView2.");
