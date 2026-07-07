const fs = require('fs');
const file = 'src/views/BlogArticleView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Breadcrumb Schema
content = content.replace(
  /<script type="application\/ld\+json">\s*\{JSON\.stringify\(\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "BreadcrumbList",[\s\S]*?\}\)\}\s*<\/script>/,
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://chipng.com" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://chipng.com/blog" },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": \`https://chipng.com/blog/\${post.slug}\` }
            ]
          }) }} />`
);

// Replace FAQ Schema
content = content.replace(
  /<script type="application\/ld\+json">\s*\{JSON\.stringify\(\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "FAQPage",[\s\S]*?\}\)\}\s*<\/script>/,
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": JSON.parse(post.faq_json).map((faq: any) => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": { "@type": "Answer", "text": faq.a }
              }))
            }) }} />`
);

// Replace Product Schema
content = content.replace(
  /<script type="application\/ld\+json">\s*\{JSON\.stringify\(\{\s*"@context": "https:\/\/schema\.org\/",\s*"@type": "Product",[\s\S]*?\}\)\}\s*<\/script>/,
  `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": post.title,
              "description": post.meta_description || post.excerpt,
              ...JSON.parse(post.product_json)
            }) }} />`
);

fs.writeFileSync(file, content);
