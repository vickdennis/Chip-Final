const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');
content = content.replace(/  \);\n\}\}/, '  );\n}');
fs.writeFileSync('src/views/LandingView.tsx', content);
