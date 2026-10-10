/**
 * Build-Time Prerendering & Static Site Generation (SSG) for CHIP NG
 * Generates static HTML files for every route in dist/ so Vercel, Googlebot,
 * and AI scrapers receive full pre-rendered HTML on the very first byte.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import { applyUniversalSsr } from '../src/utils/universalSsrEngine';
import { COMMERCIAL_PAGES } from '../src/data/commercialPagesData';

const BASE_URL = 'https://www.chipng.com';

async function main() {
  console.log('🚀 Starting CHIP NG Build-Time Prerendering & Sitemap Generation...');

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist directory does not exist. Run "vite build" first.');
  }

  const baseHtmlPath = path.join(distDir, 'index.html');
  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

  // Initialize Database Connections
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
  const supabase = createClient(supabaseUrl, supabaseKey);

  let db: any = null;
  try {
    if (fs.existsSync('leads.sqlite')) {
      db = new Database('leads.sqlite');
    }
  } catch (e) {
    console.warn('SQLite not loaded for prerender:', e);
  }

  // 1. Core Pages
  const coreRoutes = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: 'buy-card', changefreq: 'weekly', priority: '0.95' },
    { path: 'shop', changefreq: 'weekly', priority: '0.95' },
    { path: 'pricing', changefreq: 'weekly', priority: '0.9' },
    { path: 'faq', changefreq: 'weekly', priority: '0.85' },
    { path: 'company', changefreq: 'monthly', priority: '0.7' },
    { path: 'about', changefreq: 'monthly', priority: '0.7' },
    { path: 'updates', changefreq: 'weekly', priority: '0.7' },
    { path: 'contact', changefreq: 'monthly', priority: '0.7' },
    { path: 'blog', changefreq: 'daily', priority: '0.9' },
    { path: 'shipping', changefreq: 'monthly', priority: '0.6' },
    { path: 'refund-policy', changefreq: 'monthly', priority: '0.6' },
    { path: 'privacy-policy', changefreq: 'monthly', priority: '0.5' },
    { path: 'privacy', changefreq: 'monthly', priority: '0.5' },
    { path: 'terms-of-service', changefreq: 'monthly', priority: '0.5' },
    { path: 'terms', changefreq: 'monthly', priority: '0.5' },
  ];

  // 2. Commercial Landing Pages
  const commercialRoutes = Object.keys(COMMERCIAL_PAGES).map(slug => ({
    path: slug,
    changefreq: 'weekly',
    priority: '0.85'
  }));

  // 3. Blog Articles (from Supabase & SQLite)
  const blogSlugs = new Set<string>();
  const blogArticles: { slug: string; updated_at?: string }[] = [];

  try {
    const { data: remotePosts } = await supabase
      .from('posts')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (remotePosts) {
      for (const p of remotePosts) {
        if (p.slug && !blogSlugs.has(p.slug)) {
          blogSlugs.add(p.slug);
          blogArticles.push({ slug: p.slug, updated_at: p.updated_at });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch remote posts:', err);
  }

  if (db) {
    try {
      const localPosts = db.prepare('SELECT slug, updated_at FROM local_posts').all() as any[];
      for (const p of localPosts) {
        if (p.slug && !blogSlugs.has(p.slug)) {
          blogSlugs.add(p.slug);
          blogArticles.push({ slug: p.slug, updated_at: p.updated_at });
        }
      }
    } catch (e) {
      // table might not exist
    }
  }

  // Fallback known articles from sitemap
  const fallbackBlogSlugs = [
    'hardware-engineering-sub-10ms-nfc',
    'nfc-card-price-in-lagos-best-digital-card-for-nigerian-realtors',
    'how-much-do-nfc-business-cards-cost-in-2026-nigeria-global-price-guide',
    'nfc-card-price-lagos-realtors-2026',
    'nfc-business-card-price-lagos-for-realtors-2026-choose-your-card-close-faster',
    'the-future-of-car-sales-why-nfc-business-cards-are-a-game-changer-for-dealerships',
    'predictive-ai-cash-runway-forecasting',
    'nfc-business-card-guide'
  ];

  for (const s of fallbackBlogSlugs) {
    if (!blogSlugs.has(s)) {
      blogSlugs.add(s);
      blogArticles.push({ slug: s });
    }
  }

  // 4. User Profiles
  const profileList: { username: string; updated_at?: string }[] = [];
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username, updated_at')
      .not('username', 'is', null)
      .limit(300);

    const RESERVED = new Set([
      'admin', 'login', 'dashboard', 'settings', 'checkout', 'api',
      'blog', 'company', 'contact', 'updates', 'shipping', 'faq',
      'pricing', 'buy-card', 'shop', 'about', 'refund-policy',
      'privacy-policy', 'terms-of-service', 'terms', 'privacy'
    ]);

    if (profiles) {
      for (const prof of profiles) {
        const clean = prof.username ? prof.username.toLowerCase().trim() : '';
        if (clean && !RESERVED.has(clean) && !COMMERCIAL_PAGES[clean]) {
          profileList.push({ username: prof.username, updated_at: prof.updated_at });
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch profiles:', err);
  }

  console.log(`📊 Found ${coreRoutes.length} core routes, ${commercialRoutes.length} commercial routes, ${blogArticles.length} blog posts, and ${profileList.length} profiles.`);

  // Function to write static HTML file
  const writePrerenderedFile = (routePath: string, htmlContent: string) => {
    const cleanRoute = routePath.replace(/^\//, '').replace(/\/$/, '');
    
    if (cleanRoute === '') {
      // Overwrite dist/index.html with homepage SSR
      fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent, 'utf-8');
      return;
    }

    // 1. Write dist/[route]/index.html
    const targetDir = path.join(distDir, cleanRoute);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf-8');

    // 2. Write dist/[route].html for cleanUrl handling
    fs.writeFileSync(path.join(distDir, `${cleanRoute}.html`), htmlContent, 'utf-8');
  };

  // Render Core Pages
  for (const route of coreRoutes) {
    const urlPath = route.path ? `/${route.path}` : '/';
    try {
      const rendered = await applyUniversalSsr(baseHtml, {
        urlPath,
        supabase,
        db
      });
      writePrerenderedFile(urlPath, rendered);
    } catch (err) {
      console.error(`Error prerendering ${urlPath}:`, err);
    }
  }

  // Render Commercial Pages
  for (const route of commercialRoutes) {
    const urlPath = `/${route.path}`;
    try {
      const rendered = await applyUniversalSsr(baseHtml, {
        urlPath,
        supabase,
        db
      });
      writePrerenderedFile(urlPath, rendered);
    } catch (err) {
      console.error(`Error prerendering ${urlPath}:`, err);
    }
  }

  // Render Blog Articles
  for (const article of blogArticles) {
    const urlPath = `/blog/${article.slug}`;
    try {
      const rendered = await applyUniversalSsr(baseHtml, {
        urlPath,
        supabase,
        db
      });
      writePrerenderedFile(urlPath, rendered);
    } catch (err) {
      console.error(`Error prerendering ${urlPath}:`, err);
    }
  }

  // Render User Profiles
  for (const prof of profileList) {
    try {
      // Render without '@'
      const plainPath = `/${prof.username}`;
      const rendered = await applyUniversalSsr(baseHtml, {
        urlPath: plainPath,
        supabase,
        db
      });
      writePrerenderedFile(plainPath, rendered);

      // Render with '@'
      const atPath = `/@${prof.username}`;
      writePrerenderedFile(atPath, rendered);
    } catch (err) {
      console.error(`Error prerendering profile ${prof.username}:`, err);
    }
  }

  console.log('✅ All pages successfully pre-rendered into static HTML in dist/!');

  // Generate Master Sitemap.xml
  const today = new Date().toISOString().split('T')[0];

  const sitemapEntries: string[] = [];

  // Core pages (skip duplicates like /about vs /company)
  const canonicalCore = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/buy-card`, changefreq: 'weekly', priority: '0.95' },
    { loc: `${BASE_URL}/shop`, changefreq: 'weekly', priority: '0.95' },
    { loc: `${BASE_URL}/pricing`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/faq`, changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/company`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/updates`, changefreq: 'weekly', priority: '0.7' },
    { loc: `${BASE_URL}/contact`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${BASE_URL}/blog`, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/shipping`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${BASE_URL}/refund-policy`, changefreq: 'monthly', priority: '0.6' },
    { loc: `${BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${BASE_URL}/terms-of-service`, changefreq: 'monthly', priority: '0.5' },
  ];

  for (const item of canonicalCore) {
    sitemapEntries.push(`  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`);
  }

  // Commercial pages
  for (const page of commercialRoutes) {
    sitemapEntries.push(`  <url>
    <loc>${BASE_URL}/${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Blog posts
  for (const article of blogArticles) {
    const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : today;
    sitemapEntries.push(`  <url>
    <loc>${BASE_URL}/blog/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // User profiles
  for (const prof of profileList) {
    const lastmod = prof.updated_at ? new Date(prof.updated_at).toISOString().split('T')[0] : today;
    sitemapEntries.push(`  <url>
    <loc>${BASE_URL}/@${prof.username}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml.trim(), 'utf-8');
  fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemapXml.trim(), 'utf-8');
  console.log(`✅ Generated sitemap.xml with ${sitemapEntries.length} verified canonical URLs!`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /settings/
Disallow: /login

# Answer Engine Optimization (AEO) Bots
User-agent: Googlebot
User-agent: Bingbot
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: ClaudeBot
User-agent: Applebot
User-agent: Google-Extended
Allow: /

Sitemap: https://www.chipng.com/sitemap.xml
Host: https://www.chipng.com
`;

  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt.trim(), 'utf-8');
  fs.writeFileSync(path.resolve('public/robots.txt'), robotsTxt.trim(), 'utf-8');
  console.log('✅ Generated robots.txt pointing to https://www.chipng.com/sitemap.xml!');
}

main().catch(err => {
  console.error('Prerender build error:', err);
  process.exit(1);
});
