import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: `
    ALTER TABLE public.links ADD COLUMN IF NOT EXISTS size TEXT DEFAULT 'Button';
    ALTER TABLE public.links ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE public.links ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
    ALTER TABLE public.links ADD COLUMN IF NOT EXISTS use_link_icon BOOLEAN DEFAULT true;
  ` });
  console.log(error || data);
}
run();
