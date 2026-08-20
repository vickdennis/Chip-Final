import sys

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

# Replace hardcoded dark mode colors with translucent colors based on text color

# For buttons:
code = code.replace(
    'bg-white dark:bg-[#1a1c1c] text-current',
    '${customText === \'#000000\' ? \'bg-black/5 border border-black/10\' : \'bg-white/10 border border-white/10\'} text-current'
)

code = code.replace(
    'bg-white dark:bg-[#1a1c1c]',
    '${customText === \'#000000\' ? \'bg-black/5 border border-black/10\' : \'bg-white/10 border border-white/10\'}'
)

code = code.replace(
    'bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#2a2a2a]',
    '${customText === \'#000000\' ? \'bg-black/5 border-black/10\' : \'bg-white/5 border-white/10\'} border'
)

# Fix double borders if any
code = code.replace('border border border-black/10', 'border border-black/10')
code = code.replace('border border border-white/10', 'border border-white/10')

# Also in the file, some classNames are static strings, we need to convert them to template literals
# For example: className="bg-white dark:bg-[#1a1c1c] text-current font-mono..." 
# We can't just string-replace because if they are inside double quotes, it breaks.
