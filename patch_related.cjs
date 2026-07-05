const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');

const shareEnd = `          </div>
        </div>
      </article>
    </div>
  );
}`;

const relatedNew = `          </div>
        </div>

        {/* Related Posts */}
        {post.keywords && post.keywords.length > 0 && (
          <RelatedPosts keywords={post.keywords} currentPostId={post.id} onNavigateToArticle={(slug) => { window.scrollTo(0,0); onNavigate('blog-article'); window.history.pushState({}, '', \`/blog/\${slug}\`); }} />
        )}
      </article>
    </div>
  );
}

function RelatedPosts({ keywords, currentPostId, onNavigateToArticle }: { keywords: string[], currentPostId: string, onNavigateToArticle: (slug: string) => void }) {
  const [related, setRelated] = useState<any[]>([]);
  
  useEffect(() => {
    async function fetchRelated() {
      // Fetch posts that overlap in keywords
      // Since Supabase doesn't easily do array intersection without RPC, we'll just fetch a bunch and filter locally for simplicity in this demo, or just fetch recent.
      const { data } = await supabase.from('posts').select('id, title, slug, cover_image_url').eq('is_published', true).neq('id', currentPostId).limit(10);
      if (data) {
        // Filter those that have at least one matching keyword (or just take first 3 if none)
        let matches = data.filter(p => p.keywords && p.keywords.some((k: string) => keywords.includes(k)));
        if (matches.length < 3) {
           matches = [...matches, ...data.filter(p => !matches.find(m => m.id === p.id))].slice(0, 3);
        } else {
           matches = matches.slice(0, 3);
        }
        setRelated(matches);
      }
    }
    fetchRelated();
  }, [keywords, currentPostId]);

  if (related.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto pt-16 mt-16 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map(p => (
          <div key={p.id} className="group cursor-pointer" onClick={() => onNavigateToArticle(p.slug)}>
            <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              {p.cover_image_url ? (
                <img src={p.cover_image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
              )}
            </div>
            <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">{p.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}`;

code = code.replace(shareEnd, relatedNew);
fs.writeFileSync('src/views/BlogArticleView.tsx', code);
