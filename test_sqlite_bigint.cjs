const db = require('better-sqlite3')(':memory:');
db.exec('CREATE TABLE p (a TEXT)');
const info = db.prepare('INSERT INTO p (a) VALUES (?)').run('test');
console.log(typeof info.lastInsertRowid, info.lastInsertRowid);
