import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

sticky_cta = """
      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 md:hidden flex items-center justify-between animate-in slide-in-from-bottom-full duration-300">
        <div className="flex flex-col">
          <span className="text-white font-bold text-lg">₦35,000 / ₦30,000</span>
          <span className="text-white/60 text-xs">Free Profile included</span>
        </div>
        <button 
          onClick={() => {
            const pricing = document.getElementById('pricing');
            pricing?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white font-bold px-6 py-3 rounded-full text-sm shadow-[0_0_20px_rgba(182,0,168,0.4)] active:scale-95 transition-transform"
        >
          Order Now
        </button>
      </div>
    </div>
  );
}"""

code = code.replace("    </div>\n  );\n}", sticky_cta)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched sticky CTA.")
