import { useEffect, useState } from 'react';
import { User, Ad, Event } from '../types';
import { UserPlus, Sparkles, UserMinus, Calendar, ArrowUpRight, TrendingUp, Target, Sliders, Activity, ChevronRight, ChevronDown, ChevronUp, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RightRailProps {
  currentUser: User;
  users: User[];
  ads: Ad[];
  events: Event[];
  onFriendToggle: (id: string) => void;
  onAdClick: (id: string) => void;
  onTrackImpression: (id: string) => void;
  setActiveTab: (tab: string) => void;
  onViewProfile?: (user: User) => void;
  onSearch?: (term: string) => void;
}

export default function RightRail({
  currentUser,
  users,
  ads,
  events,
  onFriendToggle,
  onAdClick,
  onTrackImpression,
  setActiveTab,
  onViewProfile,
  onSearch
}: RightRailProps) {

  // Fetch sponsored ads for top and bottom rails
  const topAd = ads.find(a => a.position === 'lateral-top' && a.status === 'active');
  const bottomAd = ads.find(a => a.position === 'lateral-bottom' && a.status === 'active');

  // Calibration for High-CTR Pro audience
  const [targetAudience, setTargetAudience] = useState<'Geral' | 'PRO'>('Geral');
  const [calibrationValue, setCalibrationValue] = useState<number>(45); // 1-100% tuning slider
  const [simulatedClicks, setSimulatedClicks] = useState<number>(0);
  const [showConversionFloat, setShowConversionFloat] = useState<boolean>(false);

  // States for BBA PWA News & Games
  const [showAllNews, setShowAllNews] = useState(false);
  const [showAllGames, setShowAllGames] = useState(false);

  const newsList = [
    {
      id: 1,
      title: 'Plano Safra 2026/27 libera R$ 610 bi e amplia recursos',
      time: 'Há 2 h',
      readers: '4.572',
      tag: 'Economia',
      url: 'https://news.google.com/search?q=Plano+Safra+2026+2027+economia'
    },
    {
      id: 2,
      title: 'Os empregos em alta nos esportes e e-sports virtuais',
      time: 'Há 1 d',
      readers: '2.687',
      tag: 'Carreira',
      url: 'https://news.google.com/search?q=empregos+em+alta+nos+esportes+e-sports'
    },
    {
      id: 3,
      title: 'Menos brasileiros sentem culpa por descansar no fim de semana',
      time: 'Há 1 d',
      readers: '858',
      tag: 'Comportamento',
      url: 'https://news.google.com/search?q=brasileiros+culpa+por+descansar+fim+de+semana'
    },
    {
      id: 4,
      title: 'Estágio e trainee: veja grandes empresas com vagas abertas',
      time: 'Há 1 d',
      readers: '12.302',
      tag: 'Oportunidades',
      url: 'https://news.google.com/search?q=vagas+de+estagio+e+trainee+empresas+abertas'
    },
    {
      id: 5,
      title: 'WhatsApp passa a ter suporte oficial a nomes de usuário únicos',
      time: 'Há 1 d',
      readers: '842',
      tag: 'Tecnologia',
      url: 'https://news.google.com/search?q=whatsapp+nomes+de+usuario+unicos'
    },
    {
      id: 6,
      title: 'Plataforma BBA atinge recorde histórico de novos amigos conectados',
      time: 'Há 3 h',
      readers: '15.420',
      tag: 'BBA_News',
      url: 'https://news.google.com/search?q=BBA+Bla+Bla+Amigos'
    },
    {
      id: 7,
      title: 'Sistemas inteligentes descentralizados remodelam privacidade na web',
      time: 'Há 5 h',
      readers: '9.851',
      tag: 'Inovação',
      url: 'https://news.google.com/search?q=sistemas+inteligentes+descentralizados+privacidade+web'
    },
    {
      id: 8,
      title: 'Novos filtros holográficos ultra-realistas chegam hoje ao Reels do BBA',
      time: 'Há 8 h',
      readers: '3.200',
      tag: 'Atualização',
      url: 'https://news.google.com/search?q=filtros+holograficos+reels+bba'
    }
  ];

  const gamesList = [
    {
      id: 'patches',
      title: 'Patches',
      score: '106',
      desc: 'Junte tudo',
      iconColor: 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/30',
      iconEmoji: '🧩'
    },
    {
      id: 'zip',
      title: 'Zip',
      score: '471',
      desc: 'Complete o caminho',
      iconColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      iconEmoji: '⚡'
    },
    {
      id: 'sudoku',
      title: 'Mini Sudoku',
      score: '324',
      desc: 'Um jogo clássico, em formato mini',
      iconColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      iconEmoji: '🔢'
    },
    {
      id: 'tango',
      title: 'Tango',
      score: '115',
      desc: 'Tudo sobre ritmo e conexão',
      iconColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      iconEmoji: '💃'
    }
  ];

  // Calibrated details for topAd
  const getCalibratedAdDetails = () => {
    if (!topAd) return null;
    if (targetAudience === 'PRO') {
      return {
        ...topAd,
        title: '⚡ Inova PRO S.A. - Elite Smart Growth',
        description: 'Multiplique seu ROAS em até 12.5x! Funis de conversão preditivos calibrados com inteligência artificial para CEOs, Fundadores e Profissionais PRO.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400',
      };
    }
    return topAd;
  };

  const calibratedAd = getCalibratedAdDetails();

  // CTR calculations
  const calculateCTR = () => {
    if (!topAd) return '0.00';
    const baseClicks = topAd.clicks + simulatedClicks;
    const baseImpressions = topAd.impressions || 3420;
    
    if (targetAudience === 'PRO') {
      const proMultiplier = 1.8 + (calibrationValue / 15);
      const optimizedCTR = ((baseClicks / baseImpressions) * 100) * proMultiplier;
      return optimizedCTR.toFixed(2);
    }
    
    return ((baseClicks / baseImpressions) * 100).toFixed(2);
  };

  // Track impressions on load/render using useEffect to prevent infinite rendering loops
  useEffect(() => {
    if (topAd) {
      onTrackImpression(topAd.id);
    }
  }, [topAd?.id]);

  useEffect(() => {
    if (bottomAd) {
      onTrackImpression(bottomAd.id);
    }
  }, [bottomAd?.id]);

  // Recommended connections (not currently friends with active user, not active user itself, not blocked, and not mock users)
  const recommendedUsers = users
    .filter(u => 
      u.id !== currentUser.id && 
      !currentUser.friends.includes(u.id) && 
      !u.isBlocked && 
      !['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin'].includes(u.id)
    )
    .slice(0, 3);

  const hashtags = [
    { tag: 'BlaBlaAmigos', posts: '4.8k' },
    { tag: 'LayoutNeon', posts: '1.2k' },
    { tag: 'DesignPsicodelico', posts: '942' },
    { tag: 'MarketingDeCrescimento', posts: '780' }
  ];

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4" id="right-rail-container">
      
      {/* SPONSORED AD TOP (FACEBOOK STYLE) */}
      <div 
        className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3.5 shadow-sm relative overflow-hidden"
        id="sponsored-ad-top"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-[#65676B] dark:text-[#B0B3B8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1877F2]" />
            {targetAudience === 'PRO' ? 'Patrocinado PRO' : 'Patrocinado'}
          </span>
          <span className="text-[10px] text-[#65676B] dark:text-[#B0B3B8] font-medium bg-[#F0F2F5] dark:bg-[#3A3B3C] px-1.5 py-0.5 rounded">
            Publicidade
          </span>
        </div>

        {calibratedAd ? (
          <div className="block">
            <a
              href={calibratedAd.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                onAdClick(calibratedAd.id);
                setSimulatedClicks(prev => prev + 1);
              }}
              className="block group"
            >
              <div className="relative overflow-hidden rounded-lg h-36 mb-2.5 bg-gray-100 dark:bg-[#18191A] border border-[#E4E6EB] dark:border-[#3A3B3C]">
                <img
                  src={calibratedAd.imageUrl}
                  alt={calibratedAd.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                />
              </div>
              <h4 className="font-bold text-xs text-[#050505] dark:text-[#E4E6EB] group-hover:text-[#1877F2] transition-colors flex items-center justify-between gap-1">
                <span className="truncate">{calibratedAd.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#65676B] dark:text-[#B0B3B8] shrink-0" />
              </h4>
              <p className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] mt-1 line-clamp-2 leading-relaxed">
                {calibratedAd.description}
              </p>
            </a>

            {/* Dynamic Audience & CTR Calibrator Panel */}
            <div className="mt-3 pt-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C] space-y-2.5 bg-[#F0F2F5] dark:bg-[#18191A] rounded-lg p-2.5" id="ctr-calibrator-panel">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] font-bold flex items-center gap-1">
                  <Target className={`w-3 h-3 ${targetAudience === 'PRO' ? 'text-orange-500' : 'text-[#1877F2]'}`} />
                  Segmentação
                </span>
                <div className="flex rounded-md overflow-hidden border border-[#CCD0D5] dark:border-[#3A3B3C] p-0.5 bg-white dark:bg-[#242526]">
                  <button
                    onClick={() => setTargetAudience('Geral')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                      targetAudience === 'Geral'
                        ? 'bg-[#1877F2] text-white'
                        : 'text-[#65676B] dark:text-[#B0B3B8] hover:text-[#050505] dark:hover:text-white'
                    }`}
                  >
                    Geral
                  </button>
                  <button
                    onClick={() => setTargetAudience('PRO')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors flex items-center gap-1 cursor-pointer ${
                      targetAudience === 'PRO'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-[#65676B] dark:text-[#B0B3B8] hover:text-[#050505] dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                    PRO
                  </button>
                </div>
              </div>

              {/* If PRO, show demographic tuning slider */}
              {targetAudience === 'PRO' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-[#65676B] dark:text-[#B0B3B8]">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-2.5 h-2.5 text-orange-500" />
                      Afinidade PRO:
                    </span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">{calibrationValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calibrationValue}
                    onChange={(e) => setCalibrationValue(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Display CTR in Real-time */}
              <div className="flex items-center justify-between bg-white dark:bg-[#242526] rounded-md p-2 border border-[#E4E6EB] dark:border-[#3A3B3C]">
                <span className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#1877F2]" />
                  CTR Estimado:
                </span>
                <div className="text-right">
                  <span className={`text-xs font-bold ${
                    targetAudience === 'PRO' ? 'text-green-600 dark:text-green-400 font-black' : 'text-[#1877F2]'
                  }`}>
                    {calculateCTR()}%
                  </span>
                  {targetAudience === 'PRO' && (
                    <span className="block text-[8px] text-green-600 dark:text-green-400 font-bold uppercase">
                      Otimizado ROAS
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive click button */}
              <button
                onClick={() => {
                  setSimulatedClicks(prev => prev + 1);
                  setShowConversionFloat(true);
                  setTimeout(() => setShowConversionFloat(false), 1000);
                  onAdClick(calibratedAd.id);
                }}
                className="w-full bg-white dark:bg-[#242526] hover:bg-gray-50 dark:hover:bg-[#3A3B3C] border border-[#CCD0D5] dark:border-[#3A3B3C] text-[10px] font-bold py-1.5 rounded-md transition-colors text-[#050505] dark:text-[#E4E6EB] flex items-center justify-center gap-1 relative cursor-pointer"
              >
                🎯 Testar Clique de Lead PRO
                <AnimatePresence>
                  {showConversionFloat && (
                    <motion.span
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: -25, scale: 1.1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bg-green-500 text-white font-black px-2 py-0.5 rounded text-[8px] shadow-lg pointer-events-none"
                    >
                      +1 Clique PRO!
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center border border-dashed border-[#CCD0D5] dark:border-[#3A3B3C] rounded-lg bg-[#F0F2F5] dark:bg-[#18191A]">
            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">Espaço publicitário disponível.</p>
            <button 
              onClick={() => setActiveTab('ads')}
              className="text-xs text-[#1877F2] font-bold hover:underline mt-1.5 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              Criar Anúncio
            </button>
          </div>
        )}
      </div>

      {/* QUICK CONNECTIONS RECOMMENDATIONS (FACEBOOK STYLE) */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3.5 shadow-sm" id="recommended-connections">
        <h4 className="text-xs font-bold text-[#65676B] dark:text-[#B0B3B8] uppercase tracking-wider mb-3">
          Pessoas que talvez você conheça
        </h4>
        <div className="space-y-2.5">
          {recommendedUsers.length === 0 ? (
            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8] italic py-2 text-center">Nenhuma recomendação no momento.</p>
          ) : (
            recommendedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] transition-colors">
                <div 
                  onClick={() => onViewProfile?.(user)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#E4E6EB] dark:border-[#3A3B3C]"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#050505] dark:text-[#E4E6EB] truncate flex items-center gap-1">
                      {user.fullName}
                      {user.isVerified && (
                        <span className="w-3 h-3 rounded-full bg-[#1877F2] inline-flex items-center justify-center text-[7px] text-white font-bold shrink-0">✓</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] truncate">@{user.username}</div>
                  </div>
                </div>
                <button
                  onClick={() => onFriendToggle(user.id)}
                  title="Adicionar aos Amigos"
                  className="bg-[#E7F3FF] dark:bg-[#3A3B3C] hover:bg-[#DBE7F2] dark:hover:bg-[#4E4F50] text-[#1877F2] dark:text-[#2D88FF] text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BLA BLA AMIGOS - NOTÍCIAS & ATUALIZAÇÕES */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3.5 shadow-sm space-y-4" id="bba-news-section">
        
        {/* Assuntos em alta (News Section) */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-[#E4E6EB] dark:border-[#3A3B3C] pb-2">
            <h4 className="text-[#050505] dark:text-[#E4E6EB] font-bold text-xs flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5 text-[#1877F2]" />
              <span>Notícias & Destaques</span>
            </h4>
            <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-1.5 py-0.5 rounded">
              AO VIVO
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#1877F2] font-bold uppercase tracking-wide mb-2.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Assuntos em alta
          </div>

          <div className="space-y-2.5">
            {newsList.slice(0, showAllNews ? newsList.length : 5).map((news) => (
              <a
                key={news.id}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onSearch?.(news.tag)}
                className="block p-1.5 -mx-1.5 rounded-lg hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] transition-colors"
                title={`Abrir notícia: ${news.title}`}
              >
                <h5 className="text-xs font-semibold text-[#050505] dark:text-[#E4E6EB] hover:text-[#1877F2] transition-colors leading-snug">
                  {news.title}
                </h5>
                <div className="flex items-center gap-1.5 text-[10px] text-[#65676B] dark:text-[#B0B3B8] mt-1">
                  <span>{news.time}</span>
                  <span>•</span>
                  <span className="text-[#1877F2] font-medium">#{news.tag}</span>
                  <span>•</span>
                  <span>{news.readers} leitores</span>
                </div>
              </a>
            ))}
          </div>

          <button
            onClick={() => setShowAllNews(!showAllNews)}
            className="w-full mt-2.5 pt-2 border-t border-[#E4E6EB] dark:border-[#3A3B3C] text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:text-[#1877F2] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            {showAllNews ? (
              <>
                Exibir menos notícias <ChevronUp className="w-3.5 h-3.5 text-[#1877F2]" />
              </>
            ) : (
              <>
                Exibir mais notícias <ChevronDown className="w-3.5 h-3.5 text-[#1877F2]" />
              </>
            )}
          </button>
        </div>

        {/* Jogos de hoje (Interactive Mini-Games Section) */}
        <div className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] pt-3">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-[#050505] dark:text-[#E4E6EB] font-bold text-xs">
              Jogos da Comunidade
            </h4>
            <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] font-semibold px-1.5 py-0.5 rounded">
              Grátis
            </span>
          </div>

          <div className="space-y-2">
            {gamesList.slice(0, showAllGames ? gamesList.length : 3).map((game) => (
              <div
                key={game.id}
                onClick={() => setActiveTab('games')}
                className="group cursor-pointer flex items-center justify-between p-2 rounded-lg bg-[#F0F2F5] dark:bg-[#3A3B3C] hover:bg-[#E4E6EB] dark:hover:bg-[#4E4F50] transition-colors"
                title={`Jogar ${game.title}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-white dark:bg-[#242526] shadow-sm shrink-0">
                    {game.iconEmoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#050505] dark:text-[#E4E6EB] truncate">
                        {game.title}
                      </span>
                      <span className="text-[9px] bg-white dark:bg-[#242526] text-[#65676B] dark:text-[#B0B3B8] px-1 rounded font-bold shrink-0">
                        {game.score}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#65676B] dark:text-[#B0B3B8] truncate">
                      {game.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#65676B] dark:text-[#B0B3B8] group-hover:text-[#1877F2] group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAllGames(!showAllGames)}
            className="w-full mt-2.5 pt-2 border-t border-[#E4E6EB] dark:border-[#3A3B3C] text-xs font-semibold text-[#65676B] dark:text-[#B0B3B8] hover:text-[#1877F2] transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            {showAllGames ? (
              <>
                Exibir menos jogos <ChevronUp className="w-3.5 h-3.5 text-[#1877F2]" />
              </>
            ) : (
              <>
                Exibir mais jogos <ChevronDown className="w-3.5 h-3.5 text-[#1877F2]" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* UPCOMING EVENTS PREVIEW (FACEBOOK STYLE) */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3.5 shadow-sm" id="upcoming-events-preview">
        <h4 className="text-xs font-bold text-[#65676B] dark:text-[#B0B3B8] uppercase tracking-wider mb-3">
          Próximos Eventos
        </h4>
        <div className="space-y-2.5">
          {events.slice(0, 2).map(e => (
            <div 
              key={e.id}
              onClick={() => setActiveTab('events')} 
              className="group cursor-pointer flex gap-2.5 items-start p-2 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-colors"
            >
              <div className="bg-red-50 dark:bg-red-950/40 p-2 rounded-lg text-red-600 dark:text-red-400 shrink-0 border border-red-100 dark:border-red-900/30">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-semibold text-[#050505] dark:text-[#E4E6EB] truncate group-hover:text-[#1877F2] transition-colors">
                  {e.title}
                </h5>
                <p className="text-[10px] text-[#65676B] dark:text-[#B0B3B8] mt-0.5">
                  {new Date(e.date).toLocaleDateString()} às {e.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SPONSORED AD BOTTOM (FACEBOOK STYLE) */}
      <div className="bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-xl p-3.5 shadow-sm relative overflow-hidden" id="sponsored-ad-bottom">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-[#65676B] dark:text-[#B0B3B8] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1877F2]" />
            Patrocinado
          </span>
          <span className="text-[10px] text-[#65676B] dark:text-[#B0B3B8] font-medium bg-[#F0F2F5] dark:bg-[#3A3B3C] px-1.5 py-0.5 rounded">
            AD
          </span>
        </div>

        {bottomAd ? (
          <a
            href={bottomAd.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onAdClick(bottomAd.id)}
            className="block group"
          >
            <div className="relative overflow-hidden rounded-lg h-32 mb-2.5 bg-gray-100 dark:bg-[#18191A] border border-[#E4E6EB] dark:border-[#3A3B3C]">
              <img
                src={bottomAd.imageUrl}
                alt={bottomAd.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
              />
            </div>
            <h4 className="font-bold text-xs text-[#050505] dark:text-[#E4E6EB] group-hover:text-[#1877F2] transition-colors flex items-center justify-between gap-1">
              <span className="truncate">{bottomAd.title}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#65676B] dark:text-[#B0B3B8] shrink-0" />
            </h4>
            <p className="text-[11px] text-[#65676B] dark:text-[#B0B3B8] mt-1 line-clamp-2 leading-relaxed">
              {bottomAd.description}
            </p>
          </a>
        ) : (
          <div className="py-4 text-center border border-dashed border-[#CCD0D5] dark:border-[#3A3B3C] rounded-lg bg-[#F0F2F5] dark:bg-[#18191A]">
            <p className="text-xs text-[#65676B] dark:text-[#B0B3B8]">Espaço publicitário secundário.</p>
            <button 
              onClick={() => setActiveTab('ads')}
              className="text-xs text-[#1877F2] font-bold hover:underline mt-1.5 flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              Criar Anúncio
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
