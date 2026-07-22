const fs = require('fs');
let content = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// add verificationMonths state
content = content.replace(
  "const [profile, setProfile] = useState<any>(null);",
  "const [profile, setProfile] = useState<any>(null);\n  const [verificationMonths, setVerificationMonths] = useState(1);"
);

content = content.replace(
  /<div className="flex items-center justify-between p-4 bg-\[#f9f9f9\] dark:bg-\[#1a1a1a\] border border-black\/10 dark:border-white\/10 rounded-xl">\s*<div>\s*<h4 className="font-mono text-\[13px\] font-bold text-black dark:text-white uppercase tracking-widest mb-1">Verification Badge<\/h4>\s*<p className="text-\[13px\] text-black\/60 dark:text-white\/60">Get verified for ₦3,000\/month<\/p>\s*<\/div>\s*<div>\s*\{profile\.is_verified \? \(\s*<button/m,
  `<div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#f9f9f9] dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl gap-4">
                      <div>
                        <h4 className="font-mono text-[13px] font-bold text-black dark:text-white uppercase tracking-widest mb-1">Verification Badge</h4>
                        <p className="text-[13px] text-black/60 dark:text-white/60">Get verified for ₦3,000/month</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {!profile.is_verified && (
                          <select 
                            value={verificationMonths}
                            onChange={(e) => setVerificationMonths(Number(e.target.value))}
                            className="px-3 py-2 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-xl focus:border-black dark:focus:border-white outline-none font-mono text-[12px] text-black dark:text-white"
                          >
                            <option value={1}>1 Month (₦3,000)</option>
                            <option value={3}>3 Months (₦9,000)</option>
                            <option value={6}>6 Months (₦18,000)</option>
                            <option value={12}>12 Months (₦36,000)</option>
                          </select>
                        )}
                        {profile.is_verified ? (
                          <button`
);

content = content.replace(
  /amount=\{3000 \* 100\}/,
  `amount={3000 * verificationMonths * 100}`
);

content = content.replace(
  /amount: 3000,\s*platform_fee: 3000,/,
  `amount: 3000 * verificationMonths,
                                    platform_fee: 3000 * verificationMonths,`
);

fs.writeFileSync('src/views/UserDashboard.tsx', content);
