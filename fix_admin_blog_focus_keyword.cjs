const fs = require('fs');
let code = fs.readFileSync('src/views/AdminBlogManager.tsx', 'utf8');

code = code.replace(
  "delete finalForm.product_json;",
  "delete finalForm.product_json;\n      delete finalForm.focus_keyword;"
);

fs.writeFileSync('src/views/AdminBlogManager.tsx', code);
