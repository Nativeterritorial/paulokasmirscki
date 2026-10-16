import SignupForm from "./signup-form";

// Preço da assinatura. Deixe null para "condições direto com o Paulo";
// preencha (ex.: "R$ 97/mês" ou "R$ 497/ano") quando definirem.
const PRECO = null;

export const metadata = {
  title: "O Ecossistema — Paulo Kasmirscki",
  description:
    "Um só lugar para conectar e resolver: a rede de negócios do Paulo Kasmirscki, com concierge de IA, diretório de empresas, indicações e conexões que viram negócio.",
  alternates: { canonical: "/ecossistema" },
};

// os três pilares (antes na seção 02 da página inicial)
const PILARES = [
  [
    "Conexões estratégicas",
    "Aproximo as pessoas certas no momento certo, unindo profissionais, empresas e clientes com interesses complementares.",
  ],
  [
    "Soluções sob medida",
    "Entendo a necessidade de cada um e encontro, dentro da rede, quem tem exatamente a solução que aquele cliente precisa.",
  ],
  [
    "Negócios que crescem",
    "Cada nova conexão fortalece o ecossistema, gerando indicações, parcerias e oportunidades que se multiplicam.",
  ],
];

// os três caminhos para entrar (antes na seção 06 da página inicial)
const CAMINHOS = [
  {
    t: "Quero receber indicações",
    d: "Seja apresentado a clientes e parceiros que precisam exatamente do que a sua empresa faz.",
    cta: "Quero receber indicações",
    href: "#cadastro",
  },
  {
    t: "Quero indicar e ser indicado",
    d: "Troque oportunidades com uma rede ativa de profissionais e empresas de vários segmentos.",
    cta: "Entrar na rede",
    href: "#cadastro",
  },
  {
    t: "Preciso de uma solução",
    d: "Procurando um fornecedor ou serviço de confiança? O Paulo te conecta com a pessoa certa da rede.",
    cta: "Buscar na rede",
    href: "#cadastro",
  },
];

const BENEFICIOS = [
  {
    ic: "🤖",
    t: "Concierge de IA exclusivo",
    d: "Diga o que precisa em linguagem natural — a IA encontra a empresa certa da rede e o Paulo faz a ponte.",
  },
  {
    ic: "🔗",
    t: "Diretório do ecossistema",
    d: "Todas as empresas da rede num só lugar, organizadas por setor, com conexão em um clique.",
  },
  {
    ic: "📣",
    t: "Sua marca na vitrine",
    d: "Página própria da sua empresa no site, indicações da IA e visibilidade pra toda a rede.",
  },
  {
    ic: "🤝",
    t: "Indicações com confiança",
    d: "Toda conexão é acompanhada pelo Paulo — você recebe e gera oportunidades com quem já confia nele.",
  },
];

const PASSOS = [
  ["1", "Cadastro", "Você conta sobre o seu negócio e cria a sua senha."],
  ["2", "Acesso na hora", "Entra direto na Área de Membros, com o concierge de IA."],
  ["3", "Na rede", "Sua empresa entra no diretório e o Paulo faz as pontes."],
  ["4", "Conexões", "Começa a indicar, ser indicado e fechar negócio."],
];

export default function Ecossistema() {
  return (
    <div className="rede-page">
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <div className="nav-actions">
            <a className="nav-login" href="/area" aria-label="Área de Membros">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
              </svg>
              <span className="nav-login-txt">Área de Membros</span>
            </a>
            <a className="btn btn-primary" href="#cadastro">
              Fazer cadastro
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap">
        {/* o que é */}
        <div className="join-hero">
          <div className="eyebrow">O Ecossistema</div>
          <h1 className="mdl-title">
            Um só lugar para <em>conectar e resolver</em>
          </h1>
          <p className="join-lead">
            Pessoas e marcas de segmentos diferentes, integradas numa rede que
            gera oportunidade para todos os lados.
          </p>
        </div>

        <div className="flip eco-page-block">
          <div className="eco-grid">
            {PILARES.map(([t, d], i) => (
              <article className="eco-card" key={t}>
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>

        {/* como entrar */}
        <section className="mdl-sec" id="faca-parte">
          <div className="mdl-head">
            <div className="kick">Para a sua marca</div>
            <h2 className="mdl-title">
              Faça parte da <em>rede</em>
            </h2>
            <p>
              Se você tem um negócio, entrar no ecossistema abre portas que
              sozinho levariam anos: clientes, parceiros e indicações de quem
              já confia no Paulo.
            </p>
          </div>
          <div className="flip eco-page-block">
            <div className="join-grid">
              {CAMINHOS.map((c, i) => (
                <article className="join-card" key={c.t}>
                  <div className="join-num">{String(i + 1).padStart(2, "0")}</div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                  <a className="btn btn-primary" href={c.href}>
                    {c.cta}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* cadastro */}
        <section className="mdl-sec" id="cadastro">
          <div className="mdl-head">
            <div className="kick">Área de membros</div>
            <h2 className="mdl-title">
              Entre para o <em>Ecossistema</em>
            </h2>
            <p>
              Uma rede de empresas e pessoas que se indicam, se conectam e
              crescem juntas, com um concierge de IA trabalhando para você e o
              Paulo fazendo as pontes.
            </p>
          </div>

          <div className="join-cols">
            <div className="join-benefits">
              {BENEFICIOS.map((b) => (
                <div className="join-b" key={b.t}>
                  <div className="join-b-ic" aria-hidden="true">
                    {b.ic}
                  </div>
                  <div>
                    <h3>{b.t}</h3>
                    <p>{b.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="join-buy">
              <div className="join-buy-card">
                <div className="kick">Cadastro</div>
                {PRECO && (
                  <div className="join-price">
                    <span className="jp-val">{PRECO}</span>
                    <span className="jp-sub">acesso completo à rede</span>
                  </div>
                )}
                <ul className="join-checks">
                  <li>✓ Concierge de IA ilimitado</li>
                  <li>✓ Sua empresa no diretório</li>
                  <li>✓ Página própria no site da rede</li>
                  <li>✓ Indicações acompanhadas pelo Paulo</li>
                </ul>
                <SignupForm />
              </div>
            </aside>
          </div>

          <div className="join-steps">
            {PASSOS.map(([n, t, d]) => (
              <div className="join-step" key={n}>
                <div className="js-n">{n}</div>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
