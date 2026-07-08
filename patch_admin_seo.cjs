const fs = require('fs');
const file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `{showSeo && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1 flex justify-between">`;
                    
const replacement = `{showSeo && (
                <div className="p-4 space-y-4">
                  <div className="flex justify-end">
                     <button
                        type="button"
                        onClick={async () => {
                          if (!postForm.content) return alert('Add some content first.');
                          try {
                            const res = await fetch('/api/seo/auto-meta', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ content: postForm.content })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setPostForm({
                                ...postForm,
                                meta_title: data.meta_title || postForm.meta_title,
                                meta_description: data.meta_description || postForm.meta_description,
                                focus_keyword: data.focus_keyword || postForm.focus_keyword
                              });
                            }
                          } catch (e) {
                            console.error(e);
                            alert('Failed to generate AI meta');
                          }
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-[11px] font-bold font-mono hover:bg-blue-500/30 transition-colors flex items-center gap-1"
                     >
                       <Zap className="w-3 h-3" /> Auto-Generate via AI
                     </button>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1 flex justify-between">`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
