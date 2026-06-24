import { useState, useRef, useEffect } from 'react';
import { User, Chat, Message } from '../types';
import { 
  Smile, Mic, Paperclip, Send, CheckCircle, Image as ImageIcon,
  MoreVertical, Phone, Video, Users, FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChatSectionProps {
  currentUser: User;
  users: User[];
  chats: Chat[];
  messages: Message[];
  onSendMessage: (chatId: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'file' | 'audio') => void;
  onStartChat: (userId: string) => string;
}

export default function ChatSection({
  currentUser,
  users,
  chats,
  messages,
  onSendMessage,
  onStartChat
}: ChatSectionProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(chats[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeChatMessages = messages.filter(m => m.chatId === activeChatId);

  // Get chat visual name and avatar
  const getChatDetails = (chat: Chat) => {
    if (chat.isGroup) {
      return {
        name: chat.name || 'Grupo Sem Nome',
        avatar: chat.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200',
        subtitle: `${chat.members.length} membros online`
      };
    } else {
      const otherUserId = chat.members.find(id => id !== currentUser.id) || currentUser.id;
      const otherUser = users.find(u => u.id === otherUserId) || currentUser;
      return {
        name: otherUser.fullName,
        avatar: otherUser.avatar,
        subtitle: `ID: ${otherUser.username} • ${otherUser.isVerified ? 'Membro Verificado' : 'Amigo online'}`
      };
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeChatId) return;
    onSendMessage(activeChatId, inputText);
    setInputText('');

    // Trigger typing effect from bot
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 1400);
  };

  const pickMediaPreset = (type: 'image' | 'file' | 'audio') => {
    if (!activeChatId) return;
    
    let mediaUrl = '';
    let text = '';
    
    if (type === 'image') {
      mediaUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400';
      text = 'Compartilhou imagem técnica';
    } else if (type === 'file') {
      mediaUrl = '#';
      text = 'Contrato_Parceria_BlaBla.pdf (420 KB)';
    } else if (type === 'audio') {
      mediaUrl = '#';
      text = 'Áudio Gravado [0:12s]';
    }

    onSendMessage(activeChatId, text, mediaUrl, type);
  };

  return (
    <div className="flex-1 bg-[#121225] border border-white/10 rounded-2xl shadow-xl flex flex-col md:flex-row h-[580px] overflow-hidden animate-fade-in-up" id="chat-system-console">
      
      {/* LEFT AREA: CHATS DIRECTORY */}
      <div className="w-full md:w-80 border-r border-white/10 flex flex-col h-full bg-[#0A0A14]/30" id="chats-conversations-list">
        <div className="p-4 border-b border-white/10 bg-[#0A0A14]/50">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] font-mono">
            Suas Mensagens
          </h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Sincronizado via Sockets Simulado</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {chats.map(chat => {
            const details = getChatDetails(chat);
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setIsTyping(false);
                }}
                className={`w-full flex items-center gap-3 p-3.5 text-left transition-all hover:bg-[#0A0A14]/50 cursor-pointer ${
                  isActive ? 'bg-gradient-to-r from-[#0A0A14] to-[#7C4DFF]/15 border-l-4 border-[#00E5FF]' : ''
                }`}
              >
                <img
                  src={details.avatar}
                  alt={details.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {details.name}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono shrink-0">
                      {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate mt-1 italic font-sans leading-none">
                    {chat.lastMessage || 'Conversa vazia.'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Suggest direct message list containing remaining registered users */}
        <div className="p-3 bg-[#0A0A14] border-t border-white/10">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1 font-mono">
            Iniciar Chat com Amigos
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {users.filter(u => u.id !== currentUser.id && !u.isBlocked && !['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin'].includes(u.id)).length === 0 ? (
              <span className="text-[10px] text-gray-500 italic p-1">Nenhum outro membro real cadastrado para conversar ainda.</span>
            ) : (
              users
                .filter(u => u.id !== currentUser.id && !u.isBlocked && !['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin'].includes(u.id))
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      const cid = onStartChat(u.id);
                      setActiveChatId(cid);
                    }}
                    title={`Converse com ${u.fullName}`}
                    className="shrink-0 relative focus:outline-none cursor-pointer"
                  >
                    <img
                      src={u.avatar}
                      alt={u.fullName}
                      referrerPolicy="no-referrer"
                      className="w-8.5 h-8.5 rounded-full object-cover border border-white/10 hover:border-[#00E5FF] transition-colors"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00E676] rounded-full border-2 border-[#121225]" />
                  </button>
                ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA: MESSAGES CONSOLE */}
      <div className="flex-1 flex flex-col h-full bg-[#121225]" id="chats-conversations-viewport">
        {activeChat ? (
          <>
            {/* VIEWPORT HEADER */}
            {(() => {
              const details = getChatDetails(activeChat);
              return (
                <div className="px-5 py-3 border-b border-white/10 bg-[#0A0A14]/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={details.avatar}
                      alt={details.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00E5FF]/20"
                    />
                    <div>
                      <h4 className="text-xs md:text-sm font-extrabold text-white flex items-center gap-1.5">
                        {details.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{details.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => alert(`Simulando chamada de voz para ${details.name}... Conexão estabelecida sob rede webRTC.`)}
                      className="p-2 text-gray-400 hover:text-[#00E5FF] bg-[#0A0A14] rounded-full hover:bg-[#0A0A14]/80 border border-white/10 cursor-pointer transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => alert(`Simulando chamada de vídeo de alta definição para ${details.name}... Aguardando atendimento.`)}
                      className="p-2 text-gray-400 hover:text-[#FF5722] bg-[#0A0A14] rounded-full hover:bg-[#0A0A14]/80 border border-white/10 cursor-pointer transition-colors"
                    >
                      <Video className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* MESSAGES VIEWPORT */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 bg-[#0A0A14]/5" id="chats-messages-scroll-stage">
              {activeChatMessages.map(msg => {
                const isMyMessage = msg.senderId === currentUser.id;
                const sender = users.find(u => u.id === msg.senderId) || currentUser;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 max-w-[85%] ${isMyMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {!isMyMessage && (
                      <img
                        src={sender.avatar}
                        alt="author"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/10 mt-1"
                      />
                    )}
                    <div>
                      {/* Name if group chat */}
                      {activeChat.isGroup && !isMyMessage && (
                        <span className="text-[10px] font-mono font-bold text-[#00E5FF] block mb-1">
                          {sender.fullName}
                        </span>
                      )}

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                          isMyMessage
                            ? 'bg-gradient-to-tr from-[#7C4DFF] to-[#00E5FF] border-[#00E5FF]/20 text-white rounded-tr-none shadow-lg'
                            : 'bg-[#0A0A14] border-white/5 text-gray-200 rounded-tl-none shadow'
                        }`}
                      >
                        {/* If image attachment */}
                        {msg.mediaType === 'image' && msg.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mb-2 border border-[#0A0A14] max-h-40 bg-[#0A0A14]">
                            <img src={msg.mediaUrl} alt="attachment" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* If file attachment */}
                        {msg.mediaType === 'file' && (
                          <div className="bg-[#0A0A14]/75 p-2 rounded-xl mb-2 flex items-center gap-2 border border-white/5 text-[11px] font-mono">
                            <FileText className="w-4.5 h-4.5 text-[#FF5722]" />
                            <span className="hover:underline cursor-pointer text-[#00E5FF] font-bold">{msg.text}</span>
                          </div>
                        )}

                        {/* If audio attachment */}
                        {msg.mediaType === 'audio' && (
                          <div className="bg-[#0A0A14]/75 p-2 rounded-xl mb-2 flex items-center gap-2.5 border border-white/5 text-[11px] font-mono">
                            <Mic className="w-4.5 h-4.5 text-[#00E5FF] animate-pulse" />
                            <div className="h-6 w-32 flex items-center justify-around">
                              <span className="h-4 w-1 bg-[#00E5FF] rounded-full animate-bounce" />
                              <span className="h-2 w-1 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="h-5 w-1 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.4s]" />
                              <span className="h-3 w-1 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.1s]" />
                              <span className="h-1 w-1 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                            <span className="text-[10px] text-gray-500">0:12</span>
                          </div>
                        )}

                        {msg.mediaType !== 'file' && <p>{msg.text}</p>}
                      </div>

                      <span className={`text-[9px] text-gray-500 font-mono mt-1 block ${isMyMessage ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMyMessage && <span className="text-[#00E5FF] ml-1">✓✓</span>}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bot typing simulator indicator */}
              {isTyping && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto">
                  <div className="bg-[#0A0A14] border border-white/5 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* SEND BAR INPUT */}
            <div className="p-4 border-t border-white/10 bg-[#0A0A14]/45 space-y-3">
              
              {/* ATTACHMENT SHORTCUT BAR */}
              <div className="flex gap-2.5 items-center">
                <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Anexos rápidos:</span>
                <button
                  onClick={() => pickMediaPreset('image')}
                  className="bg-[#0A0A14] border border-white/10 text-[10px] font-mono font-bold text-gray-300 px-2 py-1 rounded hover:border-[#00E5FF] hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#00E5FF]" /> imagem
                </button>
                <button
                  onClick={() => pickMediaPreset('file')}
                  className="bg-[#0A0A14] border border-white/10 text-[10px] font-mono font-bold text-gray-300 px-2 py-1 rounded hover:border-[#FF5722] hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FF5722]" /> PDF contrato
                </button>
                <button
                  onClick={() => pickMediaPreset('audio')}
                  className="bg-[#0A0A14] border border-white/10 text-[10px] font-mono font-bold text-gray-300 px-2 py-1 rounded hover:border-[#00E676] hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5 text-[#00E676]" /> Áudio gravado
                </button>
              </div>

              {/* TEXT FIELD */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escreva sua mensagem amigável..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 text-xs md:text-sm pl-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-[#00E5FF] placeholder-gray-600 focus:ring-1 focus:ring-[#00E5FF]/20"
                />
                
                <button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-white rounded-xl p-2.5 shadow-lg flex items-center justify-center shrink-0 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0A0A14]/30">
            <Users className="w-12 h-12 text-[#7C4DFF] animate-pulse mb-3" />
            <p className="font-extrabold text-sm text-[#00E5FF] uppercase tracking-wider font-mono">Sem conversas selecionadas</p>
            <p className="text-xs text-gray-500 mt-2.5 max-w-xs leading-relaxed">
              Clique em um dos perfis na barra esquerda ou no seletor inferior para abrir uma sala de conversa imediata.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
