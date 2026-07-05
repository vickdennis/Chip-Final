const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const migrations = `
try { db.exec("ALTER TABLE leads ADD COLUMN last_broadcast_at DATETIME"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN broadcast_count INTEGER DEFAULT 0"); } catch(e) {}
try { db.exec("ALTER TABLE leads ADD COLUMN opt_out INTEGER DEFAULT 0"); } catch(e) {}

db.exec(\`
  CREATE TABLE IF NOT EXISTS broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT,
    message TEXT,
    sent_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
\`);
`;

code = code.replace("const kwCount = db.prepare", `${migrations}\n\nconst kwCount = db.prepare`);

const apiExt = `
  app.get('/api/broadcast/stats', (req, res) => {
    try {
      const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
      const sent7Days = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-7 days')").get().c;
      const sent1Hour = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-1 hour')").get().c;
      
      res.json({ totalLeads, sent7Days, sent1Hour, remainingHour: Math.max(0, 50 - sent1Hour) });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/mark-sent', (req, res) => {
    try {
      const { lead_id } = req.body;
      db.prepare("UPDATE leads SET last_broadcast_at = datetime('now'), broadcast_count = IFNULL(broadcast_count, 0) + 1 WHERE id = ?").run(lead_id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/toggle-optout', (req, res) => {
    try {
      const { lead_id, opt_out } = req.body;
      db.prepare("UPDATE leads SET opt_out = ? WHERE id = ?").run(opt_out ? 1 : 0, lead_id);
      res.json({ success: true });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });
`;

code = code.replace("app.listen(PORT, \"0.0.0.0\", () => {", `${apiExt}\n\n  app.listen(PORT, "0.0.0.0", () => {`);

fs.writeFileSync('server.ts', code);
