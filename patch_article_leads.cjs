const fs = require('fs');
let code = fs.readFileSync('src/views/BlogArticleView.tsx', 'utf8');

const importLead = `import { LeadForm } from '../components/LeadCapture';`;

if (!code.includes('import { LeadForm }')) {
  code = code.replace(
    `import Markdown from 'react-markdown';`,
    `import Markdown from 'react-markdown';\n${importLead}`
  );
  if (!code.includes('import { LeadForm }')) {
      code = code.replace(
        `import { format } from 'date-fns';`,
        `import { format } from 'date-fns';\n${importLead}`
      );
  }
}

const componentStartOld = `  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);`;

const componentStartNew = `  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [contentParts, setContentParts] = useState<string[]>([]);
  const [showSticky, setShowSticky] = useState(false);`;

code = code.replace(componentStartOld, componentStartNew);

const useEffectOld = `  useEffect(() => {
    fetchPost();
  }, [slug]);`;

const useEffectNew = `  useEffect(() => {
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.content) {
      const parts = post.content.split('</p>');
      if (parts.length > 2) {
        const part1 = parts.slice(0, 2).join('</p>') + '</p>';
        const part2 = parts.slice(2).join('</p>');
        setContentParts([part1, part2]);
      } else {
        setContentParts([post.content]);
      }
    }
  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollPos / docHeight > 0.6) {
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);`;

if (!code.includes('setContentParts')) {
    code = code.replace(useEffectOld, useEffectNew);
}

const markdownOld = `        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert prose-blue mx-auto max-w-3xl prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 mb-16">
          <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: post.content || '' }}></div>
        </div>`;

const markdownNew = `        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert prose-blue mx-auto max-w-3xl prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 mb-16">
          {contentParts.length > 1 ? (
            <>
              <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: contentParts[0] }}></div>
              <LeadForm postSlug={post.slug} postTitle={post.title} source="inline" />
              <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: contentParts[1] }}></div>
            </>
          ) : (
            <>
              <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: contentParts[0] || post.content || '' }}></div>
              <LeadForm postSlug={post.slug} postTitle={post.title} source="inline" />
            </>
          )}
        </div>`;

if (!code.includes('LeadForm postSlug')) {
    code = code.replace(markdownOld, markdownNew);
}

const stickyEndOld = `    </div>
  );
}`;

const stickyEndNew = `      {/* Sticky Bottom Bar */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full md:hidden transition-all duration-300">
          <LeadForm postSlug={post.slug} postTitle={post.title} source="sticky" />
        </div>
      )}
    </div>
  );
}`;

if (!code.includes('showSticky &&')) {
    code = code.replace(stickyEndOld, stickyEndNew);
}

fs.writeFileSync('src/views/BlogArticleView.tsx', code);
