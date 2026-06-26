export interface User {
  id: string;
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
  isVerified: boolean;
  badges: string[];
  premiumPlan: 'free' | 'basic' | 'pro' | 'enterprise';
  isBlocked: boolean;
  friends: string[]; // List of user IDs
  followers: string[]; // List of user IDs
  following: string[]; // List of user IDs
  createdAt: string;
  password?: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  reactions: {
    likes: string[]; // Array of User IDs
    loves: string[];
    applauds: string[];
  };
  comments: Comment[];
  sharesCount: number;
  isPatrocinado?: boolean;
  adUrl?: string;
  category?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file' | 'audio';
  createdAt: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  name?: string;
  isGroup: boolean;
  members: string[]; // User IDs
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Ad {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  type: 'gratis' | 'patrocinado';
  position: 'lateral-top' | 'lateral-bottom' | 'feed' | 'profile' | 'home';
  plan?: 'diario' | 'semanal' | 'mensal' | 'trimestral';
  price?: number;
  status: 'active' | 'pending' | 'ended';
  clicks: number;
  impressions: number;
  paymentMethod?: 'pix' | 'credit_card' | 'boleto';
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  avatar: string;
  cover: string;
  isPrivate: boolean;
  creatorId: string;
  members: string[];
  moderators: string[];
  pendingMembers: string[];
  rules: string[];
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image: string;
  creatorId: string;
  going: string[]; // User IDs
  maybe: string[]; // User IDs
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  text?: string;
  createdAt: string;
  type: 'image' | 'video' | 'text';
}

export interface BusinessPage {
  id: string;
  userId: string;
  name: string;
  username: string;
  category: string;
  description: string;
  avatar: string;
  cover: string;
  phone: string;
  email: string;
  website: string;
  catalog: CatalogProduct[];
  likes: string[]; // User IDs
  createdAt: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface SystemLog {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  timestamp: string;
}

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  provider: 'emailjs' | 'disabled';
}

export interface Job {
  id: string;
  userId: string; // Creator ID
  title: string;
  companyName: string;
  companyLogo: string;
  location: string; // e.g., "Goiânia, GO", "Aparecida de Goiânia, GO", "Anápolis, GO", "Rio Verde, GO"
  modality: 'Presencial' | 'Híbrido' | 'Remoto';
  level: 'Estágio' | 'Júnior' | 'Pleno' | 'Sênior' | 'Gerência';
  salary: string; // e.g., "R$ 4.500 - R$ 6.000" or "A combinar"
  description: string;
  requirements: string;
  contactEmail: string;
  contactPhone?: string;
  applicants: string[]; // User IDs who applied
  createdAt: string;
}

