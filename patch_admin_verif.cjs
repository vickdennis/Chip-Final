const fs = require('fs');
let content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf-8');

const targetToggle = `  const toggleVerification = async (id: string, current: boolean) => {
    const { error, count, data } = await supabase.from('profiles').update({ is_verified: !current }).eq('id', id).select('*');
    if (error) alert("Error verifying: " + error.message);
    else if (!data || data.length === 0) alert("Action failed constraint checks in DB (RLS). Please apply the latest permissions in Supabase SQL editor.");
    else fetchData();
  };`;

const replacementToggle = `  const toggleVerification = async (user: any) => {
    if (user.is_verified) {
      if (!window.confirm("Revoke verification?")) return;
      const { error } = await supabase.from('profiles').update({ is_verified: false }).eq('id', user.id);
      if (error) alert("Error revoking: " + error.message);
      else fetchData();
    } else {
      const monthsStr = window.prompt("Enter number of months for verification:", "1");
      if (!monthsStr) return;
      const months = parseInt(monthsStr, 10);
      if (isNaN(months) || months <= 0) return alert("Invalid number of months");
      
      const expiresAt = Date.now() + months * 30 * 24 * 60 * 60 * 1000;
      
      const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
      if (error) {
        alert("Error verifying: " + error.message);
        return;
      }
      
      await supabase.from('purchases').insert([{
        seller_id: user.id,
        buyer_email: user.contact_email || user.email || user.username || 'admin_verified',
        amount: 0,
        platform_fee: 0,
        net_earnings: 0,
        reference: 'ADMIN_VERIF_' + Math.random().toString(36).substring(2, 9),
        status: 'expires_' + expiresAt,
        purchase_type: 'verification'
      }]);
      
      fetchData();
    }
  };`;

content = content.replace(targetToggle, replacementToggle);

// And replace the call in the table
content = content.replace(/toggleVerification\(u\.id, u\.is_verified\)/g, "toggleVerification(u)");

fs.writeFileSync('src/views/AdminDashboard.tsx', content);
