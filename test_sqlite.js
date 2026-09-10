import Database from 'better-sqlite3';
const db = new Database(':memory:');
db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
const info = db.prepare('INSERT INTO test (name) VALUES (?)').run('test');
console.log(typeof info.lastInsertRowid);
try {
  console.log(JSON.stringify({ id: info.lastInsertRowid }));
} catch (e) {
  console.log("JSON ERROR:", e.message);
}
