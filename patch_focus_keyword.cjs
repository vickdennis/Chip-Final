const fs = require('fs');
const file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("delete finalForm.focus_keyword;", "");
fs.writeFileSync(file, content);
