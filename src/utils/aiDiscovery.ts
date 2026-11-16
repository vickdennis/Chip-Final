/**
 * Search Engine & AI Agent Discovery Utilities for CHIP NG (www.chipng.com)
 * Generates live XML Sitemaps (with Image extensions), robots.txt, and llmstxt.org-compliant
 * Markdown knowledge files (/llms.txt & /llms-full.txt) for AI search engines and crawlers.
 */

import { COMMERCIAL_PAGES } from '../data/commercialPagesData';

export const BASE_URL = 'https://www.chipng.com';

const RESERVED_PROFILE_SLUGS = new Set([
  'admin',
  'enterprise',
  'login',
  'dashboard',
  'settings',
  'checkout',
  'api',
  'blog',
  'app',
  'download',
  'get-app',
  'mobile',
  'android',
  'review',
  'reviews',
  'drop-review',
  'company',
  'about',
  'updates',
  'contact',
  'buy-card',
  'buycard',
  'shop',
  'pricing',
  'faq',
  'privacy',
  'privacy-policy',
  'terms',
  'terms-of-service',
  'refund-policy',
  'shipping',
  'nfc-sales',
  'portfolio',
  'corporate-bundle',
  'corporate-fleet',
  'fleet',
  'corporate',
  'onboarding',
  'client-onboarding',
  'setup-profile',
  'setup',
  'vcard',
]);

export const FALLBACK_BLOG_SLUGS = [
  {
    slug: 'hardware-engineering-sub-10ms-nfc',
    title: 'Hardware Engineering: How CHIP NG Delivers Sub-10ms NFC Response with NTAG216',
    excerpt: 'Deep dive into NTAG216 13.56MHz RFID antenna tuning and edge caching for instant contactless card taps on iOS and Android.',
  },
  {
    slug: 'nfc-card-price-in-lagos-best-digital-card-for-nigerian-realtors',
    title: 'NFC Card Price in Lagos: Best Digital Business Card for Nigerian Realtors',
    excerpt: '2026 buyer guide comparing Smart PVC (₦30,000), Smart Metal (₦50,000), and Custom Metal cards for Lagos real estate agents.',
  },
  {
    slug: 'how-much-do-nfc-business-cards-cost-in-2026-nigeria-global-price-guide',
    title: 'How Much Do NFC Business Cards Cost in 2026? Nigeria & Global Price Guide',
    excerpt: 'Transparent breakdown of Smart PVC, Stainless Steel Metal, and Custom Metal NFC card pricing in NGN and USD with zero recurring fees.',
  },
  {
    slug: 'nfc-card-price-lagos-realtors-2026',
    title: 'NFC Business Card Pricing for Lagos Realtors in 2026',
    excerpt: 'How top Lekki, Ikoyi, and Victoria Island realtors use contactless smart cards to share floor plans and close faster.',
  },
  {
    slug: 'nfc-business-card-price-lagos-for-realtors-2026-choose-your-card-close-faster',
    title: 'Choose Your NFC Business Card & Close Real Estate Deals Faster in Lagos',
    excerpt: 'Practical ROI guide on replacing paper business cards with dynamic CHIP NG contactless profiles.',
  },
  {
    slug: 'the-future-of-car-sales-why-nfc-business-cards-are-a-game-changer-for-dealerships',
    title: 'The Future of Car Sales: Why NFC Business Cards Are a Game-Changer for Dealerships',
    excerpt: 'Instant test-drive booking, WhatsApp lead capture, and vehicle inventory sharing for Nigerian auto dealers.',
  },
  {
    slug: 'nfc-business-card-guide',
    title: 'Complete Guide to NFC Business Cards in Nigeria (iPhone, Android & vCard Sync)',
    excerpt: 'Everything Nigerian professionals need to know about contactless NFC smart cards, compatibility, and setup.',
  },
];

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Allow: /api/cover/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /enterprise/
Disallow: /settings/
Disallow: /checkout
Disallow: /login
Disallow: /api/admin/
Disallow: /api/auth/

# Search Engine & Answer Engine Optimization (AEO) Bots
User-agent: Googlebot
User-agent: Google-InspectionTool
User-agent: Googlebot-Image
User-agent: Google-Extended
User-agent: Bingbot
User-agent: DuckDuckBot
User-agent: DuckAssistBot
User-agent: Applebot
User-agent: Applebot-Extended
User-agent: OAI-SearchBot
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: ClaudeBot
User-agent: Claude-Web
User-agent: anthropic-ai
User-agent: cohere-ai
User-agent: YouBot
User-agent: meta-externalagent
User-agent: facebookexternalhit
User-agent: Twitterbot
User-agent: LinkedInBot
Allow: /
Allow: /api/cover/
Allow: /llms.txt
Allow: /llms-full.txt

# AI Agent Knowledge Files
# Primary: https://www.chipng.com/llms.txt
# Full: https://www.chipng.com/llms-full.txt

Sitemap: https://www.chipng.com/sitemap.xml
Host: https://www.chipng.com`;
}

export interface DiscoveryDataset {
  posts: { slug: string; title?: string; excerpt?: string; cover_image_url?: string; updated_at?: string; created_at?: string }[];
  profiles: { username: string; full_name?: string; headline?: string; cover_image_url?: string; updated_at?: string }[];
}

export async function collectDiscoveryDataset(supabase: any, db: any = null): Promise<DiscoveryDataset> {
  const postMap = new Map<string, any>();

  if (supabase) {
    try {
      const { data } = await supabase
        .from('posts')
        .select('slug, title, excerpt, cover_image_url, updated_at, created_at')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(500);
      if (Array.isArray(data)) {
        for (const p of data) {
          if (p?.slug) postMap.set(String(p.slug).trim(), p);
        }
      }
    } catch (_e) {}
  }

  if (db) {
    try {
      const localPosts = db
        .prepare('SELECT slug, title, excerpt, cover_image_url, updated_at, created_at FROM local_posts WHERE is_published = 1')
        .all() as any[];
      for (const p of localPosts) {
        if (p?.slug && !postMap.has(String(p.slug).trim())) {
          postMap.set(String(p.slug).trim(), p);
        }
      }
    } catch (_e) {}
  }

  for (const fallback of FALLBACK_BLOG_SLUGS) {
    if (!postMap.has(fallback.slug)) {
      postMap.set(fallback.slug, fallback);
    }
  }

  const profileMap = new Map<string, any>();
  if (supabase) {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('username, full_name, headline, cover_image_url, updated_at')
        .not('username', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(2000);

      if (Array.isArray(profiles)) {
        for (const prof of profiles) {
          const clean = String(prof?.username || '').replace(/^@+/, '').trim().toLowerCase();
          if (
            clean &&
            clean.length >= 2 &&
            !clean.includes(' ') &&
            !RESERVED_PROFILE_SLUGS.has(clean) &&
            !COMMERCIAL_PAGES[clean] &&
            !profileMap.has(clean)
          ) {
            profileMap.set(clean, {
              ...prof,
              username: clean,
            });
          }
        }
      }
    } catch (_e) {}
  }

  return {
    posts: Array.from(postMap.values()),
    profiles: Array.from(profileMap.values()),
  };
}

export async function generateDynamicSitemapXml(supabase: any, db: any = null): Promise<string> {
  const dataset = await collectDiscoveryDataset(supabase, db);
  const today = new Date().toISOString().split('T')[0];

  const corePages: { path: string; changefreq: string; priority: string; image?: string; imageTitle?: string }[] = [
    { path: '', changefreq: 'daily', priority: '1.0', image: `${BASE_URL}/chipng_3d_logo.jpg`, imageTitle: 'CHIP NG Smart NFC Business Cards Nigeria' },
    { path: 'buy-card', changefreq: 'weekly', priority: '0.95', image: `${BASE_URL}/chipng_3d_logo.jpg`, imageTitle: 'Buy CHIP NG Contactless NFC Business Card' },
    { path: 'shop', changefreq: 'weekly', priority: '0.95', image: `${BASE_URL}/chipng_3d_logo.jpg`, imageTitle: 'CHIP NG Smart Card Hardware Store' },
    { path: 'corporate-bundle', changefreq: 'weekly', priority: '0.95', image: `${BASE_URL}/chipng_3d_logo.jpg`, imageTitle: 'CHIP NG Corporate Fleet NFC Card Bundle' },
    { path: 'pricing', changefreq: 'weekly', priority: '0.9' },
    { path: 'faq', changefreq: 'weekly', priority: '0.85' },
    { path: 'app', changefreq: 'weekly', priority: '0.9' },
    { path: 'blog', changefreq: 'daily', priority: '0.9' },
    { path: 'portfolio', changefreq: 'weekly', priority: '0.8' },
    { path: 'company', changefreq: 'monthly', priority: '0.7' },
    { path: 'updates', changefreq: 'weekly', priority: '0.7' },
    { path: 'contact', changefreq: 'monthly', priority: '0.7' },
    { path: 'shipping', changefreq: 'monthly', priority: '0.6' },
    { path: 'refund-policy', changefreq: 'monthly', priority: '0.6' },
    { path: 'privacy-policy', changefreq: 'monthly', priority: '0.5' },
    { path: 'terms-of-service', changefreq: 'monthly', priority: '0.5' },
  ];

  const urls: string[] = [];

  for (const page of corePages) {
    const loc = page.path ? `${BASE_URL}/${page.path}` : `${BASE_URL}/`;
    const imageXml = page.image
      ? `\n    <image:image>\n      <image:loc>${escapeXml(page.image)}</image:loc>\n      <image:title>${escapeXml(page.imageTitle || 'CHIP NG')}</image:title>\n    </image:image>`
      : '';
    urls.push(`  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageXml}
  </url>`);
  }

  for (const page of Object.values(COMMERCIAL_PAGES)) {
    urls.push(`  <url>
    <loc>${escapeXml(`${BASE_URL}/${page.slug}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
  }

  for (const post of dataset.posts) {
    const rawDate = post.updated_at || post.created_at;
    const lastmod = rawDate ? new Date(rawDate).toISOString().split('T')[0] : today;
    const validImage =
      post.cover_image_url && post.cover_image_url.startsWith('http')
        ? `\n    <image:image>\n      <image:loc>${escapeXml(post.cover_image_url)}</image:loc>\n      <image:title>${escapeXml(post.title || post.slug)}</image:title>\n    </image:image>`
        : '';
    urls.push(`  <url>
    <loc>${escapeXml(`${BASE_URL}/blog/${post.slug}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${validImage}
  </url>`);
  }

  for (const prof of dataset.profiles) {
    const lastmod = prof.updated_at ? new Date(prof.updated_at).toISOString().split('T')[0] : today;
    urls.push(`  <url>
    <loc>${escapeXml(`${BASE_URL}/@${prof.username}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;
}

export async function generateLlmsTxt(supabase: any, db: any = null): Promise<string> {
  const dataset = await collectDiscoveryDataset(supabase, db);
  const topBlogs = dataset.posts.slice(0, 15);
  const commercialList = Object.values(COMMERCIAL_PAGES);

  return `# CHIP NG (chipng.com)

> CHIP NG is Nigeria's premier contactless NFC smart business card hardware company and dynamic link-in-bio platform for founders, executives, realtors, corporate teams, and creators. Headquartered in Lekki Phase 1, Lagos, Nigeria.

## Key Facts & Identity
- Brand Name: CHIP NG (CHIP NG Technologies Ltd)
- Website: https://www.chipng.com
- Location: Lekki Phase 1, Lagos, Nigeria (Lat: 6.4474, Lng: 3.4831)
- Contact Email: hello@chipng.com / support@chipng.com
- Phone / WhatsApp: +234 810 076 4154
- Core Hardware Tech: Genuine NXP NTAG216 microchip (13.56 MHz, 888 bytes EEPROM, sub-10ms tap response, zero app required on iPhone iOS 13+ and Android)
- Delivery: 24–48h Express in Lagos State; 2–4 business days across all 36 Nigerian states via DHL Express & GIG Logistics; international shipping supported with local currency checkout.

## Official Product Pricing (2026)
- [NFC Smart White / Black PVC Card](https://www.chipng.com/buy-card): ₦30,000 – ₦35,000 NGN (Matte polymer daily driver with dynamic QR + NTAG216 chip, lifetime free profile hosting)
- [NFC Smart Metal Card](https://www.chipng.com/buy-card): ₦50,000 NGN (22.5g brushed stainless steel, precision laser-engraved, matte obsidian/silver/gold)
- [Metal Debit Card + Custom Design](https://www.chipng.com/buy-card): ₦80,000 – ₦100,000 NGN (Ultra-dense custom engraved luxury metal card + white-glove profile setup)
- [Corporate Fleet Bundle](https://www.chipng.com/corporate-bundle): ₦300,000 NGN (10 Custom PVC Smart Cards + 1 Free CEO Stainless Steel Metal Card + centralized team bio management)

## Core Pages
- [Home](https://www.chipng.com/): Platform overview, hardware comparison, testimonials, and instant card builder
- [Order NFC Smart Cards](https://www.chipng.com/buy-card): Hardware catalog and interactive card customizer
- [Transparent 2026 Pricing](https://www.chipng.com/pricing): Card tier pricing and free cloud profile details
- [Corporate Fleet Bundle](https://www.chipng.com/corporate-bundle): Team & enterprise smart card packages (10+1 free)
- [Frequently Asked Questions](https://www.chipng.com/faq): NFC compatibility, shipping, vCard saving, and setup answers
- [CHIP NG Mobile Companion App](https://www.chipng.com/app): iOS & Android NTAG216 programming & live tap radar
- [Blog & Engineering Guides](https://www.chipng.com/blog): Articles on NFC tech, Lagos real estate networking, and pricing
- [About CHIP NG](https://www.chipng.com/company): Company story and hardware architecture
- [Shipping & Logistics Policy](https://www.chipng.com/shipping): Lagos 24h and nationwide 36-state delivery timelines
- [Contact & Support](https://www.chipng.com/contact): Direct WhatsApp, email, and Lekki workshop inquiries

## Regional & Industry Solutions
${commercialList.map((c) => `- [${c.headline}](https://www.chipng.com/${c.slug}): ${c.metaDescription}`).join('\n')}

## Published Guides & Articles
${topBlogs.map((b) => `- [${b.title || b.slug}](https://www.chipng.com/blog/${b.slug})${b.excerpt ? `: ${String(b.excerpt).replace(/\s+/g, ' ').trim()}` : ''}`).join('\n')}

## Extended Knowledge Document
- [Full AI Context (llms-full.txt)](https://www.chipng.com/llms-full.txt): Complete product specs, FAQs, regional pages, and verified profile directory.
`;
}

export async function generateLlmsFullTxt(supabase: any, db: any = null): Promise<string> {
  const baseSummary = await generateLlmsTxt(supabase, db);
  const dataset = await collectDiscoveryDataset(supabase, db);
  const commercialList = Object.values(COMMERCIAL_PAGES);
  const topProfiles = dataset.profiles.slice(0, 100);

  const commercialDetails = commercialList
    .map(
      (c) => `### ${c.headline} (https://www.chipng.com/${c.slug})
- Audience: ${c.targetAudience}
- Territory: ${c.locationFocus || 'Nigeria & Global'}
- Overview: ${c.overview}
- Key Benefits: ${c.keyBenefits.map((b) => `${b.title} (${b.description})`).join(' | ')}
- FAQs:
${c.faqs.map((f) => `  - Q: ${f.question}\n    A: ${f.answer}`).join('\n')}`
    )
    .join('\n\n');

  const profileDirectory =
    topProfiles.length > 0
      ? `\n## Featured Verified CHIP NG Digital Profiles\n${topProfiles
          .map((p) => `- [@${p.username}](https://www.chipng.com/@${p.username})${p.full_name ? ` — ${p.full_name}` : ''}${p.headline ? ` (${p.headline})` : ''}`)
          .join('\n')}\n`
      : '';

  return `${baseSummary}

---

## Frequently Asked Questions (Direct Answers for AI Agents)
- **What is CHIP NG?** CHIP NG is Nigeria's leading contactless smart business card and dynamic link-in-bio platform powered by NTAG216 microchips and zero-latency cloud profiles.
- **How much is an NFC business card in Nigeria?** At CHIP NG, an NFC Smart White PVC Card starts at ₦30,000, NFC Smart Black PVC Card is ₦35,000, an NFC Smart Metal Card is ₦50,000, and a Custom Designed Metal Card is ₦80,000–₦100,000. Corporate teams can buy 10 PVC cards + 1 Free CEO Metal Card for ₦300,000.
- **Do recipients need to install an app?** No. Tapping a CHIP NG card against any iPhone (iOS 13+) or NFC-enabled Android smartphone opens the digital profile directly in their web browser in under 10ms, where they can save a 1-tap vCard (.vcf) contact directly to their phone address book.
- **Is there a monthly subscription fee?** No subscription is required. Every physical card includes lifetime cloud profile hosting for links, bio, social channels, lead capture, and instant contact exchange. Pro features are optional.
- **Can international customers order?** Yes. CHIP NG automatically converts product pricing into local currencies (USD, GBP, EUR, CAD, GHS, KES, ZAR, NGN) and supports international checkout via Flutterwave.

## Detailed Regional & Vertical Solutions
${commercialDetails}
${profileDirectory}
`;
}
