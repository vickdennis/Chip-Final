import re

with open('index.html', 'r') as f:
    code = f.read()

# Add Paystack preconnect right after existing preconnects
code = code.replace(
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link rel="preconnect" href="https://js.paystack.co" />'
)

with open('index.html', 'w') as f:
    f.write(code)

print("index.html patched with Paystack preconnect.")
