const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');
content = content.replace("await supabase.from('profiles').select('*').eq('id', user.id).single();", "await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();");
fs.writeFileSync('src/views/UserDashboard.tsx', content);
