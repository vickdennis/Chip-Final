import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Check } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface BlogImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageUrl: string, altText: string) => void;
}

export default function BlogImageModal({ isOpen, onClose, onInsert }: BlogImageModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.');
      return;
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit. Please compress first.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `blog/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // Upload directly to dedicated 'blog' bucket with fallback to 'covers'
      let targetBucket = 'blog';
      let uploadResult = await supabase.storage.from(targetBucket).upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (uploadResult.error) {
        // Fallback to 'covers' bucket
        targetBucket = 'covers';
        uploadResult = await supabase.storage.from(targetBucket).upload(cleanFileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      }

      if (uploadResult.error) {
        throw new Error(uploadResult.error.message);
      }

      const { data } = supabase.storage.from(targetBucket).getPublicUrl(cleanFileName);
      onInsert(data.publicUrl, altText || file.name.replace(/\.[^/.]+$/, ''));
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image. Please try again or use direct URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!/^https?:\/\//i.test(cleanUrl)) {
      setUploadError('Invalid image URL. Must start with http:// or https://');
      return;
    }
    onInsert(cleanUrl, altText.trim() || 'CHIP NG Blog Illustration');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#12141A] w-full max-w-md rounded-3xl border border-neutral-200 dark:border-white/10 shadow-2xl p-6 text-neutral-900 dark:text-white space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ImageIcon className="w-4 h-4 text-[#84A900] dark:text-[#D2F843]" />
            <span>Insert Image into Article</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800/60 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'upload'
                ? 'bg-white dark:bg-[#1A1D26] text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              tab === 'url'
                ? 'bg-white dark:bg-[#1A1D26] text-neutral-950 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Image URL
          </button>
        </div>

        {uploadError && (
          <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
            {uploadError}
          </div>
        )}

        {tab === 'upload' ? (
          <div className="space-y-4">
            <label className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors bg-neutral-50/50 dark:bg-neutral-900/30">
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {uploading ? 'Uploading to storage...' : 'Click to select image'}
              </span>
              <span className="text-[11px] text-neutral-400 mt-1">PNG, JPG, WEBP, GIF up to 10MB</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Alt Text (Description for SEO & Accessibility)
              </label>
              <input
                type="text"
                placeholder="e.g. Lagos Realtor tapping NFC business card on iPhone"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none focus:border-[#D2F843]"
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Direct Image URL
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none focus:border-[#D2F843]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                placeholder="e.g. Modern metal NFC business card"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 outline-none focus:border-[#D2F843]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Insert
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
