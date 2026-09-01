import re

with open('src/views/LandingView.tsx', 'r') as f:
    code = f.read()

nav_patch = """            <button 
              onClick={() => onNavigate('nfc-sales')}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#B600A8] dark:text-[#B600A8] hover:opacity-70 transition-opacity duration-200 cursor-pointer animate-pulse"
            >
              Buy NFC Card
            </button>
            <button 
              onClick={() => scrollToSection(faqRef)}"""

code = code.replace("            <button \n              onClick={() => scrollToSection(faqRef)}", nav_patch)

with open('src/views/LandingView.tsx', 'w') as f:
    f.write(code)

print("Nav patched.")
