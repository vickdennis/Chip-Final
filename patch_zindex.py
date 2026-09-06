import re

def patch_file(filepath, old_text, new_text):
    with open(filepath, 'r') as f:
        code = f.read()
    
    code = code.replace(old_text, new_text)
    
    with open(filepath, 'w') as f:
        f.write(code)

# LandingView
patch_file(
    'src/views/LandingView.tsx',
    'className="overflow-hidden w-full select-none z-0 mt-6 sm:mt-4 md:-mt-5 opacity-25 lg:opacity-30"',
    'className="overflow-hidden w-full select-none z-20 pointer-events-none mt-6 sm:mt-4 md:-mt-5 opacity-50 lg:opacity-60"'
)

# NfcSalesView
patch_file(
    'src/views/NfcSalesView.tsx',
    'className="overflow-hidden w-full select-none z-0 mt-6 sm:mt-4 md:-mt-5 opacity-25 lg:opacity-30"',
    'className="overflow-hidden w-full select-none z-20 pointer-events-none mt-6 sm:mt-4 md:-mt-5 opacity-50 lg:opacity-60"'
)

print("Patched z-index in both files.")
