const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

content = content.replace(/setActiveTab\(nextStep\.tab\);/g, "setActiveTab(nextStep.tab as any);");

fs.writeFileSync('src/views/UserDashboard.tsx', content);
console.log("Patched tab error.");
