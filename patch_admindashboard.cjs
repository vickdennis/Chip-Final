const fs = require('fs');
let file = 'src/views/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetAnalyticsEnd = `            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col items-center justify-center text-center">
              <Eye className="w-8 h-8 text-white/40 mb-3" />
              <h3 className="font-mono text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Blog Views</h3>
              <p className="text-4xl font-sans font-bold">{blogViews}</p>
              <p className="text-[12px] text-white/40 mt-2 font-mono flex items-center gap-1">
                Across {posts.length} posts
              </p>
            </div>`;

const addition = `
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/10 flex flex-col items-center justify-center text-center">
              <Shield className="w-8 h-8 text-white/40 mb-3" />
              <h3 className="font-mono text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Verification Revenue</h3>
              <p className="text-4xl font-sans font-bold">₦{(verifiedUsers * 3000).toLocaleString()}</p>
              <p className="text-[12px] text-white/40 mt-2 font-mono flex items-center gap-1">
                From {verifiedUsers} verified users
              </p>
            </div>
`;

content = content.replace(targetAnalyticsEnd, targetAnalyticsEnd + addition);

fs.writeFileSync(file, content);
