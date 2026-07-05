const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sqliteNew = `db.exec(\`
  CREATE TABLE IF NOT EXISTS post_buybox_mapping (
    post_slug TEXT PRIMARY KEY,
    product_id INTEGER
  )
\`);`;

code = code.replace("const productCount = db.prepare", `${sqliteNew}\n\nconst productCount = db.prepare`);

const routeNew = `app.get('/api/post-product/:slug', (req, res) => {
    try {
      const mapping = db.prepare('SELECT product_id FROM post_buybox_mapping WHERE post_slug=?').get(req.params.slug);
      res.json({ product_id: mapping ? mapping.product_id : null });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/post-product', (req, res) => {
    try {
      const { post_slug, product_id } = req.body;
      db.prepare('INSERT OR REPLACE INTO post_buybox_mapping (post_slug, product_id) VALUES (?, ?)').run(post_slug, product_id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });`;

code = code.replace("app.delete('/api/products/:id', (req, res) => {", `${routeNew}\n\n  app.delete('/api/products/:id', (req, res) => {`);

fs.writeFileSync('server.ts', code);
