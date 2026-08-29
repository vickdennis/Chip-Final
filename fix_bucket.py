import re

with open('src/views/AdminBlogManager.tsx', 'r') as f:
    code = f.read()

code = code.replace(".from('blog')", ".from('covers')")
code = code.replace("`blog/", "`blog/") # just keep the path as blog/ file, but in covers bucket

with open('src/views/AdminBlogManager.tsx', 'w') as f:
    f.write(code)

print("Updated bucket to covers")
