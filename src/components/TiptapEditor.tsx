import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Code, Undo, Redo,
  ImageIcon, LinkIcon, Eye, Edit3, Code2, Unlink
} from 'lucide-react';
import BlogImageModal from './blog/BlogImageModal';
import SanitizedBlogContent from './blog/SanitizedBlogContent';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder = 'Start writing your article...' }: TiptapEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'html' | 'preview'>('write');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [htmlSource, setHtmlSource] = useState(content);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl border border-neutral-200 dark:border-neutral-800 my-6 max-h-[500px] w-full object-cover shadow-xs',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#6a8700] dark:text-[#D2F843] underline font-semibold',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[360px] p-5 sm:p-7 text-neutral-800 dark:text-neutral-200',
      },
    },
  });

  // Sync content when external content updates (e.g. loading a draft)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && activeTab !== 'html') {
      editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
      setHtmlSource(content);
    }
  }, [content, editor]);

  // When switching from HTML tab back to write or preview, update editor
  const handleTabChange = (newTab: 'write' | 'html' | 'preview') => {
    if (activeTab === 'html' && newTab !== 'html') {
      if (editor) {
        editor.commands.setContent(htmlSource, { emitUpdate: false });
      }
      onChange(htmlSource);
    } else if (newTab === 'html') {
      setHtmlSource(editor ? editor.getHTML() : content);
    }
    setActiveTab(newTab);
  };

  const handleLinkClick = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkInputUrl(previousUrl);
    setIsLinkModalOpen(true);
  };

  const handleApplyLink = () => {
    if (!editor) return;
    const url = linkInputUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setIsLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsLinkModalOpen(false);
  };

  const handleInsertImage = (imageUrl: string, altText: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: imageUrl, alt: altText, title: altText }).run();
  };

  return (
    <div className="border border-neutral-200/90 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-[#12141A] shadow-xs flex flex-col">
      {/* Top Bar with Mode Tabs */}
      <div className="px-4 py-2.5 bg-neutral-50 dark:bg-[#151821] border-b border-neutral-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
        {/* Editor Modes */}
        <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800/60 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleTabChange('write')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'write'
                ? 'bg-white dark:bg-[#111318] text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('preview')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-[#111318] text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('html')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'html'
                ? 'bg-white dark:bg-[#111318] text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
            }`}
            title="Inspect or tweak clean source HTML"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Advanced HTML</span>
          </button>
        </div>

        {activeTab === 'write' && editor && (
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400">
            <span>Rich Text Mode</span>
          </div>
        )}
      </div>

      {/* Toolbar (Visible only in Write mode) */}
      {activeTab === 'write' && editor && (
        <div className="p-2 border-b border-neutral-200/80 dark:border-white/10 flex flex-wrap items-center gap-1 bg-white dark:bg-[#12141A]">
          {/* Typography */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Heading 1"
          >
            H1
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Heading 2"
          >
            H2
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Heading 3"
          >
            H3
          </button>

          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-800 mx-1 my-auto" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-800 mx-1 my-auto" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('blockquote')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Horizontal Divider"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-800 mx-1 my-auto" />

          {/* Links & Media */}
          <button
            type="button"
            onClick={handleLinkClick}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              editor.isActive('link')
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Insert / Edit Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Remove Link"
            >
              <Unlink className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsImageModalOpen(true)}
            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1 font-semibold text-xs"
            title="Insert Image (Upload or URL)"
          >
            <ImageIcon className="w-4 h-4 text-[#84A900] dark:text-[#D2F843]" />
            <span className="hidden sm:inline">Add Image</span>
          </button>

          <div className="flex-1" />

          {/* History */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 bg-white dark:bg-[#101217]">
        {activeTab === 'write' && (
          <div className="cursor-text">
            <EditorContent editor={editor} />
          </div>
        )}

        {activeTab === 'html' && (
          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono font-semibold uppercase tracking-wider">Clean Article HTML Source</span>
              <span>Changes reflect automatically in visual mode</span>
            </div>
            <textarea
              value={htmlSource}
              onChange={(e) => {
                setHtmlSource(e.target.value);
                onChange(e.target.value);
              }}
              rows={16}
              className="w-full font-mono text-xs p-4 rounded-2xl bg-neutral-900 text-neutral-100 border border-neutral-700 outline-none focus:border-[#D2F843] leading-relaxed resize-y"
              placeholder="<p>Write raw HTML here if needed...</p>"
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-400 flex items-center justify-between">
              <span>Preview Mode</span>
              <span>Sanitized Render Output</span>
            </div>
            <SanitizedBlogContent content={editor ? editor.getHTML() : content} />
          </div>
        )}
      </div>

      {/* Image Modal */}
      <BlogImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImage}
      />

      {/* Link Insertion Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#151821] border border-neutral-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-white/5 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#84A900] dark:text-[#D2F843]" />
                {linkInputUrl ? 'Edit Hyperlink' : 'Insert Hyperlink'}
              </span>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Destination URL
              </label>
              <input
                type="url"
                autoFocus
                placeholder="https://chipng.com or /#order"
                value={linkInputUrl}
                onChange={(e) => setLinkInputUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyLink();
                  }
                  if (e.key === 'Escape') {
                    setIsLinkModalOpen(false);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-[#111318] border border-neutral-200 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-950 dark:text-white outline-none focus:border-[#D2F843]"
              />
              <p className="text-[11px] text-neutral-400">
                You can link to internal sections, external websites, or direct WhatsApp numbers.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              {linkInputUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                >
                  Unlink
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-4 py-1.5 rounded-lg bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  Apply Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
