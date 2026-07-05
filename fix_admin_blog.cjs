const fs = require('fs');
let code = fs.readFileSync('src/views/AdminBlogManager.tsx', 'utf8');

// Remove faq_json and product_json from the final form payload sent to Supabase
code = code.replace(
  "const finalForm = { ...postForm, faq_json: faqStr, is_published: publish, published_at: publish ? new Date().toISOString() : null };",
  "const finalForm = { ...postForm, is_published: publish, published_at: publish ? new Date().toISOString() : null };\n      delete finalForm.faq_json;\n      delete finalForm.product_json;"
);

fs.writeFileSync('src/views/AdminBlogManager.tsx', code);
