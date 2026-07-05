const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const endPoint = `app.get('/api/post-categories-all', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM post_categories').all();
      const map = {};
      rows.forEach(r => map[r.post_slug] = r.category);
      res.json(map);
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });`;

code = code.replace("app.get('/api/post-categories/:slug',", `${endPoint}\n\n  app.get('/api/post-categories/:slug',`);

fs.writeFileSync('server.ts', code);
