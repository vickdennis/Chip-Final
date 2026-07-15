const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

content = content.replace(/text-black\/50/g, 'text-black/60');
content = content.replace(/text-black\/40/g, 'text-black/60');

fs.writeFileSync('src/views/LandingView.tsx', content);
console.log("Patched contrast.");
