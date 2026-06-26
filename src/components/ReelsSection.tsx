import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { User } from '../types';
import { 
  Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, 
  Send, Plus, X, Sparkles, Film, ArrowUp, ArrowDown, ExternalLink,
  ChevronRight, BadgeCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion, arrayRemove,
  query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  
  // Try to extract the 11 character video ID
  let videoId: string | null = null;

  try {
    // 1. YouTube Shorts format: youtube.com/shorts/ID
    if (cleanUrl.includes('/shorts/')) {
      const parts = cleanUrl.split('/shorts/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#]/)[0].substring(0, 11);
      }
    }
    
    // 2. Standard YouTube watch?v=ID format
    if (!videoId && cleanUrl.includes('v=')) {
      const parts = cleanUrl.split('v=');
      if (parts[1]) {
        videoId = parts[1].split(/[&#]/)[0].substring(0, 11);
      }
    }

    // 3. Shortened youtu.be/ID format
    if (!videoId && cleanUrl.includes('youtu.be/')) {
      const parts = cleanUrl.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#]/)[0].substring(0, 11);
      }
    }

    // 4. Embed format: youtube.com/embed/ID
    if (!videoId && cleanUrl.includes('/embed/')) {
      const parts = cleanUrl.split('/embed/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#]/)[0].substring(0, 11);
      }
    }

    // 5. Live stream format: youtube.com/live/ID
    if (!videoId && cleanUrl.includes('/live/')) {
      const parts = cleanUrl.split('/live/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#]/)[0].substring(0, 11);
      }
    }

    // 6. Alternative watch with slash format (e.g. youtube.com/v/ID)
    if (!videoId && cleanUrl.includes('/v/')) {
      const parts = cleanUrl.split('/v/');
      if (parts[1]) {
        videoId = parts[1].split(/[?&#]/)[0].substring(0, 11);
      }
    }
    
    // Fallback regex match for any 11-char sequence if there's youtu in the domain
    if (!videoId && (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be'))) {
      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const match = cleanUrl.match(regExp);
      if (match && match[1]) {
        videoId = match[1];
      }
    }
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
  }

  // Ensure it's exactly 11 characters to avoid broken embeds
  if (videoId && videoId.length === 11) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`;
  }

  return null;
}

function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const cleanUrl = url.trim().toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.includes('mixkit.co/videos') ||
    cleanUrl.includes('pexels.com/video') ||
    cleanUrl.includes('pixabay.com/videos')
  );
}

interface ReelComment {
  id: string;
  userId: string;
  username: string;
  userFullName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userFullName: string;
  videoUrl: string;
  caption: string;
  likes: string[]; // List of userIds who liked
  comments: ReelComment[];
  createdAt: any;
}

interface ReelsSectionProps {
  currentUser: User;
  onViewProfile?: (user: User) => void;
}

// Preset vertical high-quality loop videos
const PRESET_REELS = [
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

export default function ReelsSection({ currentUser, onViewProfile }: ReelsSectionProps) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Subscribe to reels from Firestore
  useEffect(() => {
    const q = query(collection(db, 'reels'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let fetchedReels: Reel[] = [];
      snapshot.forEach((docSnap) => {
        fetchedReels.push({ id: docSnap.id, ...docSnap.data() } as Reel);
      });

      // If no reels are in the database yet, we seed them with preset reels to keep it rich!
      if (fetchedReels.length === 0) {
        // We write preset reels in background
        for (let i = 0; i < PRESET_REELS.length; i++) {
          const preset = PRESET_REELS[i];
          await addDoc(collection(db, 'reels'), {
            userId: 'system-seed-' + i,
            username: preset.username,
            userAvatar: preset.userAvatar,
            userFullName: preset.userFullName,
            videoUrl: preset.videoUrl,
            caption: preset.caption,
            likes: ['admin', 'picapau'],
            comments: [
              {
                id: 'comment-1',
                userId: 'admin',
                username: 'admin',
                userFullName: 'Administrador BLA BLA',
                userAvatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200',
                text: 'Que vídeo sensacional! Gostei muito! 🎯👏',
                createdAt: new Date().toISOString()
              }
            ],
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Sort reels by createdAt descending or seed order
        setReels(fetchedReels);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update playback when index or isPlaying / muted changes
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.log('Autoplay blocked or interrupted:', err));
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

  const currentReel = reels[currentIndex];

  const handleToggleLike = async () => {
    if (!currentReel) return;

    const isLiked = currentReel.likes.includes(currentUser.id);
    const updatedLikes = isLiked 
      ? currentReel.likes.filter(id => id !== currentUser.id)
      : [...currentReel.likes, currentUser.id];

    // Trigger double click like popup animation
    if (!isLiked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }

    try {
      await updateDoc(doc(db, 'reels', currentReel.id), {
        likes: updatedLikes
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReel || !commentText.trim()) return;

    const newComment: ReelComment = {
      id: Math.random().toString(36).substring(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      userFullName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'reels', currentReel.id), {
        comments: arrayUnion(newComment)
      });
      setCommentText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim()) return;

    setIsSubmitting(true);
    const videoSource = newVideoUrl.trim() || PRESET_REELS[Math.floor(Math.random() * PRESET_REELS.length)].videoUrl;

    try {
      await addDoc(collection(db, 'reels'), {
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        userFullName: currentUser.fullName,
        videoUrl: videoSource,
        caption: newCaption.trim(),
        likes: [currentUser.id],
        comments: [],
        createdAt: new Date().toISOString()
      });

      setNewCaption('');
      setNewVideoUrl('');
      setIsPublishModalOpen(false);
      setCurrentIndex(reels.length); // switch to the latest
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (!currentReel) return;
    navigator.clipboard.writeText(`https://blablaamigos.com/reels/${currentReel.id}`);
    alert('Link do Reel copiado para a área de transferência! Compartilhe com todos!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto animate-fade-in" id="reels-page-wrapper">
      {/* LEFT CONTAINER: DYNAMIC REEL PLAYER */}
      <div className="flex-1 flex flex-col items-center">
        
        {/* Title and Post Button */}
        <div className="w-full max-w-[310px] flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-rose-500 animate-pulse" />
            <h2 className="text-lg font-extrabold text-white tracking-tight font-mono">
              REELS & VÍDEOS
            </h2>
          </div>
          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Novo Vídeo
          </button>
        </div>

        {reels.length > 0 && currentReel ? (
          <div className="relative w-full max-w-[310px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col justify-between">
            
            {getYouTubeEmbedUrl(currentReel.videoUrl) ? (
              <iframe
                src={getYouTubeEmbedUrl(currentReel.videoUrl) || undefined}
                title={currentReel.caption}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-auto"
                style={{ border: 0 }}
              />
            ) : isDirectVideoUrl(currentReel.videoUrl) ? (
              /* HTML5 Video Element */
              <video
                ref={videoRef}
                src={currentReel.videoUrl}
                loop
                muted={muted}
                playsInline
                onClick={() => setIsPlaying(!isPlaying)}
                onDoubleClick={handleToggleLike}
                className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
              />
            ) : (
              /* Fallback UI for external social media links or non-direct video links */
              <div className="absolute inset-0 bg-[#0F0F23] flex flex-col items-center justify-center p-6 text-center z-0 gap-4 pointer-events-auto">
                <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/30 text-rose-400 animate-pulse">
                  <ExternalLink className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Vídeo Externo</h4>
                  <p className="text-[10px] text-gray-400 px-2 leading-relaxed">
                    Este link aponta para uma página externa ou plataforma de vídeo que não permite reprodução direta aqui por motivos de privacidade ou segurança.
                  </p>
                </div>
                <a
                  href={currentReel.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-[10px] rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer z-30"
                >
                  Abrir Vídeo na Nova Guia <ExternalLink className="w-3 h-3" />
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
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                >
                  <Heart className="w-24 h-24 fill-current" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overlay dark gradients */}
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

            {/* TOP BAR OVERLAYS (User Profile Info) */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <img 
                  src={currentReel.userAvatar} 
                  alt={currentReel.userFullName} 
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-rose-500 shadow-md cursor-pointer hover:scale-105 transition-all"
                  onClick={() => onViewProfile?.({ id: currentReel.userId, username: currentReel.username, fullName: currentReel.userFullName, avatar: currentReel.userAvatar } as User)}
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span 
                      onClick={() => onViewProfile?.({ id: currentReel.userId, username: currentReel.username, fullName: currentReel.userFullName, avatar: currentReel.userAvatar } as User)}
                      className="text-xs font-bold text-white hover:underline cursor-pointer tracking-tight drop-shadow"
                    >
                      {currentReel.userFullName}
                    </span>
                    <BadgeCheck className="w-3.5 h-3.5 text-rose-400 fill-white/10" />
                  </div>
                  <span className="text-[10px] text-gray-300 drop-shadow">@{currentReel.username}</span>
                </div>
              </div>

              {/* Sound Button */}
              {isDirectVideoUrl(currentReel.videoUrl) && (
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-white transition-all cursor-pointer shadow-md"
                >
                  {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
                </button>
              )}
            </div>

            {/* PLAY/PAUSE CENTER INDICATOR */}
            {!isPlaying && isDirectVideoUrl(currentReel.videoUrl) && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="p-4 bg-black/60 border border-white/20 rounded-full text-white/90 animate-ping">
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
                  className={`p-3 rounded-full border transition-all cursor-pointer shadow-lg ${
                    currentReel.likes.includes(currentUser.id)
                      ? 'bg-rose-500 border-rose-400 text-white shadow-rose-900/30'
                      : 'bg-black/55 border-white/10 text-white hover:bg-black/80'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${currentReel.likes.includes(currentUser.id) ? 'fill-current' : ''}`} />
                </motion.button>
                <span className="text-[10px] text-white font-mono font-bold mt-1 drop-shadow">
                  {currentReel.likes.length}
                </span>
              </div>

              {/* Comment Action */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={`p-3 rounded-full border bg-black/55 border-white/10 text-white hover:bg-black/80 transition-all cursor-pointer shadow-lg ${
                    showComments ? 'bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]' : ''
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
                  className="p-3 rounded-full border bg-black/55 border-white/10 text-white hover:bg-black/80 transition-all cursor-pointer shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <span className="text-[9px] text-gray-300 font-mono mt-1 drop-shadow">Comp.</span>
              </div>
            </div>

            {/* BOTTOM CAPTION AND NAVIGATION */}
            <div className="absolute bottom-4 left-4 right-16 z-20 flex flex-col gap-2">
              <p className="text-white text-xs leading-relaxed font-sans line-clamp-3 drop-shadow bg-black/30 p-2.5 rounded-xl border border-white/5 backdrop-blur-xs">
                {currentReel.caption}
              </p>

              {/* Vertical Navigation assist pointers */}
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                <span>Vídeo {currentIndex + 1} de {reels.length}</span>
                <span className="opacity-40">•</span>
                <span>Toque para Pausar</span>
              </div>
            </div>

            {/* PREV/NEXT ASSIST CONTROLS */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
              <button
                disabled={currentIndex === 0}
                onClick={handlePrevReel}
                className="p-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                title="Vídeo Anterior"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={currentIndex === reels.length - 1}
                onClick={handleNextReel}
                className="p-2 bg-black/40 hover:bg-black/60 border border-white/10 rounded-full text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                title="Próximo Vídeo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          <div className="w-full max-w-[310px] aspect-[9/16] bg-[#121225] border border-white/10 rounded-3xl flex flex-col items-center justify-center p-6 text-center gap-3">
            <Film className="w-12 h-12 text-gray-600 animate-pulse" />
            <h3 className="text-gray-300 font-bold text-sm">Nenhum Reel publicado ainda</h3>
            <p className="text-gray-500 text-xs">Seja o primeiro a publicar um vídeo de humor, turismo ou jogo goiano!</p>
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Publicar Primeiro Reel
            </button>
          </div>
        )}

      </div>

      {/* RIGHT CONTAINER: DYNAMIC COMMENTS & INFO SIDE PANEL */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        
        {/* Comments Box */}
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl flex flex-col h-[350px] lg:h-[480px] justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Comentários do Vídeo
                </h3>
              </div>
              <span className="text-[10px] bg-white/5 font-mono text-gray-400 px-2 py-0.5 rounded-full">
                {currentReel?.comments?.length || 0}
              </span>
            </div>

            {/* Comments List */}
            <div className="space-y-3 overflow-y-auto max-h-[240px] lg:max-h-[350px] pr-1 scrollbar-thin">
              {currentReel?.comments && currentReel.comments.length > 0 ? (
                currentReel.comments.map((comment) => (
                  <div key={comment.id} className="text-left bg-[#1A1A32]/40 border border-white/5 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.userFullName} 
                        className="w-5 h-5 rounded-full object-cover shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">{comment.userFullName}</p>
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-relaxed pl-6">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-2">
                  <p className="text-xs text-gray-500">Nenhum comentário ainda.</p>
                  <p className="text-[10px] text-gray-600">Escreva sua opinião abaixo e comente no reel!</p>
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
              className="flex-1 bg-[#1A1A32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 bg-[#00E5FF] hover:bg-[#00c2d6] text-[#0A0A14] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Info panel explaining Reels / videos */}
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl space-y-3 text-left">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4" /> Comunidade BLA BLA Reels
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Seja bem-vindo à nossa aba exclusiva de <strong>Shorts & Reels de Goiás</strong>!
          </p>
          <div className="space-y-1.5 text-[11px] text-gray-500">
            <p>• Compartilhe memórias de Pirenópolis, Goiânia ou Caldas Novas.</p>
            <p>• Divulgue seus games e pontuações máximas.</p>
            <p>• Dê duplo clique no vídeo para curtir rapidamente!</p>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* PUBLISH REEL MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121225] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-left"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1A1A32]">
                <div className="flex items-center gap-2">
                  <Film className="w-4.5 h-4.5 text-rose-500" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Publicar Novo Reel
                  </span>
                </div>
                <button 
                  onClick={() => setIsPublishModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePublishReel} className="p-6 space-y-4">
                
                {/* Select Preset Template / upload option */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Template de Vídeo Rápido</label>
                  <p className="text-[10px] text-gray-500 mb-1.5">Escolha um dos nossos vídeos de Goiás / Tecnologia ou cole um link de MP4 abaixo:</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_REELS.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setNewVideoUrl(preset.videoUrl);
                          if (!newCaption) setNewCaption(preset.caption);
                        }}
                        className={`text-left p-2 rounded-xl border text-[10px] flex flex-col gap-1.5 transition-all cursor-pointer ${
                          newVideoUrl === preset.videoUrl 
                            ? 'bg-rose-500/10 border-rose-500 text-white' 
                            : 'bg-[#1A1A32]/40 border-white/5 text-gray-400 hover:text-white hover:bg-[#1A1A32]'
                        }`}
                      >
                        <span className="font-bold truncate text-white">{preset.userFullName}</span>
                        <span className="text-[9px] line-clamp-1">{preset.caption}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video URL input */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">URL do Vídeo (MP4 ou YouTube)</label>
                  <input 
                    type="text" 
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="Cole um link MP4 direto (.mp4) ou um link do YouTube / YouTube Shorts"
                    className="w-full bg-[#1A1A32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                  <p className="text-[9px] text-gray-400">
                    Sua URL deve ser um link de vídeo direto (terminando em <strong>.mp4</strong>) ou qualquer link do <strong>YouTube / YouTube Shorts</strong>!
                  </p>
                </div>

                {/* Caption input */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Legenda / Hashtags *</label>
                  <textarea 
                    required
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    placeholder="Ex: Curtindo uma tarde maravilhosa no rio de águas quentes! 🏖️🌅 #caldasnovas #ferias #diversao"
                    rows={3}
                    className="w-full bg-[#1A1A32] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newCaption.trim()}
                    className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    {isSubmitting ? 'Publicando...' : 'Postar Vídeo Agora!'} <Sparkles className="w-4 h-4 animate-pulse" />
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
