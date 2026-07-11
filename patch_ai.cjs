const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `const jsonStr = text.replace(/\\\\s*\\\`\\\`\\\`json/g, '').replace(/\\\`\\\`\\\`/g, '').trim();`;
const replacement = `const jsonStr = text.replace(/\\s*\`\`\`json/ig, '').replace(/\`\`\`/g, '').trim();`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
