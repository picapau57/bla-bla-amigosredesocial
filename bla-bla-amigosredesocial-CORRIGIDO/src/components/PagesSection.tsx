import { useState, FormEvent } from 'react';
import { User, BusinessPage } from '../types';
import { 
  Building2, Plus, Phone, Mail, Globe, Heart, Store, Calendar, 
  MessageCircleOff, MessageSquare, ShoppingBag, PlusCircle, Sparkles, HandCoins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PagesSectionProps {
  currentUser: User;
  pages: BusinessPage[];
  onCreatePage: (inputs: {
    name: string;
    username: string;
    category: string;
    description: string;
    avatar: string;
    cover: string;
    phone: string;
    email: string;
    website: string;
  }) => void;
  onAddProduct: (pageId: string, product: { name: string; description: string; price: number; imageUrl: string }) => void;
  onLikePage: (pageId: string) => void;
}

export default function PagesSection({
  currentUser,
  pages,
  onCreatePage,
  onAddProduct,
  onLikePage
}: PagesSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'create' | 'page_room'>('listings');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pages[0]?.id || null);

  // Corporate wizard states
  const [pName, setPName] = useState('');
  const [pNick, setPNick] = useState('');
  const [pCat, setPCat] = useState('Agência de Publicidade/Marketing');
  const [pDesc, setPDesc] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pMail, setPMail] = useState('');
  const [pWeb, setPWeb] = useState('');

  // Catalog item addition states
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(199.90);
  const [prodImg, setProdImg] = useState('');

  const samplePageAvatars = [
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=200'
  ];

  const handleCreatePage = (e: FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    onCreatePage({
      name: pName,
      username: pNick.replace('@', '').toLowerCase(),
      category: pCat,
      description: pDesc,
      avatar: samplePageAvatars[Math.floor(Math.random() * samplePageAvatars.length)],
      cover: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      phone: pPhone,
      email: pMail,
      website: pWeb
    });

    setPName('');
    setPNick('');
    setPDesc('');
    setActiveSubTab('listings');
    alert(`Parabéns! Sua página comercial '${pName}' foi lançada!`);
  };

  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPageId || !prodName.trim()) return;

    onAddProduct(selectedPageId, {
      name: prodName,
      description: prodDesc,
      price: Number(prodPrice),
      imageUrl: prodImg.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'
    });

    setProdName('');
    setProdDesc('');
    setProdImg('');
    alert(`Produto ${prodName} adicionado ao catálogo!`);
  };

  const activePage = pages.find(p => p.id === selectedPageId);
  const isOwner = activePage?.userId === currentUser.id;

  return (
    <div className="flex-1 space-y-6" id="corporate-pages-console">
      
      {/* SECONDARY ACTION TABBAR */}
      <div className="flex bg-[#121225] border border-white/10 p-1.5 rounded-2xl gap-1.5 shadow-xl">
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'listings'
              ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Explorar Empresas
        </button>
        <button
          onClick={() => {
            if (activePage) {
              setActiveSubTab('page_room');
            } else {
              alert('Nenhuma empresa disponível no momento.');
            }
          }}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'page_room'
              ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {activePage ? `Vitrine: ${activePage.name.split(' ')[0]}` : 'Vitrine Comercial'}
        </button>
        <button
          onClick={() => setActiveSubTab('create')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'create'
              ? 'bg-[#0A0A14] text-[#7C4DFF] border border-[#7C4DFF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#00E5FF]" /> Registrar sua Empresa
        </button>
      </div>

      {activeSubTab === 'listings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="pages-directory-list">
          {pages.map(pa => (
            <div 
              key={pa.id} 
              onClick={() => {
                setSelectedPageId(pa.id);
                setActiveSubTab('page_room');
              }}
              className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-[#7C4DFF]/40 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex gap-3.5 items-center">
                  <img src={pa.avatar} alt={pa.name} className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-white/10 bg-[#0A0A14]" />
                  <div>
                    <h4 className="font-extrabold text-sm text-white uppercase tracking-tight flex items-center gap-1.5 group-hover:text-[#00E5FF] transition-colors">
                      {pa.name}
                    </h4>
                    <p className="text-[10px] text-[#00E5FF] font-mono">@{pa.username} • {pa.category}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 leading-relaxed line-clamp-3 font-sans">
                  {pa.description}
                </p>
              </div>

              <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[11px] font-mono text-gray-500">
                <span>⭐ {pa.likes.length} curtidas comerciais</span>
                <span className="text-[#7C4DFF] group-hover:underline">Ver catálogo ( {pa.catalog.length} produtos ) →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'page_room' && activePage && (
        <div className="space-y-6" id="specific-page-room flex">
          
          {/* Cover & Brand profile */}
          <div className="h-32 rounded-xl bg-cover bg-center relative overflow-hidden animate-fade-in" style={{ backgroundImage: `url(${activePage.cover})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14]/90 to-transparent" />
            <div className="absolute bottom-4 left-4 flex gap-3 items-end">
              <img src={activePage.avatar} alt="avatar" className="w-14 h-14 rounded-xl object-cover border-2 border-[#121225] shrink-0 bg-[#0A0A14]" />
              <div>
                <h4 className="font-extrabold text-sm md:text-base text-white uppercase tracking-wide">{activePage.name}</h4>
                <p className="text-[10px] text-[#7C4DFF] font-mono mt-0.5">{activePage.category} • @{activePage.username}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Contacts & stats info panels */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10 space-y-3.5 text-xs text-gray-300">
                <h5 className="font-bold text-gray-200 uppercase tracking-wider font-mono border-b border-white/5 pb-1.5">Sobre Nós</h5>
                <p className="text-gray-400 leading-relaxed text-[11px] font-sans">
                  {activePage.description}
                </p>

                <div className="space-y-1.5 font-mono text-[10px] text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#7C4DFF]" />
                    <span>{activePage.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#7C4DFF]" />
                    <span className="truncate">{activePage.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <a href={activePage.website} className="text-[#00E5FF] hover:underline shrink-0" target="_blank" rel="noreferrer">{activePage.website}</a>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onLikePage(activePage.id)}
                    className={`w-full py-2 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePage.likes.includes(currentUser.id)
                        ? 'bg-pink-500/10 border border-pink-500/20 text-pink-400'
                        : 'bg-[#121225] hover:bg-[#121225]/80 hover:text-white border border-white/5 text-gray-400'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" /> 
                    {activePage.likes.includes(currentUser.id) ? 'Curtiu Página' : 'Curtir Página'} ( {activePage.likes.length} )
                  </button>
                </div>
              </div>

              {/* Add catalog items only if OWNER */}
              {isOwner && (
                <form onSubmit={handleAddProductSubmit} className="bg-[#0A0A14] p-4 rounded-xl border border-[#FF5722]/20 space-y-3 animate-fade-in-up">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                    <PlusCircle className="w-4 h-4 text-[#FF5722] animate-pulse" />
                    <h5 className="font-bold text-gray-200 uppercase tracking-wider text-[11px] font-mono">Adicionar Novo Produto</h5>
                  </div>
                  
                  <input
                    type="text"
                    required
                    placeholder="Nome do produto"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-[#121225] border border-white/10 text-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#FF5722] font-sans"
                  />
                  <input
                    type="text"
                    placeholder="Descrição do produto"
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-[#121225] border border-white/10 text-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#FF5722] font-sans"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full bg-[#121225] border border-white/10 text-gray-200 rounded-lg p-2 text-xs focus:outline-none font-mono"
                    />
                    <input
                      type="text"
                      placeholder="URL Imagem"
                      value={prodImg}
                      onChange={(e) => setProdImg(e.target.value)}
                      className="w-full bg-[#121225] border border-white/10 text-gray-255 text-gray-400 rounded-lg p-2 text-xs focus:outline-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#FF5722] to-[#FF1744] hover:brightness-110 text-white font-bold text-xs py-2 rounded-lg uppercase font-mono tracking-wider cursor-pointer"
                  >
                    Cadastrar Produto
                  </button>
                </form>
              )}
            </div>

            {/* Display catalog list */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10">
                <h5 className="font-bold text-gray-200 uppercase tracking-wider text-xs font-mono flex items-center gap-1.5 mb-3.5">
                  <ShoppingBag className="w-4 h-4 text-[#7C4DFF]" /> Nosso Catálogo Comercial
                </h5>

                {activePage.catalog.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-500 italic border border-dashed border-white/5 rounded-xl font-serif">
                    Nenhum produto cadastrado no catálogo comercial ainda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activePage.catalog.map(prod => (
                      <div key={prod.id} className="bg-[#121225] border border-white/5 rounded-xl overflow-hidden shadow p-3 flex flex-col justify-between">
                        <div className="relative h-32 rounded-lg overflow-hidden bg-[#0A0A14] mb-3">
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h6 className="font-extrabold text-xs text-white uppercase tracking-tight">{prod.name}</h6>
                          <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                            {prod.description}
                          </p>
                        </div>
                        <div className="border-t border-white/5 pt-2 mt-3 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#FF5722]">R$ {prod.price.toFixed(2)}</span>
                          <button
                            onClick={() => alert(`Solicitação enviada para a empresa! Em breve um consultor da '${activePage.name}' entrará em contato via DMs!`)}
                            className="bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:brightness-110 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg uppercase font-sans tracking-wide active:scale-95 transition-all text-center cursor-pointer"
                          >
                            Pedir Orçamento
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'create' && (
        <form onSubmit={handleCreatePage} className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in-up" id="pages-submission-panel">
          <div className="pb-1 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-widest text-[#7C4DFF] font-mono">
              Registrar sua Empresa / Startup
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Conquiste uma vitrine corporativa exclusiva, lance catálogos de produtos e feche novos orçamentos comerciais!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand page name */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Nome Fantasia da Empresa</label>
              <input
                type="text"
                required
                placeholder="Ex: Inova Agency S.A., Tech Coffee"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 font-sans"
              />
            </div>

            {/* Username hook nickname */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Username Único (@nickname)</label>
              <input
                type="text"
                required
                placeholder="Ex: techcoffee, inovademand"
                value={pNick}
                onChange={(e) => setPNick(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 font-mono text-[#00E5FF]"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Ramo de Atuação / Categoria</label>
            <select
              value={pCat}
              onChange={(e) => setPCat(e.target.value)}
              className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] cursor-pointer text-gray-300 font-sans"
            >
              <option value="Agência de Publicidade/Marketing">Agência de Publicidade / Marketing</option>
              <option value="SaaS/Startup Tecnologia">SaaS / Startup de Tecnologia</option>
              <option value="Comércio/Varejo Loja">Comércio / Varejo Físico</option>
              <option value="Saúde & Bem-Estar">Serviços de Saúde & Bem-Estar</option>
              <option value="Academia/Educação">Academia / Treinamentos / Educação</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Pitch Comercial / Descrição</label>
            <textarea
              required
              maxLength={400}
              placeholder="Descreva de forma persuasiva sua atuação empresarial para se tornar atrativo de investidores ou consumidores."
              value={pDesc}
              onChange={(e) => setPDesc(e.target.value)}
              className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 resize-none min-h-[75px] font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1">Telefone Comercial</label>
              <input
                type="text"
                placeholder="(11) 4004-9876"
                value={pPhone}
                onChange={(e) => setPPhone(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-sans"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1">E-mail de Atendimento</label>
              <input
                type="email"
                placeholder="vendas@loja.com"
                value={pMail}
                onChange={(e) => setPMail(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1">Website Oficial</label>
              <input
                type="url"
                placeholder="https://loja.com"
                value={pWeb}
                onChange={(e) => setPWeb(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-mono text-[#00E5FF]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('listings')}
              className="flex-1 bg-[#0A0A14] border border-white/10 text-xs font-bold py-2.5 rounded-xl uppercase text-gray-400 hover:text-white cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg uppercase tracking-wider cursor-pointer"
            >
              Criar Página Empresarial
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
