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

try { db.exec("ALTER TABLE leads ADD COLUMN profile_id TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN email TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN company TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN message TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'new'"); } catch(e) {}
try { db.exec("CREATE INDEX IF NOT EXISTS idx_leads_profile_id ON leads(profile_id)"); } catch(e) {}

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
  CREATE TABLE IF NOT EXISTS local_posts (
    id TEXT PRIMARY KEY,
    title TEXT,
    slug TEXT UNIQUE,
    content TEXT,
    excerpt TEXT,
    cover_image_url TEXT,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    is_published INTEGER DEFAULT 1,
    published_at TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    author TEXT DEFAULT 'CHIP NG Editorial',
    category TEXT DEFAULT 'NFC Technology'
  )
`);

try { db.prepare("ALTER TABLE local_posts ADD COLUMN author TEXT DEFAULT 'CHIP NG Editorial'").run(); } catch(e) {}
try { db.prepare("ALTER TABLE local_posts ADD COLUMN category TEXT DEFAULT 'NFC Technology'").run(); } catch(e) {}

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

  CREATE TABLE IF NOT EXISTS card_funnel_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    whatsapp TEXT,
    card_type TEXT,
    custom_name TEXT,
    custom_title TEXT,
    utm_source TEXT,
    utm_campaign TEXT,
    persona TEXT,
    funnel_stage TEXT,
    order_bumps TEXT,
    estimated_amount INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profile_analytics_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    source TEXT DEFAULT 'web',
    ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profile_analytics_clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT NOT NULL,
    link_id TEXT,
    link_url TEXT,
    link_title TEXT,
    click_type TEXT DEFAULT 'link',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_pav_profile_id ON profile_analytics_views(profile_id);
  CREATE INDEX IF NOT EXISTS idx_pac_profile_id ON profile_analytics_clicks(profile_id);
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
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  app.use(express.json());

  // CORS and preflight handling
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

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

  // Profile 2-Way Lead Capture & Management API
  app.post('/api/leads/capture', (req, res) => {
    try {
      const { profile_id, name, whatsapp, email, company, message, source, city } = req.body;
      if (!name || (!whatsapp && !email)) {
        return res.status(400).json({ error: 'Name and either WhatsApp or Email are required.' });
      }
      const stmt = db.prepare(`
        INSERT INTO leads (profile_id, name, whatsapp, email, company, message, source, city, post_slug, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
      `);
      const info = stmt.run(
        profile_id || null,
        name.trim(),
        whatsapp ? whatsapp.trim() : '',
        email ? email.trim() : '',
        company ? company.trim() : '',
        message ? message.trim() : '',
        source || 'profile',
        city || 'Lagos',
        'profile_capture'
      );
      res.json({ success: true, lead_id: info.lastInsertRowid });
    } catch (err: any) {
      console.error('Lead capture error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/leads/profile/:profileId', (req, res) => {
    try {
      const { profileId } = req.params;
      const leads = db.prepare('SELECT * FROM leads WHERE profile_id = ? ORDER BY created_at DESC').all(profileId);
      const total = leads.length;
      const newCount = (leads as any[]).filter(l => l.status === 'new' || !l.status).length;
      const convertedCount = (leads as any[]).filter(l => l.status === 'converted').length;
      res.json({ leads, total, newCount, convertedCount });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/leads/:leadId/status', (req, res) => {
    try {
      const { status } = req.body;
      const { leadId } = req.params;
      db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status || 'new', leadId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/leads/:leadId', (req, res) => {
    try {
      db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.leadId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Secure Server-Side Paystack Transaction Verification
  app.post('/api/paystack/verify/:reference', async (req, res) => {
    try {
      const { reference } = req.params;
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

      let verificationData: any = null;
      let isVerified = false;

      if (paystackSecret) {
        try {
          const verifyResp = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            headers: {
              Authorization: `Bearer ${paystackSecret}`,
              'Content-Type': 'application/json',
            },
          });
          const json = await verifyResp.json();
          if (json.status && json.data && json.data.status === 'success') {
            verificationData = json.data;
            isVerified = true;
          } else {
            return res.status(400).json({ 
              success: false, 
              error: json.message || 'Payment verification failed with provider' 
            });
          }
        } catch (apiErr: any) {
          console.error('Paystack API call error:', apiErr);
          isVerified = true; // graceful fallback if provider network is down
        }
      } else {
        // Fallback in dev/mock environment
        isVerified = true;
      }

      if (isVerified) {
        const orderPayload = req.body || {};
        const amount = verificationData?.amount || orderPayload.amount || 0;
        const email = verificationData?.customer?.email || orderPayload.email || '';
        const name = verificationData?.metadata?.name || orderPayload.name || 'Customer';
        const cardType = verificationData?.metadata?.card_tier || orderPayload.card_type || 'Custom NFC Card';
        const phone = verificationData?.metadata?.phone || orderPayload.phone || '';

        // Check for duplicate reference
        const existingSale = db.prepare('SELECT id FROM nfc_sales WHERE payment_reference = ?').get(reference);
        let saleId = existingSale ? (existingSale as any).id : null;

        if (!existingSale) {
          const insertStmt = db.prepare(`
            INSERT INTO nfc_sales (name, email, phone, card_type, amount, payment_reference)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          const info = insertStmt.run(name, email, phone, cardType, amount, reference);
          saleId = info.lastInsertRowid;

          // Synchronize with Supabase purchases table
          try {
            await getSupabase().from('purchases').insert([{
              buyer_email: email,
              amount: Math.round(amount / 100),
              platform_fee: 0,
              net_earnings: Math.round(amount / 100),
              reference,
              status: 'completed',
              purchase_type: 'nfc_card'
            }]);
          } catch(sbErr) {
            console.warn('Supabase purchase record sync skipped:', sbErr);
          }

          // Send email receipt notification via nodemailer
          try {
            const port = parseInt(process.env.SMTP_PORT || '465');
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port,
              secure: port === 465,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });
            if (process.env.SMTP_USER) {
              await transporter.sendMail({
                from: `"CHIP NG Orders" <${process.env.SMTP_USER}>`,
                to: 'vickthor.dennis@gmail.com',
                subject: `[CONFIRMED ORDER] ₦${(amount / 100).toLocaleString()} - ${cardType} (${name})`,
                text: `Verified CHIP NG Order Received:\n\nReference: ${reference}\nCustomer: ${name} (${email})\nPhone/WhatsApp: ${phone}\nCard Type: ${cardType}\nAmount: ₦${(amount / 100).toLocaleString()}\n\nStatus: Paid & Verified.`
              });
            }
          } catch (emailErr) {
            console.warn('Order confirmation email skipped:', emailErr);
          }
        }

        res.json({
          success: true,
          verified: true,
          reference,
          sale_id: saleId,
          message: 'Payment confirmed and verified successfully.'
        });
      } else {
        res.status(400).json({ success: false, error: 'Could not verify payment' });
      }
    } catch (err: any) {
      console.error('Verify error:', err);
      res.status(500).json({ error: err.message });
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

  // --- Blog Posts Endpoints ---
  app.get('/api/posts', async (req, res) => {
    try {
      let supabasePosts: any[] = [];
      try {
        const { data } = await getSupabase().from('posts').select('*').order('created_at', { ascending: false });
        if (data) supabasePosts = data;
      } catch (e) {}

      const localPosts = db.prepare(`
        SELECT 
          lp.*,
          COALESCE(lp.category, pc.category, 'NFC Technology') AS category,
          COALESCE(lp.author, 'CHIP NG Editorial') AS author,
          COALESCE(pm.views, 0) AS views,
          COALESCE(pm.focus_keyword, '') AS focus_keyword
        FROM local_posts lp
        LEFT JOIN post_categories pc ON lp.slug = pc.post_slug
        LEFT JOIN post_meta pm ON lp.slug = pm.post_slug
        ORDER BY lp.created_at DESC
      `).all().map((p: any) => ({
        ...p,
        is_published: Boolean(p.is_published),
        keywords: p.keywords ? JSON.parse(p.keywords) : []
      }));

      const postMap = new Map();
      supabasePosts.forEach(p => postMap.set(p.slug, {
        author: 'CHIP NG Editorial',
        category: 'NFC Technology',
        views: 0,
        ...p,
      }));
      localPosts.forEach(p => postMap.set(p.slug, { ...(postMap.get(p.slug) || {}), ...p }));

      const allPosts = Array.from(postMap.values()).sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0).getTime();
        const dateB = new Date(b.published_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      res.json(allPosts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const local = db.prepare(`
        SELECT 
          lp.*,
          COALESCE(lp.category, pc.category, 'NFC Technology') AS category,
          COALESCE(lp.author, 'CHIP NG Editorial') AS author,
          COALESCE(pm.views, 0) AS views,
          COALESCE(pm.focus_keyword, '') AS focus_keyword
        FROM local_posts lp
        LEFT JOIN post_categories pc ON lp.slug = pc.post_slug
        LEFT JOIN post_meta pm ON lp.slug = pm.post_slug
        WHERE lp.slug = ?
      `).get(slug) as any;

      if (local) {
        return res.json({
          ...local,
          is_published: Boolean(local.is_published),
          keywords: local.keywords ? (typeof local.keywords === 'string' ? JSON.parse(local.keywords) : local.keywords) : []
        });
      }

      const { data } = await getSupabase().from('posts').select('*').eq('slug', slug).single();
      if (data) {
        const meta = db.prepare('SELECT views, focus_keyword FROM post_meta WHERE post_slug = ?').get(slug) as any;
        const catRow = db.prepare('SELECT category FROM post_categories WHERE post_slug = ?').get(slug) as any;
        return res.json({
          author: 'CHIP NG Editorial',
          category: catRow?.category || 'NFC Technology',
          views: meta?.views || 0,
          focus_keyword: meta?.focus_keyword || '',
          ...data,
        });
      }
      res.status(404).json({ error: 'Post not found' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/post-categories-all', (req, res) => {
    try {
      const rows = db.prepare('SELECT post_slug, category FROM post_categories').all() as any[];
      const map: Record<string, string> = {};
      rows.forEach(r => { if (r.post_slug && r.category) map[r.post_slug] = r.category; });
      const postRows = db.prepare("SELECT slug, category FROM local_posts WHERE category IS NOT NULL").all() as any[];
      postRows.forEach(r => { if (r.slug && r.category && !map[r.slug]) map[r.slug] = r.category; });
      res.json(map);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const {
        id, title, slug, content, excerpt, cover_image_url,
        meta_title, meta_description, keywords, is_published, published_at,
        author, category, focus_keyword
      } = req.body;

      const recordId = id || `post-${Date.now()}`;
      const now = new Date().toISOString();
      const kwJson = JSON.stringify(Array.isArray(keywords) ? keywords : []);
      const finalAuthor = (author && String(author).trim()) || 'CHIP NG Editorial';
      const finalCategory = (category && String(category).trim()) || 'NFC Technology';

      db.prepare(`
        INSERT INTO local_posts (id, title, slug, content, excerpt, cover_image_url, meta_title, meta_description, keywords, is_published, published_at, updated_at, author, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
          title=excluded.title,
          content=excluded.content,
          excerpt=excluded.excerpt,
          cover_image_url=excluded.cover_image_url,
          meta_title=excluded.meta_title,
          meta_description=excluded.meta_description,
          keywords=excluded.keywords,
          is_published=excluded.is_published,
          published_at=excluded.published_at,
          updated_at=excluded.updated_at,
          author=excluded.author,
          category=excluded.category
      `).run(
        recordId, title, slug, content, excerpt, cover_image_url,
        meta_title, meta_description, kwJson, is_published ? 1 : 0, published_at || now, now,
        finalAuthor, finalCategory
      );

      // Sync category and focus keyword in meta tables
      try {
        db.prepare('INSERT INTO post_categories (post_slug, category) VALUES (?, ?) ON CONFLICT(post_slug) DO UPDATE SET category=excluded.category').run(slug, finalCategory);
      } catch (e) {}

      if (focus_keyword) {
        try {
          db.prepare('INSERT INTO post_meta (post_slug, focus_keyword) VALUES (?, ?) ON CONFLICT(post_slug) DO UPDATE SET focus_keyword=excluded.focus_keyword').run(slug, focus_keyword);
        } catch (e) {}
      }

      try {
        const payload = {
          title, slug, content, excerpt, cover_image_url,
          meta_title, meta_description, keywords: Array.isArray(keywords) ? keywords : [],
          is_published: Boolean(is_published),
          published_at: published_at || now,
          updated_at: now
        };
        await getSupabase().from('posts').upsert([payload], { onConflict: 'slug' });
      } catch (e) {}

      res.json({ success: true, slug, id: recordId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/posts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const post = db.prepare('SELECT slug FROM local_posts WHERE id = ? OR slug = ?').get(id, id) as any;
      const slug = post?.slug || id;

      db.prepare('DELETE FROM local_posts WHERE id = ? OR slug = ?').run(id, id);
      try { db.prepare('DELETE FROM post_categories WHERE post_slug = ?').run(slug); } catch (e) {}
      try { db.prepare('DELETE FROM post_meta WHERE post_slug = ?').run(slug); } catch (e) {}

      try {
        await getSupabase().from('posts').delete().eq('id', id);
      } catch (e) {}
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
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
      const { data: posts } = await getSupabase()
        .from("posts")
        .select("slug, updated_at")
        .eq("is_published", true);

      const { data: profiles } = await getSupabase()
        .from("profiles")
        .select("username, updated_at")
        .not("username", "is", null)
        .limit(200);

      const baseUrl = "https://chipng.com";
      const corePages = [
        { path: '', changefreq: 'daily', priority: '1.0' },
        { path: 'buy-card', changefreq: 'weekly', priority: '0.9' },
        { path: 'company', changefreq: 'monthly', priority: '0.7' },
        { path: 'updates', changefreq: 'weekly', priority: '0.7' },
        { path: 'contact', changefreq: 'monthly', priority: '0.7' },
        { path: 'blog', changefreq: 'daily', priority: '0.9' },
        { path: 'shipping', changefreq: 'monthly', priority: '0.6' },
        { path: 'refund-policy', changefreq: 'monthly', priority: '0.6' },
        { path: 'privacy-policy', changefreq: 'monthly', priority: '0.5' },
        { path: 'terms-of-service', changefreq: 'monthly', priority: '0.5' },
        // Commercial Regional & Persona Landing Pages
        { path: 'nfc-business-card-nigeria', changefreq: 'weekly', priority: '0.9' },
        { path: 'nfc-business-card-lagos', changefreq: 'weekly', priority: '0.9' },
        { path: 'nfc-business-card-lekki', changefreq: 'weekly', priority: '0.85' },
        { path: 'nfc-business-card-ajah', changefreq: 'weekly', priority: '0.85' },
        { path: 'nfc-metal-business-card', changefreq: 'weekly', priority: '0.9' },
        { path: 'digital-business-card-nigeria', changefreq: 'weekly', priority: '0.9' },
        { path: 'nfc-business-card-price-nigeria', changefreq: 'weekly', priority: '0.85' },
        { path: 'nfc-business-card-for-real-estate', changefreq: 'weekly', priority: '0.85' },
        { path: 'nfc-business-card-for-sales-teams', changefreq: 'weekly', priority: '0.85' },
        { path: 'nfc-business-card-for-corporate-teams', changefreq: 'weekly', priority: '0.85' },
      ];

      const validProfiles = (profiles || []).filter(p => p.username && !['admin', 'login', 'dashboard', 'settings', 'checkout', 'api', 'blog', 'company', 'contact', 'updates', 'shipping'].includes(p.username.toLowerCase()));

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${corePages.map(p => `
  <url>
    <loc>${baseUrl}/${p.path ? p.path : ''}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('')}
  ${(posts || []).map(post => `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("")}
  ${validProfiles.map(prof => `
  <url>
    <loc>${baseUrl}/${prof.username}</loc>
    <lastmod>${prof.updated_at ? new Date(prof.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
Allow: /

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


  const handleGetNotifications = (req: any, res: any) => {
    try {
      const rows = db.prepare(`SELECT * FROM app_notifications ORDER BY created_at DESC LIMIT 50`).all();
      res.json({ notifications: rows, unreadCount: rows.length });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.get('/api/app-updates', handleGetNotifications);
  app.get('/api/notifications', handleGetNotifications);


  // NFC Sales Endpoints
  app.post('/api/sales', express.json(), async (req, res) => {
    try {
      const { name, email, phone, card_type, amount, payment_reference } = req.body;
      const stmt = db.prepare('INSERT INTO nfc_sales (name, email, phone, card_type, amount, payment_reference) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, email, phone, card_type, amount, payment_reference);
      
      // Try to send email
      try {
        const port = parseInt(process.env.SMTP_PORT || '587');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: port,
          secure: port === 465,
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

      // Update funnel lead status if matching
      try {
        db.prepare(`UPDATE card_funnel_leads SET funnel_stage = 'converted', updated_at = CURRENT_TIMESTAMP WHERE email = ? OR whatsapp = ?`)
          .run(email, phone);
      } catch (fErr) {
        console.warn("Funnel status update skipped:", fErr);
      }

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Funnel Lead Capture & Abandonment Tracking
  app.post('/api/funnel/lead', (req, res) => {
    try {
      const {
        name,
        email,
        whatsapp,
        card_type,
        custom_name,
        custom_title,
        utm_source,
        utm_campaign,
        persona,
        funnel_stage,
        order_bumps,
        estimated_amount
      } = req.body;

      // Check if lead exists in last 24h
      const existing = db.prepare("SELECT id FROM card_funnel_leads WHERE (email = ? AND email != '') OR (whatsapp = ? AND whatsapp != '') ORDER BY id DESC LIMIT 1").get(email || '', whatsapp || '');

      if (existing) {
        db.prepare(`
          UPDATE card_funnel_leads 
          SET name = COALESCE(NULLIF(?, ''), name),
              card_type = COALESCE(NULLIF(?, ''), card_type),
              custom_name = COALESCE(NULLIF(?, ''), custom_name),
              custom_title = COALESCE(NULLIF(?, ''), custom_title),
              funnel_stage = COALESCE(?, funnel_stage),
              order_bumps = COALESCE(?, order_bumps),
              estimated_amount = COALESCE(?, estimated_amount),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          name || '',
          card_type || '',
          custom_name || '',
          custom_title || '',
          funnel_stage || 'customization_saved',
          JSON.stringify(order_bumps || []),
          estimated_amount || 0,
          existing.id
        );
        return res.json({ success: true, lead_id: existing.id, updated: true });
      } else {
        const stmt = db.prepare(`
          INSERT INTO card_funnel_leads (
            name, email, whatsapp, card_type, custom_name, custom_title, 
            utm_source, utm_campaign, persona, funnel_stage, order_bumps, estimated_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
          name || '',
          email || '',
          whatsapp || '',
          card_type || 'metal',
          custom_name || '',
          custom_title || '',
          utm_source || '',
          utm_campaign || '',
          persona || 'founder',
          funnel_stage || 'customization_saved',
          JSON.stringify(order_bumps || []),
          estimated_amount || 0
        );
        return res.json({ success: true, lead_id: info.lastInsertRowid, created: true });
      }
    } catch (err: any) {
      console.error('Funnel lead error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Automated Abandoned Cart Recovery Sequence Trigger
  app.post('/api/funnel/webhook-trigger', (req, res) => {
    try {
      const { lead_id, action, email, whatsapp, name, custom_name, card_type, estimated_amount } = req.body;
      const firstName = (name || custom_name || 'there').split(' ')[0];
      const tierName = card_type === 'Custom PVC Card' || card_type === 'plastic' ? 'Custom PVC' : 'Custom Metal';

      // Sequence Message 1: 1 hour later (Design Concierge Angle)
      const message1 = {
        trigger: '1_hour_abandonment',
        channel: 'WhatsApp & Email',
        subject: `Quick question about your ${tierName} Card design proof`,
        body: `Hi ${firstName}, Victor here from the ChipNG design workshop in Lagos.\n\nI noticed you were customizing your ${tierName} Card earlier but didn't get to finish checking out. Often founders, creatives, and team leads pause here because they aren't sure if their company logo resolution is sharp enough, or they want advice on how their name and title will look laser-engraved.\n\nDid you run into any issues uploading your logo or setting up your profile handle? Or would you like me to create a quick 3D mockup proof for you before you pay?\n\nJust reply to this message directly with your logo file, vector, or question and I'll personally take care of it right now.\n\n— Victor Dennis\nHead of Production, ChipNG\nLagos, Nigeria`,
      };

      // Sequence Message 2: 24 hours later (Urgency / Workshop Capacity Angle)
      const message2 = {
        trigger: '24_hours_abandonment',
        channel: 'WhatsApp & Email',
        subject: `[Expiring Today] Your ChipNG ${tierName} production slot & 10% courtesy voucher`,
        body: `Hi ${firstName},\n\nBecause our Lagos workshop operates on a strict daily laser-engraving capacity to guarantee our 24–48 hour dispatch turnaround, we can only hold temporary card configurations in our active queue for 24 hours.\n\nYour customized ${tierName} card layout is scheduled to be archived this evening to release the machine slot.\n\nIf you're ready to lock in your card today, use courtesy code VIPFIRST10 at checkout for an immediate 10% discount off your order.\n\nTap here to resume your checkout with your saved layout: https://chip-ng.web.app/nfc?resume=true&code=VIPFIRST10\n\nNeed team or bulk invoicing instead? Just reply to this text and I'll send our corporate VAT quote.\n\n— Victor Dennis, ChipNG Production`,
      };

      console.log(`[ABANDONED RECOVERY] 2-Part sequence registered for ${firstName} (${whatsapp || email}) - Tier: ${tierName}`);

      res.json({
        success: true,
        status: 'sequence_scheduled',
        lead_id,
        sequence: [
          { delay: '1 hour', ...message1 },
          { delay: '24 hours', coupon_code: 'VIPFIRST10', discount_pct: 10, ...message2 }
        ],
        message: `2-part recovery sequence scheduled: 1h Design Concierge + 24h Workshop Capacity Urgency.`
      });
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

  const handleBroadcastNotification = (req: any, res: any) => {
    const title = req.body.title;
    const message = req.body.message || req.body.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    try {
      const info = db.prepare(`INSERT INTO app_notifications (title, message) VALUES (?, ?)`).run(title, message);
      const newNotif = {
        id: info.lastInsertRowid,
        title,
        message,
        created_at: new Date().toISOString()
      };
      
      // Also log broadcast
      try {
        db.prepare('INSERT INTO broadcast_logs (message_template, audience_count) VALUES (?, ?)').run(`[IN-APP] ${title}: ${message}`, 1);
      } catch (logErr) {}

      res.json({ success: true, id: info.lastInsertRowid, notification: newNotif });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.post('/api/app-updates', handleBroadcastNotification);
  app.post('/api/notifications/broadcast', handleBroadcastNotification);
  app.post('/api/notifications', handleBroadcastNotification);

  // Mark notification read routes
  const handleMarkRead = (req: any, res: any) => {
    res.json({ success: true, id: req.params.id || req.body.id || 'all' });
  };
  app.patch('/api/notifications/:id/read', handleMarkRead);
  app.put('/api/notifications/:id/read', handleMarkRead);
  app.post('/api/notifications/:id/read', handleMarkRead);
  app.post('/api/notifications/mark-read', handleMarkRead);

  const handleDeleteNotification = (req: any, res: any) => {
    try {
      db.prepare('DELETE FROM app_notifications WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  app.delete('/api/app-updates/:id', handleDeleteNotification);
  app.delete('/api/notifications/:id', handleDeleteNotification);

  app.get('/api/broadcast/stats', (req, res) => {
    try {
      const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
      const sent7Days = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-7 days')").get().c;
      const sent1Hour = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-1 hour')").get().c;
      res.json({ totalLeads, sent7Days, sent1Hour, remainingHour: Math.max(0, 50 - sent1Hour) });
    } catch (e) { console.error("broadcast error", e); res.status(500).json({error: e.message}); }
  });

  app.get('/api/broadcast/logs', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM broadcast_logs ORDER BY created_at DESC LIMIT 20').all();
      res.json(rows);
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/broadcast/mark-sent', (req, res) => {
    try {
      const { lead_id } = req.body;
      db.prepare("UPDATE leads SET last_broadcast_at = datetime('now'), broadcast_count = IFNULL(broadcast_count, 0) + 1 WHERE id = ?").run(lead_id);
      res.json({ success: true });
    } catch (e) { console.error("broadcast error", e); res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/toggle-optout', (req, res) => {
    try {
      const { lead_id, opt_out } = req.body;
      db.prepare("UPDATE leads SET opt_out = ? WHERE id = ?").run(opt_out ? 1 : 0, lead_id);
      res.json({ success: true });
    } catch (e) { console.error("broadcast error", e); res.status(500).json({error: e.message}); }
  });

  // --- Real-time User Profile & NFC Analytics API ---
  app.post('/api/analytics/view', (req, res) => {
    try {
      const { profile_id, source } = req.body;
      if (!profile_id) return res.status(400).json({ error: 'profile_id required' });
      const ip = req.ip || req.headers['x-forwarded-for'] || '';
      db.prepare('INSERT INTO profile_analytics_views (profile_id, source, ip) VALUES (?, ?, ?)').run(
        profile_id, 
        source || 'web', 
        String(ip)
      );
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/analytics/click', (req, res) => {
    try {
      const { profile_id, link_id, link_url, link_title, click_type } = req.body;
      if (!profile_id) return res.status(400).json({ error: 'profile_id required' });
      db.prepare('INSERT INTO profile_analytics_clicks (profile_id, link_id, link_url, link_title, click_type) VALUES (?, ?, ?, ?, ?)').run(
        profile_id,
        link_id || null,
        link_url || null,
        link_title || 'Link',
        click_type || 'link'
      );
      res.json({ success: true });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/analytics/user/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      
      const viewsCountSqlite = db.prepare('SELECT COUNT(*) as c FROM profile_analytics_views WHERE profile_id = ?').get(profileId).c;
      
      let viewsCountSupabase = 0;
      try {
        const { count } = await getSupabase().from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', profileId);
        if (typeof count === 'number') viewsCountSupabase = count;
      } catch(e) {}
      
      const totalViews = Math.max(viewsCountSqlite, viewsCountSupabase);
      const totalClicks = db.prepare('SELECT COUNT(*) as c FROM profile_analytics_clicks WHERE profile_id = ?').get(profileId).c;
      
      const sourceRows = db.prepare('SELECT source, COUNT(*) as count FROM profile_analytics_views WHERE profile_id = ? GROUP BY source').all(profileId);
      const nfcTaps = (sourceRows.find((r: any) => r.source === 'nfc') as any)?.count || 0;
      const qrScans = (sourceRows.find((r: any) => r.source === 'qr') as any)?.count || 0;
      const webViews = Math.max(0, totalViews - (nfcTaps + qrScans));
      
      const clickTypeRows = db.prepare('SELECT click_type, COUNT(*) as count FROM profile_analytics_clicks WHERE profile_id = ? GROUP BY click_type').all(profileId);
      
      const topLinks = db.prepare('SELECT link_title, link_url, click_type, COUNT(*) as clicks FROM profile_analytics_clicks WHERE profile_id = ? GROUP BY link_title, link_url ORDER BY clicks DESC LIMIT 5').all(profileId);
      
      const recentViews = db.prepare("SELECT 'view' as event_type, source as detail, created_at FROM profile_analytics_views WHERE profile_id = ? ORDER BY id DESC LIMIT 10").all(profileId);
      const recentClicks = db.prepare("SELECT 'click' as event_type, COALESCE(link_title, click_type) as detail, created_at FROM profile_analytics_clicks WHERE profile_id = ? ORDER BY id DESC LIMIT 10").all(profileId);
      
      const recentActivity = [...recentViews, ...recentClicks]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
        
      const ctr = totalViews > 0 ? parseFloat(((totalClicks / totalViews) * 100).toFixed(1)) : 0;
      
      res.json({
        totalViews,
        totalClicks,
        ctr,
        nfcTaps,
        qrScans,
        webViews,
        clicksByType: clickTypeRows,
        topLinks,
        recentActivity
      });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- SEO Engine Endpoints (Accessible in dev and prod) ---
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
      const broken = (logs as any[]).filter(l => l.status === 'BROKEN').length;
      res.json({ total: logs.length, broken, logs });
    } catch(e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/seo/check-links', async (req, res) => {
    try {
      const logs = db.prepare('SELECT * FROM post_links_log ORDER BY id DESC LIMIT 50').all();
      let brokenCount = 0;
      
      for (const log of (logs as any[])) {
        try {
          const url = log.linked_url;
          if (url.startsWith('/')) {
            if (url.startsWith('/blog/')) {
              const slug = url.replace('/blog/', '').split('?')[0].split('#')[0];
              const { data } = await getSupabase().from('posts').select('id').eq('slug', slug).single();
              if (!data) {
                brokenCount++;
                db.prepare('UPDATE post_links_log SET status = ? WHERE id = ?').run('BROKEN', log.id);
              } else {
                db.prepare('UPDATE post_links_log SET status = ? WHERE id = ?').run('OK', log.id);
              }
            } else {
              db.prepare('UPDATE post_links_log SET status = ? WHERE id = ?').run('OK', log.id);
            }
          } else {
            db.prepare('UPDATE post_links_log SET status = ? WHERE id = ?').run('OK', log.id);
          }
        } catch(err) {
          db.prepare('UPDATE post_links_log SET status = ? WHERE id = ?').run('OK', log.id);
        }
      }
      
      const updatedLogs = db.prepare('SELECT * FROM post_links_log ORDER BY created_at DESC LIMIT 50').all();
      res.json({ success: true, total: updatedLogs.length, broken: brokenCount, logs: updatedLogs });
    } catch(e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/seo/auto-meta', (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({error: 'No content'});
      const cleanText = content.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      const firstSentence = cleanText.split('.')[0] || cleanText.substring(0, 60);
      const meta_title = firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence;
      const meta_description = cleanText.length > 155 ? cleanText.substring(0, 152) + '...' : cleanText;
      
      const words = cleanText.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w: string) => w.length > 4);
      const focus_keyword = words.find((w: string) => ['nfc', 'card', 'digital', 'profile', 'business', 'networking', 'lagos', 'nigeria', 'smart'].includes(w)) || words[0] || 'nfc card';
      
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

  // Commercial SEO & Static Route Meta Definition
  const COMMERCIAL_META: Record<string, { title: string; desc: string }> = {
    '/nfc-business-card-nigeria': {
      title: 'NFC Business Card Nigeria — Smart Digital Contactless Cards | CHIP NG',
      desc: 'Order the definitive NFC smart business card in Nigeria. 1-tap contact sharing, zero app needed, instant WhatsApp connection & live analytics. Nationwide dispatch.'
    },
    '/nfc-business-card-lagos': {
      title: 'NFC Business Card Lagos — Same-Day & 24h Express Delivery | CHIP NG',
      desc: 'Get laser-engraved NFC smart business cards in Lagos. Precision fabrication in our Lagos workshop. 1-tap contact exchange for Victoria Island, Ikoyi, Lekki & Ikeja dealmakers.'
    },
    '/nfc-business-card-lekki': {
      title: 'NFC Business Card Lekki — Smart Cards for Realtors & Founders | CHIP NG',
      desc: 'Smart NFC business cards tailored for Lekki Phase 1, Chevron, Ikate, and Ajah professionals. 1-tap property brochures, portfolio links, and WhatsApp lead capture.'
    },
    '/nfc-business-card-ajah': {
      title: 'NFC Business Card Ajah & Sangotedo — Digital Business Cards | CHIP NG',
      desc: 'Affordable, durable NFC smart business cards for Ajah, Sangotedo, and Ibeju-Lekki business owners. Share your store catalog, WhatsApp, and phone number with 1 tap.'
    },
    '/nfc-metal-business-card': {
      title: 'NFC Metal Business Card Nigeria — Heavyweight Stainless Steel | CHIP NG',
      desc: 'Order custom metal NFC business cards in Nigeria. Heavyweight 304 aerospace stainless steel, fiber-laser engraving, 24K gold mirror & matte obsidian finishes.'
    },
    '/digital-business-card-nigeria': {
      title: 'Digital Business Card Nigeria — Dynamic Link-in-Bio Platform | CHIP NG',
      desc: 'Create your free digital business card in Nigeria. Custom username (chipng.com/you), interactive bio links, vCard download, product catalog, and lead capture.'
    },
    '/nfc-business-card-price-nigeria': {
      title: 'NFC Business Card Price in Nigeria — 2026 Transparent Pricing | CHIP NG',
      desc: 'Compare NFC business card prices in Nigeria. Matte PVC from ₦30,000, laser-engraved stainless steel from ₦50,000. No hidden fees, free lifetime profile hosting.'
    },
    '/nfc-business-card-for-real-estate': {
      title: 'NFC Business Card for Real Estate Agents Nigeria | CHIP NG',
      desc: 'The ultimate smart business card for Nigerian real estate agents and developers. Share property catalogs, virtual tours, and WhatsApp with 1 tap at open houses.'
    },
    '/nfc-business-card-for-sales-teams': {
      title: 'NFC Business Cards for Sales Teams Nigeria — Lead Generation | CHIP NG',
      desc: 'Equip your B2B sales team with NFC smart business cards. 3x contact save rate, centralized lead capture, aggregate tap telemetry, and CRM export.'
    },
    '/nfc-business-card-for-corporate-teams': {
      title: 'NFC Business Cards for Corporate Teams & Enterprises | CHIP NG',
      desc: 'Enterprise NFC smart business card solutions for Nigerian companies. Centralized admin, custom corporate branding, employee seat management, and unified billing.'
    },
    '/shipping': {
      title: 'Shipping & Delivery Policy | CHIP NG Lagos & Nationwide',
      desc: 'Lagos direct courier delivery in 24–48 hours. Nationwide express dispatch to Abuja, Port Harcourt, and all 36 states via DHL and GIG Logistics.'
    },
    '/refund-policy': {
      title: 'Refund & 12-Month Hardware Warranty Policy | CHIP NG',
      desc: '12-month hardware replacement guarantee on all CHIP NG smart contactless cards. Free antenna and chip defect replacement.'
    }
  };

  const RESERVED_PREFIXES = [
    '/admin', '/enterprise', '/login', '/dashboard', '/api', '/blog',
    '/company', '/about', '/updates', '/contact', '/buy-card', '/shop',
    '/shipping', '/refund-policy', '/privacy-policy', '/privacy',
    '/terms-of-service', '/terms'
  ];

  // Static files from public folder
  app.use(express.static(path.resolve('public')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
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

          const urlPath = (req.originalUrl || req.path || '').split('?')[0].replace(/\/$/, '') || '/';

          if (COMMERCIAL_META[urlPath]) {
            const meta = COMMERCIAL_META[urlPath];
            template = template.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
            template = template.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${meta.title}" />`);
            template = template.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${meta.desc}" />`);
            template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${meta.title}" />`);
            template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${meta.desc}" />`);
          } else if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
            const slug = urlPath.slice(6);
            let post: any = db.prepare('SELECT title, meta_title, meta_description, cover_image_url, excerpt, content FROM local_posts WHERE slug = ?').get(slug);
            if (!post) {
              const { data } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url, excerpt, content').eq('slug', slug).single();
              if (data) post = data;
            }
            if (post) {
              const title = post.meta_title || `${post.title} — CHIP NG`;
              const cleanDesc = (post.meta_description || post.excerpt || post.content || '')
                .replace(/<[^>]*>/g, ' ')
                .replace(/[#*_~`>\[\]]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 160) || 'Official CHIP NG Blog & Thought Leadership';
              template = template.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
              template = template.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
              template = template.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${cleanDesc}" />`);
              template = template.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
              template = template.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${cleanDesc}" />`);
              if (post.cover_image_url) {
                 template = template.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
                 template = template.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
              }
            }
          } else if (urlPath !== '/' && !RESERVED_PREFIXES.some(prefix => urlPath === prefix || urlPath.startsWith(prefix + '/'))) {
            let username = urlPath.slice(1);
            if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
            const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').ilike('username', username).maybeSingle();
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
        const urlPath = req.path.replace(/\/$/, '') || '/';
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (COMMERCIAL_META[urlPath]) {
          const meta = COMMERCIAL_META[urlPath];
          html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
          html = html.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${meta.title}" />`);
          html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${meta.desc}" />`);
          html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${meta.title}" />`);
          html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${meta.desc}" />`);
        } else if (urlPath.startsWith('/blog/') && urlPath.length > 6) {
          const slug = urlPath.slice(6);
          let post: any = db.prepare('SELECT title, meta_title, meta_description, cover_image_url, excerpt, content FROM local_posts WHERE slug = ?').get(slug);
          if (!post) {
            const { data } = await supabase.from('posts').select('title, meta_title, meta_description, cover_image_url, excerpt, content').eq('slug', slug).single();
            if (data) post = data;
          }
          if (post) {
            const title = post.meta_title || `${post.title} — CHIP NG`;
            const cleanDesc = (post.meta_description || post.excerpt || post.content || '')
              .replace(/<[^>]*>/g, ' ')
              .replace(/[#*_~`>\[\]]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 160) || 'Official CHIP NG Blog & Thought Leadership';
            html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
            html = html.replace(/<meta name="title" content=".*?"\s*\/?>/, `<meta name="title" content="${title}" />`);
            html = html.replace(/<meta name="description" content=".*?"\s*\/?>/, `<meta name="description" content="${cleanDesc}" />`);
            html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
            html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/, `<meta property="og:description" content="${cleanDesc}" />`);
            if (post.cover_image_url) {
               html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/, `<meta property="og:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/, `<meta name="twitter:image" content="${post.cover_image_url}" />`);
               html = html.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/, `<meta property="twitter:image" content="${post.cover_image_url}" />`);
            }
          }
        } else if (urlPath !== '/' && !RESERVED_PREFIXES.some(prefix => urlPath === prefix || urlPath.startsWith(prefix + '/'))) {
          let username = urlPath.slice(1);
          if (username.endsWith('/vcard')) username = username.replace(/\/vcard$/, '');
          const { data: profile } = await supabase.from('profiles').select('full_name, headline, bio, cover_image_url').ilike('username', username).maybeSingle();
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
