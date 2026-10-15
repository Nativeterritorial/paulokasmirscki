import { PROJECT_STAGES } from "./project-stages";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// Bonificação por indicação. Deixe null enquanto não estiver definida (a página
// diz "combinada com o Paulo"); preencha (ex.: "15% da comissão do Paulo")
// quando as regras estiverem fechadas com o jurídico.
const BONIFICACAO = null;
// Validade de uma indicação, em meses.
const VALIDADE_MESES = 12;

export const metadata = {
  title: "Parcerias — Paulo Kasmirscki",
  description:
    "Três formas de fazer negócio com o Paulo Kasmirscki: indicar um negócio imobiliário, abrir uma empresa da ideia à inauguração e ter um gestor ao lado do seu negócio.",
  alternates: { canonical: "/parcerias" },
};

const ico = (paths) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

const MODELOS = [
  {
    id: "indicar",
    n: "01",
    ic: ["M3 11l9-7 9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
    t: "Indique um negócio imobiliário",
    d: "Conhece alguém que quer comprar, vender ou alugar um imóvel? Você apresenta, eu conduzo o negócio como corretor e você recebe uma bonificação quando ele fecha.",
    p: "Para quem quer uma renda extra sem precisar entender de imóveis.",
  },
  {
    id: "abrir",
    n: "02",
    ic: [
      "M12 3c3 2 5 5.5 5 9.5L15 16H9l-2-3.5C7 8.5 9 5 12 3z",
      "M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
      "M9 16l-2 4 4-1.5M15 16l2 4-4-1.5",
    ],
    t: "Da ideia à abertura",
    d: "Você tem a ideia de um negócio; eu coordeno as empresas da rede em cada etapa, da viabilidade até o dia da inauguração. Você fala com uma pessoa só.",
    p: "Para quem vai abrir um negócio ou trazer uma empresa para a região.",
  },
  {
    id: "gestor",
    n: "03",
    ic: ["M3 8h18v12H3z", "M9 8V5h6v3", "M3 13h18"],
    t: "Gestor de negócios",
    d: "Eu atuo ao seu lado, como pessoa física ou dono de empresa, mês a mês, no planejamento, nos números, nos processos e nas negociações.",
    p: "Para quem quer crescer com organização, na vida financeira ou na empresa, e não tem tempo de parar para planejar.",
  },
];

const PASSOS_INDICACAO = [
  ["1", "Você registra", "Preenche o formulário com o contato de quem quer indicar."],
  ["2", "Eu confirmo", "Aviso pelo WhatsApp se a indicação é válida, com a data do registro."],
  ["3", "Eu conduzo", "Atendo, negocio e fecho. Você não precisa participar da negociação."],
  ["4", "Você recebe", "Quando eu recebo a comissão, repasso a sua bonificação."],
];

const REGRAS = [
  BONIFICACAO
    ? `A bonificação é de ${BONIFICACAO}, igual para todos os indicadores.`
    : "O valor da bonificação é combinado com o Paulo na confirmação da indicação e é o mesmo para todos os indicadores.",
  "O pagamento acontece depois que o Paulo recebe a comissão do negócio, na mesma proporção das parcelas.",
  `A indicação vale por ${VALIDADE_MESES} meses a partir da data do registro.`,
  "Vale a primeira indicação registrada. Quem já é cliente do Paulo também pode indicar e ser indicado.",
  "A bonificação é só para quem indicou diretamente: não há ganho sobre indicações de outras pessoas.",
  "Quem indica apenas apresenta. Mostrar imóvel, negociar e fechar é trabalho do corretor.",
];

const ETAPAS = PROJECT_STAGES.map((s) => [s.nome, s.desc]);

const GESTOR_FAZ = [
  ["Planejamento estratégico", "Definir metas de curto, médio e longo prazo e traçar o caminho para chegar lá."],
  ["Gestão financeira", "Acompanhar fluxo de caixa, custos, orçamentos, lucro e indicadores de desempenho."],
  ["Organização de processos", "Ajustar tempo, tarefas e operação para evitar desperdícios e gargalos."],
  ["Visão de mercado", "Analisar a concorrência, identificar novas oportunidades e sugerir inovações."],
  ["Negociação e parcerias", "Lidar com fornecedores, clientes estratégicos e contratos importantes."],
];

export default function Parcerias() {
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
            <a
              className="btn btn-primary"
              href={wa("Olá Paulo! Vi a página de parcerias e quero conversar.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com o Paulo
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap">
        <div className="join-hero">
          <div className="eyebrow">Parcerias</div>
          <h1 className="mdl-title">
            Três formas de fazer <em>negócio</em> comigo
          </h1>
          <p className="join-lead">
            Além de conectar as empresas da rede, trabalho com três modelos de
            parceria. Escolha o que faz sentido para você.
          </p>
        </div>

        <div className="mdl-cards">
          {MODELOS.map((m) => (
            <a className="mdl-card" href={`#${m.id}`} key={m.id}>
              <div className="mdl-top">
                <span className="mdl-ico">{ico(m.ic)}</span>
                <span className="mdl-n">{m.n}</span>
              </div>
              <h2>{m.t}</h2>
              <p>{m.d}</p>
              <p className="mdl-for">{m.p}</p>
              <span className="mdl-more">Ver como funciona ↓</span>
            </a>
          ))}
        </div>

        {/* 01 — Indicação imobiliária */}
        <section className="mdl-sec" id="indicar">
          <div className="mdl-head">
            <div className="kick">Modelo 01</div>
            <h2 className="mdl-title">
              Indique um negócio <em>imobiliário</em>
            </h2>
          </div>
          <div className="join-cols">
            <div>
              <div className="mdl-steps">
                {PASSOS_INDICACAO.map(([n, t, d]) => (
                  <div className="join-step" key={n}>
                    <div className="js-n">{n}</div>
                    <h4>{t}</h4>
                    <p>{d}</p>
                  </div>
                ))}
              </div>
              <h3 className="mdl-sub">Regras da indicação</h3>
              <ul className="mdl-list">
                {REGRAS.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p className="mdl-note">
                Paulo Kasmirscki é corretor de imóveis, CRECI-RS 77988.
              </p>
            </div>
            <aside className="join-buy">
              <div className="join-buy-card ind-cta">
                <div className="kick">Quer indicar alguém?</div>
                <h3>Fale comigo ou indique pela Área de Membros</h3>
                <p>
                  Me mande pelo WhatsApp o nome e o contato de quem você quer
                  indicar. Se preferir registrar e acompanhar cada indicação,
                  faça o seu cadastro no ecossistema.
                </p>
                <a
                  className="btn btn-primary"
                  href={wa("Olá Paulo! Quero indicar um negócio imobiliário. Quem eu indico: ")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Indicar pelo WhatsApp
                </a>
                <a className="btn btn-outline" href="/ecossistema">
                  Fazer meu cadastro
                </a>
                <a className="ind-cta-login" href="/area#indicacoes">
                  Já é membro? Entrar na Área de Membros →
                </a>
              </div>
            </aside>
          </div>
        </section>

        {/* 02 — Da ideia à abertura */}
        <section className="mdl-sec" id="abrir">
          <div className="mdl-head">
            <div className="kick">Modelo 02</div>
            <h2 className="mdl-title">
              Da ideia à <em>abertura</em>
            </h2>
            <p>
              Abrir um negócio envolve contador, advogado, imóvel, obra, seguro
              e divulgação. Eu coordeno tudo com empresas da rede, em seis
              etapas, e você acompanha por um contato só.
            </p>
          </div>
          <div className="mdl-stages">
            {ETAPAS.map(([t, d], i) => (
              <div className="join-step" key={t}>
                <div className="js-n">{i + 1}</div>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <ul className="mdl-list mdl-list-inline">
            <li>A rede já está pronta: em cada etapa entra uma empresa que eu conheço e indico.</li>
            <li>Cada empresa responde pelo serviço que presta; eu coordeno.</li>
            <li>Contabilidade e jurídico são feitos pelos profissionais habilitados.</li>
          </ul>
          <a
            className="btn btn-primary"
            href={wa("Olá Paulo! Quero abrir um negócio e gostaria de conversar sobre o modelo Da ideia à abertura.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero abrir um negócio
          </a>
        </section>

        {/* 03 — Gestor de negócios */}
        <section className="mdl-sec" id="gestor">
          <div className="mdl-head">
            <div className="kick">Modelo 03</div>
            <h2 className="mdl-title">
              Gestor de <em>negócios</em>
            </h2>
            <p>
              Para pessoa física ou empresa: eu atuo ao seu lado, mês a mês,
              ajudo a definir aonde você quer chegar, acompanho os números,
              organizo a rotina e conduzo as negociações importantes.
            </p>
          </div>
          <div className="mdl-stages">
            {GESTOR_FAZ.map(([t, d], i) => (
              <div className="join-step" key={t}>
                <div className="js-n">{i + 1}</div>
                <h4>{t}</h4>
                <p>{d}</p>
              </div>
            ))}
          </div>
          <a
            className="btn btn-primary mdl-cta"
            href={wa("Olá Paulo! Quero saber mais sobre o modelo Gestor de negócios.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero um gestor
          </a>
        </section>
      </main>
    </div>
  );
}
