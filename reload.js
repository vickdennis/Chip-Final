import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://oxrzkdzcagvmgfuthyjd.supabase.co', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN');

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: "NOTIFY pgrst, 'reload schema'" });
  console.log("Reload Schema Result:", error || data);
}
run();
