const fs = require('fs');
const file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `const savePost = async (publish: boolean) => {
    try {
      const faqStr = faqs.length > 0 ? JSON.stringify(faqs) : '';
      const finalForm = { ...postForm, is_published: publish, published_at: publish ? new Date().toISOString() : null };`;

const replacement = `const savePost = async (publish: boolean) => {
    try {
      let finalContent = postForm.content;
      try {
        const linkRes = await fetch('/api/seo/auto-link', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({ content: postForm.content, post_slug: postForm.slug || 'draft' })
        });
        if (linkRes.ok) {
           const { content } = await linkRes.json();
           if (content) finalContent = content;
        }
      } catch (e) { console.error("Auto-link error", e); }
      
      const faqStr = faqs.length > 0 ? JSON.stringify(faqs) : '';
      const finalForm = { ...postForm, content: finalContent, is_published: publish, published_at: publish ? new Date().toISOString() : null };`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
