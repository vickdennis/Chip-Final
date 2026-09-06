import re

with open('src/views/NfcSalesView.tsx', 'r') as f:
    code = f.read()

# Add FadeIn and LinkMeMotionGraphics imports if not present
imports_to_add = """
import { LinkMeMotionGraphics } from '../components/LinkMeMotionGraphics';
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  as?: string;
  key?: any;
}
const FadeIn = ({ children, delay = 0, duration = 0.7, x = 0, y = 30, className = '', as = 'div' }: FadeInProps) => {
  const Tag = (motion as any)[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ delay, duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </Tag>
  );
};
"""

if "LinkMeMotionGraphics" not in code:
    code = code.replace("export default function NfcSalesView", imports_to_add + "\nexport default function NfcSalesView")

# We will replace the NavBar and Hero Section with the one adapted from LandingView.
# First, let's identify the old code to replace.
old_hero_start = "{/* Navbar */}"
old_hero_end = "{/* Social Proof / Second TikTok */}"

# Extract everything from old_hero_start up to old_hero_end
pattern = re.compile(re.escape(old_hero_start) + r'.*?' + re.escape(old_hero_end), re.DOTALL)

new_hero = """{/* 1. HERO SECTION (Identical to Landing Page) */}
      <section className="min-h-screen lg:h-screen flex flex-col justify-between overflow-hidden relative z-20 px-6 md:px-10 pb-10 bg-[#0C0C0C]">
        
        {/* Navbar */}
        <FadeIn y={-20} delay={0} className="w-full flex justify-between items-center pt-6 md:pt-8 z-50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate && onNavigate('landing')}>
            <span className="font-sans font-black tracking-tighter text-lg md:text-2xl text-white uppercase">
              CHIP<span className="text-[#B600A8]">NG</span>
            </span>
          </div>
          <div className="flex gap-6 sm:gap-10 items-center justify-end">
            <button 
              onClick={() => {
                const pricing = document.getElementById('pricing');
                pricing?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm md:text-lg lg:text-[1.4rem] font-medium uppercase tracking-wider text-[#B600A8] hover:opacity-70 transition-opacity duration-200 cursor-pointer animate-pulse"
            >
              Order Now
            </button>
            <a 
              href="https://wa.me/2348100764154" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/40 transition-colors border border-[#25D366]/50"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </a>
          </div>
        </FadeIn>

        {/* Hero Heading Section */}
        <div className="w-full flex-1 flex flex-col justify-center relative mt-6 md:mt-0 py-8 lg:py-0">
          
          {/* Centered Dynamic LinkMe Motion Graphics System */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <FadeIn y={30} delay={0.4} duration={0.9} className="w-full">
              <LinkMeMotionGraphics />
            </FadeIn>
          </div>

          {/* Massively Scaled Title (Z-0) */}
          <div className="overflow-hidden w-full select-none z-0 mt-6 sm:mt-4 md:-mt-5 opacity-25 lg:opacity-30">
            <FadeIn y={40} delay={0.15}>
              <h1 className="hero-heading font-sans font-black uppercase tracking-tight leading-none text-center text-[11vw] sm:text-[12vw] md:text-[13vw] lg:text-[14vw] xl:text-[15vw] w-full block text-white">
                Premium NFC Cards
              </h1>
            </FadeIn>
          </div>
        </div>

        {/* Bottom Bar Section */}
        <div className="w-full flex justify-between items-end gap-4 relative z-20 pb-4 sm:pb-6 md:pb-10">
          
          <FadeIn y={20} delay={0.35} className="flex-1 max-w-[160px] sm:max-w-[220px] md:max-w-[260px]">
            <p className="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug text-left text-[11px] sm:text-xs md:text-sm lg:text-base">
              a 3d business card known for creating unforgettable connections
            </p>
          </FadeIn>
          
          <FadeIn y={20} delay={0.5}>
            <button 
              onClick={() => {
                const pricing = document.getElementById('pricing');
                pricing?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1',
                outline: '2px solid white',
                outlineOffset: '-3px'
              }}
              className="rounded-full px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-[11px] sm:text-[12px] md:text-sm font-semibold uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Yours
            </button>
          </FadeIn>
        </div>
      </section>

      {/* Intro Video / Explanation */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden min-h-screen flex items-center bg-black">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B600A8]/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
          <FadeIn y={30} className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-mono tracking-wide uppercase text-white">The Future of Networking</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-display font-black leading-[1.1] tracking-tight text-white">
              One Tap.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B600A8] to-orange-400">
                Infinite Impressions.
              </span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-lg">
              Stop handing out paper cards that end up in the trash. Upgrade to a premium, custom-designed NFC plastic card that instantly shares your digital profile, contact info, and social links with a single tap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="bg-gradient-to-r from-[#B600A8] to-[#7621B0] text-white font-bold px-8 py-4 rounded-full text-lg shadow-[0_0_40px_rgba(182,0,168,0.4)] hover:shadow-[0_0_60px_rgba(182,0,168,0.6)] transition-all flex items-center justify-center gap-2">
                Order Your Card Now <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-10 h-10 rounded-full border-2 border-black" />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-400">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-sm text-white/60">Trusted by 5,000+ Professionals</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} scale={0.9} className="relative">
            {/* TikTok Embed 1 */}
            <div className="w-full max-w-[340px] mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-[#B600A8]/20 border border-white/10 bg-black">
              <blockquote className="tiktok-embed" cite="https://www.tiktok.com/@chipng_nfc/video/7628228439719398664" data-video-id="7628228439719398664" style={{ maxWidth: '605px', minWidth: '325px', margin: 0 }}>
                <section></section>
              </blockquote>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Social Proof / Second TikTok */}"""

if pattern.search(code):
    code = pattern.sub(new_hero, code)
    with open('src/views/NfcSalesView.tsx', 'w') as f:
        f.write(code)
    print("NfcSalesView patched.")
else:
    print("Could not find the replace block.")
