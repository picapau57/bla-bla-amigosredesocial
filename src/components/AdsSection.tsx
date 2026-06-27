import { useState, FormEvent } from 'react';
import { User, Ad } from '../types';
import { 
  Megaphone, Plus, PlusCircle, CheckCircle, Smartphone, CreditCard, 
  FileText, ShoppingBag, Eye, MousePointerClick, TrendingUp, BarChart2,
  DollarSign, Sparkles, ShieldCheck, QrCode, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdsSectionProps {
  currentUser: User;
  ads: Ad[];
  onPurchaseAd: (adInputs: {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
    type: 'gratis' | 'patrocinado';
    position: 'lateral-top' | 'lateral-bottom' | 'feed' | 'profile' | 'home';
    plan?: 'diario' | 'semanal' | 'mensal' | 'trimestral';
    price?: number;
    paymentMethod?: 'pix' | 'credit_card' | 'boleto';
  }) => Ad;
  onUpdateAd: (adId: string, adInputs: {
    title: string;
    description: string;
    imageUrl: string;
    link: string;
    type: 'gratis' | 'patrocinado';
    position: 'lateral-top' | 'lateral-bottom' | 'feed' | 'profile' | 'home' | 'game-spot-1' | 'game-spot-2' | 'game-spot-3';
    plan?: 'diario' | 'semanal' | 'mensal' | 'trimestral';
    price?: number;
    paymentMethod?: 'pix' | 'credit_card' | 'boleto';
  }) => void;
  onApproveAd: (adId: string) => void;
}

export default function AdsSection({
  currentUser,
  ads,
  onPurchaseAd,
  onUpdateAd,
  onApproveAd
}: AdsSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'listings' | 'create' | 'analytics'>('listings');
  
  // Edit mode state
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Create state inputs for new Ad
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adLink, setAdLink] = useState('');
  const [adImg, setAdImg] = useState('');
  const [adType, setAdType] = useState<'gratis' | 'patrocinado'>('gratis');
  
  // Placement & Pricing
  const [placement, setPlacement] = useState<'lateral-top' | 'lateral-bottom' | 'feed' | 'profile' | 'home'>('feed');
  const [planPeriod, setPlanPeriod] = useState<'diario' | 'semanal' | 'mensal' | 'trimestral'>('diario');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');

  const startEditing = (ad: Ad) => {
    setEditingAdId(ad.id);
    setAdTitle(ad.title);
    setAdDesc(ad.description);
    setAdLink(ad.link);
    setAdImg(ad.imageUrl);
    setAdType(ad.type);
    setPlacement(ad.position as any);
    if (ad.plan) setPlanPeriod(ad.plan);
    if (ad.paymentMethod) setPaymentMethod(ad.paymentMethod);
    setActiveSubTab('create');
  };

  // Checkout phase
  const [pendingAd, setPendingAd] = useState<Ad | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'pay_method' | 'simulated_processing' | 'done'>('none');

  // Suggested high resolution marketplace images
  const sampleProductImgs = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400'
  ];

  // Calculate pricing tier based on choice
  const planPrices = {
    diario: 25.00,
    semanal: 150.00,
    mensal: 350.00,
    trimestral: 800.00
  };

  const handleNextStep = (e: FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adLink.trim()) return;

    const chosenPrice = adType === 'patrocinado' ? planPrices[planPeriod] : undefined;
    const finalImageUrl = adImg.trim() || sampleProductImgs[0];

    const adTemplate = {
      title: adTitle,
      description: adDesc,
      imageUrl: finalImageUrl,
      link: adLink,
      type: adType,
      position: placement,
      plan: adType === 'patrocinado' ? planPeriod : undefined,
      price: chosenPrice,
      paymentMethod: adType === 'patrocinado' ? paymentMethod : undefined
    };

    if (editingAdId) {
      onUpdateAd(editingAdId, adTemplate);
      resetForm();
      setActiveSubTab('listings');
      alert('Parabéns! Seu anúncio foi atualizado com sucesso!');
      return;
    }

    const registered = onPurchaseAd(adTemplate);

    if (adType === 'patrocinado') {
      setPendingAd(registered);
      setCheckoutStep('pay_method');
    } else {
      // Free ad goes direct to listings
      resetForm();
      setActiveSubTab('listings');
      alert('Parabéns! Seu anúncio gratuito de classificados foi publicado com sucesso!');
    }
  };

  const executeCheckoutSimulation = () => {
    setIsProcessingCheckout(true);
    setCheckoutStep('simulated_processing');
    
    setTimeout(() => {
      if (pendingAd) {
        onApproveAd(pendingAd.id);
      }
      setIsProcessingCheckout(false);
      setCheckoutStep('done');
    }, 2500); // 2.5 seconds payment gateway loading
  };

  const resetForm = () => {
    setAdTitle('');
    setAdDesc('');
    setAdLink('');
    setAdImg('');
    setAdType('gratis');
    setPendingAd(null);
    setCheckoutStep('none');
    setEditingAdId(null);
  };

  // User's own ads catalog for metrics monitoring
  const myCampaigns = ads.filter(a => a.userId === currentUser.id);

  return (
    <div className="flex-1 space-y-6 animate-fade-in-up" id="ads-system-dashboard">
      
      {/* SECTION TABS FOR SECONDARY NAVIGATION */}
      <div className="flex bg-[#121225] border border-white/10 p-1.5 rounded-2xl gap-1.5 shadow-xl">
        <button
          onClick={() => setActiveSubTab('listings')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'listings'
              ? 'bg-[#0A0A14] text-[#FF5722] border border-[#FF5722]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ver Classificados e Anúncios
        </button>
        <button
          onClick={() => setActiveSubTab('create')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'create'
              ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Criar Novo Anúncio
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'analytics'
              ? 'bg-[#0A0A14] text-[#7C4DFF] border border-[#7C4DFF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-[#7C4DFF]" />
          Seu Gerenciador (Métricas)
        </button>
      </div>

      {/* VIEWPORT CONTROLLER */}
      {activeSubTab === 'listings' && (
        <div className="space-y-6" id="ads-listings-view">
          
          {/* Header intro info */}
          <div className="bg-[#121225] border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-tight">Marketplace & Oportunidades</h3>
              <p className="text-xs text-gray-400 mt-1">
                Conheça os produtos e serviços que seus amigos estão recomendando e divulgando hoje!
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('create')}
              className="bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:brightness-110 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-center transition-all uppercase tracking-wider cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" /> Vender / Anunciar
            </button>
          </div>

          {/* Active catalog grid (gratis + patrocinadus) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ads.map(ad => (
              <div 
                key={ad.id} 
                className={`bg-[#121225] border overflow-hidden rounded-2xl shadow-lg flex flex-col group ${
                  ad.status === 'active' && ad.type === 'patrocinado' ? 'border-[#FF5722]/30 ring-1 ring-[#FF5722]/20' : 'border-white/5'
                }`}
              >
                {/* Photo container */}
                <div className="relative h-44 bg-[#0A0A14]">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  
                  {/* Absolute Badge */}
                  <span className={`absolute top-3 right-3 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-md ${
                    ad.type === 'patrocinado'
                      ? 'bg-[#FF5722] border-[#FF5722]/35 text-white'
                      : 'bg-[#121225] border-white/10 text-[#00E5FF]'
                  }`}>
                    {ad.type === 'patrocinado' ? '🔥 Patrocinado' : '🛍️ Classificado'}
                  </span>
                </div>

                {/* Info block */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-white group-hover:text-[#FF5722] transition-colors uppercase tracking-tight">
                      {ad.title}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed line-clamp-3">
                      {ad.description}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between gap-2">
                    <div>
                      {ad.price ? (
                        <div className="text-sm font-extrabold text-[#FF5722] font-mono">
                          R$ {ad.price.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-[10px] bg-[#0A0A14] text-[#00E676] border border-[#00E676]/30 px-2 py-0.5 rounded font-mono uppercase font-bold">
                          Gratuito / Negociável
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(ad.userId === currentUser.id || currentUser.id === 'admin') && (
                        <button
                          onClick={() => startEditing(ad)}
                          className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white font-extrabold text-xs py-1.5 px-3 rounded-lg border border-white/5 hover:border-transparent transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Editar
                        </button>
                      )}
                      <a
                        href={ad.link}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#7C4DFF]/10 hover:bg-[#7C4DFF] text-[#00E5FF] hover:text-white font-extrabold text-xs py-1.5 px-3 rounded-lg border border-white/10 hover:border-transparent transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>Acessar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {activeSubTab === 'create' && (
        <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl" id="ads-create-wizard-view">
          
          <AnimatePresence mode="wait">
            {checkoutStep === 'none' && (
              <motion.form
                key="form-entry"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleNextStep}
                className="space-y-4 text-slate-200"
              >
                <div className="pb-2 border-b border-white/10">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-widest text-[#00E5FF] font-mono">
                    {editingAdId ? 'Editar Anúncio' : 'Cadastrar Novo Anúncio'}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {editingAdId 
                      ? 'Atualize as informações do seu anúncio para manter seus clientes e leads atualizados.' 
                      : 'Publique classificados gratuitos ou monte uma campanha patrocinada para alcançar mais potenciais clientes!'
                    }
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Título do Anúncio</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ex: Caneca do Programador, Consultoria Integrada, Hamburgueria Bairro"
                    value={adTitle}
                    onChange={(e) => setAdTitle(e.target.value)}
                    className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Descrição Curta</label>
                  <textarea
                    required
                    maxLength={140}
                    placeholder="Resuma em poucas palavras o seu produto, serviço ou oportunidade comercial."
                    value={adDesc}
                    onChange={(e) => setAdDesc(e.target.value)}
                    className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 resize-none min-h-[70px]"
                  />
                </div>

                {/* Redirect Link */}
                <div>
                  <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Link de Redirecionamento (WhatsApp, Landing Page)</label>
                  <input
                    type="url"
                    required
                    placeholder="Ex: https://wa.me/5511999999999 ou https://sualoja.com"
                    value={adLink}
                    onChange={(e) => setAdLink(e.target.value)}
                    className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 font-mono text-[#00E5FF]"
                  />
                </div>

                {/* Image URL with suggestions */}
                <div>
                  <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">URL da Imagem Ilustrativa</label>
                  <input
                    type="text"
                    placeholder="Ex: Insira URL de imagem ou selecione sugestões abaixo"
                    value={adImg}
                    onChange={(e) => setAdImg(e.target.value)}
                    className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 font-mono text-gray-400"
                  />
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-[10px] text-gray-500 font-mono">Sugestão:</span>
                    {sampleProductImgs.map((preset, pridx) => (
                      <button
                        key={pridx}
                        type="button"
                        onClick={() => setAdImg(preset)}
                        className={`w-10 h-10 rounded-lg overflow-hidden border cursor-pointer ${
                          adImg === preset ? 'border-[#00E5FF] opacity-100 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category choice: Gratis Classificado vs Patrocinadora */}
                <div className="grid grid-cols-2 gap-3.5 bg-[#0A0A14] p-2 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setAdType('gratis')}
                    className={`p-3 rounded-lg text-xs font-bold uppercase transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                      adType === 'gratis'
                        ? 'bg-[#121225] border border-white/5 text-[#7C4DFF] shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-[#7C4DFF]" />
                    Classificado Gratuito
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdType('patrocinado')}
                    className={`p-3 rounded-lg text-xs font-bold uppercase transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                      adType === 'patrocinado'
                        ? 'bg-[#121225] border border-[#FF5722]/40 text-[#FF5722] shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#FF5722] animate-pulse" />
                    Campanha Patrocinada
                  </button>
                </div>

                {/* Expandable fields for SPONSOR CAMPAIGNS ONLY */}
                <AnimatePresence>
                  {adType === 'patrocinado' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 bg-[#0A0A14] p-4 rounded-xl border border-white/10 mt-2"
                    >
                      {/* Placement position */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase font-mono text-gray-400 mb-1">Deseja exibir onde?</label>
                        <select
                          value={placement}
                          onChange={(e) => setPlacement(e.target.value as any)}
                          className="w-full bg-[#121225] border border-white/10 text-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722]/20"
                        >
                          <option value="feed">Feed Principal de Notícias</option>
                          <option value="lateral-top">Lateral Direita Superior (Maior Visibilidade)</option>
                          <option value="lateral-bottom">Lateral Direita Inferior</option>
                          <option value="profile">Perfil dos Usuários</option>
                        </select>
                      </div>

                      {/* Pricing Select Plan */}
                      <div>
                        <label className="block text-[10px] font-semibold uppercase font-mono text-gray-400 mb-1">Escolha o Período e Valor</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(planPrices).map(([period, price]) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setPlanPeriod(period as any)}
                              className={`p-2.5 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                                planPeriod === period
                                  ? 'bg-[#FF5722]/10 border-[#FF5722] text-[#FF5722] font-bold'
                                  : 'bg-[#121225] border-white/10 text-gray-400 hover:text-white'
                              }`}
                            >
                              <span className="capitalize">{period}</span>
                              <span className="font-mono">R$ {price}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 flex gap-3">
                  {editingAdId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveSubTab('listings');
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 font-extrabold text-xs py-3 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all uppercase tracking-wider cursor-pointer"
                  >
                    {editingAdId 
                      ? 'Salvar Alterações' 
                      : (adType === 'patrocinado' ? 'Continuar para Pagamento' : 'Publicar nos Classificados')
                    }
                  </button>
                </div>

              </motion.form>
            )}

            {/* CHECKOUT SIMULATION PHASE */}
            {checkoutStep === 'pay_method' && pendingAd && (
              <motion.div
                key="pay-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5 text-slate-200"
              >
                <div className="pb-2 border-b border-white/10">
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-widest text-[#FF5722] font-mono">
                    Checkout Integrador de Pagamento
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">Ambiente integrado de faturamento. Escolha seu método e conclua seu patrocínio!</p>
                </div>

                <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/5 text-xs">
                  <div className="flex justify-between font-mono mb-1.5 text-gray-400">
                    <span>Anúncio:</span>
                    <span className="text-white font-semibold">{pendingAd.title}</span>
                  </div>
                  <div className="flex justify-between font-mono mb-1.5 text-gray-400">
                    <span>Posição:</span>
                    <span className="capitalize text-white font-semibold">{pendingAd.position}</span>
                  </div>
                  <div className="flex justify-between font-mono mb-1.5 text-gray-400">
                    <span>Duração:</span>
                    <span className="capitalize text-white font-semibold">{pendingAd.plan}</span>
                  </div>
                  <div className="border-t border-white/5 my-2 pt-2 flex justify-between font-mono text-sm">
                    <span className="text-[#FF5722] font-bold">Total a pagar:</span>
                    <span className="text-[#FF5722] font-extrabold">R$ {pendingAd.price?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pay systems selects */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
                      paymentMethod === 'pix'
                        ? 'bg-[#0A0A14] border-[#00E5FF] text-[#00E5FF] font-bold'
                        : 'bg-[#121225] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-[#00E5FF]" />
                    PIX / QrCode
                  </button>
                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'bg-[#0A0A14] border-[#7C4DFF] text-[#7C4DFF] font-bold'
                        : 'bg-[#121225] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#7C4DFF]" />
                    Cartão de Crédito
                  </button>
                  <button
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all text-xs cursor-pointer ${
                      paymentMethod === 'boleto'
                        ? 'bg-[#0A0A14] border-[#FF5722] text-[#FF5722] font-bold'
                        : 'bg-[#121225] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-[#FF5722]" />
                    Boleto Bancário
                  </button>
                </div>

                {/* Sub display based on chosen mechanism */}
                <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/5 text-xs leading-relaxed text-gray-400">
                  {paymentMethod === 'pix' && (
                    <div className="text-center space-y-3">
                      <p className="font-semibold text-gray-200">Aprovação instantânea via PIX do Mercado Pago!</p>
                      <div className="bg-white p-2 rounded-lg w-28 h-28 mx-auto flex items-center justify-center">
                        {/* Generates a nice mock pixelated visual representing pixel blocks */}
                        <div className="grid grid-cols-4 gap-1 w-24 h-24">
                          {Array.from({ length: 16 }).map((_, pixIdx) => (
                            <div 
                              key={pixIdx} 
                              className={`rounded-sm ${
                                (pixIdx * 7) % 3 === 0 || pixIdx % 5 === 0 ? 'bg-slate-950' : 'bg-slate-200'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] font-mono text-[#00E5FF] break-all select-all">
                        00020126360014BR.GOV.BCB.PIX0114picapauinfo@MP98754125
                      </p>
                      <button 
                        onClick={() => alert('Copiado com sucesso!')}
                        className="text-[10px] text-gray-500 hover:underline inline-block font-mono cursor-pointer"
                      >
                        [ Copiar Linha Digitável ]
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-3">
                      <p className="font-semibold text-gray-200 text-center">Processar pagamento do Cartão de Crédito</p>
                      <div className="space-y-2 max-w-xs mx-auto">
                        <input
                          type="text"
                          disabled
                          value="4111 2222 3333 4444"
                          className="w-full bg-[#121225] text-white rounded p-1.5 text-center font-mono text-xs border border-white/10"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            disabled
                            value="12/29"
                            className="w-full bg-[#121225] text-white rounded p-1.5 text-center font-mono text-xs border border-white/10"
                          />
                          <input
                            type="text"
                            disabled
                            value="888"
                            className="w-full bg-[#121225] text-white rounded p-1.5 text-center font-mono text-xs border border-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'boleto' && (
                    <div className="text-center space-y-2">
                      <p className="font-semibold text-gray-200">Gerar Boleto Banco do Brasil homologado</p>
                      <p className="text-[10px] font-mono break-all select-all text-gray-300">
                        34191.79001 01043.513184 91020.150008 7 98150000035000
                      </p>
                      <p className="text-[9px] text-gray-500">Compensação em até 48 horas úteis.</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 bg-[#0A0A14] border border-white/10 text-gray-450 font-bold text-xs py-3 rounded-xl hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeCheckoutSimulation}
                    className="flex-1 bg-gradient-to-r from-[#00E5FF] to-[#00E676] text-[#0A0A14] font-black text-xs py-3 rounded-xl shadow-lg transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Simular Pagamento
                  </button>
                </div>
              </motion.div>
            )}

            {checkoutStep === 'simulated_processing' && (
              <motion.div
                key="processing-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="font-bold text-sm text-gray-200">Autenticando transação financeira...</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto font-mono">Processando transação SSL segura através da API do Mercado Pago...</p>
              </motion.div>
            )}

            {checkoutStep === 'done' && pendingAd && (
              <motion.div
                key="done-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center space-y-4 text-slate-200"
              >
                <div className="bg-[#00E676]/10 p-3 rounded-full w-14 h-14 mx-auto border border-[#00E676]/30 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-[#00E676]" />
                </div>
                <div>
                   <h4 className="font-extrabold text-base text-white uppercase tracking-tight">Pagamento Aprovado!</h4>
                  <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                    Sua campanha foi homologada com sucesso! O anúncio '{pendingAd.title}' agora está ATIVO na rede e exibindo métricas analíticas.
                  </p>
                </div>
                <div className="pt-4 flex gap-3 max-w-xs mx-auto">
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveSubTab('listings');
                    }}
                    className="flex-1 bg-[#0A0A14] border border-white/10 text-xs text-gray-400 font-bold py-2.5 rounded-xl hover:text-white cursor-pointer"
                  >
                    Ver Classificados
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveSubTab('analytics');
                    }}
                    className="flex-1 bg-[#FF5722] hover:brightness-110 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                  >
                    Ver Métricas
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="space-y-6" id="ads-analytics-view">
          
          <div className="bg-[#121225] border border-white/10 p-5 rounded-2xl shadow-xl animate-fade-in-up">
            <div className="flex gap-2.5 items-center mb-1.5">
              <TrendingUp className="w-5 h-5 text-[#7C4DFF]" />
              <h3 className="font-extrabold text-sm text-white uppercase tracking-tight font-sans">Gerenciador de Campanhas do Usuário</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Monitore a conversão, cliques, impressões e o índice de CTR (Click-Through Rate) de cada uma das suas divulgações pagas e gratuitas registradas.
            </p>
          </div>

          {/* Cards for aggregation totals */}
          <div className="grid grid-cols-3 gap-3.5">
            <div className="bg-[#121225] border border-white/5 p-4 rounded-xl text-center shadow">
              <div className="text-lg font-mono font-extrabold text-white">
                {myCampaigns.reduce((sum, c) => sum + c.impressions, 0)}
              </div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-gray-500 mt-1">Impressões</div>
            </div>
            <div className="bg-[#121225] border border-white/5 p-4 rounded-xl text-center shadow">
              <div className="text-lg font-mono font-extrabold text-[#00E5FF]">
                {myCampaigns.reduce((sum, c) => sum + c.clicks, 0)}
              </div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-gray-500 mt-1">Cliques Reais</div>
            </div>
            <div className="bg-[#121225] border border-white/5 p-4 rounded-xl text-center shadow">
              <div className="text-lg font-mono font-extrabold text-[#FF5722]">
                {myCampaigns.length > 0 
                  ? ((myCampaigns.reduce((sum, c) => sum + c.clicks, 0) / (myCampaigns.reduce((sum, c) => sum + c.impressions, 0) || 1)) * 100).toFixed(2) 
                  : '0.00'}%
              </div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-gray-500 mt-1">Média CTR</div>
            </div>
          </div>

          {/* Individual campaign lists details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Sua Lista de Campanhas</h4>
            
            {myCampaigns.length === 0 ? (
              <div className="bg-[#121225] border border-white/5 p-8 rounded-xl text-center text-xs text-gray-500">
                Você não possui nenhum anúncio cadastrado ainda.
              </div>
            ) : (
              myCampaigns.map(c => {
                const ctr = ((c.clicks / (c.impressions || 1)) * 100).toFixed(2);
                return (
                  <div key={c.id} className="bg-[#121225] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex gap-3 items-center min-w-0">
                      <img src={c.imageUrl} alt="thumbnail" className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#0A0A14]" />
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-white truncate flex items-center gap-1.5 uppercase tracking-tight">
                          {c.title}
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${
                            c.status === 'active' 
                              ? 'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20' 
                              : 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                          }`}>
                            {c.status}
                          </span>
                        </h5>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono capitalize">Preço/Período: {c.price ? `R$ ${c.price} (${c.plan})` : 'Classificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono">
                      <div className="flex gap-4 sm:text-right shrink-0">
                        <div className="px-3 border-r border-white/5">
                          <div className="text-xs font-bold text-gray-300">{c.impressions}</div>
                          <div className="text-[9px] text-gray-500 font-sans uppercase">Views</div>
                        </div>
                        <div className="px-3 border-r border-white/5">
                          <div className="text-xs font-bold text-[#00E5FF]">{c.clicks}</div>
                          <div className="text-[9px] text-gray-500 font-sans uppercase">Clicks</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#FF5722]">{ctr}%</div>
                          <div className="text-[9px] text-gray-500 font-sans uppercase">CTR</div>
                        </div>
                      </div>
                      <button
                        onClick={() => startEditing(c)}
                        className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white font-extrabold text-[10px] py-1 px-2.5 rounded-lg border border-white/5 hover:border-transparent transition-all cursor-pointer uppercase tracking-tight"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}
