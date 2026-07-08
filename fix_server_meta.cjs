const fs = require('fs');
let file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "CREATE TABLE IF NOT EXISTS post_meta (\n    post_slug TEXT PRIMARY KEY,\n    product_json TEXT,\n    faq_json TEXT,\n    views INTEGER DEFAULT 0\n  );",
  "CREATE TABLE IF NOT EXISTS post_meta (\n    post_slug TEXT PRIMARY KEY,\n    product_json TEXT,\n    faq_json TEXT,\n    views INTEGER DEFAULT 0,\n    focus_keyword TEXT\n  );"
);

content = content.replace(
  "const { post_slug, product_json, faq_json } = req.body;",
  "const { post_slug, product_json, faq_json, focus_keyword } = req.body;"
);

content = content.replace(
  "db.prepare('INSERT INTO post_meta (post_slug, product_json, faq_json) VALUES (?, ?, ?) ON CONFLICT(post_slug) DO UPDATE SET product_json=excluded.product_json, faq_json=excluded.faq_json').run(post_slug, product_json, faq_json);",
  "db.prepare('INSERT INTO post_meta (post_slug, product_json, faq_json, focus_keyword) VALUES (?, ?, ?, ?) ON CONFLICT(post_slug) DO UPDATE SET product_json=excluded.product_json, faq_json=excluded.faq_json, focus_keyword=excluded.focus_keyword').run(post_slug, product_json, faq_json, focus_keyword);"
);

fs.writeFileSync(file, content);
