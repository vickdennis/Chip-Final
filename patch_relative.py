import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        code = f.read()
    
    code = code.replace(
        'className="overflow-hidden w-full select-none z-20 pointer-events-none mt-6 sm:mt-4 md:-mt-5 opacity-50 lg:opacity-60"',
        'className="relative overflow-hidden w-full select-none z-20 pointer-events-none mt-6 sm:mt-4 md:-mt-5 opacity-50 lg:opacity-60"'
    )
    
    with open(filepath, 'w') as f:
        f.write(code)

patch_file('src/views/LandingView.tsx')
patch_file('src/views/NfcSalesView.tsx')
print("Added relative positioning.")
