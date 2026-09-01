import re

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

old_footer_btn = """className={`${cardBgClass} text-current px-6 py-2.5 rounded-full font-mono text-[13px] font-bold shadow-md hover:bg-gray-200 transition-colors mb-2`}>"""
new_footer_btn = """className={`bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full font-mono text-[13px] font-bold shadow-md hover:bg-white/30 transition-colors mb-2`}>"""
code = code.replace(old_footer_btn, new_footer_btn)

with open('src/views/PublicProfileView.tsx', 'w') as f:
    f.write(code)
print("Patched footer.")
