import { useState, FormEvent, useEffect } from 'react';
import { useSocialState } from './hooks/useSocialState';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RightRail from './components/RightRail';
import StoriesSection from './components/StoriesSection';
import FeedSection from './components/FeedSection';
import ChatSection from './components/ChatSection';
import AdsSection from './components/AdsSection';
import GroupsSection from './components/GroupsSection';
import EventsSection from './components/EventsSection';
import PagesSection from './components/PagesSection';
import AdminSection from './components/AdminSection';
import JobsSection from './components/JobsSection';
import GamesSection from './components/GamesSection';
import ReelsSection from './components/ReelsSection';
import UserProfileModal from './components/UserProfileModal';
import FriendsSection from './components/FriendsSection';

import { 
  Network, Sparkles, ShieldCheck, ChevronRight, CheckCircle, 
  UserPlus, ShieldAlert, BadgeCheck, Users, Eye, MousePointerClick, 
  HelpCircle, Key, FileText, QrCode, CreditCard, X, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const social = useSocialState();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('bb_is_logged_in') === 'true';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('bb_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('bb_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('bb_theme', theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState('feed');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  // Landing form states
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [regStep, setRegStep] = useState<'details' | 'email_validate' | 'success'>('details');

  // Login states
  const [loginUserText, setLoginUserText] = useState('');
  const [loginPassText, setLoginPassText] = useState('');

  // Premium modal states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  const [premiumPayMethod, setPremiumPayMethod] = useState<'pix' | 'credit'>('pix');
  const [premiumStep, setPremiumStep] = useState<'plan_pick' | 'checkout' | 'done'>('plan_pick');

  const [expectedCode, setExpectedCode] = useState('8844');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regUsername || !regEmail) return;

    // Generate random 4 digit code
    const generatedCodeStr = Math.floor(1000 + Math.random() * 9000).toString();
    setExpectedCode(generatedCodeStr);

    // Transition to verification stage
    setRegStep('email_validate');

    const config = social.emailConfig;
    if (config && config.provider === 'emailjs' && config.serviceId && config.templateId && config.publicKey) {
      setIsSendingEmail(true);
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          template_params: {
            to_name: regFullName,
            to_email: regEmail,
            code: generatedCodeStr,
            from_name: 'Bla Bla Amigos'
          }
        })
      })
      .then(async (res) => {
        setIsSendingEmail(false);
        if (res.ok) {
          social.logs.push({
            id: `sys-${Date.now()}-${Math.random()}`,
            type: 'success',
            message: `E-mail transacional real enviado com sucesso para ${regEmail} via EmailJS! Código: ${generatedCodeStr}`,
            timestamp: new Date().toISOString()
          });
        } else {
          const text = await res.text();
          social.logs.push({
            id: `sys-${Date.now()}-${Math.random()}`,
            type: 'error',
            message: `Erro ao enviar e-mail transacional EmailJS: ${text}`,
            timestamp: new Date().toISOString()
          });
          alert(`O EmailJS respondeu com erro: "${text}". O administrador precisa verificar se as chaves estão corretas na aba "E-mail Transacional API" do Painel de Admin.`);
        }
      })
      .catch((err: any) => {
        setIsSendingEmail(false);
        social.logs.push({
          id: `sys-${Date.now()}-${Math.random()}`,
          type: 'error',
          message: `Falha de rede ao enviar EmailJS: ${err.message}`,
          timestamp: new Date().toISOString()
        });
        alert(`Não foi possível estabelecer contato com o servidor EmailJS. Mas você ainda pode simular digitando o código.`);
      });
    } else {
      // Fallback simulated delivery
      social.logs.push({
        id: `sys-${Date.now()}-${Math.random()}`,
        type: 'info',
        message: `Serviço EmailJS desativado ou incompleto. Código gerado de teste para '${regEmail}': ${generatedCodeStr}`,
        timestamp: new Date().toISOString()
      });
      alert(`[SIMULAÇÃO DE CADASTRO]\n\nComo o serviço EmailJS está inativo/em teste, geramos o seguinte código de ativação para o e-mail ${regEmail}:\n\n👉 ${generatedCodeStr}\n\nDigite-o no próximo campo para confirmar o seu cadastro!`);
    }
  };

  const handleVerifyCodeSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (verificationCode.trim() !== expectedCode) {
      alert(`Código incorreto! Digite o código de confirmação correto enviado para ${regEmail}.`);
      return;
    }

    // Complete registration
    const res = social.registerUser({
      fullName: regFullName,
      username: regUsername.toLowerCase(),
      email: regEmail,
      phone: regPhone || '(11) 90000-0000',
      birthDate: '1998-10-10',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      cover: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=800',
      gender: 'Não Especificado',
      bio: regBio || 'Olá! Sou novo por aqui no Bla Bla Amigos!',
      website: '',
      password: regPassword
    });

    if (res.success) {
      setRegStep('success');
      setTimeout(() => {
        setIsLoggedIn(true);
        setActiveTab('feed');
      }, 2000);
    } else {
      alert(res.message);
      setRegStep('details');
    }
  };

  const handleManualLogin = (e: FormEvent) => {
    e.preventDefault();
    const u = social.users.find(x => x.username.toLowerCase() === loginUserText.toLowerCase().trim() || x.email.toLowerCase() === loginUserText.toLowerCase().trim());
    if (u) {
      const expectedPassword = u.password || (u.id === 'admin' ? 'admin123' : '123456');
      if (loginPassText !== expectedPassword) {
        alert('Senha de segurança incorreta! Verifique sua senha cadastrada e tente novamente.');
        return;
      }
      const res = social.loginAs(u.id);
      if (res.success) {
        setIsLoggedIn(true);
      } else {
        alert(res.message);
      }
    } else {
      alert('Usuário não encontrado. Verifique se digitou o e-mail ou ID do membro cadastrado corretamente, ou crie uma nova conta grátis!');
    }
  };

  const loginAsPreset = (userId: string) => {
    const res = social.loginAs(userId);
    if (res.success) {
      setIsLoggedIn(true);
    } else {
      alert(res.message);
    }
  };

  const handleUpgradePremium = () => {
    setPremiumStep('checkout');
  };

  const completePremiumUpgrade = () => {
    // Apply updates on state
    const targetBadges = [...social.currentUser.badges];
    if (!targetBadges.includes('Investidor VIP')) {
      targetBadges.push('Investidor VIP');
    }
    
    social.updateProfile(social.currentUser.id, {
      premiumPlan: selectedPremiumPlan,
      isVerified: true,
      badges: targetBadges
    });

    setPremiumStep('done');
  };

  return (
    <div className="min-h-screen bg-[#0A0A14] text-slate-100 flex flex-col font-sans" id="application-entrypoint-root">
      
      {/* PUBLIC LANDING PORTAL CARD */}
      {!isLoggedIn ? (
        <div className="space-y-12" id="landing-page-parent">
          
          {/* Main Hero Header banner */}
          <header className="border-b border-white/10 bg-[#121225]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-tr from-[#7C4DFF] via-[#00E5FF] to-[#00E676] p-2 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.25)]">
                  <Network className="w-5.5 h-5.5 text-white animate-spin-slow" />
                </div>
                <span className="font-extrabold text-base tracking-wider uppercase bg-gradient-to-r from-white via-gray-300 to-gray-100">
                  BLA, BLA, AMIGOS
                </span>
              </div>
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="bg-white hover:bg-white/95 text-[#0A0A14] font-black uppercase text-xs px-4  py-2.5 rounded-xl tracking-wider transition-all cursor-pointer shadow-md"
              >
                {isRegisterMode ? 'Fazer Login' : 'Cadastre-se Grátis'}
              </button>
            </div>
          </header>

          {/* CENTRAL LANDING BANNER ROW */}
          <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* BRAND VALUE PRESENTATION */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left" id="landing-hero-presentation">
              <div className="inline-flex items-center gap-1.5 bg-[#7C4DFF]/10 border border-white/10 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#FF5722] animate-pulse" />
                A Nova Geração das Redes Sociais
              </div>
              
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                A Rede Social mais <br />
                <span className="bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] bg-clip-text text-transparent">
                  Vibrante, Colorida e Divertida
                </span> <br />
                das Amizades Reais.
              </h1>

              <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-xl">
                Cansado de redes travadas e sem graça? O <strong>BLA, BLA, AMIGOS</strong> une a agilidade do Threads com a interatividade de fotos do Instagram, comunidades do TikTok e classificados integrados com orçamentos em tempo real!
              </p>

              {/* Statistical community metrics */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-xl md:text-2xl font-mono font-extrabold text-white">5.340+</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Membros Simultâneos</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-mono font-extrabold text-[#00E5FF]">100%</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Disponibilidade</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-mono font-extrabold text-[#FF5722]">R$ 0,15</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-mono mt-0.5">Custo Clique</div>
                </div>
              </div>
            </div>

            {/* LOGIN / SIGNUP WIDGET BOX */}
            <div className="lg:col-span-12 xl:col-span-5 bg-[#121225] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6" id="landing-auth-forms">
              
              <AnimatePresence mode="wait">
                {!isRegisterMode ? (
                  /* LOGIN PANEL FORM */
                  <motion.div
                    key="login-view"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-white font-extrabold text-base md:text-lg tracking-tight">Conecte-se com seus Amigos</h3>
                      <p className="text-xs text-gray-400 mt-1">Converse, compartilhe Reels e gerencie anúncios comerciais.</p>
                    </div>

                    <form onSubmit={handleManualLogin} className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">E-mail ou Username</label>
                        <input
                          type="text"
                          required
                          value={loginUserText}
                          onChange={(e) => setLoginUserText(e.target.value)}
                          placeholder="Digite seu e-mail de cadastro..."
                          className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 text-xs p-3 rounded-xl focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Senha Secreta</label>
                        <input
                          type="password"
                          required
                          value={loginPassText}
                          onChange={(e) => setLoginPassText(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 text-xs p-3 rounded-xl focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                      >
                        Entrar na Rede
                      </button>
                    </form>

                    <div className="text-center pt-4 border-t border-white/5">
                      <button
                        onClick={() => setIsRegisterMode(true)}
                        className="text-xs text-[#00E5FF] hover:underline cursor-pointer font-bold"
                      >
                        Não possui conta? Registre-se já!
                      </button>
                    </div>

                  </motion.div>
                ) : (
                  /* SIGNUP WIDGET */
                  <motion.div
                    key="register-view"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-white font-extrabold text-base md:text-lg tracking-tight">Criar uma Nova Conta Grátis</h3>
                      <p className="text-xs text-gray-400 mt-1">Preencha seus detalhes em 1 minuto.</p>
                    </div>

                    <AnimatePresence mode="wait">
                      {regStep === 'details' && (
                        <motion.form
                          key="det"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleRegisterSubmit}
                          className="space-y-3 text-xs"
                        >
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 font-mono mb-1">Nome Completo</label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: Carlos Souza"
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 p-2 text-xs rounded-lg focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 font-mono mb-1">ID do Membro (CPF ou Nickname)</label>
                              <input
                                type="text"
                                required
                                placeholder="Ex: 123.456.789-10"
                                value={regUsername}
                                onChange={(e) => setRegUsername(e.target.value)}
                                className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 p-2 text-xs rounded-lg focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 font-mono mb-1">E-mail</label>
                              <input
                                type="email"
                                required
                                placeholder="exemplo@gmail.com"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 p-2 text-xs rounded-lg focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 font-mono mb-1">Telefone</label>
                              <input
                                type="text"
                                placeholder="(11) 99999-9999"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 p-2 text-xs rounded-lg focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-gray-400 font-mono mb-1">Senha Secreta</label>
                              <input
                                type="password"
                                required
                                placeholder="Crie uma senha..."
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 p-2 text-xs rounded-lg focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 font-mono mb-1">Sua Biografia Curta</label>
                            <input
                              type="text"
                              placeholder="Fale um pouco sobre você..."
                              value={regBio}
                              onChange={(e) => setRegBio(e.target.value)}
                              className="w-full bg-[#0A0A14] border border-white/5 text-gray-200 p-2 text-xs rounded-lg focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer shadow-md"
                          >
                            Continuar e Validar Conta
                          </button>
                        </motion.form>
                      )}

                      {regStep === 'email_validate' && (
                        <motion.form
                          key="em"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleVerifyCodeSubmit}
                          className="space-y-4"
                        >
                          {social.emailConfig?.provider === 'emailjs' ? (
                            <div className="bg-[#121225] p-3.5 rounded-xl border border-[#00E5FF]/20 text-xs text-gray-300 text-center leading-relaxed font-sans space-y-1 animate-fade-in">
                              <span className="inline-block w-2 bg-[#00E676] rounded-full animate-pulse mr-1" />
                              <span className="font-bold text-white uppercase text-[9px] bg-[#00E676]/10 px-2 py-0.5 border border-[#00E676]/20 rounded">Envio Real de E-mail Ativo</span>
                              <p className="text-[11px] text-gray-300 mt-1">Enviamos um código de confirmação eletrônico para: <strong className="text-[#00E5FF] font-mono">{regEmail}</strong></p>
                              {isSendingEmail ? (
                                <p className="text-[10px] text-amber-400 font-mono italic animate-pulse mt-1">⚡ Conectando ao servidor e enviando e-mail...</p>
                              ) : (
                                <p className="text-[10px] text-gray-400 mt-1">Caso demore alguns segundos, verifique sua caixa de entrada e pasta de <strong>Spam</strong>.</p>
                              )}
                              
                              <details className="mt-2 text-left bg-[#0A0A14] p-1.5 rounded border border-white/5">
                                <summary className="text-[9px] text-gray-500 cursor-pointer hover:text-gray-400 outline-none select-none">Bypass de Desenvolvimento (Caso o e-mail atrase)</summary>
                                <p className="text-[9px] text-[#00E676] font-mono mt-1">Código gerado nesta sessão: <strong className="font-extrabold bg-[#121225] px-1 rounded select-all text-white border border-white/10">{expectedCode}</strong></p>
                              </details>
                            </div>
                          ) : (
                            <div className="bg-[#121225] p-3.5 rounded-xl border border-white/10 text-xs text-gray-300 text-center leading-relaxed font-sans space-y-1 animate-fade-in">
                              <p>Simulação ativa para <strong className="text-[#00E5FF] font-mono">{regEmail}</strong>!</p>
                              <p className="text-[11px] text-[#00E676] font-bold font-mono">👉 Código de Ativação: Digite <span className="font-mono bg-[#0A0A14] text-white px-2 py-0.5 rounded border border-white/10 select-all font-extrabold">{expectedCode}</span> para validar seu acesso.</p>
                              <p className="text-[9px] text-gray-500 bg-[#0A0A14] p-1.5 rounded mt-1">Administrador: Conecte o EmailJS no Painel Administrativo para testar envios reais para qualquer e-mail!</p>
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center gap-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#00E5FF] font-mono mb-1 text-center">
                              Insira o Código de 4 dígitos enviado:
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={4}
                              placeholder={"Ex: " + expectedCode}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              className="w-32 mx-auto block bg-[#0A0A14] border border-white/10 text-center text-white font-mono font-extrabold text-lg p-2 rounded-xl focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 animate-pulse"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setVerificationCode(expectedCode);
                                social.logs.push({
                                  id: `sys-${Date.now()}-${Math.random()}`,
                                  type: 'info',
                                  message: `Bypass de validação acionado: Código ${expectedCode} preenchido automaticamente.`,
                                  timestamp: new Date().toISOString()
                                });
                              }}
                              className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider cursor-pointer transition-all"
                            >
                              ⚡ Preencher Código Automático ({expectedCode})
                            </button>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#00E676] text-[#0A0A14] hover:brightness-110 font-extrabold text-xs py-3 rounded-xl uppercase tracking-wider shadow cursor-pointer transition-all"
                          >
                            Confirmar Conta e Entrar!
                          </button>

                          <button 
                            type="button"
                            onClick={() => setRegStep('details')}
                            className="text-[11px] text-gray-500 hover:underline mx-auto block text-center cursor-pointer"
                          >
                            [ Voltar Formulário ]
                          </button>
                        </motion.form>
                      )}

                      {regStep === 'success' && (
                        <motion.div
                          key="suc"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="py-6 text-center space-y-3"
                        >
                          <div className="bg-[#00E676]/10 p-3 rounded-full w-12 h-12 mx-auto border border-[#00E676]/30 flex items-center justify-center">
                            <CheckCircle className="w-7 h-7 text-[#00E676]" />
                          </div>
                          <h4 className="font-extrabold text-sm text-white">Verificado com Sucesso!</h4>
                          <p className="text-xs text-gray-500">Conectando sua sessão de morador no Bla Bla Amigos...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => setIsRegisterMode(false)}
                        className="text-xs text-[#00E5FF] hover:underline text-[11px] cursor-pointer"
                      >
                        Já possui conta? Conecte-se aqui!
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

          {/* BRAG INFO SHOWCASE AND MOCK TESTIMONIALS */}
          <section className="bg-[#121225]/40 border-t border-white/10 py-12">
            <div className="max-w-7xl mx-auto px-6 space-y-8 animate-fade-in-up">
              <div className="text-center space-y-1.5">
                <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-widest block">O que dizem sobre nós</span>
                <h3 className="text-white text-xl font-extrabold tracking-tight uppercase">Depoimentos de Usuários Reais</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-400">
                <div className="bg-[#121225] p-5 rounded-2xl border border-white/5 space-y-3">
                  <p className="leading-relaxed italic">"O segredo do Bla Bla Amigos é a estabilidade. Conseguimos rodar nossa campanha de anúncios e fechar orçamentos de landing pages no mesmo minuto!"</p>
                  <p className="font-bold text-gray-300">- Felipe Alencar, @felipe.inova</p>
                </div>
                <div className="bg-[#121225] p-5 rounded-2xl border border-white/5 space-y-3">
                  <p className="leading-relaxed italic">"Os STORIES de 24h e as reações triplas como o 'Aplaudir' trazem um engajamento mil vezes maior que as redes tradicionais!"</p>
                  <p className="font-bold text-gray-300">- Mariana Dias, @mari.design</p>
                </div>
                <div className="bg-[#121225] p-5 rounded-2xl border border-white/5 space-y-3">
                  <p className="leading-relaxed italic">"Excelente comunidade! Encontrei desenvolvedores dedicados à estética de interfaces de software neon em menos de 10 minutos."</p>
                  <p className="font-bold text-gray-300">- Carlos Souza, @carlos.neon</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer public advertisement slots required */}
          <footer className="py-6 border-t border-white/10 text-center text-[11px] text-gray-600 font-mono">
            <span>© 2026 Bla Bla Amigos S.A. | Classificados Premium e Conexões Seguras Cryptografado via SSL</span>
          </footer>

        </div>
      ) : (
        /* AUTHENTICATED PORTAL WORKSPACE */
        <div className={`flex-1 flex flex-col min-h-screen transition-colors duration-300 ${theme === 'light' ? 'light-theme bg-[#f3f4f6] text-slate-800' : 'bg-[#0A0A14] text-gray-100'}`} id="authenticated-workspace" data-theme={theme}>
          
          <Header
            currentUser={social.currentUser}
            users={social.users}
            onSelectUser={(uid) => {
              const res = social.loginAs(uid);
              if (res.success) {
                // Done
              } else {
                alert(res.message);
              }
            }}
            onSearch={(term) => setSearchTerm(term)}
            searchTerm={searchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            logs={social.logs}
            isAdminSessionActive={social.isAdminSessionActive}
            theme={theme}
            setTheme={setTheme}
          />

          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 flex-1 flex flex-col lg:flex-row gap-6 relative">
            
            {/* LEFT CONTAINER: SIDEBAR */}
            <Sidebar
              currentUser={social.currentUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onUpgradePlan={() => {
                setPremiumStep('plan_pick');
                setShowPremiumModal(true);
              }}
              onUpdateProfile={social.updateProfile}
              isAdminSessionActive={social.isAdminSessionActive}
            />

            {/* CENTRAL WORKSPACE STAGE */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {/* FEED SECTION VIEW */}
                  {activeTab === 'feed' && (
                    <>
                      {/* Top Horizontal stories tray of users */}
                      <StoriesSection
                        currentUser={social.currentUser}
                        users={social.users}
                        stories={social.stories}
                        onAddStory={social.addStory}
                      />
                      
                      {/* Feed of posts with filtering by Search term */}
                      <FeedSection
                        currentUser={social.currentUser}
                        users={social.users}
                        posts={social.posts.filter(p => p.content.toLowerCase().includes(searchTerm.toLowerCase()))}
                        ads={social.ads}
                        onAddPost={social.addPost}
                        onToggleReaction={social.toggleReaction}
                        onAddComment={social.addComment}
                        onShare={social.handleShare}
                        onAdClick={social.trackAdClick}
                        onTrackAdImpression={social.trackAdImpression}
                        onViewProfile={setViewingUser}
                      />
                    </>
                  )}

                  {/* CHATS VIEW */}
                  {activeTab === 'chats' && (
                    <ChatSection
                      currentUser={social.currentUser}
                      users={social.users}
                      chats={social.chats}
                      messages={social.messages}
                      onSendMessage={social.sendMessage}
                      onStartChat={social.startDirectChat}
                      onViewProfile={setViewingUser}
                    />
                  )}

                  {/* FRIENDS PORTAL VIEW */}
                  {activeTab === 'friends' && (
                    <FriendsSection
                      currentUser={social.currentUser}
                      users={social.users}
                      friendRequests={social.friendRequests}
                      onSendFriendRequest={social.sendFriendRequest}
                      onAcceptFriendRequest={social.acceptFriendRequest}
                      onDeclineFriendRequest={social.declineFriendRequest}
                      onCancelFriendRequest={social.cancelFriendRequest}
                      onRemoveFriend={social.removeFriend}
                      onStartChat={(uid) => {
                        const cid = social.startDirectChat(uid);
                        setActiveTab('chats');
                        return cid;
                      }}
                      onSendMessage={social.sendMessage}
                    />
                  )}

                  {/* ADVERTISING / MARKETPLACE VIEW */}
                  {activeTab === 'ads' && (
                    <AdsSection
                      currentUser={social.currentUser}
                      ads={social.ads}
                      onPurchaseAd={social.purchaseAd}
                      onApproveAd={social.approveAd}
                    />
                  )}

                  {/* COMMUNITIES GROUP DIRECTORY */}
                  {activeTab === 'groups' && (
                    <GroupsSection
                      currentUser={social.currentUser}
                      users={social.users}
                      communities={social.communities}
                      onJoinCommunity={social.toggleJoinCommunity}
                      onCreateCommunity={social.createCommunity}
                    />
                  )}

                  {/* COORDINATED EVENTS CALENDAR */}
                  {activeTab === 'events' && (
                    <EventsSection
                      currentUser={social.currentUser}
                      events={social.events}
                      onCreateEvent={social.createEvent}
                      onToggleRSVP={social.toggleRSVP}
                    />
                  )}

                  {/* BUSINESS PAGES SPACE */}
                  {activeTab === 'pages' && (
                    <PagesSection
                      currentUser={social.currentUser}
                      pages={social.pages}
                      onCreatePage={social.createBusinessPage}
                      onAddProduct={social.addProductToPage}
                      onLikePage={social.toggleLikePage}
                    />
                  )}

                  {/* JOBS IN GOIAS BOARD */}
                  {activeTab === 'jobs' && (
                    <JobsSection
                      currentUser={social.currentUser}
                      users={social.users}
                      jobs={social.jobs}
                      onCreateJob={social.createJob}
                      onDeleteJob={social.deleteJob}
                      onToggleApplyJob={social.toggleApplyJob}
                      onViewProfile={setViewingUser}
                    />
                  )}

                  {/* GAMES AND ENTERTAINMENT BOARD */}
                  {activeTab === 'games' && (
                    <GamesSection
                      currentUser={social.currentUser}
                      users={social.users}
                      onViewProfile={setViewingUser}
                      ads={social.ads}
                      onPurchaseAd={social.purchaseAd}
                      onApproveAd={social.approveAd}
                    />
                  )}

                  {/* REELS & SHORT VIDEOS SECTION VIEW */}
                  {activeTab === 'reels' && (
                    <ReelsSection
                      currentUser={social.currentUser}
                      onViewProfile={setViewingUser}
                    />
                  )}

                  {/* RESTRICTED MASTER ADMIN PANEL */}
                  {activeTab === 'admin' && social.currentUser.id === 'admin' && (
                    <AdminSection
                      currentUser={social.currentUser}
                      users={social.users}
                      posts={social.posts}
                      ads={social.ads}
                      logs={social.logs}
                      emailConfig={social.emailConfig}
                      onUpdateEmailConfig={social.updateEmailConfig}
                      onDeleteUser={social.adminDeleteUser}
                      onBlockUser={social.adminBlockUser}
                      onUnblockUser={social.adminUnblockUser}
                      onToggleVerifyUser={social.adminToggleVerifyUser}
                      onUpdateUserPassword={social.adminUpdateUserPassword}
                      onDeletePost={social.adminDeletePost}
                      onDeleteAd={social.adminDeleteAd}
                      onApproveAd={social.approveAd}
                      getAdminStats={social.getAdminStats}
                    />
                  )}

                </motion.div>
              </AnimatePresence>
            </main>

            {/* RIGHT RAIL CONTAINER: ADS & RECOMMENDATIONS */}
            {activeTab === 'feed' && (
              <RightRail
                currentUser={social.currentUser}
                users={social.users}
                ads={social.ads}
                events={social.events}
                onFriendToggle={social.toggleFriend}
                onAdClick={social.trackAdClick}
                onTrackImpression={social.trackAdImpression}
                setActiveTab={setActiveTab}
                onViewProfile={setViewingUser}
              />
            )}

          </div>

          {/* SYSTEM WIDE QUICK LOGOUT FOOTER ACTION */}
          <footer className="bg-[#121225] border-t border-white/10 py-5 px-6 font-mono text-[11px] text-gray-500 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <span>Servidor Bla Bla Amigos ativo v2.1.0 • Banco PostgreSQL Conectado</span>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  social.logout();
                  setIsLoggedIn(false);
                  setRegStep('details');
                  setRegFullName('');
                  setRegUsername('');
                  setRegEmail('');
                }}
                className="text-rose-400 hover:underline bg-[#0A0A14] p-1.5 px-3 rounded-lg border border-white/10 cursor-pointer text-[10px] uppercase font-bold tracking-wider"
              >
                Desconectar Sessão
              </button>
            </div>
          </footer>

        </div>
      )}

      {/* PREMIUM UPGRADE SUBSCRIPTIONS MODAL POPUP */}
      <AnimatePresence>
        {showPremiumModal && (
          <div className="fixed inset-0 z-[110] bg-[#0A0A14]/80 flex items-center justify-center p-4 backdrop-blur-sm" id="premium-upgrade-modal">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121225] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative text-slate-200"
            >
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {premiumStep === 'plan_pick' && (
                <div className="space-y-4">
                  <div className="text-center pb-2 border-b border-white/10">
                    <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-widest">Selo Azul Incorporado</span>
                    <h3 className="font-extrabold text-sm md:text-base text-white uppercase tracking-tight mt-1">Planos Premium Bla Bla Amigos</h3>
                    <p className="text-xs text-gray-400 mt-1">Conquiste o badge verificado, impulsione publicações e tenha estatísticas avançadas.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Basic */}
                    <div 
                      onClick={() => setSelectedPremiumPlan('basic')}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedPremiumPlan === 'basic' ? 'bg-[#7C4DFF]/15 border-[#7C4DFF]' : 'bg-[#0A0A14] border-white/5 hover:border-[#7C4DFF]/50'
                      }`}
                    >
                      <h4 className="font-bold text-xs uppercase tracking-tight text-white mb-1.5">Básico</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Postagens destacadas no feed com 1.5x de alcance.</p>
                      <span className="font-mono text-xs font-bold text-[#7C4DFF]">R$ 9,90/mês</span>
                    </div>

                    {/* Pro */}
                    <div 
                      onClick={() => setSelectedPremiumPlan('pro')}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedPremiumPlan === 'pro' ? 'bg-[#00E5FF]/15 border-[#00E5FF] ring-1 ring-[#00E5FF]/20' : 'bg-[#0A0A14] border-white/5 hover:border-[#00E5FF]/50'
                      }`}
                    >
                      <span className="bg-[#00E5FF] text-[#0A0A14] text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono font-black block mb-2 mx-auto max-w-[60px]">Popular</span>
                      <h4 className="font-bold text-xs uppercase tracking-tight text-white mb-1.5">Profissional</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Selo de Verificado azul + Gráficos estatísticos.</p>
                      <span className="font-mono text-xs font-bold text-[#00E5FF]">R$ 19,90/mês</span>
                    </div>

                    {/* Enterprise */}
                    <div 
                      onClick={() => setSelectedPremiumPlan('enterprise')}
                      className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                        selectedPremiumPlan === 'enterprise' ? 'bg-[#00E676]/15 border-[#00E676]' : 'bg-[#0A0A14] border-white/5 hover:border-[#00E676]/50'
                      }`}
                    >
                      <h4 className="font-bold text-xs uppercase tracking-tight text-white mb-1.5">Empresa</h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Vitrine comercial ilimitada + 4 patrocínios.</p>
                      <span className="font-mono text-xs font-bold text-[#00E676]">R$ 49,90/mês</span>
                    </div>
                  </div>

                  <button
                    onClick={handleUpgradePremium}
                    className="w-full bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 text-white font-black text-xs py-2.5 px-4 rounded-xl mt-4 cursor-pointer shadow-lg tracking-wider"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              )}

              {premiumStep === 'checkout' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-white/10 text-center">
                    <h3 className="font-bold text-white uppercase tracking-wide">Faturamento com Mercado Pago</h3>
                    <p className="text-xs text-gray-400">Pague com segurança de aprovação imediata.</p>
                  </div>

                  <div className="flex justify-between items-center bg-[#0A0A14] p-3 rounded-xl border border-white/5 font-mono text-xs">
                    <span className="text-gray-400">Plano Selecionado:</span>
                    <span className="font-bold text-[#00E5FF] capitalize">{selectedPremiumPlan} Plan</span>
                  </div>

                  {/* Payment systems */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPremiumPayMethod('pix')}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
                        premiumPayMethod === 'pix' ? 'bg-[#0A0A14] border-[#00E5FF] text-[#00E5FF] font-bold' : 'bg-[#121225] border-white/10 text-gray-450 text-gray-400'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-[#00E5FF]" />
                      PIX Seguro
                    </button>
                    <button
                      onClick={() => setPremiumPayMethod('credit')}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
                        premiumPayMethod === 'credit' ? 'bg-[#0A0A14] border-[#7C4DFF] text-[#7C4DFF] font-bold' : 'bg-[#121225] border-white/10 text-gray-450 text-gray-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-[#7C4DFF]" />
                      Cartão de Crédito
                    </button>
                  </div>

                  {premiumPayMethod === 'pix' ? (
                    <div className="bg-[#0A0A14] p-4 rounded-xl text-center space-y-2 border border-white/5">
                      <p className="text-xs font-semibold text-gray-200">Escaneie o QR Code abaixo:</p>
                      <div className="bg-white p-2 rounded-lg w-28 h-28 mx-auto flex items-center justify-center">
                        <div className="grid grid-cols-4 gap-1 w-24 h-24">
                          {Array.from({ length: 16 }).map((_, pixIdx) => (
                            <div 
                              key={pixIdx} 
                              className={`rounded-sm ${
                                (pixIdx * 9) % 4 === 0 || pixIdx % 3 === 0 ? 'bg-slate-950' : 'bg-slate-200'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] font-mono select-all text-[#00E5FF] break-all select-all">
                        pix-faturamento-premium-bla-bla-amigos@MERCADOPAGO325418
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#0A0A14] p-3 rounded-xl border border-white/5 space-y-2 text-xs">
                      <p className="text-gray-200 font-semibold text-center">Digite seus dados bancários salvos:</p>
                      <input type="text" disabled value="4111 2222 3333 4444" className="w-full bg-[#121225] border border-white/10 text-gray-450 text-gray-450 text-center rounded p-2" />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setPremiumStep('plan_pick')}
                      className="flex-1 bg-[#0A0A14] border border-white/10 font-bold py-2.5 rounded-xl uppercase tracking-wider text-gray-400 hover:text-white text-xs cursor-pointer transition-colors"
                    >
                      Voltar Planos
                    </button>
                    <button
                      onClick={completePremiumUpgrade}
                      className="flex-1 bg-gradient-to-r from-[#00E5FF] to-[#00E676] text-[#0A0A14] font-black py-2.5 rounded-xl uppercase tracking-wider text-xs shadow-lg cursor-pointer hover:brightness-110 transition-all"
                    >
                      Aprovar Faturamento
                    </button>
                  </div>
                </div>
              )}

              {premiumStep === 'done' && (
                <div className="text-center py-6 space-y-4">
                  <div className="bg-[#00E676]/10 p-3 rounded-full w-14 h-14 mx-auto border border-[#00E676]/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#00E676]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-white uppercase tracking-wide">Parabéns, Você é Premium!</h3>
                    <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                      Seu selo verificado azul foi adicionado com sucesso! Seus badges conquistados foram atualizados e disponibilizados no feed.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className="bg-[#7C4DFF] hover:brightness-110 text-white font-bold text-xs py-2 px-6 rounded-xl mt-4 cursor-pointer transition-all"
                  >
                    Fechar e Compartilhar!
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingUser && (
          <UserProfileModal
            isOpen={!!viewingUser}
            onClose={() => setViewingUser(null)}
            user={viewingUser}
            currentUser={social.currentUser}
            posts={social.posts}
            users={social.users}
            onToggleReaction={social.toggleReaction}
            onAddComment={social.addComment}
            onStartChat={(uid) => {
              social.startDirectChat(uid);
              setActiveTab('chats');
            }}
            onFriendToggle={social.toggleFriend}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
