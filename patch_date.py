import re

with open('src/views/AdminBroadcastManager.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'const date = new Date(dateString);',
    'const date = new Date(dateString.endsWith("Z") ? dateString : dateString.replace(" ", "T") + "Z");'
)

with open('src/views/AdminBroadcastManager.tsx', 'w') as f:
    f.write(code)

print("Patched date parsing in AdminBroadcastManager.")
