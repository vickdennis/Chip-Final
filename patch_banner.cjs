const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const targetBanner = `{completionRate < 100 && !setupGuideActive && (
          <div className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2 w-full md:w-auto flex-1 max-w-xl">
              <h3 className="font-bold text-black dark:text-white text-lg">Account Setup Guide</h3>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: \`\${completionRate}%\` }}></div>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">{completionRate}% Complete. Let's finish setting up your public profile step-by-step.</p>
            </div>
            <button 
              onClick={() => {
                const firstIncomplete = setupSteps.find(s => !s.completed) || setupSteps[0];
                setSetupStep(firstIncomplete.id);
                setActiveTab(firstIncomplete.tab as any);
                setSetupGuideActive(true);
              }}
              className="shrink-0 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-black/80 dark:hover:bg-white/80 transition-colors shadow-lg"
            >
              Start Setup Guide
            </button>
          </div>
        )}`;

const insertBanner = `{completionRate < 100 && (
          <div className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-2 w-full md:w-auto flex-1 max-w-xl">
              <h3 className="font-bold text-black dark:text-white text-lg">Account Setup Guide</h3>
              <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: \`\${completionRate}%\` }}></div>
              </div>
              <p className="text-sm text-black/60 dark:text-white/60">{completionRate}% Complete. Let's finish setting up your public profile step-by-step.</p>
            </div>
            <button 
              onClick={() => {
                if (setupGuideActive) {
                  setSetupGuideActive(false);
                } else {
                  const firstIncomplete = setupSteps.find(s => !s.completed) || setupSteps[0];
                  setSetupStep(firstIncomplete.id);
                  setActiveTab(firstIncomplete.tab as any);
                  setSetupGuideActive(true);
                }
              }}
              className="shrink-0 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-black/80 dark:hover:bg-white/80 transition-colors shadow-lg"
            >
              {setupGuideActive ? "Close Guide" : "Start Setup Guide"}
            </button>
          </div>
        )}`;

if (content.includes(targetBanner)) {
  content = content.replace(targetBanner, insertBanner);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log("Patched banner visibility.");
} else {
  console.log("Banner target not found.");
}
