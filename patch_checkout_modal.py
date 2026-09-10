import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

old_checkout = """              <div className="bg-[#B600A8]/10 border border-[#B600A8]/30 rounded-xl p-4 mt-2">
                <p className="text-xs text-[#B600A8] font-medium text-center">
                  After payment, you will be automatically redirected to our WhatsApp to upload your logo and design for printing.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 mt-2 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Pay ₦{selectedCard === 'black' ? '35,000' : '30,000'} Now
              </button>
              
              <div className="flex flex-col gap-2 mt-3 items-center justify-center">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Shield className="w-3 h-3" /> Secure Paystack Checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Fast 2-5 Day Nationwide Delivery
                </div>
              </div>
            </form>"""

new_checkout = """              <div className="bg-[#B600A8]/10 border border-[#B600A8]/30 rounded-xl p-4 mt-2 mb-1">
                <p className="text-xs text-[#B600A8] font-medium text-center">
                  After payment, you will be automatically redirected to our WhatsApp to upload your logo and design for printing.
                </p>
              </div>
              
              <ul className="flex flex-col gap-2 mb-2 text-[13px] font-medium text-white/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> 
                  <span>No app required. Works with all Apple and Android devices.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> 
                  <span>📦 Fast 2-5 Day Nationwide Delivery</span>
                </li>
              </ul>

              <button 
                type="submit"
                className="w-full py-4 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Pay ₦{selectedCard === 'black' ? '35,000' : '30,000'} Now
              </button>
              
              <div className="flex flex-col items-center justify-center mt-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-center gap-5 text-white/70 grayscale opacity-80 mb-2">
                  {/* Paystack Logo Mock */}
                  <div className="flex items-center gap-1 font-bold text-[15px]">
                    <div className="w-4 h-4 rounded-sm bg-[#0CA6F0] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                    </div>
                    paystack
                  </div>
                  {/* DHL */}
                  <div className="font-black text-lg text-[#D40511] italic tracking-tighter">DHL</div>
                  {/* GIG */}
                  <div className="font-black text-sm text-[#E31837] flex items-baseline">GIG<span className="font-semibold text-[10px] tracking-tight ml-0.5">Logistics</span></div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  <Shield className="w-3 h-3" /> 100% Secure Checkout
                </div>
              </div>
            </form>"""

code = code.replace(old_checkout, new_checkout)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched Checkout Modal.")
