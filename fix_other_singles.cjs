const fs = require('fs');
let admin = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');
admin = admin.replace(".eq('id', user.id).single()", ".eq('id', user.id).maybeSingle()");
fs.writeFileSync('src/views/AdminDashboard.tsx', admin);

let enterprise = fs.readFileSync('src/views/EnterpriseDashboard.tsx', 'utf8');
enterprise = enterprise.replace("eq('id', user.id).single()", "eq('id', user.id).maybeSingle()");
enterprise = enterprise.replace("eq('id', userProfile.enterprise_id).single()", "eq('id', userProfile.enterprise_id).maybeSingle()");
fs.writeFileSync('src/views/EnterpriseDashboard.tsx', enterprise);
