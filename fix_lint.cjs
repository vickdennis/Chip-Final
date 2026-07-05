const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');

// Fix interface
code = code.replace(
  "  keywords: string[];\n  faq_json?: string;\n  product_json?: string;",
  "  excerpt: string;\n  keywords: string[];\n  faq_json?: string;\n  product_json?: string;"
);

// Fix select
code = code.replace(
  "select('id, title, slug, cover_image_url')",
  "select('id, title, slug, cover_image_url, keywords')"
);

fs.writeFileSync('src/views/BlogArticleView.tsx', code);
