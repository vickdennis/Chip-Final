import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

if "import { motion } from 'motion/react';" not in code and "import { motion" not in code:
    code = "import { motion } from 'motion/react';\n" + code

nav_block_pattern = r"{/\* Mobile Custom Nav Bar \*/}.*?</nav>"
# We need to use DOTALL to match across lines
nav_match = re.search(nav_block_pattern, code, re.DOTALL)

new_nav = """{/* Mobile Custom Nav Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-0">
          <div className="relative bg-white dark:bg-[#0a0a0a] h-[72px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[24px] flex items-center px-2">
            
            <motion.div 
              className="absolute top-0 left-2 h-full flex justify-center pointer-events-none z-10"
              style={{ width: `calc((100% - 16px) / 5)` }}
              initial={false}
              animate={{ 
                x: `${['analytics', 'social', 'profile', 'ebooks', 'settings'].indexOf(activeTab as string) * 100}%` 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
               <svg width="104" height="32" viewBox="0 0 104 32" className="absolute top-0 left-1/2 -translate-x-1/2 text-[#f9f9f9] dark:text-black fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 0 0 C 20 0, 24 32, 52 32 C 80 32, 84 0, 104 0 Z" />
               </svg>

               <div className="absolute top-[-24px] w-[48px] h-[48px] bg-white dark:bg-[#0a0a0a] rounded-full flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-white/5" />
            </motion.div>

            {[
              { id: 'analytics', label: 'Analytics', icon: Activity },
              { id: 'social', label: 'Socials', icon: Share },
              { id: 'profile', label: 'Profile', icon: UserCircle },
              { id: 'ebooks', label: 'Ebooks', icon: Wallet },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="relative flex-1 h-full flex flex-col items-center justify-center z-20 outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                   <motion.div
                     animate={{ 
                       y: isActive ? -36 : 0,
                       scale: isActive ? 1.1 : 1
                     }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                     className={`absolute flex items-center justify-center ${isActive ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/40'}`}
                   >
                     <Icon className="w-6 h-6" />
                   </motion.div>
                   
                   <motion.span 
                     animate={{ 
                       opacity: isActive ? 0 : 1,
                       y: isActive ? 10 : 20,
                       scale: isActive ? 0.8 : 1
                     }}
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                     className="absolute font-semibold text-[10px] text-black/50 dark:text-white/50"
                   >
                     {tab.label}
                   </motion.span>
                </button>
              )
            })}
          </div>
        </nav>"""

if nav_match:
    code = code.replace(nav_match.group(0), new_nav)
else:
    print("Could not find nav block")

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Updated nav in UserDashboard.tsx")
