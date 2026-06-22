import { useState, FormEvent } from 'react';
import { User, Community } from '../types';
import { PlusCircle, Search, Users, ShieldAlert, BadgeInfo, CheckCircle, Send, Globe, DoorOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GroupsSectionProps {
  currentUser: User;
  users: User[];
  communities: Community[];
  onJoinCommunity: (commId: string) => void;
  onCreateCommunity: (inputs: {
    name: string;
    description: string;
    category: string;
    avatar: string;
    cover: string;
    isPrivate: boolean;
    rules: string[];
  }) => void;
}

export default function GroupsSection({
  currentUser,
  users,
  communities,
  onJoinCommunity,
  onCreateCommunity
}: GroupsSectionProps) {
  const [activeGroupTab, setActiveGroupTab] = useState<'discover' | 'creator' | 'room'>('discover');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(communities[0]?.id || null);

  // Creator state inputs
  const [gName, setGName] = useState('');
  const [gDesc, setGDesc] = useState('');
  const [gCat, setGCat] = useState('Tecnologia');
  const [gPrivate, setGPrivate] = useState(false);
  const [gRules, setGRules] = useState('Respeito fundamental,Proibido spam.');

  // Simulated forum discussion board state
  const [forumPosts, setForumPosts] = useState<{ [groupId: string]: { id: string; authorId: string; content: string; date: string }[] }>({
    'comm-1': [
      { id: 'f1', authorId: 'user-2', content: 'Focando no React 19, o recurso de Server Actions está poupando muito código de fetch boilerplate! Alguém já rodou teste de concorrência?', date: '21:30' },
      { id: 'f2', authorId: 'user-1', content: 'Eu joguei em stress completo sob stress de 5.000 sockets virtuais e rodou rindo. Esse template com Vite e Tailwind v4 é brabo! 🚀🎨', date: '21:38' }
    ],
    'comm-2': [
      { id: 'f3', authorId: 'user-4', content: 'O custo por clique na plataforma bateu R$ 0,15 nas últimas campanhas patrocinadas direcionadas. Retorno ROAS de 4.2x!', date: '18:12' }
    ]
  });

  const [forumInputText, setForumInputText] = useState('');

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=200'
  ];

  const handleCreateGroup = (e: FormEvent) => {
    e.preventDefault();
    if (!gName.trim()) return;

    onCreateCommunity({
      name: gName,
      description: gDesc,
      category: gCat,
      avatar: sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)],
      cover: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
      isPrivate: gPrivate,
      rules: gRules.split(',').map(r => r.trim()).filter(Boolean)
    });

    setGName('');
    setGDesc('');
    setActiveGroupTab('discover');
    alert(`Parabéns! O grupo '${gName}' foi criado.`);
  };

  const handlePostForumMessage = (groupId: string) => {
    if (!forumInputText.trim()) return;

    const newFp = {
      id: `fp-${Date.now()}`,
      authorId: currentUser.id,
      content: forumInputText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setForumPosts(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newFp]
    }));

    setForumInputText('');
  };

  const activeGroup = communities.find(c => c.id === selectedGroupId);
  const isMemberOfActiveGroup = activeGroup?.members.includes(currentUser.id);

  return (
    <div className="flex-1 bg-[#121225] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row gap-5 min-h-[500px]" id="communities-stage">
      
      {/* BARRA LATERAL ESQUERDA: LISTA DE GRUPOS */}
      <div className="w-full md:w-64 border-r border-white/10 pr-0 md:pr-4 space-y-4" id="communities-selector-sidebar">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#00E5FF] font-mono">Comunidades</span>
          <button 
            onClick={() => setActiveGroupTab('creator')}
            title="Criar Comunidade"
            className="text-[#00E5FF] hover:text-white cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Categories choice listing */}
        <div className="flex bg-[#0A0A14] p-1 rounded-xl text-xs gap-1">
          <button 
            onClick={() => setActiveGroupTab('discover')}
            className={`flex-1 py-1.5 font-bold uppercase text-[9px] rounded-lg tracking-wider cursor-pointer ${activeGroupTab === 'discover' ? 'bg-[#121225] text-white' : 'text-gray-400'}`}
          >
            Explorar
          </button>
          <button 
            onClick={() => {
              if (selectedGroupId) {
                const grp = communities.find(c => c.id === selectedGroupId);
                if (grp?.members.includes(currentUser.id)) {
                  setActiveGroupTab('room');
                } else {
                  alert('Entre no grupo primeiro para interagir no fórum interno!');
                }
              } else {
                alert('Selecione um grupo primeiro!');
              }
            }}
            className={`flex-1 py-1.5 font-bold uppercase text-[9px] rounded-lg tracking-wider cursor-pointer ${activeGroupTab === 'room' ? 'bg-[#121225] text-white' : 'text-gray-400'}`}
          >
            Fórum Interno
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {communities.map(c => {
            const isUserInGroup = c.members.includes(currentUser.id);
            const isSelected = c.id === selectedGroupId;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedGroupId(c.id);
                  if (activeGroupTab === 'room' && !isUserInGroup) {
                    setActiveGroupTab('discover');
                  }
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[#0A0A14] to-[#7C4DFF]/15 border-[#00E5FF]/45' 
                    : 'bg-[#0A0A14]/20 hover:bg-[#0A0A14]/60 border-white/5'
                }`}
              >
                <img src={c.avatar} alt={c.name} className="w-8.5 h-8.5 rounded-xl object-cover shrink-0 ring-1 ring-white/10" />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-bold text-slate-100 truncate">{c.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex justify-between">
                    <span>{c.members.length} membros</span>
                    {isUserInGroup && <span className="text-[#00E676] font-semibold">[ Ativo ]</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PAINEL CENTRAL DE CONTEÚDO */}
      <div className="flex-1 min-w-0" id="communities-viewport">
        {activeGroupTab === 'discover' && activeGroup && (
          <div className="space-y-4" id="group-discover-panel">
            {/* Cover and header banner */}
            <div className="h-28 w-full rounded-xl bg-cover bg-center overflow-hidden relative" style={{ backgroundImage: `url(${activeGroup.cover})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14]/90 to-transparent" />
              <div className="absolute bottom-4 left-4 flex gap-3 items-end">
                <img src={activeGroup.avatar} alt="avatar" className="w-12 h-12 rounded-xl object-cover border-2 border-[#121225] bg-[#0A0A14]" />
                <div>
                  <h4 className="font-extrabold text-sm md:text-base text-white uppercase tracking-wide">{activeGroup.name}</h4>
                  <p className="text-[10px] text-[#00E5FF] font-mono mt-0.5 flex items-center gap-1 font-sans">
                    <Globe className="w-3 h-3 text-[#00E5FF]" /> Público • {activeGroup.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Description block */}
            <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10">
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 font-mono">Descrição do Círculo</h5>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">{activeGroup.description}</p>
            </div>

            {/* Rules block */}
            <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10">
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5 text-[#FF5722]">
                <ShieldAlert className="w-4 h-4 text-[#FF5722]" /> Regras Comunitárias
              </h5>
              <ul className="space-y-1.5 text-xs text-gray-400 list-decimal pl-4.5">
                {activeGroup.rules.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex gap-3">
              <button
                onClick={() => onJoinCommunity(activeGroup.id)}
                className={`flex-1 py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                  isMemberOfActiveGroup
                    ? 'bg-red-550/10 hover:bg-red-500 border border-red-500/20 hover:border-transparent text-red-400 hover:text-white'
                    : 'bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-white hover:brightness-110 shadow-lg'
                }`}
              >
                {isMemberOfActiveGroup ? 'Sair da Comunidade' : 'Entrar no Círculo'}
              </button>

              {isMemberOfActiveGroup && (
                <button
                  onClick={() => setActiveGroupTab('room')}
                  className="flex-1 bg-[#0A0A14] hover:bg-[#0A0A14]/85 border border-white/10 text-gray-200 hover:text-white py-3 font-semibold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Entrar no Fórum Interno
                </button>
              )}
            </div>
          </div>
        )}

        {/* FORUM INTERNO PANEL */}
        {activeGroupTab === 'room' && activeGroup && (
          <div className="space-y-4 flex flex-col h-full justify-between" id="group-forum-panel">
            <div className="bg-[#0A0A14]/40 p-3 rounded-xl border border-white/10 flex items-center justify-between animate-fade-in-up">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[#00E5FF] font-mono">Fórum: {activeGroup.name}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Espaço livre de discussão entre os moradores do grupo.</p>
              </div>
              <button 
                onClick={() => setActiveGroupTab('discover')}
                className="text-[10px] text-gray-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <DoorOpen className="w-3.5 h-3.5" /> Voltar Detalhes
              </button>
            </div>

            {/* Discussion feed stage */}
            <div className="space-y-3.5 max-h-80 overflow-y-auto p-2 bg-[#0A0A14]/20 rounded-xl border border-white/5">
              {(() => {
                const fpList = forumPosts[activeGroup.id] || [];
                return fpList.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs italic font-serif">
                    Nenhum tópico de discussão iniciado ainda. Seja o primeiro a propor uma conversa! 🗣️✨
                  </div>
                ) : (
                  fpList.map(msg => {
                    const author = users.find(u => u.id === msg.authorId) || currentUser;
                    return (
                      <div key={msg.id} className="flex gap-2.5 items-start text-xs bg-[#0A0A14] p-3 rounded-xl border border-white/5 shadow-sm">
                        <img src={author.avatar} alt="author" className="w-7.5 h-7.5 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-extrabold text-white flex items-center gap-1">
                              {author.fullName}
                              {author.isVerified && <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] inline shrink-0" />}
                            </span>
                            <span className="text-[9px] text-gray-500 font-mono">{msg.date}</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed font-sans">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                );
              })()}
            </div>

            {/* typing input box */}
            <div className="flex gap-2 bg-[#0A0A14] p-2 rounded-xl border border-white/10">
              <input
                type="text"
                placeholder="Compartilhe seu questionamento com o grupo..."
                value={forumInputText}
                onChange={(e) => setForumInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePostForumMessage(activeGroup.id);
                }}
                className="w-full bg-[#121225] border border-white/5 text-gray-200 text-xs pl-3.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] placeholder-gray-600"
              />
              <button
                onClick={() => handlePostForumMessage(activeGroup.id)}
                className="bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:brightness-110 text-white font-bold p-2.5 rounded-lg shadow cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CREATOR PANEL */}
        {activeGroupTab === 'creator' && (
          <form onSubmit={handleCreateGroup} className="space-y-4 text-slate-200 animate-fade-in-up" id="communities-creation-panel">
            <div className="pb-1 border-b border-white/10">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-widest text-[#00E5FF] font-mono">
                Fundar Nova Comunidade
              </h3>
              <p className="text-[11px] text-gray-500 mt-1">Desenhe novas dinâmicas, defina as regras e reúna pessoas ao redor das suas ideias!</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Nome do Círculo</label>
              <input
                type="text"
                required
                placeholder="Ex: Amantes de Inteligência Artificial, Skate Sampa Crew"
                value={gName}
                onChange={(e) => setGName(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 font-sans"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Objetivo / Descrição</label>
              <textarea
                required
                maxLength={400}
                placeholder="Descreva o propósito para que novos usuários se sintam atraídos a participar."
                value={gDesc}
                onChange={(e) => setGDesc(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 resize-none min-h-[75px] font-sans"
              />
            </div>

            {/* Category / Confidential flag */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Categoria</label>
                <select
                  value={gCat}
                  onChange={(e) => setGCat(e.target.value)}
                  className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none text-gray-300 font-sans cursor-pointer"
                >
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Negócios">Negócios</option>
                  <option value="Estilo de Vida">Estilo de Vida</option>
                  <option value="Saúde/Fitness">Saúde & Fitness</option>
                  <option value="Culinária/Gastronomia">Culinária / Gastronomia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Acesso</label>
                <div className="flex bg-[#0A0A14] rounded-xl border border-white/10 p-1 text-xs justify-around h-10 items-center">
                  <button
                    type="button"
                    onClick={() => setGPrivate(false)}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase rounded-lg cursor-pointer ${!gPrivate ? 'bg-[#121225] text-[#00E676] border border-white/5' : 'text-gray-500'}`}
                  >
                    Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setGPrivate(true)}
                    className={`flex-1 py-1 text-[11px] font-bold uppercase rounded-lg cursor-pointer ${gPrivate ? 'bg-[#121225] text-[#7C4DFF] border border-white/5' : 'text-gray-500'}`}
                  >
                    Privado
                  </button>
                </div>
              </div>
            </div>

            {/* Rules guidelines */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1">Regras (separadas por vírgula)</label>
              <input
                type="text"
                placeholder="Ex: Respeito máximo, Proibido fofocas, Compartilhe códigos úteis"
                value={gRules}
                onChange={(e) => setGRules(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-slate-200 rounded-xl p-2.5 text-xs focus:outline-none font-mono text-gray-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveGroupTab('discover')}
                className="flex-1 bg-[#0A0A14] border border-white/10 text-xs font-bold py-2.5 rounded-xl uppercase text-gray-400 hover:text-white cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg uppercase tracking-wider cursor-pointer"
              >
                Fundar Grupo
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
