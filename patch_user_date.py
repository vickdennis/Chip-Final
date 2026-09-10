import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'new Date((profile.created_at || "").replace(" ", "T") + "Z" || Date.now())',
    'new Date(profile.created_at ? profile.created_at.replace(" ", "T") + "Z" : Date.now())'
)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)

print("Patched UserDashboard Date")
