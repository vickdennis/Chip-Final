const fs = require('fs');
const file = 'src/views/AdminDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `const payload = {
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(prodForm.price.toString().replace(/,/g, '')),
      image_url: prodForm.image_url
    };`;

const replacement = `const payload = {
      profile_id: currentUserId,
      name: prodForm.name,
      description: prodForm.description,
      price: parseFloat(prodForm.price.toString().replace(/,/g, '')),
      image_url: prodForm.image_url
    };`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
