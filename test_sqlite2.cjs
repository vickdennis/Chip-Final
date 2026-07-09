const db = require('better-sqlite3')(':memory:');
db.exec('CREATE TABLE p (a TEXT, b REAL)');
db.prepare('INSERT INTO p (a, b) VALUES (?, ?)').run('test', undefined);
console.log(db.prepare('SELECT * FROM p').get());
