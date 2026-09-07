import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

old_checkout_header = """            <h2 className="text-2xl font-bold mb-2">Complete Your Order</h2>
            <p className="text-white/60 text-sm mb-6">
              You selected the {selectedCard === 'black' ? 'Black' : 'White'} Edition Card (₦{selectedCard === 'black' ? '35,000' : '30,000'}).
            </p>"""

new_checkout_header = """            <h2 className="text-2xl font-bold mb-2">Complete Your Order</h2>
            <p className="text-white/60 text-sm mb-4">Choose your preferred card edition below.</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['black', 'white'].map((type) => (
                <div 
                  key={type}
                  onClick={() => setSelectedCard(type as 'black' | 'white')}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedCard === type 
                      ? 'border-[#B600A8] bg-[#B600A8]/10' 
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white text-sm capitalize">{type} Edition</h4>
                    {selectedCard === type && <BadgeCheck className="text-[#B600A8] w-5 h-5 shrink-0" />}
                  </div>
                  <p className="text-white/60 text-xs">₦{type === 'black' ? '35,000' : '30,000'}</p>
                </div>
              ))}
            </div>"""

code = code.replace(old_checkout_header, new_checkout_header)

old_submit = """              <button 
                type="submit"
                className="w-full py-4 mt-2 rounded-xl font-bold text-lg bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Pay ₦{selectedCard === 'black' ? '35,000' : '30,000'} Now
              </button>
            </form>"""

new_submit = """              <button 
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

code = code.replace(old_submit, new_submit)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched Checkout.")
