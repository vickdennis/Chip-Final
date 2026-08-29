import re

with open('server.ts', 'r') as f:
    code = f.read()

# Fix get/notifications
code = code.replace("db.all(`SELECT * FROM app_notifications ORDER BY created_at DESC LIMIT 10`, [], (err, rows) => {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ notifications: rows });\n    });", "try { const rows = db.prepare(`SELECT * FROM app_notifications ORDER BY created_at DESC LIMIT 10`).all(); res.json({ notifications: rows }); } catch(err: any) { res.status(500).json({ error: err.message }); }")

# Fix post/notifications
code = code.replace("db.run(`INSERT INTO app_notifications (title, message) VALUES (?, ?)`, [title, message], function(err) {\n      if (err) return res.status(500).json({ error: err.message });\n      res.json({ success: true, id: this.lastID });\n    });", "try { const info = db.prepare(`INSERT INTO app_notifications (title, message) VALUES (?, ?)`).run(title, message); res.json({ success: true, id: info.lastInsertRowid }); } catch(err: any) { res.status(500).json({ error: err.message }); }")

with open('server.ts', 'w') as f:
    f.write(code)

print("Updated server.ts")
