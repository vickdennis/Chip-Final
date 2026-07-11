const fs = require('fs');
const file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { Trash2, Edit, Plus, Image as ImageIcon, CheckCircle, ChevronDown, ChevronUp, Settings, Box } from 'lucide-react';", "import { Trash2, Edit, Plus, Image as ImageIcon, CheckCircle, ChevronDown, ChevronUp, Settings, Box, Zap } from 'lucide-react';");

fs.writeFileSync(file, content);
