with open('server.ts', 'r') as f:
    code = f.read()

code = code.replace(r"<\\/title>", r"<\/title>")
code = code.replace(r"\\s*", r"\s*")
code = code.replace(r"\\/?>", r"\/?>")
code = code.replace(r"\\/vcard", r"\/vcard")

with open('server.ts', 'w') as f:
    f.write(code)

print("Fixed regex")
