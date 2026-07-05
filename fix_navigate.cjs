const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');
code = code.replace(
  "onNavigateToArticle={(slug) => { window.scrollTo(0,0); onNavigate('blog-article'); window.history.pushState({}, '', `/blog/${slug}`); }}",
  "onNavigateToArticle={(slug) => { window.location.href = `/blog/${slug}`; }}"
);
fs.writeFileSync('src/views/BlogArticleView.tsx', code);
