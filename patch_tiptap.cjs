const fs = require('fs');

let content = fs.readFileSync('src/components/TiptapEditor.tsx', 'utf8');

// Add import
content = "import { supabase } from '../supabaseClient'\n" + content;

const addImageFn = `  const addImage = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }`;

const newAddImageFn = `  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const fileExt = file.name.split('.').pop()
      const fileName = \`\${Math.random()}.\${fileExt}\`
      const filePath = \`\${fileName}\`
      
      try {
        const { error: uploadError } = await supabase.storage.from('covers').upload(filePath, file)
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('covers').getPublicUrl(filePath)
        editor.chain().focus().setImage({ src: data.publicUrl }).run()
      } catch (error: any) {
        alert('Error uploading image: ' + error.message)
      }
    }
    input.click()
  }`;

content = content.replace(addImageFn, newAddImageFn);

fs.writeFileSync('src/components/TiptapEditor.tsx', content);
