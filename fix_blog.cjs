const fs = require('fs');
let file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "delete finalForm.product_json;",
  "delete finalForm.product_json;\n      delete finalForm.focus_keyword;"
);

// We should also pass focus_keyword to /api/post-meta
content = content.replace(
  "body: JSON.stringify({ post_slug: finalForm.slug, product_json: showProduct ? postForm.product_json : null, faq_json: faqStr })",
  "body: JSON.stringify({ post_slug: finalForm.slug, product_json: showProduct ? postForm.product_json : null, faq_json: faqStr, focus_keyword: postForm.focus_keyword })"
);

fs.writeFileSync(file, content);
