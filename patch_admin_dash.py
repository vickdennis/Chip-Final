import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

# Add import
code = code.replace("import AdminNotificationManager from './AdminNotificationManager';", "import AdminNotificationManager from './AdminNotificationManager';\nimport AdminSalesManager from './AdminSalesManager';")

# Update activeTab type and initial state
code = code.replace("useState<'analytics' | 'users' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo' | 'broadcast' | 'notifications'>('analytics')", "useState<'analytics' | 'users' | 'products' | 'blog' | 'leads' | 'buybox' | 'seo' | 'broadcast' | 'notifications' | 'sales'>('analytics')")

# Add the Sales tab button in the modern nav bar
sales_tab = """            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'sales' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'}`}
              onClick={() => setActiveTab('sales')}
            >
              <DollarSign className="w-4 h-4" /> NFC Sales
            </button>
            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'broadcast'"""

code = code.replace("""            <button 
              className={`pb-4 font-semibold text-[14px] transition-all border-b-2 whitespace-nowrap flex items-center gap-1 ${activeTab === 'broadcast'""", sales_tab)

# Render the AdminSalesManager
render_sales = """        {activeTab === 'notifications' && <AdminNotificationManager />}
        {activeTab === 'sales' && <AdminSalesManager />}"""
code = code.replace("{activeTab === 'notifications' && <AdminNotificationManager />}", render_sales)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("AdminDashboard patched.")
