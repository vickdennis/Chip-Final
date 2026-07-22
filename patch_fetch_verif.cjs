const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const target = `      if (profileData) {
        setProfile({ ...profileData, email: user.email });
        if (profileData.cover_image_url) setCoverUrl(profileData.cover_image_url);`;

const replacement = `      if (profileData) {
        let isVerified = profileData.is_verified;
        if (isVerified && purchasesData) {
          const verifPurchases = purchasesData.filter(p => p.purchase_type === 'verification' && p.status?.startsWith('expires_'));
          if (verifPurchases.length > 0) {
            // Sort by newest
            const latestVerif = verifPurchases[0];
            const expiresAt = parseInt(latestVerif.status.split('_')[1], 10);
            if (Date.now() > expiresAt) {
              isVerified = false;
              await supabase.from('profiles').update({ is_verified: false }).eq('id', user.id);
            }
          }
        }
        
        setProfile({ ...profileData, email: user.email, is_verified: isVerified });
        if (profileData.cover_image_url) setCoverUrl(profileData.cover_image_url);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/views/UserDashboard.tsx', content);
