const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const jsonStr = text.*?trim\(\);/, "const jsonStr = text.replace(/```json/ig, '').replace(/```/g, '').trim();");
fs.writeFileSync(file, content);
