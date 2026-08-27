with open('src/components/AdminLayout.tsx', 'r') as f:
    code = f.read()

import_replacement = """import { 
  MemoryStick, 
  LayoutDashboard, 
  Users, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';"""

new_import = """import { 
  MemoryStick, 
  LayoutDashboard, 
  Users, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';"""

if "topRightContent?: React.ReactNode" not in code:
    code = code.replace("interface AdminLayoutProps {", "interface AdminLayoutProps {\n  topRightContent?: React.ReactNode;")
    code = code.replace("isDarkMode, toggleDarkMode, hideMobileNav }: AdminLayoutProps) {", "isDarkMode, toggleDarkMode, hideMobileNav, topRightContent }: AdminLayoutProps) {")

    # Mobile Header
    mobile_header = """          <button onClick={toggleDarkMode} className="p-2 -mr-2 rounded-full text-black/60 dark:text-white/60 active:bg-black/5 dark:active:bg-white/5">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>"""
    new_mobile_header = """          <div className="flex items-center gap-2">
            {topRightContent}
            <button onClick={toggleDarkMode} className="p-2 -mr-2 rounded-full text-black/60 dark:text-white/60 active:bg-black/5 dark:active:bg-white/5">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>"""
    code = code.replace(mobile_header, new_mobile_header)

    # Desktop Header
    desktop_header = """        <div className="px-4 py-2">"""
    # Wait, desktop layout does not have a top header. It just has a sidebar.
    # We can put topRightContent in a fixed absolute positioned div for desktop?
    # Or in the sidebar? The prompt says "top right corner of the screen"
    
with open('src/components/AdminLayout.tsx', 'w') as f:
    f.write(code)
print("Updated AdminLayout.tsx")
