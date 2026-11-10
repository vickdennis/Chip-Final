import React, { useState, useRef } from 'react';
import { 
  Video, 
  Upload, 
  Play, 
  Check, 
  Sparkles, 
  Crown, 
  Trash2, 
  Eye, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  Lock,
  Smartphone
} from 'lucide-react';
import { toast } from './Toast';
import IntroVideoInterstitial from './IntroVideoInterstitial';
import { supabase } from '../supabaseClient';
import UniversalVideoPlayer from './UniversalVideoPlayer';

interface IntroVideoManagerProps {
  profile: any;
  isPro: boolean;
  onUpdate: (updatedFields: { intro_video_url?: string; intro_video_enabled?: boolean }) => void;
  onOpenUpgradeModal: () => void;
}

export default function IntroVideoManager({
  profile,
  isPro,
  onUpdate,
  onOpenUpgradeModal
}: IntroVideoManagerProps) {
  const [videoUrl, setVideoUrl] = useState(profile?.intro_video_url || '');
  const [isEnabled, setIsEnabled] = useState(profile?.intro_video_enabled !== false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sampleVideos = [
    {
      title: 'Executive Pitch (MP4 / WebM)',
      desc: 'Clean 9:16 vertical personal brand greeting',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-young-businessman-talking-to-camera-in-office-42774-large.mp4'
    },
    {
      title: 'YouTube Short / Video',
      desc: 'YouTube Shorts or regular YouTube video link',
      url: 'https://www.youtube.com/shorts/aqz-KE-bpKQ'
    },
    {
      title: 'Vimeo Showcase Reel',
      desc: 'High-definition Vimeo showcase link',
      url: 'https://vimeo.com/76979871'
    },
    {
      title: 'Modern Tech Founder (MOV / MP4)',
      desc: 'Dynamic startup intro video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-in-an-office-42861-large.mp4'
    }
  ];

  const syncIntroVideo = async (url: string, enabled: boolean) => {
    const targetUsername = profile?.username;
    const targetId = profile?.id;
    if (targetUsername) {
      try {
        localStorage.setItem(`chipng_intro_video_${targetUsername}`, JSON.stringify({
          intro_video_url: url,
          intro_video_enabled: enabled
        }));
        if (targetId) {
          localStorage.setItem(`chipng_intro_video_${targetId}`, JSON.stringify({
            intro_video_url: url,
            intro_video_enabled: enabled
          }));
        }
      } catch (e) {}

      try {
        await fetch(`/api/profile/${targetUsername}/intro-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            video_url: url,
            enabled,
            profile_id: targetId
          })
        });
      } catch (e) {}
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isPro) {
      onOpenUpgradeModal();
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video file is too large (max 100MB). Please choose a shorter clip or compress it.');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setUploading(true);
    setUploadStatus(`Uploading ${file.name} (${sizeMb} MB)...`);
    toast.info(`Uploading ${file.name} (${sizeMb} MB) to CHIP NG cloud...`);

    try {
      const fileExt = file.name.split('.').pop() || 'mp4';
      const cleanFileName = `intro_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      let finalPublicUrl = '';

      // Tier 1: Direct high-speed streaming upload to /api/video/upload
      try {
        setUploadStatus('Streaming video to media server...');
        const streamRes = await fetch(`/api/video/upload?filename=${encodeURIComponent(cleanFileName)}`, {
          method: 'POST',
          headers: {
            'Content-Type': file.type || 'video/mp4'
          },
          body: file
        });
        if (streamRes.ok) {
          const streamData = await streamRes.json().catch(() => ({}));
          if (streamData.success && streamData.url) {
            finalPublicUrl = streamData.url;
          }
        }
      } catch (streamErr) {
        console.warn('Binary video stream upload notice:', streamErr);
      }

      // Tier 2: Supabase Storage bucket upload (tries 'videos' bucket first, then 'covers')
      if (!finalPublicUrl) {
        try {
          setUploadStatus('Syncing to Supabase videos bucket...');
          const storagePath = `intro_videos/${cleanFileName}`;
          let uploaded = false;

          const { error: videoUploadError } = await supabase.storage.from('videos').upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || 'video/mp4'
          });
          if (!videoUploadError) {
            const { data: pubData } = supabase.storage.from('videos').getPublicUrl(storagePath);
            if (pubData?.publicUrl) {
              finalPublicUrl = pubData.publicUrl;
              uploaded = true;
            }
          }

          if (!uploaded) {
            const { error: coverUploadError } = await supabase.storage.from('covers').upload(storagePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || 'video/mp4'
            });
            if (!coverUploadError) {
              const { data: pubData } = supabase.storage.from('covers').getPublicUrl(storagePath);
              if (pubData?.publicUrl) {
                finalPublicUrl = pubData.publicUrl;
              }
            }
          }
        } catch (_supErr) {}
      }

      // Tier 3: Base64 JSON upload to /api/portfolio/upload (for files under 30MB)
      if (!finalPublicUrl && file.size < 30 * 1024 * 1024) {
        try {
          setUploadStatus('Encoding and saving...');
          const base64Data: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          const res = await fetch('/api/portfolio/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Data,
              filename: cleanFileName
            })
          });
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data.url) finalPublicUrl = data.url;
          }
        } catch (_apiErr) {}
      }

      if (!finalPublicUrl) {
        throw new Error('Unable to store video on server. Please verify network connection or try a direct URL link.');
      }

      setVideoUrl(finalPublicUrl);
      setIsEnabled(true);
      onUpdate({ intro_video_url: finalPublicUrl, intro_video_enabled: true });
      await syncIntroVideo(finalPublicUrl, true);
      toast.success('Intro video processed, saved & active on your public profile!');
    } catch (err: any) {
      toast.error('Failed to save uploaded video: ' + (err?.message || 'Please retry'));
    } finally {
      setUploading(false);
      setUploadStatus('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectSample = (url: string) => {
    if (!isPro) {
      onOpenUpgradeModal();
      return;
    }
    setVideoUrl(url);
    setIsEnabled(true);
    onUpdate({ intro_video_url: url, intro_video_enabled: true });
    syncIntroVideo(url, true);
    toast.success('Preset video selected & saved to profile!');
  };

  const handleUrlChange = (newUrl: string) => {
    if (!isPro) {
      onOpenUpgradeModal();
      return;
    }
    setVideoUrl(newUrl);
    onUpdate({ intro_video_url: newUrl });
    syncIntroVideo(newUrl, isEnabled);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    if (!isPro) {
      onOpenUpgradeModal();
      return;
    }
    setIsEnabled(enabled);
    onUpdate({ intro_video_enabled: enabled });
    syncIntroVideo(videoUrl, enabled);
    toast.success(enabled ? 'Intro video enabled on public profile' : 'Intro video paused');
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setIsEnabled(false);
    onUpdate({ intro_video_url: '', intro_video_enabled: false });
    syncIntroVideo('', false);
    toast.success('Intro video removed');
  };

  return (
    <section className="bg-white dark:bg-[#111318] border border-neutral-200/80 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-100 dark:border-white/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/50 dark:bg-white/[0.02]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-950 dark:text-white tracking-tight">
                Profile Intro Video (Interstitial Ad)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Crown className="w-3 h-3" /> PRO Exclusive
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Automatically pops up and plays as an interactive video ad when prospects tap your NFC card or visit your bio link.
            </p>
          </div>
        </div>

        {/* Enable / Disable Switch */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            {isEnabled ? 'Active' : 'Paused'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            onClick={() => handleToggleEnabled(!isEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
              isEnabled ? 'bg-[#16a34a]' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 relative">
        {/* If Not Pro User, show overlay */}
        {!isPro && (
          <div className="absolute inset-0 z-20 backdrop-blur-[2px] bg-white/70 dark:bg-black/70 flex flex-col items-center justify-center p-6 text-center rounded-b-3xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
              <Crown className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-neutral-950 dark:text-white">
              Autoplay Intro Video is a CHIP Pro Feature
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-4">
              Showcase your personal greeting, executive pitch, or company sizzle reel with instant autoplay and 1-tap WhatsApp connect.
            </p>
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="py-2.5 px-5 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-bold text-xs flex items-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Unlock with CHIP Pro</span>
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Video Preview & Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Live Universal Video Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[240px] aspect-[9/16] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 relative shadow-md group flex items-center justify-center">
                {videoUrl ? (
                  <>
                    <UniversalVideoPlayer
                      url={videoUrl}
                      autoPlay={false}
                      defaultMuted={true}
                      loop={true}
                      showControlsOverlay={false}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-30">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="p-2.5 rounded-full bg-white text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                        title="Test Full Screen Interstitial"
                      >
                        <Play className="w-4 h-4 text-[#16a34a] fill-current" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center text-neutral-400 flex flex-col items-center justify-center">
                    <Video className="w-10 h-10 mb-2 opacity-40 text-neutral-500" />
                    <span className="text-xs font-semibold">No video loaded</span>
                    <span className="text-[10px] text-neutral-500 mt-1">Upload any video or paste a link</span>
                  </div>
                )}
              </div>

              {videoUrl && (
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/15 text-neutral-900 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#16a34a]" /> Test Interstitial
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload & Link Controls */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
                  Direct Video Link or Social Embed
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://... (MP4, MOV, YouTube, TikTok, Vimeo, Loom, Drive)"
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 rounded-xl text-xs font-mono text-neutral-950 dark:text-white placeholder-neutral-400 outline-none focus:border-[#16a34a]"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Supports MP4, iPhone QuickTime (MOV), WebM, MKV, YouTube (Shorts & Videos), TikTok, Vimeo, Loom, Instagram, Google Drive, and Dropbox links.
                </span>
              </div>

              {/* Upload File Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mp4,.mov,.webm,.mkv,.m4v,.avi,.3gp,.ogv,.flv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-white/15 hover:border-[#16a34a] dark:hover:border-[#16a34a] flex items-center justify-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#16a34a]" />
                  <span>{uploading ? (uploadStatus || 'Processing Video...') : 'Upload Video File (MP4, MOV iPhone, WebM, MKV - max 100MB)'}</span>
                </button>
              </div>

              {/* Sample Presets */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Or Test with Executive Presets
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {sampleVideos.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(s.url)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        videoUrl === s.url
                          ? 'border-[#16a34a] bg-[#16a34a]/10 text-neutral-950 dark:text-white font-bold'
                          : 'border-neutral-200 dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.02] hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{s.title}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">{s.desc}</div>
                      </div>
                      {videoUrl === s.url && (
                        <Check className="w-4 h-4 text-[#16a34a] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Test Interstitial */}
      <IntroVideoInterstitial
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        videoUrl={videoUrl}
        fullName={profile?.full_name || profile?.username}
        username={profile?.username}
        headline={profile?.headline}
        avatarUrl={profile?.cover_image_url}
        phoneNumber={profile?.phone_number}
      />
    </section>
  );
}
