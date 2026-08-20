const fs = require('fs');

let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const profileLayoutsOld = `export const PROFILE_LAYOUTS = [
  { id: 'classic', name: 'Classic', description: 'Standard vertical layout.' },`;

const profileLayoutsNew = `export const PROFILE_LAYOUTS = [
  { id: 'default', name: 'Default', description: 'The original CHIP NG ambient glow design.' },
  { id: 'classic', name: 'Classic', description: 'Standard vertical layout.' },`;

code = code.replace(profileLayoutsOld, profileLayoutsNew);

const classicActive = `const isActive = profile.theme === layout.id || (layout.id === 'classic' && !profile.theme);`;
const defaultActive = `const isActive = profile.theme === layout.id || (layout.id === 'default' && !profile.theme);`;

code = code.replace(classicActive, defaultActive);

const svgGridOld = `{layout.id === 'classic' && (`;
const svgGridNew = `{layout.id === 'default' && (
                                <svg viewBox="0 0 100 120" className="w-full h-full stroke-current" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="50" cy="50" r="30" className="opacity-20 fill-current" stroke="none" />
                                  <circle cx="50" cy="30" r="12" />
                                  <line x1="30" y1="65" x2="70" y2="65" />
                                  <line x1="30" y1="85" x2="70" y2="85" />
                                </svg>
                              )}
                              {layout.id === 'classic' && (`;

code = code.replace(svgGridOld, svgGridNew);

// Adjust the grid cols to fit 6 instead of 5, or just let it wrap
const gridCols = `grid grid-cols-2 md:grid-cols-5 gap-4`;
const gridColsNew = `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4`;
code = code.replace(gridCols, gridColsNew);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
console.log("Updated UserDashboard.tsx");
