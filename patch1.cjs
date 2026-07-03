const fs = require('fs');
let code = fs.readFileSync('src/views/UserDashboard.tsx', 'utf8');

const stateInjection = `
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [currentLink, setCurrentLink] = useState<{
    label: string;
    url: string;
    size: 'Big' | 'Medium' | 'Small' | 'Button';
    image_url?: string;
    cover_image_url?: string;
    use_link_icon?: boolean;
  }>({ label: '', url: '', size: 'Button', use_link_icon: false });
`;
code = code.replace('const [saving, setSaving] = useState(false);', 'const [saving, setSaving] = useState(false);\n' + stateInjection);
fs.writeFileSync('src/views/UserDashboard.tsx', code);
