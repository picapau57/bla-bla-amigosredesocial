import { useState, FormEvent, ChangeEvent } from 'react';
import { User, Post, Ad } from '../types';
import { 
  Image as ImageIcon, Video, Send, Share2, MessageSquare, AlertCircle, 
  MapPin, CheckCircle, Flame, Star, Sparkles, ExternalLink, Bookmark,
  Upload, X, ThumbsUp, Heart, Smile, Globe, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageLightbox from './ImageLightbox';

interface FeedSectionProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  ads: Ad[];
  onAddPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => Promise<{ success: boolean; isRestricted?: boolean; reason?: string }>;
  onToggleReaction: (postId: string, type: 'likes' | 'loves' | 'applauds') => void;
  onAddComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onAdClick: (adId: string) => void;
  onTrackAdImpression: (adId: string) => void;
  onViewProfile?: (user: User) => void;
}

function ReelsVideoPlayer({ mediaUrl }: { mediaUrl: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getYouTubeDetails = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    let videoId: string | null = null;

    try {
      if (cleanUrl.includes('/shorts/')) {
        const parts = cleanUrl.split('/shorts/');
        if (parts[1]) videoId = parts[1].split(/[?&#/]/)[0];
      }
      if (!videoId && cleanUrl.includes('v=')) {
        const match = cleanUrl.match(/[?&]v=([^&#]+)/);
        if (match && match[1]) videoId = match[1];
      }
      if (!videoId && cleanUrl.includes('youtu.be/')) {
        const parts = cleanUrl.split('youtu.be/');
        if (parts[1]) videoId = parts[1].split(/[?&#/]/)[0];
      }
      if (!videoId && cleanUrl.includes('/embed/')) {
        const parts = cleanUrl.split('/embed/');
        if (parts[1]) videoId = parts[1].split(/[?&#/]/)[0];
      }
      if (!videoId && cleanUrl.includes('/live/')) {
        const parts = cleanUrl.split('/live/');
        if (parts[1]) videoId = parts[1].split(/[?&#/]/)[0];
      }
      if (!videoId) {
        const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
        const match = cleanUrl.match(regExp);
        if (match && match[1]) videoId = match[1];
      }
    } catch (e) {
      console.error('Error parsing video URL:', e);
    }

    if (videoId && videoId.length >= 10) {
      return {
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      };
    }
    return null;
  };

  const ytDetails = getYouTubeDetails(mediaUrl);

  if (ytDetails) {
    if (isPlaying) {
      return (
        <div className="w-full aspect-video bg-black relative">
          <iframe
            src={ytDetails.embedUrl}
            title="YouTube Video Player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }

    return (
      <div 
        className="w-full aspect-video bg-[#0A0A14] relative flex items-center justify-center group/vid cursor-pointer overflow-hidden"
        onClick={() => setIsPlaying(true)}
      >
        <img 
          src={ytDetails.thumbnailUrl} 
          alt="Video Preview" 
          className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300" 
        />
        <div className="absolute inset-0 bg-[#0A0A14]/40 flex items-center justify-center">
          <div className="bg-[#FF5722] text-white rounded-full p-4 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-[#FF5722]/35 cursor-pointer">
            <Video className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 bg-[#121225]/90 p-2 rounded text-[11px] font-mono text-white flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span>YouTube Reels / Vídeo</span>
        </div>
      </div>
    );
  }

  // Fallback for regular direct video files or general URL
  return (
    <div className="w-full bg-black relative flex items-center justify-center group/vid">
      <video
        src={mediaUrl}
        controls
        preload="metadata"
        className="w-full aspect-video max-h-[460px] object-contain"
        poster="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800"
      />
    </div>
  );
}

export default function FeedSection({
  currentUser,
  users,
  posts,
  ads,
  onAddPost,
  onToggleReaction,
  onAddComment,
  onShare,
  onAdClick,
  onTrackAdImpression,
  onViewProfile
}: FeedSectionProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isModeratingPost, setIsModeratingPost] = useState(false);
  
  // Track open comment trays
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Saved / Bookmark posts
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  // Lightbox zoom state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  // Post suggestions images
  const sampleMediaUrls = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
  ];

  // Local image & video upload states & logic
  const [activeMediaSource, setActiveMediaSource] = useState<'upload' | 'url'>('upload');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Quick video suggestions
  const sampleVideoPresets = [
    { title: 'YouTube Shorts #1', url: 'https://youtube.com/shorts/qC3qC0Uq7qg' },
    { title: 'Vídeo Goiás & Natureza', url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4' },
    { title: 'Clipe de Humor', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-dog-wearing-glasses-42352-large.mp4' }
  ];

  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadError('Por favor, selecione um arquivo de vídeo válido (.mp4, .webm, .mov).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Vídeo acima de 25MB. Escolha um arquivo menor ou cole o link do YouTube.');
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewPostMedia(dataUrl);
      setMediaType('video');
      setIsUploadingFile(false);
    };
    reader.onerror = () => {
      setUploadError('Erro ao carregar o vídeo. Tente usar um link web ou YouTube.');
      setIsUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('A imagem é muito grande. Escolha uma imagem de até 10MB.');
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);
    try {
      const base64 = await compressImage(file);
      setNewPostMedia(base64);
      setMediaType('image');
    } catch (err) {
      console.error('Error reading/compressing file:', err);
      setUploadError('Erro ao processar imagem. Tente novamente.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    let content = newPostContent.trim();
    let media = newPostMedia.trim();
    let detectedType = mediaType;

    // Check if post text contains a YouTube/Video link if no media is explicitly attached
    if (!media && content) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = content.match(urlRegex);
      if (urls && urls.length > 0) {
        const potentialUrl = urls[0];
        if (
          potentialUrl.includes('youtube.com') ||
          potentialUrl.includes('youtu.be') ||
          potentialUrl.includes('/shorts/') ||
          potentialUrl.includes('vimeo.com') ||
          potentialUrl.endsWith('.mp4') ||
          potentialUrl.endsWith('.webm')
        ) {
          media = potentialUrl;
          detectedType = 'video';
        }
      }
    }

    if (!content && !media) return;

    // Auto-fix url if it's video
    if (media && detectedType === 'video' && !media.startsWith('data:') && !media.startsWith('http://') && !media.startsWith('https://')) {
      media = 'https://' + media;
    }

    setIsModeratingPost(true);
    try {
      const result = await onAddPost(content, media || undefined, media ? detectedType : undefined);
      if (result && !result.success && result.isRestricted) {
        alert(`🚫 POST EXCLUÍDO AUTOMATICAMENTE NA HORA!\n\n${result.reason || 'Restrição detectada.'}`);
      } else {
        setNewPostContent('');
        setNewPostMedia('');
        setShowMediaInput(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsModeratingPost(false);
    }
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [postId]: value }));
  };

  const handlePostComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    onAddComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const getAuthor = (userId: string) => {
    return users.find(u => u.id === userId) || users[0];
  };

  // Find sponsored feed ads and track them
  const feedAds = ads.filter(a => a.position === 'feed' && a.status === 'active');
  
  // Merge posts and feed ads together periodically
  const mergedFeedItems: (Post | { isAd: true; ad: Ad })[] = [];
  posts.forEach((post, idx) => {
    mergedFeedItems.push(post);
    // Insert an ad after every 2 posts
    if ((idx + 1) % 2 === 0 && feedAds.length > 0) {
      const adIndex = Math.floor((idx + 1) / 2 - 1) % feedAds.length;
      const targetAd = feedAds[adIndex];
      mergedFeedItems.push({ isAd: true, ad: targetAd });
      onTrackAdImpression(targetAd.id);
    }
  });

  return (
    <div className="flex-1 space-y-6" id="feed-central-panel">
      
      {/* POST CREATOR BOX (FACEBOOK STYLE) */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3.5 sm:p-4 shadow-sm" id="feed-creator-box">
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-black/5"
          />
          <form onSubmit={handleCreatePost} className="w-full">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={`No que você está pensando, ${currentUser.fullName.split(' ')[0]}?`}
              className="w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] placeholder-[#65676B] dark:placeholder-[#B0B3B8] rounded-2xl p-3 text-sm border-none focus:outline-none focus:ring-2 focus:ring-[#1877F2]/30 resize-none min-h-[75px] transition-all"
            />

            {/* EXPANDABLE MEDIA ATTACHMENTS */}
            <AnimatePresence>
              {showMediaInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3 bg-[#0A0A14] p-3 rounded-xl border border-white/5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex gap-2">
                      <span className="text-gray-400 font-bold">Tipo:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaType('image');
                          setActiveMediaSource('upload');
                        }}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${mediaType === 'image' ? 'bg-[#7C4DFF]/20 text-[#00E5FF] font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMediaType('video');
                          setActiveMediaSource('url');
                        }}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${mediaType === 'video' ? 'bg-[#FF5722]/20 text-[#FF5722] font-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        Vídeo Curto/Reels
                      </button>
                    </div>

                    {mediaType === 'image' && (
                      <div className="flex gap-1 bg-[#121225] p-0.5 rounded border border-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveMediaSource('upload')}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${activeMediaSource === 'upload' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          Dispositivo
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMediaSource('url')}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${activeMediaSource === 'url' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          Link Web
                        </button>
                      </div>
                    )}

                    {mediaType === 'video' && (
                      <div className="flex gap-1 bg-[#121225] p-0.5 rounded border border-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveMediaSource('url')}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${activeMediaSource === 'url' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          Link YouTube
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMediaSource('upload')}
                          className={`px-2 py-0.5 rounded text-[10px] cursor-pointer transition-all ${activeMediaSource === 'upload' ? 'bg-white/10 text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          Arquivo Vídeo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DISPLAY FILE UPLOADER FOR IMAGE DISPOSITIVO */}
                  {mediaType === 'image' && activeMediaSource === 'upload' && (
                    <div className="space-y-3">
                      {newPostMedia && newPostMedia.startsWith('data:image/') ? (
                        /* Previews already-uploaded local image */
                        <div className="relative rounded-lg overflow-hidden border border-[#00E5FF]/20 bg-[#121225]/50 p-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img 
                              src={newPostMedia} 
                              alt="Upload Preview" 
                              className="w-16 h-16 object-cover rounded-lg border border-white/10"
                            />
                            <div className="text-left">
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#00E5FF] block">✓ Imagem Carregada</span>
                              <span className="text-[9px] font-mono text-gray-400 block mt-0.5">Otimizada para publicação instantânea</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewPostMedia('')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer border border-red-500/15"
                            title="Remover Imagem"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* File Upload Zone */
                        <div className="relative">
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#00E5FF]/40 rounded-xl p-6 bg-[#121225]/40 hover:bg-[#121225]/70 transition-all cursor-pointer group">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              disabled={isUploadingFile}
                              className="hidden"
                            />
                            
                            {isUploadingFile ? (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-[#00E5FF] animate-bounce" />
                                <span className="text-xs font-mono font-bold text-[#00E5FF] animate-pulse">Otimizando imagem...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-center">
                                <Upload className="w-8 h-8 text-[#7C4DFF] group-hover:text-[#00E5FF] group-hover:scale-105 transition-all duration-300" />
                                <span className="text-xs font-medium text-gray-300">Escolha uma foto do seu Celular ou Computador</span>
                                <span className="text-[9px] text-gray-500 font-mono">Arraste ou clique para buscar fotos</span>
                              </div>
                            )}
                          </label>

                          {uploadError && (
                            <p className="text-[10px] text-red-400 font-mono mt-1.5 text-left flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {uploadError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISPLAY FILE UPLOADER FOR VIDEO DISPOSITIVO */}
                  {mediaType === 'video' && activeMediaSource === 'upload' && (
                    <div className="space-y-3">
                      {newPostMedia && newPostMedia.startsWith('data:video/') ? (
                        <div className="relative rounded-lg overflow-hidden border border-[#FF5722]/30 bg-[#121225]/50 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#FF5722]/20 text-[#FF5722] rounded-lg">
                              <Video className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs font-mono font-bold text-white block">✓ Vídeo carregado com sucesso</span>
                              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">Pronto para publicação no Feed e Reels</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setNewPostMedia('')}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all cursor-pointer border border-red-500/15"
                            title="Remover Vídeo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-[#FF5722]/40 rounded-xl p-6 bg-[#121225]/40 hover:bg-[#121225]/70 transition-all cursor-pointer group">
                            <input
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
                              onChange={handleVideoFileChange}
                              disabled={isUploadingFile}
                              className="hidden"
                            />
                            
                            {isUploadingFile ? (
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-[#FF5722] animate-bounce" />
                                <span className="text-xs font-mono font-bold text-[#FF5722] animate-pulse">Carregando vídeo...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-center">
                                <Upload className="w-8 h-8 text-[#FF5722] group-hover:scale-105 transition-all duration-300" />
                                <span className="text-xs font-medium text-gray-300">Escolha um vídeo do seu Celular ou Computador</span>
                                <span className="text-[9px] text-gray-500 font-mono">MP4, WEBM ou MOV até 25MB</span>
                              </div>
                            )}
                          </label>

                          {uploadError && (
                            <p className="text-[10px] text-red-400 font-mono mt-1.5 text-left flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {uploadError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DISPLAY LINK INPUT FOR URL FOR BOTH IMAGES AND VIDEOS */}
                  {((mediaType === 'video' && activeMediaSource === 'url') || (mediaType === 'image' && activeMediaSource === 'url')) && (
                    <div className="space-y-3 text-left">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={mediaType === 'image' ? "URL da imagem (ex: https://unsplash.com/...)" : "Cole aqui o link do YouTube, Shorts ou vídeo .mp4"}
                          value={newPostMedia}
                          onChange={(e) => setNewPostMedia(e.target.value)}
                          className="w-full bg-[#121225] border border-white/10 text-gray-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-mono pr-8"
                        />
                        {newPostMedia && (
                          <button
                            type="button"
                            onClick={() => setNewPostMedia('')}
                            className="absolute right-2 top-2.5 p-0.5 text-gray-500 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Display live preview of video URL if provided */}
                      {mediaType === 'video' && newPostMedia && (
                        <div className="p-2 bg-[#121225] border border-[#FF5722]/30 rounded-lg flex items-center gap-2">
                          <Video className="w-4 h-4 text-[#FF5722] shrink-0" />
                          <span className="text-[11px] text-gray-300 font-mono truncate">
                            Link do vídeo: {newPostMedia}
                          </span>
                        </div>
                      )}

                      {/* Video Quick Suggestions */}
                      {mediaType === 'video' && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-gray-500 font-mono block">Sugestões de vídeos de demonstração:</span>
                          <div className="flex flex-wrap gap-2">
                            {sampleVideoPresets.map((preset, vidx) => (
                              <button
                                key={vidx}
                                type="button"
                                onClick={() => {
                                  setNewPostMedia(preset.url);
                                  setMediaType('video');
                                  setActiveMediaSource('url');
                                }}
                                className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                                  newPostMedia === preset.url
                                    ? 'bg-[#FF5722]/20 border-[#FF5722] text-[#FF5722]'
                                    : 'bg-[#121225] border-white/5 text-gray-400 hover:text-white'
                                }`}
                              >
                                🎬 {preset.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggest random photo options under */}
                      {mediaType === 'image' && (
                        <div className="flex gap-2 items-center">
                          <span className="text-[10px] text-gray-500 font-mono">Sugestão rápida:</span>
                          {sampleMediaUrls.map((preset, pidx) => (
                            <button
                              key={pidx}
                              type="button"
                              onClick={() => {
                                setNewPostMedia(preset);
                                setMediaType('image');
                                setActiveMediaSource('url');
                              }}
                              className={`w-9 h-9 rounded-lg overflow-hidden border transition-all ${
                                newPostMedia === preset ? 'border-[#00E5FF] ring-2 ring-[#00E5FF]/20' : 'border-white/5'
                              }`}
                            >
                              <img src={preset} alt="preset" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* BUTTON BAR (FACEBOOK ACTIONS) */}
            <div className="flex flex-wrap items-center justify-between border-t border-[#E4E6EB] dark:border-[#3A3B3C] pt-2.5 mt-2.5 gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (showMediaInput && mediaType === 'video') {
                      setShowMediaInput(false);
                    } else {
                      setShowMediaInput(true);
                      setMediaType('video');
                      setActiveMediaSource('url');
                    }
                  }}
                  className="flex items-center gap-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Video className="w-5 h-5 text-[#F3425F]" />
                  <span className="hidden xs:inline">Vídeo ao vivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (showMediaInput && mediaType === 'image' && activeMediaSource === 'upload') {
                      setShowMediaInput(false);
                    } else {
                      setShowMediaInput(true);
                      setMediaType('image');
                      setActiveMediaSource('upload');
                    }
                  }}
                  className="flex items-center gap-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5 text-[#45BD62]" />
                  <span>Foto/vídeo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(true);
                    setMediaType('image');
                  }}
                  className="flex items-center gap-2 text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] text-xs font-semibold px-2.5 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Smile className="w-5 h-5 text-[#F7B125]" />
                  <span className="hidden sm:inline">Sentimento</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={(!newPostContent.trim() && !newPostMedia) || isModeratingPost}
                className="bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs py-2 px-5 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all ml-auto"
              >
                {isModeratingPost ? (
                  <>
                    <span className="animate-pulse">Moderando...</span>
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-white" />
                  </>
                ) : (
                  <>
                    <span>Publicar</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FEED ITEMS LIST */}
      <div className="space-y-4 sm:space-y-5" id="news-feed-posts">
        {mergedFeedItems.length === 0 ? (
          <div className="text-center bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl py-12 px-4 shadow-sm text-[#65676B] dark:text-[#B0B3B8]">
            <p className="text-sm font-bold text-[#050505] dark:text-[#E4E6EB]">Nenhuma publicação disponível</p>
            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] mt-1">Seja o primeiro a compartilhar uma novidade com seus amigos!</p>
          </div>
        ) : (
          mergedFeedItems.map((item, index) => {
            // IF it is inline advertisement
            if ('isAd' in item) {
              const ad = item.ad;
              return (
                <div 
                  key={`ad-${ad.id}-${index}`} 
                  className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-4 shadow-sm relative overflow-hidden"
                  id={`inline-ad-card-${index}`}
                >
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E4E6EB] dark:border-[#3A3B3C]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
                      <span className="text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8]">Patrocinado</span>
                    </div>
                    <span className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] font-mono">Google Ads Partner</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-1/3 aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-black/20 shrink-0">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#050505] dark:text-[#E4E6EB] leading-tight">{ad.title}</h4>
                      <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] mt-1.5 leading-relaxed">{ad.description}</p>
                      
                      <div className="mt-3 flex items-center gap-3">
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => onAdClick(ad.id)}
                          className="bg-[#1877F2] hover:bg-[#166FE5] text-white font-bold text-xs py-1.5 px-4 rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span>Saiba mais</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Normal user post
            const post = item;
            const author = getAuthor(post.userId);
            
            const hasLiked = post.reactions?.likes.includes(currentUser.id);
            const hasLoved = post.reactions?.loves.includes(currentUser.id);
            const hasApplauded = post.reactions?.applauds.includes(currentUser.id);
            const isSaved = savedPostIds.includes(post.id);

            const displayComments = post.comments || [];
            const isCommentTrayOpen = activeCommentsPostId === post.id;

            return (
              <div 
                key={post.id} 
                className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl shadow-sm overflow-hidden text-[#050505] dark:text-[#E4E6EB]"
                id={`feed-post-card-${post.id}`}
              >
                
                {/* AUTHOR BANNER (FACEBOOK STYLE) */}
                <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
                  <div 
                    onClick={() => onViewProfile?.(author)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <img
                      src={author.avatar}
                      alt={author.fullName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-black/5"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#050505] dark:text-[#E4E6EB] group-hover:underline flex items-center gap-1">
                        {author.fullName}
                        {author.isVerified && (
                          <CheckCircle className="w-4 h-4 text-[#1877F2] fill-[#1877F2]/10 shrink-0" title="Verificado" />
                        )}
                        {post.isPatrocinado && (
                          <span className="bg-[#1877F2]/10 text-[#1877F2] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ml-1">
                            Patrocinado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#65676B] dark:text-[#B0B3B8] flex items-center gap-1.5 mt-0.5">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-[#65676B] dark:text-[#B0B3B8]" title="Público" />
                      </div>
                    </div>
                  </div>

                  {/* Bookmark / More Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSavePost(post.id)}
                      className="text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] p-2 rounded-full transition-colors cursor-pointer"
                      title={isSaved ? 'Remover dos salvos' : 'Salvar postagem'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'text-[#1877F2] fill-[#1877F2]' : ''}`} />
                    </button>
                    <button
                      onClick={() => onShare(post.id)}
                      className="text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] p-2 rounded-full transition-colors cursor-pointer"
                      title="Mais opções"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* TEXT CONTENT */}
                <div className="px-4 pb-3 pt-1">
                  <p className="text-[15px] text-[#050505] dark:text-[#E4E6EB] whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* ATTACHED MEDIA */}
                {post.mediaUrl && (
                  <div className="bg-black overflow-hidden max-h-[500px] flex items-center justify-center">
                    {post.mediaType === 'video' ? (
                      <ReelsVideoPlayer mediaUrl={post.mediaUrl} />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post attachment"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain max-h-[440px] hover:opacity-95 transition-opacity cursor-zoom-in"
                        onClick={() => {
                          setLightboxImage(post.mediaUrl || '');
                          setLightboxAlt(post.content || 'Post attachment');
                        }}
                        title="Clique para ampliar a imagem"
                      />
                    )}
                  </div>
                )}

                {/* METRICS ROW (FACEBOOK REACTION SUMMARY) */}
                <div className="px-4 py-2 flex items-center justify-between text-xs text-[#65676B] dark:text-[#B0B3B8]">
                  <div className="flex items-center gap-1.5">
                    {/* Reaction Icon Bubbles */}
                    <div className="flex items-center -space-x-1">
                      {post.reactions?.likes.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[11px] shadow-sm ring-1 ring-white dark:ring-[#242526]">
                          👍
                        </span>
                      )}
                      {post.reactions?.loves.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#F3425F] flex items-center justify-center text-white text-[11px] shadow-sm ring-1 ring-white dark:ring-[#242526]">
                          ❤️
                        </span>
                      )}
                      {post.reactions?.applauds.length > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#45BD62] flex items-center justify-center text-white text-[11px] shadow-sm ring-1 ring-white dark:ring-[#242526]">
                          👏
                        </span>
                      )}
                    </div>

                    {/* Counts */}
                    <span>
                      {(post.reactions?.likes.length || 0) + (post.reactions?.loves.length || 0) + (post.reactions?.applauds.length || 0) > 0 ? (
                        <span>{(post.reactions?.likes.length || 0) + (post.reactions?.loves.length || 0) + (post.reactions?.applauds.length || 0)}</span>
                      ) : (
                        <span>Seja o primeiro a curtir</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveCommentsPostId(isCommentTrayOpen ? null : post.id)}
                      className="hover:underline cursor-pointer"
                    >
                      {displayComments.length} {displayComments.length === 1 ? 'comentário' : 'comentários'}
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => onShare(post.id)}
                      className="hover:underline cursor-pointer"
                    >
                      {post.sharesCount} compartilhamentos
                    </button>
                  </div>
                </div>

                {/* FACEBOOK ACTION BUTTONS BAR */}
                <div className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] py-1 px-2 mx-3 flex items-center justify-around gap-1">
                  
                  {/* Curtir */}
                  <button
                    onClick={() => onToggleReaction(post.id, 'likes')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                      hasLiked 
                        ? 'text-[#1877F2] font-bold bg-[#1877F2]/10' 
                        : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-[#1877F2] text-[#1877F2]' : ''}`} />
                    <span>Curtir</span>
                  </button>

                  {/* Amar */}
                  <button
                    onClick={() => onToggleReaction(post.id, 'loves')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                      hasLoved 
                        ? 'text-[#F3425F] font-bold bg-[#F3425F]/10' 
                        : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLoved ? 'fill-[#F3425F] text-[#F3425F]' : ''}`} />
                    <span>Amar</span>
                  </button>

                  {/* Aplaudir */}
                  <button
                    onClick={() => onToggleReaction(post.id, 'applauds')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                      hasApplauded 
                        ? 'text-[#45BD62] font-bold bg-[#45BD62]/10' 
                        : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                    }`}
                  >
                    <span className="text-sm">👏</span>
                    <span className="hidden sm:inline">Aplaudir</span>
                  </button>

                  {/* Comentar */}
                  <button
                    onClick={() => setActiveCommentsPostId(isCommentTrayOpen ? null : post.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-colors font-semibold cursor-pointer ${
                      isCommentTrayOpen 
                        ? 'text-[#1877F2] bg-[#1877F2]/10' 
                        : 'text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Comentar</span>
                  </button>

                  {/* Compartilhar */}
                  <button
                    onClick={() => onShare(post.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-lg transition-colors font-semibold cursor-pointer text-[#65676B] dark:text-[#B0B3B8] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Compartilhar</span>
                  </button>

                </div>

                {/* COMMENTS EXPANDER (FACEBOOK BUBBLES) */}
                <AnimatePresence>
                  {isCommentTrayOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] px-4 py-3 space-y-3 bg-[#F9FAFB] dark:bg-[#18191A]/50"
                    >
                      {/* Comments Feed list */}
                      {displayComments.length > 0 && (
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {displayComments.map(c => {
                            const commenter = getAuthor(c.userId);
                            return (
                              <div key={c.id} className="flex gap-2.5 items-start text-xs">
                                <img
                                  src={commenter.avatar}
                                  alt={commenter.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-black/5 cursor-pointer hover:opacity-90 transition-opacity mt-0.5"
                                  onClick={() => onViewProfile?.(commenter)}
                                />
                                <div className="min-w-0 max-w-[85%]">
                                  <div className="bg-[#F0F2F5] dark:bg-[#3A3B3C] rounded-2xl px-3.5 py-2 text-xs">
                                    <div className="flex items-center justify-between gap-3">
                                      <span 
                                        className="font-bold text-xs text-[#050505] dark:text-[#E4E6EB] cursor-pointer hover:underline"
                                        onClick={() => onViewProfile?.(commenter)}
                                      >
                                        {commenter.fullName}
                                      </span>
                                      <span className="text-[10px] text-[#65676B] dark:text-[#B0B3B8]">
                                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <p className="text-[#050505] dark:text-[#E4E6EB] mt-1 leading-normal whitespace-pre-wrap">{c.content}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment input form */}
                      <div className="flex gap-2 items-center pt-1">
                        <img
                          src={currentUser.avatar}
                          alt="you"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-black/5"
                        />
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Escreva um comentário..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePostComment(post.id);
                            }}
                            className="w-full bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] text-xs pl-4 pr-10 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877F2] placeholder-[#65676B] dark:placeholder-[#B0B3B8] border-none"
                          />
                          <button
                            onClick={() => handlePostComment(post.id)}
                            className="absolute right-2.5 top-2 text-[#1877F2] hover:text-[#166FE5] p-0.5 cursor-pointer disabled:opacity-40"
                            disabled={!commentInputs[post.id]?.trim()}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })
        )}
      </div>

      {/* Reusable Image Lightbox Magnifier */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        imageUrl={lightboxImage || ''}
        altText={lightboxAlt}
        onClose={() => {
          setLightboxImage(null);
          setLightboxAlt('');
        }}
      />
    </div>
  );
}
