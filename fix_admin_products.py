import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# Replace profile_id: currentUserId with profile_id: null
code = code.replace("profile_id: currentUserId,\n      name: prodForm.name,", "profile_id: null,\n      name: prodForm.name,")

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Fixed admin products to be global")
