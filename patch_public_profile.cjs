const fs = require('fs');
let file = 'src/views/PublicProfileView.tsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = `import { ArrowLeft, Share, ShieldCheck, Mail, MapPin, Phone, MessageCircle, ChevronDown, Check, Zap, SmartphoneNfc } from 'lucide-react';`;
const importReplacement = `import { ArrowLeft, Share, ShieldCheck, Mail, MapPin, Phone, MessageCircle, ChevronDown, Check, Zap, SmartphoneNfc, ChevronLeft, ChevronRight } from 'lucide-react';`;
content = content.replace(importTarget, importReplacement);

const stateTarget = `  const [profile, setProfile] = useState<any>(null);`;
const stateReplacement = `  const [profile, setProfile] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);`;
content = content.replace(stateTarget, stateReplacement);

const fetchTarget = `      if (profileData) {`;
const fetchReplacement = `      const galRes = await fetch('/api/gallery/' + targetUserId);
      if (galRes.ok) {
        const galData = await galRes.json();
        setGalleryImages(galData);
      }
      if (profileData) {`;
content = content.replace(fetchTarget, fetchReplacement);

const autoSlideEffect = `
  useEffect(() => {
    if (galleryImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentGalleryIndex(prev => (prev + 1) % galleryImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [galleryImages]);
`;
content = content.replace('  useEffect(() => {', autoSlideEffect + '\n  useEffect(() => {');

const galleryUI = `
              {galleryImages.length > 0 && (
                <div className="w-full bg-[#1a1a1a] rounded-xl overflow-hidden mt-6 shadow-lg border border-[#2a2a2a] relative">
                  <div className="relative w-full aspect-[4/3] flex items-center justify-center">
                    {galleryImages.map((img, idx) => (
                      <div
                        key={idx}
                        className={\`absolute inset-0 transition-opacity duration-1000 \${idx === currentGalleryIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}\`}
                      >
                        <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    
                    {galleryImages.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => { e.preventDefault(); setCurrentGalleryIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center z-20 hover:bg-black/70 backdrop-blur-md"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); setCurrentGalleryIndex(prev => (prev + 1) % galleryImages.length); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center z-20 hover:bg-black/70 backdrop-blur-md"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                          {galleryImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.preventDefault(); setCurrentGalleryIndex(idx); }}
                              className={\`w-2 h-2 rounded-full transition-all \${idx === currentGalleryIndex ? 'bg-white scale-125' : 'bg-white/50'}\`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
`;

content = content.replace(`                </div>
              </a>

              {profile?.phone_number && (`, `                </div>
              </a>` + galleryUI + `\n\n              {profile?.phone_number && (`);

fs.writeFileSync(file, content);
