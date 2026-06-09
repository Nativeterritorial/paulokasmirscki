import Effects from "./effects";
import CookieBanner from "./cookie";

const WHATSAPP = "https://wa.me/5554996505799";
const INSTAGRAM = "https://instagram.com/paulokasmirscki";

const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const WA_RECEBER = wa(
  "Olá Paulo! Tenho um negócio e quero fazer parte da sua rede para receber indicações de clientes."
);
const WA_INDICAR = wa(
  "Olá Paulo! Quero entrar no ecossistema para indicar e ser indicado dentro da rede."
);
const WA_SOLUCAO = wa(
  "Olá Paulo! Estou procurando uma solução/fornecedor de confiança. Pode me conectar com alguém da rede?"
);

const SEGMENTOS = [
  "Imóveis & Construção",
  "Arquitetura",
  "Finanças & Investimentos",
  "Contabilidade",
  "Jurídico",
  "Tecnologia & IA",
  "Marketing & Digital",
  "Saúde & Bem-estar",
  "Estética & Beleza",
  "Gastronomia",
  "Turismo & Hotelaria",
  "Esporte & Lazer",
  "Comércio & Varejo",
  "Serviços",
  "Agro & Indústria",
  "Sustentabilidade & Meio Ambiente",
  "Negócios & Empresas",
];

// posições dos nós em volta do centro (50,50), raio 40 — 8 segmentos em destaque
// (nomes curtos nas pontas esquerda/direita pra não cortar)
const HUB_NODES = [
  { label: "Imóveis & Construção", x: 50, y: 10 },
  { label: "Finanças & Investimentos", x: 78.28, y: 21.72 },
  { label: "Jurídico", x: 90, y: 50 },
  { label: "Marketing & Digital", x: 78.28, y: 78.28 },
  { label: "Saúde & Bem-estar", x: 50, y: 90 },
  { label: "Negócios & Empresas", x: 21.72, y: 78.28 },
  { label: "Gastronomia", x: 10, y: 50 },
  { label: "Tecnologia & IA", x: 21.72, y: 21.72 },
];

function GhostMarquee({ word }) {
  return (
    <div className="ghost-marquee" aria-hidden="true">
      <div className="gm-track">
        {[0, 1, 2].map((k) => (
          <span key={k}>{word}</span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Effects />
      <CookieBanner />

      {/* Header */}
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#top" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <nav className="nav-links">
            <a href="#sobre">Sobre</a>
            <a href="#ecossistema">Ecossistema</a>
            <a href="#rede">A Rede</a>
            <a href="#segmentos">Segmentos</a>
            <a href="#contato">Contato</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-login" href="/area">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
              </svg>
              Entrar
            </a>
            <a className="btn btn-primary" href="#contato">
              Vamos conversar
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="container hero-inner">
            <div className="reveal">
              <div className="eyebrow">O conector do ecossistema</div>
              <h1>
                <span className="w">Conectando</span>{" "}
                <span className="w">
                  <em>pessoas</em>
                </span>{" "}
                <span className="w">e</span> <span className="w">gerando</span>{" "}
                <span className="w">
                  <em>negócios</em>
                </span>
              </h1>
              <p className="lead">
                Paulo Kasmirscki une pessoas e marcas de diferentes segmentos
                numa só rede — aproximando quem precisa de quem resolve e
                transformando relações em soluções e negócios reais.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#contato">
                  Quero fazer parte
                </a>
                <a className="btn btn-outline" href="#rede">
                  Conhecer a rede
                </a>
              </div>

              <div className="hero-stats">
                <div className="stat">
                  <div className="num gold-text" data-count="1000" data-prefix="+">
                    +1.000
                  </div>
                  <div className="label">Contatos na rede</div>
                </div>
                <div className="stat">
                  <div className="num gold-text">Multi</div>
                  <div className="label">Segmentos</div>
                </div>
                <div className="stat">
                  <div className="num gold-text" data-count="100" data-suffix="%">
                    100%
                  </div>
                  <div className="label">Foco em soluções</div>
                </div>
              </div>
            </div>

            <aside className="hero-photo">
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-seal"
                aria-label="Falar no WhatsApp"
              >
                <svg className="seal" viewBox="0 0 120 120">
                  <defs>
                    <path
                      id="sealpath"
                      d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"
                    />
                  </defs>
                  <text>
                    <textPath href="#sealpath">
                      · CONECTANDO PESSOAS · GERANDO NEGÓCIOS
                    </textPath>
                  </text>
                </svg>
                <span className="seal-center" aria-hidden="true" />
              </a>
              <div className="hero-photo-frame">
                <img
                  src="/paulo-premium.jpg"
                  alt="Paulo Kasmirscki"
                  className="hero-photo-img"
                />
                <div className="hero-photo-cap">
                  <div className="name serif">Paulo Kasmirscki</div>
                  <div className="role">Conector de negócios</div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* 01 — Sobre */}
        <section id="sobre">
          <GhostMarquee word="Sobre" />
          <div className="container">
            <div className="section-head">
              <div className="section-num">
                01 <span>/ Quem é o Paulo</span>
              </div>
              <h2>
                Comunicação que aproxima.
                <br />
                Rede que <em>gera resultado</em>.
              </h2>
            </div>

            <div className="about-grid fade-up">
              <div className="about-text">
                <p>
                  Paulo Kasmirscki é, antes de tudo, uma{" "}
                  <strong>pessoa extremamente comunicativa</strong>, com uma
                  facilidade rara de aproximar as pessoas e fazer com que se
                  sintam à vontade para conversar — e para fechar negócio.
                </p>
                <p>
                  Ao longo da carreira na área comercial, com forte experiência
                  em <strong>vendas e prospecção de clientes</strong>, construiu
                  uma <strong>rede de contatos ampla e diversa</strong>, que
                  percorre os mais variados setores do mercado.
                </p>
                <p>
                  Dessa combinação — comunicação, relacionamento e visão
                  comercial — nasce sua proposta: ser o{" "}
                  <strong>conector de um ecossistema de negócios</strong>, onde
                  pessoas e marcas de segmentos diferentes se encontram e geram
                  oportunidade umas para as outras.
                </p>
              </div>

              <div className="attributes">
                <div className="attr">
                  <div className="idx">i</div>
                  <div>
                    <h4>Facilidade de aproximar pessoas</h4>
                    <p>
                      Comunicação natural que abre portas e cria confiança desde
                      a primeira conversa.
                    </p>
                  </div>
                </div>
                <div className="attr">
                  <div className="idx">ii</div>
                  <div>
                    <h4>Rede de contatos diversa</h4>
                    <p>
                      Relacionamentos sólidos espalhados por múltiplos setores e
                      segmentos do mercado.
                    </p>
                  </div>
                </div>
                <div className="attr">
                  <div className="idx">iii</div>
                  <div>
                    <h4>Experiência comercial</h4>
                    <p>
                      Vivência em vendas e prospecção que transforma boas
                      conexões em negócios concretos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 — Ecossistema (flip) */}
        <section id="ecossistema" className="flip">
          <GhostMarquee word="Conecta" />
          <div className="container">
            <div className="section-head center">
              <div className="section-num">
                02 <span>/ O Ecossistema</span>
              </div>
              <h2>
                Um só lugar para <em>conectar e resolver</em>
              </h2>
              <p>
                Pessoas e marcas de segmentos diferentes, integradas numa rede
                que gera oportunidade para todos os lados.
              </p>
            </div>

            <div className="eco-grid fade-up">
              <article className="eco-card">
                <div className="num">01</div>
                <h3>Conexões estratégicas</h3>
                <p>
                  Aproximo as pessoas certas no momento certo, unindo
                  profissionais, empresas e clientes com interesses
                  complementares.
                </p>
              </article>
              <article className="eco-card">
                <div className="num">02</div>
                <h3>Soluções sob medida</h3>
                <p>
                  Entendo a necessidade de cada um e encontro, dentro da rede,
                  quem tem exatamente a solução que aquele cliente precisa.
                </p>
              </article>
              <article className="eco-card">
                <div className="num">03</div>
                <h3>Negócios que crescem</h3>
                <p>
                  Cada nova conexão fortalece o ecossistema — gerando
                  indicações, parcerias e oportunidades que se multiplicam.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="marquee-band" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div className="marquee-group" key={k}>
                {[
                  "Conexões",
                  "Networking",
                  "Parcerias",
                  "Oportunidades",
                  "Soluções",
                  "Relacionamento",
                ].map((word) => (
                  <span className="item" key={word}>
                    {word}
                    <span className="star"> · </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 03 — A Rede (marcas) */}
        <section id="rede">
          <GhostMarquee word="Rede" />
          <div className="container">
            <div className="section-head">
              <div className="section-num">
                03 <span>/ A Rede</span>
              </div>
              <h2>
                Marcas que já fazem parte do <em>ecossistema</em>
              </h2>
              <p>
                Empresas de pessoas da rede do Paulo — conectadas para crescer
                juntas. Ele é a ponte entre elas.
              </p>
            </div>

            <div className="brands-grid fade-up">
              <a
                className="brand-card"
                href="https://nativeterritorial.com.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <img src="/brand-native.png" alt="NATIVE" />
                </div>
                <div className="b-role">Inteligência Territorial</div>
                <p className="b-desc">
                  Topografia e georreferenciamento — inteligência territorial e
                  ambiental.
                </p>
                <span className="b-link">nativeterritorial.com.br →</span>
              </a>

              <a
                className="brand-card"
                href="https://visaradigital.com.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <span className="visara-mark">
                    <span className="dot" aria-hidden="true" />
                    VISARA
                  </span>
                </div>
                <div className="b-role">Agência Digital</div>
                <p className="b-desc">
                  Sites e Agentes de IA para negócios locais crescerem na
                  internet.
                </p>
                <span className="b-link">visaradigital.com.br →</span>
              </a>

              <a
                className="brand-card"
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <span className="pk-mark serif">
                    PK<span>.</span> Corretor
                  </span>
                </div>
                <div className="b-role">Imóveis · CRECI 77988</div>
                <p className="b-desc">
                  A atuação do próprio Paulo no mercado imobiliário, dentro do
                  ecossistema.
                </p>
                <span className="b-link">Falar no WhatsApp →</span>
              </a>

              <a
                className="brand-card"
                href="https://pulsejiujitsu.com.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <img className="pulse-logo" src="/brand-pulse.png" alt="Pulse Jiu-Jitsu" />
                </div>
                <div className="b-role">Esporte &amp; Lazer</div>
                <p className="b-desc">
                  Academia de Jiu-Jitsu — treinos para todas as idades, foco em
                  saúde, disciplina e bem-estar.
                </p>
                <span className="b-link">pulsejiujitsu.com.br →</span>
              </a>

              <a
                className="brand-card"
                href="https://exatusgene.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <img src="/brand-exatus.png" alt="Exatus Gene" />
                </div>
                <div className="b-role">Saúde &amp; Genética</div>
                <p className="b-desc">
                  Testes genéticos avançados, pesquisa clínica e soluções para
                  clínicas de fertilidade.
                </p>
                <span className="b-link">exatusgene.com →</span>
              </a>

              <a
                className="brand-card"
                href="https://www.bigwolfloja.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <img src="/brand-bigwolf.png" alt="Big Wolf" />
                </div>
                <div className="b-role">Moda &amp; Vestuário</div>
                <p className="b-desc">
                  Loja de roupas e moda casual masculina e feminina — camisetas,
                  moletons, jaquetas e acessórios.
                </p>
                <span className="b-link">bigwolfloja.com →</span>
              </a>

              <a
                className="brand-card"
                href="http://agetra.com.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="logo-slot">
                  <img className="tile-logo" src="/brand-agetra.png" alt="Agetra Gráfica" />
                </div>
                <div className="b-role">Gráfica &amp; Impressão</div>
                <p className="b-desc">
                  Gráfica completa — impressos, comunicação visual, papelaria e
                  soluções gráficas para empresas.
                </p>
                <span className="b-link">agetra.com.br →</span>
              </a>
            </div>

            <p className="brands-note">
              E a sua marca? <a href="#contato" style={{ color: "var(--gold-2)" }}>Faça parte da rede →</a>
            </p>
          </div>
        </section>

        {/* 04 — Segmentos (editorial hover) */}
        <section id="segmentos">
          <GhostMarquee word="Mercados" />
          <div className="container">
            <div className="section-head">
              <div className="section-num">
                04 <span>/ Segmentos atendidos</span>
              </div>
              <h2>
                Uma rede que cruza <em>vários mercados</em>
              </h2>
            </div>

            {/* Hub emblema (visual) */}
            <div className="hub hub-emblem fade-up" aria-hidden="true">
              <svg className="hub-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <circle className="hub-ring" cx="50" cy="50" r="40" />
                <circle className="hub-ring hub-ring-2" cx="50" cy="50" r="40" />
                {HUB_NODES.map((n) => (
                  <line
                    key={n.label}
                    className="hub-line"
                    x1="50"
                    y1="50"
                    x2={n.x}
                    y2={n.y}
                  />
                ))}
              </svg>

              <div className="hub-watermark" aria-hidden="true">
                <span>PK</span>
              </div>

              <div className="hub-core">
                <div className="core">
                  <img src="/logo-mark.svg" alt="" />
                </div>
              </div>

              {HUB_NODES.map((n) => (
                <div
                  className="hub-node"
                  key={n.label}
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <span className="dot" />
                  <span className="label">{n.label}</span>
                </div>
              ))}
            </div>

            {/* Grade com todos os segmentos */}
            <div className="seg-grid fade-up">
              {SEGMENTOS.map((seg) => (
                <span className="seg-tag" key={seg}>
                  {seg}
                </span>
              ))}
            </div>

          </div>
        </section>

        {/* 05 — Depoimentos */}
        <section id="depoimentos">
          <GhostMarquee word="Confiança" />
          <div className="container">
            <div className="section-head center">
              <div className="section-num">
                05 <span>/ Depoimentos</span>
              </div>
              <h2>
                Quem se conectou, <em>recomenda</em>
              </h2>
            </div>

            <div className="testimonials fade-up">
              {[
                {
                  t: "O Paulo é o cara que faz as pontes acontecerem. Pela rede dele, a NATIVE foi conectada a clientes e parceiros que aceleraram o nosso crescimento.",
                  a: "Felipe Nadal",
                  s: "NATIVE · Inteligência Territorial",
                  i: "F",
                },
                {
                  t: "Estar dentro do ecossistema do Paulo abriu portas reais para a Visara. Ele entende de gente e de negócio — apresenta a pessoa certa e o negócio flui.",
                  a: "Visara Digital",
                  s: "Agência Digital",
                  i: "V",
                },
                {
                  t: "Conheço pouca gente com a facilidade do Paulo para unir as pessoas. Quando ele te conecta a alguém, vem sempre com responsabilidade e confiança.",
                  a: "Depoimento em breve",
                  s: "Personalidade da rede",
                  i: "★",
                },
              ].map((d) => (
                <article className="testimonial" key={d.a}>
                  <div className="mark" aria-hidden="true">
                    &ldquo;
                  </div>
                  <p>{d.t}</p>
                  <div className="author">
                    <div className="av" aria-hidden="true">
                      {d.i}
                    </div>
                    <div>
                      <div className="name">{d.a}</div>
                      <div className="seg">{d.s}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* 06 — Faça parte */}
        <section id="faca-parte" className="flip">
          <GhostMarquee word="Junte-se" />
          <div className="container">
            <div className="section-head center">
              <div className="section-num">
                06 <span>/ Para a sua marca</span>
              </div>
              <h2>
                Faça parte da <em>rede</em>
              </h2>
              <p>
                Se você tem um negócio, entrar no ecossistema do Paulo abre
                portas que sozinho levariam anos — clientes, parceiros e
                indicações de quem já confia nele.
              </p>
            </div>

            <div className="join-grid fade-up">
              <article className="join-card">
                <div className="join-num">01</div>
                <h3>Quero receber indicações</h3>
                <p>
                  Seja apresentado a clientes e parceiros que precisam
                  exatamente do que a sua empresa faz.
                </p>
                <a
                  className="btn btn-primary"
                  href={WA_RECEBER}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quero receber indicações
                </a>
              </article>

              <article className="join-card">
                <div className="join-num">02</div>
                <h3>Quero indicar e ser indicado</h3>
                <p>
                  Troque oportunidades com uma rede ativa de profissionais e
                  empresas de vários segmentos.
                </p>
                <a
                  className="btn btn-primary"
                  href={WA_INDICAR}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Entrar na rede
                </a>
              </article>

              <article className="join-card">
                <div className="join-num">03</div>
                <h3>Preciso de uma solução</h3>
                <p>
                  Procurando um fornecedor ou serviço de confiança? O Paulo te
                  conecta com a pessoa certa da rede.
                </p>
                <a
                  className="btn btn-primary"
                  href={WA_SOLUCAO}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buscar na rede
                </a>
              </article>
            </div>
          </div>
        </section>

        {/* 07 — A Plataforma */}
        <section id="plataforma">
          <GhostMarquee word="Plataforma" />
          <div className="container">
            <div className="plat-grid">
              <div className="plat-text">
                <div className="section-num">
                  07 <span>/ A Plataforma</span>
                </div>
                <h2 style={{ marginTop: "16px" }}>
                  Uma plataforma <em>exclusiva</em> para a rede
                </h2>
                <p className="plat-lead">
                  Quem faz parte ganha acesso à área de membros — onde um
                  assistente de IA conecta você às empresas certas do
                  ecossistema, em segundos.
                </p>

                <div className="plat-benefits">
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">🤖</div>
                    <div>
                      <h4>Concierge com IA</h4>
                      <p>
                        Diga o que precisa em linguagem natural — a IA encontra a
                        empresa certa da rede.
                      </p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">🔗</div>
                    <div>
                      <h4>Diretório do ecossistema</h4>
                      <p>
                        Todas as empresas num só lugar, com conexão em um clique.
                      </p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">🤝</div>
                    <div>
                      <h4>Paulo como ponte</h4>
                      <p>
                        Toda conexão é acompanhada por ele, com a confiança da
                        rede.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hero-actions" style={{ marginTop: "34px" }}>
                  <a className="btn btn-primary" href="#contato">
                    Quero fazer parte
                  </a>
                  <a className="btn btn-outline" href="/area">
                    Entrar na plataforma
                  </a>
                </div>
              </div>

              {/* Prévia do painel */}
              <div className="plat-preview fade-up" aria-hidden="true">
                <div className="pp-bar">
                  <span className="pp-dot" /> Concierge do Ecossistema · IA
                </div>
                <div className="pp-chat">
                  <div className="pp-bubble pp-me">
                    preciso de um site e marketing pra minha loja
                  </div>
                  <div className="pp-bubble pp-bot">
                    A <b>Visara Digital</b> é ideal pro seu caso! 👗 Faz sites e
                    marketing pra negócios locais. Quer que eu te conecte? O
                    Paulo faz a ponte. 🤝
                  </div>
                </div>
                <div className="pp-firm">
                  <div>
                    <div className="pp-firm-nm">Visara Digital</div>
                    <div className="pp-firm-sg">Marketing &amp; Digital</div>
                  </div>
                  <span className="pp-conn">Conectar</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram */}
        <section style={{ paddingTop: 0 }}>
          <div className="container">
            <a
              className="insta-box fade-up"
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="insta-left">
                <div className="name serif">Acompanhe no Instagram</div>
                <div className="handle">@paulokasmirscki</div>
              </div>
              <span className="btn btn-outline">Seguir</span>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section id="contato" className="cta">
          <GhostMarquee word="Conecte" />
          <div className="container">
            <div className="eyebrow">Vamos conversar</div>
            <h2>
              Vamos colocar você <em>dentro da rede</em>?
            </h2>
            <p>
              Conte para o Paulo o que você busca — e deixe que ele conecte você
              às pessoas certas para fazer acontecer.
            </p>
            <a
              className="btn btn-primary"
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* WhatsApp flutuante */}
      <a
        className="wa-float"
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.512 5.26l-.999 3.648 3.737-.98z" />
        </svg>
      </a>

      {/* Footer multi-coluna */}
      <footer className="footer-rich">
        <div className="container">
          <div className="footer-cols">
            <div className="fc-brand">
              <div className="brand-name">Paulo Kasmirscki</div>
              <p>
                O conector do ecossistema. Conectando pessoas e gerando
                negócios em Veranópolis e na Serra Gaúcha.
              </p>
            </div>
            <div>
              <h4>Navegue</h4>
              <a href="#sobre">Sobre</a>
              <a href="#ecossistema">Ecossistema</a>
              <a href="#rede">A Rede</a>
              <a href="#segmentos">Segmentos</a>
            </div>
            <div>
              <h4>A Rede</h4>
              <a href="https://nativeterritorial.com.br" target="_blank" rel="noopener noreferrer">
                NATIVE
              </a>
              <a href="https://visaradigital.com.br" target="_blank" rel="noopener noreferrer">
                Visara Digital
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                PK Corretor de Imóveis
              </a>
            </div>
            <div>
              <h4>Contato</h4>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="/area">Área de Membros</a>
              <span className="fc-item">Veranópolis · RS</span>
            </div>
          </div>
          <div className="footer-base">
            <span>© {new Date().getFullYear()} Paulo Kasmirscki</span>
            <span>Conectando pessoas e gerando negócios.</span>
            <span>
              Feito por{" "}
              <a
                href="https://visaradigital.com.br"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visara Digital
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
