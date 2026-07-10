const { createClient } = require('@supabase/supabase-js');
const url = "https://oxrzkdzcagvmgfuthyjd.supabase.co";
const key = "sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN";
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql_statement: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT \'{}\';' });
  console.log("RPC result:", error);
}
run();
