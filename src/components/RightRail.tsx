import { useEffect, useState } from 'react';
import { User, Ad, Event } from '../types';
import { UserPlus, Sparkles, UserMinus, Calendar, ArrowUpRight, TrendingUp, Target, Sliders, Activity } from 'lucide-react';
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
    <div className="w-full lg:w-80 shrink-0 space-y-6" id="right-rail-container">
      
      {/* SPONSORED AD TOP */}
      <div 
        className={`bg-[#121225] border rounded-2xl p-4.5 shadow-xl relative overflow-hidden transition-all duration-500 ${
          targetAudience === 'PRO' 
            ? 'border-orange-500/40 ring-1 ring-orange-500/25 shadow-[0_0_20px_rgba(249,115,22,0.15)] bg-gradient-to-b from-[#1b1225] to-[#121225]' 
            : 'border-white/10'
        }`}
        id="sponsored-ad-top"
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1 transition-all ${
            targetAudience === 'PRO' ? 'text-orange-400' : 'text-[#00E5FF]'
          }`}>
            <Sparkles className={`w-3 h-3 ${targetAudience === 'PRO' ? 'text-orange-400 animate-spin' : 'text-[#00E5FF] animate-pulse'}`} />
            {targetAudience === 'PRO' ? 'Patrocinado PRO' : 'Patrocinado Topo'}
          </span>
          <span className="text-[9px] text-gray-400 font-mono">AD</span>
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
              <div className="relative overflow-hidden rounded-xl h-36 mb-3 bg-[#0A0A14] border border-white/5">
                <img
                  src={calibratedAd.imageUrl}
                  alt={calibratedAd.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14]/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className={`text-white text-[9px] font-bold px-2 py-1 rounded uppercase font-mono tracking-wider transition-all ${
                    targetAudience === 'PRO' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/35' 
                      : 'bg-gradient-to-r from-[#7C4DFF] to-[#FF5722]'
                  }`}>
                    {targetAudience === 'PRO' ? '🚀 Acesso PRO' : 'Ver Mais'}
                  </span>
                </div>
              </div>
              <h4 className={`font-extrabold text-xs transition-colors flex items-center gap-1 ${
                targetAudience === 'PRO' ? 'text-orange-300 group-hover:text-orange-200' : 'text-white group-hover:text-[#00E5FF]'
              }`}>
                {calibratedAd.title}
                <ArrowUpRight className="w-3 h-3 text-gray-400 shrink-0" />
              </h4>
              <p className="text-[11px] text-gray-450 text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {calibratedAd.description}
              </p>
            </a>

            {/* Dynamic Audience & CTR Calibrator Panel */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 bg-[#0A0A14]/30 rounded-xl p-3" id="ctr-calibrator-panel">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono font-bold flex items-center gap-1">
                  <Target className={`w-3 h-3 ${targetAudience === 'PRO' ? 'text-orange-400' : 'text-purple-400'}`} />
                  Filtro Público
                </span>
                <div className="flex rounded-lg overflow-hidden border border-white/10 p-0.5 bg-white/5">
                  <button
                    onClick={() => setTargetAudience('Geral')}
                    className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition-all cursor-pointer ${
                      targetAudience === 'Geral'
                        ? 'bg-white/15 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Geral
                  </button>
                  <button
                    onClick={() => setTargetAudience('PRO')}
                    className={`px-2 py-0.5 text-[9px] font-black rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                      targetAudience === 'PRO'
                        ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                         : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5 text-orange-400 animate-spin" />
                    Público PRO
                  </button>
                </div>
              </div>

              {/* If PRO, show demographic tuning slider */}
              {targetAudience === 'PRO' && (
                <div className="space-y-1.5 animate-fade-in-up">
                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Sliders className="w-2.5 h-2.5 text-orange-400 animate-pulse" />
                      Afinidade PRO:
                    </span>
                    <span className="text-orange-400 font-bold">{calibrationValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calibrationValue}
                    onChange={(e) => setCalibrationValue(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Display CTR in Real-time */}
              <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-white/5 font-mono">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#00E5FF] animate-pulse" />
                  CTR do Banner:
                </span>
                <div className="text-right">
                  <span className={`text-xs font-black transition-all duration-300 ${
                    targetAudience === 'PRO' ? 'text-green-400 text-sm shadow-green-500/20 shadow-sm' : 'text-cyan-400'
                  }`}>
                    {calculateCTR()}%
                  </span>
                  {targetAudience === 'PRO' && (
                    <span className="block text-[8px] text-green-500 font-black tracking-widest uppercase">
                      Calibrado (ROAS max)
                    </span>
                  )}
                </div>
              </div>

              {/* Try-out Interactive click button to let them test CTR growth */}
               <button
                 onClick={() => {
                   setSimulatedClicks(prev => prev + 1);
                   setShowConversionFloat(true);
                   setTimeout(() => setShowConversionFloat(false), 1000);
                   onAdClick(calibratedAd.id);
                 }}
                 className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.97] cursor-pointer text-gray-300 flex items-center justify-center gap-1 relative"
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
          <div className="py-4 text-center border border-dashed border-white/10 rounded-xl bg-[#1E1E30]/40">
            <p className="text-xs text-gray-400 font-mono">Espaço publicitário de alto impacto disponível.</p>
            <button 
              onClick={() => setActiveTab('ads')}
              className="text-xs text-[#00E5FF] font-bold hover:underline mt-2 flex items-center justify-center gap-1 mx-auto"
            >
              Anuncie Aqui!
            </button>
          </div>
        )}
      </div>

      {/* QUICK CONNECTIONS RECOMMENDATIONS */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl" id="recommended-connections">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5">
          Conexões Recomendadas
        </h4>
        <div className="space-y-3.5">
          {recommendedUsers.length === 0 ? (
            <p className="text-xs text-gray-500 italic py-2">Nenhuma recomendação no momento.</p>
          ) : (
            recommendedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between gap-3 bg-[#1E1E30]/50 p-2 rounded-xl border border-white/5">
                <div 
                  onClick={() => onViewProfile?.(user)}
                  className="flex items-center gap-2 max-w-[150px] truncate cursor-pointer hover:opacity-80 transition-all"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="w-8.5 h-8.5 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                  />
                  <div className="truncate font-sans">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                      {user.fullName}
                      {user.isVerified && (
                        <span className="w-3 h-3 rounded-full bg-[#00E5FF] inline-flex items-center justify-center text-[7px] text-[#0A0A14] font-black shrink-0">✓</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#00E5FF] font-mono">ID: {user.username}</div>
                  </div>
                </div>
                <button
                  onClick={() => onFriendToggle(user.id)}
                  title="Conectar Amizade"
                  className="bg-[#7C4DFF]/10 hover:bg-[#7C4DFF] text-[#00E5FF] hover:text-white p-1.5 rounded-full border border-white/5 hover:border-transparent transition-all active:scale-90"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* HASHTAGS / TRENDING TOPICS */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl" id="trending-topics">
        <div className="flex items-center gap-2 mb-3.5">
          <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">
            Assuntos Populares
          </h4>
        </div>
        <div className="space-y-3">
          {hashtags.map((h, index) => (
            <div 
              key={index} 
              onClick={() => onSearch?.(h.tag)}
              className="flex items-center justify-between text-xs py-1.5 hover:bg-[#1E1E30]/60 px-2.5 rounded-xl transition-all font-sans cursor-pointer active:scale-[0.98] border border-transparent hover:border-white/5 group"
            >
              <div>
                <span className="font-semibold text-[#00E5FF] group-hover:text-cyan-300 hover:underline block text-xs">
                  #{h.tag}
                </span>
                <span className="text-[10px] text-gray-400 group-hover:text-gray-300">{h.posts} posts recentes</span>
              </div>
              <span className="text-[10px] bg-[#1E1E30] group-hover:bg-[#252545] font-mono text-gray-300 group-hover:text-white px-2 py-0.5 rounded-full transition-all">
                {index + 1}º
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING EVENTS PREVIEW */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl" id="upcoming-events-preview">
        <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3.5">
          Próximos Eventos
        </h4>
        <div className="space-y-3">
          {events.slice(0, 2).map(e => (
            <div 
              key={e.id}
              onClick={() => setActiveTab('events')} 
              className="group cursor-pointer flex gap-2.5 items-start p-2 hover:bg-[#1E1E30]/45 rounded-xl transition-all"
            >
              <div className="bg-[#FF5722]/10 p-2 rounded-lg text-[#FF5722] shrink-0 border border-white/5 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 font-sans">
                <h5 className="text-xs font-bold text-white truncate group-hover:text-[#FF5722] transition-colors">
                  {e.title}
                </h5>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                  {new Date(e.date).toLocaleDateString()} às {e.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SPONSORED AD BOTTOM */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-4.5 shadow-xl relative overflow-hidden" id="sponsored-ad-bottom">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C4DFF] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#7C4DFF] animate-pulse" />
            Patrocinado Rodapé
          </span>
          <span className="text-[9px] text-gray-400 font-mono">AD</span>
        </div>

        {bottomAd ? (
          <a
            href={bottomAd.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onAdClick(bottomAd.id)}
            className="block group"
          >
            <div className="relative overflow-hidden rounded-xl h-36 mb-3 bg-[#0A0A14] border border-white/5">
              <img
                src={bottomAd.imageUrl}
                alt={bottomAd.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14]/80 via-transparent to-transparent" />
            </div>
            <h4 className="font-extrabold text-xs text-white group-hover:text-[#7C4DFF] transition-colors flex items-center gap-1">
              {bottomAd.title}
              <ArrowUpRight className="w-3 h-3 text-gray-400" />
            </h4>
            <p className="text-[11px] text-gray-450 mt-1 line-clamp-2 leading-relaxed">
              {bottomAd.description}
            </p>
          </a>
        ) : (
          <div className="py-4 text-center border border-dashed border-white/5 rounded-xl bg-[#1E1E30]/40">
            <p className="text-xs text-gray-400 font-mono">Espaço publicitário secundário ativo.</p>
            <button 
              onClick={() => setActiveTab('ads')}
              className="text-xs text-[#7C4DFF] font-bold hover:underline mt-2 flex items-center justify-center gap-1 mx-auto"
            >
              Anuncie Aqui!
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
