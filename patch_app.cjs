const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add autoDownloadVCard state
content = content.replace(
  'const [blogSlug, setBlogSlug] = useState<string | null>(() => {',
  `const [autoDownloadVCard, setAutoDownloadVCard] = useState<boolean>(() => {
    return window.location.pathname.endsWith('/vcard') || window.location.pathname.endsWith('/vcard/');
  });
  
  const [blogSlug, setBlogSlug] = useState<string | null>(() => {`
);

// 2. Strip /vcard from username
content = content.replace(
  /let username = decodeURIComponent\(path\.slice\(1\)\)\.trim\(\);\n\s*if \(username\.startsWith\('@'\)\) username = username\.slice\(1\);\n\s*return username;/g,
  `let username = decodeURIComponent(path.slice(1)).trim();
        if (username.endsWith('/vcard')) username = username.replace(/\\/vcard$/, '');
        if (username.startsWith('@')) username = username.slice(1);
        return username;`
);
content = content.replace(
  /let username = path\.slice\(1\)\.trim\(\);\n\s*if \(username\.startsWith\('@'\)\) username = username\.slice\(1\);\n\s*return username;/g,
  `let username = path.slice(1).trim();
        if (username.endsWith('/vcard')) username = username.replace(/\\/vcard$/, '');
        if (username.startsWith('@')) username = username.slice(1);
        return username;`
);

// 3. Pass autoDownloadVCard to PublicProfileView
content = content.replace(
  /<PublicProfileView onNavigate=\{handleNavigate\} username=\{publicUsername\} \/>/g,
  `<PublicProfileView onNavigate={handleNavigate} username={publicUsername} autoDownloadVCard={autoDownloadVCard} />`
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx patched');
