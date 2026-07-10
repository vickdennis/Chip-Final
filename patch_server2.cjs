const fs = require('fs');
let file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const target = "  CREATE TABLE IF NOT EXISTS products (\\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\\n    name TEXT NOT NULL,\\n    price_ngn TEXT NOT NULL,\\n    image_url TEXT,\\n    benefits_json TEXT,\\n    rating REAL,\\n    review_count INTEGER,\\n    badge_text TEXT,\\n    whatsapp_link TEXT,\\n    button_variant_a TEXT,\\n    button_variant_b TEXT\\n  )\\n\`);";

const replacement = "  CREATE TABLE IF NOT EXISTS products (\\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\\n    name TEXT NOT NULL,\\n    price_ngn TEXT NOT NULL,\\n    image_url TEXT,\\n    benefits_json TEXT,\\n    rating REAL,\\n    review_count INTEGER,\\n    badge_text TEXT,\\n    whatsapp_link TEXT,\\n    button_variant_a TEXT,\\n    button_variant_b TEXT\\n  )\\n\`);\\n\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN button_variant_a TEXT\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN button_variant_b TEXT\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN image_url TEXT\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN benefits_json TEXT\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN rating REAL\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN review_count INTEGER\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN badge_text TEXT\"); } catch(e) {}\\ntry { db.exec(\"ALTER TABLE products ADD COLUMN whatsapp_link TEXT\"); } catch(e) {}";

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
