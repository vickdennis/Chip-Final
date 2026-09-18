import re

with open('src/App.tsx', 'r') as f:
    code = f.read()

# 1. Imports
if "PrivacyPolicyView" not in code:
    code = code.replace(
        "import NfcSalesView from './views/NfcSalesView';",
        "import NfcSalesView from './views/NfcSalesView';\nimport PrivacyPolicyView from './views/PrivacyPolicyView';\nimport TermsOfServiceView from './views/TermsOfServiceView';"
    )

# 2. ViewState
code = code.replace(
    "export type ViewState = 'landing' | 'login' | 'user-dashboard' | 'public-profile' | 'admin-dashboard' | 'enterprise-dashboard' | 'blog-directory' | 'blog-article' | 'nfc-sales';",
    "export type ViewState = 'landing' | 'login' | 'user-dashboard' | 'public-profile' | 'admin-dashboard' | 'enterprise-dashboard' | 'blog-directory' | 'blog-article' | 'nfc-sales' | 'privacy-policy' | 'terms-of-service';"
)

# 3. Initial state routing
code = code.replace(
    "if (path === '/buy-card') return 'nfc-sales';",
    "if (path === '/buy-card') return 'nfc-sales';\n    if (path === '/privacy-policy') return 'privacy-policy';\n    if (path === '/terms-of-service') return 'terms-of-service';"
)

# 4. handleNavigate
code = code.replace(
    "} else if (view === 'blog-directory') {",
    "} else if (view === 'privacy-policy') {\n      window.history.pushState({}, '', '/privacy-policy');\n    } else if (view === 'terms-of-service') {\n      window.history.pushState({}, '', '/terms-of-service');\n    } else if (view === 'blog-directory') {"
)

# 5. JSX
jsx_insert = """      {currentView === 'blog-article' && <BlogArticleView onNavigate={handleNavigate} slug={blogSlug!} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {currentView === 'privacy-policy' && <PrivacyPolicyView onNavigate={handleNavigate} isDarkMode={isDarkMode} />}
      {currentView === 'terms-of-service' && <TermsOfServiceView onNavigate={handleNavigate} isDarkMode={isDarkMode} />}"""
code = code.replace(
    "{currentView === 'blog-article' && <BlogArticleView onNavigate={handleNavigate} slug={blogSlug!} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}",
    jsx_insert
)

with open('src/App.tsx', 'w') as f:
    f.write(code)

print("App Patched")
