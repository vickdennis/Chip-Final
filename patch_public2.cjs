const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

// 1. Add hasDownloaded state
content = content.replace(
  `const [showQR, setShowQR] = useState(false);`,
  `const [showQR, setShowQR] = useState(false);\n  const [hasDownloaded, setHasDownloaded] = useState(false);`
);

// 2. Change the useEffect
const oldEffect = `  useEffect(() => {
    fetchData().then(() => {
      if (autoDownloadVCard) {
        setTimeout(() => {
          downloadVCard();
        }, 800); // slight delay to ensure profile and images are ready
      }
    });
  }, [username]);`;

const newEffect = `  useEffect(() => {
    fetchData();
  }, [username]);

  useEffect(() => {
    if (autoDownloadVCard && profile && !hasDownloaded) {
      setHasDownloaded(true);
      setTimeout(() => {
        downloadVCard();
      }, 500);
    }
  }, [profile, autoDownloadVCard, hasDownloaded]);`;

if (content.includes(oldEffect)) {
  content = content.replace(oldEffect, newEffect);
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
  console.log("Patched PublicProfileView.tsx successfully");
} else {
  console.log("Could not find the oldEffect in PublicProfileView.tsx");
}
