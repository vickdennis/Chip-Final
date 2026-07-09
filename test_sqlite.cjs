const db = require('better-sqlite3')('leads.sqlite');
try {
  db.prepare('UPDATE products SET name=? WHERE id=?').run("test", "invalid_id");
} catch(e) {
  console.log(e.message);
}
