const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf-8');

const oldStr = `            </section>
          </div>
            {/* End of right column */}
          </div>
          </div>
        ) : profile && activeTab === 'social' ? (`;

const newStr = `            </section>
          </div>
          </div>
        ) : profile && activeTab === 'social' ? (`;

if (code.includes(oldStr)) {
    code = code.replace(oldStr, newStr);
    fs.writeFileSync('src/views/UserDashboard.tsx', code);
    console.log('Fixed syntax error');
} else {
    console.log('Could not find string to replace');
}
