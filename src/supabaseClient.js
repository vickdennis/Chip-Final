import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://oxrzkdzcagvmgfuthyjd.supabase.co";
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable__ZQVU_WSSv7TL28O__vkVw_v77oD0hN";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export const adminAuthClient = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    storageKey: 'admin-temp-auth',
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
