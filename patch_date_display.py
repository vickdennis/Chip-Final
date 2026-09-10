import re

with open('src/views/AdminNotificationManager.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    '{new Date(n.created_at).toLocaleDateString()}',
    '{new Date(n.created_at.replace(" ", "T") + "Z").toLocaleDateString()}'
)

with open('src/views/AdminNotificationManager.tsx', 'w') as f:
    f.write(code)

with open('src/views/UserDashboard.tsx', 'r') as f:
    code2 = f.read()

code2 = code2.replace(
    'new Date(profile.created_at || Date.now())',
    'new Date((profile.created_at || "").replace(" ", "T") + "Z" || Date.now())'
)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code2)

print("Patched date displays.")
