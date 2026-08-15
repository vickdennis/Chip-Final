const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const replacement = `        ) : profile && activeTab === 'buy-nfc' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 flex flex-col gap-8">
              <section className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl flex flex-col">
                <div className="border-b border-black/10 dark:border-white/10 p-5 flex justify-between items-center bg-[#f9f9f9] dark:bg-[#1a1a1a]">
                  <h3 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest">Order NFC Card</h3>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <div>
                    <label className="block text-sm font-bold text-black dark:text-white mb-2">Select Card Type</label>
                    <select
                      className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white [&>option]:text-black [&>option]:dark:text-black"
                      value={selectedNfcCard?.id || ''}
                      onChange={(e) => {
                        const card = shopProducts.find(p => p.id === e.target.value);
                        setSelectedNfcCard(card || null);
                      }}
                    >
                      <option value="">-- Choose a Card --</option>
                      {shopProducts.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} - ₦{Number(p.price).toLocaleString()}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedNfcCard && (
                    <div className="flex gap-4 items-center bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/10 dark:border-white/10">
                      {selectedNfcCard.image_url ? (
                        <img src={selectedNfcCard.image_url} alt={selectedNfcCard.name} className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <div className="w-20 h-20 bg-black/10 dark:bg-white/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-black/40 dark:text-white/40" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg text-black dark:text-white">{selectedNfcCard.name}</h4>
                        <p className="text-sm text-black/60 dark:text-white/60 mb-1">{selectedNfcCard.description}</p>
                        <p className="font-mono font-bold text-[#B600A8]">₦{Number(selectedNfcCard.price).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={checkoutName} 
                        onChange={e => setCheckoutName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-black dark:text-white mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        value={checkoutPhone} 
                        onChange={e => setCheckoutPhone(e.target.value)}
                        placeholder="08012345678"
                        className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-black dark:text-white mb-2">Delivery Address</label>
                    <textarea 
                      value={checkoutAddress} 
                      onChange={e => setCheckoutAddress(e.target.value)}
                      placeholder="Enter full delivery address"
                      rows={3}
                      className="w-full p-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-black dark:text-white focus:outline-none resize-none"
                    />
                  </div>

                  <PaystackButton
                    reference={\`SHOP_\${Math.random().toString(36).substring(2, 10).toUpperCase()}\`}
                    email={profile.contact_email || profile.email || 'user@example.com'}
                    amount={Math.round(Number(selectedNfcCard?.price || 0) * 100)}
                    publicKey={(import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_98c73643bf533425b945bb3c328918539f3100ca'}
                    text="Proceed to Payment"
                    onSuccess={async (response) => {
                      try {
                        await supabase.from('purchases').insert({
                          product_id: selectedNfcCard.id,
                          seller_id: null,
                          buyer_email: checkoutName || profile.email || 'Guest',
                          amount: selectedNfcCard.price,
                          platform_fee: selectedNfcCard.price * 0.05,
                          net_earnings: selectedNfcCard.price * 0.95,
                          reference: response.reference,
                          status: 'success'
                        });
                        alert('Payment complete! We will process your NFC card order shortly.');
                        
                        const message = \`*New NFC Card Order from \${checkoutName} (\${checkoutPhone})*\\n\\n*Item:* \${selectedNfcCard.name} (₦\${Number(selectedNfcCard.price).toLocaleString()})\\n*Delivery Address:* \${checkoutAddress}\\n*Reference:* \${response.reference}\`;
                        const waUrl = \`https://wa.me/2348100764154?text=\${encodeURIComponent(message)}\`;
                        window.open(waUrl, '_blank');
                        
                        setSelectedNfcCard(null);
                        setCheckoutName('');
                        setCheckoutPhone('');
                        setCheckoutAddress('');
                      } catch(err) {
                        console.error(err);
                        alert('Error processing purchase.');
                      }
                    }}
                    onClose={() => {}}
                    className="w-full bg-[#B600A8] hover:bg-[#a10095] text-white transition-colors font-mono text-[14px] font-bold py-3.5 rounded-xl flex items-center justify-center cursor-pointer text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedNfcCard || !checkoutName || !checkoutPhone || !checkoutAddress}
                  />
                </div>
              </section>
            </div>
            
            {/* Right Column */}
            <div className="xl:col-span-4 flex flex-col gap-8">
              <section className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl flex flex-col p-6 text-center items-center">
                <SmartphoneNfc className="w-12 h-12 text-[#B600A8] mb-4" />
                <h3 className="font-bold text-lg text-black dark:text-white mb-2">Smart Business Cards</h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Tap your CHIP NG card against any modern smartphone to instantly share your digital profile. No app required.
                </p>
              </section>
            </div>
          </div>
        ) : profile && activeTab === 'appearance' ? (`;

content = content.replace(/        \) : profile && activeTab === 'appearance' \? \(/, replacement);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
