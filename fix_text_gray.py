import re

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

code = code.replace('text-[#505050]', 'opacity-60')
code = code.replace('text-[#a0a0a0]', 'opacity-60')

with open('src/views/PublicProfileView.tsx', 'w') as f:
    f.write(code)

print("Done text replace")
