const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');

const importBuyBox = `import { BuyBox } from '../components/BuyBox';`;
const newImports = `import { BuyBox } from '../components/BuyBox';\nimport { RelatedPosts } from '../components/RelatedPosts';`;

if (!code.includes('RelatedPosts')) {
  code = code.replace(importBuyBox, newImports);
}

const endOfArticle = `</div>

        {/* Share Section */}`;

const newEndOfArticle = `</div>

        {/* Share Section */}`; // We can leave Share Section where it is

const closeArticle = `</article>`;
const newCloseArticle = `<RelatedPosts currentPostSlug={post.slug} currentKeywords={post.keywords || []} />
      </article>`;

if (!code.includes('<RelatedPosts')) {
  code = code.replace(closeArticle, newCloseArticle);
}

fs.writeFileSync('src/views/BlogArticleView.tsx', code);
