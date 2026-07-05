import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import Database from 'better-sqlite3';

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
      const { name, whatsapp, city, post_slug, source } = req.body;
      const stmt = db.prepare('INSERT INTO leads (name, whatsapp, city, post_slug, source) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(name, whatsapp, city, post_slug, source);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      console.error('Insert error:', error);
      res.status(500).json({ error: error.message });
    }
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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
