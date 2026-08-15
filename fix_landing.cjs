const fs = require('fs');
let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

content = content.replace(
  'const ContactButton = ({ onClick }: { onClick?: () => void }) => (',
  'const ContactButton = ({ onClick, text = "Login" }: { onClick?: () => void, text?: string }) => ('
);

content = content.replace(
  '<span className="relative z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-white uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 block group-hover:-translate-y-10 transition-transform duration-500">\n          Login\n        </span>',
  '<span className="relative z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-white uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 block group-hover:-translate-y-10 transition-transform duration-500">\n          {text}\n        </span>'
);
content = content.replace(
  '<span className="absolute inset-0 z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 flex items-center justify-center translate-y-10 group-hover:translate-y-0 transition-transform duration-500">\n          Login\n        </span>',
  '<span className="absolute inset-0 z-10 font-mono text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] font-bold text-black uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis px-1 flex items-center justify-center translate-y-10 group-hover:translate-y-0 transition-transform duration-500">\n          {text}\n        </span>'
);

fs.writeFileSync('src/views/LandingView.tsx', content);
