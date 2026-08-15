const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const badLogic = `      } else {
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          username: user.email?.split('@')[0] || '',
          headline: '',
          bio: '',
          contact_email: '',
          phone_number: '',
          address: '',
          booking_provider: 'Calendly (Integrated)',
          calendar_link: '',
          show_availability: true,
          show_total_followers: false,
          social_links_style: 'inline',
          is_verified: false,
          is_admin: false
        });
      }`;

const goodLogic = `      } else {
        const initialProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          username: (user.email?.split('@')[0] || '').replace(/[^a-z0-9_.-]/g, '').toLowerCase() || 'user' + Math.floor(Math.random()*1000),
          headline: '',
          bio: '',
          contact_email: user.email || '',
          phone_number: '',
          address: '',
          booking_provider: 'Calendly (Integrated)',
          calendar_link: '',
          show_availability: true,
          show_total_followers: false,
          social_links_style: 'inline',
          is_verified: false,
          is_admin: false,
          cover_image_url: 'https://oxrzkdzcagvmgfuthyjd.supabase.co/storage/v1/object/public/covers/0.8384244203439832.jpeg'
        };
        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert(initialProfile).select().single();
        if (newProfile) {
          setProfile({ ...newProfile, email: user.email });
        } else {
          setProfile({ ...initialProfile, email: user.email });
        }
      }`;

if (content.includes(badLogic)) {
  content = content.replace(badLogic, goodLogic);
  fs.writeFileSync('src/views/UserDashboard.tsx', content);
  console.log("Successfully patched UserDashboard.tsx");
} else {
  console.log("Failed to find badLogic in UserDashboard.tsx");
}
