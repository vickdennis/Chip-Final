const fs = require('fs');
let content = fs.readFileSync('supabase_schema.sql', 'utf8');
const sql = `ALTER TABLE public.links ADD COLUMN IF NOT EXISTS size TEXT DEFAULT 'Button';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS use_link_icon BOOLEAN DEFAULT true;`;
fs.appendFileSync('supabase_schema.sql', "\n" + sql + "\n");
