const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sqliteInit = `// Create leads table if not exists
db.exec(\`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    city TEXT,
    post_slug TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
\`);`;

const sqliteNew = `// Create leads table if not exists
db.exec(\`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    city TEXT,
    post_slug TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
\`);

try {
  db.exec("ALTER TABLE leads ADD COLUMN clicked_variant TEXT");
} catch(e) {} // Ignore if already exists

db.exec(\`
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
\`);

const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (productCount.c === 0) {
  db.prepare(\`
    INSERT INTO products (name, price_ngn, image_url, benefits_json, rating, review_count, badge_text, whatsapp_link, button_variant_a, button_variant_b)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  \`).run(
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
`;

code = code.replace(sqliteInit, sqliteNew);

const leadRoute = `app.post('/api/lead', (req, res) => {
    try {
      const { name, whatsapp, city, post_slug, source } = req.body;
      const stmt = db.prepare('INSERT INTO leads (name, whatsapp, city, post_slug, source) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(name, whatsapp, city, post_slug, source);
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error: any) {
      console.error('Insert error:', error);
      res.status(500).json({ error: error.message });
    }
  });`;

const leadRouteNew = `app.post('/api/lead', (req, res) => {
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
    } catch (e: any) { res.status(500).json({error: e.message}); }
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
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.delete('/api/products/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });`;

code = code.replace(leadRoute, leadRouteNew);

fs.writeFileSync('server.ts', code);
