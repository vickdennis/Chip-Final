const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace("if (path === '/dashboard') return 'user-dashboard';", "if (path === '/dashboard') return 'user-dashboard';\n    if (path === '/test-dashboard') return 'user-dashboard';");
fs.writeFileSync('src/App.tsx', content);
