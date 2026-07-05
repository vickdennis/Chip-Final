const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');

const oldHeader = `<article className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">`;
const newHeader = `<div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 flex flex-col lg:flex-row gap-12">
      <article className="lg:w-[65%]">`;

code = code.replace(oldHeader, newHeader);

const oldFooter = `</article>
      {/* Sticky Bottom Bar */}`;
const newFooter = `</article>
      
      {/* Right Sidebar for Buy Box (Sticky Desktop) */}
      <aside className="lg:w-[35%] relative">
        <div className="sticky top-24">
          <BuyBox postSlug={post.slug} />
        </div>
      </aside>
      
      </div>
      {/* Sticky Bottom Bar */}`;

code = code.replace(oldFooter, newFooter);

// And we need to remove the inline BuyBox we just added at the bottom
const oldInlineBuybox = `{/* Buy Box */}
        <div className="mx-auto max-w-3xl">
          <BuyBox postSlug={post.slug} />
        </div>`;

code = code.replace(oldInlineBuybox, "");

fs.writeFileSync('src/views/BlogArticleView.tsx', code);
