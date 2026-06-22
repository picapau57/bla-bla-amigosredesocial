import { useState, useEffect } from 'react';
import { User, Post, Chat, Message, Ad, Community, Event, Story, BusinessPage, SystemLog, Comment, CatalogProduct, EmailConfig } from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_COMMUNITIES,
  INITIAL_EVENTS,
  INITIAL_STORIES,
  INITIAL_ADS,
  INITIAL_BUSINESS_PAGES,
  INITIAL_CHATS,
  INITIAL_MESSAGES,
  INITIAL_LOGS
} from '../data/mockData';

export function useSocialState() {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bb_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('bb_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = localStorage.getItem('bb_communities');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('bb_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('bb_stories');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [ads, setAds] = useState<Ad[]>(() => {
    const saved = localStorage.getItem('bb_ads');
    return saved ? JSON.parse(saved) : INITIAL_ADS;
  });

  const [pages, setPages] = useState<BusinessPage[]>(() => {
    const saved = localStorage.getItem('bb_pages');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_PAGES;
  });

  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('bb_chats');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('bb_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem('bb_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('bb_current_uid');
    return saved || 'user-1';
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    const saved = localStorage.getItem('bb_email_config');
    return saved ? JSON.parse(saved) : {
      serviceId: '',
      templateId: '',
      publicKey: '',
      provider: 'disabled'
    };
  });

  const updateEmailConfig = (config: EmailConfig) => {
    setEmailConfig(config);
    localStorage.setItem('bb_email_config', JSON.stringify(config));
    logAction('success', `E-mail Transacional: Configurações do SMTP atualizadas (Provedor: ${config.provider.toUpperCase()}).`);
  };

  // Keep state synchronized with localStorage
  useEffect(() => {
    localStorage.setItem('bb_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bb_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('bb_communities', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    localStorage.setItem('bb_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('bb_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('bb_ads', JSON.stringify(ads));
  }, [ads]);

  useEffect(() => {
    localStorage.setItem('bb_pages', JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem('bb_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('bb_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('bb_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('bb_current_uid', currentUserId);
  }, [currentUserId]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  const logAction = (type: 'info' | 'warning' | 'success' | 'error', message: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // cap at 50 logs for performance
  };

  const loginAs = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (u) {
      if (u.isBlocked) {
        logAction('error', `Acesso bloqueado: Usuário '${u.username}' tentou fazer login mas está bloqueado.`);
        return { success: false, message: 'Esta conta está temporariamente bloqueada pela moderação.' };
      }
      setCurrentUserId(u.id);
      logAction('info', `Usuário '${u.fullName}' (@${u.username}) conectou-se à rede.`);
      return { success: true };
    }
    return { success: false, message: 'Usuário não encontrado.' };
  };

  const registerUser = (inputs: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    birthDate: string;
    city: string;
    state: string;
    country: string;
    avatar: string;
    cover: string;
    gender: string;
    bio: string;
    website: string;
  }) => {
    // Check username uniqueness
    const exists = users.some(u => u.username.toLowerCase() === inputs.username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Este nome de usuário já está em uso.' };
    }

    const newUser: User = {
      ...inputs,
      id: `user-${Date.now()}`,
      isVerified: false,
      badges: ['Novato', 'Pioneiro'],
      premiumPlan: 'free',
      isBlocked: false,
      friends: [],
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    logAction('success', `Nova conta de usuário criada: ${newUser.fullName} (@${newUser.username}).`);
    return { success: true };
  };

  const updateProfile = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    logAction('success', `Perfil de '${currentUser.fullName}' atualizado com sucesso.`);
  };

  const addPost = (content: string, mediaUrl?: string, mediaType?: 'image' | 'video') => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.id,
      content,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      reactions: {
        likes: [],
        loves: [],
        applauds: []
      },
      comments: [],
      sharesCount: 0
    };
    setPosts(prev => [newPost, ...prev]);
    logAction('success', `Anfitrião @${currentUser.username} publicou uma nova postagem.`);
  };

  const toggleReaction = (postId: string, type: 'likes' | 'loves' | 'applauds') => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;

      const keys: ('likes' | 'loves' | 'applauds')[] = ['likes', 'loves', 'applauds'];
      const updatedReactions = { ...p.reactions };

      // Remove active user from other reaction categories if reacting to maintain clean metrics
      keys.forEach(k => {
        if (k === type) {
          if (updatedReactions[k].includes(currentUser.id)) {
            updatedReactions[k] = updatedReactions[k].filter(uid => uid !== currentUser.id);
          } else {
            updatedReactions[k] = [...updatedReactions[k], currentUser.id];
          }
        } else {
          updatedReactions[k] = updatedReactions[k].filter(uid => uid !== currentUser.id);
        }
      });

      return {
        ...p,
        reactions: updatedReactions
      };
    }));
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    logAction('info', `@${currentUser.username} comentou na postagem de #${postId.slice(-4)}.`);
  };

  const handleShare = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, sharesCount: p.sharesCount + 1 } : p));
    logAction('info', `@${currentUser.username} compartilhou a publicação #${postId.slice(-4)}.`);
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const following = u.following.includes(targetUserId)
          ? u.following.filter(id => id !== targetUserId)
          : [...u.following, targetUserId];
        return { ...u, following };
      }
      if (u.id === targetUserId) {
        const followers = u.followers.includes(currentUser.id)
          ? u.followers.filter(id => id !== currentUser.id)
          : [...u.followers, currentUser.id];
        return { ...u, followers };
      }
      return u;
    }));
  };

  const toggleFriend = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const isFriend = u.friends.includes(targetUserId);
        const friends = isFriend
          ? u.friends.filter(id => id !== targetUserId)
          : [...u.friends, targetUserId];
        return { ...u, friends };
      }
      if (u.id === targetUserId) {
        const isFriend = u.friends.includes(currentUser.id);
        const friends = isFriend
          ? u.friends.filter(id => id !== currentUser.id)
          : [...u.friends, currentUser.id];
        return { ...u, friends };
      }
      return u;
    }));
  };

  const startDirectChat = (targetUserId: string) => {
    // Check if chat already exists
    const existing = chats.find(c => !c.isGroup && c.members.includes(currentUser.id) && c.members.includes(targetUserId));
    if (existing) {
      return existing.id;
    }

    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      isGroup: false,
      members: [currentUser.id, targetUserId],
      lastMessage: 'Chat inicializado por amizade.',
      lastMessageAt: new Date().toISOString()
    };

    setChats(prev => [newChat, ...prev]);
    return newChatId;
  };

  const sendMessage = (chatId: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'file' | 'audio') => {
    if (!text.trim() && !mediaUrl) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: currentUser.id,
      text,
      mediaUrl,
      mediaType,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setMessages(prev => [...prev, newMessage]);
    setChats(prev => prev.map(c => c.id === chatId ? {
      ...c,
      lastMessage: text || '[Media]',
      lastMessageAt: new Date().toISOString()
    } : c));

    // Simulate passive replies in direct dialogue or groups after a small delay
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const isCoreGroup = chat.isGroup && chat.id === 'chat-2';
      const destinationMemberId = chat.members.find(uid => uid !== currentUser.id);

      setTimeout(() => {
        // Find who will reply
        let replier: User | undefined;
        let replyText = '';

        if (isCoreGroup) {
          // Admin replies in group
          const otherMembers = chat.members.filter(m => m !== currentUser.id);
          const randomMemberId = otherMembers[Math.floor(Math.random() * otherMembers.length)];
          replier = users.find(u => u.id === randomMemberId);
          const activeReplies = [
            'Concordo plenamente! Nossos gráficos de engajamento subiram 15% esta tarde! 🚀',
            'Preciso verificar isso no banco de dados daqui a pouco.',
            'O design está fantástico. Vamos planejar a campanha Pro na quarta-feira.',
            'Sensacional o feedback!'
          ];
          replyText = activeReplies[Math.floor(Math.random() * activeReplies.length)];
        } else if (destinationMemberId) {
          replier = users.find(u => u.id === destinationMemberId);
          if (replier) {
            const replies = [
              `Oi! adorei sua mensagem. Estava pensando exatamente sobre isso! 😊`,
              `Que legal! No final de semana vou conseguir olhar melhor isso. Compartilha no feed também!`,
              `Com certeza! Vamos nos falando. O Bla Bla Amigos é show! ✨🚀`,
              `Entendi perfeitamente. O que você acha de marcarmos um papo às 15h?`
            ];
            replyText = replies[Math.floor(Math.random() * replies.length)];
          }
        }

        if (replier && replyText) {
          const autoMessage: Message = {
            id: `msg-${Date.now() + 1}`,
            chatId,
            senderId: replier.id,
            text: autoRep(replier.fullName, text, replyText),
            createdAt: new Date().toISOString(),
            isRead: false
          };

          setMessages(prev => [...prev, autoMessage]);
          setChats(prev => prev.map(c => c.id === chatId ? {
            ...c,
            lastMessage: autoMessage.text,
            lastMessageAt: new Date().toISOString()
          } : c));
        }
      }, 1500);
    }
  };

  const autoRep = (name: string, originalText: string, defaultText: string) => {
    // basic smart keyword replies
    const val = originalText.toLowerCase();
    if (val.includes('oi') || val.includes('olá')) return `Olá! Aqui é ${name.split(' ')[0]}. Tudo bem? Que prazer falar com você!`;
    if (val.includes('neon') || val.includes('layout')) return `Nossa, a estética Neon da plataforma é minha queridinha! Ficou incrível! 💎`;
    if (val.includes('anuncio') || val.includes('patrocinio')) return `Os anúncios Patrocinados aqui rendem cliques incríveis! Me dá mais detalhes.`;
    return defaultText;
  };

  const createCommunity = (inputs: {
    name: string;
    description: string;
    category: string;
    avatar: string;
    cover: string;
    isPrivate: boolean;
    rules: string[];
  }) => {
    const newComm: Community = {
      ...inputs,
      id: `comm-${Date.now()}`,
      creatorId: currentUser.id,
      members: [currentUser.id],
      moderators: [currentUser.id],
      pendingMembers: [],
      createdAt: new Date().toISOString()
    };
    setCommunities(prev => [...prev, newComm]);
    logAction('success', `Comunidade '${newComm.name}' criada por @${currentUser.username}.`);
  };

  const toggleJoinCommunity = (commId: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id !== commId) return c;

      const isMember = c.members.includes(currentUser.id);
      let members = [...c.members];
      let pendingMembers = [...c.pendingMembers];

      if (isMember) {
        members = members.filter(id => id !== currentUser.id);
        logAction('info', `@${currentUser.username} saiu da comunidade '${c.name}'.`);
      } else {
        if (c.isPrivate) {
          if (pendingMembers.includes(currentUser.id)) {
            pendingMembers = pendingMembers.filter(id => id !== currentUser.id);
          } else {
            pendingMembers.push(currentUser.id);
            logAction('info', `@${currentUser.username} solicitou entrada na comunidade privada '${c.name}'.`);
          }
        } else {
          members.push(currentUser.id);
          logAction('success', `@${currentUser.username} entrou na comunidade '${c.name}'.`);
        }
      }

      return { ...c, members, pendingMembers };
    }));
  };

  const createEvent = (inputs: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image: string;
  }) => {
    const newEvent: Event = {
      ...inputs,
      id: `event-${Date.now()}`,
      creatorId: currentUser.id,
      going: [currentUser.id],
      maybe: [],
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [...prev, newEvent]);
    logAction('success', `Evento '${newEvent.title}' publicado para dia ${newEvent.date}.`);
  };

  const toggleRSVP = (eventId: string, rsvp: 'going' | 'maybe') => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;

      let going = [...e.going];
      let maybe = [...e.maybe];

      if (rsvp === 'going') {
        if (going.includes(currentUser.id)) {
          going = going.filter(uid => uid !== currentUser.id);
        } else {
          going.push(currentUser.id);
          maybe = maybe.filter(uid => uid !== currentUser.id);
        }
      } else {
        if (maybe.includes(currentUser.id)) {
          maybe = maybe.filter(uid => uid !== currentUser.id);
        } else {
          maybe.push(currentUser.id);
          going = going.filter(uid => uid !== currentUser.id);
        }
      }

      return { ...e, going, maybe };
    }));
  };

  const purchaseAd = (inputs: {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
    type: 'gratis' | 'patrocinado';
    position: 'lateral-top' | 'lateral-bottom' | 'feed' | 'profile' | 'home';
    plan?: 'diario' | 'semanal' | 'mensal' | 'trimestral';
    price?: number;
    paymentMethod?: 'pix' | 'credit_card' | 'boleto';
  }) => {
    const newAd: Ad = {
      ...inputs,
      id: `ad-${Date.now()}`,
      userId: currentUser.id,
      status: inputs.type === 'patrocinado' ? 'pending' : 'active', // patrocinado requires checkout
      clicks: 0,
      impressions: 1,
      createdAt: new Date().toISOString()
    };

    setAds(prev => [newAd, ...prev]);
    logAction('success', `Anúncio '${newAd.title}' (${newAd.type}) cadastrado no sistema.`);
    return newAd;
  };

  const approveAd = (adId: string) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, status: 'active' } : a));
    logAction('success', `Anúncio patrocinado #${adId.slice(-4)} aprovado financeiramente.`);
  };

  const trackAdClick = (adId: string) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, clicks: a.clicks + 1 } : a));
  };

  const trackAdImpression = (adId: string) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, impressions: a.impressions + 1 } : a));
  };

  const addStory = (mediaUrl: string, text?: string, type: 'image' | 'video' | 'text' = 'image') => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: currentUser.id,
      mediaUrl,
      text,
      type,
      createdAt: new Date().toISOString()
    };
    setStories(prev => [newStory, ...prev]);
    logAction('success', `@${currentUser.username} publicou um novo Story de 24h.`);
  };

  // Business Page logic
  const createBusinessPage = (inputs: {
    name: string;
    username: string;
    category: string;
    description: string;
    avatar: string;
    cover: string;
    phone: string;
    email: string;
    website: string;
  }) => {
    const newPage: BusinessPage = {
      ...inputs,
      id: `page-${Date.now()}`,
      userId: currentUser.id,
      catalog: [],
      likes: [],
      createdAt: new Date().toISOString()
    };
    setPages(prev => [...prev, newPage]);
    logAction('success', `Página Comercial '${newPage.name}' registrada por @${currentUser.username}.`);
  };

  const addProductToPage = (pageId: string, product: Omit<CatalogProduct, 'id'>) => {
    const newProduct: CatalogProduct = {
      ...product,
      id: `prod-${Date.now()}`
    };
    setPages(prev => prev.map(p => p.id === pageId ? {
      ...p,
      catalog: [...p.catalog, newProduct]
    } : p));
    logAction('success', `Produto '${newProduct.name}' adicionado ao catálogo da página.`);
  };

  const toggleLikePage = (pageId: string) => {
    setPages(prev => prev.map(p => {
      if (p.id !== pageId) return p;
      const likes = p.likes.includes(currentUser.id)
        ? p.likes.filter(id => id !== currentUser.id)
        : [...p.likes, currentUser.id];
      return { ...p, likes };
    }));
  };

  // Administration capabilities
  const adminBlockUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: true } : u));
    logAction('warning', `MODERAÇÃO: O usuário com ID '${userId}' foi BLOQUEADO pelo administrador.`);
  };

  const adminUnblockUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: false } : u));
    logAction('success', `MODERAÇÃO: O usuário com ID '${userId}' foi DESBLOQUEADO pelo administrador.`);
  };

  const adminToggleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
    logAction('info', `MODERAÇÃO: Status de verificado do usuário '${userId}' foi alterado.`);
  };

  const adminDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    logAction('warning', `MODERAÇÃO: Postagem #${postId.slice(-4)} removida por violar regras comunitárias.`);
  };

  const adminDeleteAd = (adId: string) => {
    setAds(prev => prev.filter(a => a.id !== adId));
    logAction('warning', `MODERAÇÃO: Campanha de anúncio #${adId.slice(-4)} excluída pelo administrador.`);
  };

  // Analytics calculator
  const getAdminStats = () => {
    const activeUsersOnline = Math.floor(users.filter(u => !u.isBlocked).length * 1.4) + 64; // nice simulated active value
    const totalEarnings = ads
      .filter(a => a.type === 'patrocinado' && a.status === 'active')
      .reduce((sum, current) => sum + (current.price || 0), 0) + 1240.00; // static base + active ads

    const totalImpressions = ads.reduce((sum, a) => sum + a.impressions, 0);
    const totalClicks = ads.reduce((sum, a) => sum + a.clicks, 0);

    return {
      totalUsers: users.length,
      usersOnline: activeUsersOnline,
      newSignupsToday: users.filter(u => u.createdAt.includes('2026-06-21') || u.createdAt.includes('2026-06-22')).length + 3,
      earnings: totalEarnings,
      postsCount: posts.length,
      adsCount: ads.length,
      impressions: totalImpressions,
      clicks: totalClicks
    };
  };

  return {
    currentUser,
    users,
    posts,
    communities,
    events,
    stories,
    ads,
    pages,
    chats,
    messages,
    logs,
    isAdminActive: currentUser.id === 'user-admin',
    loginAs,
    registerUser,
    updateProfile,
    addPost,
    toggleReaction,
    addComment,
    handleShare,
    toggleFollowUser,
    toggleFriend,
    startDirectChat,
    sendMessage,
    createCommunity,
    toggleJoinCommunity,
    createEvent,
    toggleRSVP,
    purchaseAd,
    approveAd,
    trackAdClick,
    trackAdImpression,
    addStory,
    createBusinessPage,
    addProductToPage,
    toggleLikePage,
    // Admin operations
    adminBlockUser,
    adminUnblockUser,
    adminToggleVerifyUser,
    adminDeletePost,
    adminDeleteAd,
    getAdminStats,
    emailConfig,
    updateEmailConfig
  };
}
export type UseSocialStateReturn = ReturnType<typeof useSocialState>;
