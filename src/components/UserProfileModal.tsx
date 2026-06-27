import { useState, FormEvent } from 'react';
import { User, Post } from '../types';
import { 
  X, MapPin, Globe, Calendar, Mail, Phone, MessageSquare, 
  UserPlus, UserMinus, CheckCircle, Award, Bookmark, 
  Image as ImageIcon, Video, Heart, ThumbsUp, Sparkles, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageLightbox from './ImageLightbox';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentUser: User;
  posts: Post[];
  users: User[];
  onToggleReaction: (postId: string, type: 'likes' | 'loves' | 'applauds') => void;
  onAddComment: (postId: string, content: string) => void;
  onStartChat: (userId: string) => void;
  onFriendToggle: (userId: string) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  currentUser,
  posts,
  users,
  onToggleReaction,
  onAddComment,
  onStartChat,
  onFriendToggle
}: UserProfileModalProps) {
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  
  // Lightbox zoom state
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  if (!isOpen) return null;

  const userPosts = posts.filter(p => p.userId === user.id);
  const isFriends = currentUser.friends?.includes(user.id) || user.friends?.includes(currentUser.id);
  const isMe = user.id === currentUser.id;

  const handlePostComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    onAddComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const getAuthor = (userId: string) => {
    return users.find(u => u.id === userId) || {
      fullName: 'Membro',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      username: 'membro',
      isVerified: false
    };
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto" id="user-profile-viewer-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-[#121225] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl shadow-[#7C4DFF]/10 text-slate-200"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          title="Fechar perfil"
        >
          <X className="w-5 h-5" />
        </button>

        {/* COVER PHOTO BANNER */}
        <div className="h-44 sm:h-52 w-full relative bg-[#0D0C1D] overflow-hidden">
          <img
            src={user.cover || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800'}
            alt="User cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121225] via-[#121225]/45 to-transparent" />
        </div>

        {/* PROFILE GENERAL INFORMATION OVERLAY */}
        <div className="px-5 sm:px-8 -mt-16 sm:-mt-20 relative pb-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* LARGE CIRCULAR AVATAR */}
            <div className="p-1 rounded-full bg-gradient-to-tr from-[#00E5FF] via-[#7C4DFF] to-[#FF5722] shadow-xl w-28 h-28 sm:w-32 sm:h-32 shrink-0 animate-pulse-slow">
              <div className="p-1 rounded-full bg-[#121225] w-full h-full">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover border border-white/15"
                />
              </div>
            </div>

            {/* QUICK ACTIONS BUTTON BAR */}
            <div className="flex gap-2.5">
              {!isMe && (
                <>
                  <button
                    onClick={() => onFriendToggle(user.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                      isFriends
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-white hover:brightness-110 shadow-lg shadow-[#7C4DFF]/20'
                    }`}
                  >
                    {isFriends ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        <span>Amigos (Remover)</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Adicionar Amigo</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onStartChat(user.id);
                      onClose();
                    }}
                    className="bg-[#1C1B35] hover:bg-[#25244C] border border-white/10 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-[#00E5FF]" />
                    <span>Chat Direto</span>
                  </button>
                </>
              )}

              {isMe && (
                <div className="bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg">
                  Visualizando seu perfil
                </div>
              )}
            </div>
          </div>

          {/* IDENTITY TEXT DETAILS */}
          <div className="mt-5 space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                {user.fullName}
              </h2>
              {user.isVerified && (
                <CheckCircle className="w-5 h-5 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" title="Perfil Verificado" />
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center text-xs text-[#00E5FF] font-mono">
              <span className="font-extrabold">ID do Membro: @{user.username}</span>
              <span className="text-gray-600">•</span>
              <span className="capitalize bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[10px] text-gray-300">
                Plano: {user.premiumPlan === 'free' ? 'Gratuito' : user.premiumPlan === 'enterprise' ? 'Empresa' : `Premium ${user.premiumPlan}`}
              </span>
            </div>
          </div>

          {/* BADGES CONTAINER */}
          {user.badges && user.badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {user.badges.map((badge, idx) => {
                let badgeStyle = 'bg-gray-500/10 text-gray-300 border-gray-500/20';
                if (badge.toLowerCase().includes('vip')) badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]';
                if (badge.toLowerCase().includes('admin') || badge.toLowerCase().includes('moderador')) badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                if (badge.toLowerCase().includes('pioneiro')) badgeStyle = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
                return (
                  <span 
                    key={idx}
                    className={`inline-flex items-center gap-1 border text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded-md ${badgeStyle}`}
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </span>
                );
              })}
            </div>
          )}

          {/* BIOGRAPHY */}
          <div className="mt-4 bg-[#0A0A14]/60 border border-white/5 p-3.5 rounded-2xl italic text-xs text-gray-300 leading-relaxed">
            {user.bio || 'Sem biografia definida pelo membro.'}
          </div>

          {/* EXTRA CARD METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs font-mono">
            {user.city && (
              <div className="flex items-center gap-2 bg-[#0A0A14]/40 p-2 rounded-xl border border-white/5">
                <MapPin className="w-4 h-4 text-[#FF5722] shrink-0" />
                <span className="truncate text-gray-400" title={`${user.city}, ${user.state || ''}`}>
                  {user.city}
                  {user.state ? `, ${user.state}` : ''}
                </span>
              </div>
            )}

            {user.website && (
              <a 
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-[#0A0A14]/40 hover:bg-[#00E5FF]/10 p-2 rounded-xl border border-white/5 transition-all text-gray-400 hover:text-[#00E5FF] truncate"
              >
                <Globe className="w-4 h-4 text-[#00E5FF] shrink-0" />
                <span className="truncate">{user.website.replace(/(^\w+:|^)\/\//, '')}</span>
              </a>
            )}

            <div className="flex items-center gap-2 bg-[#0A0A14]/40 p-2 rounded-xl border border-white/5 text-gray-400">
              <Calendar className="w-4 h-4 text-[#7C4DFF] shrink-0" />
              <span>Nasc: {new Date(user.birthDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#0A0A14]/40 p-2 rounded-xl border border-white/5 text-gray-400">
              <Sparkles className="w-4 h-4 text-[#00E676] shrink-0" />
              <span>Posts: {userPosts.length}</span>
            </div>
          </div>
        </div>

        {/* FEED SECTION - USER'S OWN POSTS */}
        <div className="p-5 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono">
              Histórico de Publicações ({userPosts.length})
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Conteúdo Moderado e Seguro</span>
          </div>

          <div className="space-y-6">
            {userPosts.length === 0 ? (
              <div className="text-center py-10 bg-[#0A0A14]/40 border border-white/5 rounded-2xl text-gray-500 text-xs font-mono">
                Este membro ainda não realizou publicações no feed.
              </div>
            ) : (
              userPosts.map(post => {
                const hasLiked = post.reactions?.likes.includes(currentUser.id);
                const hasLoved = post.reactions?.loves.includes(currentUser.id);
                const hasApplauded = post.reactions?.applauds.includes(currentUser.id);
                const isCommentTrayOpen = activeCommentsPostId === post.id;
                const displayComments = post.comments || [];

                return (
                  <div 
                    key={post.id}
                    className="bg-[#0A0A14]/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                  >
                    {/* Header of post inside modal */}
                    <div className="p-4 flex items-center justify-between border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={user.avatar} 
                          alt={user.fullName} 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <div className="text-xs font-extrabold text-white flex items-center gap-1">
                            {user.fullName}
                            {user.isVerified && (
                              <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                            )}
                          </div>
                          <div className="text-[9px] text-gray-500 font-mono">
                            {new Date(post.createdAt).toLocaleDateString()} às {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content text */}
                    <div className="p-4">
                      <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Content media */}
                    {post.mediaUrl && (
                      <div className="bg-black/90 max-h-80 flex items-center justify-center overflow-hidden border-t border-b border-white/5">
                        {post.mediaType === 'video' ? (
                          <video 
                            src={post.mediaUrl} 
                            controls 
                            className="w-full max-h-80 object-contain"
                          />
                        ) : (
                          <img 
                            src={post.mediaUrl} 
                            alt="Post Media" 
                            referrerPolicy="no-referrer"
                            className="w-full max-h-80 object-contain cursor-zoom-in hover:scale-[1.01] transition-transform duration-300"
                            onClick={() => {
                              setLightboxImage(post.mediaUrl || '');
                              setLightboxAlt(post.content || 'Post Media');
                            }}
                            title="Clique para ampliar a imagem"
                          />
                        )}
                      </div>
                    )}

                    {/* Reactions & Comments Count bar */}
                    <div className="px-4 py-2 flex items-center justify-between text-[10px] font-mono text-gray-400 border-b border-white/5 bg-black/20">
                      <div className="flex gap-2.5">
                        {post.reactions?.likes.length > 0 && <span className="text-[#00E5FF]">👍 {post.reactions.likes.length}</span>}
                        {post.reactions?.loves.length > 0 && <span className="text-[#FF5722]">💖 {post.reactions.loves.length}</span>}
                        {post.reactions?.applauds.length > 0 && <span className="text-[#00E676]">👏 {post.reactions.applauds.length}</span>}
                        {(!post.reactions?.likes.length && !post.reactions?.loves.length && !post.reactions?.applauds.length) && (
                          <span>Sem reações</span>
                        )}
                      </div>
                      <span>{displayComments.length} {displayComments.length === 1 ? 'comentário' : 'comentários'}</span>
                    </div>

                    {/* Interactive buttons */}
                    <div className="px-4 py-2 flex justify-around text-[10px] uppercase font-bold text-gray-400 border-b border-white/5">
                      <button 
                        onClick={() => onToggleReaction(post.id, 'likes')}
                        className={`hover:text-[#00E5FF] flex items-center gap-1 cursor-pointer transition-all ${hasLiked ? 'text-[#00E5FF]' : ''}`}
                      >
                        👍 Curtir
                      </button>
                      <button 
                        onClick={() => onToggleReaction(post.id, 'loves')}
                        className={`hover:text-[#FF5722] flex items-center gap-1 cursor-pointer transition-all ${hasLoved ? 'text-[#FF5722]' : ''}`}
                      >
                        💖 Amei
                      </button>
                      <button 
                        onClick={() => onToggleReaction(post.id, 'applauds')}
                        className={`hover:text-[#00E676] flex items-center gap-1 cursor-pointer transition-all ${hasApplauded ? 'text-[#00E676]' : ''}`}
                      >
                        👏 Aplaudir
                      </button>
                      <button 
                        onClick={() => setActiveCommentsPostId(isCommentTrayOpen ? null : post.id)}
                        className={`hover:text-[#7C4DFF] flex items-center gap-1 cursor-pointer transition-all ${isCommentTrayOpen ? 'text-[#7C4DFF] font-black' : ''}`}
                      >
                        💬 Comentar
                      </button>
                    </div>

                    {/* Comments Tray inside Modal */}
                    <AnimatePresence>
                      {isCommentTrayOpen && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-black/40 border-t border-white/5 overflow-hidden"
                        >
                          {/* Write Comment Box */}
                          <div className="p-3 flex gap-2 border-b border-white/5">
                            <img 
                              src={currentUser.avatar} 
                              alt="Your Avatar" 
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <div className="flex-1 flex gap-1.5">
                              <input 
                                type="text"
                                placeholder="Comente algo legal sobre o post..."
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePostComment(post.id); }}
                                className="flex-1 bg-[#121225] text-xs text-white placeholder-gray-500 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00E5FF] border border-white/5"
                              />
                              <button 
                                onClick={() => handlePostComment(post.id)}
                                className="bg-[#7C4DFF] hover:bg-[#8d64ff] text-white p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* List of comments */}
                          <div className="p-3 space-y-2.5 max-h-56 overflow-y-auto">
                            {displayComments.length === 0 ? (
                              <p className="text-[10px] text-gray-500 font-mono text-center py-2">Seja o primeiro a comentar!</p>
                            ) : (
                              displayComments.map(comment => {
                                const commentAuthor = getAuthor(comment.userId);
                                return (
                                  <div key={comment.id} className="flex gap-2 text-xs">
                                    <img 
                                      src={commentAuthor.avatar} 
                                      alt={commentAuthor.fullName} 
                                      referrerPolicy="no-referrer"
                                      className="w-6.5 h-6.5 rounded-full object-cover mt-0.5 border border-white/5"
                                    />
                                    <div className="flex-1 bg-[#121225]/70 p-2 rounded-xl border border-white/5">
                                      <div className="flex items-center justify-between">
                                        <span className="font-extrabold text-white text-[10.5px] flex items-center gap-0.5">
                                          {commentAuthor.fullName}
                                          {commentAuthor.isVerified && <CheckCircle className="w-2.5 h-2.5 text-[#00E5FF]" />}
                                        </span>
                                        <span className="text-[8px] text-gray-500 font-mono">
                                          {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-gray-300 mt-1 text-[11px] leading-relaxed">{comment.content}</p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
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
      </motion.div>

      {/* Profile Image Lightbox Magnifier */}
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
