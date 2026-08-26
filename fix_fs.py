with open('server.ts', 'r') as f:
    code = f.read()

if "import fs from 'fs';" not in code:
    code = "import fs from 'fs';\n" + code

code = code.replace("const fs = require('fs');\n  const path = require('path');\n  ", "")

with open('server.ts', 'w') as f:
    f.write(code)
print("Fixed fs")
