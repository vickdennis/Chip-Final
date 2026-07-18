const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');
content = content.replace(
`                            onSuccess={async (ref) => {
                              setProfile({ ...profile, is_verified: true });
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) {
                                await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
                              }
                              alert('Payment successful! You are now verified.');
                            }}`,
`                            onSuccess={async (ref) => {
                              setProfile({ ...profile, is_verified: true });
                              const { data: { user } } = await supabase.auth.getUser();
                              if (user) {
                                await supabase.from('profiles').update({ is_verified: true }).eq('id', user.id);
                                try {
                                  await supabase.from('purchases').insert([{
                                    buyer_email: profile.contact_email || profile.email || 'user@example.com',
                                    amount: 3000,
                                    platform_fee: 3000,
                                    net_earnings: 0,
                                    reference: ref.reference || ('VERIFY_' + Math.random().toString(36).substring(2, 10).toUpperCase()),
                                    status: 'completed',
                                    purchase_type: 'verification'
                                  }]);
                                } catch (e) {
                                  console.error("Failed to record verification purchase", e);
                                }
                              }
                              alert('Payment successful! You are now verified.');
                            }}`
);
fs.writeFileSync('src/views/UserDashboard.tsx', content);
