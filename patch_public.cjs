const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

// 1. Update props signature
content = content.replace(
  `export default function PublicProfileView({ onNavigate, username }: { onNavigate?: (view: ViewState) => void, username?: string | null }) {`,
  `export default function PublicProfileView({ onNavigate, username, autoDownloadVCard }: { onNavigate?: (view: ViewState) => void, username?: string | null, autoDownloadVCard?: boolean }) {`
);

// 2. Add effect for autoDownloadVCard
content = content.replace(
  `  useEffect(() => {
    fetchData();
  }, [username]);`,
  `  useEffect(() => {
    fetchData().then(() => {
      if (autoDownloadVCard) {
        setTimeout(() => {
          downloadVCard();
        }, 800); // slight delay to ensure profile and images are ready
      }
    });
  }, [username]);`
);

fs.writeFileSync('src/views/PublicProfileView.tsx', content);
console.log('PublicProfileView.tsx patched');
