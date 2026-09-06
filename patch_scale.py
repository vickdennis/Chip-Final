import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

code = code.replace("<FadeIn delay={0.2} scale={0.9} className=\"relative\">", "<FadeIn delay={0.2} className=\"relative\">")

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Scale patched.")
