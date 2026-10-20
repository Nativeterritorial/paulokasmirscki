import SignupForm from "./signup-form";
import { PROJECT_STAGES, OBRA_STAGES, stageNum } from "../parcerias/project-stages";
import { MURAL_DIAS } from "../parcerias/mural";
import Planos from "./planos";

// Página única do Ecossistema PK (a antiga /parcerias redireciona para cá):
// o que é, o que dá pra fazer (cada serviço leva à aba certa da Área de
// Membros), os planos e o cadastro.

// Bonificação por indicação. Deixe null enquanto não estiver definida (a página
// diz "combinada com o Paulo"); preencha (ex.: "15% da comissão do Paulo")
// quando as regras estiverem fechadas com o jurídico.
const BONIFICACAO = null;
const VALIDADE_MESES = 12;


export const metadata = {
  title: "O Ecossistema — Paulo Kasmirscki",
  description:
    "Um só lugar para conectar e resolver: concierge de IA, Mural de Oportunidades, indicações, venda de imóveis, obras do terreno às chaves, abertura de empresas e gestão de negócios.",
  alternates: { canonical: "/ecossistema" },
};

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

const svgIc = (paths) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

const PASSOS_INDICACAO = [
  ["1", "Você registra", "Informa na Área de Membros o contato de quem quer indicar."],
  ["2", "Eu confirmo", "Aviso se a indicação é válida, com a data do registro."],
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

const GESTOR_FAZ = [
  ["Planejamento estratégico", "Definir metas de curto, médio e longo prazo e traçar o caminho para chegar lá."],
  ["Gestão financeira", "Acompanhar fluxo de caixa, custos, orçamentos, lucro e indicadores de desempenho."],
  ["Organização de processos", "Ajustar tempo, tarefas e operação para evitar desperdícios e gargalos."],
  ["Visão de mercado", "Analisar a concorrência, identificar novas oportunidades e sugerir inovações."],
  ["Negociação e parcerias", "Lidar com fornecedores, clientes estratégicos e contratos importantes."],
];

const Lista = ({ itens }) => (
  <ul className="mdl-list">
    {itens.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

const Etapas = ({ itens }) => (
  <div className="eco-etapas">
    {itens.map(([n, t, d]) => (
      <div className="join-step" key={n + t}>
        <div className="js-n">{n}</div>
        <h4>{t}</h4>
        <p>{d}</p>
      </div>
    ))}
  </div>
);

// cada serviço: cartão minimalista + "Como funciona" que abre na própria página
const SERVICOS = [
  {
    id: "concierge",
    cls: "svc-ia",
    aba: "inicio",
    ic: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z", "M19 15v4M17 17h4"],
    kick: "Concierge de IA",
    t: "Diga o que precisa. A rede resolve.",
    d: "Fale em linguagem natural e o concierge encontra a empresa certa da rede. Para projetos maiores, ele monta o seu time de serviços e o Paulo coordena tudo.",
    btn: "Falar com o concierge",
    como: (
      <Lista
        itens={[
          "Concierge de IA: encontra a empresa certa da rede para o que você precisa.",
          "Monte meu time: para casamento, obra, abrir empresa ou evento, ele monta o roteiro de serviços e o Paulo seleciona as melhores opções.",
          "Chave PK: o Paulo apresenta você pessoalmente ao responsável pela empresa.",
          "Diretório da rede: todas as empresas por categoria, com site, Instagram e Chave PK.",
        ]}
      />
    ),
  },
  {
    id: "mural",
    cls: "svc-mur",
    aba: "mural",
    ic: ["M3 4h18v16H3z", "M7 9h6M7 13h10M7 17h4"],
    kick: "Mural de Oportunidades",
    t: "Quem precisa encontra quem faz",
    d: "Publique o que você procura, ofereça condições para a rede, divulgue vagas de emprego e recomende quem é de confiança.",
    btn: "Abrir o Mural",
    como: (
      <Lista
        itens={[
          "Procuro: publique o fornecedor, serviço ou profissional que você precisa. As empresas da rede respondem.",
          "Ofereço: condições especiais, capacidade disponível e parcerias para a rede (plano Básico).",
          "Vagas de emprego: publique a vaga e receba candidatos, que também chegam pela página pública /vagas (plano Básico).",
          "Recomendo: indique um profissional ou empresa de confiança. Passa pela aprovação do Paulo.",
          `Cada publicação fica ${MURAL_DIAS} dias no ar.`,
        ]}
      />
    ),
  },
  {
    id: "indicar",
    cls: "svc-ind",
    aba: "indicacoes",
    ic: ["M3 11l9-7 9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
    kick: "Indique um negócio",
    t: "Indique e receba uma bonificação",
    d: "Conhece alguém que quer comprar, vender ou alugar um imóvel? Você apresenta, o Paulo conduz o negócio como corretor e você recebe quando ele fecha.",
    btn: "Indicar um negócio",
    como: (
      <>
        <Etapas itens={PASSOS_INDICACAO} />
        <h4 className="eco-como-sub">Regras da bonificação</h4>
        <Lista itens={REGRAS} />
      </>
    ),
  },
  {
    id: "vender",
    cls: "svc-imo",
    aba: "vender",
    ic: ["M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z", "M7.5 7.5h.01"],
    kick: "Quero vender meu imóvel",
    t: "Tem um imóvel para vender?",
    d: "Cadastre o seu imóvel: o Paulo avalia com você, prepara o anúncio e leva até os compradores e indicadores do ecossistema.",
    btn: "Cadastrar imóvel",
    link: ["/imoveis", "Ver a vitrine de imóveis →"],
    como: (
      <Etapas
        itens={[
          ["1", "Você cadastra", "Fotos, tipo, bairro e valor. O endereço completo só o Paulo vê."],
          ["2", "O Paulo avalia", "Conversa com você sobre preço, documentação e o melhor caminho."],
          ["3", "Anúncio na vitrine", "O imóvel entra na vitrine do site, com o valor ou “sob consulta”."],
          ["4", "Compradores da rede", "O Paulo leva até os compradores e indicadores do ecossistema."],
        ]}
      />
    ),
  },
  {
    id: "obra",
    cls: "svc-obra",
    aba: "obra",
    ic: ["M3 21h18", "M5 21V9l7-5 7 5v12", "M9 21v-6h6v6", "M12 4V2"],
    kick: "Do terreno às chaves",
    t: "Vai construir?",
    d: "Casa, pavilhão ou comercial: do terreno à entrega das chaves, o Paulo conduz as 11 fases da obra com os parceiros certos da rede. Um único ponto de confiança, do começo ao fim.",
    btn: "Iniciar minha obra",
    como: <Etapas itens={OBRA_STAGES.map((s, i) => [String(stageNum(s, i)), s.nome, s.desc])} />,
  },
  {
    id: "projeto",
    cls: "svc-proj",
    aba: "projeto",
    ic: [
      "M12 3c3 2 5 5.5 5 9.5L15 16H9l-2-3.5C7 8.5 9 5 12 3z",
      "M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
      "M9 16l-2 4 4-1.5M15 16l2 4-4-1.5",
    ],
    kick: "Da ideia à abertura",
    t: "Vai abrir um negócio?",
    d: "Você tem a ideia; o Paulo coordena as empresas da rede em cada etapa, da viabilidade até o dia da inauguração. Você fala com uma pessoa só.",
    btn: "Iniciar meu projeto",
    como: <Etapas itens={PROJECT_STAGES.map((s, i) => [String(stageNum(s, i)), s.nome, s.desc])} />,
  },
  {
    id: "gestao",
    cls: "svc-gest",
    aba: "gestao",
    ic: ["M3 8h18v12H3z", "M9 8V5h6v3", "M3 13h18"],
    kick: "Gestor de negócios",
    t: "Quer um gestor ao seu lado?",
    d: "Para você ou para a sua empresa: o Paulo atua junto, mês a mês, no planejamento, nos números, nos processos e nas negociações.",
    btn: "Pedir gestão",
    como: (
      <div className="eco-etapas">
        {GESTOR_FAZ.map(([t, d]) => (
          <div className="join-step" key={t}>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>
    ),
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
    d: "Todas as empresas da rede num só lugar, organizadas por categoria, com conexão em um clique.",
  },
  {
    ic: "📌",
    t: "Mural de Oportunidades",
    d: "Quem precisa encontra quem faz: procure, ofereça, divulgue vagas e recomende.",
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
              Faça parte
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap">
        {/* o que é */}
        <div className="join-hero eco-hero">
          <div className="eyebrow eco-marca">
            <span className="marca-pk">Ecossistema <span className="pk-selo">PK</span></span> · Conector de Negócios
          </div>
          <h1 className="mdl-title eco-title">
            Um só lugar para <em>conectar e resolver</em>
          </h1>
          <p className="join-lead">
            Pessoas e marcas de segmentos diferentes, integradas numa rede que
            gera oportunidade para todos os lados. Você traz o objetivo; a rede
            e o Paulo conectam as pessoas e conduzem o caminho.
          </p>
          <div className="eco-hero-ctas">
            <a className="btn btn-primary" href="#cadastro">
              Quero fazer parte
            </a>
            <a className="btn btn-outline" href="#servicos">
              O que dá para fazer
            </a>
          </div>
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

        {/* o que você faz no ecossistema */}
        <section className="mdl-sec" id="servicos">
          <div className="mdl-head">
            <div className="kick">Dentro do Ecossistema</div>
            <h2 className="mdl-title">
              O que você <em>faz</em> por aqui
            </h2>
            <p>
              Tudo acontece na Área de Membros. Escolha o que você precisa: se
              ainda não tem acesso, o cadastro é rápido e você já entra.
            </p>
          </div>

          <div className="eco-svcs">
            {SERVICOS.map((s) => (
              <section className={`eco-svc svc ${s.cls}`} id={s.id} key={s.id}>
                <div className="area-refs-head">
                  <div className="svc-ic" aria-hidden="true">
                    {svgIc(s.ic)}
                  </div>
                  <div className="svc-txt">
                    <div className="kick">{s.kick}</div>
                    <h2>{s.t}</h2>
                    <p>
                      {s.d}
                      {s.link && (
                        <>
                          {" "}
                          <a className="vt-link" href={s.link[0]}>
                            {s.link[1]}
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                  <a className="btn btn-primary" href={`/area#${s.aba}`}>
                    {s.btn}
                  </a>
                </div>
                <details className="eco-como">
                  <summary>Como funciona</summary>
                  <div className="eco-como-body">{s.como}</div>
                </details>
              </section>
            ))}
          </div>
        </section>

        {/* planos */}
        <section className="mdl-sec" id="planos">
          <div className="mdl-head">
            <div className="kick">Planos</div>
            <h2 className="mdl-title">
              Comece grátis. <em>Feche negócios</em> com os planos.
            </h2>
            <p>
              Entrar no Ecossistema é gratuito. O Básico libera o que gera
              negócio dentro da rede; o Premium coloca a sua empresa em
              destaque e abre os extras de vendas e gestão com o Paulo.
            </p>
          </div>
          <Planos />
        </section>

        {/* cadastro */}
        <section className="mdl-sec" id="cadastro">
          <div className="mdl-head">
            <div className="kick">Faça parte</div>
            <h2 className="mdl-title">
              Entre para o <em>Ecossistema <span className="pk-selo">PK</span></em>
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
                <div className="kick">Cadastro grátis</div>
                <ul className="join-checks">
                  <li>✓ Acesso na hora à Área de Membros</li>
                  <li>✓ Concierge de IA e Mural de Oportunidades</li>
                  <li>✓ Sua empresa no diretório da rede</li>
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
