import { User } from '../types';
import { 
  Rss, MessageSquare, Megaphone, Users, Calendar, Building2, ShieldCheck, 
  MapPin, Globe, Sparkles, Award, Star, Gem, CheckCircle, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpgradePlan: () => void;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onUpgradePlan
}: SidebarProps) {

  const navItems = [
    { id: 'feed', name: 'Feed de Notícias', icon: Rss, color: 'text-cyan-400 font-bold' },
    { id: 'chats', name: 'Conversas em Tempo Real', icon: MessageSquare, color: 'text-indigo-400 font-bold' },
    { id: 'ads', name: 'Marketplace & Propagandas', icon: Megaphone, color: 'text-orange-400 font-bold' },
    { id: 'groups', name: 'Grupos e Comunidades', icon: Users, color: 'text-emerald-400 font-bold' },
    { id: 'events', name: 'Eventos da Rede', icon: Calendar, color: 'text-pink-400 font-bold' },
    { id: 'pages', name: 'Páginas Comerciais', icon: Building2, color: 'text-blue-400 font-bold' },
    { id: 'admin', name: 'Painel do Administrador', icon: ShieldCheck, color: 'text-rose-400 font-bold' }
  ];

  return (
    <div className="w-full lg:w-72 shrink-0 space-y-6" id="sidebar-container-panel">
           {/* USER PROFILE CARD */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl overflow-hidden shadow-xl" id="sidebar-profile-card">
        {/* Banner */}
        <div className="h-20 w-full relative bg-cover bg-center" style={{ backgroundImage: `url(${currentUser.cover})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#121225] via-transparent to-transparent" />
        </div>

        {/* Info */}
        <div className="px-5 pb-5 pt-0 relative flex flex-col items-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-18 h-18 rounded-full border-4 border-[#121225] object-cover shadow-xl -mt-9 relative z-10 hover:scale-105 transition-transform duration-300"
          />
          
          <div className="text-center mt-2">
            <h3 className="text-white font-bold text-base flex items-center justify-center gap-1">
              {currentUser.fullName}
              {currentUser.isVerified && (
                <CheckCircle className="w-4 h-4 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" title="Perfil Verificado" />
              )}
            </h3>
            <p className="text-[#00E5FF] text-xs font-mono">@{currentUser.username}</p>
          </div>

          <p className="text-gray-400 text-xs text-center mt-2 line-clamp-2 italic px-2 font-sans">
            "{currentUser.bio || 'Sem biografia definida.'}"
          </p>

          {/* Badges */}
          {currentUser.badges && currentUser.badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-3">
              {currentUser.badges.map((b, i) => (
                <span
                  key={i}
                  className="bg-[#1E1E30] text-[#00E5FF] text-[9px] font-semibold font-mono tracking-wide px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-1"
                >
                  <Award className="w-2.5 h-2.5 text-orange-400" />
                  {b}
                </span>
              ))}
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 w-full border-t border-b border-white/10 py-3 mt-4 text-center">
            <div>
              <div className="text-sm font-bold text-slate-100 italic">{currentUser.friends?.length || 0}</div>
              <div className="text-[9px] text-gray-450 text-gray-400 uppercase tracking-widest leading-none mt-1">Conexões</div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 italic">{currentUser.followers?.length || 0}</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-widest leading-none mt-1">Seguidores</div>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 italic">{currentUser.following?.length || 0}</div>
              <div className="text-[9px] text-gray-400 uppercase tracking-widest leading-none mt-1">Seguindo</div>
            </div>
          </div>

          <div className="w-full space-y-1.5 text-xs text-gray-400 mt-4 px-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#7C4DFF] shrink-0" />
              <span>{currentUser.city}, {currentUser.state} - {currentUser.country}</span>
            </div>
            {currentUser.website && (
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                <a
                  href={currentUser.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00E5FF] hover:underline truncate"
                >
                  {currentUser.website.replace('https://', '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-3 shadow-xl" id="sidebar-nav-tabs">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">
          Área de Navegação
        </div>
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00E5FF]/10 to-transparent border-l-2 border-[#00E5FF] text-[#00E5FF] font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E30]/40'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#00E5FF]' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isActive ? 'text-[#00E5FF] font-medium' : 'text-gray-450 text-gray-400'}`}>{item.name}</span>
                </span>
                
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* PREMIUM UPGRADE PROMO */}
      <div 
        className="bg-gradient-to-br from-[#7C4DFF] to-[#FF5722] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden group cursor-pointer"
        onClick={onUpgradePlan}
        id="sidebar-upgrade-card"
      >
        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-all duration-300" />
        <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-all duration-300" />
        
        <div className="flex items-center gap-2 mb-2">
          {currentUser.premiumPlan === 'free' ? (
            <Gem className="w-5 h-5 text-white animate-bounce" />
          ) : (
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E5FF]">
            {currentUser.premiumPlan === 'free' ? 'Plano Premium' : `Plano Ativo: ${currentUser.premiumPlan}`}
          </span>
        </div>

        {currentUser.premiumPlan === 'free' ? (
          <>
            <h4 className="text-white font-bold text-sm tracking-tight">
              Torne-se PRO e ganhe Selo de Verificado!
            </h4>
            <p className="text-white/80 text-[11px] mt-1.5 leading-relaxed">
              Destaque suas postagens comerciais, ganhe estatísticas analíticas detalhadas e use até 50GB extras de armazenamento.
            </p>
            <button className="w-full py-2.5 mt-4 bg-white text-[#0A0A14] rounded-lg font-black text-xs uppercase tracking-wider hover:bg-white/90 transition-all duration-300 shadow-xl">
              Assinar Agora
            </button>
          </>
        ) : (
          <>
            <h4 className="text-white font-bold text-xs tracking-tight flex items-center gap-1.5">
              Selo Premium Ativado
              <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
            </h4>
            <p className="text-white/85 text-[11px] mt-1.5 leading-relaxed">
              Você possui benefícios completos de alcance inteligente de feed, anúncios patrocinados liberados e métricas especiais.
            </p>
            <div className="text-[9px] font-mono text-[#00E5FF] tracking-wider uppercase mt-3">
              Suporte Prioritário Ativo
            </div>
          </>
        )}
      </div>

    </div>
  );
}
