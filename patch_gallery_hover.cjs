const fs = require('fs');
let content = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf-8');

const targetEffect = `  useEffect(() => {
    const interval = setInterval(() => {
      const gallery = document.getElementById('profile-gallery');
      if (gallery) {
        if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10) {
          gallery.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          gallery.scrollBy({ left: 212, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);`;

const newEffect = `  useEffect(() => {
    const interval = setInterval(() => {
      const gallery = document.getElementById('profile-gallery');
      if (gallery && !gallery.matches(':hover') && !gallery.matches(':active')) {
        if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10) {
          gallery.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          gallery.scrollBy({ left: 212, behavior: 'smooth' });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);`;

if (content.includes(targetEffect)) {
  content = content.replace(targetEffect, newEffect);
  fs.writeFileSync('src/views/PublicProfileView.tsx', content);
  console.log("Patched auto-scroll hover.");
} else {
  console.log("Effect target not found.");
}
