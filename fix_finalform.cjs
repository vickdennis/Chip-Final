const fs = require('fs');
let file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "const finalForm = { ...postForm, content: finalContent, is_published: publish, published_at: publish ? new Date().toISOString() : null };\n      delete finalForm.faq_json;\n      delete finalForm.product_json;\n      delete finalForm.focus_keyword;",
  "const { focus_keyword, product_json, faq_json, ...restForm } = postForm;\n      const finalForm = { ...restForm, content: finalContent, is_published: publish, published_at: publish ? new Date().toISOString() : null };"
);

fs.writeFileSync(file, content);
