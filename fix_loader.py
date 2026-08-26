import re

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

# Add motion import
code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { motion } from 'motion/react';")

# Find loading block
loading_block_pattern = r"  if \(loading\) \{.*?return \(.*?\);\n  \}"
match = re.search(loading_block_pattern, code, re.DOTALL)

new_loading = """  if (loading) {
    return (
      <div className="dark min-h-screen w-full flex items-center justify-center bg-[#09090b] text-white p-0 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" 
        />
        
        <div className="relative z-10 flex flex-col items-center gap-10">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: 'easeOut' }}
             className="relative"
          >
            <motion.div 
              animate={{ 
                 boxShadow: ['0px 0px 0px rgba(255,255,255,0)', '0px 0px 50px rgba(255,255,255,0.08)', '0px 0px 0px rgba(255,255,255,0)']
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 border border-white/10 bg-white/5 p-5 rounded-[2rem] backdrop-blur-xl flex items-center justify-center"
            >
               <motion.img 
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfMfGw30AK_ubznqFEGAgwiCyiaRj9m4reZICGiUR5WxHaUy8SzdPiuG5buvBu5WeAA9DB0111CklZcTTlQ2ffzcoYwgviMD3gHxBZOKmlT7sVtHT15n3eEE9D6dZdIY2jZVRXWH6thF_rcsUZISiNG0A3D8d4OafozFaTHHwjQDXmtaSWZFHDoh8H0bhPXXn4PYQI7APYWU_vvzbtvxvU0iUv2zWnGvTvI73n1MlLXKIU7YIc5G1LUb6JHI0mPPjJOCIhne8BNGU" 
                  alt="CHIP NG Logo" 
                  className="w-full h-full object-contain filter drop-shadow-xl opacity-90"
               />
            </motion.div>
          </motion.div>
          
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.5, duration: 1 }}
             className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden"
          >
             <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
             />
          </motion.div>
        </div>
      </div>
    );
  }"""

if match:
    code = code.replace(match.group(0), new_loading)
else:
    print("Failed to find loading block!")

with open('src/views/PublicProfileView.tsx', 'w') as f:
    f.write(code)

print("Updated loader")
