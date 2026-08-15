const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const replacement = `            Program Card
          </button>
          <button 
            onClick={() => setActiveTab('buy-nfc')}
            className={\`shrink-0 px-4 sm:px-8 py-3 font-mono text-[13px] font-bold \${activeTab === 'buy-nfc' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'}\`}
          >
            <SmartphoneNfc className="w-4 h-4 inline-block mr-2" />
            Buy NFC Card
          </button>
        </div>`;

content = content.replace(/            Program Card\s*<\/button>\s*<\/div>/, replacement);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
