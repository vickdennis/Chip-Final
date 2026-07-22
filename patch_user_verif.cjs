const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

content = content.replace(
  /status: 'completed',\n\s*purchase_type: 'verification'/g,
  `status: 'expires_' + (Date.now() + verificationMonths * 30 * 24 * 60 * 60 * 1000),
                                    purchase_type: 'verification',
                                    seller_id: user.id`
);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
