import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { User } from '../types';
import { 
  Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, 
  Send, Plus, X, Sparkles, Film, ArrowUp, ArrowDown, ExternalLink,
  BadgeCheck, Trash2, Upload, Video as VideoIcon, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion,
  query, deleteDoc, setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Helper to clean and format any input video URL
export function sanitizeVideoUrl(url: string): string {
  if (!url) return '';
  let trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

// Helper to extract YouTube embed URL
export function getYouTubeEmbedUrl(url: string, muted: boolean = false): string | null {
  if (!url) return null;
  const cleanUrl = sanitizeVideoUrl(url);
  
  let videoId: string | null = null;

  try {
    // 1. YouTube Shorts: youtube.com/shorts/ID
    if (cleanUrl.includes('/shorts/')) {
      const parts = cleanUrl.split('/shorts/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#/]/)[0];
      }
    }
    
    // 2. Standard watch?v=ID
    if (!videoId && cleanUrl.includes('v=')) {
      const match = cleanUrl.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    }

    // 3. youtu.be/ID
    if (!videoId && cleanUrl.includes('youtu.be/')) {
      const parts = cleanUrl.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#/]/)[0];
      }
    }

    // 4. youtube.com/embed/ID
    if (!videoId && cleanUrl.includes('/embed/')) {
      const parts = cleanUrl.split('/embed/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#/]/)[0];
      }
    }

    // 5. youtube.com/live/ID
    if (!videoId && cleanUrl.includes('/live/')) {
      const parts = cleanUrl.split('/live/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#/]/)[0];
      }
    }

    // 6. Generic regex fallback
    if (!videoId) {
      const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
      const match = cleanUrl.match(regExp);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
  }

  if (videoId && videoId.length >= 10) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`;
  }

  return null;
}

// Helper to extract Vimeo embed URL
export function getVimeoEmbedUrl(url: string, muted: boolean = false): string | null {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/);
  if (match && match[3]) {
    return `https://player.vimeo.com/video/${match[3]}?autoplay=1&muted=${muted ? 1 : 0}&loop=1`;
  }
  return null;
}

// Helper to check if URL or base64 is a direct HTML5 playable video
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.trim().toLowerCase();
  return (
    cleanUrl.startsWith('data:video/') ||
    cleanUrl.startsWith('blob:') ||
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.includes('mixkit.co/videos') ||
    cleanUrl.includes('pexels.com/video') ||
    cleanUrl.includes('pixabay.com/videos') ||
    cleanUrl.includes('cloudinary.com') ||
    cleanUrl.includes('storage.googleapis.com') ||
    cleanUrl.includes('firebasestorage.googleapis.com')
  );
}

export interface ReelComment {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userFullName: string;
  videoUrl: string;
  caption: string;
  likes: string[];
  comments: ReelComment[];
  createdAt: string;
}

interface ReelsSectionProps {
  currentUser: User;
  onViewProfile?: (user: User) => void;
}

// Preset vertical high-quality loop videos
const PRESET_REELS: Omit<Reel, 'id' | 'userId' | 'likes' | 'comments' | 'createdAt'>[] = [
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-looking-at-phone-39878-large.mp4',
    caption: 'Testando a nova rede social BLA BLA, AMIGOS! O futuro da interatividade chegou! 🚀✨ #tecnologia #neon #blablaamigos',
    userFullName: 'Pedro Dev Cerrado',
    username: 'pedro_dev',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
  },
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mysterious-forest-with-bright-sunbeams-42289-large.mp4',
    caption: 'Pensa num paraíso! Chapada dos Veadeiros em Goiás é simplesmente surreal 🌲☀️🔋 #goias #turismo #natureza #veadeiros',
    userFullName: 'Marina Viajante',
    username: 'marina_viaja',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
  },
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-keyboard-and-setup-in-colorful-neon-lights-40081-large.mp4',
    caption: 'Setup gamer goiano atualizado! Quem aí encara uma partida de Trivia no novo BLA BLA, AMIGOS? 👾🎮💥 #setup #gamer #jogos',
    userFullName: 'Lucas Gamer Pro',
    username: 'lucas_pro',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hand-holding-smartphone-with-social-media-app-open-42410-large.mp4',
    caption: 'Só o BLA BLA AMIGOS tem essa agilidade e interatividade instantânea. Compartilhe esse vídeo com seus amigos! 📱🚀🍀 #reels #social',
    userFullName: 'Beatriz Influencer',
    username: 'bia_influx',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  }
];

const INITIAL_FALLBACK_REELS: Reel[] = PRESET_REELS.map((p, i) => ({
  id: `preset-reel-${i + 1}`,
  userId: `user-preset-${i + 1}`,
  username: p.username,
  userAvatar: p.userAvatar,
  userFullName: p.userFullName,
  videoUrl: p.videoUrl,
  caption: p.caption,
  likes: ['user-1', 'admin'],
  comments: [
    {
      id: `c-preset-${i}`,
      userId: 'admin',
      username: 'admin',
      userFullName: 'Equipe BLA BLA, AMIGOS',
      userAvatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200',
      text: 'Vídeo espetacular! Bem-vindo à nossa aba de Reels & Vídeos! 🎬👏',
      createdAt: new Date().toISOString()
    }
  ],
  createdAt: new Date(Date.now() - (i + 1) * 3600000).toISOString()
}));

export default function ReelsSection({ currentUser, onViewProfile }: ReelsSectionProps) {
  const [reels, setReels] = useState<Reel[]>(INITIAL_FALLBACK_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Local video upload state
  const [uploadSource, setUploadSource] = useState<'url' | 'file' | 'preset'>('url');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to reels from Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'reels'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetchedReels: Reel[] = [];
          snapshot.forEach((docSnap) => {
            fetchedReels.push({ id: docSnap.id, ...docSnap.data() } as Reel);
          });
          
          // Sort newest first
          fetchedReels.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });

          setReels(fetchedReels);
        }
      }, (err) => {
        console.warn('Firestore reels subscription error, using local fallback:', err);
      });
    } catch (e) {
      console.warn('Could not initialize firestore reels listener:', e);
    }

    return () => unsubscribe();
  }, []);

  // Update HTML5 video playback when index or isPlaying / muted changes
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.log('Autoplay blocked, user interaction required:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, reels]);

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevReel = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleDeleteReel = async (reelId: string) => {
    try {
      // Optimistic removal
      setReels(prev => prev.filter(r => r.id !== reelId));
      setDeletingId(null);
      if (currentIndex >= reels.length - 1) {
        setCurrentIndex(Math.max(0, reels.length - 2));
      }
      // Firestore removal
      await deleteDoc(doc(db, 'reels', reelId));
    } catch (err) {
      console.error('Error deleting reel:', err);
    }
  };

  const currentReel = reels[currentIndex] || reels[0];

  const handleToggleLike = async () => {
    if (!currentReel) return;

    const isLiked = currentReel.likes?.includes(currentUser.id);
    const updatedLikes = isLiked 
      ? currentReel.likes.filter(id => id !== currentUser.id)
      : [...(currentReel.likes || []), currentUser.id];

    // Trigger double click like popup animation
    if (!isLiked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }

    // Optimistic update
    setReels(prev => prev.map(r => r.id === currentReel.id ? { ...r, likes: updatedLikes } : r));

    try {
      await updateDoc(doc(db, 'reels', currentReel.id), {
        likes: updatedLikes
      });
    } catch (err) {
      console.warn('Firestore update like failed:', err);
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentReel || !commentText.trim()) return;

    const newComment: ReelComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser.id,
      username: currentUser.username,
      userFullName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(currentReel.comments || []), newComment];

    // Optimistic update
    setReels(prev => prev.map(r => r.id === currentReel.id ? { ...r, comments: updatedComments } : r));
    setCommentText('');

    try {
      await updateDoc(doc(db, 'reels', currentReel.id), {
        comments: arrayUnion(newComment)
      });
    } catch (err) {
      console.warn('Firestore update comment failed:', err);
    }
  };

  // Handle local video file selection
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setVideoFileError('Por favor, selecione um arquivo de vídeo válido (.mp4, .webm, .mov).');
      return;
    }

    // Cap at 25MB for base64 / blob
    if (file.size > 25 * 1024 * 1024) {
      setVideoFileError('O vídeo é muito pesado. Escolha um vídeo de até 25MB ou use um link do YouTube.');
      return;
    }

    setIsUploadingVideo(true);
    setVideoFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNewVideoUrl(dataUrl);
      setIsUploadingVideo(false);
    };
    reader.onerror = () => {
      setVideoFileError('Erro ao carregar arquivo de vídeo. Tente usar um link web ou YouTube.');
      setIsUploadingVideo(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePublishReel = async (e: FormEvent) => {
    e.preventDefault();
    
    // Choose video source and sanitize
    const rawVideoSource = newVideoUrl.trim();
    let videoSource = rawVideoSource || (uploadSource === 'preset' ? PRESET_REELS[0].videoUrl : '');

    if (!videoSource) {
      alert('Por favor, insira o link do vídeo (YouTube ou MP4) ou selecione um arquivo de vídeo do seu celular/computador.');
      return;
    }

    // Auto-sanitize URL
    videoSource = sanitizeVideoUrl(videoSource);

    setIsSubmitting(true);
    const finalCaption = newCaption.trim() || `Vídeo incrível compartilhado por ${currentUser.fullName}! 🎬✨ #blablaamigos #reels`;

    const newReelId = `reel-${Date.now()}`;
    const newReel: Reel = {
      id: newReelId,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      userFullName: currentUser.fullName,
      videoUrl: videoSource,
      caption: finalCaption,
      likes: [currentUser.id],
      comments: [],
      createdAt: new Date().toISOString()
    };

    // 1. Optimistically add to local reels immediately
    setReels(prev => [newReel, ...prev]);
    setCurrentIndex(0);
    setIsPlaying(true);

    // 2. Persist to Firestore Reels collection
    try {
      await setDoc(doc(db, 'reels', newReelId), newReel);
      
      // Also persist to Posts collection so it appears in the main feed
      const newPostId = `post-reel-${Date.now()}`;
      await setDoc(doc(db, 'posts', newPostId), {
        id: newPostId,
        userId: currentUser.id,
        content: finalCaption,
        mediaUrl: videoSource,
        mediaType: 'video',
        createdAt: new Date().toISOString(),
        reactions: { likes: [currentUser.id], loves: [], applauds: [] },
        comments: [],
        sharesCount: 0
      });
    } catch (err) {
      console.warn('Firestore sync kept in local state:', err);
    }

    // 3. Reset form and notify user
    setNewCaption('');
    setNewVideoUrl('');
    setIsPublishModalOpen(false);
    setIsSubmitting(false);
    setSuccessToast('🎉 Vídeo publicado com sucesso nos Reels e no Feed!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleShare = () => {
    if (!currentReel) return;
    const shareUrl = `https://blablabladosamigos.online/?reel=${currentReel.id}`;
    navigator.clipboard.writeText(shareUrl);
    setSuccessToast('📋 Link do Reel copiado para a área de transferência!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Video embed calculations
  const ytEmbed = currentReel ? getYouTubeEmbedUrl(currentReel.videoUrl, muted) : null;
  const vimeoEmbed = currentReel ? getVimeoEmbedUrl(currentReel.videoUrl, muted) : null;
  const isDirect = currentReel ? isDirectVideoUrl(currentReel.videoUrl) : false;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto animate-fade-in" id="reels-page-wrapper">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold font-mono border border-white/20"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            {successToast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT CONTAINER: DYNAMIC REEL PLAYER */}
      <div className="flex-1 flex flex-col items-center">
        
        {/* Header Title and Post Button */}
        <div className="w-full max-w-[340px] flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-rose-500 animate-pulse" />
            <h2 className="text-lg font-extrabold text-white tracking-tight font-mono">
              REELS & VÍDEOS
            </h2>
          </div>
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-rose-900/30"
          >
            <Plus className="w-4 h-4" /> Novo Vídeo
          </button>
        </div>

        {currentReel ? (
          <div className="relative w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.85)] border border-white/15 flex flex-col justify-between select-none">
            
            {/* VIDEO PLAYER RENDERER */}
            {ytEmbed ? (
              /* YouTube Iframe Player */
              <iframe
                src={ytEmbed}
                title={currentReel.caption}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-auto"
                style={{ border: 0 }}
              />
            ) : vimeoEmbed ? (
              /* Vimeo Iframe Player */
              <iframe
                src={vimeoEmbed}
                title={currentReel.caption}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-auto"
                style={{ border: 0 }}
              />
            ) : isDirect ? (
              /* HTML5 Direct Video Element */
              <video
                ref={videoRef}
                src={currentReel.videoUrl}
                loop
                muted={muted}
                playsInline
                autoPlay
                onClick={() => setIsPlaying(!isPlaying)}
                onDoubleClick={handleToggleLike}
                className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
              />
            ) : (
              /* Fallback for general web video / link */
              <div className="absolute inset-0 bg-[#0F0F23] flex flex-col items-center justify-center p-6 text-center z-0 gap-4 pointer-events-auto">
                <div className="p-4 bg-rose-500/10 rounded-full border border-rose-500/30 text-rose-400 animate-pulse">
                  <VideoIcon className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Vídeo Externo</h4>
                  <p className="text-xs text-gray-400 px-2 leading-relaxed">
                    Link de vídeo anexado por <strong>{currentReel.userFullName}</strong>.
                  </p>
                </div>
                <a
                  href={currentReel.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer z-30"
                >
                  Assistir no Site de Origem <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Simulated overlay double-click heart animation */}
            <AnimatePresence>
              {showHeartAnimation && (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0, 1, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                >
                  <Heart className="w-24 h-24 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline Deletion Confirmation Overlay */}
            <AnimatePresence>
              {deletingId === currentReel.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40 rounded-3xl"
                >
                  <div className="p-3.5 bg-red-500/25 rounded-full border border-red-500/35 text-red-500 mb-3 animate-bounce">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 uppercase tracking-wider font-mono">Excluir este vídeo?</h3>
                  <p className="text-xs text-gray-400 max-w-[220px] mb-4 leading-relaxed">
                    Você tem certeza de que deseja excluir seu vídeo permanentemente dos Reels?
                  </p>
                  <div className="flex gap-2.5 w-full max-w-[220px]">
                    <button
                      onClick={() => setDeletingId(null)}
                      className="flex-1 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleDeleteReel(currentReel.id)}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-red-900/40"
                    >
                      Excluir
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overlay dark gradients */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

            {/* TOP BAR OVERLAYS (User Profile Info) */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2.5">
                <img 
                  src={currentReel.userAvatar} 
                  alt={currentReel.userFullName} 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border-2 border-rose-500 shadow-md cursor-pointer hover:scale-105 transition-all bg-neutral-800"
                  onClick={() => onViewProfile?.({ id: currentReel.userId, username: currentReel.username, fullName: currentReel.userFullName, avatar: currentReel.userAvatar } as User)}
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span 
                      onClick={() => onViewProfile?.({ id: currentReel.userId, username: currentReel.username, fullName: currentReel.userFullName, avatar: currentReel.userAvatar } as User)}
                      className="text-xs font-bold text-white hover:underline cursor-pointer tracking-tight drop-shadow truncate max-w-[140px]"
                    >
                      {currentReel.userFullName}
                    </span>
                    <BadgeCheck className="w-3.5 h-3.5 text-rose-400 fill-white/10 shrink-0" />
                  </div>
                  <span className="text-[10px] text-gray-300 drop-shadow block">@{currentReel.username}</span>
                </div>
              </div>

              {/* Top Controls Action Bar */}
              <div className="flex items-center gap-1.5">
                {/* Sound Button */}
                {(isDirect || ytEmbed !== null || vimeoEmbed !== null) && (
                  <button
                    onClick={() => setMuted(!muted)}
                    className="p-2 bg-black/50 hover:bg-black/80 border border-white/15 rounded-full text-white transition-all cursor-pointer shadow-md"
                    title={muted ? "Ativar som" : "Mutar som"}
                  >
                    {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
                  </button>
                )}

                {/* Delete Button (For post owner or administrator) */}
                {(currentReel.userId === currentUser.id || currentUser.id === 'admin' || currentUser.id === 'user-1') && (
                  <button
                    onClick={() => setDeletingId(currentReel.id)}
                    className="p-2 bg-black/50 hover:bg-red-600 border border-white/15 hover:border-red-500/50 rounded-full text-red-400 hover:text-white transition-all cursor-pointer shadow-md"
                    title="Excluir este vídeo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* PLAY/PAUSE CENTER INDICATOR */}
            {!isPlaying && isDirect && (
              <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
                <div className="p-4 bg-black/70 border border-white/20 rounded-full text-white animate-pulse">
                  <Play className="w-8 h-8 fill-current" />
                </div>
              </div>
            )}

            {/* RIGHT SIDEBAR ACTIONS (LIKE, COMMENT, SHARE) */}
            <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4.5 z-20">
              {/* Like Action */}
              <div className="flex flex-col items-center">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleToggleLike}
                  className={`p-3 rounded-full border transition-all cursor-pointer shadow-xl ${
                    currentReel.likes?.includes(currentUser.id)
                      ? 'bg-rose-500 border-rose-400 text-white shadow-rose-900/40'
                      : 'bg-black/60 border-white/15 text-white hover:bg-black/90'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${currentReel.likes?.includes(currentUser.id) ? 'fill-current' : ''}`} />
                </motion.button>
                <span className="text-[10px] text-white font-mono font-bold mt-1 drop-shadow">
                  {currentReel.likes?.length || 0}
                </span>
              </div>

              {/* Comment Action */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`p-3 rounded-full border bg-black/60 border-white/15 text-white hover:bg-black/90 transition-all cursor-pointer shadow-xl ${
                    showComments ? 'bg-[#00E5FF]/25 border-[#00E5FF]/60 text-[#00E5FF]' : ''
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <span className="text-[10px] text-white font-mono font-bold mt-1 drop-shadow">
                  {currentReel.comments?.length || 0}
                </span>
              </div>

              {/* Share Action */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full border bg-black/60 border-white/15 text-white hover:bg-black/90 transition-all cursor-pointer shadow-xl"
                  title="Copiar Link"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <span className="text-[9px] text-gray-300 font-mono mt-1 drop-shadow">Comp.</span>
              </div>
            </div>

            {/* BOTTOM CAPTION AND NAVIGATION */}
            <div className="absolute bottom-4 left-4 right-16 z-20 flex flex-col gap-2">
              <p className="text-white text-xs leading-relaxed font-sans line-clamp-3 drop-shadow bg-black/40 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
                {currentReel.caption}
              </p>

              {/* Vertical Navigation assist pointers */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-mono">
                <span>Vídeo {currentIndex + 1} de {reels.length}</span>
                <span className="opacity-40">•</span>
                <span className="text-rose-300 font-bold">Role ou use as setas</span>
              </div>
            </div>

            {/* PREV/NEXT ASSIST CONTROLS */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrevReel}
                className="p-2.5 bg-black/50 hover:bg-black/80 border border-white/15 rounded-full text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                title="Vídeo Anterior"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={currentIndex === reels.length - 1}
                onClick={handleNextReel}
                className="p-2.5 bg-black/50 hover:bg-black/80 border border-white/15 rounded-full text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg"
                title="Próximo Vídeo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="w-full max-w-[340px] aspect-[9/16] bg-[#121225] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center gap-3">
            <Film className="w-12 h-12 text-rose-500 animate-pulse" />
            <h3 className="text-gray-200 font-bold text-sm">Pronto para o primeiro Reel!</h3>
            <p className="text-gray-400 text-xs">Compartilhe um link do YouTube, MP4 ou selecione um vídeo para assistir agora!</p>
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="mt-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Publicar Primeiro Reel
            </button>
          </div>
        )}

      </div>

      {/* RIGHT CONTAINER: COMMENTS & COMMUNITY INFO */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        
        {/* Comments Box */}
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl flex flex-col h-[380px] lg:h-[500px] justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Comentários do Vídeo
                </h3>
              </div>
              <span className="text-[10px] bg-white/10 font-mono text-gray-300 px-2 py-0.5 rounded-full font-bold">
                {currentReel?.comments?.length || 0}
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-3 overflow-y-auto max-h-[260px] lg:max-h-[360px] pr-1 scrollbar-thin">
              {currentReel?.comments && currentReel.comments.length > 0 ? (
                currentReel.comments.map((comment) => (
                  <div key={comment.id} className="text-left bg-[#1A1A32]/60 border border-white/5 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.userFullName} 
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-white/10" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate">{comment.userFullName}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed pl-8">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-14 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Nenhum comentário ainda.</p>
                  <p className="text-[11px] text-gray-500">Escreva sua opinião abaixo e interaja com o criador!</p>
                </div>
              )}
            </div>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex gap-2">
            <input 
              type="text" 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicionar comentário..."
              className="flex-1 bg-[#1A1A32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
            />
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="p-2.5 bg-[#00E5FF] hover:bg-[#00c2d6] text-[#0A0A14] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Info panel explaining Reels / videos */}
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl space-y-3 text-left">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4" /> Comunidade BLA BLA Reels
          </div>
          <p className="text-gray-300 text-xs leading-relaxed">
            Compartilhe vídeos curtos, Shorts do YouTube ou arquivos do seu dispositivo com toda a nossa comunidade!
          </p>
          <div className="space-y-1.5 text-[11px] text-gray-400 font-medium">
            <p>• Suporta links de <strong>YouTube</strong>, <strong>Shorts</strong>, <strong>Vimeo</strong> e <strong>MP4</strong>.</p>
            <p>• Carregamento instantâneo e reprodução vertical otimizada.</p>
            <p>• Dê duplo clique na tela para curtir rapidamente!</p>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* PUBLISH REEL MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121225] border border-white/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col text-left my-8"
            >
              <div className="p-4.5 border-b border-white/10 flex items-center justify-between bg-[#1A1A32]">
                <div className="flex items-center gap-2.5">
                  <Film className="w-5 h-5 text-rose-500" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Publicar Novo Vídeo / Reel
                  </span>
                </div>
                <button 
                  onClick={() => setIsPublishModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublishReel} className="p-5 md:p-6 space-y-4.5">
                
                {/* Method selector tab */}
                <div className="flex bg-[#1A1A32] p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setUploadSource('url')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      uploadSource === 'url' ? 'bg-rose-500 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Link do Vídeo (YouTube/MP4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('file')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      uploadSource === 'file' ? 'bg-rose-500 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Arquivo do Dispositivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('preset')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      uploadSource === 'preset' ? 'bg-rose-500 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Modelos Rápidos
                  </button>
                </div>

                {/* Option 1: URL input */}
                {uploadSource === 'url' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-gray-300 tracking-wider flex items-center justify-between">
                      <span>URL do Vídeo (YouTube, Shorts, Vimeo ou MP4) *</span>
                    </label>
                    <input 
                      type="text" 
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="Cole o link aqui: youtube.com/shorts/... ou youtu.be/... ou .mp4"
                      className="w-full bg-[#1A1A32] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 font-mono"
                    />

                    {/* Live Preview if URL entered */}
                    {newVideoUrl.trim() && (
                      <div className="p-2.5 bg-[#1A1A32]/90 border border-rose-500/30 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Link detectado:
                        </div>
                        <p className="text-[11px] text-gray-300 font-mono break-all truncate">
                          {sanitizeVideoUrl(newVideoUrl)}
                        </p>
                      </div>
                    )}

                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-[11px] text-gray-300">
                      <p className="font-bold text-rose-300">💡 Exemplos de links aceitos:</p>
                      <p>• YouTube: <span className="font-mono text-gray-400">youtube.com/watch?v=...</span></p>
                      <p>• YouTube Shorts: <span className="font-mono text-gray-400">youtube.com/shorts/...</span> ou <span className="font-mono text-gray-400">youtu.be/...</span></p>
                      <p>• Arquivos Diretos: <span className="font-mono text-gray-400">https://.../video.mp4</span></p>
                    </div>
                  </div>
                )}

                {/* Option 2: Local file upload */}
                {uploadSource === 'file' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-gray-300 tracking-wider">
                      Selecione um Vídeo do seu Celular ou Computador
                    </label>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />

                    {newVideoUrl && newVideoUrl.startsWith('data:video') ? (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-300">Vídeo carregado com sucesso!</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setNewVideoUrl('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-xs text-red-400 hover:underline cursor-pointer"
                        >
                          Trocar
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/20 hover:border-rose-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer bg-[#1A1A32]/40 hover:bg-[#1A1A32]/80 transition-all"
                      >
                        {isUploadingVideo ? (
                          <>
                            <Upload className="w-8 h-8 text-rose-400 animate-bounce" />
                            <span className="text-xs font-bold text-rose-300">Processando vídeo...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-rose-500" />
                            <span className="text-xs font-bold text-white">Clique para escolher o arquivo de vídeo</span>
                            <span className="text-[10px] text-gray-400">MP4, WEBM ou MOV até 25MB</span>
                          </>
                        )}
                      </div>
                    )}

                    {videoFileError && (
                      <div className="p-2 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-1.5 text-red-300 text-[11px]">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {videoFileError}
                      </div>
                    )}
                  </div>
                )}

                {/* Option 3: Presets */}
                {uploadSource === 'preset' && (
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase font-bold text-gray-300 tracking-wider">
                      Escolha um Modelo de Demonstração
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_REELS.map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setNewVideoUrl(preset.videoUrl);
                            if (!newCaption) setNewCaption(preset.caption);
                          }}
                          className={`text-left p-2.5 rounded-xl border text-[11px] flex flex-col gap-1 transition-all cursor-pointer ${
                            newVideoUrl === preset.videoUrl 
                              ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg' 
                              : 'bg-[#1A1A32]/60 border-white/5 text-gray-400 hover:text-white hover:bg-[#1A1A32]'
                          }`}
                        >
                          <span className="font-bold truncate text-white">{preset.userFullName}</span>
                          <span className="text-[10px] line-clamp-2 text-gray-300">{preset.caption}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Caption input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase font-bold text-gray-300 tracking-wider">
                    Legenda & Hashtags
                  </label>
                  <textarea 
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Escreva uma legenda animada para o seu vídeo... (Ex: Curtindo uma tarde maravilhosa! 🏖️ #turismo #amigos)"
                    rows={3}
                    className="w-full bg-[#1A1A32] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingVideo || (!newVideoUrl.trim() && uploadSource !== 'preset')}
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-rose-900/40 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publicando Vídeo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Postar Vídeo Agora nos Reels!
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
