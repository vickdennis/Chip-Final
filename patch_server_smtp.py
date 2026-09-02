import re

with open('server.ts', 'r') as f:
    code = f.read()

old_smtp = """        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: true,
          auth: {"""

new_smtp = """        const port = parseInt(process.env.SMTP_PORT || '587');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: port,
          secure: port === 465,
          auth: {"""

code = code.replace(old_smtp, new_smtp)

with open('server.ts', 'w') as f:
    f.write(code)

print("SMTP patched.")
