import fs from 'fs';
import * as cheerio from 'cheerio';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';

// Initialize SQLite database
const db = new Database('leads.sqlite', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Create leads table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    city TEXT,
    post_slug TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec("ALTER TABLE leads ADD COLUMN clicked_variant TEXT");
} catch(e) {} // Ignore if already exists

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_ngn TEXT NOT NULL,
    image_url TEXT,
    benefits_json TEXT,
    rating REAL,
    review_count INTEGER,
    badge_text TEXT,
    whatsapp_link TEXT,
    button_variant_a TEXT,
    button_variant_b TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_buybox_mapping (
    post_slug TEXT PRIMARY KEY,
    product_id INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS seo_keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword_phrase TEXT NOT NULL,
    target_url_slug TEXT NOT NULL,
    type TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS post_links_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    linked_url TEXT NOT NULL,
    keyword_used TEXT NOT NULL,
    status TEXT DEFAULT 'ok',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS post_categories (
    post_slug TEXT PRIMARY KEY,
    category TEXT NOT NULL
  );
`);

// Seed keywords if empty
db.exec(`
  
  CREATE TABLE IF NOT EXISTS post_meta (
    post_slug TEXT PRIMARY KEY,
    product_json TEXT,
    faq_json TEXT,
    views INTEGER DEFAULT 0,
    focus_keyword TEXT
  );

  CREATE TABLE IF NOT EXISTS broadcast_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_template TEXT NOT NULL,
    audience_count INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS nfc_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    card_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_reference TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS app_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);


try { db.exec("ALTER TABLE leads ADD COLUMN last_broadcast_at DATETIME"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN broadcast_count INTEGER DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN opt_out INTEGER DEFAULT 0"); } catch(e) {}

db.exec(`
  CREATE TABLE IF NOT EXISTS broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT,
    message TEXT,
    sent_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);


const kwCount = db.prepare('SELECT COUNT(*) as c FROM seo_keywords').get().c;
if (kwCount === 0) {
  const insertKw = db.prepare('INSERT INTO seo_keywords (keyword_phrase, target_url_slug, type) VALUES (?, ?, ?)');
  insertKw.run('nfc card lagos', '/nfc-card-price-lagos-realtors', 'product');
  insertKw.run('digital business card nigeria', '/blog/digital-business-card-nigeria', 'post');
  insertKw.run('whatsapp business card', '/blog/whatsapp-nfc-card', 'post');
}


const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (productCount.c === 0) {
  db.prepare(`
    INSERT INTO products (name, price_ngn, image_url, benefits_json, rating, review_count, badge_text, whatsapp_link, button_variant_a, button_variant_b)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Chipng NFC Business Card',
    '20000',
    'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=800&auto=format&fit=crop',
    JSON.stringify(["1 Tap shares WhatsApp + Catalog", "Works on iPhone & Android. No app.", "Free updates for life"]),
    4.9,
    27,
    'Launch Price - First 30 Orders Only',
    'https://wa.me/2348100764154?text=Hi%20Chipng%2C%20I%20want%20to%20order%20the%20NFC%20card%20for%20%E2%82%A612%2C500.%20My%20name%20is%3A',
    'Order on WhatsApp Now',
    'Get Yours for ₦20,000'
  );
}


dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // SQLite Leads API
  app.post('/api/lead', (req, res) => {
    try {
      const { name, whatsapp, city, post_slug, source, clicked_variant } = req.body;
      const stmt = db.prepare('INSERT INTO leads (name, whatsapp, city, post_slug, source, clicked_variant) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, whatsapp, city, post_slug, source, clicked_variant || null);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      console.error('Insert error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/products', (req, res) => {
    try {
      const products = db.prepare('SELECT * FROM products').all();
      res.json(products);
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/products', (req, res) => {
    try {
      const { id, name, price_ngn, image_url, benefits_json, rating, review_count, badge_text, whatsapp_link, button_variant_a, button_variant_b } = req.body;
      if (id) {
         const stmt = db.prepare('UPDATE products SET name=?, price_ngn=?, image_url=?, benefits_json=?, rating=?, review_count=?, badge_text=?, whatsapp_link=?, button_variant_a=?, button_variant_b=? WHERE id=?');
         stmt.run(name, price_ngn, image_url, benefits_json, rating, review_count, badge_text, whatsapp_link, button_variant_a, button_variant_b, id);
         res.json({ success: true, id });
      } else {
         const stmt = db.prepare('INSERT INTO products (name, price_ngn, image_url, benefits_json, rating, review_count, badge_text, whatsapp_link, button_variant_a, button_variant_b) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
         const info = stmt.run(name, price_ngn, image_url, benefits_json, rating, review_count, badge_text, whatsapp_link, button_variant_a, button_variant_b);
         res.json({ success: true, id: info.lastInsertRowid });
      }
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.get('/api/post-product/:slug', (req, res) => {
    try {
      const mapping = db.prepare('SELECT product_id FROM post_buybox_mapping WHERE post_slug=?').get(req.params.slug);
      res.json({ product_id: mapping ? mapping.product_id : null });
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  
  app.get('/api/post-meta', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM post_meta').all();
      res.json(rows);
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.get('/api/post-meta/:slug', (req, res) => {
    try {
      const mapping = db.prepare('SELECT * FROM post_meta WHERE post_slug=?').get(req.params.slug);
      res.json(mapping || {});
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/post-meta', (req, res) => {
    try {
      const { post_slug, product_json, faq_json, focus_keyword } = req.body;
      db.prepare('INSERT INTO post_meta (post_slug, product_json, faq_json, focus_keyword) VALUES (?, ?, ?, ?) ON CONFLICT(post_slug) DO UPDATE SET product_json=excluded.product_json, faq_json=excluded.faq_json, focus_keyword=excluded.focus_keyword').run(post_slug, product_json, faq_json, focus_keyword);
      res.json({ success: true });
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/post-view/:slug', (req, res) => {
    try {
      db.prepare('INSERT INTO post_meta (post_slug, views) VALUES (?, 1) ON CONFLICT(post_slug) DO UPDATE SET views=post_meta.views + 1').run(req.params.slug);
      res.json({ success: true });
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/post-product', (req, res) => {
    try {
      const { post_slug, product_id } = req.body;
      db.prepare('INSERT OR REPLACE INTO post_buybox_mapping (post_slug, product_id) VALUES (?, ?)').run(post_slug, product_id);
      res.json({ success: true });
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.get('/api/leads', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
      const leads = stmt.all();
      res.json(leads);
    } catch (error: any) {
      console.error('Select error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // SEO Automation Routes
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const { data: posts, error } = await getSupabase()
        .from("posts")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (error) throw error;

      const baseUrl = "https://chipng.com";
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${posts.map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
</urlset>`;

      res.header("Content-Type", "application/xml");
      res.send(sitemap.trim());
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const robots = `User-agent: *
Allow: /blog/

Sitemap: https://chipng.com/sitemap.xml`;
    res.header("Content-Type", "text/plain");
    res.send(robots);
  });

  
  // Broadcast API
  app.post('/api/broadcast', (req, res) => {
    try {
      const { leads, messageTemplate } = req.body;
      if (!leads || !messageTemplate) return res.status(400).json({ error: 'Missing leads or messageTemplate' });
      console.log(`Simulating broadcast to ${leads.length} leads.`);
      db.prepare('INSERT INTO broadcast_logs (message_template, audience_count) VALUES (?, ?)').run(messageTemplate, leads.length);
      res.json({ success: true, count: leads.length });
    } catch (e) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });


  app.get('/api/app-updates', (req, res) => {
    try { const rows = db.prepare(`SELECT * FROM app_notifications ORDER BY created_at DESC LIMIT 10`).all(); res.json({ notifications: rows }); } catch(err: any) { res.status(500).json({ error: err.message }); }
  });


  // NFC Sales Endpoints
  app.post('/api/sales', express.json(), async (req, res) => {
    try {
      const { name, email, phone, card_type, amount, payment_reference } = req.body;
      const stmt = db.prepare('INSERT INTO nfc_sales (name, email, phone, card_type, amount, payment_reference) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, email, phone, card_type, amount, payment_reference);
      
      // Try to send email
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        // Only send if configured
        if (process.env.SMTP_USER) {
          await transporter.sendMail({
            from: `"CHIP NG Sales" <${process.env.SMTP_USER}>`,
            to: 'vickthor.dennis@gmail.com',
            subject: `New NFC Card Sale! (${card_type})`,
            text: `A new sale has been made!

Name: ${name}
Email: ${email}
Phone: ${phone}
Card: ${card_type}
Amount: ₦${amount/100}
Ref: ${payment_reference}`,
          });
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Continue even if email fails
      }

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sales', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM nfc_sales ORDER BY created_at DESC').all();
      res.json({ sales: rows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/app-updates', express.json(), (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    try { const info = db.prepare(`INSERT INTO app_notifications (title, message) VALUES (?, ?)`).run(title, message); res.json({ success: true, id: info.lastInsertRowid }); } catch(err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/broadcast/stats', (req, res) => {

    try {
      const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
      const sent7Days = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-7 days')").get().c;
      const sent1Hour = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-1 hour')").get().c;
      res.json({ totalLeads, sent7Days, sent1Hour, remainingHour: Math.max(0, 50 - sent1Hour) });
    } catch (e) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/mark-sent', (req, res) => {
    try {
      const { lead_id } = req.body;
      db.prepare("UPDATE leads SET last_broadcast_at = datetime('now'), broadcast_count = IFNULL(broadcast_count, 0) + 1 WHERE id = ?").run(lead_id);
      res.json({ success: true });
    } catch (e) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/toggle-optout', (req, res) => {
    try {
      const { lead_id, opt_out } = req.body;
      db.prepare("UPDATE leads SET opt_out = ? WHERE id = ?").run(opt_out ? 1 : 0, lead_id);
      res.json({ success: true });
    } catch (e) { console.error("products error", e); res.status(500).json({error: e.message}); }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    
  app.get('/api/seo/keywords', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM seo_keywords ORDER BY id DESC').all();
      res.json(rows);
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/keywords', (req, res) => {
    try {
      const { keyword_phrase, target_url_slug, type } = req.body;
      db.prepare('INSERT INTO seo_keywords (keyword_phrase, target_url_slug, type) VALUES (?, ?, ?)').run(keyword_phrase, target_url_slug, type);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.delete('/api/seo/keywords/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM seo_keywords WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.get('/api/seo/links-report', (req, res) => {
    try {
      const logs = db.prepare('SELECT * FROM post_links_log ORDER BY created_at DESC LIMIT 50').all();
      res.json({ total: logs.length, broken: 0, logs });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/check-links', (req, res) => {
    // Dummy manual check
    res.json({ success: true });
  });

  app.post('/api/seo/auto-meta', (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({error: 'No content'});
      // Dummy auto generation logic since this would need an AI API to truly work
      const meta_title = "Auto Generated Title";
      const meta_description = content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";
      const focus_keyword = "auto keyword";
      res.json({ meta_title, meta_description, focus_keyword });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/auto-link', (req, res) => {
    try {
      const { content, post_slug } = req.body;
      const keywords = db.prepare('SELECT * FROM seo_keywords').all();
      let newContent = content;
      let linked = 0;
      
      for (const kw of (keywords as any[])) {
        const regex = new RegExp(`(?<!<[^>]*>)\\b(${kw.keyword_phrase})\\b`, 'gi');
        if (regex.test(newContent)) {
          newContent = newContent.replace(regex, `<a href="${kw.target_url_slug}">$1</a>`);
          db.prepare('INSERT INTO post_links_log (post_slug, linked_url, keyword_used, status) VALUES (?, ?, ?, ?)').run(post_slug, kw.target_url_slug, kw.keyword_phrase, 'OK');
          linked++;
        }
      }
      res.json({ success: true, linked_count: linked, modified_content: newContent });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/post-categories', (req, res) => {
    try {
      const { post_slug, category } = req.body;
      db.prepare('INSERT INTO post_categories (post_slug, category) VALUES (?, ?) ON CONFLICT(post_slug) DO UPDATE SET category=excluded.category').run(post_slug, category);
      res.json({ success: true });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        try {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
          const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
          const supabase = createClient(supabaseUrl, supabaseKey);

          const urlPath = req.path;
          if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
            const slug = urlPath.slice(6);
            const { data: post } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url').eq('slug', slug).single();
            if (post) {
              const title = post.meta_title || post.title;
              const desc = post.meta_description || '';
              template = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
              if (post.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
              }
            }
          } else if (!urlPath.startsWith('/admin') && !urlPath.startsWith('/enterprise') && !urlPath.startsWith('/login') && !urlPath.startsWith('/dashboard') && !urlPath.startsWith('/api') && urlPath !== '/' && urlPath !== '/blog') {
            let username = urlPath.slice(1);
            if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
            const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').eq('username', username).single();
            if (profile) {
              const title = `${profile.full_name} | CHIP NG`;
              const desc = profile.headline || profile.bio || "View my digital profile on CHIP NG.";
              template = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
              if (profile.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${profile.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${profile.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${profile.cover_image_url}" />`);
              }
            }
          }
        } catch (e) {
          console.error("SEO Injection error", e);
        }

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
      
      try {
        const urlPath = req.path;
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
          const slug = urlPath.slice(6);
          const { data: post } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url').eq('slug', slug).single();
          if (post) {
            const title = post.meta_title || post.title;
            const desc = post.meta_description || '';
            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
            if (post.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
            }
          }
        } else if (!urlPath.startsWith('/admin') && !urlPath.startsWith('/enterprise') && !urlPath.startsWith('/login') && !urlPath.startsWith('/dashboard') && !urlPath.startsWith('/api') && urlPath !== '/' && urlPath !== '/blog') {
          let username = urlPath.slice(1);
          if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
          const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').eq('username', username).single();
          if (profile) {
            const title = `${profile.full_name} | CHIP NG`;
            const desc = profile.headline || profile.bio || "View my digital profile on CHIP NG.";
            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${desc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
            if (profile.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${profile.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${profile.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${profile.cover_image_url}" />`);
            }
          }
        }
      } catch (e) {
        console.error("SEO Injection error", e);
      }
      res.send(html);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
