import { useState, useEffect, useRef } from 'react';
import { 
  User, Post, Chat, Message, Ad, Community, Event, Story, BusinessPage, 
  SystemLog, Comment, CatalogProduct, EmailConfig 
} from '../types';
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
import { db } from '../lib/firebase';
import { seedDatabaseIfEmpty } from '../lib/firebaseSeeder';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const autoRep = (name: string, originalText: string, defaultText: string) => {
  const val = originalText.toLowerCase();
  if (val.includes('oi') || val.includes('olá')) return `Olá! Aqui é ${name.split(' ')[0]}. Tudo bem? Que prazer falar com você!`;
  if (val.includes('neon') || val.includes('layout')) return `Nossa, a estética Neon da plataforma é minha queridinha! Ficou incrível! 💎`;
  if (val.includes('anuncio') || val.includes('patrocinio')) return `Os anúncios Patrocinados aqui rendem cliques incríveis! Me dá mais detalhes.`;
  return defaultText;
};

export function useSocialState() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [ads, setAds] = useState<Ad[]>(INITIAL_ADS);
  const [pages, setPages] = useState<BusinessPage[]>(INITIAL_BUSINESS_PAGES);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('bb_current_uid');
    return saved || 'user-1';
  });

  const [isAdminSessionActive, setIsAdminSessionActive] = useState<boolean>(() => {
    return localStorage.getItem('bb_admin_session_active') === 'true';
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    provider: 'disabled'
  });

  const trackedImpressionsRef = useRef(new Set<string>());

  // 1. Initialize DB and listen to changes in real-time
  useEffect(() => {
    let isMounted = true;
    const activeUnsubs: (() => void)[] = [];

    const init = async () => {
      await seedDatabaseIfEmpty();
      if (!isMounted) return;

      // Listen Core Collections in Real-time
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const list: User[] = [];
        snapshot.forEach(doc => list.push(doc.data() as User));
        if (isMounted) setUsers(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'users');
      });
      activeUnsubs.push(unsubUsers);

      const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
        const list: Post[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Post));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (isMounted) setPosts(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'posts');
      });
      activeUnsubs.push(unsubPosts);

      const unsubCommunities = onSnapshot(collection(db, 'communities'), (snapshot) => {
        const list: Community[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Community));
        if (isMounted) setCommunities(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'communities');
      });
      activeUnsubs.push(unsubCommunities);

      const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
        const list: Event[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Event));
        if (isMounted) setEvents(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'events');
      });
      activeUnsubs.push(unsubEvents);

      const unsubStories = onSnapshot(collection(db, 'stories'), (snapshot) => {
        const list: Story[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Story));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (isMounted) setStories(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'stories');
      });
      activeUnsubs.push(unsubStories);

      const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
        const list: Ad[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Ad));
        if (isMounted) setAds(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'ads');
      });
      activeUnsubs.push(unsubAds);

      const unsubPages = onSnapshot(collection(db, 'pages'), (snapshot) => {
        const list: BusinessPage[] = [];
        snapshot.forEach(doc => list.push(doc.data() as BusinessPage));
        if (isMounted) setPages(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'pages');
      });
      activeUnsubs.push(unsubPages);

      const unsubChats = onSnapshot(collection(db, 'chats'), (snapshot) => {
        const list: Chat[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Chat));
        list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        if (isMounted) setChats(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'chats');
      });
      activeUnsubs.push(unsubChats);

      const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
        const list: Message[] = [];
        snapshot.forEach(doc => list.push(doc.data() as Message));
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        if (isMounted) setMessages(list);
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'messages');
      });
      activeUnsubs.push(unsubMessages);

      const unsubLogs = onSnapshot(collection(db, 'logs'), (snapshot) => {
        const list: SystemLog[] = [];
        snapshot.forEach(doc => list.push(doc.data() as SystemLog));
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (isMounted) setLogs(list.slice(0, 50));
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'logs');
      });
      activeUnsubs.push(unsubLogs);

      const unsubEmailConfig = onSnapshot(doc(db, 'email_config', 'main'), (snapshot) => {
        if (snapshot.exists() && isMounted) {
          setEmailConfig(snapshot.data() as EmailConfig);
        }
      }, (err) => {
        if (isMounted) handleFirestoreError(err, OperationType.GET, 'email_config/main');
      });
      activeUnsubs.push(unsubEmailConfig);
    };

    init();

    return () => {
      isMounted = false;
      activeUnsubs.forEach(unsub => unsub());
    };
  }, []);

  // Save active logged-in user key to LocalStorage (device-dependent, which is correct)
  useEffect(() => {
    localStorage.setItem('bb_current_uid', currentUserId);
    if (currentUserId === 'admin') {
      setIsAdminSessionActive(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('bb_admin_session_active', isAdminSessionActive ? 'true' : 'false');
  }, [isAdminSessionActive]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const logAction = (type: 'info' | 'warning' | 'success' | 'error', message: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setDoc(doc(db, 'logs', newLog.id), newLog).catch(err => {
      console.error('Error logging to Firestore: ', err);
    });
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

  const logout = () => {
    setCurrentUserId('user-1');
    setIsAdminSessionActive(false);
    logAction('info', `Sessão de usuário desconectada.`);
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
    password?: string;
  }) => {
    const exists = users.some(u => u.username.toLowerCase() === inputs.username.toLowerCase());
    if (exists) {
      return { success: false, message: 'Este nome de usuário já está em uso.' };
    }

    const newUser: User = {
      ...inputs,
      password: inputs.password ? inputs.password.trim() : '123456',
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
    
    // Save to firestore asynchronously
    setDoc(doc(db, 'users', newUser.id), newUser)
      .then(() => {
        logAction('success', `Nova conta de usuário criada: ${newUser.fullName} (@${newUser.username}).`);
      })
      .catch(err => console.error('Error registering user: ', err));

    return { success: true };
  };

  const updateProfile = (userId: string, updates: Partial<User>) => {
    // SECURITY GATE 1: Block profile updates if we are currently simulating a user (e.g. admin is logged in but acting as 'user-2')
    // or if the current logged-in user is editing a profile other than their own.
    const isSimulating = isAdminSessionActive && currentUserId !== 'admin';
    if (isSimulating) {
      logAction('warning', `SEGURANÇA: Tentativa de editar perfil de simulação '${userId}' bloqueada.`);
      alert('Segurança: Você está em modo de simulação (leitura). Não é permitido alterar fotos, capas ou dados de outros perfis.');
      return;
    }

    if (currentUserId !== userId) {
      logAction('warning', `SEGURANÇA: Tentativa não autorizada de editar o perfil de outro usuário (Alvo: ${userId}) foi bloqueada.`);
      alert('Segurança: Você não tem permissão para editar o perfil de outro usuário!');
      return;
    }

    const target = users.find(u => u.id === userId);
    if (!target) return;

    // SECURITY GATE 2: Prevent regular users from changing their registered fullName to prevent spoofing
    if (currentUserId !== 'admin' && updates.fullName && updates.fullName !== target.fullName) {
      logAction('warning', `SEGURANÇA: Tentativa de alterar o nome completo de '${target.fullName}' para '${updates.fullName}' foi bloqueada.`);
      alert('Segurança: O nome completo de sua identidade profissional é homologado e não pode ser editado de forma autônoma. Entre em contato com o suporte.');
      return;
    }

    const updated = { ...target, ...updates };
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    
    setDoc(doc(db, 'users', userId), updated)
      .then(() => {
        logAction('success', `Perfil de '${updated.fullName}' atualizado com sucesso.`);
      })
      .catch(err => console.error('Error updating profile: ', err));
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
    
    setDoc(doc(db, 'posts', newPost.id), newPost)
      .then(() => {
        logAction('success', `Anfitrião @${currentUser.username} publicou uma nova postagem.`);
      })
      .catch(err => console.error('Error adding post: ', err));
  };

  const toggleReaction = (postId: string, type: 'likes' | 'loves' | 'applauds') => {
    const p = posts.find(item => item.id === postId);
    if (!p) return;

    const keys: ('likes' | 'loves' | 'applauds')[] = ['likes', 'loves', 'applauds'];
    const updatedReactions = { ...p.reactions };

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

    const updatedPost = { ...p, reactions: updatedReactions };
    setPosts(prev => prev.map(item => item.id === postId ? updatedPost : item));
    
    setDoc(doc(db, 'posts', postId), updatedPost)
      .catch(err => console.error('Error setting reaction: ', err));
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const p = posts.find(item => item.id === postId);
    if (!p) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      userId: currentUser.id,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedPost = { ...p, comments: [...p.comments, newComment] };
    setPosts(prev => prev.map(item => item.id === postId ? updatedPost : item));
    
    setDoc(doc(db, 'posts', postId), updatedPost)
      .then(() => {
        logAction('info', `@${currentUser.username} comentou na postagem de #${postId.slice(-4)}.`);
      })
      .catch(err => console.error('Error adding comment: ', err));
  };

  const handleShare = (postId: string) => {
    const p = posts.find(item => item.id === postId);
    if (!p) return;

    const updatedPost = { ...p, sharesCount: p.sharesCount + 1 };
    setPosts(prev => prev.map(item => item.id === postId ? updatedPost : item));
    
    setDoc(doc(db, 'posts', postId), updatedPost)
      .then(() => {
        logAction('info', `@${currentUser.username} compartilhou a publicação #${postId.slice(-4)}.`);
      })
      .catch(err => console.error('Error sharing post: ', err));
  };

  const toggleFollowUser = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;
    const curr = users.find(u => u.id === currentUser.id);
    const targ = users.find(u => u.id === targetUserId);
    if (!curr || !targ) return;

    const following = curr.following.includes(targetUserId)
      ? curr.following.filter(id => id !== targetUserId)
      : [...curr.following, targetUserId];
    const updatedCurr = { ...curr, following };

    const followers = targ.followers.includes(currentUser.id)
      ? targ.followers.filter(id => id !== currentUser.id)
      : [...targ.followers, currentUser.id];
    const updatedTarg = { ...targ, followers };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) return updatedCurr;
      if (u.id === targetUserId) return updatedTarg;
      return u;
    }));

    setDoc(doc(db, 'users', currentUser.id), updatedCurr).catch(e => console.error(e));
    setDoc(doc(db, 'users', targetUserId), updatedTarg).catch(e => console.error(e));
  };

  const toggleFriend = (targetUserId: string) => {
    if (targetUserId === currentUser.id) return;
    const curr = users.find(u => u.id === currentUser.id);
    const targ = users.find(u => u.id === targetUserId);
    if (!curr || !targ) return;

    const currIsFriend = curr.friends.includes(targetUserId);
    const currFriends = currIsFriend
      ? curr.friends.filter(id => id !== targetUserId)
      : [...curr.friends, targetUserId];
    const updatedCurr = { ...curr, friends: currFriends };

    const targIsFriend = targ.friends.includes(currentUser.id);
    const targFriends = targIsFriend
      ? targ.friends.filter(id => id !== currentUser.id)
      : [...targ.friends, currentUser.id];
    const updatedTarg = { ...targ, friends: targFriends };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) return updatedCurr;
      if (u.id === targetUserId) return updatedTarg;
      return u;
    }));

    setDoc(doc(db, 'users', currentUser.id), updatedCurr).catch(e => console.error(e));
    setDoc(doc(db, 'users', targetUserId), updatedTarg).catch(e => console.error(e));
  };

  const startDirectChat = (targetUserId: string) => {
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
    setDoc(doc(db, 'chats', newChatId), newChat).catch(e => console.error(e));
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
    setDoc(doc(db, 'messages', newMessage.id), newMessage).catch(e => console.error(e));

    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const updatedChat = {
        ...chat,
        lastMessage: text || '[Media]',
        lastMessageAt: new Date().toISOString()
      };
      setChats(prev => prev.map(c => c.id === chatId ? updatedChat : c));
      setDoc(doc(db, 'chats', chatId), updatedChat).catch(e => console.error(e));

      const isCoreGroup = chat.isGroup && chat.id === 'chat-2';
      const destinationMemberId = chat.members.find(uid => uid !== currentUser.id);

      setTimeout(() => {
        let replier: User | undefined;
        let replyText = '';

        if (isCoreGroup) {
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
          // Apenas disparar resposta automática simulada se o destinatário for um usuário mock original
          const isMockUser = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin'].includes(destinationMemberId);
          if (!isMockUser) {
            return;
          }

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
          setDoc(doc(db, 'messages', autoMessage.id), autoMessage).catch(e => console.error(e));

          const nextUpdatedChat = {
            ...updatedChat,
            lastMessage: autoMessage.text,
            lastMessageAt: new Date().toISOString()
          };
          setChats(prev => prev.map(c => c.id === chatId ? nextUpdatedChat : c));
          setDoc(doc(db, 'chats', chatId), nextUpdatedChat).catch(e => console.error(e));
        }
      }, 1500);
    }
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
    setDoc(doc(db, 'communities', newComm.id), newComm)
      .then(() => {
        logAction('success', `Comunidade '${newComm.name}' criada por @${currentUser.username}.`);
      })
      .catch(err => console.error(err));
  };

  const toggleJoinCommunity = (commId: string) => {
    const c = communities.find(comm => comm.id === commId);
    if (!c) return;

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

    const updatedComm = { ...c, members, pendingMembers };
    setCommunities(prev => prev.map(comm => comm.id === commId ? updatedComm : comm));
    setDoc(doc(db, 'communities', commId), updatedComm).catch(err => console.error(err));
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
    setDoc(doc(db, 'events', newEvent.id), newEvent)
      .then(() => {
        logAction('success', `Evento '${newEvent.title}' publicado para dia ${newEvent.date}.`);
      })
      .catch(err => console.error(err));
  };

  const toggleRSVP = (eventId: string, rsvp: 'going' | 'maybe') => {
    const e = events.find(event => event.id === eventId);
    if (!e) return;

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

    const updatedEvent = { ...e, going, maybe };
    setEvents(prev => prev.map(event => event.id === eventId ? updatedEvent : event));
    setDoc(doc(db, 'events', eventId), updatedEvent).catch(err => console.error(err));
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
      status: inputs.type === 'patrocinado' ? 'pending' : 'active',
      clicks: 0,
      impressions: 1,
      createdAt: new Date().toISOString()
    };

    setAds(prev => [newAd, ...prev]);
    setDoc(doc(db, 'ads', newAd.id), newAd)
      .then(() => {
        logAction('success', `Anúncio '${newAd.title}' (${newAd.type}) cadastrado no sistema.`);
      })
      .catch(err => console.error(err));

    return newAd;
  };

  const approveAd = (adId: string) => {
    const a = ads.find(ad => ad.id === adId);
    if (!a) return;
    const updatedAd = { ...a, status: 'active' as const };
    setAds(prev => prev.map(ad => ad.id === adId ? updatedAd : ad));
    
    setDoc(doc(db, 'ads', adId), updatedAd)
      .then(() => {
        logAction('success', `Anúncio patrocinado #${adId.slice(-4)} aprovado financeiramente.`);
      })
      .catch(err => console.error(err));
  };

  const trackAdClick = (adId: string) => {
    const a = ads.find(ad => ad.id === adId);
    if (!a) return;
    const updatedAd = { ...a, clicks: a.clicks + 1 };
    setAds(prev => prev.map(ad => ad.id === adId ? updatedAd : ad));
    setDoc(doc(db, 'ads', adId), updatedAd).catch(err => console.error(err));
  };

  const trackAdImpression = (adId: string) => {
    if (trackedImpressionsRef.current.has(adId)) return;
    trackedImpressionsRef.current.add(adId);

    const a = ads.find(ad => ad.id === adId);
    if (!a) {
      trackedImpressionsRef.current.delete(adId);
      return;
    }
    const updatedAd = { ...a, impressions: a.impressions + 1 };
    setAds(prev => prev.map(ad => ad.id === adId ? updatedAd : ad));
    setDoc(doc(db, 'ads', adId), updatedAd).catch(err => console.error(err));
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
    
    setDoc(doc(db, 'stories', newStory.id), newStory)
      .then(() => {
        logAction('success', `@${currentUser.username} publicou um novo Story de 24h.`);
      })
      .catch(err => console.error(err));
  };

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
    
    setDoc(doc(db, 'pages', newPage.id), newPage)
      .then(() => {
        logAction('success', `Página Comercial '${newPage.name}' registrada por @${currentUser.username}.`);
      })
      .catch(err => console.error(err));
  };

  const addProductToPage = (pageId: string, product: Omit<CatalogProduct, 'id'>) => {
    const p = pages.find(page => page.id === pageId);
    if (!p) return;

    const newProduct: CatalogProduct = {
      ...product,
      id: `prod-${Date.now()}`
    };

    const updatedPage = {
      ...p,
      catalog: [...p.catalog, newProduct]
    };

    setPages(prev => prev.map(page => page.id === pageId ? updatedPage : page));
    
    setDoc(doc(db, 'pages', pageId), updatedPage)
      .then(() => {
        logAction('success', `Produto '${newProduct.name}' adicionado ao catálogo da página.`);
      })
      .catch(err => console.error(err));
  };

  const toggleLikePage = (pageId: string) => {
    const p = pages.find(page => page.id === pageId);
    if (!p) return;

    const likes = p.likes.includes(currentUser.id)
      ? p.likes.filter(id => id !== currentUser.id)
      : [...p.likes, currentUser.id];

    const updatedPage = { ...p, likes };
    setPages(prev => prev.map(page => page.id === pageId ? updatedPage : page));
    setDoc(doc(db, 'pages', pageId), updatedPage).catch(err => console.error(err));
  };

  const adminDeleteUser = (userId: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de exclusão de usuário (Alvo: ${userId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    if (userId === 'admin') return;

    setUsers(prev => prev.filter(u => u.id !== userId));
    setPosts(prev => prev.filter(p => p.userId !== userId));
    setAds(prev => prev.filter(a => a.userId !== userId));

    deleteDoc(doc(db, 'users', userId)).catch(e => console.error(e));

    const userPosts = posts.filter(p => p.userId === userId);
    for (const p of userPosts) {
      deleteDoc(doc(db, 'posts', p.id)).catch(e => console.error(e));
    }

    const userAds = ads.filter(a => a.userId === userId);
    for (const a of userAds) {
      deleteDoc(doc(db, 'ads', a.id)).catch(e => console.error(e));
    }

    logAction('warning', `MODERAÇÃO: O usuário com ID '${userId}' e todo o seu conteúdo associado foram deletados permanentemente.`);
  };

  const adminBlockUser = (userId: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de bloqueio de usuário (Alvo: ${userId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    const u = users.find(user => user.id === userId);
    if (!u) return;
    const updated = { ...u, isBlocked: true };
    setUsers(prev => prev.map(user => user.id === userId ? updated : user));
    setDoc(doc(db, 'users', userId), updated).catch(e => console.error(e));
    logAction('warning', `MODERAÇÃO: O usuário com ID '${userId}' foi BLOQUEADO pelo administrador.`);
  };

  const adminUnblockUser = (userId: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de desbloqueio de usuário (Alvo: ${userId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    const u = users.find(user => user.id === userId);
    if (!u) return;
    const updated = { ...u, isBlocked: false };
    setUsers(prev => prev.map(user => user.id === userId ? updated : user));
    setDoc(doc(db, 'users', userId), updated).catch(e => console.error(e));
    logAction('success', `MODERAÇÃO: O usuário com ID '${userId}' foi DESBLOQUEADO pelo administrador.`);
  };

  const adminToggleVerifyUser = (userId: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de alterar verificação de usuário (Alvo: ${userId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    const u = users.find(user => user.id === userId);
    if (!u) return;
    const updated = { ...u, isVerified: !u.isVerified };
    setUsers(prev => prev.map(user => user.id === userId ? updated : user));
    setDoc(doc(db, 'users', userId), updated).catch(e => console.error(e));
    logAction('info', `MODERAÇÃO: Status de verificado do usuário '${userId}' foi alterado.`);
  };

  const adminUpdateUserPassword = (userId: string, newPassword: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de alterar senha de usuário (Alvo: ${userId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    const u = users.find(user => user.id === userId);
    if (!u) return;
    const updated = { ...u, password: newPassword.trim() };
    setUsers(prev => prev.map(user => user.id === userId ? updated : user));
    setDoc(doc(db, 'users', userId), updated)
      .then(() => {
        logAction('success', `MODERAÇÃO: A senha do usuário '${u.fullName}' (@${u.username}) foi alterada pelo administrador.`);
        alert('Senha alterada com sucesso!');
      })
      .catch(e => console.error(e));
  };

  const adminDeletePost = (postId: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de remoção de postagem (ID: ${postId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    setPosts(prev => prev.filter(p => p.id !== postId));
    deleteDoc(doc(db, 'posts', postId)).catch(e => console.error(e));
    logAction('warning', `MODERAÇÃO: Postagem #${postId.slice(-4)} removida por violar regras comunitárias.`);
  };

  const adminDeleteAd = (adId: string) => {
    if (currentUserId !== 'admin') {
      logAction('error', `SEGURANÇA: Tentativa de remoção de anúncio (ID: ${adId}) negada por falta de permissões de administrador.`);
      alert('Segurança: Apenas o administrador pode realizar esta ação!');
      return;
    }
    setAds(prev => prev.filter(a => a.id !== adId));
    deleteDoc(doc(db, 'ads', adId)).catch(e => console.error(e));
    logAction('warning', `MODERAÇÃO: Campanha de anúncio #${adId.slice(-4)} excluída pelo administrador.`);
  };

  const getAdminStats = () => {
    const activeUsersOnline = Math.floor(users.filter(u => !u.isBlocked).length * 1.4) + 64;
    const totalEarnings = ads
      .filter(a => a.type === 'patrocinado' && a.status === 'active')
      .reduce((sum, current) => sum + (current.price || 0), 0) + 1240.00;

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

  const updateEmailConfig = (config: EmailConfig) => {
    setEmailConfig(config);
    setDoc(doc(db, 'email_config', 'main'), config).catch(e => console.error(e));
    logAction('success', `E-mail Transacional: Configurações do SMTP atualizadas (Provedor: ${config.provider.toUpperCase()}).`);
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
    isAdminActive: currentUser.id === 'admin',
    isAdminSessionActive,
    loginAs,
    logout,
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
    adminDeleteUser,
    adminBlockUser,
    adminUnblockUser,
    adminToggleVerifyUser,
    adminUpdateUserPassword,
    adminDeletePost,
    adminDeleteAd,
    getAdminStats,
    emailConfig,
    updateEmailConfig
  };
}

export type UseSocialStateReturn = ReturnType<typeof useSocialState>;

