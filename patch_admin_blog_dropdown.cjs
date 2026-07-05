const fs = require('fs');
let code = fs.readFileSync('src/views/AdminBlogManager.tsx', 'utf8');

const importStart = `const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);`;
const importNew = `const [faqs, setFaqs] = useState<{q: string, a: string}[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data)).catch(console.error);
  }, []);`;

code = code.replace(importStart, importNew);

const editPostStart = `setEditingPost(post);
                    setPostForm(post);
                    if (post.faq_json) setFaqs(JSON.parse(post.faq_json));`;
const editPostNew = `setEditingPost(post);
                    setPostForm(post);
                    if (post.faq_json) setFaqs(JSON.parse(post.faq_json));
                    fetch('/api/post-product/' + post.slug).then(r=>r.json()).then(d => setSelectedProductId(d.product_id)).catch(console.error);`;

code = code.replace(editPostStart, editPostNew);

const savePostStart = `if (error) throw error;
      }
      
      localStorage.removeItem('blog_draft');`;

const savePostNew = `if (error) throw error;
      }
      
      if (selectedProductId !== null) {
         await fetch('/api/post-product', {
           method: 'POST',
           headers: {'Content-Type':'application/json'},
           body: JSON.stringify({ post_slug: finalForm.slug, product_id: selectedProductId })
         });
      }
      
      localStorage.removeItem('blog_draft');`;

code = code.replace(savePostStart, savePostNew);

const dropdownUI = `<div>
                    <label className="block text-sm font-bold mb-1">Focus Keyword</label>
                    <input type="text" className="w-full p-2 bg-transparent border border-[#cfc4c5] dark:border-[#333] rounded-md" value={postForm.focus_keyword} onChange={e => setPostForm({...postForm, focus_keyword: e.target.value})} />
                  </div>`;

const dropdownUINew = `<div>
                    <label className="block text-sm font-bold mb-1">Focus Keyword</label>
                    <input type="text" className="w-full p-2 bg-transparent border border-[#cfc4c5] dark:border-[#333] rounded-md" value={postForm.focus_keyword} onChange={e => setPostForm({...postForm, focus_keyword: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Related Product (Buy Box)</label>
                    <select className="w-full p-2 bg-transparent border border-[#cfc4c5] dark:border-[#333] rounded-md" value={selectedProductId || ''} onChange={e => setSelectedProductId(e.target.value ? parseInt(e.target.value) : null)}>
                      <option value="">Default (First Product)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ₦{p.price_ngn}</option>
                      ))}
                    </select>
                  </div>`;

code = code.replace(dropdownUI, dropdownUINew);

fs.writeFileSync('src/views/AdminBlogManager.tsx', code);
