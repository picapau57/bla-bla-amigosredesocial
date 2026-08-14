export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A14] text-slate-200 font-sans">
      <header className="border-b border-white/10 bg-[#121225]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-extrabold text-base tracking-wider uppercase">BLA, BLA, AMIGOS</span>
          <a href="/" className="text-xs uppercase tracking-wider text-cyan-400 hover:text-cyan-300">
            &larr; Voltar ao site
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 leading-relaxed">
        <div>
          <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-sm text-gray-500 italic">Última atualização: 06 de agosto de 2026</p>
        </div>

        <p>
          Esta Política de Privacidade descreve como o Bla, Bla, Amigos ("nós", "nossa rede" ou "BBA")
          coleta, usa, armazena, compartilha e protege os dados pessoais dos usuários ("você") que
          utilizam nossa plataforma de rede social, em conformidade com a Lei Geral de Proteção de
          Dados Pessoais (Lei nº 13.709/2018 – LGPD) e demais legislações aplicáveis.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">1. Quem somos</h2>
          <p>
            O Bla, Bla, Amigos é uma rede social que permite aos usuários criar perfis, publicar
            conteúdos, interagir com outros membros, compartilhar stories e participar de conversas
            em tempo real. Somos os controladores dos dados pessoais tratados por meio da plataforma,
            nos termos do art. 5º, VI, da LGPD.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">2. Quais dados coletamos</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Dados de cadastro: nome, e-mail, número de identificação de usuário, foto de perfil e senha.</li>
            <li>Dados de conteúdo: publicações, comentários, fotos, vídeos, stories e mensagens que você compartilha na plataforma.</li>
            <li>Dados de conexões: lista de amigos, seguidores e interações (curtidas, comentários, compartilhamentos).</li>
            <li>Dados de uso e navegação: endereço IP, tipo de dispositivo, navegador, páginas visitadas e tempo de permanência.</li>
            <li>Dados de localização aproximada, quando fornecidos voluntariamente pelo usuário.</li>
            <li>Cookies e tecnologias semelhantes, incluindo as utilizadas por parceiros de publicidade.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">3. Finalidade do tratamento de dados</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Criar, manter e gerenciar sua conta e perfil na plataforma.</li>
            <li>Viabilizar as funcionalidades de interação social (publicações, bate-papo, stories, conexões).</li>
            <li>Personalizar sua experiência e recomendar conteúdos e conexões relevantes.</li>
            <li>Exibir publicidade, incluindo anúncios de parceiros como o Google AdSense, com base em dados de navegação e interesses.</li>
            <li>Garantir a segurança da plataforma, prevenir fraudes e cumprir obrigações legais.</li>
            <li>Enviar comunicações sobre atualizações, novidades e questões relacionadas à sua conta.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">4. Publicidade e cookies (Google AdSense e parceiros)</h2>
          <p>
            Utilizamos serviços de publicidade de terceiros, incluindo o Google AdSense, para exibir
            anúncios em nossa plataforma. Esses parceiros podem utilizar cookies e identificadores de
            dispositivo para exibir anúncios com base em suas visitas anteriores a este e a outros sites.
          </p>
          <p>
            Você pode desativar o uso de cookies para publicidade personalizada visitando as
            Configurações de Anúncios do Google ou o portal www.aboutads.info. A desativação não
            impede a exibição de anúncios, apenas torna-os menos direcionados aos seus interesses.
          </p>
          <p>
            Não incentivamos, solicitamos ou recompensamos cliques em anúncios exibidos na plataforma.
            Qualquer interação com anúncios é de escolha livre e espontânea do usuário.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">5. Compartilhamento de dados</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provedores de tecnologia e hospedagem necessários para o funcionamento da plataforma.</li>
            <li>Parceiros de publicidade, como o Google AdSense, exclusivamente para fins de exibição de anúncios.</li>
            <li>Autoridades públicas, quando exigido por lei, ordem judicial ou requisição de órgão competente.</li>
          </ul>
          <p>Não vendemos seus dados pessoais a terceiros para fins não relacionados à operação da plataforma.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">6. Armazenamento e segurança</h2>
          <p>
            Adotamos medidas técnicas e administrativas razoáveis para proteger seus dados pessoais
            contra acessos não autorizados, perda, alteração ou divulgação indevida. Seus dados são
            armazenados pelo tempo necessário para cumprir as finalidades descritas nesta política ou
            conforme exigido por lei.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">7. Seus direitos como titular de dados</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmar a existência de tratamento de seus dados.</li>
            <li>Acessar, corrigir ou atualizar seus dados pessoais.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
            <li>Solicitar a portabilidade dos dados a outro fornecedor de serviço.</li>
            <li>Revogar o consentimento e solicitar a exclusão de dados tratados com base nele.</li>
            <li>Obter informações sobre com quem seus dados foram compartilhados.</li>
          </ul>
          <p>Para exercer esses direitos, entre em contato através do e-mail informado na seção 9.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">8. Alterações desta política</h2>
          <p>
            Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em
            nossas práticas ou por exigência legal. Recomendamos que você a revise regularmente.
            Alterações significativas serão comunicadas por meio da plataforma.
          </p>
        </section>

        <section className="space-y-2 pb-12">
          <h2 className="text-xl font-bold text-cyan-400">9. Contato</h2>
          <p>
            Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados
            pessoais, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail:{' '}
            <a href="mailto:privacidade@blablabladosamigos.online" className="text-cyan-400 hover:underline">
              privacidade@blablabladosamigos.online
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
