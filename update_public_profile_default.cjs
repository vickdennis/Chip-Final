const fs = require('fs');

let code = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const oldAnimationMarker = `{/* Theme Relating Animation Layer */}`;
const newAnimationLayer = `{/* Theme Relating Animation Layer */}
        {layout === 'default' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-luminosity">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[60px] animate-pulse" style={{ backgroundColor: customText, opacity: 0.08 }}></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/3 w-1 h-1 rounded-full animate-ping [animation-duration:4s]" style={{ backgroundColor: customText }}></div>
              <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full animate-ping [animation-duration:6s]" style={{ backgroundColor: customText }}></div>
              <div className="absolute top-3/4 left-1/4 w-0.5 h-0.5 rounded-full animate-ping [animation-duration:8s]" style={{ backgroundColor: customText }}></div>
              <div className="absolute top-1/3 left-3/4 w-1 h-1 rounded-full animate-ping [animation-duration:5s]" style={{ backgroundColor: customText }}></div>
            </div>
          </div>
        )}`;

code = code.replace(oldAnimationMarker, newAnimationLayer);

// Also we need to make sure layout defaults to 'default' instead of 'classic'
code = code.replace("const layout = profile?.theme || 'classic';", "const layout = profile?.theme || 'default';");

fs.writeFileSync('src/views/PublicProfileView.tsx', code);
console.log("Added default layout to PublicProfileView");
