const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');
content = content.replace(`    document.body.removeChild(a);
  };


  return (`, `    document.body.removeChild(a);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] dark:bg-black text-[#1a1c1c] dark:text-white font-sans flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/40 dark:text-white/40" />
      </div>
    );
  }

  return (`);
fs.writeFileSync('src/views/UserDashboard.tsx', content);
