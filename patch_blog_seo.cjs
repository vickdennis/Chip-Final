const fs = require('fs');
const file = 'src/views/BlogArticleView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<link rel="canonical" href={\`https://chipng.com/blog/\${post.slug}\`} />`;

const replacement = `<link rel="canonical" href={\`https://chipng.com/blog/\${post.slug}\`} />
        
        {/* Search Engine & AI Optimization Meta Tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="CHIP NG" />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        <meta property="article:modified_time" content={post.updated_at || post.created_at} />

        {/* BlogPosting Schema for Rich Snippets & AI Context */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": \`https://chipng.com/blog/\${post.slug}\`
            },
            "headline": post.title,
            "description": post.meta_description || post.excerpt,
            "image": post.cover_image_url ? [post.cover_image_url] : [],
            "datePublished": post.published_at || post.created_at,
            "dateModified": post.updated_at || post.created_at,
            "author": {
              "@type": "Organization",
              "name": "CHIP NG",
              "url": "https://chipng.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "CHIP NG",
              "logo": {
                "@type": "ImageObject",
                "url": "https://chipng.com/IMG_0513.jpeg"
              }
            }
          }) }} />`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
