const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const badLogic2 = `        if (!session && isProtected) {
          return 'login';
        }
        return prev;`;
const goodLogic2 = `        if (!session && isProtected) {
          return 'login';
        } else if (session && prev === 'login') {
          return 'user-dashboard';
        }
        return prev;`;

content = content.replace(badLogic2, goodLogic2);

fs.writeFileSync('src/App.tsx', content);
