import re

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

# Helper to fix class names
def convert_to_template(match):
    inner = match.group(1)
    
    # We replace the hardcoded values with variables
    if 'bg-white' not in inner and 'dark:bg' not in inner:
        return match.group(0)
    
    # Clean up standard classes we want to replace
    inner = inner.replace('bg-white dark:bg-[#1a1c1c]', '${cardBgClass}')
    inner = inner.replace('bg-white dark:bg-[#141414]', '${cardBgClass}')
    inner = inner.replace('border border-gray-200 dark:border-[#2a2a2a]', '${cardBorderClass} border')
    inner = inner.replace('bg-gray-200 dark:bg-[#2a2a2a]', '${cardBgClass}')
    inner = inner.replace('bg-black/10 dark:bg-white/10', '${cardBgClass}')
    inner = inner.replace('bg-white dark:bg-[#fafafa]', '${cardBgClass}')
    
    if '${' in inner:
        # It was converted, we need to wrap it in {} and change "" to ``
        return f"className={{`{inner}`}}"
    else:
        return match.group(0)

# Apply to className="something"
code = re.sub(r'className="([^"]+)"', convert_to_template, code)

# We also need to define cardBgClass and cardBorderClass
definition = """
  const cardBgClass = customText === '#000000' ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20';
  const cardBorderClass = customText === '#000000' ? 'border-black/10' : 'border-white/10';
"""
if 'cardBgClass' not in code:
    code = code.replace('const textStyle = { color: customText };', 'const textStyle = { color: customText };\n' + definition)

with open('src/views/PublicProfileView.tsx', 'w') as f:
    f.write(code)

print("Done")
