import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "import { ChevronRight, Shield, Zap, RefreshCw, Star, ArrowRight, HelpCircle, MessageCircle, Mail, MapPin } from 'lucide-react';",
    "import { ChevronRight, Shield, Zap, RefreshCw, Star, ArrowRight, HelpCircle, MessageCircle, Mail, MapPin, BadgeCheck, Smartphone, CheckCircle2 } from 'lucide-react';"
)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched imports.")
