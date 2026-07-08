const fs = require('fs');

let articleFile = 'src/views/BlogArticleView.tsx';
let articleContent = fs.readFileSync(articleFile, 'utf8');
articleContent = articleContent.replace(
  "  product_json?: string;\n}",
  "  product_json?: string;\n  created_at: string;\n  updated_at: string;\n}"
);
fs.writeFileSync(articleFile, articleContent);

