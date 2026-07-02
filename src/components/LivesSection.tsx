import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Send, Gift, Heart, Sparkles, Users, 
  Award, DollarSign, X, Play, Pause, Volume2, VolumeX, Flame, 
  Clock, Calendar, Search, Radio, Tv, AlertCircle, CheckCircle2, Monitor, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, LiveStream, LiveChatMessage } from '../types';

interface LivesSectionProps {
  currentUser: User;
  users: User[];
  lives: LiveStream[];
  liveMessages: LiveChatMessage[];
  createLive: (title: string, description: string, category: string, coverImage?: string, scheduledFor?: string) => Promise<string>;
  endLive: (liveId: string) => Promise<void>;
  sendLiveMessage: (liveId: string, text: string, isGift?: boolean, giftType?: string, giftValue?: number) => Promise<void>;
  sendLiveGift: (liveId: string, giftType: 'like' | 'rose' | 'coffee' | 'heart' | 'trophy' | 'diamond', giftValue: number) => Promise<boolean>;
}

interface FlyingReaction {
  id: string;
  emoji: string;
  left: number;
}

export default function LivesSection({
  currentUser,
  users,
  lives,
  liveMessages,
  createLive,
  endLive,
  sendLiveMessage,
  sendLiveGift
}: LivesSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'create'>('all');
  const [selectedLive, setSelectedLive] = useState<LiveStream | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Broadcast setup form
  const [liveTitle, setLiveTitle] = useState<string>('');
  const [liveDesc, setLiveDesc] = useState<string>('');
  const [liveCategory, setLiveCategory] = useState<string>('Conversa Geral');
  const [liveCover, setLiveCover] = useState<string>('');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [creationSuccessId, setCreationSuccessId] = useState<string | null>(null);

  // Active watching session variables
  const [chatInput, setChatInput] = useState<string>('');
  const [showGiftModal, setShowGiftModal] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [flyingReactions, setFlyingReactions] = useState<FlyingReaction[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Streaming studio variables (for broadcaster)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  const [studioActive, setStudioActive] = useState<boolean>(false);
  const [streamUptime, setStreamUptime] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveMessages, selectedLive]);

  // Handle webcam stream for studio
  useEffect(() => {
    if (studioActive && cameraEnabled) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setLocalStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.warn('Câmera ou Microfone não disponíveis ou permissão negada:', err);
          setCameraEnabled(false);
        });
    } else if (!studioActive || !cameraEnabled) {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [studioActive, cameraEnabled]);

  // Stream uptime counter
  useEffect(() => {
    if (studioActive) {
      timerRef.current = setInterval(() => {
        setStreamUptime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setStreamUptime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [studioActive]);

  // Simulate periodic viewer comments inside active watching live stream to make it alive!
  useEffect(() => {
    if (!selectedLive || selectedLive.userId === currentUser.id || selectedLive.status !== 'live') return;

    const randomComments = [
      "Nossa, que live top! 💎",
      "Mari, me tira uma dúvida sobre gradientes?",
      "Muito bom esse conteúdo, parabéns!",
      "Alguém aí de Goiânia assistindo? 😮",
      "Qual é a música de fundo?",
      "Acabei de mandar uma rosa! 🌹",
      "Isso muda tudo no design de interfaces!",
      "Que massa o Bla Bla Amigos estar crescendo!",
      "Quem aí usou o indique e ganhe? Ganhei R$ 100 já!",
      "Sensacional! 🔥👏",
      "Sucesso total de transmissão!",
      "O áudio e vídeo estão ótimos por aqui."
    ];

    const interval = setInterval(() => {
      // Pick random user who is not the current user and not the host
      const eligibleUsers = users.filter(u => u.id !== currentUser.id && u.id !== selectedLive.userId);
      if (eligibleUsers.length === 0) return;
      const randUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];
      const randText = randomComments[Math.floor(Math.random() * randomComments.length)];

      // Send to live messages but don't persist heavily, just update state simulation
      const simulatedMsg: LiveChatMessage = {
        id: `sim-msg-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        liveId: selectedLive.id,
        userId: randUser.id,
        userName: randUser.fullName,
        userAvatar: randUser.avatar,
        text: randText,
        createdAt: new Date().toISOString()
      };

      // Add to messages if still viewing
      sendLiveMessage(selectedLive.id, randText);
    }, 15000); // every 15 seconds

    return () => clearInterval(interval);
  }, [selectedLive, users, currentUser]);

  const handleStartLiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle.trim()) return;

    setIsCreating(true);
    try {
      const liveId = await createLive(
        liveTitle,
        liveDesc,
        liveCategory,
        liveCover,
        isScheduled ? scheduledDateTime : undefined
      );

      if (!isScheduled) {
        // Go live directly in studio mode!
        const createdLiveObj = lives.find(l => l.id === liveId) || {
          id: liveId,
          userId: currentUser.id,
          userName: currentUser.fullName,
          userAvatar: currentUser.avatar,
          title: liveTitle,
          description: liveDesc,
          category: liveCategory,
          viewerCount: 1,
          peakViewers: 1,
          totalEarnings: 0,
          status: 'live' as const,
          createdAt: new Date().toISOString()
        };
        setSelectedLive(createdLiveObj);
        setStudioActive(true);
      } else {
        setCreationSuccessId(liveId);
        setTimeout(() => setCreationSuccessId(null), 5000);
        setActiveTab('scheduled');
      }

      // Reset form
      setLiveTitle('');
      setLiveDesc('');
      setLiveCover('');
      setIsScheduled(false);
      setScheduledDateTime('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedLive) return;

    sendLiveMessage(selectedLive.id, chatInput.trim());
    setChatInput('');
  };

  const handleSendGiftClick = async (type: 'like' | 'rose' | 'coffee' | 'heart' | 'trophy' | 'diamond', price: number) => {
    if (!selectedLive) return;
    const success = await sendLiveGift(selectedLive.id, type, price);
    if (success) {
      setShowGiftModal(false);
      triggerFlyingEmoji(type === 'like' ? '👍' : type === 'rose' ? '🌹' : type === 'coffee' ? '☕' : type === 'heart' ? '💖' : type === 'trophy' ? '🏆' : '💎');
    }
  };

  const triggerFlyingEmoji = (emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const left = Math.floor(Math.random() * 60) + 20; // percent 20 to 80
    setFlyingReactions(prev => [...prev, { id, emoji, left }]);

    // Remove reaction after animation finishes
    setTimeout(() => {
      setFlyingReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const handleEndLiveSession = async () => {
    if (!selectedLive) return;
    if (window.confirm('Tem certeza de que deseja encerrar sua transmissão ao vivo agora?')) {
      await endLive(selectedLive.id);
      setStudioActive(false);
      setSelectedLive(null);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }
  };

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  // Filter lists
  const activeLives = lives.filter(l => l.status === 'live');
  const scheduledLives = lives.filter(l => l.status === 'scheduled');

  const filteredLives = activeLives.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || l.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Conversa Geral', 'Design & Criatividade', 'Tecnologia & Negócios', 'Música', 'Jogos', 'Fitness & Saúde', 'Educação'];

  const giftItems = [
    { type: 'like' as const, label: 'Super Reação', icon: '👍', price: 1.00, color: 'from-blue-500 to-cyan-400' },
    { type: 'rose' as const, label: 'Rosa Virtual', icon: '🌹', price: 5.00, color: 'from-rose-500 to-pink-400' },
    { type: 'coffee' as const, label: 'Cafezinho BBA', icon: '☕', price: 10.00, color: 'from-amber-600 to-yellow-500' },
    { type: 'heart' as const, label: 'Super Coração', icon: '💖', price: 25.00, color: 'from-purple-600 to-pink-500' },
    { type: 'trophy' as const, label: 'Troféu BBA', icon: '🏆', price: 50.00, color: 'from-yellow-500 to-amber-400' },
    { type: 'diamond' as const, label: 'Diamante Raro', icon: '💎', price: 100.00, color: 'from-cyan-500 to-blue-600 animate-pulse' },
  ];

  const currentLiveMessages = selectedLive ? liveMessages.filter(m => m.liveId === selectedLive.id) : [];

  return (
    <div className="space-y-6 animate-fade-in" id="lives-section-wrapper">
      
      {/* 1. HERO BANNER */}
      {!selectedLive && (
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="lives-hero">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00E5FF]/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-purple-600 flex items-center justify-center shadow-lg shadow-[#00E5FF]/10 shrink-0 relative">
                <Radio className="w-7 h-7 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121225] animate-ping" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                  Bla Bla Live
                  <span className="text-[10px] bg-red-500/20 text-red-400 font-mono px-2 py-0.5 rounded-full font-bold border border-red-500/30 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    Transmissões
                  </span>
                </h1>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xl">
                  Participe de conversas ao vivo, assista a criadores de conteúdo e interaja em tempo real! 
                  Use seus <strong>créditos de indicações</strong> para mandar presentes e apoiar seus streamers favoritos de forma 100% real.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => { setActiveTab('all'); setSelectedLive(null); }}
                className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                  activeTab === 'all' 
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF]/30 text-[#00E5FF]' 
                    : 'bg-[#121225] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                Explorar Lives ({activeLives.length})
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className="flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                Transmitir Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. THEATRE MODE WATCHING OR STUDIO */}
      {selectedLive && (
        <div className="bg-[#121225] border border-white/10 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]" id="live-theatre">
          
          {/* THEATRE PLAYER COLUMN (9/12 WIDTH) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-black relative overflow-hidden group">
            
            {/* FLOATING flying reactions animation panel */}
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
              <AnimatePresence>
                {flyingReactions.map(reaction => (
                  <motion.div
                    key={reaction.id}
                    initial={{ opacity: 0, y: '80%', scale: 0.5 }}
                    animate={{ opacity: [0, 1, 1, 0], y: '-10%', scale: [0.8, 1.2, 1, 1.5] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    style={{ left: `${reaction.left}%` }}
                    className="absolute text-3xl select-none"
                  >
                    {reaction.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* TOP BAR OVERLAY */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  {studioActive ? 'Seu Estúdio' : 'Ao Vivo'}
                </span>
                <span className="text-xs text-white/90 font-bold truncate max-w-[200px] sm:max-w-md font-mono">
                  {selectedLive.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-black/60 rounded-lg border border-white/10 flex items-center gap-1.5 text-xs text-gray-300 font-mono">
                  <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>{studioActive ? 'Host' : selectedLive.viewerCount} assistindo</span>
                </div>
                
                {selectedLive.totalEarnings > 0 && (
                  <div className="px-2.5 py-1 bg-rose-500/20 rounded-lg border border-rose-500/20 flex items-center gap-1.5 text-xs text-rose-400 font-mono font-bold">
                    <Trophy className="w-3.5 h-3.5 text-rose-400" />
                    <span>R$ {selectedLive.totalEarnings.toFixed(2)}</span>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (studioActive) {
                      handleEndLiveSession();
                    } else {
                      setSelectedLive(null);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-black/60 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer transition-colors border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MAIN VIDEO SCREEN */}
            <div className="flex-1 flex items-center justify-center relative bg-slate-950/40">
              
              {studioActive ? (
                // Broadcaster video interface
                cameraEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400 animate-pulse">
                      <VideoOff className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Sua câmera está oculta</p>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">Sua transmissão está rodando apenas em áudio e com o card do canal ativo.</p>
                    </div>
                  </div>
                )
              ) : (
                // Watcher simulated player
                isPlaying ? (
                  <div className="absolute inset-0 w-full h-full">
                    {/* Live stream graphic loop / simulated webcam stream from unsplash */}
                    <img 
                      src={selectedLive.coverImage || 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=800'} 
                      alt="Stream Video" 
                      className="w-full h-full object-cover blur-[2px] scale-105 brightness-95" 
                    />
                    
                    {/* Pulsing overlay pattern */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/60 via-transparent to-purple-950/60 mix-blend-color-dodge animate-pulse" />
                    
                    {/* Stream status animated widget */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] animate-bounce shadow-2xl shadow-[#00E5FF]/10">
                        <Radio className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-mono tracking-widest text-white/80 bg-black/60 px-3 py-1 rounded-full border border-white/5 uppercase">
                        Sinal Estável • 1080p 60fps
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <button 
                      onClick={() => setIsPlaying(true)}
                      className="w-16 h-16 rounded-full bg-[#00E5FF] text-[#0A0A14] flex items-center justify-center shadow-lg cursor-pointer"
                    >
                      <Play className="w-8 h-8 fill-[#0A0A14]" />
                    </button>
                    <p className="text-xs text-gray-400 font-mono">Transmissão Pausada</p>
                  </div>
                )
              )}
            </div>

            {/* BOTTOM BAR OVERLAY CONTROLS */}
            <div className="p-4 bg-gradient-to-t from-black to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-[#00E5FF]/40">
                  <img src={selectedLive.userAvatar} alt={selectedLive.userName} className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <span className="text-xs text-white font-bold block">{selectedLive.userName}</span>
                  <span className="text-[10px] text-gray-400 block font-mono">Categoria: {selectedLive.category}</span>
                </div>
              </div>

              {/* Controls block */}
              <div className="flex items-center gap-4">
                
                {studioActive ? (
                  // Broadcaster Studio controls
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>{formatUptime(streamUptime)}</span>
                    </div>

                    <button
                      onClick={() => setCameraEnabled(!cameraEnabled)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors border ${
                        cameraEnabled 
                          ? 'bg-black/60 hover:bg-white/10 text-white border-white/10' 
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                      }`}
                      title={cameraEnabled ? 'Ocultar Câmera' : 'Ativar Câmera'}
                    >
                      {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setMicEnabled(!micEnabled)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors border ${
                        micEnabled 
                          ? 'bg-black/60 hover:bg-white/10 text-white border-white/10' 
                          : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                      }`}
                      title={micEnabled ? 'Mutar Mic' : 'Ativar Mic'}
                    >
                      {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleEndLiveSession}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
                    >
                      Encerrar Transmissão
                    </button>
                  </div>
                ) : (
                  // Watcher controls
                  <div className="flex items-center gap-3">
                    
                    {/* Media playing buttons */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 text-gray-300 hover:text-white cursor-pointer transition-colors"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-gray-300 hover:text-white cursor-pointer transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Fast Floating Reaction Triggers */}
                    <div className="flex items-center gap-1 border-l border-white/15 pl-3">
                      <button 
                        onClick={() => triggerFlyingEmoji('❤️')}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        ❤️
                      </button>
                      <button 
                        onClick={() => triggerFlyingEmoji('🔥')}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        🔥
                      </button>
                      <button 
                        onClick={() => triggerFlyingEmoji('👏')}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        👏
                      </button>
                      <button 
                        onClick={() => triggerFlyingEmoji('😮')}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-xs flex items-center justify-center cursor-pointer transition-colors"
                      >
                        😮
                      </button>
                    </div>

                    {/* Tip Gift Button */}
                    <button
                      onClick={() => setShowGiftModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-500/15 cursor-pointer animate-pulse"
                    >
                      <Gift className="w-4 h-4" />
                      Apoiar & Presentear
                    </button>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* CHAT / INTERACTIVE PANEL COLUMN (4/12 WIDTH) */}
          <div className="lg:col-span-4 bg-[#0F0F20] border-l border-white/5 flex flex-col justify-between h-[600px]" id="live-chat-panel">
            
            {/* Chat header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <span className="text-white text-xs font-bold uppercase tracking-wider font-sans flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Bate-Papo em Tempo Real
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ID: {selectedLive.id.slice(-6)}</span>
            </div>

            {/* Chat message listing (scrollable) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar">
              
              {/* Default Welcome message */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Boas-vindas ao Chat!
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Lembre-se de respeitar o criador e a comunidade. Envie reações ou use seus créditos de indicações para mandar presentes exclusivos!
                </p>
              </div>

              {currentLiveMessages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex gap-2.5 items-start text-xs leading-relaxed p-2 rounded-xl transition-colors ${
                    msg.isGift ? 'bg-rose-500/10 border border-rose-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 shrink-0 mt-0.5">
                    <img src={msg.userAvatar} alt={msg.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5 text-left flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white truncate max-w-[120px]">{msg.userName}</span>
                      {msg.userId === selectedLive.userId && (
                        <span className="text-[8px] bg-[#00E5FF]/20 text-[#00E5FF] px-1 rounded-sm uppercase font-black tracking-wide shrink-0">
                          Streamer
                        </span>
                      )}
                      <span className="text-[8px] text-gray-500 font-mono ml-auto">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className={`text-xs break-words ${msg.isGift ? 'text-rose-400 font-black' : 'text-gray-300'}`}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat sender footer form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#0A0A14] border-t border-white/5 flex items-center gap-2">
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Diga algo no bate-papo..."
                className="flex-1 bg-[#121225] border border-white/10 text-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20"
              />
              <button
                type="submit"
                className="p-2 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#0a0a14] rounded-xl flex items-center justify-center cursor-pointer transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* 3. GIFT SELECTION MODAL OVERLAY */}
      <AnimatePresence>
        {showGiftModal && (
          <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in" id="gift-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full relative"
            >
              <button
                onClick={() => setShowGiftModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
                  <Gift className="w-5 h-5 animate-bounce" />
                </div>
                <div className="text-left">
                  <h3 className="text-white text-sm font-bold">Enviar Presente para o Streamer</h3>
                  <p className="text-[10px] text-gray-400">Patrocine com seus créditos de indicações!</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#0a0a14] rounded-xl border border-white/5 mb-5 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Seu Saldo BBA:</span>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  R$ {(currentUser.adCredits !== undefined ? currentUser.adCredits : 100).toFixed(2)}
                </span>
              </div>

              {/* Gifts listing grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {giftItems.map(item => {
                  const isAffordable = (currentUser.adCredits !== undefined ? currentUser.adCredits : 100) >= item.price;
                  return (
                    <button
                      key={item.type}
                      disabled={!isAffordable}
                      onClick={() => handleSendGiftClick(item.type, item.price)}
                      className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between h-28 relative overflow-hidden ${
                        isAffordable 
                          ? 'bg-[#0A0A14] border-white/5 hover:border-rose-400/50 cursor-pointer group' 
                          : 'bg-[#121225]/40 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl ${item.color} opacity-10 rounded-full blur-xl`} />
                      
                      <div className="text-2xl group-hover:scale-110 transition-transform duration-300 select-none">
                        {item.icon}
                      </div>

                      <div className="space-y-0.5 text-left">
                        <span className="text-[10px] text-gray-300 font-bold block truncate">{item.label}</span>
                        <span className="text-xs text-rose-400 font-mono font-bold block">
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center">
                <p className="text-[9px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                  Os presentes descontam o valor correspondente do seu saldo de créditos acumulados e depositam na conta do host instantaneamente.
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. TABS & CARDS LISTINGS VIEW */}
      {!selectedLive && (
        <div className="space-y-6">
          
          {/* SEARCH BAR & FILTERS */}
          {activeTab !== 'create' && (
            <div className="flex flex-col md:flex-row items-center gap-3 bg-[#121225] border border-white/10 p-3.5 rounded-2xl shadow" id="live-filters">
              
              <div className="w-full md:flex-1 relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por título, streamer ou tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20"
                />
              </div>

              {/* Categories filters (horizontal scrolling on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg uppercase tracking-wider whitespace-nowrap transition-all border cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF]'
                        : 'bg-[#0A0A14] border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'Ver Todos' : cat}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* MAIN CHANNELS LAYOUT CONTAINER */}
          <AnimatePresence mode="wait">
            
            {/* ALL LIVE STREAMINGS TAB */}
            {activeTab === 'all' && (
              <motion.div
                key="all-lives-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    Transmissões Ao Vivo Agora ({filteredLives.length})
                  </h3>
                </div>

                {filteredLives.length === 0 ? (
                  <div className="text-center py-16 bg-[#121225] border border-white/10 rounded-2xl p-6 text-xs text-gray-500">
                    Nenhuma transmissão ao vivo encontrada. Seja o pioneiro e comece sua própria live agora no painel de transmissor!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLives.map(live => (
                      <div
                        key={live.id}
                        onClick={() => setSelectedLive(live)}
                        className="bg-[#121225] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00E5FF]/40 cursor-pointer shadow hover:shadow-lg transition-all group flex flex-col justify-between h-[360px]"
                      >
                        {/* Stream preview / cover */}
                        <div className="relative h-48 overflow-hidden bg-black shrink-0">
                          <img 
                            src={live.coverImage || 'https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=800'} 
                            alt={live.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                          
                          {/* Floating badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-red-500 text-[9px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                              Live
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-black/60 text-[9px] font-bold text-gray-200">
                              {live.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-[9px] text-gray-200 font-mono flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#00E5FF]" />
                            <span>{live.viewerCount} assistindo</span>
                          </div>
                        </div>

                        {/* Stream card details */}
                        <div className="p-4 flex-1 flex flex-col justify-between text-left">
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug line-clamp-2">
                              {live.title}
                            </h4>
                            {live.description && (
                              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                                {live.description}
                              </p>
                            )}
                          </div>

                          {/* Profile host detail */}
                          <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between gap-2 shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
                                <img src={live.userAvatar} alt={live.userName} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs text-gray-300 font-semibold truncate max-w-[150px]">{live.userName}</span>
                            </div>

                            <span className="text-[10px] text-[#00E5FF] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Assistir Live <Clock className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SCHEDULED UPCOMING LIVES TAB */}
            {activeTab === 'scheduled' && (
              <motion.div
                key="scheduled-lives-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Transmissões Programadas ({scheduledLives.length})
                </h3>

                {scheduledLives.length === 0 ? (
                  <div className="text-center py-16 bg-[#121225] border border-white/10 rounded-2xl p-6 text-xs text-gray-500">
                    Nenhuma live programada no momento. Que tal agendar uma no painel de transmissor?
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scheduledLives.map(live => (
                      <div
                        key={live.id}
                        className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                            <Calendar className="w-6 h-6 animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-purple-500/30">
                              {live.category}
                            </span>
                            <h4 className="text-sm font-bold text-white line-clamp-1">{live.title}</h4>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
                                <img src={live.userAvatar} alt={live.userName} className="w-full h-full object-cover" />
                              </div>
                              <span>{live.userName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-[#0A0A14] border border-white/5 rounded-xl p-3 text-right shrink-0 min-w-[150px] space-y-1">
                          <span className="text-[10px] text-gray-500 uppercase font-mono block">Data & Horário:</span>
                          <span className="text-xs font-mono font-bold text-purple-400 block">
                            {live.scheduledFor ? new Date(live.scheduledFor).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Em breve'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* BROADCASTER STUDIO SETUP TAB */}
            {activeTab === 'create' && (
              <motion.div
                key="create-live-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6"
              >
                <div className="text-left border-b border-white/5 pb-4">
                  <h3 className="text-white text-base font-bold flex items-center gap-1.5">
                    <Video className="w-5 h-5 text-[#00E5FF]" />
                    Configurar Nova Transmissão
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Crie sua live em segundos. Transmita o áudio de sua voz, compartilhe sua câmera e conquiste apoiadores!</p>
                </div>

                <form onSubmit={handleStartLiveSubmit} className="space-y-4 text-left">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Título da Transmissão</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jogando xadrez relâmpago com apoiadores!"
                        value={liveTitle}
                        onChange={(e) => setLiveTitle(e.target.value)}
                        className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Categoria</label>
                      <select
                        value={liveCategory}
                        onChange={(e) => setLiveCategory(e.target.value)}
                        className="w-full bg-[#0A0A14] border border-white/10 text-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF]"
                      >
                        {categories.filter(c => c !== 'all').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Descrição curta (Opcional)</label>
                    <textarea
                      placeholder="Sobre o que você vai falar? Escreva uma breve descrição para chamar público."
                      value={liveDesc}
                      onChange={(e) => setLiveDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Link da Imagem de Capa (Opcional)</label>
                    <input
                      type="url"
                      placeholder="Ex: https://images.unsplash.com/... (ou deixe vazio para usar capa padrão)"
                      value={liveCover}
                      onChange={(e) => setLiveCover(e.target.value)}
                      className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
                    />
                  </div>

                  {/* Program live trigger */}
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-semibold select-none">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                        className="rounded bg-[#0A0A14] border-white/10 text-purple-500 focus:ring-0"
                      />
                      Desejo agendar esta transmissão para mais tarde
                    </label>

                    {isScheduled && (
                      <div className="animate-fade-in">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Data & Horário de Agendamento</label>
                        <input
                          type="datetime-local"
                          required={isScheduled}
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          className="bg-[#0A0A14] border border-white/10 text-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action submit */}
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full py-3 bg-gradient-to-r from-[#00E5FF] via-purple-600 to-indigo-600 hover:brightness-110 text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-lg shadow-purple-500/10 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Radio className="w-4 h-4 text-white animate-pulse" />
                    {isCreating ? 'Processando...' : isScheduled ? 'Agendar Transmissão' : 'Iniciar Transmissão Ao Vivo'}
                  </button>

                  {creationSuccessId && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 mt-3 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      Sua live foi agendada e salva com sucesso! Os usuários poderão visualizá-la na aba "Programadas".
                    </div>
                  )}

                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
