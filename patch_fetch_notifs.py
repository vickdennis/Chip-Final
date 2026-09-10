import re

with open('src/views/AdminNotificationManager.tsx', 'r') as f:
    code = f.read()

old_fetch_notifs = """  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/app-updates');
      const data = await res.json();"""

new_fetch_notifs = """  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/app-updates');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();"""

code = code.replace(old_fetch_notifs, new_fetch_notifs)

with open('src/views/AdminNotificationManager.tsx', 'w') as f:
    f.write(code)

print("Patched fetchNotifications.")
