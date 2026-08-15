const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const badLogic = `        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert(initialProfile).select().single();
        if (newProfile) {
          setProfile({ ...newProfile, email: user.email });
        } else {
          setProfile({ ...initialProfile, email: user.email });
        }`;

const goodLogic = `        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert(initialProfile).select().single();
        if (newProfile) {
          setProfile({ ...newProfile, email: user.email });
        } else if (insertError && insertError.code === '23505') {
          initialProfile.username = initialProfile.username + Math.floor(Math.random()*10000);
          const { data: retryProfile } = await supabase.from('profiles').insert(initialProfile).select().single();
          setProfile({ ...(retryProfile || initialProfile), email: user.email });
        } else {
          setProfile({ ...initialProfile, email: user.email });
        }`;

if (content.includes(badLogic)) {
  content = content.replace(badLogic, goodLogic);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log("Successfully patched UserDashboard.tsx for duplicate usernames");
} else {
  console.log("Failed to find badLogic in UserDashboard.tsx");
}
