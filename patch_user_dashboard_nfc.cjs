const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const importOld = "Activity, Wallet, Camera, AlertTriangle, X } from 'lucide-react';";
const importNew = "Activity, Wallet, Camera, AlertTriangle, X, SmartphoneNfc } from 'lucide-react';";
code = code.replace(importOld, importNew);

const stateOld = "const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'social' | 'shop' | 'appearance'>('profile');";
const stateNew = "const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'social' | 'shop' | 'appearance' | 'nfc'>('profile');";
code = code.replace(stateOld, stateNew);

const tabsOld = `<button 
            onClick={() => setActiveTab('appearance')}
            className={\`px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'appearance' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white'}\`}
          >
            Appearance
          </button>`;
const tabsNew = `<button 
            onClick={() => setActiveTab('appearance')}
            className={\`px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'appearance' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white'}\`}
          >
            Appearance
          </button>
          <button 
            onClick={() => setActiveTab('nfc')}
            className={\`px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'nfc' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-[#7e7576] hover:text-black dark:hover:text-white'}\`}
          >
            <SmartphoneNfc className="w-4 h-4 inline-block mr-2" />
            Program Card
          </button>`;
code = code.replace(tabsOld, tabsNew);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
