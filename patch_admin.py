import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# 1. Update newUserForm state
code = code.replace(
    "const [newUserForm, setNewUserForm] = useState({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '' });",
    "const [newUserForm, setNewUserForm] = useState({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });"
)

code = code.replace(
    "setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '' });",
    "setNewUserForm({ email: '', password: '', full_name: '', username: '', headline: '', bio: '', phone_number: '', cover_image_url: '', number_of_accounts: 1 });"
)

# 2. Add number of accounts input
html_to_inject = """                    <div>
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Number of Accounts</label>
                      <input required type="number" min="1" max="100" value={newUserForm.number_of_accounts} onChange={e => setNewUserForm({...newUserForm, number_of_accounts: parseInt(e.target.value) || 1})} className="w-full px-3 py-2 border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 rounded-xl text-[13px] font-sans text-black dark:text-white outline-none focus:border-black dark:focus:border-white" />
                      <p className="text-[10px] text-black/50 dark:text-white/50 mt-1">If >1, it will create alias emails like user+1@email.com</p>
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Email *</label>"""

code = code.replace(
    """                    <div>
                      <label className="block font-mono text-[11px] font-bold text-black/60 dark:text-white/60 uppercase mb-1">Email *</label>""",
    html_to_inject
)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Part 1 Patched")
