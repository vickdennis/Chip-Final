import re

files = [
    'server.ts',
    'src/views/UserDashboard.tsx',
    'src/views/AdminNotificationManager.tsx'
]

for file in files:
    with open(file, 'r') as f:
        code = f.read()
    
    code = code.replace("'/api/notifications'", "'/api/app-updates'")
    
    with open(file, 'w') as f:
        f.write(code)
    
    print(f"Patched {file}")
