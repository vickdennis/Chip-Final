import re

with open('src/views/AdminNotificationManager.tsx', 'r') as f:
    code = f.read()

old_catch = """      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 100)}...`);
      }"""

new_catch = """      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        throw new Error(`HTTP ${res.status} | Text: ${textResponse.substring(0, 200)}...`);
      }"""

code = code.replace(old_catch, new_catch)

with open('src/views/AdminNotificationManager.tsx', 'w') as f:
    f.write(code)

print("Patched.")
