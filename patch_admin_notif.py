import re

with open('src/views/AdminNotificationManager.tsx', 'r') as f:
    code = f.read()

old_catch = """    } catch (e) {
      console.error(e);
      alert("Failed to send notification.");
    }"""
new_catch = """    } catch (e: any) {
      console.error(e);
      alert("Failed to send notification. Error: " + (e.message || String(e)));
    }"""

code = code.replace(old_catch, new_catch)

with open('src/views/AdminNotificationManager.tsx', 'w') as f:
    f.write(code)
print("Patched.")
