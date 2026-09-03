import { useState, useEffect, ChangeEvent } from 'react';
import { User, SystemLog } from '../types';
import { Network, Bell, Search, Shuffle, ShieldAlert, BadgeCheck, Compass, MessageSquare, Sun, Moon, Download, Share, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSelectUser: (id: string) => void;
  onSearch: (term: string) => void;
  searchTerm?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logs: SystemLog[];
  isAdminSessionActive?: boolean;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
}

export default function Header({
  currentUser,
  users,
  onSelectUser,
  onSearch,
  searchTerm: parentSearchTerm = '',
  activeTab,
  setActiveTab,
  logs,
  isAdminSessionActive,
  theme = 'light',
  setTheme
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm);

  // BBA PWA installation states and events
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      alert("Para instalar o Bla Bla Amigos (BBA) no seu celular ou computador:\n\n1. Abra o menu de opções do navegador (três pontinhos ou ícone de compartilhar).\n2. Selecione 'Instalar aplicativo' ou 'Adicionar à tela de início'.\n\nPronto! O aplicativo será adicionado com o ícone e sigla BBA oficial.");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[BBA PWA] User prompt outcome: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  useEffect(() => {
    setSearchTerm(parentSearchTerm);
  }, [parentSearchTerm]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  // Filter out admin or blocked users and mock example users for quick switching
  const quickSwitchUsers = users.filter(u => 
    u.id !== currentUser.id && 
    !u.isBlocked && 
    !['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin'].includes(u.id)
  );

  const notifications = logs.filter(l => l.type === 'success' || l.type === 'warning').slice(0, 5);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#121225]/80 backdrop-blur-md border-b border-white/10 text-white shadow-xl px-4 md:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* LOGO AREA */}
        <div 
          onClick={() => setActiveTab('feed')} 
          className="flex items-center gap-2 cursor-pointer group"
          id="header-logo-container"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-[#7C4DFF] via-[#00E5FF] to-[#00E676] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] shadow-[#00E5FF]/20 group-hover:scale-105 transition-all duration-350">
            <Network className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              BLA, BLA, AMIGOS
            </span>
            <div className="hidden sm:block text-[9px] font-mono tracking-widest text-[#00E5FF] text-left uppercase">
              REDE SOCIAL PREMIUM
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="hidden md:flex flex-1 max-w-md relative" id="header-search-container">
          <input
            type="text"
            placeholder="Pesquisar fotos, hashtags, classificados, eventos..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-[#1E1E30] text-gray-300 pl-10 pr-4 py-2 rounded-full border border-white/5 focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/20 text-sm placeholder-gray-500 transition-all duration-300"
          />
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
        </div>

        {/* UTILITIES / PERSPECTIVE SWITCHERS */}
        <div className="flex items-center gap-2.5 md:gap-4">
          
          {/* BATE-PAPO REALTIME SHORTCUT BUTTON */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs font-black transition-all duration-300 active:scale-95 cursor-pointer ${
              activeTab === 'chats'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'bg-white/5 border-white/5 text-gray-300 hover:text-white hover:border-indigo-500/30 hover:bg-indigo-500/10'
            }`}
            title="Abrir Bate-Papo em Tempo Real"
            id="header-bate-papo-shortcut"
          >
            <MessageSquare className={`w-4 h-4 ${activeTab === 'chats' ? 'text-white animate-bounce' : 'text-[#00E5FF]'}`} />
            <span className="font-sans">Bate-Papo</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </button>

          {/* BOTÃO DE INSTALAÇÃO DO APLICATIVO BBA */}
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-[#00E5FF] via-[#00E676] to-[#00E5FF] hover:brightness-110 text-slate-950 text-xs font-black shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:shadow-[0_0_20px_rgba(0,230,118,0.5)] transition-all duration-300 active:scale-95 cursor-pointer shrink-0"
            title="Instalar Aplicativo BBA no Celular ou PC"
            id="header-pwa-install-btn"
          >
            <Download className="w-3.5 h-3.5 animate-bounce text-slate-950" />
            <span className="hidden sm:inline font-sans">Instalar App</span>
            <span className="bg-slate-950 text-[#00E5FF] text-[8px] px-1 rounded font-mono font-bold">
              BBA
            </span>
          </button>

          {/* THEME SWITCHER */}
          {setTheme && (
            <div className="flex items-center bg-black/15 p-1 rounded-full border border-white/10 gap-0.5" id="header-theme-switcher">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center p-1.5 md:px-2.5 md:py-1 rounded-full text-[10px] font-black transition-all duration-300 active:scale-95 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[#7C4DFF] text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Modo Cinza Claro"
                aria-label="Modo Cinza Claro"
              >
                <Sun className="w-3.5 h-3.5 md:mr-1" />
                <span className="hidden md:inline">Claro</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center p-1.5 md:px-2.5 md:py-1 rounded-full text-[10px] font-black transition-all duration-300 active:scale-95 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Modo Escuro Clássico"
                aria-label="Modo Escuro Clássico"
              >
                <Moon className="w-3.5 h-3.5 md:mr-1" />
                <span className="hidden md:inline">Escuro</span>
              </button>
            </div>
          )}

          {/* USER SWAPPER (SIMULATE SESSIONS) */}
          <div className="relative" id="header-user-swapper">
            {currentUser.id === 'admin' ? (
              <button
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                title="Alternar Sessão de Usuário"
                className="flex items-center gap-2 bg-white/5 p-1.5 pr-3.5 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-[#7C4DFF]"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold leading-none max-w-[90px] truncate text-white">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-[#00E5FF] font-mono flex items-center gap-0.5 mt-0.5">
                    ID: {currentUser.username}
                    {currentUser.isVerified && <BadgeCheck className="w-3 h-3 text-[#00E5FF] inline" />}
                  </div>
                </div>
                <Shuffle className="w-3.5 h-3.5 text-[#00E5FF] animate-spin-slow ml-1" />
              </button>
            ) : (
              <div
                className="flex items-center gap-2 bg-white/5 p-1.5 pr-3.5 rounded-full border border-white/5 select-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-[#7C4DFF]"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold leading-none max-w-[90px] truncate text-white">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-[#00E5FF] font-mono flex items-center gap-0.5 mt-0.5">
                    ID: {currentUser.username}
                    {currentUser.isVerified && <BadgeCheck className="w-3 h-3 text-[#00E5FF] inline" />}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {currentUser.id === 'admin' && showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3.5 w-64 bg-[#121225]/95 border border-white/10 rounded-2xl p-3 shadow-2xl text-slate-300 backdrop-blur-lg animate-fade-in"
                >
                  <div className="text-[11px] font-bold text-[#00E5FF] uppercase tracking-widest px-2 mb-2">
                    Contas de Membros Reais
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {quickSwitchUsers.length === 0 ? (
                      <div className="text-[10px] text-gray-400 italic p-3.5 text-center leading-relaxed">
                        Nenhum outro usuário real cadastrado nesta plataforma ainda.
                      </div>
                    ) : (
                      quickSwitchUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSelectUser(u.id);
                            setShowUserDropdown(false);
                            setActiveTab('feed');
                          }}
                          className="w-full flex items-center gap-3 p-2 hover:bg-[#1E1E30]/60 rounded-xl transition-all text-left"
                        >
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="text-xs truncate">
                            <div className="font-semibold text-white flex items-center gap-1">
                              {u.fullName}
                              {u.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-[#00E5FF] inline" />}
                            </div>
                            <div className="text-gray-400 text-[10px] font-mono">ID: {u.username}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t border-white/10 mt-2.5 pt-2.5 px-2">
                    <button
                      onClick={() => {
                        onSelectUser('admin');
                        setShowUserDropdown(false);
                        setActiveTab('admin');
                      }}
                      className="w-full flex items-center justify-between text-xs text-rose-450 text-rose-400 font-semibold hover:text-rose-300 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 font-sans">
                        <ShieldAlert className="w-4 h-4" />
                        Acesso Administrador
                      </span>
                      <span className="bg-rose-500/10 border border-rose-500/30 text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
                        Admin
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NOTIFICATION HUB */}
          <div className="relative" id="header-notifications">
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2.5 bg-white/5 rounded-full border border-white/5 text-gray-350 text-gray-300 hover:text-white hover:border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <Bell className="w-4.5 h-4.5 text-[#00E5FF]" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-[#FF5722] text-white rounded-full font-bold text-[9px] flex items-center justify-center animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3.5 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl p-4 shadow-2xl text-slate-300 backdrop-blur-lg"
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-900">
                    <span className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                      Notificações Recentes
                    </span>
                    <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full">
                      Tempo Real
                    </span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Nada pendente no momento. Viva a amizade! ✨
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border text-xs text-slate-200 transition-all ${
                            n.type === 'warning'
                              ? 'bg-amber-500/5 border-amber-500/20'
                              : 'bg-emerald-500/5 border-emerald-500/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold block mb-0.5">
                              {n.type === 'warning' ? '🛡️ Alerta Moderação' : '✨ Sistema'}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono shrink-0">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-xs leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ADMIN SPEED LINK (FOR EASIER EVALUATION) */}
          {currentUser.id === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-full border border-pink-400/20 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200"
            >
              <Compass className="w-4 h-4 text-pink-200 animate-spin-slow" />
              Ver Painel Admin
            </button>
          )}

          {/* SIMULATION EXIT LINK (RETURN TO ADMIN) */}
          {currentUser.id !== 'admin' && isAdminSessionActive && (
            <button
              onClick={() => {
                onSelectUser('admin');
                setActiveTab('admin');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:brightness-110 text-white font-bold text-xs px-3.5 py-2.5 rounded-full border border-rose-400/20 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-rose-100 animate-pulse" />
              Voltar ao Admin
            </button>
          )}

        </div>
      </div>

      {/* iOS INSTALL INSTRUCTIONS MODAL */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" id="ios-pwa-install-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#121225] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-left"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#1A1A32]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4.5 h-4.5 text-[#00E5FF] animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Instalar App no iPhone / iPad
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* App profile preview */}
                <div className="flex items-center gap-4 bg-[#0A0A14] p-3.5 rounded-xl border border-white/5">
                  <img 
                    src="/icon-512.jpg" 
                    alt="BBA Logo" 
                    className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10" 
                  />
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Bla Bla Amigos</h4>
                    <p className="text-[10px] text-[#00E5FF] font-mono tracking-wider font-bold mt-0.5">SIGLA: BBA</p>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                      Adicione o aplicativo à sua tela de início para acessar diretamente em tela cheia!
                    </p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#00E5FF] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs text-gray-300 leading-relaxed">
                      Toque no botão de <span className="text-white font-bold inline-flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded border border-white/10"><Share className="w-3 h-3 text-blue-400 inline" /> Compartilhar</span> (na barra inferior ou superior do Safari).
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#00E5FF] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs text-gray-300 leading-relaxed">
                      Role o menu para baixo e selecione a opção <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">Adicionar à Tela de Início</span>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[#00E5FF] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs text-gray-300 leading-relaxed">
                      Toque em <span className="text-white font-bold text-blue-400">Adicionar</span> no canto superior direito para confirmar.
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-[11px] text-emerald-300 leading-relaxed font-sans">
                  ✨ Pronto! O ícone premium com a sigla <strong className="font-extrabold text-[#00E676]">BBA</strong> será instalado e você poderá usá-lo como um aplicativo nativo completo do Facebook!
                </div>

                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="w-full py-2.5 bg-[#1A1A32] hover:bg-[#25254A] border border-white/10 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Entendi, fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </header>
  );
}
