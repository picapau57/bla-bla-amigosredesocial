import React, { useState, FormEvent } from 'react';
import { User } from '../types';
import { 
  Rss, MessageSquare, Megaphone, Users, Calendar, Building2, ShieldCheck, 
  MapPin, Globe, Sparkles, Award, Star, Gem, CheckCircle, ShieldAlert,
  Pencil, X, Camera, Save, Settings
} from 'lucide-react';
import { motion } from 'motion/react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=200'
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=600'
];

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpgradePlan: () => void;
  onUpdateProfile?: (userId: string, updates: Partial<User>) => void;
  isAdminSessionActive?: boolean;
}

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onUpgradePlan,
  onUpdateProfile,
  isAdminSessionActive
}: SidebarProps) {

  const isSimulating = isAdminSessionActive && currentUser.id !== 'admin';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(currentUser.fullName);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [editCover, setEditCover] = useState(currentUser.cover || '');
  const [editCity, setEditCity] = useState(currentUser.city || '');
  const [editState, setEditState] = useState(currentUser.state || '');
  const [editWebsite, setEditWebsite] = useState(currentUser.website || '');

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Resize and compress chosen computer/mobile files so they fit into localStorage with perfect speed
  const resizeAndProcessFile = (file: File, targetWidth: number, targetHeight: number, callback: (resultUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Keep aspect ratio
        if (width > height) {
          if (width > targetWidth) {
            height = Math.round((height * targetWidth) / width);
            width = targetWidth;
          }
        } else {
          if (height > targetHeight) {
            width = Math.round((width * targetHeight) / height);
            height = targetHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82); // Smooth JPEG compression at 82% quality
          callback(dataUrl);
        } else {
          callback(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG).');
      return;
    }
    setIsUploadingAvatar(true);
    resizeAndProcessFile(file, 250, 250, (resultUrl) => {
      setEditAvatar(resultUrl);
      setIsUploadingAvatar(false);
    });
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG).');
      return;
    }
    setIsUploadingCover(true);
    resizeAndProcessFile(file, 800, 400, (resultUrl) => {
      setEditCover(resultUrl);
      setIsUploadingCover(false);
    });
  };

  const handleOpenEditModal = () => {
    setEditFullName(currentUser.fullName);
    setEditBio(currentUser.bio || '');
    setEditAvatar(currentUser.avatar);
    setEditCover(currentUser.cover || '');
    setEditCity(currentUser.city || '');
    setEditState(currentUser.state || '');
    setEditWebsite(currentUser.website || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) {
      alert('O Nome Completo não pode ficar em branco!');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile(currentUser.id, {
        fullName: editFullName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        cover: editCover.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
        city: editCity.trim(),
        state: editState.trim(),
        website: editWebsite.trim()
      });
    }
    setIsEditModalOpen(false);
  };

  const navItems = [
    { id: 'feed', name: 'Feed de Notícias', icon: Rss, color: 'text-cyan-400 font-bold' },
    { id: 'chats', name: 'Conversas em Tempo Real', icon: MessageSquare, color: 'text-indigo-400 font-bold' },
    { id: 'ads', name: 'Marketplace & Propagandas', icon: Megaphone, color: 'text-orange-400 font-bold' },
    { id: 'groups', name: 'Grupos e Comunidades', icon: Users, color: 'text-emerald-400 font-bold' },
    { id: 'events', name: 'Eventos da Rede', icon: Calendar, color: 'text-pink-400 font-bold' },
    { id: 'pages', name: 'Páginas Comerciais', icon: Building2, color: 'text-blue-400 font-bold' },
    ...(currentUser.id === 'admin' ? [{ id: 'admin', name: 'Painel do Administrador', icon: ShieldCheck, color: 'text-rose-400 font-bold' }] : [])
  ];

  return (
    <div className="w-full lg:w-72 shrink-0 space-y-6" id="sidebar-container-panel">
           {/* USER PROFILE CARD */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl overflow-hidden shadow-xl" id="sidebar-profile-card">
        {/* Banner */}
        <div 
          onClick={isSimulating ? undefined : handleOpenEditModal}
          className={`h-20 w-full relative bg-cover bg-center ${isSimulating ? '' : 'cursor-pointer group'}`} 
          style={{ backgroundImage: `url(${currentUser.cover})` }}
          title={isSimulating ? undefined : "Clique para editar capa"}
        >
          {!isSimulating && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-xs text-white font-semibold font-mono gap-1">
              <Camera className="w-3.5 h-3.5" /> Mudar Capa
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121225] via-transparent to-transparent" />
        </div>

        {/* Info */}
        <div className="px-5 pb-5 pt-0 relative flex flex-col items-center">
          {/* Interactive Profile Photo */}
          <div 
            onClick={isSimulating ? undefined : handleOpenEditModal}
            className={`relative -mt-9 z-10 w-18 h-18 rounded-full border-4 border-[#121225] shadow-xl overflow-hidden ${isSimulating ? '' : 'group cursor-pointer'}`}
            title={isSimulating ? undefined : "Clique para alterar sua foto de perfil"}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${isSimulating ? '' : 'group-hover:scale-110 transition-transform duration-300'}`}
            />
            {!isSimulating && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                <Camera className="w-4 h-4 text-[#00E5FF] animate-pulse" />
                <span className="text-[8px] font-bold uppercase mt-0.5 tracking-tighter">Editar</span>
              </div>
            )}
          </div>
          
          <div className="text-center mt-2">
            <h3 className="text-white font-bold text-base flex items-center justify-center gap-1">
              {currentUser.fullName}
              {currentUser.isVerified && (
                <CheckCircle className="w-4 h-4 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" title="Perfil Verificado" />
              )}
            </h3>
            <p className="text-[#00E5FF] text-xs font-mono">ID: {currentUser.username}</p>
            {isSimulating && (
              <span className="inline-block mt-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                Modo Simulação
              </span>
            )}
          </div>

          <p className="text-gray-400 text-xs text-center mt-2 line-clamp-2 italic px-2 font-sans">
            "{currentUser.bio || 'Sem biografia definida.'}"
          </p>

          {/* Edit Profile Quick Button */}
          {isSimulating ? (
            <div
              className="w-full mt-3 bg-[#16162a] border border-white/5 text-gray-500 text-xs font-semibold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
              title="Edição desabilitada no modo de simulação"
            >
              <Settings className="w-3.5 h-3.5 text-gray-600" />
              Sessão de Simulação
            </div>
          ) : (
            <button
              onClick={handleOpenEditModal}
              className="w-full mt-3 bg-[#1A1A32] hover:bg-[#25254A] border border-white/5 hover:border-[#00E5FF]/30 text-xs font-semibold py-1.5 px-3 rounded-xl transition-all duration-300 text-gray-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-[#00E5FF]" />
              Editar Perfil / Foto
            </button>
          )}

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

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-[#0A0A14]/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="edit-profile-modal-overlay">
          <div className="bg-[#121225] border border-white/10 w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 font-mono">
                <Settings className="w-5 h-5 text-[#00E5FF]" /> Editar Meu Perfil
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Profile Pictures Header Visual Preview */}
              <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/5 relative flex flex-col items-center">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest absolute top-2 right-3">Prévia Visual</span>
                {/* Banner Preview */}
                <div 
                  className="h-16 w-full rounded-lg bg-cover bg-center mb-6 relative overflow-hidden" 
                  style={{ backgroundImage: `url(${editCover || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'})` }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0A0A14] to-transparent" />
                </div>
                {/* Avatar Preview */}
                <div className="relative -mt-11 z-[5]">
                  <img
                    src={editAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                    alt="Preview"
                    className="w-14 h-14 rounded-full border-2 border-white/20 object-cover shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </div>
              </div>

              {/* General details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1 flex items-center justify-between">
                    <span>Nome de Exibição (Completo)</span>
                    {currentUser.id !== 'admin' && (
                      <span className="text-[9px] text-[#00E5FF] font-mono font-bold flex items-center gap-0.5">
                        🔒 Identidade Verificada
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={currentUser.id !== 'admin'}
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Ex: Roseni Ferreira de Souza"
                    className={`w-full text-xs p-2.5 rounded-xl border font-semibold focus:outline-none transition-all ${
                      currentUser.id === 'admin'
                        ? 'bg-[#1A1A32] text-white border-white/10 focus:border-[#00E5FF]'
                        : 'bg-[#0A0A14] text-gray-400 border-white/5 cursor-not-allowed'
                    }`}
                  />
                  {currentUser.id !== 'admin' && (
                    <p className="text-[9px] text-gray-500 mt-1 font-sans leading-relaxed">
                      Por motivos de conformidade profissional, alterações cadastrais de nome requerem suporte administrativo.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Cidade e Estado</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Cidade (Ex: São Paulo)"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                    />
                    <input
                      type="text"
                      placeholder="Estado (Ex: SP)"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Biografia Curta</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Escreva algo sobre você..."
                  maxLength={160}
                  className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] min-h-[60px] max-h-[100px]"
                />
              </div>

              {/* Foto de Perfil Selection (AVATAR) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">1. Foto de Perfil (Como mudar sua foto)</label>
                  <span className="text-[9px] text-[#00E5FF] font-mono">Selecione uma sugestão 👇</span>
                </div>
                {/* Suggestions Grid */}
                <div className="grid grid-cols-5 gap-2.5 bg-[#0A0A14] p-3 rounded-xl border border-white/5">
                  {PRESET_AVATARS.map((url, index) => {
                    const isSelected = editAvatar === url;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setEditAvatar(url)}
                        className={`relative w-8.5 h-8.5 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected ? 'border-[#00E5FF] scale-110 shadow-[0_0_8px_#00E5FF]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${index}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>

                {/* Real File Upload from Device */}
                <div className="bg-[#1A1A32] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center relative hover:bg-[#232344] hover:border-[#00E5FF]/30 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    id="avatar-file-upload-input"
                  />
                  <Camera className="w-5 h-5 text-[#00E5FF] mb-1 animate-pulse group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">Buscar Foto no Computador ou Celular</span>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-[90%] leading-normal">Selecione uma foto da sua galeria e ela será recortada, comprimida e ativada no seu perfil automaticamente.</p>
                  
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-[#0A0A14]/95 rounded-xl flex items-center justify-center gap-2 z-20">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
                      <span className="text-[11px] font-bold text-[#00E5FF] font-mono uppercase tracking-wider animate-pulse">Otimizando e Comprimindo Foto...</span>
                    </div>
                  )}
                </div>

                {/* Custom URL Field */}
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono mb-1">Ou cole o link (URL) de uma imagem da internet:</label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://exemplo.com/suafoto.jpg"
                    className="w-full bg-[#1A1A32] text-white p-2 rounded-xl border border-white/10 text-[11px] font-mono focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Capa do Perfil Selection (COVER) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">2. Capa do Perfil (Banner de fundo)</label>
                </div>
                {/* Covers grid */}
                <div className="grid grid-cols-5 gap-1.5 bg-[#0A0A14] p-2 rounded-xl border border-white/5">
                  {PRESET_COVERS.map((url, index) => {
                    const isSelected = editCover === url;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setEditCover(url)}
                        className={`relative h-6.5 rounded overflow-hidden border-2 transition-all cursor-pointer bg-cover bg-center ${
                          isSelected ? 'border-[#00E5FF] scale-105 shadow-[0_0_5px_#00E5FF]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundImage: `url(${url})` }}
                      />
                    );
                  })}
                </div>

                {/* Real Cover File Upload from Device */}
                <div className="bg-[#1A1A32] p-2.5 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center relative hover:bg-[#232344] hover:border-[#00E676]/30 transition-all cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    id="cover-file-upload-input"
                  />
                  <span className="text-[11px] font-bold text-white flex items-center gap-1.5 justify-center uppercase tracking-wide">
                    <Camera className="w-4 h-4 text-[#00E676] group-hover:scale-115 transition-transform" /> Carregar Capa do Dispositivo
                  </span>
                  
                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-[#0A0A14]/95 rounded-xl flex items-center justify-center gap-2 z-20">
                      <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#00E676] font-mono uppercase tracking-wider animate-pulse">Otimizando Capa...</span>
                    </div>
                  )}
                </div>

                {/* Custom cover URL */}
                <div>
                  <input
                    type="url"
                    value={editCover}
                    onChange={(e) => setEditCover(e.target.value)}
                    placeholder="Cole aqui um link de capa personalizado..."
                    className="w-full bg-[#1A1A32] text-white p-2 rounded-xl border border-white/10 text-[11px] font-mono focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Website Pessoal / Link de Redes Sociais</label>
                <input
                  type="text"
                  placeholder="Ex: https://instagram.com/seuusuario"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
                />
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:opacity-90 font-bold text-xs uppercase tracking-wide text-white rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#00E5FF]/10"
                >
                  <Save className="w-4 h-4" /> Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
