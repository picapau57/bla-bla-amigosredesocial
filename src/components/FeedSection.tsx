import { useState, FormEvent } from 'react';
import { User, Post, Ad } from '../types';
import { 
  Image as ImageIcon, Video, Send, Share2, MessageSquare, AlertCircle, 
  MapPin, CheckCircle, Flame, Star, Sparkles, ExternalLink, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedSectionProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  ads: Ad[];
  onAddPost: (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      const videoId = match[2];
      return {
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`,
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
  
  // Track open comment trays
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  // Saved / Bookmark posts
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  // Post suggestions images
  const sampleMediaUrls = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800'
  ];

  const handleCreatePost = (e: FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && !newPostMedia) return;

    onAddPost(newPostContent, newPostMedia || undefined, newPostMedia ? mediaType : undefined);
    setNewPostContent('');
    setNewPostMedia('');
    setShowMediaInput(false);
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
      
      {/* POST CREATOR BOX */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl" id="feed-creator-box">
        <div className="flex items-start gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#7C4DFF]"
          />
          <form onSubmit={handleCreatePost} className="w-full">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder={`Olá, ${currentUser.fullName.split(' ')[0]}! O que está compartilhando com os amigos hoje?`}
              className="w-full bg-[#0A0A14]/70 text-gray-100 placeholder-gray-500 rounded-xl p-3 text-xs md:text-sm border border-white/5 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 resize-none min-h-[85px] transition-all"
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
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-450">
                    <span className="text-gray-400">Vincular Mídia Externa</span>
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => setMediaType('image')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${mediaType === 'image' ? 'bg-[#7C4DFF]/20 text-[#00E5FF] font-black' : 'text-gray-400'}`}
                      >
                        Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('video')}
                        className={`px-2 py-0.5 rounded cursor-pointer transition-all ${mediaType === 'video' ? 'bg-[#FF5722]/20 text-[#FF5722] font-black' : 'text-gray-400'}`}
                      >
                        Vídeo Curto/Reels
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="URL da imagem ou vídeo do Unsplash, Youtube, etc."
                    value={newPostMedia}
                    onChange={(e) => setNewPostMedia(e.target.value)}
                    className="w-full bg-[#121225] border border-white/10 text-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
                  />

                  {/* Suggest random photo options under */}
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-500 font-mono">Sugestão:</span>
                    {sampleMediaUrls.map((preset, pidx) => (
                      <button
                        key={pidx}
                        type="button"
                        onClick={() => {
                          setNewPostMedia(preset);
                          setMediaType('image');
                        }}
                        className={`w-9 h-9 rounded-lg overflow-hidden border transition-all ${
                          newPostMedia === preset ? 'border-[#00E5FF] ring-2 ring-[#00E5FF]/20' : 'border-white/5'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BUTTON BAR */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-3">
              <div className="flex items-center gap-1.5 md:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(!showMediaInput);
                    setMediaType('image');
                  }}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-[#00E5FF] text-[11px] md:text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-[#1E1E30]/60 transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
                  <span>Adicionar Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaInput(!showMediaInput);
                    setMediaType('video');
                  }}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-[#FF5722] text-[11px] md:text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-[#1E1E30]/60 transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#FF5722] animate-pulse" />
                  <span>Vídeo/Reels</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!newPostContent.trim() && !newPostMedia}
                className="bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer uppercase tracking-wider h-9 transition-all"
              >
                <span>Publicar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* FEED ITEMS LIST */}
      <div className="space-y-6" id="news-feed-posts">
        {mergedFeedItems.length === 0 ? (
          <div className="text-center bg-[#121225] border border-white/10 rounded-2xl py-12 px-4 shadow-lg text-gray-400">
            <p className="text-sm font-mono uppercase tracking-widest text-[#00E5FF]">Nenhum post disponível</p>
            <p className="text-xs text-gray-500 mt-2">Seja o pioneiro e publique uma novidade agora mesmo!</p>
          </div>
        ) : (
          mergedFeedItems.map((item, index) => {
            // IF it is inline advertisement
            if ('isAd' in item) {
              const ad = item.ad;
              return (
                <div 
                  key={`ad-${ad.id}-${index}`} 
                  className="bg-[#121225] border border-[#FF5722]/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
                  id={`inline-ad-card-${index}`}
                >
                  <div className="absolute top-0 left-0 bg-[#FF5722] text-white px-3 py-1 font-mono uppercase text-[9px] font-extrabold rounded-br-xl flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-white" /> Conexão Patrocinada
                  </div>

                  <div className="mt-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-[#0A0A14] border border-white/5 shrink-0">
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm text-white uppercase tracking-tight text-[#00E5FF]">{ad.title}</h4>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{ad.description}</p>
                      
                      <div className="mt-4 flex items-center gap-3">
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => onAdClick(ad.id)}
                          className="bg-white hover:bg-white/90 text-[#0E0E1E] font-black text-xs py-2 px-4 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                        >
                          <span>Visitar Página</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <span className="text-[10px] text-gray-500 font-mono">Promoção Patrocinada por Parceiro</span>
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
                className="bg-[#121225] border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                id={`feed-post-card-${post.id}`}
              >
                
                {/* AUTHOR BANNER */}
                <div className="px-4.5 pt-4.5 pb-2.5 flex items-center justify-between animate-fade-in-up">
                  <div 
                    onClick={() => onViewProfile?.(author)}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    <img
                      src={author.avatar}
                      alt={author.fullName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                    />
                    <div>
                      <div className="text-xs md:text-sm font-extrabold text-white flex items-center gap-1">
                        {author.fullName}
                        {author.isVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" title="Verificado" />
                        )}
                        {post.isPatrocinado && (
                          <span className="bg-[#FF5722]/10 text-[#FF5722] text-[8px] font-extrabold font-mono tracking-wider px-1.5 py-0.5 rounded uppercase ml-1 border border-[#FF5722]/20">
                            Patrocinado
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-450 text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                        <span>ID: {author.username}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => toggleSavePost(post.id)}
                    className="text-gray-400 hover:text-[#00E5FF] p-1.5 rounded-lg transition-colors cursor-pointer"
                    title={isSaved ? 'Remover dos salvos' : 'Salvar postagem'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'text-[#00E5FF] fill-[#00E5FF]/20' : ''}`} />
                  </button>
                </div>

                {/* TEXT CONTENT */}
                <div className="px-5 pb-3">
                  <p className="text-gray-200 text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* ATTACHED MEDIA */}
                {post.mediaUrl && (
                  <div className="border-t border-b border-[#0A0A14] bg-[#0A0A14] overflow-hidden max-h-[460px] flex items-center justify-center">
                    {post.mediaType === 'video' ? (
                      <ReelsVideoPlayer mediaUrl={post.mediaUrl} />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="Post attachment"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain max-h-[380px] hover:scale-[1.01] transition-transform duration-300"
                      />
                    )}
                  </div>
                )}

                {/* METRICS ROW */}
                <div className="px-5 py-2.5 flex items-center justify-between text-[11px] font-mono text-gray-400 border-b border-white/5">
                  <div className="flex gap-2">
                    {post.reactions?.likes.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[#00E5FF] font-bold">
                        👍 {post.reactions.likes.length}
                      </span>
                    )}
                    {post.reactions?.loves.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[#FF5722] font-bold">
                        💖 {post.reactions.loves.length}
                      </span>
                    )}
                    {post.reactions?.applauds.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[#00E676] font-bold">
                        👏 {post.reactions.applauds.length}
                      </span>
                    )}
                    {(!post.reactions?.likes.length && !post.reactions?.loves.length && !post.reactions?.applauds.length) && (
                      <span>Nenhuma reação ainda</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveCommentsPostId(isCommentTrayOpen ? null : post.id)}
                      className="hover:underline hover:text-white cursor-pointer"
                    >
                      {displayComments.length} {displayComments.length === 1 ? 'Comentário' : 'Comentários'}
                    </button>
                    <span>•</span>
                    <button 
                      onClick={() => onShare(post.id)}
                      className="hover:underline hover:text-white flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{post.sharesCount} compartilhamentos</span>
                    </button>
                  </div>
                </div>

                {/* MULTI REACTION BAR & INTERACTIONS */}
                <div className="px-3.5 py-1.5 bg-[#0A0A14]/30 flex items-center justify-around gap-1.5 md:gap-3">
                  
                  {/* Curtir 👍 */}
                  <button
                    onClick={() => onToggleReaction(post.id, 'likes')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl transition-all font-bold cursor-pointer ${
                      hasLiked 
                        ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.2)]' 
                        : 'text-gray-450 text-gray-400 hover:bg-[#1E1E30]/60 hover:text-[#00E5FF]'
                    }`}
                  >
                    <span className="text-sm">👍</span>
                    <span className="hidden sm:inline">Curtir</span>
                  </button>

                  {/* Amar 💖 */}
                  <button
                    onClick={() => onToggleReaction(post.id, 'loves')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl transition-all font-bold cursor-pointer ${
                      hasLoved 
                        ? 'bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] drop-shadow-[0_0_8px_rgba(255,87,34,0.2)]' 
                        : 'text-gray-450 text-gray-400 hover:bg-[#1E1E30]/60 hover:text-[#FF5722]'
                    }`}
                  >
                    <span className="text-sm">💖</span>
                    <span className="hidden sm:inline">Amar</span>
                  </button>

                  {/* Aplaudir 👏 */}
                  <button
                    onClick={() => onToggleReaction(post.id, 'applauds')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl transition-all font-bold cursor-pointer ${
                      hasApplauded 
                        ? 'bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] drop-shadow-[0_0_8px_rgba(0,230,118,0.2)]' 
                        : 'text-gray-450 text-gray-400 hover:bg-[#1E1E30]/60 hover:text-[#00E676]'
                    }`}
                  >
                    <span className="text-sm">👏</span>
                    <span className="hidden sm:inline">Aplaudir</span>
                  </button>

                  {/* Comment Toggle */}
                  <button
                    onClick={() => setActiveCommentsPostId(isCommentTrayOpen ? null : post.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-xl transition-all font-bold cursor-pointer ${
                      isCommentTrayOpen 
                        ? 'bg-[#7C4DFF]/15 text-[#00E5FF]' 
                        : 'text-gray-450 text-gray-400 hover:bg-[#1E1E30]/60 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-[#7C4DFF]" />
                    <span className="hidden sm:inline">Comentar</span>
                  </button>

                </div>

                {/* COMMENTS EXPANDER */}
                <AnimatePresence>
                  {isCommentTrayOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#0A0A14]/70 border-t border-white/5 px-4.5 py-4 space-y-4"
                    >
                      {/* Comments Feed list */}
                      {displayComments.length > 0 && (
                        <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                          {displayComments.map(c => {
                            const commenter = getAuthor(c.userId);
                            return (
                              <div key={c.id} className="flex gap-2.5 items-start text-xs bg-[#121225] p-2.5 rounded-xl border border-white/5">
                                <img
                                  src={commenter.avatar}
                                  alt={commenter.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/10 cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => onViewProfile?.(commenter)}
                                />
                                <div className="min-w-0 flex-1 font-sans">
                                  <div className="flex items-center justify-between">
                                    <span 
                                      className="font-extrabold text-[11px] text-white cursor-pointer hover:text-[#00E5FF] transition-colors"
                                      onClick={() => onViewProfile?.(commenter)}
                                    >
                                      {commenter.fullName}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-mono">
                                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Comment input form */}
                      <div className="flex gap-2 items-center">
                        <img
                          src={currentUser.avatar}
                          alt="you"
                          referrerPolicy="no-referrer"
                          className="w-7.5 h-7.5 rounded-full object-cover ring-1 ring-[#7C4DFF]"
                        />
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Adote a amizade: Deixe um comentário de incentivo..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handlePostComment(post.id);
                            }}
                            className="w-full bg-[#121225] border border-white/10 text-gray-100 text-xs pl-3.5 pr-10 py-2 rounded-xl focus:outline-none focus:border-[#00E5FF] placeholder-gray-500 font-sans"
                          />
                          <button
                            onClick={() => handlePostComment(post.id)}
                            className="absolute right-2 top-1.5 text-[#00E5FF] hover:text-cyan-300 p-0.5 cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
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

    </div>
  );
}
