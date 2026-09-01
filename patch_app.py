import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace("} else if (view === 'blog-directory') {", "} else if (view === 'nfc-sales') {\n      window.history.pushState({}, '', '/buy-card');\n    } else if (view === 'blog-directory') {")

code = code.replace("{currentView === 'blog-directory' && <BlogDirectoryView onNavigate={handleNavigate} onNavigateToArticle={handleNavigateToArticle} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}", "{currentView === 'blog-directory' && <BlogDirectoryView onNavigate={handleNavigate} onNavigateToArticle={handleNavigateToArticle} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}\n      {currentView === 'nfc-sales' && <NfcSalesView onNavigate={handleNavigate} />}")

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("App.tsx patched.")
