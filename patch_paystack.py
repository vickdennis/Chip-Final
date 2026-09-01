import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

code = code.replace("initializePayment(onSuccess, onClose);", "initializePayment({ onSuccess, onClose });")

# Fix ImportMeta issue
code = code.replace("import.meta.env.VITE_PAYSTACK_PUBLIC_KEY", "(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY")

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("NfcSalesView patched.")
