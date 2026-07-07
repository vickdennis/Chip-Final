import { supabase } from '../supabaseClient'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, ImageIcon, LinkIcon } from 'lucide-react'

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`
      
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
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border-b border-white/10 p-2 flex flex-wrap gap-1 bg-[#f9f9f9] dark:bg-[#1a1a1a] rounded-t-md">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><Bold size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><Italic size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><Heading1 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><Heading2 size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><List size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><ListOrdered size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><Quote size={16} /></button>
      <div className="w-px h-6 bg-[#cfc4c5] dark:bg-[#333] mx-1 my-auto"></div>
      <button type="button" onClick={addImage} className="p-2 rounded text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]"><ImageIcon size={16} /></button>
      <button type="button" onClick={setLink} className={`p-2 rounded ${editor.isActive('link') ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]'}`}><LinkIcon size={16} /></button>
      <div className="flex-1"></div>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]"><Undo size={16} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded text-white/40 hover:bg-[#eae8e9] dark:hover:bg-[#333]"><Redo size={16} /></button>
    </div>
  )
}

export default function TiptapEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[300px] p-4 bg-black/40 backdrop-blur-xl max-w-none',
      },
    },
  })

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden flex flex-col">
      <MenuBar editor={editor} />
      <div className="flex-1 bg-black/40 backdrop-blur-xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
