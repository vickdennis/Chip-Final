import re

with open('src/views/UserDashboard.tsx', 'r') as f:
    code = f.read()

old_bell = """          <div className="hidden md:block">
            {NotificationBell()}
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">"""
new_bell = """          <div className="flex flex-wrap gap-3 w-full md:w-auto">"""
code = code.replace(old_bell, new_bell)

with open('src/views/UserDashboard.tsx', 'w') as f:
    f.write(code)
print("Removed redundant NotificationBell.")
