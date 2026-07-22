const fs = require('fs');
let content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf-8');

const target = `    if (usersData) setUsers(usersData);
    if (productsData) setProducts(productsData);
    if (purchasesData) setPurchases(purchasesData);`;

const replacement = `    if (usersData && purchasesData) {
      const updatedUsers = [...usersData];
      let needsRefresh = false;
      for (const u of updatedUsers) {
        if (u.is_verified) {
          const verifPurchases = purchasesData.filter(p => p.seller_id === u.id && p.purchase_type === 'verification' && p.status?.startsWith('expires_'));
          if (verifPurchases.length > 0) {
            const latestVerif = verifPurchases[0];
            const expiresAt = parseInt(latestVerif.status.split('_')[1], 10);
            if (Date.now() > expiresAt) {
              u.is_verified = false;
              await supabase.from('profiles').update({ is_verified: false }).eq('id', u.id);
              needsRefresh = true;
            }
          }
        }
      }
      setUsers(updatedUsers);
    } else if (usersData) {
      setUsers(usersData);
    }
    
    if (productsData) setProducts(productsData);
    if (purchasesData) setPurchases(purchasesData);`;

content = content.replace(target, replacement);
fs.writeFileSync('src/views/AdminDashboard.tsx', content);
