import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    'Premium NFC Cards',
    'Welcome to chipng'
)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched text.")
