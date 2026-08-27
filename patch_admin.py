import re

with open('src/views/AdminDashboard.tsx', 'r') as f:
    code = f.read()

if "import AdminNotificationManager from './AdminNotificationManager';" not in code:
    code = code.replace("import AdminBroadcastManager from './AdminBroadcastManager';", "import AdminBroadcastManager from './AdminBroadcastManager';\nimport AdminNotificationManager from './AdminNotificationManager';")

    # Add to activeTab types
    code = code.replace("'leads' | 'buybox' | 'seo' | 'broadcast'>('analytics');", "'leads' | 'buybox' | 'seo' | 'broadcast' | 'notifications'>('analytics');")

    # Add to dropdown list
    dropdown_html = """                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'broadcast' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('broadcast')}
                >
                  <Send className="w-4 h-4" /> Broadcast
                </button>"""
                
    new_dropdown_html = """                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'broadcast' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('broadcast')}
                >
                  <Send className="w-4 h-4" /> Broadcast
                </button>
                <button 
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${activeTab === 'notifications' ? 'bg-black/5 dark:bg-white/5 text-black dark:text-white' : 'text-black/60 dark:text-white/60 hover:text-black hover:bg-black/5 dark:hover:text-white dark:hover:bg-white/5'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="w-4 h-4" /> In-App Notifications
                </button>"""
                
    code = code.replace(dropdown_html, new_dropdown_html)

    # Add Bell icon import
    if "import { MessageCircle, Send, Link as LinkIcon" in code:
        code = code.replace("import { MessageCircle, Send, Link as LinkIcon", "import { MessageCircle, Send, Bell, Link as LinkIcon")

    # Check dropdown group highlight
    code = code.replace("['leads', 'buybox', 'seo', 'broadcast']", "['leads', 'buybox', 'seo', 'broadcast', 'notifications']")

    # Render content
    render_code = """        {activeTab === 'broadcast' && (
          <AdminBroadcastManager />
        )}"""
    
    new_render_code = """        {activeTab === 'broadcast' && (
          <AdminBroadcastManager />
        )}
        {activeTab === 'notifications' && (
          <AdminNotificationManager />
        )}"""
        
    code = code.replace(render_code, new_render_code)

with open('src/views/AdminDashboard.tsx', 'w') as f:
    f.write(code)

print("Updated AdminDashboard.tsx")
