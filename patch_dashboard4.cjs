const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const replacement = `      )}
      
      {setupGuideActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-[0_10_40px_rgba(0,0,0,0.3)] z-50 flex flex-col sm:flex-row items-center gap-6 border border-white/20 dark:border-black/20 min-w-[300px] sm:min-w-[500px] max-w-[90vw] animate-in slide-in-from-bottom-10">
          <div className="flex-1 flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 mb-1">Step {setupStep} of {setupSteps.length}</span>
            <span className="font-bold text-lg">{setupSteps.find(s => s.id === setupStep)?.name}</span>
            <span className="text-sm opacity-80 mt-1 leading-snug">
              {setupStep === 1 && "Add your full name, headline, and bio in the Profile Identity section."}
              {setupStep === 2 && "Add your email and phone numbers so people can easily contact you."}
              {setupStep === 3 && "Scroll down to add your social media profiles."}
              {setupStep === 4 && "Add featured custom links to your best content or products."}
              {setupStep === 5 && "Choose a premium theme or set custom colors for your profile."}
            </span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button 
              onClick={() => setSetupGuideActive(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-white/20 dark:border-black/20 hover:bg-white/10 dark:hover:bg-black/10 transition-colors text-[13px] font-bold"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                if (setupStep < setupSteps.length) {
                  const nextStep = setupSteps[setupStep];
                  setSetupStep(nextStep.id);
                  setActiveTab(nextStep.tab);
                  
                  // Auto-scroll slightly to help find it
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setSetupGuideActive(false);
                  alert("🎉 Setup Complete! Your public profile is ready to share.");
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-black text-black dark:text-white rounded-xl font-bold hover:opacity-90 transition-opacity text-[13px]"
            >
              {setupStep < setupSteps.length ? "Next Step" : "Finish Setup"}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}`;

content = content.replace(/      \)}[\r\n\s]*<\/AdminLayout>[\r\n\s]*\);[\r\n\s]*\}/g, replacement);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
console.log("Patched end of file.");
