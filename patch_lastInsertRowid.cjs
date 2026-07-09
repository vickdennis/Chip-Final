const fs = require('fs');
let file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /id: info\.lastInsertRowid/g,
  'id: Number(info.lastInsertRowid)'
);

fs.writeFileSync(file, content);
