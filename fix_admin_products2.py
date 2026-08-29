import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# Replace products fetch to only get global products
code = code.replace("const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false });", "const { data: productsData } = await supabase.from('products').select('*').is('profile_id', null).order('created_at', { ascending: false });")

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Fixed admin products fetch")
