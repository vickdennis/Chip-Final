import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oxrzkdzcagvmgfuthyjd.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
