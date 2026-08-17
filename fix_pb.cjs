const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

content = content.replace('pb-safe', 'pb-4 md:pb-0');

fs.writeFileSync('src/components/AdminLayout.tsx', content);
