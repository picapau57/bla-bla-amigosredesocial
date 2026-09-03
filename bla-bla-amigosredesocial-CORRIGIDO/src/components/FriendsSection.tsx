import { useState } from 'react';
import { User, FriendRequest } from '../types';
import { 
  Users, UserPlus, Cake, Search, MessageSquare, UserMinus, 
  Check, X, Hourglass, Gift, MapPin, Sparkles, AlertCircle, Calendar,
  Mail, Phone, Share2, Copy, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FriendsSectionProps {
  currentUser: User;
  users: User[];
  friendRequests: FriendRequest[];
  onSendFriendRequest: (receiverId: string) => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onCancelFriendRequest: (requestId: string) => void;
  onRemoveFriend: (targetUserId: string) => void;
  onStartChat: (targetUserId: string) => string;
  onSendMessage: (chatId: string, text: string) => void;
}

export default function FriendsSection({
  currentUser,
  users,
  friendRequests,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onCancelFriendRequest,
  onRemoveFriend,
  onStartChat,
  onSendMessage,
}: FriendsSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'todos' | 'pedidos' | 'aniversarios'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // States for "Convidar Amigos" Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [inviteSent, setInviteSent] = useState<'email' | 'phone' | 'none'>('none');

  // 1. Filter friends
  const myFriends = users.filter(u => currentUser.friends?.includes(u.id));

  // 2. Filter requests
  const incomingRequests = friendRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');
  const outgoingRequests = friendRequests.filter(r => r.senderId === currentUser.id && r.status === 'pending');

  // 3. Search for new users (people who are not already friends, not current user, and no pending request)
  const nonFriends = users.filter(u => {
    if (u.id === currentUser.id) return false;
    if (currentUser.friends?.includes(u.id)) return false;
    return true;
  });

  // Calculate upcoming and today's birthdays of friends
  const getBirthdayStatus = (birthDateStr: string) => {
    if (!birthDateStr) return { isToday: false, daysRemaining: 999 };
    const parts = birthDateStr.split('-');
    if (parts.length !== 3) return { isToday: false, daysRemaining: 999 };
    
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Birthday in current year
    let bdayThisYear = new Date(currentYear, birthMonth, birthDay);
    if (bdayThisYear.getTime() < today.getTime() && bdayThisYear.toDateString() !== today.toDateString()) {
      bdayThisYear = new Date(currentYear + 1, birthMonth, birthDay);
    }
    
    const isToday = today.getDate() === birthDay && today.getMonth() === birthMonth;
    const diffTime = Math.abs(bdayThisYear.getTime() - today.getTime());
    const daysRemaining = isToday ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { isToday, daysRemaining, birthDay, birthMonth };
  };

  const friendsBirthdays = myFriends.map(friend => {
    const status = getBirthdayStatus(friend.birthDate);
    return {
      friend,
      ...status
    };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  const handleSendGreeting = (friend: User) => {
    const chatId = onStartChat(friend.id);
    const textMessage = `🎉 Parabéns, @${friend.username}! Desejo a você um aniversário maravilhoso, com muita paz, saúde, felicidade e realizações! Que seu dia seja fantástico! 🎂🥳`;
    onSendMessage(chatId, textMessage);
    alert(`Mensagem especial de aniversário enviada em tempo real para @${friend.username}!`);
  };

  const getFilteredUsersToSearch = () => {
    return nonFriends.filter(u => 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredFriends = () => {
    return myFriends.filter(u => 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getRequestForUser = (userId: string) => {
    return friendRequests.find(r => 
      (r.senderId === currentUser.id && r.receiverId === userId) ||
      (r.senderId === userId && r.receiverId === currentUser.id)
    );
  };

  return (
    <div className="flex-1 bg-[#121225] border border-white/10 rounded-2xl shadow-xl flex flex-col min-h-[580px] overflow-hidden animate-fade-in-up" id="friends-system-console">
      {/* HEADER TABS */}
      <div className="p-4 md:p-6 border-b border-white/10 bg-[#0A0A14]/50 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#00E5FF] animate-pulse" />
              Portal de Amigos
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">Conecte-se com sua comunidade em tempo real</p>
          </div>

          <button
            onClick={() => {
              setInviteSearchQuery('');
              setInviteEmail('');
              setInvitePhone('');
              setInviteSent('none');
              setShowInviteModal(true);
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.25)] flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto active:scale-[0.98]"
            id="open-invite-friends-modal-btn"
          >
            <UserPlus className="w-4 h-4 text-emerald-100 animate-bounce" />
            <span>Convidar Amigos</span>
          </button>

          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => { setActiveSubTab('todos'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'todos' 
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Todos Amigos ({myFriends.length})</span>
            </button>
            <button
              onClick={() => { setActiveSubTab('pedidos'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative cursor-pointer ${
                activeSubTab === 'pedidos' 
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Pedidos</span>
              {incomingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {incomingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveSubTab('aniversarios'); setSearchQuery(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'aniversarios' 
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cake className="w-3.5 h-3.5 text-pink-400" />
              <span>Aniversários</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR (For Friends or for New Friends depending on tab) */}
        {activeSubTab !== 'aniversarios' && (
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeSubTab === 'todos' ? "Pesquisar entre seus amigos..." : "Buscar novas pessoas na rede para adicionar..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0A14]/60 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
            />
          </div>
        )}
      </div>

      {/* VIEWPORT AREA */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto max-h-[500px]" id="friends-tab-contents">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ALL FRIENDS */}
          {activeSubTab === 'todos' && (
            <motion.div
              key="tab-todos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {getFilteredFriends().length === 0 ? (
                <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center">
                  <Users className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-sm font-bold text-gray-300">Nenhum amigo encontrado</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-md">
                    {searchQuery ? "Nenhum resultado para os termos buscados." : "Você ainda não tem conexões adicionadas. Vá em 'Pedidos' para encontrar pessoas!"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveSubTab('pedidos')}
                      className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all"
                    >
                      Encontrar Pessoas
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredFriends().map(friend => (
                    <div 
                      key={friend.id}
                      className="bg-[#0A0A14]/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/20 hover:bg-[#0A0A14]/70 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img 
                            src={friend.avatar} 
                            alt={friend.fullName} 
                            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121225] rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-sm text-gray-100 group-hover:text-[#00E5FF] transition-all">
                              {friend.fullName}
                            </span>
                            {friend.isVerified && (
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400 font-mono">@{friend.username}</span>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            {friend.city || 'Desconhecido'}, {friend.state || 'GO'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onStartChat(friend.id);
                          }}
                          className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 p-2.5 rounded-xl cursor-pointer transition-all"
                          title="Enviar Mensagem em Tempo Real"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza de que deseja desfazer amizade com @${friend.username}?`)) {
                              onRemoveFriend(friend.id);
                            }
                          }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2.5 rounded-xl cursor-pointer transition-all"
                          title="Desfazer Amizade"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: FRIEND REQUESTS */}
          {activeSubTab === 'pedidos' && (
            <motion.div
              key="tab-pedidos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Incoming requests (pedidos recebidos) */}
              {incomingRequests.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-[#00E5FF] uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse" />
                    Pedidos de Amizade Recebidos ({incomingRequests.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incomingRequests.map(req => {
                      const sender = users.find(u => u.id === req.senderId);
                      if (!sender) return null;
                      return (
                        <div 
                          key={req.id}
                          className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={sender.avatar} 
                              alt={sender.fullName} 
                              className="w-11 h-11 rounded-full object-cover border border-indigo-500/20"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-extrabold text-sm text-gray-100">{sender.fullName}</span>
                              <p className="text-xs text-gray-400 font-mono">@{sender.username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onAcceptFriendRequest(req.id)}
                              className="bg-green-500 hover:bg-green-400 text-white p-2 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                              title="Aceitar Amizade"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeclineFriendRequest(req.id)}
                              className="bg-rose-500 hover:bg-rose-400 text-white p-2 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                              title="Recusar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Outgoing requests */}
              {outgoingRequests.length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    Seus Pedidos Enviados (Aguardando Confirmação)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {outgoingRequests.map(req => {
                      const receiver = users.find(u => u.id === req.receiverId);
                      if (!receiver) return null;
                      return (
                        <div 
                          key={req.id}
                          className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={receiver.avatar} 
                              alt={receiver.fullName} 
                              className="w-10 h-10 rounded-full object-cover opacity-80"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-sm text-gray-300">{receiver.fullName}</span>
                              <p className="text-[10px] text-gray-500 font-mono">@{receiver.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onCancelFriendRequest(req.id)}
                            className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                          >
                            Cancelar
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search and Send New Friend Requests */}
              <div>
                <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-cyan-400" />
                  Sugestões e Outros Usuários na Rede
                </h3>

                {getFilteredUsersToSearch().length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs font-mono">
                    Nenhuma sugestão encontrada para sua busca.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getFilteredUsersToSearch().map(user => {
                      const req = getRequestForUser(user.id);
                      return (
                        <div 
                          key={user.id}
                          className="bg-[#0A0A14]/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={user.avatar} 
                              alt={user.fullName} 
                              className="w-11 h-11 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-sm text-gray-200">{user.fullName}</span>
                              <p className="text-xs text-gray-400 font-mono">@{user.username}</p>
                            </div>
                          </div>

                          <div>
                            {req ? (
                              req.status === 'pending' ? (
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 font-mono">
                                  <Hourglass className="w-3 h-3 animate-spin" />
                                  Pendente
                                </span>
                              ) : null
                            ) : (
                              <button
                                onClick={() => onSendFriendRequest(user.id)}
                                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-xl cursor-pointer transition-all flex items-center gap-1"
                              >
                                <UserPlus className="w-3.5 h-3.5" />
                                Adicionar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: BIRTHDAYS */}
          {activeSubTab === 'aniversarios' && (
            <motion.div
              key="tab-aniversarios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Today's birthdays */}
              {friendsBirthdays.filter(item => item.isToday).length > 0 ? (
                <div>
                  <h3 className="text-xs font-black text-pink-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
                    🎂 Soprando Velinhas Hoje! Parabenize agora! 🎈
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friendsBirthdays.filter(item => item.isToday).map(({ friend }) => (
                      <div 
                        key={friend.id}
                        className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-[#121225] border-2 border-pink-500/30 rounded-2xl p-5 relative overflow-hidden group shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                      >
                        {/* Decorative background balloons */}
                        <div className="absolute right-2 -top-1 opacity-25 group-hover:scale-110 transition-transform duration-500">
                          <Gift className="w-16 h-16 text-pink-400" />
                        </div>

                        <div className="flex items-center gap-3 relative z-10">
                          <div className="relative">
                            <img 
                              src={friend.avatar} 
                              alt={friend.fullName} 
                              className="w-14 h-14 rounded-full object-cover border-2 border-pink-500 animate-pulse"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] p-1 rounded-full">👑</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-white block">{friend.fullName}</span>
                            <span className="text-xs text-pink-400 font-mono font-bold block">Falta de anos hoje! 🎂</span>
                            <span className="text-[10px] text-gray-400 block font-mono mt-0.5">Nascimento: {friend.birthDate}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2 relative z-10">
                          <button
                            onClick={() => handleSendGreeting(friend)}
                            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-115 text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20"
                          >
                            <Gift className="w-4 h-4" />
                            Enviar Parabéns 🎉
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-white/5 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <Cake className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">Nenhum aniversário hoje</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Nenhum de seus amigos faz aniversário no dia de hoje. Mas fique de olho nos próximos abaixo!</p>
                  </div>
                </div>
              )}

              {/* Upcoming birthdays */}
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Próximos Aniversários de Amigos
                </h3>

                {friendsBirthdays.filter(item => !item.isToday).length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs font-mono">
                    Nenhum amigo na lista. Adicione amigos para ver os aniversários deles!
                  </div>
                ) : (
                  <div className="divide-y divide-white/5 bg-[#0A0A14]/30 border border-white/5 rounded-2xl overflow-hidden">
                    {friendsBirthdays.filter(item => !item.isToday).map(({ friend, daysRemaining }) => (
                      <div 
                        key={friend.id}
                        className="p-4 flex items-center justify-between hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={friend.avatar} 
                            alt={friend.fullName} 
                            className="w-10 h-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-sm text-gray-200 block">{friend.fullName}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">Nascimento: {friend.birthDate}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-cyan-400 font-mono font-bold block">
                            Em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {friend.birthDate ? new Date(friend.birthDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* CONVIDAR AMIGOS MODAL OVERLAY */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#02020a]/80 backdrop-blur-md flex items-center justify-center p-4"
            id="invite-friends-modal-overlay"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#121225] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
              id="invite-friends-modal-content"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 bg-[#0A0A14]/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Convidar Amigos</h3>
                    <p className="text-[10px] text-gray-400 font-mono">Busque ou envie convites rápidos</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[450px]">
                {/* Step 1: Search on the platform by email/phone */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-300 font-mono uppercase tracking-wider block">
                    1. Pesquisar usuário na plataforma
                  </label>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Digite o **E-mail** ou **Telefone** cadastrado de quem deseja convidar para ver se a pessoa já possui conta na nossa plataforma!
                  </p>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: picapauinformatica@gmail.com ou +5562999999999"
                      value={inviteSearchQuery}
                      onChange={(e) => {
                        setInviteSearchQuery(e.target.value);
                        setInviteSent('none');
                      }}
                      className="w-full bg-[#0A0A14]/60 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Registered User Result Area */}
                {inviteSearchQuery.trim() && (
                  <div className="bg-[#0A0A14]/50 border border-white/5 rounded-xl p-3.5 animate-fade-in-up">
                    {(() => {
                      const cleanQuery = inviteSearchQuery.trim().toLowerCase();
                      const foundUser = users.find(u => {
                        const userEmail = u.email.toLowerCase();
                        const userPhone = u.phone.replace(/\D/g, '');
                        const searchDigits = cleanQuery.replace(/\D/g, '');
                        
                        return userEmail === cleanQuery || 
                               u.phone.toLowerCase() === cleanQuery ||
                               (searchDigits && userPhone.includes(searchDigits));
                      });

                      if (foundUser) {
                        const isAlreadyFriend = currentUser.friends?.includes(foundUser.id);
                        const isMyself = foundUser.id === currentUser.id;
                        const currentReq = getRequestForUser(foundUser.id);

                        return (
                          <div className="flex items-center justify-between gap-3" id="invite-search-result-found">
                            <div className="flex items-center gap-3">
                              <img
                                src={foundUser.avatar}
                                alt={foundUser.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-extrabold text-xs text-white">{foundUser.fullName}</span>
                                  {foundUser.isVerified && <Sparkles className="w-3 h-3 text-cyan-400" />}
                                </div>
                                <span className="text-[10px] text-gray-400 block font-mono">@{foundUser.username}</span>
                                <span className="text-[9px] text-gray-500 block font-mono">{foundUser.email} • {foundUser.phone}</span>
                              </div>
                            </div>

                            <div>
                              {isMyself ? (
                                <span className="text-[9px] bg-white/5 text-gray-400 px-2 py-1 rounded-lg font-mono">Você mesmo</span>
                              ) : isAlreadyFriend ? (
                                <span className="text-[9px] bg-green-500/10 text-green-400 px-2 py-1 rounded-lg font-mono font-bold">Já é Amigo</span>
                              ) : currentReq ? (
                                <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-lg font-mono font-bold flex items-center gap-1">
                                  <Hourglass className="w-2.5 h-2.5 animate-spin" /> Pendente
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    onSendFriendRequest(foundUser.id);
                                    alert(`Pedido de amizade enviado com sucesso para ${foundUser.fullName}!`);
                                  }}
                                  className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                                >
                                  Adicionar Amigo
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center py-2" id="invite-search-result-not-found">
                            <p className="text-[11px] text-yellow-500 font-mono">⚠️ Nenhum usuário cadastrado com este e-mail ou telefone.</p>
                            <p className="text-[10px] text-gray-400 mt-1">Mas você pode enviar um convite externo rápido nos campos abaixo!</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Step 2: External Invitation */}
                <div className="space-y-3.5 border-t border-white/5 pt-4">
                  <label className="text-[11px] font-bold text-gray-300 font-mono uppercase tracking-wider block">
                    2. Enviar Convite Externo Personalizado
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">E-mail do Amigo:</span>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="amigo@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full bg-[#0A0A14]/40 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-gray-400 font-mono">Telefone/WhatsApp:</span>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Ex: 62999999999"
                          value={invitePhone}
                          onChange={(e) => setInvitePhone(e.target.value)}
                          className="w-full bg-[#0A0A14]/40 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {/* Send via Email Action */}
                    <a
                      href={inviteEmail ? `mailto:${inviteEmail}?subject=${encodeURIComponent('Convite Especial: Conecte-se comigo!')}&body=${encodeURIComponent(`Olá!\n\nQuero te convidar para fazer parte da minha rede no Portal de Amigos!\n\nVocê pode criar sua conta na plataforma e me adicionar buscando pelo meu e-mail (${currentUser.email}) ou telefone (${currentUser.phone}).\n\nLink para acessar: ${window.location.origin}\n\nAbraços,\n${currentUser.fullName}`)}` : '#'}
                      onClick={(e) => {
                        if (!inviteEmail) {
                          e.preventDefault();
                          alert('Insira o e-mail do seu amigo para enviar o convite!');
                        } else {
                          setInviteSent('email');
                        }
                      }}
                      className={`flex-1 border text-center font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        inviteEmail 
                          ? 'bg-[#1b2f25] border-emerald-500/30 text-emerald-300 hover:bg-[#223d2f]' 
                          : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Enviar por E-mail
                    </a>

                    {/* Send via WhatsApp Action */}
                    <a
                      href={invitePhone ? `https://api.whatsapp.com/send?phone=${invitePhone.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá! Quero te convidar para fazer parte da minha rede no Portal de Amigos! Crie sua conta e me adicione pelo e-mail: ${currentUser.email} ou telefone: ${currentUser.phone}. Acesse em: ${window.location.origin}`)}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!invitePhone) {
                          e.preventDefault();
                          alert('Insira o número de telefone do seu amigo para enviar o convite via WhatsApp!');
                        } else {
                          setInviteSent('phone');
                        }
                      }}
                      className={`flex-1 border text-center font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                        invitePhone 
                          ? 'bg-[#1b2f25] border-emerald-500/30 text-emerald-300 hover:bg-[#223d2f]' 
                          : 'border-white/5 bg-white/5 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </div>

                  {inviteSent !== 'none' && (
                    <div className="text-[10px] text-green-400 font-mono bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg text-center animate-pulse">
                      🚀 Convite iniciado com sucesso via {inviteSent === 'email' ? 'E-mail' : 'WhatsApp'}!
                    </div>
                  )}
                </div>

                {/* Step 3: Generic Invite Referral Link */}
                <div className="bg-[#0A0A14]/40 border border-white/5 rounded-xl p-3 space-y-2">
                  <span className="text-[10px] font-bold text-gray-300 font-mono uppercase tracking-wider block">
                    3. Copiar Dados de Convite Rápido
                  </span>
                  <p className="text-[9px] text-gray-400">
                    Compartilhe o texto abaixo com seus amigos em qualquer rede social para que eles se cadastrem e te encontrem:
                  </p>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-2.5 flex items-start justify-between gap-3">
                    <p className="text-[10px] text-gray-300 font-mono leading-relaxed break-all">
                      Olá! Crie sua conta e conecte-se comigo no Portal de Amigos! Busque-me por E-mail: {currentUser.email} ou Telefone: {currentUser.phone}. Cadastre-se: {window.location.origin}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Olá! Crie sua conta e conecte-se comigo no Portal de Amigos! Busque-me por E-mail: ${currentUser.email} ou Telefone: ${currentUser.phone}. Cadastre-se: ${window.location.origin}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="bg-white/5 hover:bg-white/10 p-1.5 rounded text-gray-400 hover:text-white transition-all shrink-0 cursor-pointer"
                      title="Copiar texto de convite"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {copiedLink && (
                    <span className="text-[9px] text-green-400 font-mono block text-right">Texto copiado para a área de transferência!</span>
                  )}
                </div>
              </div>

              {/* Footer info */}
              <div className="p-4 border-t border-white/10 bg-[#0A0A14]/60 text-center">
                <p className="text-[9px] text-gray-500 font-mono">
                  Seus dados cadastrados: e-mail: <span className="text-gray-400">{currentUser.email}</span> • telefone: <span className="text-gray-400">{currentUser.phone}</span>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
