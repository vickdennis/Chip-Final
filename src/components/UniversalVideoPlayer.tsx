import React, { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCw, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

export interface UniversalVideoSource {
  type: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'loom' | 'wistia' | 'dailymotion' | 'streamable' | 'iframe' | 'direct';
  src: string;
  originalUrl: string;
  id?: string;
  mimeType?: string;
}

/**
 * Universal video parser supporting all major container formats and video hosting platforms
 */
export function parseUniversalVideoUrl(rawUrl: string): UniversalVideoSource {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'direct', src: '', originalUrl: '' };
  }
  let url = rawUrl.trim();

  // 1. YouTube (Shorts, Watch, youtu.be, embed, mobile)
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return {
      type: 'youtube',
      id,
      src: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${id}`,
      originalUrl: url
    };
  }

  // 2. Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|))(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return {
      type: 'vimeo',
      id,
      src: `https://player.vimeo.com/video/${id}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&loop=1&autopause=0`,
      originalUrl: url
    };
  }

  // 3. TikTok
  const tiktokMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/|t\/)(\d+)/i) || url.match(/(?:vm\.tiktok\.com|tiktok\.com\/t)\/([\w-]+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    const id = tiktokMatch[1];
    return {
      type: 'tiktok',
      id,
      src: `https://www.tiktok.com/embed/v2/${id}`,
      originalUrl: url
    };
  }

  // 4. Instagram Reels & Videos
  const instaMatch = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (instaMatch && instaMatch[1]) {
    const id = instaMatch[1];
    return {
      type: 'instagram',
      id,
      src: `https://www.instagram.com/reel/${id}/embed/`,
      originalUrl: url
    };
  }

  // 5. Loom
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const id = loomMatch[1];
    return {
      type: 'loom',
      id,
      src: `https://www.loom.com/embed/${id}?autoplay=1&hide_owner=true&hide_share=true`,
      originalUrl: url
    };
  }

  // 6. Wistia
  const wistiaMatch = url.match(/(?:wistia\.com\/medias\/|fast\.wistia\.net\/embed\/iframe\/)([a-zA-Z0-9]+)/i);
  if (wistiaMatch && wistiaMatch[1]) {
    const id = wistiaMatch[1];
    return {
      type: 'wistia',
      id,
      src: `https://fast.wistia.net/embed/iframe/${id}?autoPlay=true`,
      originalUrl: url
    };
  }

  // 7. DailyMotion
  const dmMatch = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);
  if (dmMatch && dmMatch[1]) {
    const id = dmMatch[1];
    return {
      type: 'dailymotion',
      id,
      src: `https://www.dailymotion.com/embed/video/${id}?autoplay=1`,
      originalUrl: url
    };
  }

  // 8. Streamable
  const streamableMatch = url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/i);
  if (streamableMatch && streamableMatch[1]) {
    const id = streamableMatch[1];
    return {
      type: 'streamable',
      id,
      src: `https://streamable.com/e/${id}?autoplay=1`,
      originalUrl: url
    };
  }

  // 9. Dropbox transform (dl=0 -> raw=1 for direct streaming)
  if (url.includes('dropbox.com')) {
    url = url.replace(/dl=0/g, 'raw=1');
    if (!url.includes('raw=1')) {
      url = url + (url.includes('?') ? '&raw=1' : '?raw=1');
    }
  }

  // 10. Google Drive preview iframe
  const gDriveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/i) || url.match(/drive\.google\.com\/open\?id=([^\/\?&]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    return {
      type: 'iframe',
      id: gDriveMatch[1],
      src: `https://drive.google.com/file/d/${gDriveMatch[1]}/preview`,
      originalUrl: url
    };
  }

  // 11. Determine MIME type for direct video files
  let mimeType = 'video/mp4';
  const cleanPath = url.split('?')[0].toLowerCase();
  if (cleanPath.endsWith('.webm')) mimeType = 'video/webm';
  else if (cleanPath.endsWith('.mov')) mimeType = 'video/quicktime';
  else if (cleanPath.endsWith('.mkv')) mimeType = 'video/x-matroska';
  else if (cleanPath.endsWith('.m4v')) mimeType = 'video/x-m4v';
  else if (cleanPath.endsWith('.ogv') || cleanPath.endsWith('.ogg')) mimeType = 'video/ogg';
  else if (cleanPath.endsWith('.3gp') || cleanPath.endsWith('.3g2')) mimeType = 'video/3gpp';
  else if (cleanPath.endsWith('.m3u8')) mimeType = 'application/x-mpegURL';

  return {
    type: 'direct',
    src: url,
    originalUrl: url,
    mimeType
  };
}

export interface UniversalVideoPlayerRef {
  play: () => void;
  pause: () => void;
  replay: () => void;
  unmute: () => void;
  toggleMute: () => void;
  togglePlay: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}

export interface UniversalVideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  defaultMuted?: boolean;
  loop?: boolean;
  showControlsOverlay?: boolean;
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (progress: number, currentTime: number, duration: number) => void;
  onError?: (err: any) => void;
}

export const UniversalVideoPlayer = forwardRef<UniversalVideoPlayerRef, UniversalVideoPlayerProps>(({
  url,
  autoPlay = true,
  defaultMuted = false,
  loop = false,
  showControlsOverlay = true,
  className = '',
  onEnded,
  onTimeUpdate,
  onError
}, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(defaultMuted);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [hasEnded, setHasEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [needsGesture, setNeedsGesture] = useState(false);

  const videoMeta = useMemo(() => parseUniversalVideoUrl(url), [url]);

  // Attempt instant unmuted auto-play with 0ms delay; fallback to muted + window gesture unmute
  useEffect(() => {
    if (!url) return;
    setHasEnded(false);
    setVideoError(null);

    if (videoMeta.type === 'direct') {
      const vid = videoRef.current;
      if (!vid) return;

      if (autoPlay) {
        setIsPlaying(true);
        try {
          vid.currentTime = 0;
          vid.muted = defaultMuted;
          setIsMuted(defaultMuted);
        } catch (e) {}

        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setNeedsGesture(false);
            })
            .catch(() => {
              // Browser policy restricted unmuted playback on initial page load
              if (vid) {
                vid.muted = true;
                setIsMuted(true);
                vid.play()
                  .then(() => {
                    setIsPlaying(true);
                    setNeedsGesture(true);
                  })
                  .catch(() => {
                    setIsPlaying(false);
                    setNeedsGesture(true);
                  });
              }
            });
        }
      }

      // One-time window listener: immediately unmutes on first user interaction, tap, or scroll
      const handleFirstInteraction = () => {
        if (videoRef.current) {
          try {
            videoRef.current.muted = false;
            setIsMuted(false);
            setNeedsGesture(false);
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          } catch (e) {}
        }
        cleanupListeners();
      };

      const cleanupListeners = () => {
        window.removeEventListener('pointerdown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('scroll', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
      };

      window.addEventListener('pointerdown', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('touchstart', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('click', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('scroll', handleFirstInteraction, { passive: true, once: true });
      window.addEventListener('keydown', handleFirstInteraction, { passive: true, once: true });

      return () => {
        cleanupListeners();
      };
    }
  }, [url, videoMeta, autoPlay, defaultMuted]);

  const handleReplay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHasEnded(false);
    setIsPlaying(true);
    setNeedsGesture(false);

    if (videoMeta.type === 'direct' && videoRef.current) {
      try {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      } catch (e) {}
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      setNeedsGesture(false);
      if (!isPlaying) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (hasEnded) {
      handleReplay();
      return;
    }
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setNeedsGesture(false);
        }).catch(() => {});
      }
    }
  };

  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    },
    replay: handleReplay,
    unmute: () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    },
    toggleMute,
    togglePlay,
    getVideoElement: () => videoRef.current
  }));

  const handleTimeUpdateInternal = () => {
    if (videoRef.current && videoRef.current.duration) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      const p = (cur / dur) * 100;
      setProgress(p);
      if (onTimeUpdate) {
        onTimeUpdate(p, cur, dur);
      }
    }
  };

  const handleVideoEndedInternal = () => {
    if (loop) {
      if (videoRef.current) {
        try {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
          setIsPlaying(true);
        } catch (e) {}
      }
      return;
    }
    setIsPlaying(false);
    setHasEnded(true);
    if (onEnded) onEnded();
  };

  const handleVideoErrorInternal = () => {
    console.warn('[UniversalVideoPlayer] Direct stream error on URL:', url);
    setVideoError('Format not natively supported by browser. Tap to open or download.');
    setIsPlaying(false);
    if (onError) onError(new Error('Playback error'));
  };

  if (!url) return null;

  return (
    <div className={`relative w-full h-full bg-black flex items-center justify-center overflow-hidden ${className}`}>
      {/* 1. YouTube Player */}
      {videoMeta.type === 'youtube' ? (
        <iframe
          src={`${videoMeta.src}&mute=${isMuted ? 1 : 0}`}
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : videoMeta.type === 'vimeo' ? (
        /* 2. Vimeo Player */
        <iframe
          src={`${videoMeta.src}&muted=${isMuted ? 1 : 0}`}
          title="Vimeo Video Player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : videoMeta.type === 'tiktok' ? (
        /* 3. TikTok Player */
        <iframe
          src={videoMeta.src}
          title="TikTok Video Player"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : videoMeta.type === 'instagram' ? (
        /* 4. Instagram Reel Player */
        <iframe
          src={videoMeta.src}
          title="Instagram Reel Player"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : videoMeta.type === 'loom' || videoMeta.type === 'wistia' || videoMeta.type === 'dailymotion' || videoMeta.type === 'streamable' || videoMeta.type === 'iframe' ? (
        /* 5. Cloud Embed (Loom, Wistia, Drive, etc.) */
        <iframe
          src={videoMeta.src}
          title="Video Embed Player"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : (
        /* 6. Direct HTML5 Video (MP4, MOV, WebM, MKV, OGG, 3GP, M3U8, Storage Cloud) */
        <>
          <video
            ref={videoRef}
            autoPlay={autoPlay}
            playsInline
            preload="auto"
            crossOrigin="anonymous"
            muted={isMuted}
            loop={loop}
            onTimeUpdate={handleTimeUpdateInternal}
            onEnded={handleVideoEndedInternal}
            onError={handleVideoErrorInternal}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer absolute inset-0"
          >
            {/* Multi-MIME source cascade for bulletproof cross-browser playback */}
            {videoMeta.mimeType && <source src={videoMeta.src} type={videoMeta.mimeType} />}
            <source src={videoMeta.src} type="video/mp4" />
            <source src={videoMeta.src} type="video/webm" />
            <source src={videoMeta.src} type="video/quicktime" />
            <source src={videoMeta.src} type="video/ogg" />
            <source src={videoMeta.src} />
            Your browser does not support the video tag.
          </video>

          {/* Animated "Tap for Sound" Prompt if browser restricted initial audio */}
          {isMuted && isPlaying && !hasEnded && showControlsOverlay && (
            <div 
              onClick={toggleMute}
              className="absolute top-16 inset-x-0 flex justify-center pointer-events-auto cursor-pointer z-30 animate-bounce"
            >
              <button
                type="button"
                onClick={toggleMute}
                className="py-1.5 px-3.5 rounded-full bg-black/80 text-white border border-amber-400/50 shadow-xl flex items-center gap-2 text-[11px] font-bold backdrop-blur-md hover:bg-black transition-all cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Tap for Sound</span>
              </button>
            </div>
          )}

          {/* Fallback Play button if autoplay blocked */}
          {!isPlaying && !hasEnded && !videoError && showControlsOverlay && (
            <div 
              onClick={togglePlay}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 cursor-pointer animate-in fade-in duration-150"
            >
              <button
                type="button"
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-8 h-8 fill-current ml-1" />
              </button>
              <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/70 px-3 py-1 rounded-full border border-white/20">
                Tap to Play with Sound
              </span>
            </div>
          )}

          {/* Error Fallback */}
          {videoError && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30 gap-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-xs text-white/90 max-w-[260px]">{videoError}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors"
              >
                <span>Open Video Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </>
      )}

      {/* Floating Controls Overlay for direct video & iframes */}
      {showControlsOverlay && (
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title={isMuted ? 'Tap to unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              title="Replay video from start (unmuted)"
            >
              <RotateCw className="w-4 h-4 text-[#16a34a]" />
            </button>
          </div>

          {videoMeta.type === 'direct' && (
            <button
              type="button"
              onClick={togglePlay}
              className="pointer-events-auto p-2.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}

      {/* Centered Replay Callout upon finish */}
      {hasEnded && showControlsOverlay && (
        <div 
          onClick={handleReplay}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3.5 z-20 cursor-pointer animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={handleReplay}
            className="w-16 h-16 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCw className="w-7 h-7 text-neutral-950" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-white tracking-wider uppercase bg-black/80 px-3.5 py-1.5 rounded-full border border-white/20 shadow-md">
              Replay Intro Video (Unmuted)
            </span>
            <span className="text-[10px] text-white/70">Tap to rewatch automatically with audio</span>
          </div>
        </div>
      )}

      {/* Top Progress Bar */}
      {progress > 0 && showControlsOverlay && (
        <div className="absolute top-0 inset-x-0 h-1 bg-white/20 z-20 pointer-events-none">
          <div 
            className="h-full bg-[#16a34a] transition-all duration-100" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
});

UniversalVideoPlayer.displayName = 'UniversalVideoPlayer';
export default UniversalVideoPlayer;
