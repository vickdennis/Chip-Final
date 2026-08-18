const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

code = code.replace(
  /<NfcProgrammer profile={profile} \/>/,
  `</div>\n          <NfcProgrammer profile={profile} />`
);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
