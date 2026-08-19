const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

// The duplicate "Appointments" and "vCard Export" under social tab (lines 1160 to the end of social section)
// Let's remove them from the social tab.
// Find `        ) : profile && activeTab === 'ebooks' ? (`
const ebooksTabIdx = code.indexOf(`        ) : profile && activeTab === 'ebooks' ? (`);
const socialTabIdx = code.indexOf(`        ) : profile && activeTab === 'social' ? (`);

if (ebooksTabIdx === -1 || socialTabIdx === -1) {
    console.error("Could not find tabs");
    process.exit(1);
}

// Find Appointments inside social tab
const appointmentsIdx = code.indexOf(`            {/* Appointments */}`, socialTabIdx);

if (appointmentsIdx !== -1 && appointmentsIdx < ebooksTabIdx) {
    // Cut from appointments to right before the closing divs of social tab
    // Social tab ends at:
    //             </section>
    //           </div>
    //           </div>
    //         ) : profile && activeTab === 'ebooks' ? (
    
    // We want to keep the closing divs. So we cut up to `            {/* End of right column */}` or the end of the section
    const endSectionIdx = code.indexOf(`          </div>\n          </div>\n        ) : profile && activeTab === 'ebooks' ? (`, appointmentsIdx);
    
    if (endSectionIdx !== -1) {
        code = code.substring(0, appointmentsIdx) + code.substring(endSectionIdx);
        fs.writeFileSync('src/views/UserDashboard.tsx', code);
        console.log("Removed Appointments and vCard Export from Social Tab");
    } else {
        console.error("Could not find end of social tab section");
    }
} else {
    console.log("Appointments not found in social tab");
}
