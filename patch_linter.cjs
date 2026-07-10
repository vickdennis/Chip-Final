const fs = require('fs');
let publicProfile = fs.readFileSync('src/views/PublicProfileView.tsx', 'utf8');
publicProfile = publicProfile.replace("import { ExternalLink,", "import { ChevronLeft, ChevronRight, ExternalLink,");
fs.writeFileSync('src/views/PublicProfileView.tsx', publicProfile);

let blogManager = fs.readFileSync('src/views/AdminBlogManager.tsx', 'utf8');
blogManager = blogManager.replace(`        const { id, created_at, updated_at, views, ...cleanForm } = finalForm;
        const { error } = await supabase.from('posts').insert([cleanForm]);`, `        const { error } = await supabase.from('posts').insert([finalForm]);`);
blogManager = blogManager.replace(`        const { id, created_at, updated_at, views, ...cleanForm } = finalForm;
        const { error } = await supabase.from('posts').update(cleanForm).eq('id', editingPost.id);`, `        const { error } = await supabase.from('posts').update(finalForm).eq('id', editingPost.id);`);
fs.writeFileSync('src/views/AdminBlogManager.tsx', blogManager);
