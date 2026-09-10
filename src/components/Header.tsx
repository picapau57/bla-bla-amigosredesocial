import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { User, SystemLog } from '../types';
import { 
  Network, Bell, Search, Shuffle, ShieldAlert, BadgeCheck, Compass, 
  MessageSquare, MessageCircle, Sun, Moon, Download, Share, X, Smartphone,
  LayoutGrid, Home, Film, Megaphone, Users, User as UserIcon, LayoutDashboard,
  Gift, Radio, Calendar, Building2, Briefcase, Lightbulb, Gamepad2, LogOut,
  ChevronDown, CheckCircle, ShieldCheck, Sparkles, FileText, Lock
} from 'lucide-react';
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
  onViewProfile?: (user: User) => void;
  onLogout?: () => void;
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
  theme = 'dark',
  setTheme,
  onViewProfile,
  onLogout
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(parentSearchTerm);

  // BBA PWA installation states and events
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const gridMenuRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (gridMenuRef.current && !gridMenuRef.current.contains(event.target as Node)) {
        setShowGridMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const notifications = logs.filter(l => l.type === 'success' || l.type === 'warning').slice(0, 6);

  // Central Navigation Tabs matching Facebook Web (Início, Reels, Marketplace, Grupos, Jogos)
  const mainNavTabs = [
    { id: 'feed', label: 'Início', icon: Home },
    { id: 'reels', label: 'Vídeos / Reels', icon: Film },
    { id: 'ads', label: 'Marketplace', icon: Megaphone },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'games', label: 'Jogos', icon: Gamepad2 },
  ];

  // All platform shortcuts for the Apps/Grid menu
  const gridShortcuts = [
    { id: 'feed', label: 'Início & Feed', icon: Home, color: 'text-[#1877F2] bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/40' },
    { id: 'chats', label: 'Bate-Papo & Chat', icon: MessageCircle, color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/40' },
    { id: 'reels', label: 'Reels & Vídeos', icon: Film, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/40' },
    { id: 'ads', label: 'Marketplace / Anúncios', icon: Megaphone, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/40' },
    { id: 'groups', label: 'Grupos & Comunidades', icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/40' },
    { id: 'lives', label: 'Lives ao Vivo 🔴', icon: Radio, color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900/40' },
    { id: 'referrals', label: 'Indique & Ganhe', icon: Gift, color: 'text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-900/40' },
    { id: 'events', label: 'Eventos & Calendário', icon: Calendar, color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900/40' },
    { id: 'jobs', label: 'Vagas & Empregos', icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900/40' },
    { id: 'ideas', label: 'Exponha suas ideias', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/40 dark:border-yellow-900/40' },
    { id: 'games', label: 'Jogos & Passatempos', icon: Gamepad2, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-900/40' },
    { id: 'pages', label: 'Páginas Comerciais', icon: Building2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900/40' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#242526] border-b border-[#E4E6EB] dark:border-[#3A3B3C] shadow-sm transition-colors" id="custom-main-header">
      
      {/* MAIN TOP BAR */}
      <div className="w-full px-2 sm:px-4 h-14 flex items-center justify-between gap-1 sm:gap-4">
        
        {/* 1. LEFT: LOGO & SEARCH PILL */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            onClick={() => setActiveTab('feed')} 
            className="flex items-center gap-2 cursor-pointer group select-none"
            id="header-logo-container"
            title="Ir para o Feed de Notícias"
          >
            {/* Facebook-style circular Blue Brand badge */}
            <div className="w-10 h-10 rounded-full bg-[#1877F2] hover:bg-[#166FE5] flex items-center justify-center shadow-sm text-white font-black text-lg tracking-tighter transition-all">
              bba
            </div>

            {/* Brand Title */}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-[#1877F2] dark:text-[#2D88FF] font-black text-xl tracking-tight leading-none">
                bla bla amigos
              </span>
              <span className="text-[9px] font-semibold text-gray-500 tracking-wider uppercase mt-0.5">
                Rede Social
              </span>
            </div>
          </div>

          {/* Facebook Search Pill */}
          <div className="relative" id="header-search-container">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Pesquisar no Bla Bla Amigos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-36 sm:w-56 md:w-64 bg-[#F0F2F5] dark:bg-[#3A3B3C] text-[#050505] dark:text-[#E4E6EB] text-xs sm:text-sm pl-9 pr-3 py-2 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-[#1877F2]/40 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. CENTER: FACEBOOK NAVIGATION TABS (Desktop / Tablet) */}
        <div className="hidden md:flex items-center justify-center h-full flex-1 max-w-2xl px-2">
          {mainNavTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 h-14 flex items-center justify-center relative transition-colors cursor-pointer group px-2 lg:px-4 ${
                  isTabActive
                    ? 'text-[#1877F2] dark:text-[#2D88FF]'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-[#F2F2F2] dark:hover:bg-[#3A3B3C] rounded-lg my-1'
                }`}
                title={tab.label}
              >
                <Icon className={`w-6 h-6 transition-transform group-hover:scale-105 ${isTabActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
                {isTabActive && (
                  <span className="absolute bottom-0 inset-x-2 h-[3px] bg-[#1877F2] dark:bg-[#2D88FF] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. RIGHT: CIRCULAR ACTION BUTTONS (Menu, Chat, Notifications, User) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* A. Apps / Grid Menu Button */}
          <div className="relative" ref={gridMenuRef}>
            <button
              onClick={() => {
                setShowGridMenu(!showGridMenu);
                setShowNotifDropdown(false);
                setShowUserDropdown(false);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
                showGridMenu 
                  ? 'bg-[#E7F3FF] text-[#1877F2] dark:bg-[#263951] dark:text-[#2D88FF]' 
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] dark:text-[#E4E6EB]'
              }`}
              title="Menu & Recursos"
              id="header-apps-grid-btn"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            {/* Grid Apps Dropdown Modal */}
            <AnimatePresence>
              {showGridMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-2xl p-4 shadow-2xl text-[#050505] dark:text-[#E4E6EB] z-50 animate-fade-in"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] dark:border-[#3A3B3C] mb-3">
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-[#1877F2]" />
                      <span className="text-sm font-bold">
                        Menu do Bla Bla Amigos
                      </span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-[#1877F2] dark:bg-blue-900/40 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      Recursos
                    </span>
                  </div>

                  {/* Grid Buttons */}
                  <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                    {gridShortcuts.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setShowGridMenu(false);
                          }}
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                            isItemActive 
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1877F2] font-semibold' 
                              : 'hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] text-gray-700 dark:text-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded-xl border shrink-0 ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-semibold leading-snug truncate">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Admin Direct Access */}
                  {currentUser.id === 'admin' && (
                    <div className="mt-3 pt-3 border-t border-[#E4E6EB] dark:border-[#3A3B3C]">
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setShowGridMenu(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-rose-600" />
                        Painel Administrativo Completo
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* B. Messenger / Chat Button */}
          <button
            onClick={() => setActiveTab('chats')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
              activeTab === 'chats' 
                ? 'bg-[#E7F3FF] text-[#1877F2] dark:bg-[#263951] dark:text-[#2D88FF]' 
                : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] dark:text-[#E4E6EB]'
            }`}
            title="Messenger / Bate-Papo"
            id="header-chat-btn"
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          {/* C. Notifications Bell Button */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setShowUserDropdown(false);
                setShowGridMenu(false);
              }}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 ${
                showNotifDropdown 
                  ? 'bg-[#E7F3FF] text-[#1877F2] dark:bg-[#263951] dark:text-[#2D88FF]' 
                  : 'bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] dark:text-[#E4E6EB]'
              }`}
              title="Notificações"
              id="header-notif-btn"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full font-bold text-[9px] flex items-center justify-center shadow">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-2xl p-4 shadow-2xl text-[#050505] dark:text-[#E4E6EB] z-50"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E6EB] dark:border-[#3A3B3C] mb-3">
                    <span className="font-bold text-base">
                      Notificações
                    </span>
                    <span className="text-xs text-[#1877F2] hover:underline cursor-pointer">
                      Ver todas
                    </span>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      Nenhuma notificação nova no momento.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl border border-[#E4E6EB] dark:border-[#3A3B3C] hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] transition-colors text-left flex gap-3 items-start"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1877F2] flex items-center justify-center shrink-0 font-bold text-xs">
                            {n.type === 'warning' ? '⚠️' : '🔔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#050505] dark:text-[#E4E6EB] font-medium leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* D. User Avatar Button & Menu */}
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifDropdown(false);
                setShowGridMenu(false);
              }}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-[#1877F2]/40 transition-all cursor-pointer group"
              title="Conta & Configurações"
              id="header-user-avatar-btn"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#00E5FF]/40 group-hover:ring-[#00E5FF] transition-all bg-neutral-800"
              />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1 hidden sm:block group-hover:text-white" />
            </button>

            {/* Profile / Account Dropdown */}
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#242526] border border-[#E4E6EB] dark:border-[#3A3B3C] rounded-2xl p-3 shadow-2xl text-[#050505] dark:text-[#E4E6EB] z-50 text-left"
                >
                  {/* User details header */}
                  <div 
                    onClick={() => {
                      onViewProfile?.(currentUser);
                      setShowUserDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] transition-all cursor-pointer shadow-sm border border-[#E4E6EB] dark:border-[#3A3B3C]"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.fullName}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-[#1877F2]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#050505] dark:text-[#E4E6EB] truncate flex items-center gap-1">
                        {currentUser.fullName}
                        {currentUser.isVerified && <BadgeCheck className="w-4 h-4 text-[#1877F2] inline shrink-0" />}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono truncate">@{currentUser.username}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] my-2" />

                  {/* Menu Options */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onViewProfile?.(currentUser);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-xl transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] flex items-center justify-center">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span>Ver Meu Perfil Completo</span>
                    </button>

                    <button
                      onClick={() => {
                        handleInstallClick();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-xl transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                          <Download className="w-4 h-4" />
                        </div>
                        <span>Instalar Aplicativo BBA</span>
                      </span>
                      <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                        PWA
                      </span>
                    </button>

                    {/* Theme toggle */}
                    {setTheme && (
                      <button
                        onClick={() => {
                          setTheme(theme === 'light' ? 'dark' : 'light');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-xl transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          </div>
                          <span>Modo {theme === 'light' ? 'Escuro' : 'Claro'}</span>
                        </span>
                        <span className="text-[10px] text-gray-500 capitalize">
                          {theme === 'light' ? 'Ativar escuro' : 'Ativar claro'}
                        </span>
                      </button>
                    )}

                    {/* Privacy and AdSense institutional policy */}
                    <button
                      onClick={() => {
                        setShowPrivacyModal(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-xl transition-all cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span>Privacidade & Termos de Uso</span>
                    </button>
                  </div>

                  {/* Switch user accounts (if admin) */}
                  {currentUser.id === 'admin' && (
                    <div className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] mt-2 pt-2">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5">
                        Simular Usuários
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-0.5 pr-1">
                        {quickSwitchUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u.id);
                              setShowUserDropdown(false);
                              setActiveTab('feed');
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#F0F2F5] dark:hover:bg-[#3A3B3C] rounded-lg transition-all text-left text-xs"
                          >
                            <img src={u.avatar} alt={u.fullName} className="w-6 h-6 rounded-full object-cover" />
                            <span className="truncate text-gray-800 dark:text-gray-200">{u.fullName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Logout Button */}
                  {onLogout && (
                    <div className="border-t border-[#E4E6EB] dark:border-[#3A3B3C] mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sair do Bla Bla Amigos</span>
                      </button>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION TABS BAR (Visible only on mobile screens) */}
      <div className="md:hidden w-full border-t border-[#E4E6EB] dark:border-[#3A3B3C] bg-white dark:bg-[#242526] px-2 flex justify-around items-center h-12">
        {mainNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isTabActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-full flex items-center justify-center relative cursor-pointer ${
                isTabActive
                  ? 'text-[#1877F2] dark:text-[#2D88FF]'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              title={tab.label}
            >
              <Icon className={`w-5 h-5 ${isTabActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              {isTabActive && (
                <span className="absolute bottom-0 inset-x-2 h-[3px] bg-[#1877F2] dark:bg-[#2D88FF] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* PRIVACY & TERMS MODAL (FOR ADSENSE COMPLIANCE) */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0B132B] border border-[#1E293B] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-left my-8"
            >
              <div className="p-4.5 border-b border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Termos de Uso & Política de Privacidade (AdSense Compliance)
                  </span>
                </div>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-gray-300 leading-relaxed scrollbar-thin">
                <h4 className="text-sm font-bold text-white">1. Identificação e Compromisso</h4>
                <p>
                  A plataforma <strong>BLA, BLA, BLA DA AMIZADE - REDE SOCIAL PREMIUM</strong> é uma comunidade digital segura e transparente, destinada a conectar amigos, profissionais e comunidades em todo o Brasil.
                </p>

                <h4 className="text-sm font-bold text-white">2. Políticas do Google AdSense & Diretrizes Publicitárias</h4>
                <p>
                  Nosso site cumpre integralmente as Diretrizes para Webmasters e as Políticas do Programa Google AdSense (Google Publisher Policies). Não toleramos conteúdo prejudicial, fraudulento ou não conforme.
                </p>

                <h4 className="text-sm font-bold text-white">3. Proteção e Privacidade dos Dados (LGPD)</h4>
                <p>
                  Garantimos a proteção dos dados pessoais de todos os membros cadastrados conforme a Lei Geral de Proteção de Dados (LGPD). Os dados nunca são vendidos a terceiros.
                </p>

                <h4 className="text-sm font-bold text-white">4. Contato Institucional</h4>
                <p>
                  Em caso de dúvidas, envie um e-mail para <span className="text-[#00E5FF] font-mono">contato@blablabladosamigos.online</span> ou use o canal oficial no menu de Ajuda da plataforma.
                </p>
              </div>

              <div className="p-4 border-t border-[#1E293B] bg-[#0F172A] flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-5 py-2 bg-[#00E5FF] hover:bg-[#00c2d6] text-slate-950 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Entendi e Aceito
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* iOS INSTALL INSTRUCTIONS MODAL */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" id="ios-pwa-install-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0B132B] border border-[#1E293B] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-left"
            >
              <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0F172A]">
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

              <div className="p-6 space-y-4 text-xs text-gray-300">
                <div className="flex items-center gap-3 bg-[#0F172A] p-3 rounded-xl border border-[#1E293B]">
                  <div className="w-12 h-12 rounded-xl bg-[#00E5FF] flex items-center justify-center text-slate-950 font-black text-xl">
                    BBA
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Bla Bla Amigos</h4>
                    <p className="text-[10px] text-[#00E5FF] font-mono">Rede Social Premium</p>
                  </div>
                </div>

                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>Toque no botão <strong>Compartilhar</strong> (ícone quadrado com seta) no Safari.</li>
                  <li>Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                  <li>Confirme tocando em <strong>Adicionar</strong> no canto superior direito.</li>
                </ol>

                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#00c2d6] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </header>
  );
}
