import re

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

# 1. Update the main container's inline style
old_container_style = """      <div 
        className={`w-full min-h-screen sm:min-h-0 sm:h-[780px] md:h-[820px] sm:w-[420px] md:w-[450px] sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.85)] sm:border sm:border-neutral-800/80 overflow-y-auto scrollbar-hide relative flex flex-col ${''} ${''}`} 
        style={{ ...bgStyle, ...textStyle }}
      >"""
new_container_style = """      <div 
        className={`w-full min-h-screen sm:min-h-0 sm:h-[780px] md:h-[820px] sm:w-[420px] md:w-[450px] sm:rounded-[36px] sm:shadow-[0_25px_60px_rgba(0,0,0,0.85)] sm:border sm:border-neutral-800/80 overflow-y-auto scrollbar-hide relative flex flex-col ${''} ${''}`} 
        style={{ backgroundColor: '#09090b', color: '#ffffff' }}
      >"""
code = code.replace(old_container_style, new_container_style)

# 2. Fix the top buttons
old_bio_btn = """              className={`${cardBgClass} text-current font-mono text-[11px] uppercase font-bold px-4 py-2 rounded-full shadow-lg hover:bg-[#f3f3f4] transition-colors flex items-center gap-2`}"""
new_bio_btn = """              className={`bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] uppercase font-bold px-4 py-2 rounded-full shadow-lg transition-colors flex items-center gap-2`}"""
code = code.replace(old_bio_btn, new_bio_btn)

old_dash_btn = """                className={`${cardBgClass} backdrop-blur-md text-current border border-black/20 dark:border-white/20 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm hover:${cardBgClass}/20 transition-colors`}"""
new_dash_btn = """                className={`bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-mono text-[11px] uppercase font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors`}"""
code = code.replace(old_dash_btn, new_dash_btn)

# 3. Fix the "Theme Relating Animation Layer" (if customBg is applied there)
# Actually, the dark overlay uses `bg-white/40 dark:bg-black/40`, which is fine, 
# but wait! The gradient on the cover image uses `customBg` which is now only for the bottom section.
old_gradient = """            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${customBg} 0%, ${customBg}66 50%, transparent 100%)` }}></div>"""
new_gradient = """            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #09090b 0%, #09090b66 50%, transparent 100%)` }}></div>"""
code = code.replace(old_gradient, new_gradient)

# 4. Wrap everything below the bio in a new section with customBg
old_section_split = """            </div>

            {/* Contact/Connect Action Strip */}"""
new_section_split = """            </div>
          </section>

          <section className="w-full flex-1 flex flex-col items-center pt-8 pb-8 px-6 rounded-t-[40px] z-10" style={{ ...bgStyle, ...textStyle }}>
            {/* Contact/Connect Action Strip */}"""
code = code.replace(old_section_split, new_section_split)

with open('src/views/PublicProfileView.tsx', 'w') as f:
    f.write(code)
print("Applied Python patch.")
