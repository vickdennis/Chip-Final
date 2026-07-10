const fs = require('fs');
let file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const target = \`db.exec(\\\`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_ngn TEXT NOT NULL,
    image_url TEXT,
    benefits_json TEXT,
    rating REAL,
    review_count INTEGER,
    badge_text TEXT,
    whatsapp_link TEXT,
    button_variant_a TEXT,
    button_variant_b TEXT
  )
\\\`);\`;

const replacement = \`db.exec(\\\`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_ngn TEXT NOT NULL,
    image_url TEXT,
    benefits_json TEXT,
    rating REAL,
    review_count INTEGER,
    badge_text TEXT,
    whatsapp_link TEXT,
    button_variant_a TEXT,
    button_variant_b TEXT
  )
\\\`);

try { db.exec("ALTER TABLE products ADD COLUMN button_variant_a TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN button_variant_b TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN image_url TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN benefits_json TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN rating REAL"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN review_count INTEGER"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN badge_text TEXT"); } catch(e) {}
try { db.exec("ALTER TABLE products ADD COLUMN whatsapp_link TEXT"); } catch(e) {}
\`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
