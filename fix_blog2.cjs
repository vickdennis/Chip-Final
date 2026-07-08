const fs = require('fs');
let file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "return m ? { ...p, views: m.views || 0, product_json: m.product_json, faq_json: m.faq_json } : { ...p, views: 0 };",
  "return m ? { ...p, views: m.views || 0, product_json: m.product_json, faq_json: m.faq_json, focus_keyword: m.focus_keyword } : { ...p, views: 0 };"
);

fs.writeFileSync(file, content);
