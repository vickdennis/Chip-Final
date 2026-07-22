import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://oxrzkdzcagvmgfuthyjd.supabase.co', 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN');
async function test() {
  const { data, error } = await supabase.from('profiles').select('verification_expires_at').limit(1);
  console.log("Error:", error);
}
test();
