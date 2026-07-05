const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

// Add import
if (!code.includes('import AdminBlogManager')) {
  code = code.replace(
    "import { ebooksData } from '../utils/ebooksData';",
    "import { ebooksData } from '../utils/ebooksData';\nimport AdminBlogManager from './AdminBlogManager';"
  );
}

const startIndex = code.indexOf("{activeTab === 'blog' && (");
const endIndex = code.lastIndexOf("      </div>\n    </div>\n  );\n}");

if (startIndex !== -1 && endIndex !== -1) {
  const newBlogContent = `{activeTab === 'blog' && (
          <AdminBlogManager />
        )}
`;
  code = code.substring(0, startIndex) + newBlogContent + code.substring(endIndex);
  fs.writeFileSync('src/views/AdminDashboard.tsx', code);
}
