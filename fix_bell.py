with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace('<NotificationBell />', '{NotificationBell()}')

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)
print("Fixed NotificationBell calls")
