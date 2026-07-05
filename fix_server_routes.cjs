const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const apiExt = `
  // Broadcast API
  app.post('/api/broadcast', (req, res) => {
    try {
      const { leads, messageTemplate } = req.body;
      if (!leads || !messageTemplate) return res.status(400).json({ error: 'Missing leads or messageTemplate' });
      console.log(\`Simulating broadcast to \${leads.length} leads.\`);
      db.prepare('INSERT INTO broadcast_logs (message_template, audience_count) VALUES (?, ?)').run(messageTemplate, leads.length);
      res.json({ success: true, count: leads.length });
    } catch (e) { res.status(500).json({error: e.message}); }
  });

  app.get('/api/broadcast/stats', (req, res) => {
    try {
      const totalLeads = db.prepare('SELECT COUNT(*) as c FROM leads').get().c;
      const sent7Days = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-7 days')").get().c;
      const sent1Hour = db.prepare("SELECT COUNT(*) as c FROM leads WHERE last_broadcast_at >= datetime('now', '-1 hour')").get().c;
      res.json({ totalLeads, sent7Days, sent1Hour, remainingHour: Math.max(0, 50 - sent1Hour) });
    } catch (e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/mark-sent', (req, res) => {
    try {
      const { lead_id } = req.body;
      db.prepare("UPDATE leads SET last_broadcast_at = datetime('now'), broadcast_count = IFNULL(broadcast_count, 0) + 1 WHERE id = ?").run(lead_id);
      res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
  });

  app.post('/api/broadcast/toggle-optout', (req, res) => {
    try {
      const { lead_id, opt_out } = req.body;
      db.prepare("UPDATE leads SET opt_out = ? WHERE id = ?").run(opt_out ? 1 : 0, lead_id);
      res.json({ success: true });
    } catch (e) { res.status(500).json({error: e.message}); }
  });
`;

// Remove them from the end
const badCodeStart = `// Broadcast API`;
const badCodeEnd = `  app.listen(PORT, "0.0.0.0", () => {`;

const startIdx = code.indexOf(badCodeStart);
const endIdx = code.indexOf(badCodeEnd);
if(startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + code.substring(endIdx);
}

// Insert before Vite middleware
code = code.replace(`// Vite middleware for development`, `${apiExt}\n\n  // Vite middleware for development`);

fs.writeFileSync('server.ts', code);
