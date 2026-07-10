const fs = require('fs');
let file = 'src/views/AdminBlogManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      if (creatingPost) {
        const { error } = await supabase.from('posts').insert([finalForm]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').update(finalForm).eq('id', editingPost.id);
        if (error) throw error;
      }`;

const replacement = `      if (creatingPost) {
        const { id, created_at, updated_at, views, ...cleanForm } = finalForm;
        const { error } = await supabase.from('posts').insert([cleanForm]);
        if (error) throw error;
      } else {
        const { id, created_at, updated_at, views, ...cleanForm } = finalForm;
        const { error } = await supabase.from('posts').update(cleanForm).eq('id', editingPost.id);
        if (error) throw error;
      }`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
