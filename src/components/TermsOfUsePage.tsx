export default function TermsOfUsePage() {
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
          <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-sm text-gray-500 italic">Última atualização: 06 de agosto de 2026</p>
        </div>

        <p>
          Estes Termos de Uso ("Termos") regulam o acesso e a utilização da rede social Bla, Bla,
          Amigos ("BBA", "nós" ou "plataforma"). Ao criar uma conta ou utilizar nossos serviços, você
          ("usuário") concorda integralmente com estes Termos.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">1. Objeto</h2>
          <p>
            O BBA é uma plataforma de rede social que permite a criação de perfis, publicação de
            conteúdos, interação em tempo real (bate-papo), compartilhamento de stories, fotos e
            vídeos, e conexão entre usuários.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">2. Cadastro e conta</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Para utilizar o BBA, é necessário criar uma conta fornecendo informações verdadeiras, completas e atualizadas.</li>
            <li>Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</li>
            <li>É proibido criar contas falsas, se passar por terceiros ou utilizar dados de outra pessoa sem autorização.</li>
            <li>O uso da plataforma é destinado a maiores de 13 anos; menores devem ter autorização e supervisão dos responsáveis legais, conforme aplicável.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">3. Regras de conduta</h2>
          <p>Ao utilizar o BBA, o usuário se compromete a não:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Publicar conteúdo ilegal, difamatório, discriminatório, violento ou que viole direitos de terceiros.</li>
            <li>Praticar assédio, bullying ou qualquer forma de discurso de ódio.</li>
            <li>Utilizar robôs, scripts ou meios automatizados para interagir com a plataforma ou gerar cliques e interações artificiais.</li>
            <li>Tentar acessar áreas restritas, dados de outros usuários ou comprometer a segurança da plataforma.</li>
            <li>Utilizar a plataforma para fins comerciais não autorizados ou envio de spam.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">4. Conteúdo publicado pelo usuário</h2>
          <p>
            O usuário mantém a titularidade sobre o conteúdo que publica, mas concede ao BBA uma
            licença não exclusiva, mundial e gratuita para hospedar, exibir e distribuir esse
            conteúdo dentro da plataforma, pelo tempo em que a conta permanecer ativa.
          </p>
          <p>
            O BBA se reserva o direito de remover conteúdos que violem estes Termos ou a legislação
            vigente, a qualquer momento e sem aviso prévio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">5. Publicidade</h2>
          <p>
            O BBA exibe anúncios de terceiros, incluindo por meio do Google AdSense, como forma de
            manter a operação gratuita da plataforma. O usuário concorda em visualizar esses anúncios
            como parte da experiência na rede social. É expressamente proibido incentivar, forjar ou
            manipular cliques em anúncios exibidos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">6. Propriedade intelectual</h2>
          <p>
            A marca "Bla, Bla, Amigos", seu layout, design e elementos visuais são de propriedade do
            BBA e protegidos por lei. É proibida a reprodução, cópia ou uso não autorizado desses
            elementos sem consentimento prévio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">7. Suspensão e encerramento de conta</h2>
          <p>
            O BBA pode suspender ou encerrar contas que violem estes Termos, sem prejuízo de outras
            medidas cabíveis. O usuário pode encerrar sua conta a qualquer momento através das
            configurações da plataforma.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">8. Limitação de responsabilidade</h2>
          <p>
            O BBA não se responsabiliza por conteúdos publicados por usuários, nem por danos
            decorrentes de uso indevido da plataforma por terceiros. A plataforma é fornecida "como
            está", sem garantias de disponibilidade ininterrupta.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">9. Privacidade</h2>
          <p>
            O tratamento de dados pessoais dos usuários é regido por nossa{' '}
            <a href="/privacidade" className="text-cyan-400 hover:underline">Política de Privacidade</a>,
            que integra estes Termos.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">10. Alterações destes Termos</h2>
          <p>
            Estes Termos podem ser atualizados periodicamente. O uso continuado da plataforma após
            alterações implica concordância com a nova versão.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-cyan-400">11. Lei aplicável e foro</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
            da comarca de Goiânia, Estado de Goiás, para dirimir eventuais controvérsias, com
            renúncia a qualquer outro, por mais privilegiado que seja.
          </p>
        </section>

        <section className="space-y-2 pb-12">
          <h2 className="text-xl font-bold text-cyan-400">12. Contato</h2>
          <p>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato pelo e-mail:{' '}
            <a href="mailto:contato@blablabladosamigos.online" className="text-cyan-400 hover:underline">
              contato@blablabladosamigos.online
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
