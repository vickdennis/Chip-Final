import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = 'https://oxrzkdzcagvmgfuthyjd.supabase.co';
const supabaseKey = 'sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').ilike('username', 'chipng').single();
  console.log('ilike:', data, error);
}

test();
