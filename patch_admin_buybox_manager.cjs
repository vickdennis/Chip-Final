const fs = require('fs');
let file = 'src/views/AdminBuyBoxManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "body: JSON.stringify(form)",
  "body: JSON.stringify({ ...form, rating: Number(form.rating) || 0, review_count: Number(form.review_count) || 0 })"
);

fs.writeFileSync(file, content);
