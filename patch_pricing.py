import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

old_pricing_header = """          <h2 className="text-4xl md:text-6xl font-display font-black mb-6">Choose Your Style</h2>
          <p className="text-xl text-white/60">One-time payment. No hidden fees. Custom printed with your logo or name.</p>
        </div>"""

new_pricing_header = """          <h2 className="text-4xl md:text-6xl font-display font-black mb-6">Choose Your Style</h2>
          <p className="text-xl text-white/60 mb-4">One-time payment. No hidden fees. Custom printed with your logo or name.</p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-white/70">
            <div className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-[#B600A8]" /> Works with iOS & Android</div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-green-500" /> No App Required</div>
          </div>
        </div>"""

code = code.replace(old_pricing_header, new_pricing_header)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched pricing header.")
