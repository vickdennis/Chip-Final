import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_PUBLIC_KEY = "YOUR_SUPABASE_PUBLIC_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
