const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace("const isProtected = prev === 'admin-dashboard';", "const isProtected = prev === 'user-dashboard' || prev === 'admin-dashboard' || prev === 'enterprise-dashboard';");
content = content.replace("const isProtected = prevView === 'admin-dashboard' || prevView === 'enterprise-dashboard';", "const isProtected = prevView === 'user-dashboard' || prevView === 'admin-dashboard' || prevView === 'enterprise-dashboard';");
fs.writeFileSync('src/App.tsx', content);
