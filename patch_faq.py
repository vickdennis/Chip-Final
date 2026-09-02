import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

# 1. Update imports
code = code.replace(
    "import { ChevronRight, Shield, Zap, RefreshCw, Star, ArrowRight } from 'lucide-react';",
    "import { ChevronRight, Shield, Zap, RefreshCw, Star, ArrowRight, HelpCircle, MessageCircle, Mail, MapPin } from 'lucide-react';"
)

# 2. Insert FAQ and Contact section
faq_section = """      {/* FAQ & Contact Section */}
      <section className="py-24 px-6 bg-white/5 border-y border-white/10 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-[#B600A8]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          {/* FAQ */}
          <div className="flex flex-col">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-8 leading-tight">Frequently Asked<br/>Questions</h2>
            <div className="flex flex-col gap-4">
              {[
                { q: "Does the receiver need an app?", a: "No! Your NFC card works seamlessly with any modern smartphone (iOS and Android). Just tap it to the back of their phone, and your profile instantly opens in their browser." },
                { q: "Can I update my details after printing?", a: "Yes. Your card links to your dynamic digital profile. You can change your phone number, social links, or job title anytime without needing a new card." },
                { q: "How do I submit my custom design?", a: "After completing your purchase, you will be redirected to our WhatsApp where you can send us your logo, name, and preferred design details for printing." },
                { q: "Do you deliver nationwide?", a: "Yes! We offer nationwide delivery across Nigeria. Delivery timelines usually range from 2 to 5 business days depending on your location." }
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-2xl bg-black border border-white/10 hover:border-white/30 transition-colors group">
                  <h3 className="text-lg md:text-xl font-bold mb-3 flex items-start gap-3">
                    <HelpCircle className="w-6 h-6 text-[#B600A8] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-white/60 leading-relaxed pl-9">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col">
            <h2 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">Get In Touch</h2>
            <p className="text-lg text-white/70 mb-10">
              Have a special request, bulk corporate order, or need help with your design? We are here to assist you 24/7.
            </p>
            <div className="flex flex-col gap-5">
              <a href="https://wa.me/2348100764154" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-black to-white/5 border border-white/10 hover:border-[#25D366]/50 hover:shadow-[0_0_30px_rgba(37,211,102,0.15)] transition-all group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-7 h-7 text-[#25D366]" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-bold mb-1">WhatsApp Support</div>
                  <div className="text-xl md:text-2xl font-bold text-white group-hover:text-[#25D366] transition-colors">+234 810 076 4154</div>
                </div>
              </a>
              
              <a href="mailto:support@chip.ng" className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-black to-white/5 border border-white/10 hover:border-[#B600A8]/50 hover:shadow-[0_0_30px_rgba(182,0,168,0.15)] transition-all group cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-[#B600A8]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7 text-[#B600A8]" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-bold mb-1">Email Us</div>
                  <div className="text-xl md:text-2xl font-bold text-white group-hover:text-[#B600A8] transition-colors">support@chip.ng</div>
                </div>
              </a>
              
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-gradient-to-r from-black to-white/5 border border-white/10 group hover:border-blue-500/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <div className="text-xs text-white/50 uppercase tracking-wider font-bold mb-1">Office Location</div>
                  <div className="text-xl md:text-2xl font-bold text-white">Lagos, Nigeria</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Video / Final CTA */}"""

code = code.replace("      {/* Third Video / Final CTA */}", faq_section)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("FAQ patched.")
