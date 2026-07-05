const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sqliteNew = `db.exec(\`
  CREATE TABLE IF NOT EXISTS broadcast_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_template TEXT NOT NULL,
    audience_count INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
\`);`;

code = code.replace("const kwCount = db.prepare", `${sqliteNew}\n\nconst kwCount = db.prepare`);

const broadcastApi = `
  // Broadcast API
  app.post('/api/broadcast', (req, res) => {
    try {
      const { leads, messageTemplate } = req.body;
      if (!leads || !messageTemplate) return res.status(400).json({ error: 'Missing leads or messageTemplate' });

      // In a real application, you would integrate with WhatsApp Business API or Twilio here.
      // For this implementation, we simulate the broadcast.
      console.log(\`Simulating broadcast to \${leads.length} leads.\`);
      
      db.prepare('INSERT INTO broadcast_logs (message_template, audience_count) VALUES (?, ?)').run(messageTemplate, leads.length);

      res.json({ success: true, count: leads.length });
    } catch (e: any) { res.status(500).json({error: e.message}); }
  });
`;

code = code.replace("app.listen(PORT, \"0.0.0.0\", () => {", `${broadcastApi}\n\n  app.listen(PORT, "0.0.0.0", () => {`);

fs.writeFileSync('server.ts', code);
