const fs = require('fs');

let adminFile = 'src/views/AdminBlogManager.tsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');
adminContent = adminContent.replace(
  "import { Plus, Edit2, Trash2, Globe, Eye, Settings, Image as ImageIcon, Save, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';",
  "import { Plus, Edit2, Trash2, Globe, Eye, Settings, Image as ImageIcon, Save, ArrowLeft, ChevronDown, ChevronUp, Zap } from 'lucide-react';"
);
fs.writeFileSync(adminFile, adminContent);

let articleFile = 'src/views/BlogArticleView.tsx';
let articleContent = fs.readFileSync(articleFile, 'utf8');
articleContent = articleContent.replace(
  "  is_published: boolean;\n  published_at: string;\n}",
  "  is_published: boolean;\n  published_at: string;\n  created_at: string;\n  updated_at: string;\n}"
);
fs.writeFileSync(articleFile, articleContent);

