const fs = require('fs');
let content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf-8');

content = content.replace(
`  const themePurchases = purchases.filter(p => p.purchase_type === 'theme');`,
`  const themePurchases = purchases.filter(p => p.purchase_type === 'theme');
  const verificationPurchases = purchases.filter(p => p.purchase_type === 'verification');`
);

content = content.replace(
`  const themeSalesRevenue = themePurchases.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  
  const totalPlatformFees = digitalProductFees + themeSalesRevenue;`,
`  const themeSalesRevenue = themePurchases.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const verificationEarnings = verificationPurchases.reduce((sum, p) => sum + Number(p.platform_fee || p.amount || 0), 0);
  
  const totalPlatformFees = digitalProductFees + themeSalesRevenue + verificationEarnings;`
);

content = content.replace(
`                <span>Shop Fees (5%): ₦{digitalProductFees.toLocaleString()}</span>
                <span>Theme Sales: ₦{themeSalesRevenue.toLocaleString()}</span>
              </p>`,
`                <span>Shop Fees (5%): ₦{digitalProductFees.toLocaleString()}</span>
                <span>Theme Sales: ₦{themeSalesRevenue.toLocaleString()}</span>
                <span>Verification: ₦{verificationEarnings.toLocaleString()}</span>
              </p>`
);

fs.writeFileSync('src/views/AdminDashboard.tsx', content);
