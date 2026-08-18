const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// The user wants these specific tabs in the UserDashboard mobile nav bar: 
// Analytics, Socials, Profile, Ebooks, Settings.
// We should remove the top segmented tabs entirely and use the AdminLayout for the sidebar, 
// BUT we also need the bottom nav for the UserDashboard tabs on mobile!
// This means AdminLayout's bottom nav is NOT suitable for the UserDashboard sub-tabs,
// OR we replace the AdminLayout bottom nav with these when in UserDashboard.
// The easiest approach is to hide the segmented tabs on mobile, and add a custom bottom nav just for UserDashboard!
