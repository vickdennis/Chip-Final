const fs = require('fs');
let code = fs.readFileSync('src/views/BlogDirectoryView.tsx', 'utf8');

const newFetch = `  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, keywords, content')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);
`;

const oldFetch = `  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, keywords, content')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };`;

const newMap = `{currentPosts.map(post => (`;
const oldMap = `{posts.map(post => (`;

const oldEnd = `          </div>
        )}
      </main>
    </div>
  );
}`;

const newEnd = `          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#cfc4c5] dark:border-[#333] rounded-md disabled:opacity-50 font-bold text-sm hover:bg-black/5"
            >
              Previous
            </button>
            <span className="text-sm font-bold mx-4 text-[#7e7576]">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-[#cfc4c5] dark:border-[#333] rounded-md disabled:opacity-50 font-bold text-sm hover:bg-black/5"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}`;

code = code.replace(oldFetch, newFetch);
code = code.replace(oldMap, newMap);
code = code.replace(oldEnd, newEnd);

fs.writeFileSync('src/views/BlogDirectoryView.tsx', code);
