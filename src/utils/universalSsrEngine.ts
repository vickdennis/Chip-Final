/**
 * Universal SSR & Bot Pre-Rendering Engine for CHIP NG
 * Fully resolves the CSR empty <div id="root"></div> blank-page problem across:
 * - Dynamic User Profiles (/@username & /username)
 * - Hardware Sales & Shop Pages (/buy-card, /shop, /nfc-sales)
 * - Pricing & FAQ (/pricing, /faq)
 * - Dynamic Blog Articles (/blog/:slug & /blog)
 * - Commercial Landing Pages (/nfc-business-card-nigeria, etc.)
 * - Institutional & Policy Pages (/company, /contact, /shipping, etc.)
 */

import { COMMERCIAL_PAGES } from '../data/commercialPagesData';
import { BUY_CARD_PRE_RENDER_HTML, BUY_CARD_SCHEMA_JSON_LD, BUY_CARD_META } from './buyCardSeo';
import { 
  HOME_PRE_RENDER_HTML, 
  HOME_SCHEMA_JSON_LD, 
  PRICING_PRE_RENDER_HTML, 
  PRICING_SCHEMA_JSON_LD, 
  FAQ_PRE_RENDER_HTML, 
  FAQ_SCHEMA_JSON_LD 
} from './ssrEngine';

export const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp',
  'sogou',
  'exabot',
  'twitterbot',
  'facebookexternalhit',
  'facebot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'whatsapp',
  'telegrambot',
  'applebot',
  'skypeuripreview',
  'pinterest',
  // AI Search & LLM Web Crawlers
  'gptbot',
  'chatgpt-user',
  'perplexitybot',
  'claudebot',
  'anthropic-ai',
  'google-extended',
  'cohere-ai',
  'bytespider',
  'ccbot',
  'diffbot',
  'youbot',
  'meta-externalagent'
];

export function isCrawler(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export interface UniversalSsrContext {
  urlPath: string;
  userAgent?: string;
  supabase: any;
  db: any;
}

/**
 * Escapes HTML entities for safe attribute and text node rendering.
 */
function escapeHtml(str: string | null | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips HTML tags and excessive whitespace for clean meta descriptions.
 */
function cleanText(str: string | null | undefined, maxLength = 160): string {
  if (!str) return '';
  const clean = String(str)
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_~`>\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > maxLength ? clean.slice(0, maxLength - 3) + '...' : clean;
}

/**
 * Renders semantic, crawlable HTML for a dynamic user profile (/@username).
 */
export async function renderUserProfileSsr(
  username: string,
  supabase: any
): Promise<{
  title: string;
  description: string;
  canonical: string;
  image: string;
  schemaJsonLd: string;
  preRenderedHtml: string;
} | null> {
  const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
  if (!cleanUsername) return null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (!profile) return null;

    // Fetch links and social links in parallel
    const [linksRes, socialsRes, productsRes] = await Promise.allSettled([
      supabase.from('links').select('*').eq('profile_id', profile.id).order('position'),
      supabase.from('social_links').select('*').eq('profile_id', profile.id),
      supabase.from('products').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false })
    ]);

    const links = linksRes.status === 'fulfilled' && linksRes.value.data ? linksRes.value.data : [];
    const socialLinks = socialsRes.status === 'fulfilled' && socialsRes.value.data ? socialsRes.value.data : [];
    const products = productsRes.status === 'fulfilled' && productsRes.value.data ? productsRes.value.data : [];

    const fullName = escapeHtml(profile.full_name || `@${profile.username}`);
    const headline = escapeHtml(profile.headline || 'Verified Contactless Digital Profile');
    const bio = escapeHtml(profile.bio || '');
    const avatarUrl = profile.cover_image_url || 'https://www.chipng.com/chipng_exact_tile.png';
    const profileUrl = `https://www.chipng.com/@${profile.username}`;
    const vCardUrl = `https://www.chipng.com/${profile.username}/vcard`;

    const title = `${profile.full_name || profile.username} (@${profile.username}) | Contactless Digital Card & Bio | CHIP NG`;
    const description = cleanText(
      profile.headline 
        ? `${profile.headline}. ${profile.bio || ''} Connect with ${profile.full_name} with one tap on CHIP NG.`
        : `View ${profile.full_name}'s verified contactless smart card profile, vCard, social links, and portfolio on CHIP NG.`
    );

    // Schema.org ProfilePage + Person
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': `${profileUrl}#webpage`,
          url: profileUrl,
          name: title,
          description: description,
          isPartOf: {
            '@type': 'WebSite',
            '@id': 'https://www.chipng.com/#website',
            name: 'CHIP NG',
            url: 'https://www.chipng.com'
          },
          mainEntity: {
            '@type': 'Person',
            '@id': `${profileUrl}#person`,
            name: profile.full_name || profile.username,
            alternateName: `@${profile.username}`,
            jobTitle: profile.headline || undefined,
            description: profile.bio || undefined,
            image: avatarUrl,
            url: profileUrl,
            sameAs: socialLinks.map((s: any) => s.url).filter(Boolean),
            telephone: profile.phone_number || undefined,
            email: profile.contact_email || undefined,
            address: profile.address ? {
              '@type': 'PostalAddress',
              addressLocality: profile.address
            } : undefined
          }
        }
      ]
    };

    // Pre-rendered HTML inside <div id="root">
    const linksHtml = links.length > 0
      ? `
        <section aria-label="Featured Links" style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px; width: 100%;">
          ${links.map((link: any) => `
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s;">
              <span>${escapeHtml(link.title || 'Link')}</span>
              <span style="opacity: 0.6; font-size: 12px;">↗</span>
            </a>
          `).join('')}
        </section>
      `
      : '';

    const socialsHtml = socialLinks.length > 0
      ? `
        <section aria-label="Verified Social Channels" style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;">
          ${socialLinks.map((s: any) => `
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 999px; background: rgba(255, 255, 255, 0.1); color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700;" title="${escapeHtml(s.platform)}">
              ${escapeHtml(s.platform ? s.platform.slice(0, 3) : 'Soc')}
            </a>
          `).join('')}
        </section>
      `
      : '';

    const productsHtml = products.length > 0
      ? `
        <section aria-label="Digital Storefront" style="margin-top: 32px; width: 100%;">
          <h2 style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255, 255, 255, 0.7); margin-bottom: 12px; text-align: left;">
            Digital Storefront
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
            ${products.map((p: any) => `
              <div style="padding: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; text-align: left;">
                <div style="font-weight: 700; font-size: 14px; color: #ffffff;">${escapeHtml(p.name)}</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); margin: 4px 0 8px 0;">${escapeHtml(p.description || '')}</div>
                <div style="font-weight: 800; color: #D2F843; font-size: 15px;">₦${Number(p.price || 0).toLocaleString()}</div>
              </div>
            `).join('')}
          </div>
        </section>
      `
      : '';

    const preRenderedHtml = `
<div id="root">
  <div style="min-height: 100vh; background-color: #0c0d12; color: #ffffff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 48px 16px 64px 16px;">
    <main style="width: 100%; max-width: 520px; display: flex; flex-direction: column; align-items: center; text-align: center;">
      
      <!-- Profile Avatar -->
      <div style="width: 104px; height: 104px; border-radius: 999px; overflow: hidden; border: 3px solid rgba(255, 255, 255, 0.15); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); margin-bottom: 16px; background: #1a1c24;">
        <img src="${escapeHtml(avatarUrl)}" alt="${fullName}" width="104" height="104" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>

      <!-- Identity Header -->
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0; color: #ffffff;">${fullName}</h1>
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 999px; background: #3b82f6; color: #ffffff; font-size: 10px; font-weight: 900;" title="Verified Profile">✓</span>
      </div>
      
      <div style="font-size: 13px; font-family: monospace; color: #a1a1aa; margin-bottom: 8px;">@${escapeHtml(profile.username)}</div>
      
      <p style="font-size: 15px; font-weight: 500; color: #e4e4e7; margin: 0 0 10px 0; max-width: 440px; line-height: 1.4;">${headline}</p>
      
      ${bio ? `<p style="font-size: 13px; color: #a1a1aa; margin: 0 0 20px 0; max-width: 440px; line-height: 1.5;">${bio}</p>` : ''}

      <!-- Quick Action Buttons -->
      <div style="display: flex; gap: 10px; width: 100%; max-width: 380px; margin-bottom: 8px;">
        <a href="${vCardUrl}" style="flex: 1; padding: 12px 18px; background: #D2F843; color: #09090b; font-weight: 700; font-size: 13px; border-radius: 999px; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(210, 248, 67, 0.3);">
          Save Contact (vCard)
        </a>
        ${profile.phone_number ? `
          <a href="https://wa.me/${encodeURIComponent(String(profile.phone_number).replace(/[^0-9]/g, ''))}" target="_blank" rel="noopener noreferrer" style="flex: 1; padding: 12px 18px; background: rgba(255, 255, 255, 0.1); color: #ffffff; font-weight: 700; font-size: 13px; border-radius: 999px; text-decoration: none; text-align: center; border: 1px solid rgba(255, 255, 255, 0.15);">
            Direct WhatsApp
          </a>
        ` : ''}
      </div>

      <!-- Socials -->
      ${socialsHtml}

      <!-- Links List -->
      ${linksHtml}

      <!-- Products -->
      ${productsHtml}

      <!-- Powered By Footer -->
      <footer style="margin-top: 48px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: rgba(255, 255, 255, 0.4); font-family: monospace;">
        POWERED BY <a href="https://www.chipng.com" style="color: #D2F843; text-decoration: none; font-weight: 700;">CHIP NG</a> CONTACTLESS NFC HARDWARE
      </footer>

    </main>
  </div>
</div>
    `;

    return {
      title,
      description,
      canonical: profileUrl,
      image: avatarUrl,
      schemaJsonLd: JSON.stringify(schema),
      preRenderedHtml
    };
  } catch (err) {
    console.error('Error pre-rendering user profile:', err);
    return null;
  }
}

/**
 * Renders semantic, crawlable HTML for a dynamic blog article (/blog/:slug).
 */
export async function renderBlogArticleSsr(
  slug: string,
  supabase: any,
  db: any
): Promise<{
  title: string;
  description: string;
  canonical: string;
  image: string;
  schemaJsonLd: string;
  preRenderedHtml: string;
} | null> {
  const cleanSlug = slug.trim().toLowerCase();
  if (!cleanSlug) return null;

  try {
    let post: any = null;
    try {
      post = db.prepare('SELECT * FROM local_posts WHERE slug = ?').get(cleanSlug);
    } catch (e) {}

    if (!post) {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();
      if (data) post = data;
    }

    if (!post) return null;

    const title = post.meta_title || `${post.title} — CHIP NG`;
    const description = cleanText(post.meta_description || post.excerpt || post.content || 'Read the official insight on CHIP NG.');
    const articleUrl = `https://www.chipng.com/blog/${post.slug}`;
    const coverImage = post.cover_image_url || 'https://www.chipng.com/chipng_3d_logo.jpg';
    const publishedAt = post.created_at || new Date().toISOString();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${articleUrl}#article`,
      headline: post.title,
      description: description,
      image: coverImage,
      datePublished: publishedAt,
      dateModified: publishedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl
      },
      author: {
        '@type': 'Organization',
        name: 'CHIP NG Editorial Team',
        url: 'https://www.chipng.com'
      },
      publisher: {
        '@type': 'Organization',
        name: 'CHIP NG',
        logo: {
          '@type': 'ImageObject',
          url: 'https://chipng.com/chipng_exact_tile.png'
        }
      }
    };

    const preRenderedHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #ffffff; min-height: 100vh; padding: 48px 16px 80px 16px;">
    <article style="max-width: 760px; margin: 0 auto; line-height: 1.8;">
      
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" style="font-size: 13px; color: #71717a; margin-bottom: 24px;">
        <a href="/" style="color: #4f46e5; text-decoration: none;">Home</a> &gt; 
        <a href="/blog" style="color: #4f46e5; text-decoration: none;">Blog</a> &gt; 
        <span style="color: #27272a;">${escapeHtml(post.title)}</span>
      </nav>

      <!-- Headline -->
      <h1 style="font-size: 38px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.25; margin: 0 0 16px 0; color: #09090b;">
        ${escapeHtml(post.title)}
      </h1>

      <div style="display: flex; align-items: center; gap: 12px; font-size: 13px; color: #71717a; margin-bottom: 32px; border-bottom: 1px solid #f4f4f5; padding-bottom: 16px;">
        <span>By <strong>CHIP NG Editorial</strong></span> • 
        <time datetime="${escapeHtml(publishedAt)}">${new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time> • 
        <span>5 min read</span>
      </div>

      <!-- Featured Image -->
      ${coverImage ? `
        <div style="width: 100%; border-radius: 20px; overflow: hidden; margin-bottom: 36px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
          <img src="${escapeHtml(coverImage)}" alt="${escapeHtml(post.title)}" width="760" height="420" style="width: 100%; height: auto; display: block; object-fit: cover;" />
        </div>
      ` : ''}

      <!-- Body Content -->
      <div style="font-size: 16px; color: #27272a; margin-bottom: 48px;">
        ${post.content || `<p>${escapeHtml(post.excerpt || '')}</p>`}
      </div>

      <!-- Article CTA Box -->
      <div style="background: #09090b; color: #ffffff; padding: 36px; border-radius: 24px; text-align: center; margin-top: 48px;">
        <h2 style="font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">Upgrade Your Executive Networking in Nigeria</h2>
        <p style="font-size: 15px; color: #a1a1aa; max-width: 520px; margin: 0 auto 24px auto;">Order your custom laser-engraved NFC metal card or matte PVC card with sub-10ms contactless response.</p>
        <a href="/buy-card" style="display: inline-block; padding: 14px 28px; background: #D2F843; color: #09090b; font-weight: 800; font-size: 14px; border-radius: 999px; text-decoration: none;">
          Order Your NFC Card Today (From ₦30,000)
        </a>
      </div>

    </article>
  </div>
</div>
    `;

    return {
      title,
      description,
      canonical: articleUrl,
      image: coverImage,
      schemaJsonLd: JSON.stringify(schema),
      preRenderedHtml
    };
  } catch (err) {
    console.error('Error pre-rendering blog article:', err);
    return null;
  }
}

/**
 * Renders semantic, crawlable HTML for the Blog Directory (/blog).
 */
export async function renderBlogDirectorySsr(
  supabase: any,
  db: any
): Promise<{
  title: string;
  description: string;
  canonical: string;
  schemaJsonLd: string;
  preRenderedHtml: string;
}> {
  let posts: any[] = [];
  try {
    posts = db.prepare('SELECT title, slug, excerpt, cover_image_url, created_at FROM local_posts ORDER BY id DESC').all();
  } catch (e) {}

  if (!posts || posts.length === 0) {
    try {
      const { data } = await supabase
        .from('posts')
        .select('title, slug, excerpt, cover_image_url, created_at')
        .order('created_at', { ascending: false });
      if (data && data.length > 0) posts = data;
    } catch (e) {}
  }

  const title = 'CHIP NG Blog — Insights on Contactless Networking, NFC Tech & Executive Growth';
  const description = 'Official thought leadership, hardware guides, and executive networking strategies for founders, realtors, and leaders in Nigeria and Africa.';
  const canonical = 'https://www.chipng.com/blog';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${canonical}#blog`,
    name: title,
    description: description,
    publisher: {
      '@type': 'Organization',
      name: 'CHIP NG',
      url: 'https://www.chipng.com'
    },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: cleanText(p.excerpt, 150),
      url: `https://www.chipng.com/blog/${p.slug}`,
      image: p.cover_image_url || 'https://www.chipng.com/chipng_3d_logo.jpg',
      datePublished: p.created_at || new Date().toISOString()
    }))
  };

  const preRenderedHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #fafafa; min-height: 100vh; padding: 48px 16px 80px 16px;">
    <main style="max-width: 1040px; margin: 0 auto;">
      <header style="text-align: center; margin-bottom: 56px;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          CHIP NG Thought Leadership
        </span>
        <h1 style="font-size: 40px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.2; margin: 0 0 16px 0; color: #09090b;">
          The Contactless Networking Journal
        </h1>
        <p style="font-size: 17px; color: #52525b; max-width: 640px; margin: 0 auto;">
          In-depth guides on NFC business card technology, Lagos executive dealmaking, and modern digital identity in Africa.
        </p>
      </header>

      <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${posts.map((post) => `
          <article style="background: #ffffff; border: 1px solid #e4e4e7; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s;">
            ${post.cover_image_url ? `
              <div style="height: 190px; overflow: hidden; background: #f4f4f5;">
                <img src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.title)}" width="400" height="190" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
            ` : ''}
            <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
              <h2 style="font-size: 19px; font-weight: 800; line-height: 1.35; margin: 0 0 12px 0;">
                <a href="/blog/${escapeHtml(post.slug)}" style="color: #09090b; text-decoration: none;">
                  ${escapeHtml(post.title)}
                </a>
              </h2>
              <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 0 0 20px 0; flex-grow: 1;">
                ${escapeHtml(cleanText(post.excerpt, 140))}
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f4f4f5; padding-top: 16px;">
                <span style="font-size: 12px; color: #71717a;">${new Date(post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <a href="/blog/${escapeHtml(post.slug)}" style="font-size: 13px; font-weight: 700; color: #4f46e5; text-decoration: none;">Read Article →</a>
              </div>
            </div>
          </article>
        `).join('')}
      </section>
    </main>
  </div>
</div>
  `;

  return {
    title,
    description,
    canonical,
    schemaJsonLd: JSON.stringify(schema),
    preRenderedHtml
  };
}

/**
 * Helper to inject synchronized, single-canonical SEO metadata and pre-rendered HTML.
 * Ensures zero duplicate canonical tags and consistent OpenGraph / Twitter / Schema markup.
 */
export function injectSeoMetadata(
  html: string,
  meta: {
    title: string;
    description: string;
    canonical: string;
    ogType?: string;
    image?: string;
    schemaJsonLd?: string;
    preRenderedHtml?: string;
  }
): string {
  let output = html;

  // 1. Title
  output = output.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  output = output.replace(/<meta name="title" content=".*?"\s*\/?>/i, `<meta name="title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`);
  output = output.replace(/<meta property="twitter:title" content=".*?"\s*\/?>/i, `<meta property="twitter:title" content="${escapeHtml(meta.title)}" />`);

  // 2. Description
  output = output.replace(/<meta name="description" content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);
  output = output.replace(/<meta property="twitter:description" content=".*?"\s*\/?>/i, `<meta property="twitter:description" content="${escapeHtml(meta.description)}" />`);

  // 3. Absolute Single Canonical Enforcement (Strip ANY existing canonical tag first)
  output = output.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, '');
  output = output.replace('</head>', `  <link rel="canonical" href="${meta.canonical}" />\n</head>`);

  // 4. URL
  output = output.replace(/<meta property="og:url" content=".*?"\s*\/?>/i, `<meta property="og:url" content="${meta.canonical}" />`);
  output = output.replace(/<meta property="twitter:url" content=".*?"\s*\/?>/i, `<meta property="twitter:url" content="${meta.canonical}" />`);
  if (meta.ogType) {
    output = output.replace(/<meta property="og:type" content=".*?"\s*\/?>/i, `<meta property="og:type" content="${meta.ogType}" />`);
  }

  // 5. Image
  if (meta.image) {
    output = output.replace(/<meta property="og:image" content=".*?"\s*\/?>/i, `<meta property="og:image" content="${meta.image}" />`);
    output = output.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${meta.image}" />`);
    output = output.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/i, `<meta property="twitter:image" content="${meta.image}" />`);
  }

  // 6. Robots Tag
  if (!output.includes('name="robots"')) {
    output = output.replace('</head>', `  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />\n</head>`);
  }

  // 7. Schema.org JSON-LD
  if (meta.schemaJsonLd) {
    output = output.replace('</head>', `  <script type="application/ld+json">\n${meta.schemaJsonLd}\n  </script>\n</head>`);
  }

  // 8. Injected HTML
  if (meta.preRenderedHtml) {
    output = output.replace(/<div id="root"><\/div>/i, meta.preRenderedHtml);
  }

  return output;
}

/**
 * Master Universal SSR Transformer.
 * Injects rich <head> metadata, OpenGraph, Twitter Cards, Schema.org JSON-LD,
 * and semantic pre-rendered HTML into the initial HTML document.
 */
export async function applyUniversalSsr(
  html: string,
  context: UniversalSsrContext
): Promise<string> {
  const { urlPath, userAgent, supabase, db } = context;
  let output = html;

  const normalizedPath = (urlPath || '/').split('?')[0].replace(/\/$/, '') || '/';

  // 1. Hardware Shop & Sales Pages
  if (normalizedPath === '/buy-card' || normalizedPath === '/shop' || normalizedPath === '/nfc-sales') {
    return injectSeoMetadata(output, {
      title: BUY_CARD_META.title,
      description: BUY_CARD_META.description,
      canonical: BUY_CARD_META.canonical,
      ogType: 'product',
      image: BUY_CARD_META.image,
      schemaJsonLd: BUY_CARD_SCHEMA_JSON_LD,
      preRenderedHtml: BUY_CARD_PRE_RENDER_HTML
    });
  }

  // 2. Homepage
  if (normalizedPath === '/') {
    return injectSeoMetadata(output, {
      title: 'CHIP NG — Contactless Smart NFC Business Cards & Link-in-Bio Platform Nigeria',
      description: 'The premier contactless NFC smart business cards & dynamic link-in-bio platform in Nigeria. 1-tap contact sharing, zero app needed, NTAG216 chip, sub-10ms response. 24h Lagos delivery.',
      canonical: 'https://www.chipng.com/',
      schemaJsonLd: HOME_SCHEMA_JSON_LD,
      preRenderedHtml: HOME_PRE_RENDER_HTML
    });
  }

  // 3. Pricing Page
  if (normalizedPath === '/pricing') {
    return injectSeoMetadata(output, {
      title: 'NFC Business Card Price in Nigeria — 2026 Transparent Pricing | CHIP NG',
      description: 'Official 2026 prices for CHIP NG contactless smart cards: Smart PVC (₦30,000 / ₦35,000), Smart Metal (₦50,000), and Metal Debit Card + Custom Design (₦80,000–₦100,000). Zero monthly subscription fees.',
      canonical: 'https://www.chipng.com/pricing',
      schemaJsonLd: PRICING_SCHEMA_JSON_LD,
      preRenderedHtml: PRICING_PRE_RENDER_HTML
    });
  }

  // 4. FAQ Page
  if (normalizedPath === '/faq') {
    return injectSeoMetadata(output, {
      title: 'Frequently Asked Questions & Hardware Guide | CHIP NG Nigeria',
      description: 'Everything you need to know about CHIP NG contactless smart business cards. How NFC works, compatibility, delivery times, and vCard address book saving in Nigeria.',
      canonical: 'https://www.chipng.com/faq',
      schemaJsonLd: FAQ_SCHEMA_JSON_LD,
      preRenderedHtml: FAQ_PRE_RENDER_HTML
    });
  }

  // 5. Commercial Geo/Niche Landing Pages
  const commercialSlug = normalizedPath.replace(/^\//, '');
  if (COMMERCIAL_PAGES[commercialSlug]) {
    const page = COMMERCIAL_PAGES[commercialSlug];
    const canonical = `https://www.chipng.com/${page.slug}`;

    const commercialSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: page.headline,
          description: page.overview,
          brand: { '@type': 'Brand', name: 'CHIP NG' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'NGN',
            lowPrice: '30000',
            highPrice: '100000',
            offerCount: '3'
          }
        },
        {
          '@type': 'FAQPage',
          mainEntity: page.faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer }
          }))
        }
      ]
    });

    const commercialPreRender = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #18181b; background: #ffffff; min-height: 100vh; padding: 48px 16px 80px 16px;">
    <main style="max-width: 960px; margin: 0 auto; line-height: 1.6;">
      <header style="text-align: center; margin-bottom: 48px;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
          ${escapeHtml(page.heroBadge)}
        </span>
        <h1 style="font-size: 42px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.2; margin: 0 0 16px 0; color: #09090b;">
          ${escapeHtml(page.headline)}
        </h1>
        <p style="font-size: 18px; color: #52525b; max-width: 720px; margin: 0 auto;">
          ${escapeHtml(page.subheadline)}
        </p>
      </header>

      <section style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; margin-bottom: 40px;">
        <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0;">Executive Overview</h2>
        <p style="font-size: 15px; color: #334155; line-height: 1.7; margin: 0;">${escapeHtml(page.overview)}</p>
      </section>

      <section style="margin-bottom: 48px;">
        <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 20px;">Why Nigerian Dealmakers Choose CHIP NG</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;">
          ${page.keyBenefits.map(b => `
            <div style="border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; background: #ffffff;">
              <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #0f172a;">${escapeHtml(b.title)}</h3>
              <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.6;">${escapeHtml(b.description)}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <section style="background: #09090b; color: #ffffff; padding: 40px; border-radius: 24px; text-align: center;">
        <h2 style="font-size: 28px; font-weight: 900; margin: 0 0 12px 0;">Order Your Card in Nigeria</h2>
        <p style="font-size: 15px; color: #a1a1aa; margin: 0 0 24px 0;">PVC Smart Card (₦30,000 / ₦35,000) • Metal Smart Card (₦50,000) • Metal Debit Card (₦80,000–₦100,000)</p>
        <a href="/buy-card" style="display: inline-block; padding: 14px 32px; background: #D2F843; color: #09090b; font-weight: 800; font-size: 14px; border-radius: 999px; text-decoration: none;">
          Order Online Now — 24h Express Delivery
        </a>
      </section>
    </main>
  </div>
</div>
    `;

    return injectSeoMetadata(output, {
      title: page.metaTitle,
      description: page.metaDescription,
      canonical,
      schemaJsonLd: commercialSchema,
      preRenderedHtml: commercialPreRender
    });
  }

  // 6. Blog Directory Page (/blog)
  if (normalizedPath === '/blog') {
    const blogDir = await renderBlogDirectorySsr(supabase, db);
    return injectSeoMetadata(output, {
      title: blogDir.title,
      description: blogDir.description,
      canonical: blogDir.canonical,
      schemaJsonLd: blogDir.schemaJsonLd,
      preRenderedHtml: blogDir.preRenderedHtml
    });
  }

  // 7. Blog Article Pages (/blog/:slug)
  if (normalizedPath.startsWith('/blog/') && normalizedPath.length > 6) {
    const slug = normalizedPath.slice(6);
    const ssrResult = await renderBlogArticleSsr(slug, supabase, db);
    if (ssrResult) {
      return injectSeoMetadata(output, {
        title: ssrResult.title,
        description: ssrResult.description,
        canonical: ssrResult.canonical,
        ogType: 'article',
        image: ssrResult.image,
        schemaJsonLd: ssrResult.schemaJsonLd,
        preRenderedHtml: ssrResult.preRenderedHtml
      });
    }
  }

  // 8. Dynamic User Profiles (/@username & /username)
  const RESERVED_ROUTES = [
    '/admin', '/enterprise', '/login', '/dashboard', '/api', '/blog',
    '/company', '/about', '/updates', '/contact', '/buy-card', '/shop',
    '/pricing', '/faq', '/shipping', '/refund-policy', '/privacy-policy',
    '/privacy', '/terms-of-service', '/terms', '/nfc-sales'
  ];

  const isReserved = RESERVED_ROUTES.some(r => normalizedPath === r || normalizedPath.startsWith(r + '/'));

  if (!isReserved && normalizedPath !== '/') {
    // Extract username (supports /@username, /username, /@username/vcard, /username/vcard)
    let rawUsername = normalizedPath.replace(/^\//, '');
    if (rawUsername.startsWith('@')) rawUsername = rawUsername.slice(1);
    if (rawUsername.endsWith('/vcard')) rawUsername = rawUsername.replace(/\/vcard$/, '');

    const profileSsr = await renderUserProfileSsr(rawUsername, supabase);
    if (profileSsr) {
      return injectSeoMetadata(output, {
        title: profileSsr.title,
        description: profileSsr.description,
        canonical: profileSsr.canonical,
        ogType: 'profile',
        image: profileSsr.image,
        schemaJsonLd: profileSsr.schemaJsonLd,
        preRenderedHtml: profileSsr.preRenderedHtml
      });
    }
  }

  // 9. Institutional & Policy Pages
  if (normalizedPath === '/company' || normalizedPath === '/about') {
    const companyHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 960px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">About CHIP NG</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7;">
      CHIP NG is Nigeria’s premier contactless smart business card and dynamic digital identity platform. Headquartered in Lagos, we engineer precision NTAG216 NFC hardware paired with a cloud bio engine for modern entrepreneurs and enterprises across Africa.
    </p>
  </div>
</div>
    `;
    const companySchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      '@id': 'https://www.chipng.com/company#about',
      name: 'About CHIP NG',
      url: 'https://www.chipng.com/company',
      description: 'Nigeria’s premier contactless smart business card and dynamic digital identity platform.'
    });
    return injectSeoMetadata(output, {
      title: 'About CHIP NG — Contactless NFC Hardware & Digital Identity',
      description: 'CHIP NG is Nigeria’s premier contactless smart business card and dynamic digital identity platform. Headquartered in Lagos, engineering precision NTAG216 NFC hardware.',
      canonical: 'https://www.chipng.com/company',
      schemaJsonLd: companySchema,
      preRenderedHtml: companyHtml
    });
  }

  if (normalizedPath === '/contact') {
    const contactHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Contact CHIP NG Support & Sales</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Direct inquiries for custom corporate NFC card deployments, bulk orders, and API integration in Nigeria.
    </p>
    <ul style="font-size: 15px; color: #3f3f46; line-height: 2;">
      <li><strong>Location:</strong> Lekki Phase 1, Lagos, Nigeria</li>
      <li><strong>Email:</strong> <a href="mailto:hello@chipng.com">hello@chipng.com</a></li>
      <li><strong>Phone / WhatsApp:</strong> +234 810 076 4154</li>
      <li><strong>Operating Hours:</strong> Monday – Saturday, 08:00 – 20:00 GMT+1</li>
    </ul>
  </div>
</div>
    `;
    const contactSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      '@id': 'https://www.chipng.com/contact#contact',
      name: 'Contact CHIP NG Support & Sales',
      url: 'https://www.chipng.com/contact'
    });
    return injectSeoMetadata(output, {
      title: 'Contact CHIP NG — Direct Inquiries & Lagos Support',
      description: 'Contact CHIP NG for enterprise NFC cards, custom laser engraving, and Lagos 24h express delivery. Direct phone, WhatsApp, and office address in Lekki Phase 1.',
      canonical: 'https://www.chipng.com/contact',
      schemaJsonLd: contactSchema,
      preRenderedHtml: contactHtml
    });
  }

  if (normalizedPath === '/shipping') {
    const shippingHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">CHIP NG Shipping & Nationwide Logistics Policy</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Fast, reliable delivery of your custom laser-engraved NFC smart cards across Lagos and all 36 Nigerian states.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0;">Delivery Timelines</h2>
      <ul style="font-size: 15px; color: #334155; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li><strong>Lagos State (Island & Mainland):</strong> 24–48 hours express dispatch via vetted dispatch riders.</li>
        <li><strong>Abuja (FCT) & Port Harcourt:</strong> 2–3 business days via DHL Express & GIG Logistics.</li>
        <li><strong>All Other States:</strong> 3–4 business days with trackable parcel waybill.</li>
      </ul>
    </div>
  </div>
</div>
    `;
    const shippingSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://www.chipng.com/shipping#policy',
      name: 'Shipping & Nationwide Delivery Policy | CHIP NG',
      url: 'https://www.chipng.com/shipping'
    });
    return injectSeoMetadata(output, {
      title: 'Shipping & Express Delivery Policy | CHIP NG Nigeria',
      description: 'Fast, reliable delivery of your custom laser-engraved NFC smart cards across Lagos (24-48h) and all 36 Nigerian states via DHL Express & GIG Logistics.',
      canonical: 'https://www.chipng.com/shipping',
      schemaJsonLd: shippingSchema,
      preRenderedHtml: shippingHtml
    });
  }

  if (normalizedPath === '/refund-policy') {
    const refundHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Refund Policy & Hardware Warranty</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Every CHIP NG contactless card is manufactured with genuine NTAG216 microchips and tested before dispatch.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px;">
      <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 8px 0;">30-Day Defect Replacement Guarantee</h2>
      <p style="font-size: 15px; color: #334155; line-height: 1.7; margin: 0;">
        If your card chip fails to scan within 30 days of arrival due to manufacturing defect, we will laser-engrave and re-dispatch a brand new replacement card at zero cost.
      </p>
    </div>
  </div>
</div>
    `;
    const refundSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://www.chipng.com/refund-policy#policy',
      name: 'Refund Policy & Hardware Warranty | CHIP NG',
      url: 'https://www.chipng.com/refund-policy'
    });
    return injectSeoMetadata(output, {
      title: 'Refund Policy & Hardware Warranty | CHIP NG Nigeria',
      description: 'CHIP NG 30-Day Defect Replacement Guarantee. Genuine NTAG216 microchips tested before dispatch. Free laser engraving and replacement if card fails.',
      canonical: 'https://www.chipng.com/refund-policy',
      schemaJsonLd: refundSchema,
      preRenderedHtml: refundHtml
    });
  }

  if (normalizedPath === '/privacy-policy' || normalizedPath === '/privacy') {
    const privacyHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Privacy Policy</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      CHIP NG complies with the Nigeria Data Protection Act (NDPA) and international privacy best practices.
    </p>
    <p style="font-size: 15px; color: #334155; line-height: 1.8;">
      We only store information you explicitly add to your public bio profile (such as name, WhatsApp, email, links, and avatar) so that contacts who tap your physical card can view your contact information.
    </p>
  </div>
</div>
    `;
    const privacySchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://www.chipng.com/privacy-policy#policy',
      name: 'Privacy Policy | CHIP NG',
      url: 'https://www.chipng.com/privacy-policy'
    });
    return injectSeoMetadata(output, {
      title: 'Privacy Policy | CHIP NG Nigeria',
      description: 'CHIP NG Privacy Policy. Fully compliant with Nigeria Data Protection Act (NDPA). How we safeguard and handle your contactless profile data.',
      canonical: 'https://www.chipng.com/privacy-policy',
      schemaJsonLd: privacySchema,
      preRenderedHtml: privacyHtml
    });
  }

  if (normalizedPath === '/terms-of-service' || normalizedPath === '/terms') {
    const termsHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">Terms of Service</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Terms governing your purchase of CHIP NG contactless hardware and usage of our dynamic bio engine.
    </p>
    <p style="font-size: 15px; color: #334155; line-height: 1.8;">
      By activating a CHIP NG card, you agree to utilize the platform for lawful personal and commercial networking. We guarantee 99.9% uptime of your hosted bio link.
    </p>
  </div>
</div>
    `;
    const termsSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://www.chipng.com/terms-of-service#policy',
      name: 'Terms of Service | CHIP NG',
      url: 'https://www.chipng.com/terms-of-service'
    });
    return injectSeoMetadata(output, {
      title: 'Terms of Service | CHIP NG Nigeria',
      description: 'Terms of Service governing your purchase of CHIP NG contactless NFC hardware and hosted digital identity engine in Nigeria.',
      canonical: 'https://www.chipng.com/terms-of-service',
      schemaJsonLd: termsSchema,
      preRenderedHtml: termsHtml
    });
  }

  if (normalizedPath === '/updates') {
    const updatesHtml = `
<div id="root">
  <div style="font-family: system-ui, -apple-system, sans-serif; color: #18181b; max-width: 800px; margin: 0 auto; padding: 48px 16px;">
    <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px;">CHIP NG Platform Updates & Changelog</h1>
    <p style="font-size: 16px; color: #52525b; line-height: 1.7; margin-bottom: 24px;">
      Recent releases for our NFC card hardware firmware, live telemetry analytics, and digital bio link engine.
    </p>
  </div>
</div>
    `;
    const updatesSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': 'https://www.chipng.com/updates#changelog',
      name: 'CHIP NG Platform Updates & Changelog',
      url: 'https://www.chipng.com/updates'
    });
    return injectSeoMetadata(output, {
      title: 'Updates & Changelog | CHIP NG Nigeria',
      description: 'Platform updates, firmware improvements, and new dynamic profile features for CHIP NG contactless smart card owners in Nigeria.',
      canonical: 'https://www.chipng.com/updates',
      schemaJsonLd: updatesSchema,
      preRenderedHtml: updatesHtml
    });
  }

  return output;
}
