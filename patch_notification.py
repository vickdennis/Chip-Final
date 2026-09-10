import re

with open('src/views/AdminNotificationManager.tsx', 'r') as f:
    code = f.read()

old_fetch = """      const res = await fetch('/api/app-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      });
      const data = await res.json();"""

new_fetch = """      const res = await fetch('/api/app-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message })
      });
      
      let data;
      const textResponse = await res.text();
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }
"""

code = code.replace(old_fetch, new_fetch)

with open('src/views/AdminNotificationManager.tsx', 'w') as f:
    f.write(code)

print("Patched handleSend.")
