import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || "fallback";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "fallback";
// I don't have the env. Let's try to parse it from the running app or vite env?
