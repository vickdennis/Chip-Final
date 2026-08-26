import re

with open('src/main.tsx', 'r') as f:
    code = f.read()

code = code.replace("import App from './App.tsx';", "import App from './App.tsx';\nimport { HelmetProvider } from 'react-helmet-async';")
code = code.replace("<App />", "<HelmetProvider><App /></HelmetProvider>")

with open('src/main.tsx', 'w') as f:
    f.write(code)

print("Fixed main.tsx")
