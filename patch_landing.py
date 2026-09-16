import re

with open('src/views/LandingView.tsx', 'r') as f:
    code = f.read()

old_block = """                  <div className="aspect-square bg-black/5 dark:bg-white/5 rounded-xl relative overflow-hidden mb-4 border border-black/5 dark:border-white/5">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-black/20 dark:text-white/20">
                        <CreditCard className="w-12 h-12 stroke-[1.5]" />
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-2 right-2 bg-black/40 dark:bg-black/80 backdrop-blur-md text-black dark:text-[#D7E2EA] font-mono text-[10px] tracking-wider px-2 py-1 rounded-2xl border border-black/10 dark:border-white/10">
                      INSTANT SETUP
                    </div>
                  </div>"""

new_block = """                  <div className="aspect-square bg-black/5 dark:bg-white/5 rounded-xl relative overflow-hidden mb-4 border border-black/5 dark:border-white/5">
                    {(() => {
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
                    })()}
                    {/* Badge */}
                    <div className="absolute top-2 right-2 bg-black/40 dark:bg-black/80 backdrop-blur-md text-black dark:text-[#D7E2EA] font-mono text-[10px] tracking-wider px-2 py-1 rounded-2xl border border-black/10 dark:border-white/10 z-10 pointer-events-none">
                      INSTANT SETUP
                    </div>
                  </div>"""

code = code.replace(old_block, new_block)

with open('src/views/LandingView.tsx', 'w') as f:
    f.write(code)

print("LandingView Patched")
