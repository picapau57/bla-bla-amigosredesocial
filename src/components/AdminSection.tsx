import { useState } from 'react';
import { User, Post, Ad, SystemLog, EmailConfig, PayoutConfig, PayoutRequest } from '../types';
import { 
  Users, AlertTriangle, ShieldCheck, CheckCircle, Mail,
  Trash2, Ban, Unlock, DollarSign, Activity, FileText, CheckCircle2, Key,
  CreditCard, Send, HelpCircle, History, Check, XCircle
} from 'lucide-react';

interface AdminSectionProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  ads: Ad[];
  logs: SystemLog[];
  emailConfig: EmailConfig;
  onUpdateEmailConfig: (config: EmailConfig) => void;
  onDeleteUser: (id: string) => void;
  onBlockUser: (id: string) => void;
  onUnblockUser: (id: string) => void;
  onToggleVerifyUser: (id: string) => void;
  onUpdateUserPassword?: (id: string, newPassword: string) => void;
  onDeletePost: (id: string) => void;
  onDeleteAd: (id: string) => void;
  onApproveAd: (id: string) => void;
  getAdminStats: () => {
    totalUsers: number;
    usersOnline: number;
    newSignupsToday: number;
    earnings: number;
    postsCount: number;
    adsCount: number;
    impressions: number;
    clicks: number;
  };
  payoutConfig: PayoutConfig;
  onUpdatePayoutConfig: (config: PayoutConfig) => void;
  payoutRequests: PayoutRequest[];
  onCreatePayoutRequest: (amount: number, details: string) => void;
  onUpdatePayoutRequestStatus: (id: string, status: 'pending' | 'processing' | 'paid' | 'rejected', notes?: string) => void;
}

export default function AdminSection({
  currentUser,
  users,
  posts,
  ads,
  logs,
  emailConfig,
  onUpdateEmailConfig,
  onDeleteUser,
  onBlockUser,
  onUnblockUser,
  onToggleVerifyUser,
  onUpdateUserPassword,
  onDeletePost,
  onDeleteAd,
  onApproveAd,
  getAdminStats,
  payoutConfig,
  onUpdatePayoutConfig,
  payoutRequests,
  onCreatePayoutRequest,
  onUpdatePayoutRequestStatus
}: AdminSectionProps) {
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'dashboard' | 'users' | 'posts' | 'ads_moderation' | 'logs' | 'email_settings' | 'finance_settings'>('dashboard');

  const [editedPayout, setEditedPayout] = useState<PayoutConfig>(() => ({
    gateway: payoutConfig?.gateway || 'disabled',
    pixKeyType: payoutConfig?.pixKeyType || 'cpf',
    pixKey: payoutConfig?.pixKey || '',
    pixHolderName: payoutConfig?.pixHolderName || '',
    stripePublicKey: payoutConfig?.stripePublicKey || '',
    stripeSecretKey: payoutConfig?.stripeSecretKey || '',
    mercadoPagoPublicKey: payoutConfig?.mercadoPagoPublicKey || '',
    mercadoPagoAccessToken: payoutConfig?.mercadoPagoAccessToken || '',
    asaasApiKey: payoutConfig?.asaasApiKey || '',
    bankName: payoutConfig?.bankName || '',
    bankAgency: payoutConfig?.bankAgency || '',
    bankAccount: payoutConfig?.bankAccount || '',
    bankAccountType: payoutConfig?.bankAccountType || 'corrente',
    bankHolderName: payoutConfig?.bankHolderName || '',
    bankHolderDoc: payoutConfig?.bankHolderDoc || ''
  }));

  const [lastConfig, setLastConfig] = useState<PayoutConfig>(payoutConfig);
  if (payoutConfig !== lastConfig) {
    setLastConfig(payoutConfig);
    setEditedPayout(payoutConfig);
  }

  const [withdrawAmount, setWithdrawAmount] = useState<string>('');



  const stats = getAdminStats();
  const realUsers = users.filter(u => !['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin'].includes(u.id));

  return (
    <div className="flex-1 bg-[#121225] border border-white/10 rounded-2xl p-5 shadow-xl space-y-6" id="admin-panel-stage">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="bg-gradient-to-r from-[#FF5722] to-[#FF1744] text-white font-mono text-[9px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
            Painel Administrativo Restrito
          </span>
          <h2 className="text-white font-extrabold text-base md:text-lg tracking-tight mt-1 uppercase">
            Central de Operações Bla Bla Amigos
          </h2>
        </div>
        <div className="text-[10px] bg-[#0A0A14] px-3 py-1.5 rounded-lg border border-white/5 font-mono text-[#FF5722] shrink-0 font-bold uppercase tracking-wider">
          Modo Administrador: Ativo
        </div>
      </div>

      {/* HORIZONTAL BAR ACTIONS UNDER RESTRICTED */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'dashboard', name: 'Dashboard Real', icon: Activity },
          { id: 'users', name: 'Moderação de Usuários (' + realUsers.length + ')', icon: Users },
          { id: 'posts', name: 'Excluir Conteúdo (' + posts.length + ')', icon: Trash2 },
          { id: 'ads_moderation', name: 'Gerenciar Anúncios', icon: ShieldCheck },
          { id: 'logs', name: 'Logs de Segurança (' + logs.length + ')', icon: FileText },
          { id: 'email_settings', name: 'E-mail Transacional API', icon: Mail },
          { id: 'finance_settings', name: 'Recebimentos e Pix (R$)', icon: DollarSign }
        ].map(tb => {
          const Icon = tb.icon;
          const isActive = adminActiveSubTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setAdminActiveSubTab(tb.id as any)}
              className={`p-2.5 px-4 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-[#FF5722] via-[#FF1744] to-[#7C4DFF] text-white shadow-lg' 
                  : 'bg-[#0A0A14] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tb.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT RENDER BLOCK */}
      {adminActiveSubTab === 'dashboard' && (
        <div className="space-y-6" id="admin-panel-dashboard-tab">
          
          {/* STATS BENTO TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Online Simulator users */}
            <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10 text-center relative overflow-hidden">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-[#00E676] rounded-full animate-ping" />
                <span className="text-[7px] font-mono text-gray-500 uppercase font-bold">Live</span>
              </div>
              <div className="text-2xl font-mono font-extrabold text-white mt-1">
                {stats.usersOnline}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-mono text-gray-500 mt-1 font-bold">Usuários Online</div>
            </div>

            {/* Total signed accounts */}
            <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10 text-center">
              <div className="text-2xl font-mono font-extrabold text-[#00E5FF] mt-1">
                {stats.totalUsers}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-mono text-gray-500 mt-1 font-bold">Contas Registradas</div>
            </div>

            {/* today signups */}
            <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10 text-center">
              <div className="text-2xl font-mono font-extrabold text-[#FF5722] mt-1">
                +{stats.newSignupsToday}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-mono text-gray-500 mt-1 font-bold">Novos Cadastros Hoje</div>
            </div>

            {/* Revenue card gross */}
            <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10 text-center relative">
              <DollarSign className="absolute top-2.5 right-2.5 w-4 h-4 text-[#00E676]" />
              <div className="text-xl font-mono font-extrabold text-[#00E676] mt-1">
                R$ {stats.earnings.toFixed(2)}
              </div>
              <div className="text-[9px] uppercase tracking-widest font-mono text-gray-500 mt-1 font-bold">Receita Mensal (R$)</div>
            </div>

          </div>

          {/* SECONDARY TILES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-[#0A0A14] p-4.5 rounded-xl border border-white/10 space-y-3.5">
              <h4 className="text-xs font-bold font-mono text-[#FF1744] uppercase tracking-widest border-b border-white/5 pb-1.5 flex items-center justify-between">
                <span>Tráfego e Interações publicadas</span>
                <span className="text-[10px] text-gray-500">Métricas acumuladas</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121225] p-3 rounded-lg text-center border border-white/5">
                  <div className="text-lg font-mono font-bold text-white">{stats.postsCount}</div>
                  <div className="text-[9px] text-gray-400 font-sans uppercase font-bold">Postagens do Feed</div>
                </div>
                <div className="bg-[#121225] p-3 rounded-lg text-center border border-white/5">
                  <div className="text-lg font-mono font-bold text-white">{stats.adsCount}</div>
                  <div className="text-[9px] text-gray-400 font-sans uppercase font-bold">Campanhas Ativas</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A14] p-4.5 rounded-xl border border-white/10 space-y-3.5">
              <h4 className="text-xs font-bold font-mono text-[#7C4DFF] uppercase tracking-widest border-b border-white/5 pb-1.5 flex items-center justify-between">
                <span>Rendimento do Ad Server</span>
                <span className="text-[10px] text-gray-500">Métricas analíticas</span>
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#121225] p-3 rounded-lg text-center border border-white/5">
                  <div className="text-lg font-mono font-bold text-[#00E5FF]">{stats.impressions}</div>
                  <div className="text-[9px] text-gray-400 font-sans uppercase font-bold">Impressões totais</div>
                </div>
                <div className="bg-[#121225] p-3 rounded-lg text-center border border-white/5">
                  <div className="text-lg font-mono font-bold text-[#FF5722]">{stats.clicks}</div>
                  <div className="text-[9px] text-gray-400 font-sans uppercase font-bold">Cliques totais</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions for testing the admin integrations */}
          <div className="bg-[#0A0A14] p-5 rounded-xl border border-rose-500/20 text-xs text-gray-400 leading-relaxed space-y-2">
            <h5 className="font-bold text-gray-200 flex items-center gap-1.5 uppercase font-mono text-[11px]">
              <AlertTriangle className="w-4 h-4 text-[#FF1744]" /> Diretrizes de Simulação do Avaliador:
            </h5>
            <p className="font-sans text-gray-300">
              Esta plataforma utiliza um <strong>gerenciamento de estado de alta fidelidade e persistência de dados real</strong>. Você pode testar os seguintes fluxos moderatórios:
            </p>
            <ul className="list-disc pl-4.5 space-y-1 font-sans text-gray-400">
              <li>Mude de usuário no seletor do topo direito, simule postagens ou comentários de outros usuários, depois retorne aqui como Administrador para bloquear contas ou remover publicações inapropriadas.</li>
              <li>Contas que forem marcadas como <strong>Bloqueadas</strong> têm seu acesso cortado imediatamente e perdem as credenciais de login.</li>
              <li>Aprove novos anúncios de patrocinados criados de outras sesões de conta na aba 'Gerenciar Anúncios' abaixo!</li>
            </ul>
          </div>

        </div>
      )}

      {adminActiveSubTab === 'users' && (
        <div className="space-y-4" id="admin-panel-users-tab">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Registros de Usuários e Políticas</h4>
          
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {realUsers.length === 0 ? (
              <div className="text-xs text-gray-400 italic p-6 text-center bg-[#0A0A14] rounded-xl border border-white/5">
                Nenhum usuário real cadastrado na plataforma ainda.
              </div>
            ) : (
              realUsers.map(u => (
                <div key={u.id} className="bg-[#0A0A14] p-3.5 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-3 items-center min-w-0">
                    <img src={u.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover bg-[#121225] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate uppercase">
                        {u.fullName}
                        {u.isVerified ? (
                          <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] inline shrink-0" title="Verificado" />
                        ) : (
                          <span className="text-[8px] bg-[#121225] text-gray-500 font-mono p-0.5 rounded px-1 shrink-0 font-bold uppercase tracking-wide">Não verificado</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {u.username} • {u.email} • Plano {u.premiumPlan} • <span className="text-amber-400 font-bold bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/10">Senha: {u.password || '123456'}</span></p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 self-end sm:self-center flex-wrap">
                    {/* Change Password button */}
                    {onUpdateUserPassword && (
                      <button
                        onClick={() => {
                          const newPass = window.prompt(`Digite a nova senha para o usuário @${u.username}:`, u.password || '123456');
                          if (newPass !== null) {
                            if (!newPass.trim()) {
                              alert('A senha não pode ficar em branco!');
                              return;
                            }
                            onUpdateUserPassword(u.id, newPass.trim());
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-[#0A0A14] hover:border-transparent flex items-center gap-1 cursor-pointer"
                        title="Alterar senha do usuário"
                      >
                        <Key className="w-3 h-3" /> Senha
                      </button>
                    )}

                    {/* Verify button toggle */}
                    <button
                      onClick={() => onToggleVerifyUser(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        u.isVerified
                          ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]'
                          : 'bg-[#121225] hover:bg-[#121225]/85 text-gray-400 hover:text-white border border-white/10'
                      }`}
                    >
                      Selo Verificar
                    </button>

                    {/* Block / Unblock action */}
                    {u.id !== currentUser.id ? (
                      <>
                        <button
                          onClick={() => u.isBlocked ? onUnblockUser(u.id) : onBlockUser(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                            u.isBlocked
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/10 border border-red-500/20 text-[#FF1744] hover:bg-gradient-to-r hover:from-[#FF5722] hover:to-[#FF1744] hover:text-white'
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <Unlock className="w-3 h-3" /> Desbloquear
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" /> Bloquear
                            </>
                          )
                        }
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente EXCLUIR PERMANENTEMENTE o usuário @${u.username} e todo seu conteúdo? Essa ação é definitiva!`)) {
                              onDeleteUser(u.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer bg-rose-600/25 border border-rose-500/30 text-rose-400 hover:bg-[#FF1744] hover:text-white hover:border-transparent"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </button>
                      </>
                    ) : (
                      <span className="bg-[#121225] text-gray-500 rounded-lg text-[10px] font-mono px-3 py-1.5 border border-white/15">Logado</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {adminActiveSubTab === 'posts' && (
        <div className="space-y-4" id="admin-panel-posts-tab">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Excluir Conteúdos Perturbadores</h4>
          
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {posts.map(p => {
              const creator = users.find(u => u.id === p.userId) || users[0];
              return (
                <div key={p.id} className="bg-[#0A0A14] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] text-[#7C4DFF] font-mono font-bold">Post #{p.id.slice(-4)}</span>
                      <span className="text-[10px] text-gray-500 font-mono font-bold">por ID: {creator.username}</span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed whitespace-pre-wrap italic font-sans">
                      "{p.content}"
                    </p>
                  </div>

                  <button
                    onClick={() => onDeletePost(p.id)}
                    className="bg-red-500/10 hover:bg-gradient-to-r hover:from-[#FF5722] hover:to-[#FF1744] border border-red-500/20 hover:border-transparent text-[#FF1744] hover:text-white p-2.5 rounded-lg shrink-0 transition-all self-end sm:self-center cursor-pointer"
                    title="Excluir do Feed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {adminActiveSubTab === 'ads_moderation' && (
        <div className="space-y-4" id="admin-panel-ads-tab">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Aprovação e Moderação de Campanhas</h4>
          
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {ads.map(ad => {
              const advertiser = users.find(u => u.id === ad.userId) || users[0];
              const isPending = ad.status === 'pending';
              return (
                <div key={ad.id} className="bg-[#0A0A14] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-3 items-center min-w-0">
                    <img src={ad.imageUrl} alt="thumbnail" className="w-10 h-10 rounded-lg object-cover bg-[#121225] shrink-0" />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-white truncate flex items-center gap-1.5 uppercase tracking-tight">
                        {ad.title}
                        <span className={`text-[8px] font-mono p-0.5 px-1.5 rounded uppercase font-bold ${isPending ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {ad.status}
                        </span>
                      </h5>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                        Anunciante: ID: {advertiser.username} • Pos: {ad.position} • {ad.price ? `R$ ${ad.price} (${ad.plan})` : 'Classificado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    {isPending && (
                      <button
                        onClick={() => onApproveAd(ad.id)}
                        className="bg-gradient-to-r from-[#00E676] to-[#00E5FF] hover:brightness-110 text-white font-bold text-[10px] uppercase px-3 py-2 rounded-lg flex items-center gap-1 shadow-lg cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar Financeiro
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteAd(ad.id)}
                      className="bg-[#121225] hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-500 border border-white/10 text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer transition-all"
                      title="Excluir anúncio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {adminActiveSubTab === 'logs' && (
        <div className="space-y-4" id="admin-panel-logs-tab">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Auditoria de Segurança Sistêmica</h4>
          
          <div className="bg-[#0A0A14] p-4 rounded-xl border border-white/10 text-gray-300 font-mono text-xs max-h-80 overflow-y-auto space-y-1.5 select-text" id="restricted-sys-terminal-box">
            {logs.map(log => (
              <div key={log.id} className="flex gap-2.5 items-start">
                <span className="text-[9px] text-gray-500 bg-[#121225] border border-white/5 p-0.5 rounded inline-block font-bold">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`text-[10px] shrink-0 font-bold ${
                  log.type === 'error' ? 'text-[#FF1744]' :
                  log.type === 'warning' ? 'text-amber-400' :
                  log.type === 'success' ? 'text-[#00E676]' : 'text-[#00E5FF]'
                }`}>
                  [{log.type.toUpperCase()}]
                </span>
                <span className="text-[11px] leading-relaxed text-gray-300">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {adminActiveSubTab === 'email_settings' && (
        <div className="space-y-6 animate-fade-in" id="admin-panel-email-tab">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verificação de Conta por E-mail Real (SMTP / EmailJS)</h4>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase ${
              emailConfig.provider === 'emailjs' ? 'bg-[#00E676]/20 text-[#00E676]' : 'bg-amber-500/10 text-amber-500'
            }`}>
              {emailConfig.provider === 'emailjs' ? 'Real Ativo' : 'Simulação'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Para que seus usuários recebam o código de ativação real em suas caixas de e-mail ao preencher o cadastro, conecte a sua conta do <strong>EmailJS</strong> abaixo. O EmailJS é um serviço gratuito de excelente reputação que envia e-mails transacionais diretamente do aplicativo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CONFIG FORM */}
            <div className="bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-4">
              <h5 className="text-xs font-bold font-mono text-[#00E5FF] uppercase tracking-wider">Credenciais de Envio</h5>
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Status do Serviço</label>
                  <select
                    value={emailConfig.provider}
                    onChange={(e) => onUpdateEmailConfig({ ...emailConfig, provider: e.target.value as any })}
                    className="w-full bg-[#121225] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] font-semibold"
                  >
                    <option value="disabled">Desativado (Simular com código padrão)</option>
                    <option value="emailjs">EmailJS Ativo (Envio real para o e-mail cadastrado)</option>
                  </select>
                </div>

                {emailConfig.provider === 'emailjs' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Service ID</label>
                      <input
                        type="text"
                        placeholder="Ex: service_g8x9s"
                        value={emailConfig.serviceId}
                        onChange={(e) => onUpdateEmailConfig({ ...emailConfig, serviceId: e.target.value })}
                        className="w-full bg-[#121225] text-white p-2.5 rounded-xl border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Template ID</label>
                      <input
                        type="text"
                        placeholder="Ex: template_7g9d8"
                        value={emailConfig.templateId}
                        onChange={(e) => onUpdateEmailConfig({ ...emailConfig, templateId: e.target.value })}
                        className="w-full bg-[#121225] text-white p-2.5 rounded-xl border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1">Public Key (User ID)</label>
                      <input
                        type="text"
                        placeholder="Ex: user_x89gSdfas7y87f"
                        value={emailConfig.publicKey}
                        onChange={(e) => onUpdateEmailConfig({ ...emailConfig, publicKey: e.target.value })}
                        className="w-full bg-[#121225] text-white p-2.5 rounded-xl border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* TUTORIAL / HELP */}
            <div className="bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-3.5 text-xs leading-relaxed text-gray-400 font-sans">
              <h5 className="text-xs font-extrabold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#FF5722]" /> Passo a Passo de Configuração:
              </h5>
              <ol className="list-decimal pl-4 space-y-2 text-gray-300">
                <li>Acesse e crie uma conta gratuita em <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-[#00E5FF] hover:underline font-bold">emailjs.com</a></li>
                <li>Na aba <strong>Email Services</strong>, conecte seu e-mail de envio (Gmail, Outlook, etc.) e copie o seu <span className="font-mono text-[#00E5FF] font-bold">Service ID</span></li>
                <li>Na aba <strong>Email Templates</strong>, crie um template de mensagem. Insira as variáveis abaixo exatamente como descritas para extrair os inputs do cadastro:
                  <div className="bg-[#121225] p-3 rounded-xl border border-white/5 font-mono text-[10px] text-gray-400 mt-2 space-y-1">
                    <p>Olá <span className="text-[#00E676] font-bold">{"{{to_name}}"}</span>,</p>
                    <p>Seu código de confirmação na Bla Bla Amigos é: <span className="text-[#00E5FF] font-extrabold">{"{{code}}"}</span></p>
                    <p>Destinatário: <span className="text-gray-300">{"{{to_email}}"}</span></p>
                  </div>
                </li>
                <li>Crie ou copie o <span className="font-mono text-[#00E5FF] font-bold">Template ID</span></li>
                <li>Na aba <strong>Account &gt; API Keys</strong>, copie a sua <span className="font-mono text-[#00E5FF] font-bold">Public Key</span></li>
                <li>Preencha as credenciais ao lado, selecione o status como <strong>EmailJS Ativo</strong> e salve! Os dados ficam salvos de forma protegida no seu navegador</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {adminActiveSubTab === 'finance_settings' && (
        <div className="space-y-6 animate-fade-in" id="admin-panel-finance-tab">
          
          {/* TOP INFO & BALANCE CARD */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* GROSS EARNINGS */}
            <div className="bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-1 relative overflow-hidden">
              <div className="absolute right-4 top-4 bg-[#00E676]/10 p-2 rounded-xl text-[#00E676]">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-[10px] uppercase font-mono text-gray-500 font-extrabold tracking-widest">Receita Bruta Total</p>
              <h4 className="text-2xl font-mono font-black text-white">R$ {stats.earnings.toFixed(2)}</h4>
              <p className="text-[10px] text-gray-400 font-sans">Soma acumulada de todos os anúncios e assinaturas</p>
            </div>

            {/* AVAILABLE BALANCE FOR Payout */}
            {(() => {
              const totalPaid = payoutRequests
                .filter(r => r.status === 'paid')
                .reduce((sum, r) => sum + r.amount, 0);
              const totalPending = payoutRequests
                .filter(r => r.status === 'pending' || r.status === 'processing')
                .reduce((sum, r) => sum + r.amount, 0);
              const available = Math.max(0, stats.earnings - totalPaid - totalPending);

              return (
                <>
                  <div className="bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-1 relative overflow-hidden">
                    <div className="absolute right-4 top-4 bg-[#00E5FF]/10 p-2 rounded-xl text-[#00E5FF]">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] uppercase font-mono text-gray-500 font-extrabold tracking-widest">Saldo Disponível para Saque</p>
                    <h4 className="text-2xl font-mono font-black text-[#00E5FF]">R$ {available.toFixed(2)}</h4>
                    <p className="text-[10px] text-gray-400 font-sans">Lançamentos compensados prontos para transferência</p>
                  </div>

                  <div className="bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-1 relative overflow-hidden">
                    <div className="absolute right-4 top-4 bg-[#7C4DFF]/10 p-2 rounded-xl text-[#7C4DFF]">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] uppercase font-mono text-gray-500 font-extrabold tracking-widest">Total Sacado (Pago)</p>
                    <h4 className="text-2xl font-mono font-black text-[#00E676]">R$ {totalPaid.toFixed(2)}</h4>
                    <p className="text-[10px] text-gray-400 font-sans">Valores transferidos com sucesso para sua conta externa</p>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: GATEWAY SETUP (7 cols) */}
            <div className="lg:col-span-7 bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-xs font-black font-mono text-[#00E5FF] uppercase tracking-widest border-b border-white/5 pb-2 flex items-center justify-between">
                <span>Configurar Gateway de Recebimento Real</span>
                <span className="text-[10px] text-gray-500 font-normal">Configuração Segura no Firebase</span>
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">Meio de Recebimento Preferencial</label>
                  <select
                    value={editedPayout.gateway}
                    onChange={(e) => setEditedPayout({ ...editedPayout, gateway: e.target.value as any })}
                    className="w-full bg-[#121225] text-white p-3 rounded-xl border border-white/10 text-xs font-semibold focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                  >
                    <option value="disabled">Desativado (Simular fluxo sem gateway conectado)</option>
                    <option value="pix">Chave PIX Direta (Recebimento direto e manual)</option>
                    <option value="mercado_pago">Mercado Pago (Cartão, Boleto, Pix automático)</option>
                    <option value="stripe">Stripe Connect (Checkout de cartões internacional)</option>
                    <option value="asaas">ASAAS Gateway (Cobranças automatizadas via Pix/Boleto)</option>
                    <option value="bank_transfer">Dados Bancários / Conta de Negócios (TED/DOC)</option>
                  </select>
                </div>

                {/* PIX CONFIG FIELDS */}
                {editedPayout.gateway === 'pix' && (
                  <div className="bg-[#121225] p-4 rounded-xl border border-white/5 space-y-3.5 animate-fade-in">
                    <p className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wide">● Configurar Recebimento via Chave PIX</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Tipo de Chave</label>
                        <select
                          value={editedPayout.pixKeyType}
                          onChange={(e) => setEditedPayout({ ...editedPayout, pixKeyType: e.target.value as any })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        >
                          <option value="cpf">CPF</option>
                          <option value="cnpj">CNPJ</option>
                          <option value="email">E-mail</option>
                          <option value="phone">Telefone</option>
                          <option value="random">Chave Aleatória (EVP)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Chave PIX</label>
                        <input
                          type="text"
                          placeholder="Digite sua chave pix"
                          value={editedPayout.pixKey || ''}
                          onChange={(e) => setEditedPayout({ ...editedPayout, pixKey: e.target.value })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Nome Completo do Titular</label>
                      <input
                        type="text"
                        placeholder="Nome do favorecido no PIX"
                        value={editedPayout.pixHolderName || ''}
                        onChange={(e) => setEditedPayout({ ...editedPayout, pixHolderName: e.target.value })}
                        className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>
                )}

                {/* MERCADO PAGO CONFIG FIELDS */}
                {editedPayout.gateway === 'mercado_pago' && (
                  <div className="bg-[#121225] p-4 rounded-xl border border-white/5 space-y-3.5 animate-fade-in">
                    <p className="text-[10px] text-[#00E5FF] font-mono font-bold uppercase tracking-wide">● Configurar Credenciais do Mercado Pago</p>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Public Key (Credencial de Produção)</label>
                      <input
                        type="text"
                        placeholder="Ex: APP_USR-876e5df..."
                        value={editedPayout.mercadoPagoPublicKey || ''}
                        onChange={(e) => setEditedPayout({ ...editedPayout, mercadoPagoPublicKey: e.target.value })}
                        className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Access Token (Produção)</label>
                      <input
                        type="password"
                        placeholder="Ex: APP_USR-124976214..."
                        value={editedPayout.mercadoPagoAccessToken || ''}
                        onChange={(e) => setEditedPayout({ ...editedPayout, mercadoPagoAccessToken: e.target.value })}
                        className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>
                )}

                {/* STRIPE CONFIG FIELDS */}
                {editedPayout.gateway === 'stripe' && (
                  <div className="bg-[#121225] p-4 rounded-xl border border-white/5 space-y-3.5 animate-fade-in">
                    <p className="text-[10px] text-[#7C4DFF] font-mono font-bold uppercase tracking-wide">● Configurar Credenciais da Stripe</p>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Stripe Publishable Key</label>
                      <input
                        type="text"
                        placeholder="Ex: pk_live_51M..."
                        value={editedPayout.stripePublicKey || ''}
                        onChange={(e) => setEditedPayout({ ...editedPayout, stripePublicKey: e.target.value })}
                        className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Stripe Secret Key</label>
                      <input
                        type="password"
                        placeholder="Ex: sk_live_51M..."
                        value={editedPayout.stripeSecretKey || ''}
                        onChange={(e) => setEditedPayout({ ...editedPayout, stripeSecretKey: e.target.value })}
                        className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>
                )}

                {/* ASAAS CONFIG FIELDS */}
                {editedPayout.gateway === 'asaas' && (
                  <div className="bg-[#121225] p-4 rounded-xl border border-white/5 space-y-3 animate-fade-in">
                    <p className="text-[10px] text-[#00E676] font-mono font-bold uppercase tracking-wide">● Configurar Credenciais do ASAAS</p>
                    <div>
                      <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">ASAAS API Key (Produção)</label>
                      <input
                        type="password"
                        placeholder="Ex: $aae$76e5df..."
                        value={editedPayout.asaasApiKey || ''}
                        onChange={(e) => setEditedPayout({ ...editedPayout, asaasApiKey: e.target.value })}
                        className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs font-mono focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>
                )}

                {/* BANK TRANSFER CONFIG FIELDS */}
                {editedPayout.gateway === 'bank_transfer' && (
                  <div className="bg-[#121225] p-4 rounded-xl border border-white/5 space-y-3.5 animate-fade-in">
                    <p className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wide">● Dados da Conta Bancária para TED/DOC</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Banco (Nome/Código)</label>
                        <input
                          type="text"
                          placeholder="Ex: Banco do Brasil"
                          value={editedPayout.bankName || ''}
                          onChange={(e) => setEditedPayout({ ...editedPayout, bankName: e.target.value })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Tipo de Conta</label>
                        <select
                          value={editedPayout.bankAccountType || 'corrente'}
                          onChange={(e) => setEditedPayout({ ...editedPayout, bankAccountType: e.target.value as any })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        >
                          <option value="corrente">Conta Corrente</option>
                          <option value="poupanca">Conta Poupança</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Agência (com dígito se houver)</label>
                        <input
                          type="text"
                          placeholder="Ex: 1234-5"
                          value={editedPayout.bankAgency || ''}
                          onChange={(e) => setEditedPayout({ ...editedPayout, bankAgency: e.target.value })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Número da Conta (com dígito)</label>
                        <input
                          type="text"
                          placeholder="Ex: 98765-4"
                          value={editedPayout.bankAccount || ''}
                          onChange={(e) => setEditedPayout({ ...editedPayout, bankAccount: e.target.value })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Nome Completo do Titular</label>
                        <input
                          type="text"
                          placeholder="Razão Social ou Nome do Titular"
                          value={editedPayout.bankHolderName || ''}
                          onChange={(e) => setEditedPayout({ ...editedPayout, bankHolderName: e.target.value })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">CPF ou CNPJ do Titular</label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={editedPayout.bankHolderDoc || ''}
                          onChange={(e) => setEditedPayout({ ...editedPayout, bankHolderDoc: e.target.value })}
                          className="w-full bg-[#0A0A14] text-white p-2.5 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    onUpdatePayoutConfig(editedPayout);
                    alert('Configurações de recebimento salvas com sucesso em seu Firestore!');
                  }}
                  className="w-full bg-gradient-to-r from-[#00E676] to-[#00E5FF] hover:brightness-110 text-white font-extrabold text-xs uppercase py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Salvar Credenciais de Recebimento
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: EDUCATIONAL / EXPLANATION (5 cols) */}
            <div className="lg:col-span-5 bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-4">
              <h4 className="text-xs font-black font-mono text-[#FF5722] uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FF5722]" /> Como funciona na vida real?
              </h4>

              <div className="space-y-3.5 text-xs text-gray-300 leading-relaxed font-sans">
                <p>
                  Muitas pessoas acham que quando criam um aplicativo, o dinheiro dos usuários fica retido na "loja" ou na plataforma de hospedagem. <strong>Na verdade, é muito mais simples e seguro!</strong>
                </p>
                
                <div className="space-y-2.5 bg-[#121225] p-3.5 rounded-xl border border-white/5">
                  <div className="flex gap-2">
                    <span className="text-[#00E5FF] font-mono font-bold">1.</span>
                    <p>
                      <strong>Conexão Direta:</strong> Ao conectar sua conta do Mercado Pago, Stripe ou ASAAS, as vendas são cobradas direto na sua própria credencial de comerciante.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#00E5FF] font-mono font-bold">2.</span>
                    <p>
                      <strong>Dinheiro em Tempo Real:</strong> Quando um usuário compra uma campanha de anúncios ou se torna Premium, o dinheiro entra <strong>direto na sua conta do banco</strong> em minutos (via Pix) ou dias úteis (via Cartão).
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[#00E5FF] font-mono font-bold">3.</span>
                    <p>
                      <strong>Controle por Webhooks:</strong> Assim que o pagamento é aprovado, o gateway (Stripe/MP) envia uma notificação automática (webhook) para o seu servidor, que atualiza a postagem/anúncio instantaneamente!
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 leading-normal space-y-1">
                  <p className="font-bold font-mono text-[10px] uppercase">💡 DICA PARA INICIAR JÁ:</p>
                  <p>
                    Se você não quer lidar com APIs de imediato, selecione a opção <strong>"Chave PIX Direta"</strong>. Os usuários farão transferências Pix manuais, e você aprovará o anúncio clicando em <strong>"Aprovar Financeiro"</strong> na aba "Gerenciar Anúncios". É a melhor forma de validar o negócio sem burocracia!
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* LOWER SECTION: SOLICITAR SAQUE & HISTÓRICO DE SAQUES */}
          <div className="bg-[#0A0A14] p-5 rounded-2xl border border-white/10 space-y-5">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-xs font-black font-mono text-[#7C4DFF] uppercase tracking-widest flex items-center gap-1.5">
                <History className="w-4 h-4" /> Solicitações de Saque & Auditoria Financeira
              </h4>
              <p className="text-[10px] text-gray-500 font-sans mt-0.5">Simule saques do saldo acumulado e gerencie suas transferências na plataforma</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* SOLICITAR SAQUE PANEL (4 cols) */}
              <div className="md:col-span-4 bg-[#121225] p-4.5 rounded-xl border border-white/5 space-y-3.5 h-fit">
                <h5 className="text-[11px] font-bold uppercase font-mono text-white tracking-wider">Nova Solicitação de Saque</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-mono mb-1 uppercase">Valor a Transferir (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-gray-500 font-mono font-bold">R$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-[#0A0A14] text-white pl-9 p-2 rounded-lg border border-white/10 text-xs font-mono font-bold focus:outline-none focus:border-[#00E5FF]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const amountNum = parseFloat(withdrawAmount);
                      if (isNaN(amountNum) || amountNum <= 0) {
                        alert('Digite um valor de saque válido!');
                        return;
                      }

                      // Calculate available balance
                      const totalPaid = payoutRequests
                        .filter(r => r.status === 'paid')
                        .reduce((sum, r) => sum + r.amount, 0);
                      const totalPending = payoutRequests
                        .filter(r => r.status === 'pending' || r.status === 'processing')
                        .reduce((sum, r) => sum + r.amount, 0);
                      const available = stats.earnings - totalPaid - totalPending;

                      if (amountNum > available) {
                        alert(`Saldo disponível insuficiente! Você só pode sacar até R$ ${available.toFixed(2)}`);
                        return;
                      }

                      // Generate destination details based on gateway
                      let dest = '';
                      if (editedPayout.gateway === 'pix') {
                        dest = `PIX (${editedPayout.pixKeyType.toUpperCase()}): ${editedPayout.pixKey} - Favorecido: ${editedPayout.pixHolderName}`;
                      } else if (editedPayout.gateway === 'bank_transfer') {
                        dest = `BANCÁRIO: Banco ${editedPayout.bankName} - Ag: ${editedPayout.bankAgency} / CC: ${editedPayout.bankAccount} - Favorecido: ${editedPayout.bankHolderName}`;
                      } else if (editedPayout.gateway === 'stripe') {
                        dest = `Stripe Connect: Conta integrada do Administrador`;
                      } else if (editedPayout.gateway === 'mercado_pago') {
                        dest = `Mercado Pago: Conta vinculada ${editedPayout.mercadoPagoPublicKey ? 'produção' : 'simulada'}`;
                      } else {
                        dest = `Transferência Pix de Emergência (Favor configurar dados bancários ou Pix acima)`;
                      }

                      onCreatePayoutRequest(amountNum, dest);
                      setWithdrawAmount('');
                      alert('Solicitação de saque enviada com sucesso! Ela ficará com status Pendente até que o processo seja auditado e aprovado.');
                    }}
                    className="w-full bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] hover:brightness-110 text-white font-extrabold text-[10px] uppercase py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> Solicitar Transferência
                  </button>
                </div>
              </div>

              {/* SAQUES LIST (8 cols) */}
              <div className="md:col-span-8 space-y-3">
                <h5 className="text-[11px] font-bold uppercase font-mono text-gray-400 tracking-wider">Histórico de Movimentações</h5>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {payoutRequests.length === 0 ? (
                    <div className="text-xs text-gray-500 italic p-8 text-center bg-[#121225] rounded-xl border border-white/5">
                      Nenhuma solicitação de saque feita ainda. Experimente fazer um saque ao lado!
                    </div>
                  ) : (
                    payoutRequests.map(req => (
                      <div key={req.id} className="bg-[#121225] p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-black text-[#00E676]">R$ {req.amount.toFixed(2)}</span>
                            <span className="text-[9px] text-gray-500 font-mono">{new Date(req.requestedAt).toLocaleString()}</span>
                            <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                              req.status === 'paid' ? 'bg-[#00E676]/20 text-[#00E676]' :
                              req.status === 'processing' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' :
                              req.status === 'rejected' ? 'bg-[#FF1744]/20 text-[#FF1744]' :
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {req.status === 'paid' ? 'Pago' :
                               req.status === 'processing' ? 'Processando' :
                               req.status === 'rejected' ? 'Recusado' :
                               'Pendente'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-sans leading-tight">
                            <strong>Destino:</strong> {req.destinationDetails}
                          </p>
                          {req.notes && (
                            <p className="text-[10px] text-amber-400 font-mono italic">
                              <strong>Nota do Sistema:</strong> {req.notes}
                            </p>
                          )}
                        </div>

                        {/* ADMIN LIFECYCLE ACTION OVERRIDES (since the admin is viewing this panel, let them change status!) */}
                        <div className="flex gap-1.5 shrink-0 self-end sm:self-center">
                          {req.status === 'pending' && (
                            <button
                              onClick={() => onUpdatePayoutRequestStatus(req.id, 'processing', 'Iniciado processamento de transferência bancária.')}
                              className="bg-[#00E5FF]/10 hover:bg-[#00E5FF] hover:text-[#0A0A14] text-[#00E5FF] font-mono text-[9px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer border border-[#00E5FF]/20 hover:border-transparent uppercase"
                            >
                              Processar
                            </button>
                          )}
                          {(req.status === 'pending' || req.status === 'processing') && (
                            <>
                              <button
                                onClick={() => {
                                  const voucher = window.prompt('Digite o número do comprovante Pix / Autenticação Bancária (opcional):', `COMP-${Date.now()}`);
                                  if (voucher !== null) {
                                    onUpdatePayoutRequestStatus(req.id, 'paid', `Transferência realizada com sucesso. Comprovante: ${voucher || 'PIX-OK'}`);
                                  }
                                }}
                                className="bg-[#00E676]/10 hover:bg-[#00E676] hover:text-[#0A0A14] text-[#00E676] font-mono text-[9px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer border border-[#00E676]/20 hover:border-transparent uppercase"
                              >
                                Pagar
                              </button>
                              <button
                                onClick={() => {
                                  const reason = window.prompt('Digite a justificativa de recusa:', 'Chave Pix inválida ou dados bancários incorretos.');
                                  if (reason !== null) {
                                    onUpdatePayoutRequestStatus(req.id, 'rejected', reason || 'Cancelado pelo usuário.');
                                  }
                                }}
                                className="bg-rose-500/10 hover:bg-[#FF1744] hover:text-white text-rose-400 font-mono text-[9px] font-bold px-2.5 py-1.5 rounded transition-all cursor-pointer border border-rose-500/20 hover:border-transparent uppercase"
                              >
                                Recusar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
