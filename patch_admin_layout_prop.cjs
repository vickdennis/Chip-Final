const fs = require('fs');
let content = fs.readFileSync('src/components/AdminLayout.tsx', 'utf-8');

// Add hideMobileNav prop
content = content.replace(
  /interface AdminLayoutProps {/,
  `interface AdminLayoutProps {\n  hideMobileNav?: boolean;`
);

content = content.replace(
  /export default function AdminLayout\(\{ children, onNavigate, activePath, isDarkMode, toggleDarkMode \}: AdminLayoutProps\) \{/,
  `export default function AdminLayout({ children, onNavigate, activePath, isDarkMode, toggleDarkMode, hideMobileNav }: AdminLayoutProps) {`
);

content = content.replace(
  /<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/g,
  `{!hideMobileNav && (\n        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white`
);

content = content.replace(
  /<\/span>\n          <\/button>\n        <\/div>\n      <\/nav>/,
  `</span>\n          </button>\n        </div>\n      </nav>\n      )}`
);

fs.writeFileSync('src/components/AdminLayout.tsx', content);
