const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const appearance_h3 = code.indexOf('>Premium Themes & Layouts</h3>');
const appearance_section = code.lastIndexOf('<section', appearance_h3);
const settings_div_start = code.lastIndexOf('<div className="xl:col-span-12 flex flex-col gap-8">', appearance_section);

const logout_code = `
              <section className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex flex-col">
                <div className="p-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-lg text-red-600 dark:text-red-400">Sign Out</h3>
                    <p className="text-[13px] text-red-500/70 dark:text-red-400/70 mt-1">Ready to leave? You can always sign back in.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.reload();
                    }}
                    className="mt-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors text-[14px]"
                  >
                    Log Out of Account
                  </button>
                </div>
              </section>
`;

code = code.substring(0, settings_div_start + '<div className="xl:col-span-12 flex flex-col gap-8">'.length) + logout_code + code.substring(settings_div_start + '<div className="xl:col-span-12 flex flex-col gap-8">'.length);

fs.writeFileSync('src/views/UserDashboard.tsx', code);
console.log('Added logout');
