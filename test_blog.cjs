const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.example', 'utf8');
const url = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(url, key);

async function run() {
  const finalForm = { title: 'Test', slug: 'test-slug', content: 'test', is_published: true };
  const { data, error } = await supabase.from('posts').insert([finalForm]);
  console.log(error);
}
run();
