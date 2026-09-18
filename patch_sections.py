import re

with open('src/views/LandingView.tsx', 'r') as f:
    code = f.read()

# Make sure AutoSlidingMedia is imported
if "import { AutoSlidingMedia }" not in code:
    code = code.replace(
        "import { CreditCard, ",
        "import { AutoSlidingMedia } from '../components/AutoSlidingMedia';\nimport { CreditCard, "
    )

# 1. Swap sections
analytics_start = code.find("{/* REALTIME ANALYTICS SHOWCASE SECTION */}")
digital_store_start = code.find("{/* DIGITAL PRODUCT STOREFRONT SHOWCASE SECTION */}")
nfc_store_start = code.find("{/* BRANDING SHOP & NFC CARDS SECTION")
footer_start = code.find("{/* 6. FOOTER */}")

if analytics_start != -1 and digital_store_start != -1 and nfc_store_start != -1 and footer_start != -1:
    analytics_section = code[analytics_start:digital_store_start]
    digital_and_nfc_sections = code[digital_store_start:footer_start]
    
    # We want: 
    # digital_and_nfc_sections
    # analytics_section
    # footer_start
    
    new_order = digital_and_nfc_sections + analytics_section
    code = code[:analytics_start] + new_order + code[footer_start:]

# 2. Update media display logic to use AutoSlidingMedia
old_media_logic = """                    {(() => {
                      let media = [];
                      try {
                        media = JSON.parse(p.image_url);
                        if (!Array.isArray(media)) media = p.image_url ? [p.image_url] : [];
                      } catch {
                        media = p.image_url ? [p.image_url] : [];
                      }
                      
                      if (media.length === 0) {
                        return (
                          <div className="absolute inset-0 flex items-center justify-center text-black/20 dark:text-white/20">
                            <CreditCard className="w-12 h-12 stroke-[1.5]" />
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                          {media.map((url: string, i: number) => (
                            <div key={i} className="w-full h-full flex-shrink-0 snap-center relative">
                              {url.match(/\\.(mp4|webm)$/i) ? (
                                <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <img src={url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}"""

new_media_logic = """                    {(() => {
                      let media = [];
                      try {
                        media = JSON.parse(p.image_url);
                        if (!Array.isArray(media)) media = p.image_url ? [p.image_url] : [];
                      } catch {
                        media = p.image_url ? [p.image_url] : [];
                      }
                      return <AutoSlidingMedia mediaUrls={media} productName={p.name} />;
                    })()}"""

code = code.replace(old_media_logic, new_media_logic)

with open('src/views/LandingView.tsx', 'w') as f:
    f.write(code)

print("Sections Swapped & AutoSlidingMedia Injected")
