const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// Find the start of the duplicate right column
const rightColStart = code.indexOf('          {/* Right Column */}\n          <div className="xl:col-span-4 flex flex-col gap-8">\n            \n            {/* Profile Views */}', 900);

// Find the start of the Social Media section
const socialStart = code.indexOf('            {/* Social Media */}', rightColStart);

// Find the end of the Social Media section. It's followed by "            {/* End of right column */}"
const endOfRightCol = code.indexOf('            {/* End of right column */}', socialStart);

if (rightColStart === -1 || socialStart === -1 || endOfRightCol === -1) {
  console.log('Could not find markers');
  process.exit(1);
}

const socialMediaCode = code.substring(socialStart, endOfRightCol);

// Remove the duplicate right column
code = code.substring(0, rightColStart) + code.substring(endOfRightCol); 
// Wait, endOfRightCol has `            {/* End of right column */}\n          </div>\n          </div>`
// If I remove from rightColStart to endOfRightCol, I am leaving `            {/* End of right column */}\n          </div>\n          </div>` which closes the first right column and the grid.

// Then, let's insert the Social Media code into the social tab.
const socialTab = `        ) : profile && activeTab === 'social' ? (\n          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">\n            <div className="xl:col-span-8 flex flex-col gap-8">`;
const socialTabStart = code.indexOf(socialTab);

if (socialTabStart !== -1) {
    code = code.substring(0, socialTabStart + socialTab.length) + '\n' + socialMediaCode + '\n' + code.substring(socialTabStart + socialTab.length);
} else {
    console.log('Could not find social tab');
    process.exit(1);
}

fs.writeFileSync('src/views/UserDashboard.tsx', code);
console.log('Moved social media section');
