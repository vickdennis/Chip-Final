const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf8');
content = content.replace("const { data, error } = await supabase.from('profiles').select('*').ilike('username', username).single();", "const { data, error } = await supabase.from('profiles').select('*').ilike('username', username).maybeSingle();");
content = content.replace("const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();", "const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();");
content = content.replace("const { data: ent } = await supabase.from('enterprises').select('*').eq('id', profileData.enterprise_id).single();", "const { data: ent } = await supabase.from('enterprises').select('*').eq('id', profileData.enterprise_id).maybeSingle();");
fs.writeFileSync('src/views/PublicProfileView.tsx', content);
