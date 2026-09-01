import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

code = code.replace("2348000000000", "2348100764154")

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("WhatsApp number patched.")
