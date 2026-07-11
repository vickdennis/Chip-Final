const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://oxrzkdzcagvmgfuthyjd.supabase.co";
const SUPABASE_PUBLIC_KEY = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').ilike('username', 'VICKTHORDEN').single();
  console.log("Error:", error);
  console.log("Data:", data ? data.username : null);
}
run();
