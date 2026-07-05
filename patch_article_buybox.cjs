const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');

const importLead = `import { LeadForm } from '../components/LeadCapture';`;
const newImports = `import { LeadForm } from '../components/LeadCapture';\nimport { BuyBox } from '../components/BuyBox';`;

if (!code.includes('import { BuyBox }')) {
  code = code.replace(importLead, newImports);
}

const endOfArticle = `</div>

        {/* Share Section */}`;

const newEndOfArticle = `</div>

        {/* Buy Box */}
        <div className="mx-auto max-w-3xl">
          <BuyBox postSlug={post.slug} />
        </div>

        {/* Share Section */}`;

if (!code.includes('<BuyBox')) {
  code = code.replace(endOfArticle, newEndOfArticle);
}

// Ensure layout allows sticky if needed? The prompt says: "Sticky on desktop: Right sidebar. Stacked on mobile: Under post."
// Oh wait. "Sticky on desktop: Right sidebar. Stacked on mobile: Under post."
// Currently the article is max-w-3xl centered. If I just add it inside `max-w-3xl`, it will be stacked on both.
// Let's modify the layout in `BlogArticleView.tsx` to have a right sidebar.

fs.writeFileSync('src/views/BlogArticleView.tsx', code);
