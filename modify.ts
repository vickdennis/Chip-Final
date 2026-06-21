import fs from 'fs';

let content = fs.readFileSync('src/views/LandingView.tsx', 'utf-8');

// Replace standard colors
content = content.replace(/bg-\[#f9f9f9\]/g, 'bg-[#f9f9f9] dark:bg-black');
content = content.replace(/bg-white/g, 'bg-white dark:bg-[#111]');
content = content.replace(/border-\[#e2e2e2\]/g, 'border-[#e2e2e2] dark:border-[#333]');
content = content.replace(/text-black/g, 'text-black dark:text-white');
content = content.replace(/text-\[#4c4546\]/g, 'text-[#4c4546] dark:text-[#a0a0a0]');
content = content.replace(/bg-\[#f3f3f4\]/g, 'bg-[#f3f3f4] dark:bg-[#222]');
content = content.replace(/border-black/g, 'border-black dark:border-white');

// Specific fix for top navigation component dark mode wrapper
content = content.replace(/export default function LandingView\(\{ onNavigate \}: \{ onNavigate: \(view: ViewState\) => void \}\) \{/, `export default function LandingView({ onNavigate }: { onNavigate: (view: ViewState) => void }) {
  const [isDarkMode, setIsDarkMode] = useState(false);`);

content = content.replace(/<div className="min-h-screen flex flex-col bg-\[#f9f9f9\] dark:bg-black">/, `<div className={\`min-h-screen flex flex-col bg-[#f9f9f9] dark:bg-black \${isDarkMode ? 'dark' : ''}\`}>`);

// Add Moon/Sun toggle in the nav area
let buttonIndex = content.indexOf(`          <button 
            onClick={() => onNavigate('login')}
            className="font-mono text-[14px] font-medium text-black dark:text-white hover:opacity-80 transition-opacity hidden md:block px-4 py-2"`);

if (buttonIndex !== -1) {
  content = content.slice(0, buttonIndex) + `<button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white transition-colors">
            {isDarkMode ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
` + content.slice(buttonIndex);
}

// Fix the navbar so it merges correctly and has dark background too:
content = content.replace(/<nav className="flex justify-between items-center px-8 py-4 w-full sticky top-0 z-50 bg-\[#f9f9f9\]\/80 dark:bg-black\/80 backdrop-blur-md border-b border-\[#e2e2e2\] dark:border-\[#333\]">/, `<nav className="flex justify-between items-center px-8 py-4 w-full sticky top-0 z-[100] bg-[#f9f9f9]/80 dark:bg-black/80 backdrop-blur-md border-b border-[#e2e2e2] dark:border-[#333]">`);

fs.writeFileSync('src/views/LandingView.tsx', content);
