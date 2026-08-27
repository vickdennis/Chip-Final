with open('server.ts', 'r') as f:
    code = f.read()

table_sql = """  CREATE TABLE IF NOT EXISTS broadcast_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_template TEXT NOT NULL,
    audience_count INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
"""

new_table_sql = """  CREATE TABLE IF NOT EXISTS broadcast_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_template TEXT NOT NULL,
    audience_count INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS app_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
"""

if "CREATE TABLE IF NOT EXISTS app_notifications" not in code:
    code = code.replace(table_sql, new_table_sql)

api_endpoints = """
  app.get('/api/notifications', (req, res) => {
    db.all(`SELECT * FROM app_notifications ORDER BY created_at DESC LIMIT 10`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ notifications: rows });
    });
  });

  app.post('/api/notifications', express.json(), (req, res) => {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    db.run(`INSERT INTO app_notifications (title, message) VALUES (?, ?)`, [title, message], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
  });

  app.get('/api/broadcast/stats', (req, res) => {
"""

if "app.get('/api/notifications'" not in code:
    code = code.replace("  app.get('/api/broadcast/stats', (req, res) => {", api_endpoints)

with open('server.ts', 'w') as f:
    f.write(code)

print("Patched server.ts")
