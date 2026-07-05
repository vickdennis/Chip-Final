import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const fs = require('fs');
  const schema = fs.readFileSync('supabase_schema.sql', 'utf8');
  const { data, error } = await supabase.rpc('execute_sql', { sql: schema });
  console.log("Reload Schema Result:", error || data);
}
run();
