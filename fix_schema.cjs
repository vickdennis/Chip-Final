const fs = require('fs');
let content = fs.readFileSync('supabase_schema.sql', 'utf8');

const postsMatch = content.match(/-- Blog Posts Table[\s\S]*?(?=-- Storage setup for Blog Covers)/);
const postsString = postsMatch[0];

content = content.replace(postsString, '');
const viewsMatch = content.indexOf('-- Blog Views Table for Analytics');

content = content.slice(0, viewsMatch) + postsString + '\n\n' + content.slice(viewsMatch);
fs.writeFileSync('supabase_schema.sql', content);
