import SignupForm from "./signup-form";

// Preço da assinatura. Deixe null para "condições direto com o Paulo";
// preencha (ex.: "R$ 97/mês" ou "R$ 497/ano") quando definirem.
const PRECO = null;

export const metadata = {
  title: "Faça parte do Ecossistema — Paulo Kasmirscki",
  description:
    "Entre para a rede de negócios do Paulo Kasmirscki: concierge de IA, diretório de empresas, indicações e conexões que viram negócio.",
  alternates: { canonical: "/ecossistema" },
};

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
  ["1", "Cadastro", "Você garante sua vaga e conta sobre o seu negócio."],
  ["2", "Boas-vindas", "O Paulo te recebe e sua empresa entra no diretório."],
  ["3", "Acesso", "Você recebe o link da área de membros e do concierge de IA."],
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
            <a className="nav-login" href="/area">
              Já sou membro
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap">
        <div className="join-hero">
          <div className="eyebrow">Área de membros</div>
          <h1>
            Entre para o <em>Ecossistema</em>
          </h1>
          <p className="join-lead">
            Uma rede de empresas e pessoas que se indicam, se conectam e
            crescem juntas — com um concierge de IA trabalhando pra você e o
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
              <div className="join-price">
                {PRECO ? (
                  <>
                    <span className="jp-val">{PRECO}</span>
                    <span className="jp-sub">acesso completo à rede</span>
                  </>
                ) : (
                  <>
                    <span className="jp-val">Vagas por convite</span>
                    <span className="jp-sub">
                      condições direto com o Paulo
                    </span>
                  </>
                )}
              </div>
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
      </main>
    </div>
  );
}
