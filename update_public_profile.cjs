const fs = require('fs');
let code = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

// 1. Remove PREMIUM_THEMES import
code = code.replace(/PREMIUM_THEMES\s*,?\s*/g, '');

// 2. Remove renderThemeAnimation entirely
const animStart = code.indexOf('const renderThemeAnimation = () => {');
if (animStart !== -1) {
  let depth = 0;
  let animEnd = -1;
  for (let i = animStart; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        animEnd = i + 1;
        break;
      }
    }
  }
  if (animEnd !== -1) {
    code = code.substring(0, animStart) + code.substring(animEnd);
  }
}

code = code.replace('{renderThemeAnimation()}', '');

// 3. Add getContrastColor helper and update bg/text logic
const constThemeRegex = /const currentTheme = [^;]+;/;
const helperStr = `
  const getContrastColor = (hex) => {
    if (!hex) return 'white';
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    const r = parseInt(hex.slice(0, 2), 16),
          g = parseInt(hex.slice(2, 4), 16),
          b = parseInt(hex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };
  
  const layout = profile?.theme || 'classic';
  const customBg = profile?.bg_color || '#09090b';
  const customText = profile?.bg_color ? getContrastColor(profile.bg_color) : '#ffffff';
  const bgStyle = { backgroundColor: customBg };
  const textStyle = { color: customText };
`;
code = code.replace(constThemeRegex, helperStr);

// Clean up some text color logic
code = code.replace(/text-black dark:text-white dark:text-white/g, 'text-current');
code = code.replace(/text-black dark:text-white/g, 'text-current');
code = code.replace(/!customBg \? currentTheme\.bgClass : ''/g, "''");
code = code.replace(/!customText \? currentTheme\.textClass : ''/g, "''");

// We need to apply layout styles. 
// For minimal layout: remove cover image, use small circular avatar.
const headerSectionStr = `<section className="relative w-full aspect-square md:aspect-[4/5] bg-gray-50 dark:bg-black">`;
const newHeaderSectionStr = `{layout === 'minimal' ? (
          <section className="relative w-full flex flex-col items-center pt-16 pb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-current/10 mb-4">
              <img src={profile?.cover_image_url || coverUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h1 className="font-display text-2xl font-black text-current flex items-center gap-2 px-4 text-center">
                {profile?.full_name || "[Data Placeholder]"}
                {profile?.is_verified && (
                  <svg aria-label="Verified" className="w-[16px] h-[16px] text-[#0095f6]" fill="currentColor" viewBox="0 0 40 40">
                    <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                  </svg>
                )}
            </h1>
            <p className="font-sans text-[14px] opacity-70 font-medium mb-1 px-6">{profile?.headline || ""}</p>
            <p className="font-mono text-[13px] opacity-60 font-bold mb-3 px-6">@{profile?.username || "username"}</p>
          </section>
        ) : layout === 'split' ? (
          <section className="relative w-full flex flex-row items-center pt-16 pb-4 px-6 gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-current/10 shrink-0">
              <img src={profile?.cover_image_url || coverUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="font-display text-xl font-black text-current flex items-center gap-2">
                  {profile?.full_name || "[Data Placeholder]"}
                  {profile?.is_verified && (
                    <svg aria-label="Verified" className="w-[14px] h-[14px] text-[#0095f6]" fill="currentColor" viewBox="0 0 40 40">
                      <path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" fillRule="evenodd"></path>
                    </svg>
                  )}
              </h1>
              <p className="font-sans text-[13px] opacity-70 font-medium mb-1">{profile?.headline || ""}</p>
              <p className="font-mono text-[12px] opacity-60 font-bold mb-2">@{profile?.username || "username"}</p>
            </div>
          </section>
        ) : (
          <section className="relative w-full aspect-square md:aspect-[4/5] bg-black/10">`;

code = code.replace(headerSectionStr, newHeaderSectionStr);
code = code.replace(`          </section>\n          {renderSocialLinks()}`, `          </section>\n          )}\n          {renderSocialLinks()}`);

// For layout of links: classic, bento, carousel.
const linkContainerStr = `<div className="w-full flex flex-col gap-3">`;
const newLinkContainerStr = `<div className={\`w-full \${layout === 'bento' ? 'grid grid-cols-2 gap-3' : layout === 'carousel' ? 'flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4' : 'flex flex-col gap-3'}\`}>`;
code = code.replace(linkContainerStr, newLinkContainerStr);

// Ensure carousel items shrink correctly
code = code.replace(/<a key=\{i\} href=\{href\}/g, `<a key={i} href={href} style={layout === 'carousel' ? { minWidth: '240px', scrollSnapAlign: 'start' } : {}}`);

// Save
fs.writeFileSync('src/views/PublicProfileView.tsx', code);
console.log("Updated PublicProfileView layout handling");
