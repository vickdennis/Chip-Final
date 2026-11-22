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

import { COMMERCIAL_PAGES } from '../data/commercialPagesData.js';
import { extractUsernameFromPath } from './usernameHelper.js';
import { BUY_CARD_SCHEMA_JSON_LD, BUY_CARD_META } from './buyCardSeo.js';
import {
  CHIPNG_PRODUCT_IMAGES,
  CHIPNG_PRODUCT_AGGREGATE_RATING,
  CHIPNG_PRODUCT_REVIEWS,
  buildChipngAggregateOffers,
} from './productSchemaData.js';
import { 
  HOME_SCHEMA_JSON_LD, 
  PRICING_SCHEMA_JSON_LD, 
  FAQ_SCHEMA_JSON_LD 
} from './ssrEngine.js';

export const BOT_USER_AGENTS = [
  'googlebot',
  'google-inspectiontool',
  'googlebot-image',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'duckassistbot',
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
  'applebot-extended',
  'skypeuripreview',
  'pinterest',
  // AI Search & LLM Web Crawlers / Agents
  'gptbot',
  'oai-searchbot',
  'chatgpt-user',
  'chatgpt',
  'openai',
  'perplexitybot',
  'perplexity-user',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'google-extended',
  'gemini',
  'cohere-ai',
  'bytespider',
  'ccbot',
  'diffbot',
  'youbot',
  'meta-externalagent',
  'amazonbot'
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
  secondaryImage?: string;
  schemaJsonLd: string;
  preRenderedHtml: string;
} | null> {
  const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
  if (!cleanUsername) return null;

  try {
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (!profile) {
      const atRes = await supabase
        .from('profiles')
        .select('*')
        .eq('username', `@${cleanUsername}`)
        .maybeSingle();
      if (atRes.data) profile = atRes.data;
    }

    if (!profile) {
      const lowerRes = await supabase
        .from('profiles')
        .select('*')
        .eq('username', cleanUsername.toLowerCase())
        .maybeSingle();
      if (lowerRes.data) profile = lowerRes.data;
    }

    if (!profile) {
      const ilikeRes = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();
      if (ilikeRes.data) profile = ilikeRes.data;
    }

    if (!profile) {
      const ilikeAtRes = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `@${cleanUsername}`)
        .maybeSingle();
      if (ilikeAtRes.data) profile = ilikeAtRes.data;
    }

    // Check if cleanUsername is a valid UUID
    if (!profile && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanUsername)) {
      const idRes = await supabase
        .from('profiles')
        .select('*')
        .eq('id', cleanUsername)
        .maybeSingle();
      if (idRes.data) profile = idRes.data;
    }

    if (!profile) {
      const { data: candidates } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);

      if (candidates && candidates.length > 0) {
        const targetClean = cleanUsername.toLowerCase().trim();
        const targetAlpha = targetClean.replace(/[^a-z0-9]/g, '');
        const found = candidates.find((p: any) => {
          if (!p.username) return false;
          const pClean = p.username.toLowerCase().trim().replace(/^@+/, '');
          const pAlpha = pClean.replace(/[^a-z0-9]/g, '');
          return pClean === targetClean || (targetAlpha.length >= 3 && pAlpha === targetAlpha);
        });
        if (found) profile = found;
      }
    }

    // Email prefix matching fallback for newly registered users whose username matches their email prefix
    if (!profile) {
      const emailRes = await supabase
        .from('profiles')
        .select('*')
        .or(`contact_email.ilike.${cleanUsername}@%,email.ilike.${cleanUsername}@%`)
        .limit(1)
        .maybeSingle();
      if (emailRes.data) profile = emailRes.data;
    }

    // Onboarding submissions fallback for newly onboarded clients sharing their link
    if (!profile) {
      try {
        const { data: sub } = await supabase
          .from('onboarding_submissions')
          .select('*')
          .or(`username.ilike.${cleanUsername},email.ilike.${cleanUsername}@%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (sub) {
          profile = {
            id: sub.id,
            full_name: sub.full_name,
            username: sub.username || cleanUsername,
            headline: sub.headline || 'Executive Member',
            bio: sub.bio || '',
            cover_image_url: sub.avatar_url || sub.logo_url,
            avatar_url: sub.avatar_url || sub.logo_url,
            contact_email: sub.email,
            phone_number: sub.phone_number,
            address: sub.address || 'Lagos, Nigeria'
          };
        }
      } catch (_subErr) {}
    }

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

    const displayHandle = (profile.username || cleanUsername).replace(/^@+/, '');
    const fullName = escapeHtml(profile.full_name || `@${displayHandle}`);
    const headline = escapeHtml(profile.headline || 'Verified Contactless Digital Profile');
    const bio = escapeHtml(profile.bio || '');

    // Robust multi-column image resolution: covers admin-created users and all profile schemas
    const rawCoverUrl = 
      profile.cover_image_url || 
      profile.avatar_url || 
      profile.photo_url || 
      profile.avatar || 
      profile.image || 
      profile.profile_image ||
      profile.card_image_url;

    // Proxied cover image guaranteeing bypass of Supabase x-robots-tag: none header for WhatsApp / Twitter / Facebook / iMessage / LinkedIn
    const coverImageUrl = rawCoverUrl
      ? `https://www.chipng.com/api/cover/${encodeURIComponent(displayHandle)}`
      : 'https://www.chipng.com/chipng_3d_logo.jpg';

    let avatarUrl = 'https://www.chipng.com/chipng_exact_tile.png';
    if (rawCoverUrl && typeof rawCoverUrl === 'string') {
      if (rawCoverUrl.startsWith('http')) {
        avatarUrl = rawCoverUrl;
      } else if (rawCoverUrl.startsWith('/')) {
        avatarUrl = `https://www.chipng.com${rawCoverUrl}`;
      } else {
        avatarUrl = `https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/${rawCoverUrl}`;
      }
    }

    const profileUrl = `https://www.chipng.com/@${displayHandle}`;
    const vCardUrl = `https://www.chipng.com/${displayHandle}/vcard`;

    const title = `${profile.full_name || displayHandle} (@${displayHandle}) | Contactless Digital Card & Bio | CHIP NG`;
    const description = cleanText(
      profile.headline 
        ? `${profile.headline}. ${profile.bio || ''} Connect with ${profile.full_name || displayHandle} with one tap on CHIP NG.`
        : (profile.bio
            ? `${profile.bio}. Connect with ${profile.full_name || displayHandle} on CHIP NG.`
            : `View ${profile.full_name || displayHandle}'s verified contactless smart card profile, vCard, social links, and portfolio on CHIP NG.`)
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
                <div style="font-weight: 800; color: #16a34a; font-size: 15px;">₦${Number(p.price || 0).toLocaleString()}</div>
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
        <a href="${vCardUrl}" download="${escapeHtml(profile.username)}.vcf" style="flex: 1; padding: 12px 18px; background: #16a34a; color: #09090b; font-weight: 700; font-size: 13px; border-radius: 999px; text-decoration: none; text-align: center; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);">
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
        POWERED BY <a href="https://www.chipng.com" style="color: #16a34a; text-decoration: none; font-weight: 700;">CHIP NG</a> CONTACTLESS NFC HARDWARE
      </footer>

    </main>
  </div>
</div>
    `;

    return {
      title,
      description,
      canonical: profileUrl,
      image: coverImageUrl,
      secondaryImage: rawCoverUrl && rawCoverUrl.startsWith('http') ? rawCoverUrl : undefined,
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
          url: 'https://www.chipng.com/chipng_exact_tile.png'
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
        <a href="/buy-card" style="display: inline-block; padding: 14px 28px; background: #16a34a; color: #09090b; font-weight: 800; font-size: 14px; border-radius: 999px; text-decoration: none;">
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

function upsertMetaTag(html: string, attrKey: 'name' | 'property', attrVal: string, content: string): string {
  const safeVal = escapeHtml(content);
  const regex = new RegExp(`<meta\\s+${attrKey}=["']${attrVal}["'][^>]*\\/?>`, 'i');
  const tag = `<meta ${attrKey}="${attrVal}" content="${safeVal}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  }
  return html.replace('</head>', `  ${tag}\n</head>`);
}

/**
 * Helper to inject synchronized, single-canonical SEO metadata and pre-rendered HTML.
 * Upserts head tags safely (even on minimal HTML fallback) and injects preRenderedHtml into #root.
 */
export function injectSeoMetadata(
  html: string,
  meta: {
    title: string;
    description: string;
    canonical: string;
    ogType?: string;
    image?: string;
    secondaryImage?: string;
    robots?: string;
    schemaJsonLd?: string;
    preRenderedHtml?: string;
  }
): string {
  let output = html;

  // 1. Title & Social Titles
  if (/<title>[\s\S]*?<\/title>/i.test(output)) {
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  } else {
    output = output.replace('</head>', `  <title>${escapeHtml(meta.title)}</title>\n</head>`);
  }
  output = upsertMetaTag(output, 'name', 'title', meta.title);
  output = upsertMetaTag(output, 'property', 'og:title', meta.title);
  output = upsertMetaTag(output, 'name', 'twitter:title', meta.title);
  output = upsertMetaTag(output, 'property', 'twitter:title', meta.title);

  // 2. Descriptions
  output = upsertMetaTag(output, 'name', 'description', meta.description);
  output = upsertMetaTag(output, 'property', 'og:description', meta.description);
  output = upsertMetaTag(output, 'name', 'twitter:description', meta.description);
  output = upsertMetaTag(output, 'property', 'twitter:description', meta.description);

  // 3. Absolute Single Canonical Enforcement
  output = output.replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, '');
  output = output.replace('</head>', `  <link rel="canonical" href="${meta.canonical}" />\n</head>`);

  // 4. AI Discovery llms.txt Link Hint
  if (!output.includes('rel="alternate" type="text/plain"')) {
    output = output.replace(
      '</head>',
      `  <link rel="alternate" type="text/plain" title="CHIP NG AI Knowledge Summary (llms.txt)" href="https://www.chipng.com/llms.txt" />\n</head>`
    );
  }

  // 5. URL & Type
  output = upsertMetaTag(output, 'property', 'og:url', meta.canonical);
  output = upsertMetaTag(output, 'property', 'twitter:url', meta.canonical);
  if (meta.ogType) {
    output = upsertMetaTag(output, 'property', 'og:type', meta.ogType);
  }

  // 6. Image (Full OpenGraph & Twitter Card compliance)
  if (meta.image) {
    output = output.replace(/<meta\s+property=["']og:image["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+property=["']og:image:secure_url["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+property=["']og:image:type["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+property=["']og:image:width["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+property=["']og:image:height["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+property=["']og:image:alt["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+(name|property)=["']twitter:image["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+(name|property)=["']twitter:image:alt["'][^>]*\/?>/gi, '');
    output = output.replace(/<meta\s+(name|property)=["']twitter:card["'][^>]*\/?>/gi, '');

    const altText = escapeHtml(meta.title || 'CHIP NG Cover Image');
    const imageBlock = [
      `  <meta property="og:site_name" content="CHIP NG" />`,
      `  <meta property="og:image" content="${meta.image}" />`,
      `  <meta property="og:image:secure_url" content="${meta.image}" />`,
      `  <meta property="og:image:type" content="image/jpeg" />`,
      `  <meta property="og:image:width" content="1200" />`,
      `  <meta property="og:image:height" content="630" />`,
      `  <meta property="og:image:alt" content="${altText}" />`,
      ...(meta.secondaryImage && meta.secondaryImage !== meta.image ? [
        `  <meta property="og:image" content="${meta.secondaryImage}" />`,
        `  <meta property="og:image:secure_url" content="${meta.secondaryImage}" />`
      ] : []),
      `  <meta name="twitter:card" content="summary_large_image" />`,
      `  <meta name="twitter:site" content="@chipng_nfc" />`,
      `  <meta name="twitter:creator" content="@chipng_nfc" />`,
      `  <meta name="twitter:image" content="${meta.image}" />`,
      `  <meta name="twitter:image:alt" content="${altText}" />`,
      `  <meta property="twitter:card" content="summary_large_image" />`,
      `  <meta property="twitter:image" content="${meta.image}" />`
    ].join('\n');

    output = output.replace('</head>', `${imageBlock}\n</head>`);
  }

  // 7. Robots Tag (enforce explicit index or noindex)
  const robotsValue = meta.robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  output = upsertMetaTag(output, 'name', 'robots', robotsValue);

  // 8. Schema.org JSON-LD
  if (meta.schemaJsonLd) {
    output = output.replace('</head>', `  <script type="application/ld+json">\n${meta.schemaJsonLd}\n  </script>\n</head>`);
  }

  // 9. Inject Semantic Pre-Rendered Body into #root for Crawlers, AI Agents & Instant First Paint
  if (meta.preRenderedHtml) {
    const trimmedBody = meta.preRenderedHtml.trim();
    const rootMarkerRegex = /<div\s+id=["']root["'][^>]*>[\s\S]*?(?=<script\s+type=["']module["']|<\/body>)/i;
    if (rootMarkerRegex.test(output)) {
      output = output.replace(rootMarkerRegex, `${trimmedBody}\n    `);
    }
  }

  return output;
}

function buildSsrShell(contentHtml: string): string {
  return `
<div id="root">
  <div style="min-height: 100vh; background: #0A0B0E; color: #F4F4F5; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px 20px 72px 20px; line-height: 1.65;">
    <header style="max-width: 1040px; margin: 0 auto 40px auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 18px;">
      <a href="/" style="color: #FFFFFF; font-weight: 800; font-size: 20px; text-decoration: none; letter-spacing: -0.02em;">CHIP NG</a>
      <nav aria-label="Primary Navigation" style="display: flex; flex-wrap: wrap; gap: 18px; font-size: 14px;">
        <a href="/" style="color: #D4D4D8; text-decoration: none;">Home</a>
        <a href="/buy-card" style="color: #16a34a; font-weight: 700; text-decoration: none;">Order NFC Card</a>
        <a href="/corporate-bundle" style="color: #D4D4D8; text-decoration: none;">Corporate Fleet</a>
        <a href="/pricing" style="color: #D4D4D8; text-decoration: none;">Pricing</a>
        <a href="/faq" style="color: #D4D4D8; text-decoration: none;">FAQ</a>
        <a href="/blog" style="color: #D4D4D8; text-decoration: none;">Blog</a>
        <a href="/company" style="color: #D4D4D8; text-decoration: none;">Company</a>
        <a href="/contact" style="color: #D4D4D8; text-decoration: none;">Contact</a>
      </nav>
    </header>
    <main style="max-width: 1040px; margin: 0 auto;">
      ${contentHtml}
    </main>
    <footer style="max-width: 1040px; margin: 64px auto 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #A1A1AA;">
      <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px;">
        <a href="/nfc-business-card-nigeria" style="color: #A1A1AA; text-decoration: none;">NFC Business Card Nigeria</a>
        <a href="/nfc-business-card-lagos" style="color: #A1A1AA; text-decoration: none;">NFC Card Lagos</a>
        <a href="/nfc-business-card-lekki" style="color: #A1A1AA; text-decoration: none;">NFC Card Lekki</a>
        <a href="/nfc-metal-business-card" style="color: #A1A1AA; text-decoration: none;">Metal NFC Card</a>
        <a href="/nfc-business-card-for-real-estate" style="color: #A1A1AA; text-decoration: none;">Realtor NFC Cards</a>
        <a href="/shipping" style="color: #A1A1AA; text-decoration: none;">Shipping Policy</a>
        <a href="/refund-policy" style="color: #A1A1AA; text-decoration: none;">Refund Policy</a>
        <a href="/privacy-policy" style="color: #A1A1AA; text-decoration: none;">Privacy Policy</a>
        <a href="/llms.txt" style="color: #A1A1AA; text-decoration: none;">AI Context (llms.txt)</a>
      </div>
      <p style="margin: 0;">CHIP NG Technologies Ltd · Lekki Phase 1, Lagos, Nigeria · +234 810 076 4154 · hello@chipng.com</p>
    </footer>
  </div>
</div>`;
}

const HOME_SSR_HTML = buildSsrShell(`
  <section style="margin-bottom: 48px;">
    <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #16a34a; margin: 0 0 12px 0;">
      Contactless NFC Smart Business Cards & Dynamic Link-in-Bio Platform · Nigeria
    </p>
    <h1 style="font-size: 40px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin: 0 0 16px 0; color: #FFFFFF;">
      Share Your Identity, Contacts & Portfolio in One Sub-10ms Tap.
    </h1>
    <p style="font-size: 17px; color: #D4D4D8; max-width: 740px; margin: 0 0 24px 0;">
      CHIP NG builds genuine NXP NTAG216 contactless smart business cards and dynamic cloud profiles for founders, realtors, corporate teams, and creators in Nigeria and worldwide. Recipients need zero app—one tap opens your digital card and saves your vCard directly to their phonebook.
    </p>
    <div style="display: flex; flex-wrap: wrap; gap: 12px;">
      <a href="/buy-card" style="padding: 12px 24px; border-radius: 999px; background: #16a34a; color: #050507; font-weight: 800; text-decoration: none;">Order Smart Card (From ₦30,000)</a>
      <a href="/corporate-bundle" style="padding: 12px 24px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.2); color: #FFFFFF; font-weight: 700; text-decoration: none;">Corporate Fleet (10 + 1 Free Metal)</a>
    </div>
  </section>

  <section style="margin-bottom: 48px;">
    <h2 style="font-size: 26px; font-weight: 800; color: #FFFFFF; margin: 0 0 16px 0;">2026 Smart NFC Business Card Tiers & Pricing</h2>
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; border: 1px solid rgba(255,255,255,0.12);">
      <thead>
        <tr style="background: rgba(255,255,255,0.05);">
          <th style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.12);">Card Edition</th>
          <th style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.12);">Price (NGN)</th>
          <th style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.12);">Hardware & Features</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">NFC Smart White / Black PVC Card</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">₦30,000 – ₦35,000</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">NTAG216 chip, matte UV polymer finish, backup dynamic QR, lifetime free cloud bio profile.</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">NFC Smart Metal Card</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">₦50,000</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">Brushed 304 stainless steel, fiber-laser engraving, executive 22.5g weight, lifetime profile hosting.</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">Metal Debit Card + Custom Design</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">₦80,000 – ₦100,000</td>
          <td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08);">Dual-sided custom CNC/fiber artwork, mirror gold or obsidian finish, concierge profile setup.</td>
        </tr>
        <tr>
          <td style="padding: 12px;">Corporate Fleet Bundle (10 + 1 Free CEO Metal)</td>
          <td style="padding: 12px;">₦300,000</td>
          <td style="padding: 12px;">10 custom team PVC cards + 1 complimentary CEO Stainless Steel card + unified team management.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2 style="font-size: 24px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0;">Frequently Asked Questions</h2>
    <dl style="margin: 0; display: grid; gap: 16px;">
      <div>
        <dt style="font-weight: 700; color: #FFFFFF;">How does a CHIP NG contactless card work?</dt>
        <dd style="margin: 4px 0 0 0; color: #A1A1AA;">Tap your CHIP NG card on the back of any iPhone (iOS 13+) or NFC-enabled Android smartphone. The embedded 13.56 MHz NTAG216 chip opens your dynamic profile in under 10ms with no app download required.</dd>
      </div>
      <div>
        <dt style="font-weight: 700; color: #FFFFFF;">How fast is delivery in Lagos and across Nigeria?</dt>
        <dd style="margin: 4px 0 0 0; color: #A1A1AA;">Lagos orders dispatch in 24–48 hours from our Lekki Phase 1 workshop. Nationwide delivery to Abuja, Port Harcourt, Ibadan, and all 36 states takes 2–4 business days via DHL Express and GIG Logistics.</dd>
      </div>
      <div>
        <dt style="font-weight: 700; color: #FFFFFF;">Is there a monthly subscription fee?</dt>
        <dd style="margin: 4px 0 0 0; color: #A1A1AA;">No monthly fee is required. Every physical card includes lifetime hosting for your dynamic link-in-bio, contact exchange, and analytics.</dd>
      </div>
    </dl>
  </section>
`);

const BUY_CARD_SSR_HTML = buildSsrShell(`
  <section style="margin-bottom: 36px;">
    <h1 style="font-size: 38px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0;">YOUR BUSINESS DESERVES MORE THAN A PAPER BUSINESS CARD.</h1>
    <p style="font-size: 16px; color: #D4D4D8; max-width: 720px;">
      Share your contact details, website, WhatsApp, and social media in 1 second on every iPhone &amp; Android—no app needed. Delivered in 24–48 hours in Lagos, 2–4 days nationwide via DHL &amp; GIG Logistics, and backed by our 12-Month Free NFC Chip Replacement Guarantee.
    </p>
  </section>
  <section style="display: grid; gap: 18px; margin-bottom: 36px;">
    <article style="padding: 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #FFFFFF;">Standard White PVC NFC Card — ₦30,000</h2>
      <p style="margin: 0; color: #A1A1AA;">Clean ceramic white waterproof finish with vibrant full-color front &amp; back printing. Ideal for colorful logos, works on every iPhone &amp; Android in 1 second + QR backup.</p>
    </article>
    <article style="padding: 20px; border: 1px solid rgba(22,163,74,0.5); border-radius: 16px;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #FFFFFF;">Premium Matte Black PVC Card — ₦35,000 (+₦5,000 Upgrade)</h2>
      <p style="margin: 0; color: #A1A1AA;">Upgrades to a sleek Matte Black soft-touch body with raised waterproof UV print and anti-scratch coat that resists wallet scuffs and fingerprints on both sides.</p>
    </article>
    <article style="padding: 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #FFFFFF;">Executive Metal NFC Card — ₦50,000</h2>
      <p style="margin: 0; color: #A1A1AA;">Solid stainless steel weight with scratch-proof laser engraving that never peels or fades. Works in 1 second on iPhone &amp; Android with an engraved QR backup.</p>
    </article>
    <article style="padding: 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #FFFFFF;">Custom Metal Card (Bespoke &amp; Flagship) — ₦80,000 – ₦100,000</h2>
      <p style="margin: 0; color: #A1A1AA;">1-on-1 custom front &amp; back engraving in Matte Black, 24K Gold Mirror, or Brushed Steel—scratch-proof artwork that never fades, plus pre-dispatch video check.</p>
    </article>
    <article style="padding: 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;">
      <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #FFFFFF;">Corporate Team Pack (10 PVC + 1 CEO Metal) — ₦300,000</h2>
      <p style="margin: 0; color: #A1A1AA;">Equip your team with 10 branded staff PVC cards + 1 complimentary CEO Metal card, centralized profile updates, and softcopy proofs before printing.</p>
    </article>
  </section>
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0;">Delivery Speed &amp; 12-Month Chip Warranty</h2>
    <p style="margin: 0; color: #D4D4D8;">24–48 hr Lagos delivery with live courier tracking · 2–4 business days nationwide via DHL &amp; GIG Logistics · 12-Month Free NFC Chip Replacement Guarantee if your chip ever stops scanning · WhatsApp softcopy proof approval before production.</p>
  </section>
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0;">Verified Nigerian Client Reviews</h2>
    <ul style="list-style: none; padding: 0; display: grid; gap: 12px; color: #D4D4D8;">
      <li><strong>Tony Zola — Kano (5/5):</strong> "Excellent work on the metal card. The finishing is clean, the card feels strong and premium, and the overall quality is impressive. It looks much more luxurious than a regular plastic ATM card. Highly recommended."</li>
      <li><strong>Samirah Ade-Adebiyi — Managing Director, Lagos (5/5):</strong> "Clean softcopy design proofs sent on WhatsApp to approve before printing for our leadership team."</li>
      <li><strong>Star Capital — Lagos (5/5):</strong> "Fast Lagos courier dispatch with live rider tracking straight to our office. Taps open cleanly on iPhone and Android without an app."</li>
    </ul>
  </section>
`);

const CORPORATE_BUNDLE_SSR_HTML = buildSsrShell(`
  <section style="margin-bottom: 40px;">
    <h1 style="font-size: 38px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0;">CHIP NG Corporate Fleet Bundle — 10 Smart PVC Cards + 1 Free CEO Metal Card</h1>
    <p style="font-size: 16px; color: #D4D4D8; max-width: 740px;">
      Equip your Nigerian sales team, real estate agency, dealership, or executive staff with unified contactless NFC business cards. One-time package price: ₦300,000 NGN with centralized team dashboard control and 24–48h Lagos delivery. Rated 4.9/5 by 47 verified enterprise reviewers.
    </p>
    <ul style="color: #D4D4D8; margin-top: 20px; padding-left: 20px;">
      <li>10x Custom Branded Matte PVC NFC Cards for staff</li>
      <li>1x Complimentary Stainless Steel CEO Metal Card (₦50,000 value)</li>
      <li>Centralized Enterprise Team Hub to update staff titles, phone numbers, and brochures remotely</li>
      <li>Instant 2-Way Lead Capture & WhatsApp routing</li>
    </ul>
    <p style="margin-top: 24px;"><a href="/buy-card" style="color: #16a34a; font-weight: 700;">Compare Individual Card Editions →</a></p>
  </section>
`);

/**
 * Master Universal SSR Transformer.
 * Injects rich <head> metadata, OpenGraph, Twitter Cards, Schema.org JSON-LD,
 * and semantic pre-rendered HTML into the initial HTML document.
 */
export async function applyUniversalSsr(
  html: string,
  context: UniversalSsrContext
): Promise<string> {
  const { urlPath, supabase, db } = context;
  let output = html;

  const normalizedPath = (urlPath || '/').split('?')[0].replace(/\/$/, '') || '/';

  // 0. Non-Indexable Auth / Private App Routes
  if (
    normalizedPath === '/admin' ||
    normalizedPath.startsWith('/admin/') ||
    normalizedPath === '/dashboard' ||
    normalizedPath.startsWith('/dashboard/') ||
    normalizedPath === '/enterprise' ||
    normalizedPath.startsWith('/enterprise/') ||
    normalizedPath === '/login' ||
    normalizedPath.startsWith('/login/') ||
    normalizedPath === '/settings' ||
    normalizedPath.startsWith('/settings/') ||
    normalizedPath === '/checkout' ||
    normalizedPath === '/onboarding' ||
    normalizedPath === '/client-onboarding' ||
    normalizedPath === '/setup-profile' ||
    normalizedPath === '/setup' ||
    normalizedPath === '/buy-card/payment-status' ||
    normalizedPath === '/buycard/payment-status'
  ) {
    return injectSeoMetadata(output, {
      title: 'CHIPNG Order & Account Portal',
      description: 'Order status and account portal for CHIPNG contactless smart business cards.',
      canonical: `https://www.chipng.com${normalizedPath}`,
      robots: 'noindex, nofollow',
    });
  }

  // 1. Hardware Shop & Sales Pages
  if (normalizedPath === '/buy-card' || normalizedPath === '/buycard' || normalizedPath === '/shop' || normalizedPath === '/nfc-sales') {
    return injectSeoMetadata(output, {
      title: BUY_CARD_META.title,
      description: BUY_CARD_META.description,
      canonical: normalizedPath === '/shop' ? 'https://www.chipng.com/shop' : BUY_CARD_META.canonical,
      ogType: 'product',
      image: BUY_CARD_META.image,
      schemaJsonLd: BUY_CARD_SCHEMA_JSON_LD,
      preRenderedHtml: BUY_CARD_SSR_HTML,
    });
  }

  // 1.5 Corporate Fleet Bundle Pages
  if (
    normalizedPath === '/corporate-bundle' ||
    normalizedPath === '/corporate-fleet' ||
    normalizedPath === '/fleet' ||
    normalizedPath === '/corporate'
  ) {
    const corpSchema = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': 'https://www.chipng.com/corporate-bundle#product',
      name: 'CHIP NG Corporate Fleet NFC Business Card Bundle (10 PVC + 1 Free CEO Metal)',
      image: CHIPNG_PRODUCT_IMAGES,
      description: 'Enterprise NFC business card package in Nigeria: 10 custom Smart PVC cards + 1 complimentary Stainless Steel CEO Metal card for ₦300,000.',
      sku: 'CHIP-CORP-FLEET-11',
      mpn: 'NTAG216-CORP-11',
      brand: { '@type': 'Brand', name: 'CHIP NG' },
      aggregateRating: CHIPNG_PRODUCT_AGGREGATE_RATING,
      review: CHIPNG_PRODUCT_REVIEWS,
      offers: {
        '@type': 'Offer',
        price: '300000',
        priceCurrency: 'NGN',
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: 'https://schema.org/InStock',
        url: 'https://www.chipng.com/corporate-bundle',
        seller: { '@type': 'Organization', name: 'CHIP NG Technologies Ltd' },
      },
    });
    return injectSeoMetadata(output, {
      title: 'Corporate Fleet NFC Card Bundle (10 PVC + 1 Free Metal) | CHIP NG Nigeria',
      description: 'Equip your team with 10 custom NFC smart PVC cards + 1 free Stainless Steel CEO metal card for ₦300,000. Centralized team bio management and 24–48h Lagos delivery.',
      canonical: 'https://www.chipng.com/corporate-bundle',
      ogType: 'product',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: corpSchema,
      preRenderedHtml: CORPORATE_BUNDLE_SSR_HTML,
    });
  }

  // 2. Homepage
  if (normalizedPath === '/') {
    return injectSeoMetadata(output, {
      title: 'CHIP NG — Contactless Smart NFC Business Cards & Link-in-Bio Platform Nigeria',
      description: 'The premier contactless NFC smart business cards & dynamic link-in-bio platform in Nigeria. 1-tap contact sharing, zero app needed, NTAG216 chip, sub-10ms response. 24h Lagos delivery.',
      canonical: 'https://www.chipng.com/',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: HOME_SCHEMA_JSON_LD,
      preRenderedHtml: HOME_SSR_HTML,
    });
  }

  // 3. Pricing Page
  if (normalizedPath === '/pricing') {
    return injectSeoMetadata(output, {
      title: 'NFC Business Card Price in Nigeria — 2026 Transparent Pricing | CHIP NG',
      description: 'Official 2026 prices for CHIP NG contactless smart cards: Smart PVC (₦30,000 / ₦35,000), Smart Metal (₦50,000), and Metal Debit Card + Custom Design (₦80,000–₦100,000). Zero monthly subscription fees.',
      canonical: 'https://www.chipng.com/pricing',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: PRICING_SCHEMA_JSON_LD,
      preRenderedHtml: HOME_SSR_HTML,
    });
  }

  // 4. FAQ Page
  if (normalizedPath === '/faq') {
    return injectSeoMetadata(output, {
      title: 'Frequently Asked Questions & Hardware Guide | CHIP NG Nigeria',
      description: 'Everything you need to know about CHIP NG contactless smart business cards. How NFC works, compatibility, delivery times, and vCard address book saving in Nigeria.',
      canonical: 'https://www.chipng.com/faq',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: FAQ_SCHEMA_JSON_LD,
      preRenderedHtml: HOME_SSR_HTML,
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
          '@id': `${canonical}#product`,
          name: page.headline,
          description: page.overview,
          image: CHIPNG_PRODUCT_IMAGES,
          sku: `CHIP-${page.slug.toUpperCase()}`,
          mpn: 'NTAG216-NG',
          brand: { '@type': 'Brand', name: 'CHIP NG' },
          aggregateRating: CHIPNG_PRODUCT_AGGREGATE_RATING,
          review: CHIPNG_PRODUCT_REVIEWS,
          offers: buildChipngAggregateOffers(canonical),
        },
        {
          '@type': 'FAQPage',
          mainEntity: page.faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer }
          }))
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chipng.com/' },
            { '@type': 'ListItem', position: 2, name: page.headline, item: canonical }
          ]
        }
      ]
    });

    const commercialHtml = buildSsrShell(`
      <article>
        <p style="font-size: 12px; font-weight: 700; color: #16a34a; text-transform: uppercase; letter-spacing: 0.08em;">${escapeHtml(page.heroBadge)}</p>
        <h1 style="font-size: 38px; font-weight: 800; color: #FFFFFF; margin: 8px 0 14px 0;">${escapeHtml(page.headline)}</h1>
        <p style="font-size: 17px; color: #D4D4D8; max-width: 760px;">${escapeHtml(page.subheadline)}</p>
        <p style="font-size: 15px; color: #A1A1AA; max-width: 760px;">${escapeHtml(page.overview)}</p>
        <p style="font-size: 14px; color: #16a34a; font-weight: 700;">Rated 4.9/5 across 47 verified customer reviews</p>
        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 32px;">Key Advantages</h2>
        <ul style="color: #D4D4D8;">
          ${page.keyBenefits.map(b => `<li><strong>${escapeHtml(b.title)}:</strong> ${escapeHtml(b.description)}</li>`).join('\n')}
        </ul>
        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 28px;">Technical Specifications</h2>
        <dl style="color: #D4D4D8;">
          ${page.technicalSpecs.map(s => `<dt style="font-weight:700;">${escapeHtml(s.label)}</dt><dd style="margin: 0 0 8px 0; color:#A1A1AA;">${escapeHtml(s.value)}</dd>`).join('\n')}
        </dl>
        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 28px;">Verified Nigerian Client Reviews</h2>
        <ul style="color: #D4D4D8;">
          <li><strong>Tony Zola — Kano (5/5):</strong> "Excellent work on the metal card. The finishing is clean, the card feels strong and premium, and the overall quality is impressive."</li>
          <li><strong>Samirah Ade-Adebiyi — Managing Director, Lagos (5/5):</strong> "Softcopy design proofs sent on WhatsApp before printing for our leadership team."</li>
          <li><strong>Star Capital — Lagos (5/5):</strong> "Fast Lagos courier delivery with live rider tracking straight to our office."</li>
        </ul>
        <h2 style="font-size: 22px; font-weight: 800; color: #FFFFFF; margin-top: 28px;">Frequently Asked Questions</h2>
        <dl style="color: #D4D4D8;">
          ${page.faqs.map(f => `<dt style="font-weight:700;">${escapeHtml(f.question)}</dt><dd style="margin: 4px 0 12px 0; color:#A1A1AA;">${escapeHtml(f.answer)}</dd>`).join('\n')}
        </dl>
        <p style="margin-top: 24px;"><a href="/buy-card" style="padding: 12px 24px; border-radius: 999px; background: #16a34a; color: #050507; font-weight: 800; text-decoration: none;">Order Your CHIP NG Card →</a></p>
      </article>
    `);

    return injectSeoMetadata(output, {
      title: page.metaTitle,
      description: page.metaDescription,
      canonical,
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: commercialSchema,
      preRenderedHtml: commercialHtml,
    });
  }

  // 6. Blog Directory Page (/blog)
  if (normalizedPath === '/blog') {
    const blogDir = await renderBlogDirectorySsr(supabase, db);
    return injectSeoMetadata(output, {
      title: blogDir.title,
      description: blogDir.description,
      canonical: blogDir.canonical,
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
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

  // 7.5. Official Mobile App Companion (/app, /download, /mobile, /android, /get-app)
  if (normalizedPath === '/app' || normalizedPath === '/download' || normalizedPath === '/mobile' || normalizedPath === '/android' || normalizedPath === '/get-app') {
    const appSchema = {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: 'CHIP NG Mobile Companion',
      operatingSystem: 'iOS, Android',
      applicationCategory: 'BusinessApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '1856'
      },
      description: 'Official companion app for CHIP NG contactless smart business cards. Program NTAG216 microchips, receive real-time push alerts on card taps, exchange contacts offline, and manage dynamic link-in-bio profiles across Nigeria.'
    };

    const appPreRender = buildSsrShell(`
      <div style="text-align: center;">
        <span style="display: inline-block; padding: 6px 14px; border-radius: 999px; background: rgba(22, 163, 74, 0.15); color: #16a34a; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
          Official Mobile Companion v2.4.0
        </span>
        <h1 style="font-size: 42px; font-weight: 900; letter-spacing: -0.02em; line-height: 1.15; margin: 0 0 16px 0; color: #ffffff;">
          Program Cards. Track Live Taps in Real-Time.
        </h1>
        <p style="font-size: 17px; color: rgba(255, 255, 255, 0.75); max-width: 680px; margin: 0 auto 32px auto; line-height: 1.6;">
          The official mobile companion for Nigerian dealmakers. Write NTAG216 microchips on iOS & Android in under 10ms, receive real-time push alerts on card taps, and swap contacts offline.
        </p>
      </div>
    `);

    return injectSeoMetadata(output, {
      title: 'CHIP NG Official Mobile App — Program NFC Cards & Track Live Radar Telemetry (iOS & Android)',
      description: 'Download the official CHIP NG mobile companion for iPhone and Android. Sub-10ms NTAG216 chip programming, real-time push alerts on card taps, offline contact vault, and digital bio sync in Lagos, Abuja, and nationwide.',
      canonical: 'https://www.chipng.com/app',
      ogType: 'website',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: JSON.stringify(appSchema),
      preRenderedHtml: appPreRender
    });
  }

  // 7.8. Standalone Portfolio Page (/portfolio)
  if (normalizedPath === '/portfolio') {
    const portfolioSchema = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Victor Okoye',
        jobTitle: 'Full-stack Developer & Hardware-Software Architect',
        worksFor: {
          '@type': 'Organization',
          name: 'CHIP NG Technologies Ltd'
        },
        sameAs: [
          'https://github.com/vickdennis',
          'https://linkedin.com/company/chipng',
          'https://x.com/chipng_nfc',
          'https://instagram.com/chipng_nfc'
        ]
      }
    };

    const portfolioHtml = buildSsrShell(`
      <article>
        <h1 style="font-size: 38px; font-weight: 800; color: #FFFFFF; margin: 0 0 12px 0;">Victor Okoye — Full-Stack Developer & Hardware-Software Architect</h1>
        <p style="font-size: 16px; color: #D4D4D8; max-width: 720px;">Founder and lead architect of CHIP NG contactless NFC smart business cards and dynamic cloud bio infrastructure in Lagos, Nigeria.</p>
      </article>
    `);

    return injectSeoMetadata(output, {
      title: 'Victor Okoye — Full-stack Developer & Hardware-Software Architect | Portfolio',
      description: 'Explore the full-stack engineering portfolio of Victor Okoye. Founder and lead engineer behind CHIP NG contactless smart cards and digital commerce platforms.',
      canonical: 'https://www.chipng.com/portfolio',
      ogType: 'profile',
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: JSON.stringify(portfolioSchema),
      preRenderedHtml: portfolioHtml,
    });
  }

  // 8. Institutional & Policy Pages
  if (normalizedPath === '/company' || normalizedPath === '/about') {
    const companyHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">About CHIP NG</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7;">
        CHIP NG is Nigeria’s premier contactless smart business card and dynamic digital identity platform. Headquartered in Lekki Phase 1, Lagos, we engineer precision NTAG216 NFC hardware paired with a cloud bio engine for modern entrepreneurs and enterprises across Africa.
      </p>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: companySchema,
      preRenderedHtml: companyHtml
    });
  }

  if (normalizedPath === '/contact') {
    const contactHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">Contact CHIP NG Support & Sales</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        Direct inquiries for custom corporate NFC card deployments, bulk orders, and API integration in Nigeria.
      </p>
      <ul style="font-size: 15px; color: #D4D4D8; line-height: 2;">
        <li><strong>Location:</strong> Lekki Phase 1, Lagos, Nigeria</li>
        <li><strong>Email:</strong> <a href="mailto:hello@chipng.com" style="color: #16a34a;">hello@chipng.com</a></li>
        <li><strong>Phone / WhatsApp:</strong> +234 810 076 4154</li>
        <li><strong>Operating Hours:</strong> Monday – Saturday, 08:00 – 20:00 GMT+1</li>
      </ul>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: contactSchema,
      preRenderedHtml: contactHtml
    });
  }

  if (normalizedPath === '/shipping') {
    const shippingHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">CHIP NG Shipping & Nationwide Logistics Policy</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        Fast, reliable delivery of your custom laser-engraved NFC smart cards across Lagos and all 36 Nigerian states.
      </p>
      <ul style="font-size: 15px; color: #D4D4D8; line-height: 1.8;">
        <li><strong>Lagos State (Island & Mainland):</strong> 24–48 hours express dispatch via vetted dispatch riders.</li>
        <li><strong>Abuja (FCT) & Port Harcourt:</strong> 2–3 business days via DHL Express & GIG Logistics.</li>
        <li><strong>All Other States:</strong> 3–4 business days with trackable parcel waybill.</li>
      </ul>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: shippingSchema,
      preRenderedHtml: shippingHtml
    });
  }

  if (normalizedPath === '/refund-policy') {
    const refundHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">Refund Policy & Hardware Warranty</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        Every CHIP NG contactless card is manufactured with genuine NTAG216 microchips and tested before dispatch.
      </p>
      <h2 style="font-size: 20px; font-weight: 800; color: #FFFFFF;">30-Day Defect Replacement Guarantee</h2>
      <p style="font-size: 15px; color: #A1A1AA; line-height: 1.7;">
        If your card chip fails to scan within 30 days of arrival due to manufacturing defect, we will laser-engrave and re-dispatch a brand new replacement card at zero cost.
      </p>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: refundSchema,
      preRenderedHtml: refundHtml
    });
  }

  if (normalizedPath === '/privacy-policy' || normalizedPath === '/privacy') {
    const privacyHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">Privacy Policy</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        CHIP NG complies with the Nigeria Data Protection Act (NDPA) and international privacy best practices.
      </p>
      <p style="font-size: 15px; color: #A1A1AA; line-height: 1.8;">
        We only store information you explicitly add to your public bio profile (such as name, WhatsApp, email, links, and avatar) so that contacts who tap your physical card can view your contact information.
      </p>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: privacySchema,
      preRenderedHtml: privacyHtml
    });
  }

  if (normalizedPath === '/terms-of-service' || normalizedPath === '/terms') {
    const termsHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">Terms of Service</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        Terms governing your purchase of CHIP NG contactless hardware and usage of our dynamic bio engine.
      </p>
      <p style="font-size: 15px; color: #A1A1AA; line-height: 1.8;">
        By activating a CHIP NG card, you agree to utilize the platform for lawful personal and commercial networking. We guarantee 99.9% uptime of your hosted bio link.
      </p>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: termsSchema,
      preRenderedHtml: termsHtml
    });
  }

  if (normalizedPath === '/updates') {
    const updatesHtml = buildSsrShell(`
      <h1 style="font-size: 36px; font-weight: 900; margin-bottom: 12px; color: #FFFFFF;">CHIP NG Platform Updates & Changelog</h1>
      <p style="font-size: 16px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        Recent releases for our NFC card hardware firmware, multi-currency international checkout, live telemetry analytics, and digital bio link engine.
      </p>
    `);
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
      image: 'https://www.chipng.com/chipng_3d_logo.jpg',
      schemaJsonLd: updatesSchema,
      preRenderedHtml: updatesHtml
    });
  }

  // 9. Dynamic User Profiles (/@username & /username)
  const RESERVED_ROUTES = [
    '/admin', '/enterprise', '/login', '/dashboard', '/api', '/blog',
    '/app', '/download', '/get-app', '/mobile', '/android', '/onboarding',
    '/client-onboarding', '/setup-profile', '/setup', '/settings', '/checkout',
    '/company', '/about', '/updates', '/contact', '/buy-card', '/buycard', '/shop',
    '/pricing', '/faq', '/shipping', '/refund-policy', '/privacy-policy',
    '/privacy', '/terms-of-service', '/terms', '/nfc-sales', '/portfolio',
    '/corporate-bundle', '/corporate-fleet', '/fleet', '/corporate', '/review', '/reviews', '/drop-review'
  ];

  const isReserved = RESERVED_ROUTES.some(r => normalizedPath === r || normalizedPath.startsWith(r + '/'));

  if (!isReserved && normalizedPath !== '/') {
    let rawUsername = extractUsernameFromPath(normalizedPath) || normalizedPath.replace(/^\//, '');
    try {
      rawUsername = decodeURIComponent(rawUsername);
    } catch (e) {}
    while (rawUsername.startsWith('@')) rawUsername = rawUsername.slice(1);
    if (rawUsername.endsWith('/vcard')) rawUsername = rawUsername.replace(/\/vcard$/, '');
    if (rawUsername.endsWith('.vcf')) rawUsername = rawUsername.replace(/\.vcf$/, '');
    rawUsername = rawUsername.trim().toLowerCase();

    if (rawUsername) {
      const profileSsr = await renderUserProfileSsr(rawUsername, supabase);
      if (profileSsr) {
        return injectSeoMetadata(output, {
          title: profileSsr.title,
          description: profileSsr.description,
          canonical: profileSsr.canonical,
          ogType: 'profile',
          image: profileSsr.image,
          secondaryImage: profileSsr.secondaryImage,
          schemaJsonLd: profileSsr.schemaJsonLd,
          preRenderedHtml: profileSsr.preRenderedHtml
        });
      }
    }
  }

  return output;
}
