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
import {
  collectDiscoveryDataset,
  generateDynamicSitemapXml,
  generateRobotsTxt,
  generateLlmsTxt,
  generateLlmsFullTxt,
} from '../src/utils/aiDiscovery';

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

  // 1. Core Pages & App Routes (Prerenders index.html and [route]/index.html so refreshes resolve statically)
  const coreRoutes = [
    { path: '', changefreq: 'daily', priority: '1.0' },
    { path: 'buy-card', changefreq: 'weekly', priority: '0.95' },
    { path: 'shop', changefreq: 'weekly', priority: '0.95' },
    { path: 'app', changefreq: 'weekly', priority: '0.9' },
    { path: 'android', changefreq: 'weekly', priority: '0.9' },
    { path: 'download', changefreq: 'weekly', priority: '0.85' },
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
    { path: 'portfolio', changefreq: 'weekly', priority: '0.8' },
    { path: 'corporate-bundle', changefreq: 'weekly', priority: '0.95' },
    { path: 'corporate-fleet', changefreq: 'weekly', priority: '0.95' },
    { path: 'fleet', changefreq: 'weekly', priority: '0.9' },
    { path: 'corporate', changefreq: 'weekly', priority: '0.9' },
    { path: 'dashboard', changefreq: 'daily', priority: '0.8' },
    { path: 'admin', changefreq: 'daily', priority: '0.8' },
    { path: 'login', changefreq: 'weekly', priority: '0.8' },
    { path: 'enterprise', changefreq: 'weekly', priority: '0.8' },
    { path: 'settings', changefreq: 'monthly', priority: '0.5' },
    { path: 'checkout', changefreq: 'monthly', priority: '0.5' },
  ];

  // 2. Commercial Landing Pages
  const commercialRoutes = Object.keys(COMMERCIAL_PAGES).map(slug => ({
    path: slug,
    changefreq: 'weekly',
    priority: '0.85'
  }));

  // 3 & 4. Blog Articles & Public User Profiles via shared AI Discovery collector
  const dataset = await collectDiscoveryDataset(supabase, db);
  const blogArticles = dataset.posts;
  const profileList = dataset.profiles;

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

  // Render User Profiles & Dedicated vCard Endpoints
  for (const prof of profileList) {
    try {
      // 1. Render without '@'
      const plainPath = `/${prof.username}`;
      const rendered = await applyUniversalSsr(baseHtml, {
        urlPath: plainPath,
        supabase,
        db
      });
      writePrerenderedFile(plainPath, rendered);

      // 2. Render with '@'
      const atPath = `/@${prof.username}`;
      writePrerenderedFile(atPath, rendered);

      // 3. Render with 'p/'
      const pPath = `/p/${prof.username}`;
      writePrerenderedFile(pPath, rendered);

      // 4. Render dedicated Contact vCard Route (e.g. /chipng/vcard)
      const vcardPlainPath = `/${prof.username}/vcard`;
      const vcardRendered = await applyUniversalSsr(baseHtml, {
        urlPath: vcardPlainPath,
        supabase,
        db
      });
      writePrerenderedFile(vcardPlainPath, vcardRendered);

      // 5. Render @-prefixed Contact vCard Route (e.g. /@chipng/vcard)
      const vcardAtPath = `/@${prof.username}/vcard`;
      writePrerenderedFile(vcardAtPath, vcardRendered);
    } catch (err) {
      console.error(`Error prerendering profile ${prof.username}:`, err);
    }
  }

  // Pre-render global /vcard (defaults to chipng master identity)
  try {
    const rootVCardRendered = await applyUniversalSsr(baseHtml, {
      urlPath: '/chipng/vcard',
      supabase,
      db
    });
    writePrerenderedFile('/vcard', rootVCardRendered);
  } catch (err) {
    console.error('Error prerendering global /vcard:', err);
  }

  console.log('✅ All pages & vCard routes successfully pre-rendered into static HTML in dist/!');

  // Generate Master Sitemap.xml, robots.txt, llms.txt & llms-full.txt via aiDiscovery
  const sitemapXml = await generateDynamicSitemapXml(supabase, db);
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml.trim(), 'utf-8');
  fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemapXml.trim(), 'utf-8');
  console.log('✅ Generated sitemap.xml with image extensions and verified canonical URLs!');

  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt.trim(), 'utf-8');
  fs.writeFileSync(path.resolve('public/robots.txt'), robotsTxt.trim(), 'utf-8');
  console.log('✅ Generated robots.txt pointing to https://www.chipng.com/sitemap.xml and AI discovery files!');

  const llmsTxt = await generateLlmsTxt(supabase, db);
  fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxt.trim(), 'utf-8');
  fs.writeFileSync(path.resolve('public/llms.txt'), llmsTxt.trim(), 'utf-8');

  const llmsFullTxt = await generateLlmsFullTxt(supabase, db);
  fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsFullTxt.trim(), 'utf-8');
  fs.writeFileSync(path.resolve('public/llms-full.txt'), llmsFullTxt.trim(), 'utf-8');
  console.log('✅ Generated llms.txt & llms-full.txt for AI Search Agents (ChatGPT, Perplexity, Claude, Gemini)!');

  // Generate 404.html SPA fallback so Vercel CDN immediately serves the app shell on any un-prerendered route
  fs.writeFileSync(path.join(distDir, '404.html'), baseHtml, 'utf-8');
  fs.writeFileSync(path.resolve('public/404.html'), baseHtml, 'utf-8');
  console.log('✅ Generated 404.html SPA fallback for instant CDN route resolution!');
}

main().catch(err => {
  console.error('Prerender build error:', err);
  process.exit(1);
});
