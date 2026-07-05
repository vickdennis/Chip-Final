const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const importStart = `import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";`;

const importNew = `import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import Database from 'better-sqlite3';

// Initialize SQLite database
const db = new Database('leads.sqlite', { verbose: console.log });
db.pragma('journal_mode = WAL');

// Create leads table if not exists
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

code = code.replace(importStart, importNew);

const appStart = `const app = express();
  const PORT = 3000;`;

const appNew = `const app = express();
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
  });`;

code = code.replace(appStart, appNew);
fs.writeFileSync('server.ts', code);
