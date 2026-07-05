const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldSupa = `const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);`;

const newSupa = `const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey);
}`;

code = code.replace(oldSupa, newSupa);
code = code.replace(/await supabase/g, "await getSupabase()");

fs.writeFileSync('server.ts', code);
