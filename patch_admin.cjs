const fs = require('fs');
let code = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

// Add import
if (!code.includes('import AdminBlogManager')) {
  code = code.replace(
    "import { ebooksData } from '../utils/ebooksData';",
    "import { ebooksData } from '../utils/ebooksData';\nimport AdminBlogManager from './AdminBlogManager';"
  );
}

// Replace the blog tab content
const oldBlogStart = "{activeTab === 'blog' && (";
const newBlogContent = `{activeTab === 'blog' && (
          <AdminBlogManager />
        )}`;

// Find the start of the blog tab
const startIndex = code.indexOf(oldBlogStart);
if (startIndex !== -1) {
  // We need to find the matching closing brace/parenthesis for the blog tab
  // But a simpler approach is just string replacement if we know the structure.
  // The blog tab is the last tab in the file.
  // Wait, I can just replace the whole thing using a regex or carefully finding the end.
}
