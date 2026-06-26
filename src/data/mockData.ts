import { User, Post, Chat, Message, Ad, Community, Event, Story, BusinessPage, SystemLog, Job } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    fullName: 'Carlos Souza',
    username: 'carlos.neon',
    email: 'carlos@blabla.com.br',
    phone: '(11) 98765-4321',
    birthDate: '1995-10-14',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800',
    gender: 'Masculino',
    bio: 'Desenvolvedor Full-Stack & Engenheiro de Prompts. Apaixonado por tecnologia neon, skate, café e redes sociais. 🧪✨',
    website: 'https://carlossouza.dev',
    isVerified: true,
    badges: ['Pioneiro', 'Moderador VIP', 'Tech Wizard'],
    premiumPlan: 'pro',
    isBlocked: false,
    friends: ['user-2', 'user-3', 'user-4'],
    followers: ['user-2', 'user-3', 'user-4', 'user-5'],
    following: ['user-2', 'user-3'],
    createdAt: '2026-01-10T12:00:00Z',
    password: '123456'
  },
  {
    id: 'user-2',
    fullName: 'Mariana Dias',
    username: 'mari.design',
    email: 'mariana.dias@exemplo.com',
    phone: '(21) 97123-4567',
    birthDate: '1998-05-22',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
    gender: 'Feminino',
    bio: 'UI/UX Designer apaixonada por gradientes brilhantes, interfaces de usuário modernas e arte abstrata. Crio experiências que respiram. 🎨💜',
    website: 'https://behance.net/maridias',
    isVerified: true,
    badges: ['Criador Pro', 'Artista Premium'],
    premiumPlan: 'pro',
    isBlocked: false,
    friends: ['user-1', 'user-3'],
    followers: ['user-1', 'user-3', 'user-4'],
    following: ['user-1', 'user-4'],
    createdAt: '2026-02-15T15:30:00Z',
    password: '123456'
  },
  {
    id: 'user-3',
    fullName: 'Juliana Mendes',
    username: 'ju.fit.health',
    email: 'juliana.fit@exemplo.com',
    phone: '(31) 96543-2101',
    birthDate: '1997-08-30',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
    gender: 'Feminino',
    bio: 'Personal Trainer & Nutricionista. Coach de hábitos saudáveis e estilo de vida ativo. Bora movimentar o corpo hoje? 🧘‍♀️💪☀️',
    website: 'https://jumendesfit.com',
    isVerified: false,
    badges: ['Estrela do Bem-Estar'],
    premiumPlan: 'basic',
    isBlocked: false,
    friends: ['user-1', 'user-2', 'user-5'],
    followers: ['user-1', 'user-2'],
    following: ['user-1', 'user-2', 'user-5'],
    createdAt: '2026-03-01T09:15:00Z',
    password: '123456'
  },
  {
    id: 'user-4',
    fullName: 'Felipe Alencar',
    username: 'felipe.inova',
    email: 'felipe@inovamarketing.com',
    phone: '(11) 92233-4455',
    birthDate: '1990-12-05',
    city: 'Campinas',
    state: 'SP',
    country: 'Brasil',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    gender: 'Masculino',
    bio: 'Fundador da Inova S.A. Mentor de negócios, investidor-anjo e especialista em Growth Hacking. Ajudo empresas a faturarem múltiplos 7 dígitos. 🚀👔',
    website: 'https://inovamarketing.com',
    isVerified: true,
    badges: ['Investidor Anjo', 'Anunciante Pro', 'Empresário Gold'],
    premiumPlan: 'enterprise',
    isBlocked: false,
    friends: ['user-1', 'user-5'],
    followers: ['user-1', 'user-2'],
    following: ['user-1', 'user-2', 'user-5'],
    createdAt: '2026-01-20T10:45:00Z',
    password: '123456'
  },
  {
    id: 'user-5',
    fullName: 'Bruna Lima',
    username: 'bruna.viaja',
    email: 'bruba.travels@exemplo.com',
    phone: '(48) 98877-6655',
    birthDate: '1999-03-18',
    city: 'Florianópolis',
    state: 'SC',
    country: 'Brasil',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    gender: 'Feminino',
    bio: 'Viajante profissional. 🗺️ Já passei por 32 países e documentando tudo aqui. Siga para dicas diárias de viagens baratas e segredos locais! ✈️🌍🍹',
    website: 'https://brunaviaja.com.br',
    isVerified: false,
    badges: ['Nômade Global'],
    premiumPlan: 'free',
    isBlocked: false,
    friends: ['user-3', 'user-4'],
    followers: ['user-3', 'user-4'],
    following: ['user-3', 'user-4'],
    createdAt: '2026-04-10T14:20:00Z',
    password: '123456'
  },
  {
    id: 'admin',
    fullName: 'Administrador Boss',
    username: 'admin',
    email: 'admin@blablaamigos.com.br',
    phone: '(11) 90000-0000',
    birthDate: '1988-01-01',
    city: 'Central de Operações',
    state: 'Web',
    country: 'Global',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    gender: 'Outro',
    bio: 'Conta Administrativa Oficial da Plataforma Bla Bla Amigos. Dedicado à moderação, segurança e expansão do ecossistema. 🛠️🛡️',
    website: 'https://blablaamigos.com.br',
    isVerified: true,
    badges: ['Staff', 'Desenvolvedor Master'],
    premiumPlan: 'enterprise',
    isBlocked: false,
    friends: [],
    followers: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    following: [],
    createdAt: '2026-01-01T00:00:00Z',
    password: 'admin123'
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    content: 'Fala galera do BLA BLA, AMIGOS! Acabei de subir a primeira versão homologada da nossa nova interface de rede social. Estética ultra-moderna, com tons escuros premium e gradientes neon que eu sei que vocês amam! O que acharam desse visual roxo e azul? Comentem aí! 💙💜👾 #NovaEra #BlaBlaAmigos #DevEstilo',
    mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: '2026-06-21T18:30:00Z',
    reactions: {
      likes: ['user-2', 'user-3', 'user-5'],
      loves: ['user-2'],
      applauds: ['user-4']
    },
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        userId: 'user-2',
        content: 'Ficou sensacional, Carlos! Os efeitos de houver e as bordas arredondadas dão uma sensação de acabamento premium incrível! Arrasou! ✨',
        createdAt: '2026-06-21T18:45:00Z'
      },
      {
        id: 'comment-2',
        postId: 'post-1',
        userId: 'user-4',
        content: 'Excelente progresso técnico. Essa performance vai aguentar tranquilamente os milhares de usuários simultâneos que estamos planejando trazer com as novas campanhas corporativas. Parabéns ao time!',
        createdAt: '2026-06-21T19:00:00Z'
      }
    ],
    sharesCount: 12
  },
  {
    id: 'post-2',
    userId: 'user-2',
    content: 'Compartilhando um pouco do meu último estudo cromático. Esse gradiente combina o Roxo Vibrante com o Laranja Moderno e Verde Gradiente, criando uma sensação psicodélica e estimulante. Qual variante é a preferida de vocês para botões de conversão e call-to-action? Deixem o feedback! 👇💻🎨',
    mediaUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: '2026-06-21T10:15:00Z',
    reactions: {
      likes: ['user-1'],
      loves: ['user-1', 'user-3'],
      applauds: ['user-1']
    },
    comments: [
      {
        id: 'comment-3',
        postId: 'post-2',
        userId: 'user-1',
        content: 'O roxo que se transforma em laranja está fantástico. Dá uma energia dinâmica espetacular para páginas de destino.',
        createdAt: '2026-06-21T11:00:00Z'
      },
      {
        id: 'comment-4',
        postId: 'post-2',
        userId: 'user-5',
        content: 'Lindo demais, Mari! Lembra o pôr do sol em Jericoacoara. Quero esse tema no meu app já!',
        createdAt: '2026-06-21T11:30:00Z'
      }
    ],
    sharesCount: 4
  },
  {
    id: 'post-3',
    userId: 'user-3',
    content: 'Domingo também é dia de cuidar de si! Treino matinal concluído de alta intensidade com foco em mobilidade e força. Lembre-se: cuidar da sua saúde física é o maior investimento que você pode fazer na sua carreira e bem-estar geral. Quem aí já se movimentou hoje? Coloque seu emoji! 🧘‍♀️🔋💦',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: '2026-06-21T13:40:00Z',
    reactions: {
      likes: ['user-1'],
      loves: ['user-2', 'user-5'],
      applauds: ['user-4']
    },
    comments: [
      {
        id: 'comment-5',
        postId: 'post-3',
        userId: 'user-1',
        content: 'Inspirador! Acabei de voltar do skate de domingo por causa do seu post! Valeu pelo gás! 🛹🔋',
        createdAt: '2026-06-21T14:10:00Z'
      }
    ],
    sharesCount: 2
  },
  {
    id: 'post-patrocinado-1',
    userId: 'user-4',
    content: '🔥 QUER APRENDER MARKETING DE CRESCIMENTO E PATROCÍNIO EFICAZ? Participe da nossa Masterclass Prática dia 28/06 na Inova S.A. Vamos ensinar as técnicas que usamos para escalar produtos digitais de 0 a 100k usuários em menos de 6 meses. Inscrições abertas e vagas limitadas com 50% de desconto pelo link oficial. Garanta seu lugar!',
    mediaUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800',
    mediaType: 'image',
    createdAt: '2026-06-20T17:00:00Z',
    reactions: {
      likes: ['user-1', 'user-3'],
      loves: [],
      applauds: ['user-1', 'user-2']
    },
    comments: [
      {
        id: 'comment-6',
        postId: 'post-patrocinado-1',
        userId: 'user-1',
        content: 'Já garanti meu ingresso de patrocinador, Felipe! Sou fã de carteirinha da metodologia Inova! 💻📈',
        createdAt: '2026-06-20T18:15:00Z'
      }
    ],
    sharesCount: 35,
    isPatrocinado: true,
    adUrl: 'https://inovamarketing.com/masterclass'
  }
];

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    name: 'Devs Neon Brasil',
    description: 'Comunidade exclusiva para desenvolvedores, criadores de UI/UX, programadores de React, Next, Sockets e fanáticos por estéticas de ficção científica, neon cyberpunk e interfaces de software de última geração.',
    category: 'Tecnologia',
    avatar: 'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    isPrivate: false,
    creatorId: 'user-1',
    members: ['user-1', 'user-2', 'user-3', 'user-4'],
    moderators: ['user-1', 'user-2'],
    pendingMembers: [],
    rules: [
      'Respeito mútuo absoluto',
      'Compartilhar apenas conteúdos reais com códigos ou ideias de UI',
      'Sem spam ou links de afiliados',
      'Preferir paletas vibrantes neon no compartilhamento de mockups'
    ],
    createdAt: '2026-03-01T08:00:00Z'
  },
  {
    id: 'comm-2',
    name: 'Empreendedores e Investidores Brasil',
    description: 'Networking profissional completo, anúncios de novos serviços, conselho empresarial, startups, propostas de investimento-anjo e discussões sobre tendências econômicas globais e do ecossistema nacional.',
    category: 'Negócios',
    avatar: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=800',
    isPrivate: false,
    creatorId: 'user-4',
    members: ['user-4', 'user-1', 'user-5'],
    moderators: ['user-4'],
    pendingMembers: [],
    rules: [
      'Proibido golpes ou propostas financeiras de pirâmide',
      'Sempre preencha seu perfil empresarial antes de propor negócios',
      'Foco em colaboração e parcerias ganha-ganha'
    ],
    createdAt: '2026-03-10T14:00:00Z'
  },
  {
    id: 'comm-3',
    name: 'Fotografia e Viagens Maravilhosas',
    description: 'Espaço de inspiração para viajantes diários, mochileiros e fotógrafos (com câmera ou celular). Poste suas paisagens de tirar o fôlego, curiosidades de culturas exóticas e segredos invisíveis de viagem.',
    category: 'Estilo de Vida',
    avatar: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
    isPrivate: false,
    creatorId: 'user-5',
    members: ['user-5', 'user-2', 'user-3'],
    moderators: ['user-5'],
    pendingMembers: [],
    rules: [
      'Sempre cite a cidade/país na descrição da imagem',
      'Não é permitido downloads de terceiros; publique apenas suas fotos reais',
      'Dicas úteis de roteiro são extremamente incentivadas'
    ],
    createdAt: '2026-03-25T19:30:00Z'
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Bla Bla Festival - São Paulo 2026',
    description: 'O maior reencontro ao vivo da nossa rede de amigos! Com palestras interativas de inovação, trilhas de Networking, arena gamer com torneio em tempo real, painel de investimentos, food trucks e shows com luzes neon e Djs convidados. Venha celebrar a amizade e a comunidade vibrante!',
    date: '2026-08-15',
    time: '14:00',
    location: 'Pavilhão Neospatial, Av. Paulista - São Paulo, SP',
    category: 'Social/Cultural',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    creatorId: 'admin',
    going: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    maybe: [],
    createdAt: '2026-06-15T12:00:00Z'
  },
  {
    id: 'event-2',
    title: 'Oficina Prática UI/UX Neon Moderno',
    description: 'Venha aprender os conceitos avançados de paletas de alta saturação, contraste acessível, sombras coloridas, efeitos de vidro (glassmorphism) e tipografia para criar interfaces viciantes. Ministrado por Mariana Dias.',
    date: '2026-07-05',
    time: '19:30',
    location: 'Plataforma Virtual Bla Bla Amigos (Sala 3-Vídeo)',
    category: 'Tecnologia/Educação',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800',
    creatorId: 'user-2',
    going: ['user-1', 'user-3'],
    maybe: ['user-4', 'user-5'],
    createdAt: '2026-06-18T16:00:00Z'
  }
];

export const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    userId: 'user-1',
    mediaUrl: 'https://images.unsplash.com/photo-1504607798333-52a30db54a5d?auto=format&fit=crop&q=80&w=400',
    text: 'Codando na madrugada! Café + Código = Vida 💻☕️',
    createdAt: '2026-06-21T23:00:00Z',
    type: 'image'
  },
  {
    id: 'story-2',
    userId: 'user-2',
    mediaUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400',
    text: 'Sextou com música boa e gradientes relaxantes! 🎧🍇',
    createdAt: '2026-06-21T21:10:00Z',
    type: 'image'
  },
  {
    id: 'story-3',
    userId: 'user-3',
    mediaUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&q=80&w=400',
    text: 'Chá de hibisco termogênico antes do pedal! 🚲🍒',
    createdAt: '2026-06-21T22:30:00Z',
    type: 'image'
  }
];

export const INITIAL_ADS: Ad[] = [
  {
    id: 'ad-1',
    userId: 'user-4',
    title: 'Consultoria Financeira Inova S.A.',
    description: 'Multiplique seus resultados comerciais de forma auditada e segura. Agende um diagnóstico gratuito da sua infraestrutura e processos de vendas.',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400',
    link: 'https://inovamarketing.com/consultoria',
    type: 'patrocinado',
    position: 'lateral-top',
    plan: 'mensal',
    price: 350.00,
    status: 'active',
    clicks: 142,
    impressions: 3420,
    paymentMethod: 'pix',
    createdAt: '2026-06-01T10:00:00Z'
  },
  {
    id: 'ad-2',
    userId: 'user-1',
    title: 'Caneca Programadora Neon Termossensível',
    description: 'Caneca preta fosca de alta qualidade que revela um circuito de ficção científica neon azul e verde em contato com líquidos quentes! Edição artesanal.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    link: 'https://loja.carlossouza.dev/caneca-neon',
    type: 'gratis',
    position: 'lateral-bottom',
    status: 'active',
    clicks: 58,
    impressions: 1205,
    createdAt: '2026-06-19T11:00:00Z'
  }
];

export const INITIAL_BUSINESS_PAGES: BusinessPage[] = [
  {
    id: 'page-1',
    userId: 'user-4',
    name: 'Inova S.A. Digital Growth',
    username: 'inovademand',
    category: 'Agência de Publicidade/Marketing',
    description: 'Aceleradora de negócios de ponta a ponta. Criamos funis de conversão automatizados de alto ciclo, tráfego patrocinado inteligente para B2B e B2C, e estratégias de posicionamento de marca premium e de alto valor.',
    avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
    cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    phone: '(11) 4004-9876',
    email: 'atendimento@inovamarketing.com',
    website: 'https://inovamarketing.com',
    catalog: [
      {
        id: 'prod-1',
        name: 'Tráfego Pago Acelerado (Mensal)',
        description: 'Gestão completa com campanhas otimizadas em Google Ads, Meta Ads e Bla Bla Ads para dobrar seus leads.',
        price: 1500.00,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=200'
      },
      {
        id: 'prod-2',
        name: 'Design e Landing Page de Alta Conversão',
        description: 'Mockup e implementação completa de página de vendas optimizada com copywriting hipnótico e carregamento sub-segundo.',
        price: 2400.00,
        imageUrl: 'https://images.unsplash.com/photo-1541462608141-2ff580ee0e9e?auto=format&fit=crop&q=80&w=200'
      }
    ],
    likes: ['user-1', 'user-2', 'user-3', 'user-5'],
    createdAt: '2026-02-10T11:00:00Z'
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-1',
    isGroup: false,
    members: ['user-1', 'user-2'],
    lastMessage: 'Mari, o layout neon violeta foi aprovado na apresentação de hoje!',
    lastMessageAt: '2026-06-21T21:40:00Z'
  },
  {
    id: 'chat-2',
    isGroup: true,
    name: 'Bla Bla Amigos Founders Core',
    members: ['user-1', 'user-2', 'user-4', 'admin'],
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=200',
    lastMessage: 'Felipe: Precisamos calibrar o anúncio de lateral superior para focar no público Pro.',
    lastMessageAt: '2026-06-21T20:30:00Z'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    senderId: 'user-2',
    text: 'Oi Carlos! Conseguiu integrar as animações suaves na lista de amigos do perfil?',
    createdAt: '2026-06-21T21:30:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    senderId: 'user-1',
    text: 'Oi Mari! Consegui sim! Usei o `motion/react` com springs leves e ficou incrivelmente ágil!',
    createdAt: '2026-06-21T21:35:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    chatId: 'chat-1',
    senderId: 'user-2',
    text: 'Maravilha! Você quer testar com o tom "Roxo Vibrante" ou de fundo ultra escuro?',
    createdAt: '2026-06-21T21:38:00Z',
    isRead: true
  },
  {
    id: 'msg-4',
    chatId: 'chat-1',
    senderId: 'user-1',
    text: 'Mari, o layout neon violeta foi aprovado na apresentação de hoje! Ficou impecável!',
    createdAt: '2026-06-21T21:40:00Z',
    isRead: true
  },
  // Group Messages
  {
    id: 'msg-g1',
    chatId: 'chat-2',
    senderId: 'admin',
    text: 'Sejam bem-vindos ao chat dos fundadores da rede social Bla Bla Amigos!',
    createdAt: '2026-06-21T19:00:00Z',
    isRead: true
  },
  {
    id: 'msg-g2',
    chatId: 'chat-2',
    senderId: 'user-1',
    text: 'Valeu Admin! Tudo pronto para rodar em larga escala! 🚀⚡',
    createdAt: '2026-06-21T19:30:00Z',
    isRead: true
  },
  {
    id: 'msg-g3',
    chatId: 'chat-2',
    senderId: 'user-4',
    text: 'Felipe: Precisamos calibrar o anúncio de lateral superior para focar no público Pro. Temos que aumentar esse CTR!',
    createdAt: '2026-06-21T20:30:00Z',
    isRead: true
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log-1',
    type: 'info',
    message: 'Sistema Bla Bla Amigos iniciado com sucesso na porta 3000.',
    timestamp: '2026-06-21T10:00:00-03:00'
  },
  {
    id: 'log-2',
    type: 'success',
    message: 'Carregamento de 5.340 conexões simultâneas estabilizadas sob stress-test.',
    timestamp: '2026-06-21T10:05:00-03:00'
  },
  {
    id: 'log-3',
    type: 'info',
    message: 'Backup diário do banco de dados PostgreSQL executado com integridade 100%.',
    timestamp: '2026-06-21T21:00:00-03:00'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    userId: 'user-4',
    title: 'Desenvolvedor React / Node.js Sênior',
    companyName: 'Tecnologia Cerrado S.A.',
    companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=150',
    location: 'Goiânia, GO',
    modality: 'Híbrido',
    level: 'Sênior',
    salary: 'R$ 11.500 - R$ 14.000',
    description: 'Buscamos um desenvolvedor sênior apaixonado por criar produtos web escaláveis, modernos e fluidos. Você trabalhará no desenvolvimento do nosso novo portal corporativo, colaborando diretamente com designers e gerentes de produto em Goiânia.\n\nPrincipais responsabilidades:\n- Desenvolver interfaces de usuário limpas e performáticas em React e Tailwind CSS;\n- Desenvolver e otimizar APIs eficientes em Node.js / Express;\n- Trabalhar na otimização de consultas e modelagem de banco de dados no Google Cloud / Firestore.\n\nOferecemos:\n- Vale Refeição premium;\n- Plano de saúde completo Unimed Goiânia;\n- Participação nos Lucros (PLR);\n- Horário flexível e ambiente de trabalho acolhedor.',
    requirements: 'Mínimo de 5 anos de experiência com ecossistema JavaScript/TypeScript, React, Node.js e ferramentas do Google Cloud Platform.',
    contactEmail: 'recrutamento@tecnologiacerrado.com.br',
    contactPhone: '(62) 3212-4000',
    applicants: ['user-1'],
    createdAt: '2026-06-21T10:00:00Z'
  },
  {
    id: 'job-2',
    userId: 'user-4',
    title: 'Analista de Marketing Digital e Tráfego',
    companyName: 'Goiânia Promo Express',
    companyLogo: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=150',
    location: 'Aparecida de Goiânia, GO',
    modality: 'Presencial',
    level: 'Pleno',
    salary: 'R$ 4.500 - R$ 5.800',
    description: 'Oportunidade para analista pleno de tráfego pago e marketing digital focado em gerar leads qualificados e impulsionar vendas para nossos clientes comerciais de Goiás.\n\nSeus desafios diários:\n- Gerenciar campanhas de alta performance no Meta Ads (Facebook/Instagram) e Google Ads;\n- Analisar funis de conversão e propor melhorias de design de landing pages;\n- Elaborar relatórios semanais de performance utilizando Google Analytics.\n\nDiferenciais:\n- Conhecimento em Copywriting e ferramentas de automação;\n- Certificações do Google Ads e Meta Blueprint.',
    requirements: 'Experiência comprovada de 2+ anos com gerenciamento de contas e otimização de tráfego. Conhecimento em funis de venda.',
    contactEmail: 'vagas@goianiapromo.com',
    contactPhone: '(62) 3514-9090',
    applicants: [],
    createdAt: '2026-06-22T14:30:00Z'
  },
  {
    id: 'job-3',
    userId: 'user-5',
    title: 'Engenheiro Agrônomo de Vendas',
    companyName: 'AgroCerrado Distribuidora',
    companyLogo: 'https://images.unsplash.com/photo-1589923188900-85dae440342b?auto=format&fit=crop&q=80&w=150',
    location: 'Rio Verde, GO',
    modality: 'Presencial',
    level: 'Pleno',
    salary: 'R$ 7.500 + Comissões',
    description: 'Procuramos engenheiro agrônomo para atuar na região de Rio Verde de Goiás, prestando consultoria técnica aos produtores agrícolas locais e promovendo nosso catálogo de sementes e fertilizantes inteligentes.\n\nRequisitos da rotina:\n- Visitar propriedades agrícolas e prestar assistência técnica especializada;\n- Desenvolver estratégias de manejo sustentável para aumento de produtividade de soja e milho;\n- Negociar contratos de fornecimento.\n\nBenefícios:\n- Veículo fornecido pela empresa;\n- Ajuda de custo para viagens;\n- Seguro de vida premium;\n- Bônus semestral por metas batidas.',
    requirements: 'Graduação completa em Engenharia Agronômica, registro ativo no CREA-GO, CNH categoria B e disponibilidade total para viagens regionais.',
    contactEmail: 'carreira@agrocerrado.com.br',
    applicants: [],
    createdAt: '2026-06-23T08:00:00Z'
  },
  {
    id: 'job-4',
    userId: 'user-2',
    title: 'Designer Gráfico / UI Júnior',
    companyName: 'Estúdio Goiânia Criativo',
    companyLogo: 'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=150',
    location: 'Goiânia, GO',
    modality: 'Remoto',
    level: 'Júnior',
    salary: 'R$ 3.200 - R$ 4.000',
    description: 'Procuramos um Designer Júnior motivado a crescer, com paixão por identidades visuais brilhantes, mídias sociais e conceitos básicos de UI Design para criar belas interfaces.\n\nO que você fará:\n- Criar peças publicitárias e banners artísticos para redes sociais de marcas de Goiânia;\n- Apoiar na prototipação de wireframes básicos para portais web e aplicativos;\n- Colaborar na escolha de paletas cromáticas e tipografias inovadoras.\n\nTrabalho 100% home office (qualquer cidade do estado de Goiás).',
    requirements: 'Portfólio com trabalhos autorais de design gráfico ou mockups de interface. Conhecimento em Figma e Adobe Creative Cloud.',
    contactEmail: 'talentos@goianiacriativo.design',
    applicants: ['user-3'],
    createdAt: '2026-06-24T11:15:00Z'
  },
  {
    id: 'job-5',
    userId: 'user-4',
    title: 'Coordenador de Logística de Distribuição',
    companyName: 'Anápolis Trans-Log',
    companyLogo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=150',
    location: 'Anápolis, GO',
    modality: 'Presencial',
    level: 'Gerência',
    salary: 'R$ 8.200 - R$ 9.500',
    description: 'Vaga de coordenação no polo industrial de Anápolis (DAIA). O profissional gerenciará equipes de distribuição interestadual e controle de armazéns refrigerados de alta tecnologia.\n\nResponsabilidades principais:\n- Otimizar rotas de entrega para diminuir custos operacionais;\n- Garantir o cumprimento de prazos de entregas industriais de medicamentos e alimentos;\n- Monitorar indicadores de desempenho logístico (KPIs) e segurança da frota.\n\nBenefícios adicionais:\n- Refeitório na fábrica;\n- Estacionamento privativo;\n- Plano de saúde estendido para dependentes.',
    requirements: 'Graduação em Logística ou Administração de Empresas. Mínimo de 3 anos liderando equipes de armazenagem e transporte logístico.',
    contactEmail: 'rh@anapolistranslog.com.br',
    contactPhone: '(62) 3310-8500',
    applicants: [],
    createdAt: '2026-06-25T09:00:00Z'
  }
];

