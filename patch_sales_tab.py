import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

old_code = """        {activeTab === 'notifications' && (
          <AdminNotificationManager />
        )}
      </div>"""

new_code = """        {activeTab === 'notifications' && (
          <AdminNotificationManager />
        )}
        {activeTab === 'sales' && (
          <AdminSalesManager />
        )}
      </div>"""

code = code.replace(old_code, new_code)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Patched AdminDashboard to include AdminSalesManager.")
