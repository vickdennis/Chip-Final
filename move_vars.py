import re

with open('src/views/PublicProfileView.tsx', 'r') as f:
    code = f.read()

# Match the block
block_to_move = """
  const getContrastColor = (hex: string) => {
    if (!hex) return 'white';
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };
  
  const layout = profile?.theme || 'default';
  const customBg = profile?.bg_color || '#09090b';
  const customText = profile?.bg_color ? getContrastColor(profile.bg_color) : '#ffffff';
  const bgStyle = { backgroundColor: customBg };
  const textStyle = { color: customText };
  const cardBgClass = customText === '#000000' ? 'bg-black/5 hover:bg-black/10' : 'bg-white/10 hover:bg-white/20';
  const cardBorderClass = customText === '#000000' ? 'border-black/10' : 'border-white/10';
"""

# Wait, `getContrastColor` might be different in actual code. Let's just use regex.

get_contrast_pattern = r"  const getContrastColor.*?};.*?const cardBorderClass = .*?;"
match = re.search(get_contrast_pattern, code, re.DOTALL)
if match:
    extracted = match.group(0)
    code = code.replace(extracted, "")
    
    # insert before `if (loading)`
    code = code.replace("  if (loading) {", extracted + "\n\n  if (loading) {")

with open('src/views/PublicProfileView.tsx', 'w') as f:
    f.write(code)

print("Moved vars")
