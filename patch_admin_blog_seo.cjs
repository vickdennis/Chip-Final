const fs = require('fs');
let code = fs.readFileSync('src/views/AdminBlogManager.tsx', 'utf8');

const importStart = `const [products, setProducts] = useState<any[]>([]);`;
const importNew = `const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('Realtor');`;

code = code.replace(importStart, importNew);

const editPostStart = `if (post.faq_json) setFaqs(JSON.parse(post.faq_json));
                    fetch('/api/post-product/' + post.slug).then(r=>r.json()).then(d => setSelectedProductId(d.product_id)).catch(console.error);`;
const editPostNew = `if (post.faq_json) setFaqs(JSON.parse(post.faq_json));
                    fetch('/api/post-product/' + post.slug).then(r=>r.json()).then(d => setSelectedProductId(d.product_id)).catch(console.error);
                    fetch('/api/post-categories/' + post.slug).then(r=>r.json()).then(d => setCategory(d.category || 'Realtor')).catch(console.error);`;

code = code.replace(editPostStart, editPostNew);

const createPostStart = `setPostForm({ title: '', slug: '', content: '', excerpt: '', cover_image_url: '', meta_title: '', meta_description: '', focus_keyword: '', is_published: false, faq_json: '', product_json: '' });
              setFaqs([]);`;
const createPostNew = `setPostForm({ title: '', slug: '', content: '', excerpt: '', cover_image_url: '', meta_title: '', meta_description: '', focus_keyword: '', is_published: false, faq_json: '', product_json: '' });
              setFaqs([]);
              setCategory('Realtor');`;
code = code.replace(createPostStart, createPostNew);

const savePostStart = `if (publish) {
        if (!postForm.slug) {
          alert('Slug is required to publish.');
          return;
        }
      }
      
      try {
        const faqStr = faqs.length > 0 ? JSON.stringify(faqs) : '';
        const finalForm = { ...postForm, is_published: publish, published_at: publish ? new Date().toISOString() : null };
        delete finalForm.faq_json;
        delete finalForm.product_json;
        delete finalForm.focus_keyword;
        
        if (creatingPost) {`;

const savePostNew = `if (publish) {
        if (!postForm.slug) {
          alert('Slug is required to publish.');
          return;
        }
      }
      
      try {
        // Auto-Link Processing
        let contentToSave = postForm.content;
        if (publish) {
           const linkRes = await fetch('/api/seo/auto-link', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ content: contentToSave, post_slug: postForm.slug })
           });
           if (linkRes.ok) {
             const data = await linkRes.json();
             if (data.content) contentToSave = data.content;
           }
        }

        const faqStr = faqs.length > 0 ? JSON.stringify(faqs) : '';
        const finalForm = { ...postForm, content: contentToSave, is_published: publish, published_at: publish ? new Date().toISOString() : null };
        delete finalForm.faq_json;
        delete finalForm.product_json;
        delete finalForm.focus_keyword;
        
        if (creatingPost) {`;

code = code.replace(savePostStart, savePostNew);

const saveCatStart = `if (selectedProductId !== null) {
         await fetch('/api/post-product', {
           method: 'POST',
           headers: {'Content-Type':'application/json'},
           body: JSON.stringify({ post_slug: finalForm.slug, product_id: selectedProductId })
         });
      }`;
const saveCatNew = `if (selectedProductId !== null) {
         await fetch('/api/post-product', {
           method: 'POST',
           headers: {'Content-Type':'application/json'},
           body: JSON.stringify({ post_slug: finalForm.slug, product_id: selectedProductId })
         });
      }
      
      await fetch('/api/post-categories', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ post_slug: finalForm.slug, category })
      });`;

code = code.replace(saveCatStart, saveCatNew);

const catInputStart = `<div>
                    <label className="block text-sm font-bold mb-1">Focus Keyword</label>
                    <input type="text" className="w-full p-2 bg-transparent border border-[#cfc4c5] dark:border-[#333] rounded-md" value={postForm.focus_keyword} onChange={e => setPostForm({...postForm, focus_keyword: e.target.value})} />
                  </div>`;
const catInputNew = `<div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select className="w-full p-2 bg-transparent border border-[#cfc4c5] dark:border-[#333] rounded-md" value={category} onChange={e => setCategory(e.target.value)}>
                      <option value="Realtor">Realtor</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Founder">Founder</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Focus Keyword</label>
                    <input type="text" className="w-full p-2 bg-transparent border border-[#cfc4c5] dark:border-[#333] rounded-md" value={postForm.focus_keyword} onChange={e => setPostForm({...postForm, focus_keyword: e.target.value})} />
                  </div>`;

code = code.replace(catInputStart, catInputNew);

fs.writeFileSync('src/views/AdminBlogManager.tsx', code);
