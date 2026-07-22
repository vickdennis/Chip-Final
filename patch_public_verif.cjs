const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const target = `      if (profileData) {
        setProfile(profileData);`;

const replacement = `      if (profileData) {
        if (profileData.is_verified) {
          const { data: purchasesData } = await supabase.from('purchases').select('*').eq('seller_id', targetUserId).eq('purchase_type', 'verification').order('created_at', { ascending: false }).limit(1);
          if (purchasesData && purchasesData.length > 0) {
            const latestVerif = purchasesData[0];
            if (latestVerif.status && latestVerif.status.startsWith('expires_')) {
              const expiresAt = parseInt(latestVerif.status.split('_')[1], 10);
              if (Date.now() > expiresAt) {
                profileData.is_verified = false;
                await supabase.from('profiles').update({ is_verified: false }).eq('id', targetUserId);
              }
            }
          }
        }
        setProfile(profileData);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/views/PublicProfileView.tsx', content);
