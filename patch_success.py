import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

# Add a state for successful payment
code = code.replace("const [showCheckout, setShowCheckout] = useState(false);", "const [showCheckout, setShowCheckout] = useState(false);\n  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);")

# Update onSuccess
old_success = """  const onSuccess = (reference: any) => {
    // Redirect to WhatsApp
    const message = `Hello! I just paid for my ${selectedCard === 'black' ? 'Black' : 'White'} NFC Card.\\n\\nMy Name: ${name}\\nEmail: ${email}\\nPayment Ref: ${reference.reference}\\n\\nI would like to upload my card design now.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/2348100764154?text=${encodedMessage}`; // Replace with actual number if needed, or leave dummy for now
    window.location.href = whatsappUrl;
  };"""

new_success = """  const onSuccess = (reference: any) => {
    setShowCheckout(false);
    setPaymentSuccess(reference);
  };"""
code = code.replace(old_success, new_success)

# Add Success Modal JSX right before the end of the return statement
success_modal_jsx = """      {paymentSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-green-500/30 rounded-3xl p-8 w-full max-w-md text-center relative"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-3xl font-display font-bold mb-4 text-green-500">Payment Successful!</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Thank you for your order. Your payment reference is <span className="font-mono text-white bg-white/10 px-2 py-1 rounded">{paymentSuccess.reference}</span>.
              <br /><br />
              <strong>Next Step:</strong> Please click the button below to send us a message on WhatsApp. You can upload your logo or card design there so we can start printing immediately.
            </p>
            <a 
              href={`https://wa.me/2348100764154?text=${encodeURIComponent(`Hello! I just paid for my ${selectedCard === 'black' ? 'Black' : 'White'} NFC Card.\n\nMy Name: ${name}\nEmail: ${email}\nPayment Ref: ${paymentSuccess.reference}\n\nI would like to upload my card design now.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl font-bold text-lg bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors flex items-center justify-center gap-2"
            >
              Send Design via WhatsApp
            </a>
          </motion.div>
        </div>
      )}
"""

code = code.replace("    </div>\n  );\n}", success_modal_jsx + "    </div>\n  );\n}")

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Success modal patched.")
