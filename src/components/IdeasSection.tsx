import { useState, FormEvent } from 'react';
import { User, Idea } from '../types';
import { 
  Lightbulb, Sparkles, Send, Trash2, Heart, MessageSquare, 
  ThumbsUp, Filter, MessageCircle, Volume2, AlertCircle, 
  HelpCircle, Star, BadgeCheck, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IdeasSectionProps {
  currentUser: User;
  users: User[];
  ideas: Idea[];
  onCreateIdea: (text: string, category: string) => void;
  onDeleteIdea: (ideaId: string) => void;
  onToggleLikeIdea: (ideaId: string) => void;
  onViewProfile?: (user: User) => void;
}

export default function IdeasSection({
  currentUser,
  users,
  ideas,
  onCreateIdea,
  onDeleteIdea,
  onToggleLikeIdea,
  onViewProfile
}: IdeasSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [ideaText, setIdeaText] = useState<string>('');
  const [category, setCategory] = useState<string>('Ideia');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Categories config
  const categories = [
    { id: 'all', label: 'Todas', emoji: '🌐', color: 'bg-[#1A1A32] text-gray-300 border-white/5' },
    { id: 'Ideia', label: 'Ideias', emoji: '💡', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { id: 'Sugestão', label: 'Sugestões', emoji: '🛠️', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { id: 'Revolta', label: 'Revoltas', emoji: '🗣️', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { id: 'Elogio', label: 'Elogios', emoji: '🌟', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    if (ideaText.trim().length > 500) {
      alert('Sua ideia excede o limite máximo de 500 caracteres!');
      return;
    }

    setIsSubmitting(true);
    try {
      onCreateIdea(ideaText.trim(), category);
      setIdeaText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter ideas
  const filteredIdeas = activeFilter === 'all' 
    ? ideas 
    : ideas.filter(idea => idea.category === activeFilter);

  // Get dynamic category style
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Revolta':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          emoji: '🗣️',
          label: 'Revolta'
        };
      case 'Sugestão':
        return {
          bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          emoji: '🛠️',
          label: 'Sugestão'
        };
      case 'Elogio':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          emoji: '🌟',
          label: 'Elogio'
        };
      default:
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          emoji: '💡',
          label: 'Ideia'
        };
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 600);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Agora mesmo';
      if (diffMins < 60) return `Há ${diffMins} min`;
      if (diffHours < 24) return `Há ${diffHours} h`;
      return `Há ${diffDays} d`;
    } catch {
      return 'Recentemente';
    }
  };

  return (
    <div className="space-y-6" id="ideas-section-wrapper">
      {/* HEADER SECTION */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="ideas-header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00E5FF]/5 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-blue-600 flex items-center justify-center shadow-lg shadow-[#00E5FF]/10 shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                Exponha suas Ideias
                <span className="text-[10px] bg-yellow-500/15 text-yellow-400 font-mono px-2 py-0.5 rounded-full font-bold border border-yellow-500/20 uppercase tracking-widest animate-pulse">
                  Sugestões e Opiniões
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-tight">
                Um espaço democrático para você compartilhar ideias, propostas de melhoria, elogios ou desabafar revoltas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FORM TO SUBMIT NEW IDEA */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow-xl relative" id="idea-creator-form">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#00E5FF]" />
          O que você gostaria de expor hoje?
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.slice(1).map((cat) => {
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    active 
                      ? `${cat.color} ring-1 ring-white/10 scale-[1.03]` 
                      : 'bg-[#1A1A32] border-white/5 text-gray-400 hover:text-white hover:bg-[#25254A]'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value.slice(0, 500))}
              placeholder={
                category === 'Revolta' 
                  ? 'Desabafe sobre algo na plataforma ou na comunidade... (Seja respeitoso!)'
                  : category === 'Elogio'
                  ? 'Deixe seu elogio ou feedback positivo sobre o aplicativo ou usuários!'
                  : category === 'Sugestão'
                  ? 'O que podemos implementar para tornar a rede melhor?'
                  : 'Descreva a sua grande ideia brilhante aqui para todos verem...'
              }
              rows={4}
              maxLength={500}
              className="w-full bg-[#1A1A32] border border-white/10 focus:border-[#00E5FF]/40 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 transition-all font-sans resize-none"
            />
            
            <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[10px] font-mono">
              <span className={`${ideaText.length >= 450 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                {ideaText.length}
              </span>
              <span className="text-gray-600">/</span>
              <span className="text-gray-500">500</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 italic">
              <AlertCircle className="w-3.5 h-3.5 text-[#00E5FF]/80 shrink-0" />
              Sua publicação será visível em tempo real para todos os membros da rede.
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !ideaText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:from-[#00E5FF]/90 hover:to-blue-600/90 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-[#00E5FF]/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              Publicar Postagem
            </button>
          </div>
        </form>
      </div>

      {/* FILTER BUTTONS ROW */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5" id="ideas-feed-filter-bar">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">Mural de Ideias</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
          {categories.map((cat) => {
            const active = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  active 
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF]/30 text-[#00E5FF]'
                    : 'bg-[#121225] hover:bg-[#1E1E38] border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* IDEAS STREAM / FEED */}
      <div className="space-y-4" id="ideas-feed-container">
        <AnimatePresence mode="popLayout">
          {filteredIdeas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#121225]/40 border border-white/5 rounded-2xl p-10 text-center flex flex-col items-center justify-center"
              key="empty-state"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-3">
                <Lightbulb className="w-7 h-7 text-gray-500" />
              </div>
              <h4 className="text-white font-bold text-sm">Nenhuma publicação encontrada</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {activeFilter === 'all' 
                  ? 'Seja o primeiro a publicar uma sugestão, elogio ou desabafo hoje!' 
                  : `Ainda não temos nenhuma publicação na categoria de ${activeFilter}.`}
              </p>
            </motion.div>
          ) : (
            filteredIdeas.map((idea) => {
              // Map dynamic user profile info
              const ideaUser = users.find(u => u.id === idea.userId) || {
                fullName: idea.userName,
                username: idea.userId,
                avatar: idea.userAvatar,
                isVerified: false
              };
              
              const isOwner = currentUser.id === idea.userId;
              const isAdmin = currentUser.id === 'admin';
              const badgeInfo = getCategoryBadge(idea.category);
              const userLiked = idea.likes?.includes(currentUser.id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  key={idea.id}
                  className="bg-[#121225] border border-white/10 hover:border-white/15 rounded-2xl p-4.5 shadow-md hover:shadow-lg transition-all relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => onViewProfile?.(ideaUser as User)}
                        className="w-10 h-10 rounded-full overflow-hidden border border-white/10 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <img 
                          src={ideaUser.avatar} 
                          alt={ideaUser.fullName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={() => onViewProfile?.(ideaUser as User)}
                            className="text-xs font-black text-white hover:text-[#00E5FF] transition-colors cursor-pointer"
                          >
                            {ideaUser.fullName}
                          </span>
                          {ideaUser.isVerified && (
                            <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono">@{ideaUser.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${badgeInfo.bg}`}>
                        {badgeInfo.emoji} {badgeInfo.label}
                      </span>
                      
                      <span className="text-[10px] text-gray-500 font-mono">
                        {getRelativeTime(idea.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="mt-3 text-xs text-gray-250 text-slate-100 leading-relaxed font-sans whitespace-pre-wrap break-words pl-0.5">
                    {idea.text}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <button
                      onClick={() => onToggleLikeIdea(idea.id)}
                      className={`flex items-center gap-1.5 text-[11px] font-bold py-1 px-2.5 rounded-lg transition-all cursor-pointer ${
                        userLiked 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'hover:bg-white/5 text-gray-400 hover:text-white border border-transparent'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${userLiked ? 'fill-red-500/20' : ''}`} />
                      <span>Apoiar</span>
                      <span className="font-mono bg-white/5 px-1.5 py-0.2 rounded text-[10px]">
                        {idea.likes?.length || 0}
                      </span>
                    </button>

                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza de que deseja excluir esta publicação?')) {
                            onDeleteIdea(idea.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Excluir publicação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
