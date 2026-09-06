import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        code = f.read()
    
    code = code.replace(
        'className="absolute top-0 left-0 w-full select-none z-20 pointer-events-none opacity-50 lg:opacity-60"',
        'className="absolute -top-4 md:top-0 left-0 w-full select-none z-20 pointer-events-none opacity-50 lg:opacity-60"'
    )
    
    with open(filepath, 'w') as f:
        f.write(code)

patch_file('src/views/LandingView.tsx')
patch_file('src/views/NfcSalesView.tsx')
print("Patched title to -top-4 md:top-0.")
