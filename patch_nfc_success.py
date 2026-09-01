import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

old_success = """  const onSuccess = (reference: any) => {
    setShowCheckout(false);
    setPaymentSuccess(reference);
  };"""

new_success = """  const onSuccess = async (reference: any) => {
    setShowCheckout(false);
    setPaymentSuccess(reference);
    
    // Save to database
    try {
      await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          card_type: selectedCard === 'black' ? 'Black Edition' : 'White Edition',
          amount: selectedCard === 'black' ? 3500000 : 3000000,
          payment_reference: reference.reference
        })
      });
    } catch (e) {
      console.error("Failed to save sale to db", e);
    }
  };"""

code = code.replace(old_success, new_success)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("NfcSalesView patched.")
