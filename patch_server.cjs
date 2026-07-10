const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const tableSql = `
  CREATE TABLE IF NOT EXISTS user_galleries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id TEXT,
    image_url TEXT
  );
`;

content = content.replace('CREATE TABLE IF NOT EXISTS post_meta', tableSql + '\n  CREATE TABLE IF NOT EXISTS post_meta');

const apiRoutes = `
  app.get('/api/gallery/:profile_id', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM user_galleries WHERE profile_id=?').all(req.params.profile_id);
      res.json(rows);
    } catch (e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/gallery', (req, res) => {
    try {
      const { profile_id, image_url } = req.body;
      db.prepare('INSERT INTO user_galleries (profile_id, image_url) VALUES (?, ?)').run(profile_id, image_url);
      res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
  });

  app.delete('/api/gallery/:id', (req, res) => {
    try {
      db.prepare('DELETE FROM user_galleries WHERE id=?').run(req.params.id);
      res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
  });
`;

content = content.replace('// Vite middleware', apiRoutes + '\n  // Vite middleware');

fs.writeFileSync('server.ts', content);
