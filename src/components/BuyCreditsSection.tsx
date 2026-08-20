import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  CreditCard, Wallet, Sparkles, ShieldCheck, Loader, ExternalLink,
  CheckCircle2, XCircle, Clock3
} from 'lucide-react';

interface CreditPackage {
  id: string;
  amount: number;
  label: string;
  highlight?: boolean;
}

const PACKAGES: CreditPackage[] = [
  { id: 'pkg_10', amount: 10, label: 'Começar' },
  { id: 'pkg_25', amount: 25, label: 'Popular', highlight: true },
  { id: 'pkg_50', amount: 50, label: 'Vantajoso' },
  { id: 'pkg_100', amount: 100, label: 'Turbo' },
];

interface BuyCreditsSectionProps {
  currentUser: User;
  setActiveTab: (tab: string) => void;
}

export default function BuyCreditsSection({ currentUser, setActiveTab }: BuyCreditsSectionProps) {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failure' | null>(null);

  const balance = currentUser.adCredits !== undefined ? currentUser.adCredits : 100;

  // Detect the ?wallet_payment=... redirect coming back from Mercado Pago's checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('wallet_payment');
    if (status === 'success' || status === 'pending' || status === 'failure') {
      setPaymentStatus(status);
      // Clean the URL so refreshing the page doesn't re-trigger the banner
      params.delete('wallet_payment');
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleBuy = async (pkg: CreditPackage) => {
    setError(null);
    setLoadingPackage(pkg.id);
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, packageId: pkg.id }),
      });
      const data = await res.json();
      if (!data.success || !data.checkoutUrl) {
        throw new Error(data.error || 'Não foi possível iniciar o pagamento.');
      }
      // Send the user to Mercado Pago's secure checkout page
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setError(e.message || 'Erro ao iniciar o pagamento. Tente novamente em instantes.');
      setLoadingPackage(null);
    }
  };

  const statusBanner = {
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      text: 'Pagamento aprovado! Seus créditos já devem estar disponíveis na Carteira em instantes.',
    },
    pending: {
      icon: <Clock3 className="w-4 h-4 text-amber-400" />,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      text: 'Pagamento em análise (comum no Pix ou boleto). Assim que for aprovado, os créditos entram automaticamente.',
    },
    failure: {
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      color: 'bg-red-500/10 border-red-500/20 text-red-300',
      text: 'O pagamento não foi concluído. Nenhum valor foi cobrado — pode tentar novamente quando quiser.',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in" id="buy-credits-section-wrapper">

      {/* HEADER */}
      <div className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#7C4DFF]/10 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C4DFF] via-indigo-600 to-cyan-600 flex items-center justify-center shadow-lg shrink-0">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Comprar Créditos</h1>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xl">
                Pague com <strong>Pix ou cartão de crédito</strong> pelo Mercado Pago. O valor cai direto
                no seu saldo da Carteira, pronto para usar em presentes de live ou anúncios.
              </p>
            </div>
          </div>

          <div className="bg-[#7C4DFF]/10 border border-[#7C4DFF]/20 rounded-2xl p-4 shrink-0 text-center w-full md:w-auto">
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider block">Saldo Atual</span>
            <span className="text-2xl font-mono font-black text-[#B39DFF] block mt-0.5">R$ {balance.toFixed(2)}</span>
            <button
              onClick={() => setActiveTab('wallet')}
              className="text-[9px] text-[#B39DFF] hover:underline font-sans mt-1 flex items-center justify-center gap-1"
            >
              <Wallet className="w-3 h-3" /> Ver Minha Carteira
            </button>
          </div>
        </div>
      </div>

      {/* PAYMENT STATUS BANNER (after returning from checkout) */}
      {paymentStatus && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-2.5 ${statusBanner[paymentStatus].color}`}>
          {statusBanner[paymentStatus].icon}
          <p className="leading-relaxed">{statusBanner[paymentStatus].text}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* PACKAGES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGES.map(pkg => (
          <div
            key={pkg.id}
            className={`relative bg-[#121225] border rounded-2xl p-5 flex flex-col items-center text-center gap-3 transition-all ${
              pkg.highlight ? 'border-[#7C4DFF]/50 shadow-lg shadow-[#7C4DFF]/10' : 'border-white/10'
            }`}
          >
            {pkg.highlight && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#7C4DFF] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Mais Popular
              </span>
            )}
            <Sparkles className={`w-5 h-5 ${pkg.highlight ? 'text-[#B39DFF]' : 'text-gray-500'}`} />
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">{pkg.label}</span>
            <span className="text-2xl font-mono font-black text-white">R$ {pkg.amount.toFixed(2)}</span>
            <button
              onClick={() => handleBuy(pkg)}
              disabled={loadingPackage !== null}
              className={`w-full py-2 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
                pkg.highlight
                  ? 'bg-gradient-to-r from-[#7C4DFF] to-indigo-600 hover:brightness-110 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              {loadingPackage === pkg.id ? (
                <Loader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
              {loadingPackage === pkg.id ? 'Abrindo...' : 'Comprar'}
            </button>
          </div>
        ))}
      </div>

      {/* SECURITY NOTE */}
      <div className="flex items-start gap-2.5 text-[11px] text-gray-500 px-1">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Pagamento processado com segurança pelo Mercado Pago. O Bla Bla Amigos não armazena
          dados do seu cartão. Após a confirmação do pagamento, os créditos são adicionados
          automaticamente à sua Carteira.
        </p>
      </div>

    </div>
  );
}
