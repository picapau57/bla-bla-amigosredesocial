import React, { useState } from 'react';
import { User } from '../types';
import { 
  Gift, Share2, Copy, Check, Users, TrendingUp, HelpCircle, 
  ArrowRight, Sparkles, AlertCircle, Award, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReferralsSectionProps {
  currentUser: User;
  users: User[];
  onSimulateReferral: (friendName: string, friendEmail: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function ReferralsSection({
  currentUser,
  users,
  onSimulateReferral,
  setActiveTab
}: ReferralsSectionProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [friendName, setFriendName] = useState<string>('');
  const [friendEmail, setFriendEmail] = useState<string>('');
  const [showSimSuccess, setShowSimSuccess] = useState<boolean>(false);
  const [lastReferredName, setLastReferredName] = useState<string>('');

  const referralLink = `https://blablaamigos.com/join?ref=${currentUser.inviteCode || 'BBA-' + currentUser.id.slice(-4)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim() || !friendEmail.trim()) return;

    onSimulateReferral(friendName.trim(), friendEmail.trim());
    setLastReferredName(friendName.trim());
    setFriendName('');
    setFriendEmail('');
    setShowSimSuccess(true);
    setTimeout(() => {
      setShowSimSuccess(false);
    }, 4000);
  };

  // Find users referred by current user based on referredUsers ids list
  const referredList = users.filter(u => currentUser.referredUsers?.includes(u.id));

  return (
    <div className="space-y-6 animate-fade-in" id="referrals-section-wrapper">
      
      {/* 1. HEADER HERO */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="referrals-header">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-rose-500/5 to-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/10 shrink-0">
              <Gift className="w-7 h-7 text-white animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                Programa Indique & Ganhe BBA
                <span className="text-[10px] bg-rose-500/15 text-rose-400 font-mono px-2 py-0.5 rounded-full font-bold border border-rose-500/20 uppercase tracking-widest animate-pulse">
                  Campanha Viral
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xl">
                Ajude o <strong>Bla Bla Amigos</strong> a decolar! Convide seus contatos para criar contas. 
                Cada indicação válida rende <strong>R$ 50,00 em créditos de anúncio</strong> para você e <strong>R$ 25,00</strong> para seu amigo indicado!
              </p>
            </div>
          </div>
          
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 shrink-0 text-center w-full md:w-auto">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Seu Saldo de Anúncios</span>
            <span className="text-2xl font-mono font-black text-rose-400 block mt-0.5">
              R$ {(currentUser.adCredits !== undefined ? currentUser.adCredits : 100).toFixed(2)}
            </span>
            <span className="text-[9px] text-rose-300 block font-sans mt-0.5">Moeda de anúncio patrocinado</span>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="referrals-stats">
        
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-mono block">Indicados Cadastrados</span>
            <span className="text-xl font-mono font-bold text-white mt-0.5">{referredList.length} usuários</span>
          </div>
        </div>

        <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-mono block">Créditos Acumulados</span>
            <span className="text-xl font-mono font-bold text-white mt-0.5">R$ {(referredList.length * 50 + 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-mono block">Alcançar Clientes</span>
            <span className="text-xl font-mono font-bold text-white mt-0.5">Até {(referredList.length * 300 + 500)} cliques</span>
          </div>
        </div>

      </div>

      {/* 3. SHARE INVITE LINK & SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="referrals-interactivity">
        
        {/* LEFT COLUMN: LINKS AND CODES */}
        <div className="lg:col-span-7 bg-[#121225] border border-white/10 rounded-2xl p-5 shadow space-y-5">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-rose-400" />
            1. Compartilhe seu Link de Convite
          </h3>

          <p className="text-xs text-gray-400 leading-relaxed">
            Compartilhe seu link exclusivo nas suas redes, grupos ou fóruns. Qualquer pessoa que criar conta a partir dele será vinculada à sua carteira:
          </p>

          <div className="space-y-3">
            <div className="bg-[#0A0A14] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
              <span className="text-xs text-[#00E5FF] font-mono select-all truncate">{referralLink}</span>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copied 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-white text-slate-900 hover:bg-white/90 shadow'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-[10px] text-gray-500 uppercase font-mono">Compartilhar direto:</span>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Me juntei ao Bla Bla Amigos! Use meu link para criar sua conta grátis e ganhe R$ 25,00 em créditos de anúncios para divulgar o que quiser! ' + referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Crie conta grátis no Bla Bla Amigos e ganhe R$ 25,00 em créditos!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                Telegram
              </a>
            </div>
          </div>

          <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-xs text-gray-400 space-y-2 mt-4">
            <h4 className="font-bold text-white flex items-center gap-1.5 text-rose-400">
              <Sparkles className="w-3.5 h-3.5" />
              Como gastar seus créditos?
            </h4>
            <p className="leading-relaxed">
              Vá para a seção de <strong>Marketplace & Propagandas</strong>, crie um anúncio de tipo "Campanha Patrocinada" e no momento de pagar selecione a opção <strong>"Pagar com Saldo de Créditos BBA"</strong>. O sistema ativará seu anúncio instantaneamente!
            </p>
            <button
              onClick={() => setActiveTab('ads')}
              className="text-[#00E5FF] hover:underline font-bold text-xs flex items-center gap-1 pt-1"
            >
              Ir Criar um Anúncio Agora <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATOR (Drives user testing and excitement!) */}
        <div className="lg:col-span-5 bg-[#121225] border border-white/10 rounded-2xl p-5 shadow space-y-4">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            2. Simulador de Indicação Ativa
          </h3>

          <p className="text-xs text-gray-400 leading-relaxed">
            Quer ver como a engrenagem funciona? Simule o cadastro de um amigo usando seu link de convite para ver o saldo crescer no banco de dados!
          </p>

          <form onSubmit={handleSimulateSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Nome do Amigo</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">E-mail do Amigo</label>
              <input
                type="email"
                required
                placeholder="Ex: joao@gmail.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/20 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-500/95 hover:to-purple-600/95 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Simular Cadastro e Ganhar R$ 50
            </button>
          </form>

          {/* SIMULATION SUCCESS ALERT */}
          <AnimatePresence>
            {showSimSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs text-emerald-400"
              >
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Sucesso na Simulação!</strong>
                  O amigo <strong>{lastReferredName}</strong> completou o cadastro via seu link! 
                  R$ 50,00 de saldo foram depositados na sua carteira de anúncios de forma persistente no banco de dados.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* 4. SUCCESSFUL REFERRALS LIST */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow" id="referrals-list">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-purple-400" />
          Seus Amigos Indicados ({referredList.length})
        </h3>

        {referredList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            Nenhuma indicação realizada ainda. Comece compartilhando seu link ou simulando uma indicação no painel acima!
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto pr-2 no-scrollbar">
            {referredList.map((refUser) => (
              <div key={refUser.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    <img src={refUser.avatar} alt={refUser.fullName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{refUser.fullName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">@{refUser.username}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">+ R$ 50,00</span>
                  <span className="text-[9px] text-gray-500 block font-mono">Conta Ativada</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
