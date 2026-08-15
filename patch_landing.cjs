const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

// Update function signature
content = content.replace(
  'export default function LandingView({ onNavigate, isDarkMode, toggleDarkMode }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void }) {',
  'export default function LandingView({ onNavigate, isDarkMode, toggleDarkMode, session }: { onNavigate: (view: ViewState) => void, isDarkMode: boolean, toggleDarkMode: () => void, session?: any }) {'
);

// Update instances of Login button
content = content.replace(/<button \n              onClick=\{.*?\}\n              className="text-xs sm:text-sm md:text-lg lg:text-\[1\.4rem\] font-medium uppercase tracking-wider text-black dark:text-white bg-white\/10 px-4 py-1\.5 rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer border border-white\/20"\n            >\n              Login\n            <\/button>/g, `<button 
              onClick={() => onNavigate(session ? 'user-dashboard' : 'login')}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-black dark:text-white bg-white/10 px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer border border-white/20"
            >
              {session ? 'Dashboard' : 'Login'}
            </button>`);

// ContactButton occurrences
content = content.replace(/<ContactButton onClick=\{.*?\} \/>/g, `<ContactButton onClick={() => onNavigate(session ? 'user-dashboard' : 'login')} text={session ? 'Dashboard' : 'Login'} />`);

// ContactButton component definition
content = content.replace(
  'const ContactButton = ({ onClick }: { onClick: () => void }) => {',
  'const ContactButton = ({ onClick, text = "Login" }: { onClick: () => void, text?: string }) => {'
);
content = content.replace(
  '<span className="relative z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-white uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 block group-hover:-translate-y-10 transition-transform duration-500">\n          Login\n        </span>',
  '<span className="relative z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-white uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 block group-hover:-translate-y-10 transition-transform duration-500">\n          {text}\n        </span>'
);
content = content.replace(
  '<span className="absolute inset-0 z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 flex items-center justify-center translate-y-10 group-hover:translate-y-0 transition-transform duration-500">\n          Login\n        </span>',
  '<span className="absolute inset-0 z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 flex items-center justify-center translate-y-10 group-hover:translate-y-0 transition-transform duration-500">\n          {text}\n        </span>'
);

content = content.replace(
  '<button onClick={() => onNavigate(\'login\')} className="w-full py-3 bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-white hover:text-black transition-all font-mono text-[12px] font-bold rounded-full cursor-pointer">\n                Get Free Account\n              </button>',
  '<button onClick={() => onNavigate(session ? \'user-dashboard\' : \'login\')} className="w-full py-3 bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-white hover:text-black transition-all font-mono text-[12px] font-bold rounded-full cursor-pointer">\n                {session ? \'Go to Dashboard\' : \'Get Free Account\'}\n              </button>'
);

content = content.replace(
  '<button onClick={() => onNavigate(\'login\')} className="w-full py-3 bg-[#B600A8] text-black dark:text-white hover:bg-[#a10095] transition-all font-mono text-[12px] font-bold rounded-full cursor-pointer">\n                Go Pro Now\n              </button>',
  '<button onClick={() => onNavigate(session ? \'user-dashboard\' : \'login\')} className="w-full py-3 bg-[#B600A8] text-black dark:text-white hover:bg-[#a10095] transition-all font-mono text-[12px] font-bold rounded-full cursor-pointer">\n                {session ? \'Go to Dashboard\' : \'Go Pro Now\'}\n              </button>'
);

fs.writeFileSync('src/views/LandingView.tsx', content);
