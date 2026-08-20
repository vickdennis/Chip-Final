const fs = require('fs');
let code = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

// Remove the old duplicate declarations
code = code.replace(/const customBg = profile\?\.bg_color;\s*const customText = profile\?\.text_color;\s*const bgStyle = customBg \? \{ backgroundColor: customBg \} : \{\};\s*const textStyle = customText \? \{ color: customText \} : \{\};/s, '');

// Fix the renderSocialLinks closing bracket issue
code = code.replace(/\s*\)\}\s*\{renderSocialLinks\(\)\}/, `
          )}
          {renderSocialLinks()}`);

// Fix style overrides (merging the style tags)
code = code.replace(/<a key=\{i\} href=\{href\} style=\{layout === 'carousel' \? \{ minWidth: '240px', scrollSnapAlign: 'start' \} : \{\}\} target="_blank" rel="noopener noreferrer"\s*className="([^"]+)"\s*style=\{\{([^}]+)\}\}/g, 
  `<a key={i} href={href} target="_blank" rel="noopener noreferrer" className="$1" style={{ $2, ...(layout === 'carousel' ? { minWidth: '240px', scrollSnapAlign: 'start' } : {}) }}`);
  
fs.writeFileSync('src/views/PublicProfileView.tsx', code);
console.log("Fixed syntax");
