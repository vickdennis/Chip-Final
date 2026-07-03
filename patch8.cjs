const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const oldWarning = `            {/* Warning Message */}
            {currentLink.size === 'Big' && !currentLink.image_url && !currentLink.use_link_icon (
              <div className="flex items-center gap-3 bg-[#3f290d] border border-[#a66a1a] text-[#facc15] px-4 py-3 rounded-xl mb-6 text-xs font-medium">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                This will display as a button because there's no image. Add an image to use big thumbnail.
              </div>
            )}`;

// wait, the sed command changed '!currentLink.cover_image_url &&' to '!currentLink.use_link_icon &&', let's check current state.
