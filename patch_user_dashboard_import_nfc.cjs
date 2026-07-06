const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const importOld = "import { SOCIAL_PLATFORMS } from './UserDashboard';"; // Actually SOCIAL_PLATFORMS is in UserDashboard. Let's find something else.
const importBefore = "export const SOCIAL_PLATFORMS";
const importNfc = "import NfcProgrammer from '../components/NfcProgrammer';\n";

if(!code.includes('import NfcProgrammer')) {
  code = code.replace(importBefore, importNfc + "\n" + importBefore);
}

const renderOld = `) : profile && activeTab === 'appearance' ? (`;
const renderNew = `) : profile && activeTab === 'nfc' ? (
          <NfcProgrammer profile={profile} />
        ) : profile && activeTab === 'appearance' ? (`;

code = code.replace(renderOld, renderNew);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
