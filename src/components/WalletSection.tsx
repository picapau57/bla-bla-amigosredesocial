import React, { useState } from 'react';
import { User, PayoutRequest } from '../types';
import {
  Wallet, DollarSign, ArrowRight, Gift, AlertCircle, CheckCircle2,
  Clock, XCircle, Loader, Radio, Sparkles, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WalletSectionProps {
  currentUser: User;
  payoutRequests: PayoutRequest[];
  onCreatePayoutRequest: (amount: number, destinationDetails: string, userId?: string, userName?: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function WalletSection({
  currentUser,
  payoutRequests,
  onCreatePayoutRequest,
  setActiveTab
}: WalletSectionProps) {
  const [amount, setAmount] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('cpf');
  const [pixKey, setPixKey] = useState<string>('');
  const [holderName, setHolderName] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  
  const balance = currentUser.adCredits ?? 0;
  const MIN_WITHDRAW = 20;

  const myRequests = payoutRequests
    .filter(r => r.userId === currentUser.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < MIN_WITHDRAW) return;
    if (!pixKey.trim() || !holderName.trim()) return;

    const destinationDetails = `PIX (${pixKeyType.toUpperCase()}): ${pixKey.trim()} — Titular: ${holderName.trim()}`;
    onCreatePayoutRequest(amountNum, destinationDetails, currentUser.id, currentUser.fullName);

    setAmount('');
    setPixKey('');
    setHolderName('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const statusMeta: Record<PayoutRequest['status'], { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'Aguardando análise', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-3.5 h-3.5" /> },
    processing: { label: 'Em processamento', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: <Loader className="w-3.5 h-3.5 animate-spin" /> },
    paid: { label: 'Pago', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    rejected: { label: 'Cancelado', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <XCircle className="w-3.5 h-3.5" /> }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="wallet-section-wrapper">

      {/* HEADER / BALANCE */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-500/5 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Minha Carteira</h1>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xl">
                Aqui fica o saldo que você acumula com <strong>presentes recebidos nas suas lives</strong> e indicações.
                Peça o saque para sua chave Pix quando quiser.
              </p>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 shrink-0 text-center w-full md:w-auto">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Saldo Disponível</span>
            <span className="text-2xl font-mono font-black text-emerald-400 block mt-0.5">R$ {balance.toFixed(2)}</span>
            <button
              onClick={() => setActiveTab('lives')}
              className="text-[9px] text-emerald-300 hover:underline font-sans mt-1 flex items-center justify-center gap-1"
            >
              <Radio className="w-3 h-3" /> Fazer uma live agora
            </button>
            <span className="text-[9px] text-gray-600">•</span>
            <button
              onClick={() => setActiveTab('buy_credits')}
                className="text-[9px] text-[#B39DFF] hover:underline font-sans flex items-center justify-center gap-1"
              >
                <CreditCard className="w-3 h-3" /> Comprar créditos
              </button>
            </div>
          </div>
        </div>

      {/* IMPORTANT NOTICE — honest framing for the person, not hidden in fine print */}
      <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 text-xs text-gray-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Este saldo usa a mesma carteira de créditos do programa <strong>Indique &amp; Ganhe</strong>. Enquanto não houver
          um meio de <strong>compra de créditos com dinheiro real</strong> (via Pix/cartão) conectado à plataforma,
          o saldo disponível vem de bônus de indicação e presentes simulados entre usuários da rede — ainda não de
          espectadores externos pagando de verdade.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* WITHDRAW FORM */}
        <div className="lg:col-span-7 bg-[#121225] border border-white/10 rounded-2xl p-5 shadow space-y-4">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Solicitar Saque via Pix
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">
                Valor do Saque (mínimo R$ {MIN_WITHDRAW.toFixed(2)})
              </label>
              <input
                type="number"
                step="0.01"
                min={MIN_WITHDRAW}
                max={balance}
                required
                placeholder="Ex: 50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Tipo de Chave Pix</label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value as typeof pixKeyType)}
                  className="w-full bg-[#0A0A14] border border-white/10 text-gray-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Aleatória</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Chave Pix</label>
                <input
                  type="text"
                  required
                  placeholder="Sua chave Pix"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono mb-1">Nome do Titular da Conta</label>
              <input
                type="text"
                required
                placeholder="Nome completo, igual ao Pix"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              type="submit"
              disabled={balance < MIN_WITHDRAW}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              {balance < MIN_WITHDRAW ? `Saldo mínimo de R$ ${MIN_WITHDRAW.toFixed(2)} não atingido` : 'Solicitar Saque'}
            </button>
          </form>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white">Pedido enviado!</strong>
                  Seu saque entrou na fila de análise do administrador da rede. Acompanhe o status abaixo.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HOW TO EARN MORE */}
        <div className="lg:col-span-5 bg-[#121225] border border-white/10 rounded-2xl p-5 shadow space-y-3">
          <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Como aumentar seu saldo
          </h3>
          <div className="space-y-2.5 text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <Radio className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span>Faça lives e receba presentes (Rosa, Café, Troféu, Diamante) de quem estiver assistindo.</span>
            </div>
            <div className="flex items-start gap-2">
              <Gift className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>Indique amigos pelo programa Indique &amp; Ganhe e receba R$ 50,00 por cadastro.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('referrals')}
            className="text-[#00E5FF] hover:underline font-bold text-xs flex items-center gap-1 pt-1"
          >
            Ver Programa de Indicações <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* WITHDRAWAL HISTORY */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 shadow" id="wallet-history">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-cyan-400" />
          Meus Pedidos de Saque ({myRequests.length})
        </h3>

        {myRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            Você ainda não solicitou nenhum saque.
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto pr-2 no-scrollbar">
            {myRequests.map(req => (
              <div key={req.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white block">R$ {req.amount.toFixed(2)}</span>
                  <span className="text-[10px] text-gray-500 font-mono block">
                    {new Date(req.requestedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  {req.notes && <span className="text-[10px] text-gray-500 block mt-0.5">{req.notes}</span>}
                </div>
                <span className={`text-[10px] font-mono font-extrabold px-2 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1 ${statusMeta[req.status].color}`}>
                  {statusMeta[req.status].icon}
                  {statusMeta[req.status].label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
