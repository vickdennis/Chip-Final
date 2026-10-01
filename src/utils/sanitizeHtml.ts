import DOMPurify from 'dompurify';

/**
 * Checks if a string contains HTML tags
 */
export function isHtmlContent(content: string): boolean {
  if (!content) return false;
  return /<[a-z][\s\S]*>/i.test(content);
}

/**
 * Extracts a clean, plain text excerpt from HTML or markdown,
 * stripping all tags and normalizing whitespace.
 */
export function extractCleanExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return '';
  
  // First decode basic entities, then strip HTML tags
  let text = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    // Strip common markdown symbols if any
    .replace(/[#*_~`>\[\]]/g, '')
    // Normalize spaces and newlines
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  
  // Cut off at nearest word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 50 ? truncated.slice(0, lastSpace) : truncated).trim() + '...';
}

/**
 * Calculates estimated reading time in minutes based on ~200 words/minute
 */
export function calculateReadingTime(content: string): string {
  if (!content) return '1 min read';
  const cleanText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}

/**
 * Cleans up and normalizes external media in HTML.
 * Specifically handles Facebook reel URLs mistakenly placed in <img> tags.
 */
function normalizeExternalMedia(html: string): string {
  if (!html) return '';

  // Replace <img src="https://www.facebook.com/share/r/..."> with a responsive video/reel notice card
  const fbReelRegex = /<img[^>]+src=["'](https?:\/\/(?:www\.)?facebook\.com\/share\/r\/[^"']+)["'][^>]*>/gi;
  html = html.replace(fbReelRegex, (_match, url) => {
    return `
      <div class="my-6 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold text-sm">
            FB
          </div>
          <div>
            <div class="text-xs font-bold text-neutral-900 dark:text-white">Watch Video Demo on Facebook</div>
            <div class="text-[11px] text-neutral-500">Live tap demonstration of CHIP NG NFC card in Lagos</div>
          </div>
        </div>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-full bg-[#1877F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
          Open Reel &rarr;
        </a>
      </div>
    `;
  });

  return html;
}

/**
 * Converts markdown-style text to HTML if markdown is detected.
 * This preserves legacy articles like Post 1 and editorial fallbacks.
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  
  // If it's already HTML, don't re-process
  if (isHtmlContent(md) && !md.startsWith('###') && !md.startsWith('#')) {
    return md;
  }

  let html = md;

  // Process code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

  // Unordered Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  // Fix multiple ul wrappers
  html = html.replace(/<\/ul>\s*<ul>/gim, '');

  // Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');

  // Paragraphs
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(b => {
    b = b.trim();
    if (!b) return '';
    if (b.startsWith('<h') || b.startsWith('<blockquote') || b.startsWith('<ul') || b.startsWith('<ol') || b.startsWith('<pre') || b.startsWith('<div')) {
      return b;
    }
    return `<p>${b.replace(/\n/g, '<br/>')}</p>`;
  }).filter(Boolean).join('\n');

  return html;
}

/**
 * Sanitizes blog HTML safely using DOMPurify with strict Whitelisting.
 * Allows rich text formatting, lists, tables, images, links, blockquotes.
 * Eliminates XSS, script execution, javascript: links, and malicious attributes.
 */
export function sanitizeBlogHtml(rawContent: string): string {
  if (!rawContent) return '';

  let content = rawContent;

  // 1. If content contains escaped HTML entities (e.g. &lt;p&gt; or &lt;/p&gt;), safely decode them
  let passes = 0;
  while (/&lt;[a-z\/][\s\S]*&gt;/i.test(content) && passes < 2) {
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    passes++;
  }
  content = content.replace(/&nbsp;/g, ' ');

  // 2. If content is pure markdown, convert to HTML first
  if (!isHtmlContent(content)) {
    content = markdownToHtml(content);
  }

  // 3. Pre-process special media (e.g. Facebook Reels mistakenly in <img> tags)
  content = normalizeExternalMedia(content);

  // 4. Strip accidental metadata/prompt headers pasted into content
  content = content.replace(/^(\s*<p>(?:Focus\s+Keywords?|Secondary\s+Keywords?|Target\s+Keywords?):[^<]*<\/p>\s*)+/gi, '');
  content = content.replace(/^\s*<p>\s*-{2,}\s*<\/p>\s*/gi, '');
  content = content.replace(/^\s*<p>\s*NFC Business Cards:[^<]*<\/p>\s*/gi, '');

  // 5. Upgrade heading paragraphs into semantic <h2> tags
  // Matches <p>What Is an NFC Business Card?</p>, <p><em>What is an NFC Card...</em></p>, etc.
  content = content.replace(/<p>\s*<em>(.*?)<\/em>\s*<\/p>/gi, '<h2>$1</h2>');
  
  const knownHeadings = [
    'What Is an NFC Business Card?',
    'How NFC Business Cards Work (In Plain English)',
    'How NFC Business Cards Work',
    'The Part Most Buyers Get Backwards',
    'NFC Cards vs. QR Codes: An Honest Comparison',
    'NFC Cards vs. QR Codes',
    'Why NFC Business Cards Are Worth It',
    'Top NFC Business Cards in 2026',
    'Top NFC Business Cards',
    'The Real Question: Do You Actually Need One?',
    'Key Takeaways',
    'Best Digital Card for Nigerian Realtors',
    'Why Lagos Realtors Are Switching to NFC'
  ];

  knownHeadings.forEach((heading) => {
    const escaped = heading.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp('<p>\\s*(' + escaped + ')\\s*<\\/p>', 'gi');
    content = content.replace(regex, '<h2>$1</h2>');
  });

  // Convert bullet lines like <p>· Item</p> into <li>Item</li>
  content = content.replace(/<p>\s*[·•]\s*(.*?)<\/p>/gi, '<li>$1</li>');
  // Group adjacent <li> tags into <ul>
  content = content.replace(/(<li>.*?<\/li>(?:\s*<li>.*?<\/li>)*)/gi, '<ul>$1</ul>');

  // Convert numbered step lines like <p>1. Step</p> into ordered list
  content = content.replace(/<p>\s*(\d+)\.\s*(.*?)<\/p>/gi, '<li>$2</li>');

  // 6. Configure DOMPurify Whitelist
  const config = {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'br', 'hr',
      'figure', 'figcaption',
      'code', 'pre', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'width', 'height', 'loading',
      'id'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
  };

  let clean = content;

  // Use DOMPurify in browser or isomorphic environment
  if (typeof window !== 'undefined') {
    const purify = (DOMPurify as any).sanitize ? DOMPurify : (DOMPurify as any)(window);
    clean = purify.sanitize(content, config);

    // Enhance links and images via DOMParser
    try {
      const doc = new DOMParser().parseFromString(clean, 'text/html');
      const links = doc.querySelectorAll('a');
      links.forEach((link: HTMLAnchorElement) => {
        const href = link.getAttribute('href') || '';
        if (href.startsWith('http://') || href.startsWith('https://')) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });

      const images = doc.querySelectorAll('img');
      images.forEach((img: HTMLImageElement) => {
        img.setAttribute('loading', 'lazy');
        if (!img.getAttribute('alt')) {
          img.setAttribute('alt', 'CHIP NG Article illustration');
        }
      });

      return doc.body.innerHTML;
    } catch (e) {
      return clean;
    }
  } else {
    // In Node.js / non-browser environment, sanitize by removing script and event handlers
    clean = clean
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript\s*:/gi, '');
    return clean;
  }
}
