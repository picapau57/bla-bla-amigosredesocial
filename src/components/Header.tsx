import { useState, ChangeEvent } from 'react';
import { User, SystemLog } from '../types';
import { Network, Bell, Search, Shuffle, ShieldAlert, BadgeCheck, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  onSelectUser: (id: string) => void;
  onSearch: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logs: SystemLog[];
}

export default function Header({
  currentUser,
  users,
  onSelectUser,
  onSearch,
  activeTab,
  setActiveTab,
  logs
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

        </div>
      </div>
    </header>
  );
}
