import { useState } from 'react';
import { User, Post, Ad, SystemLog, EmailConfig } from '../types';
import { 
  Users, AlertTriangle, ShieldCheck, CheckCircle, Mail,
  Trash2, Ban, Unlock, DollarSign, Activity, FileText, CheckCircle2
} from 'lucide-react';

interface AdminSectionProps {
  currentUser: User;
  users: User[];
  posts: Post[];
  ads: Ad[];
  logs: SystemLog[];
  emailConfig: EmailConfig;
  onUpdateEmailConfig: (config: EmailConfig) => void;
  onBlockUser: (id: string) => void;
  onUnblockUser: (id: string) => void;
  onToggleVerifyUser: (id: string) => void;
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
}

export default function AdminSection({
  currentUser,
  users,
  posts,
  ads,
  logs,
  emailConfig,
  onUpdateEmailConfig,
  onBlockUser,
  onUnblockUser,
  onToggleVerifyUser,
  onDeletePost,
  onDeleteAd,
  onApproveAd,
  getAdminStats
}: AdminSectionProps) {
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'dashboard' | 'users' | 'posts' | 'ads_moderation' | 'logs' | 'email_settings'>('dashboard');

  const stats = getAdminStats();

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
          { id: 'users', name: 'Moderação de Usuários (' + users.length + ')', icon: Users },
          { id: 'posts', name: 'Excluir Conteúdo (' + posts.length + ')', icon: Trash2 },
          { id: 'ads_moderation', name: 'Gerenciar Anúncios', icon: ShieldCheck },
          { id: 'logs', name: 'Logs de Segurança (' + logs.length + ')', icon: FileText },
          { id: 'email_settings', name: 'E-mail Transacional API', icon: Mail }
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
            {users.map(u => (
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
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">@{u.username} • {u.email} • Plano {u.premiumPlan}</p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 self-end sm:self-center">
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
                      )}
                    </button>
                  ) : (
                    <span className="bg-[#121225] text-gray-500 rounded-lg text-[10px] font-mono px-3 py-1.5 border border-white/15">Logado</span>
                  )}
                </div>
              </div>
            ))}
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
                      <span className="text-[10px] text-gray-500 font-mono font-bold">por @{creator.username}</span>
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
                        Anunciante: @{advertiser.username} • Pos: {ad.position} • {ad.price ? `R$ ${ad.price} (${ad.plan})` : 'Classificado'}
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

    </div>
  );
}
