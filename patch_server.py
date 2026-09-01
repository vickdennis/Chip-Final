import re

with open('server.ts', 'r') as f:
    code = f.read()

# Add nodemailer
code = code.replace("import Database from 'better-sqlite3';", "import Database from 'better-sqlite3';\nimport nodemailer from 'nodemailer';")

# Add NFC Sales table
table_sql = """  CREATE TABLE IF NOT EXISTS nfc_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    card_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_reference TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
"""
code = code.replace("  CREATE TABLE IF NOT EXISTS app_notifications (", table_sql + "\n  CREATE TABLE IF NOT EXISTS app_notifications (")

# Add /api/sales endpoints
endpoints = """
  // NFC Sales Endpoints
  app.post('/api/sales', express.json(), async (req, res) => {
    try {
      const { name, email, phone, card_type, amount, payment_reference } = req.body;
      const stmt = db.prepare('INSERT INTO nfc_sales (name, email, phone, card_type, amount, payment_reference) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, email, phone, card_type, amount, payment_reference);
      
      // Try to send email
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        // Only send if configured
        if (process.env.SMTP_USER) {
          await transporter.sendMail({
            from: `"CHIP NG Sales" <${process.env.SMTP_USER}>`,
            to: 'vickthor.dennis@gmail.com',
            subject: `New NFC Card Sale! (${card_type})`,
            text: `A new sale has been made!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCard: ${card_type}\nAmount: ₦${amount/100}\nRef: ${payment_reference}`,
          });
        }
      } catch (emailErr) {
        console.error("Email send failed:", emailErr);
        // Continue even if email fails
      }

      res.json({ success: true, id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/sales', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM nfc_sales ORDER BY created_at DESC').all();
      res.json({ sales: rows });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/app-updates', express.json(), (req, res) => {"""

code = code.replace("  app.post('/api/app-updates', express.json(), (req, res) => {", endpoints)

with open('server.ts', 'w') as f:
    f.write(code)

print("server.ts patched.")
