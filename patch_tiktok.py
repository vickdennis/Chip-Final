import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

old_use_effect = """  // TikTok Embed Script loader
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);"""

new_use_effect = """  // TikTok Embed Script loader - Lazy loaded for performance
  useEffect(() => {
    let script: HTMLScriptElement;
    const timer = setTimeout(() => {
      script = document.createElement('script');
      script.src = 'https://www.tiktok.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }, 2500); // 2.5s delay to let first paint happen instantly

    return () => {
      clearTimeout(timer);
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);"""

code = code.replace(old_use_effect, new_use_effect)

with open('src/views/NfcSalesView.tsx', 'w') as f:
    f.write(code)

print("Patched TikTok script.")
