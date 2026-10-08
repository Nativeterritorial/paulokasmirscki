import Effects from "./effects";
import CookieBanner from "./cookie";
import HeroAI from "./hero-ai";
import SegmentHub from "./segment-hub";
import LeadForm from "./lead-form";
import BrandsCarousel from "./brands-carousel";

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
  { label: "Negócios & Empresas", x: 90, y: 50 },
  { label: "Marketing & Digital", x: 78.28, y: 78.28 },
  { label: "Saúde & Bem-estar", x: 50, y: 90 },
  { label: "Agro & Indústria", x: 21.72, y: 78.28 },
  { label: "Gastronomia", x: 10, y: 50 },
  { label: "Tecnologia & IA", x: 21.72, y: 21.72 },
];

const BRANDS = [
  {
    id: "native",
    href: "https://nativeterritorial.com.br",
    logo: <img src="/brand-native.png" alt="NATIVE" />,
    role: "Inteligência Territorial",
    desc: "Topografia e georreferenciamento — inteligência territorial e ambiental.",
    link: "nativeterritorial.com.br →",
  },
  {
    id: "visara",
    href: "https://visaradigital.com.br",
    logo: (
      <span className="visara-mark">
        <span className="dot" aria-hidden="true" />
        VISARA
      </span>
    ),
    role: "Agência Digital",
    desc: "Sites e Agentes de IA para negócios locais crescerem na internet.",
    link: "visaradigital.com.br →",
  },
  {
    id: "pk",
    href: WHATSAPP,
    logo: (
      <span className="pk-wordmark">
        <span className="pk-name">PAULO KASMIRSCKI</span>
        <span className="pk-sub">Corretor de Imóveis</span>
      </span>
    ),
    role: "Imóveis · CRECI-RS 77988",
    desc: "A atuação do próprio Paulo no mercado imobiliário, dentro do ecossistema.",
    link: "Falar no WhatsApp →",
  },
  {
    id: "pulse",
    href: "https://pulsejiujitsu.com.br",
    logo: <img className="pulse-logo" src="/brand-pulse.png" alt="Pulse Jiu-Jitsu" />,
    role: "Esporte & Lazer",
    desc: "Academia de Jiu-Jitsu — treinos para todas as idades, foco em saúde, disciplina e bem-estar.",
    link: "pulsejiujitsu.com.br →",
  },
  {
    id: "exatus",
    href: "https://exatusgene.com",
    logo: <img className="tile-logo tall-logo" style={{ maxHeight: 72 }} src="/brand-exatus.png" alt="Exatus Gene" />,
    role: "Saúde & Genética",
    desc: "Testes genéticos avançados, pesquisa clínica e soluções para clínicas de fertilidade.",
    link: "exatusgene.com →",
  },
  {
    id: "bigwolf",
    href: "https://www.bigwolfloja.com",
    logo: <img src="/brand-bigwolf.png" alt="Big Wolf" />,
    role: "Moda & Vestuário",
    desc: "Loja de roupas e moda casual masculina e feminina — camisetas, moletons, jaquetas e acessórios.",
    link: "bigwolfloja.com →",
  },
  {
    id: "agetra",
    href: "http://agetra.com.br",
    logo: <img className="tile-logo tall-logo" style={{ maxHeight: 76 }} src="/brand-agetra.png" alt="Agetra Gráfica" />,
    role: "Gráfica & Impressão",
    desc: "Gráfica completa — impressos, comunicação visual, papelaria e soluções gráficas para empresas.",
    link: "agetra.com.br →",
  },
  {
    id: "gilioli",
    href: "https://www.instagram.com/giliolicontabilidade/",
    logo: (
      <img
        className="tile-logo"
        src="/brand-gilioli.png"
        alt="Gilioli Organizações Contábeis"
      />
    ),
    role: "Contabilidade",
    desc: "Contábil, fiscal, folha de pagamento, abertura de empresas e consultoria para negócios.",
    link: "@giliolicontabilidade →",
  },
  {
    id: "mutalys",
    href: WHATSAPP,
    logo: <img className="tile-logo" src="/brand-mutalys.png" alt="Mutalys" />,
    role: "Gestão & Consultoria",
    desc: "Inteligência que transforma — otimização de processos, transformação de negócios e capacitação de equipes.",
    link: "Falar no WhatsApp →",
  },
  {
    id: "ordeclean",
    href: "https://www.instagram.com/ordeclean/",
    logo: <img src="/brand-ordeclean.svg" alt="Ordeclean" />,
    role: "Agro & Pecuária",
    desc: "Ordenhadeiras, peças, resfriadores e assistência técnica 24h — revendedor autorizado GMZ.",
    link: "@ordeclean →",
  },
  {
    id: "rbs",
    href: "https://www.gruporbs.com.br",
    logo: <img className="tile-logo" src="/brand-rbs.svg" alt="Grupo RBS" />,
    role: "Mídia & Comunicação",
    desc: "Maior grupo de comunicação do Sul do Brasil — TV, jornais, portais, rádios e soluções de publicidade (RBS ADS).",
    link: "gruporbs.com.br →",
  },
  {
    id: "mbx",
    href: "https://www.mbxglobalservices.com",
    logo: (
      <img
        className="tile-logo"
        src="/brand-mbx.png"
        alt="MBX Global Services"
      />
    ),
    role: "Logística & Comércio Exterior",
    desc: "Logística internacional e global sourcing — transporte, importação/exportação, aduana e procurement, com 22 anos de atuação.",
    link: "mbxglobalservices.com →",
  },
  {
    id: "gazzana",
    href: "https://www.instagram.com/gazzanaemaragno/",
    logo: (
      <img
        className="tile-logo"
        src="/brand-gazzana.png"
        alt="Gazzana & Maragno Assessoria Jurídica"
      />
    ),
    role: "Jurídico",
    desc: "Assessoria jurídica — contratos, regularizações, consultivo e demandas do dia a dia, para empresas e pessoas.",
    link: "@gazzanaemaragno →",
  },
  {
    id: "serafin",
    href: "https://www.serafinsuplementos.com.br",
    logo: (
      <img
        className="tile-logo"
        src="/brand-serafin.png"
        alt="Serafin Suplementos"
      />
    ),
    role: "Saúde & Suplementos",
    desc: "Suplementos — proteínas, creatina, pré-treino, emagrecedores, vitaminas e acessórios, com entrega para todo o Brasil.",
    link: "serafinsuplementos.com.br →",
  },
  {
    id: "alsus",
    href: "https://www.alsus.com.br",
    logo: <img className="tile-logo" src="/brand-alsus.png" alt="Grupo ALSUS" />,
    role: "Construção & Infraestrutura",
    desc: "Urbanização, infraestrutura e construção — loteamentos, terraplenagem, drenagem e obras.",
    link: "alsus.com.br →",
  },
  {
    id: "abraaofrainer",
    href: "https://abraaofrainer.com.br",
    logo: (
      <img
        className="tile-logo"
        src="/brand-abraaofrainer.png"
        alt="Abraão Frainer Filmes"
      />
    ),
    role: "Fotografia & Filmagem",
    desc: "Fotografia e filmagem na Serra Gaúcha — casamentos, pré-wedding, 15 anos e vídeos para empresas, com olhar de cinema.",
    link: "abraaofrainer.com.br →",
  },
  {
    id: "pulsar",
    href: "https://www.instagram.com/pulsarveranopolis/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-pulsar.png"
        alt="Pulsar Veranópolis"
      />
    ),
    role: "Saúde & Medicina",
    desc: "Clínica médica em Veranópolis — medicina de excelência, com consultas e exames em um só lugar.",
    link: "@pulsarveranopolis →",
  },
  {
    id: "detoni",
    href: "https://www.instagram.com/detoniodonto/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-detoni.png"
        alt="De Toni Odontologia"
      />
    ),
    role: "Odontologia",
    desc: "Odontologia humanizada em Veranópolis — clínica geral, especializada em estética e implantes.",
    link: "@detoniodonto →",
  },
  {
    id: "vervue",
    href: "https://www.vervue.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-vervue.png"
        alt="Ótica VerVue"
      />
    ),
    role: "Ótica",
    desc: "Óculos de sol, armações e lentes de grau de grandes marcas — loja online com envio para todo o Brasil.",
    link: "vervue.com.br →",
  },
  {
    id: "studiotv",
    href: "https://www.studio.tv.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-studiotv.png"
        alt="Rádio Studio TV"
      />
    ),
    role: "Mídia & Comunicação",
    desc: "Rádio, TV e o Studio Notícias — o principal portal de notícias de Veranópolis e região.",
    link: "studio.tv.br →",
  },
  {
    id: "26fit",
    href: "https://26fit.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-26fit.png"
        alt="26fit"
      />
    ),
    role: "Academia & Fitness",
    desc: "A maior rede de academias do RS, com unidade em Veranópolis — musculação, aulas coletivas e funcional.",
    link: "26fit.com.br →",
  },
  {
    id: "prg",
    href: "https://construtoraprg.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 68, transform: "translateY(-4px)" }}
        src="/brand-prg.png"
        alt="Construtora PRG"
      />
    ),
    role: "Construção & Incorporação",
    desc: "Construtora de Gramado — empreendimentos de alto padrão, imóveis avulsos e arquitetura de interiores.",
    link: "construtoraprg.com.br →",
  },
  {
    id: "veranense",
    href: "https://www.instagram.com/padariaveranense/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-veranense.png"
        alt="Padaria e Confeitaria Veranense"
      />
    ),
    role: "Padaria & Confeitaria",
    desc: "Tradição que se renova desde 1973 — tortas, doces, salgados e cookies, em Veranópolis.",
    link: "@padariaveranense →",
  },
  {
    id: "paradouro470",
    href: "https://www.instagram.com/paradouro470/",
    logo: (
      <img
        className="tile-logo"
        src="/brand-paradouro470.png"
        alt="Paradouro 470 — Restaurante e Lancheria"
      />
    ),
    role: "Restaurante & Lancheria",
    desc: "Restaurante e lancheria na BR 470, em Veranópolis — diversidade no cardápio e qualidade em cada detalhe.",
    link: "@paradouro470 →",
  },
  {
    id: "farinvest",
    href: "https://farinvest.com.br",
    logo: (
      <img
        className="tile-logo"
        src="/brand-farinvest.png"
        alt="Farinvest Consórcios"
      />
    ),
    role: "Consórcios & Investimentos",
    desc: "Consórcios de imóveis e veículos, cartas contempladas e alavancagem patrimonial — corretor autorizado HS Consórcios.",
    link: "farinvest.com.br →",
  },
  {
    id: "sebilar",
    href: "https://sebilar.com.br",
    logo: (
      <img
        className="tile-logo"
        src="/brand-sebilar.png"
        alt="Sebilar Sistemas de Segurança"
      />
    ),
    role: "Sistemas de Segurança",
    desc: "Monitoramento e pronto atendimento 24 horas, sistemas eletrônicos de proteção e soluções em áudio e vídeo.",
    link: "sebilar.com.br →",
  },
  {
    id: "vsm",
    href: "https://vsm.ind.br",
    logo: (
      <img
        className="tile-logo"
        style={{ maxWidth: 190 }}
        src="/brand-vsm.png"
        alt="VSM — Componentes para Vidro Temperado"
      />
    ),
    role: "Componentes para Vidro Temperado",
    desc: "Indústria de perfis, acessórios, kits para box, guarnições e fitas para vidro temperado.",
    link: "vsm.ind.br →",
  },
  {
    id: "monteaurea",
    href: "https://www.instagram.com/monteaurea.joias/",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 60, transform: "translateY(-2px)" }}
        src="/brand-monteaurea.png"
        alt="Monte Aurea Jóias"
      />
    ),
    role: "Joalheria",
    desc: "Alianças, solitários, brincos, correntes e joias de formatura, com fabricação própria — Veranópolis e Porto Alegre.",
    link: "@monteaurea.joias →",
  },
  {
    id: "estribo",
    href: "https://www.instagram.com/estribohotelestancia/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-estribo.png"
        alt="Estribo Hotel Estância"
      />
    ),
    role: "Hotel Fazenda",
    desc: "Hotel fazenda em Santo Antônio da Patrulha/RS — hospedagem, gastronomia, SPA e eventos. 2º melhor do Brasil (2025/2026).",
    link: "@estribohotelestancia →",
  },
  {
    id: "astronet",
    href: "https://www.astronet.com.br",
    logo: (
      <img
        className="tile-logo"
        style={{ maxHeight: 54 }}
        src="/brand-astronet.png"
        alt="Astronet — Internet via Fibra Óptica"
      />
    ),
    role: "Internet & Telecom",
    desc: "Internet 100% fibra óptica em Veranópolis, Esteio e Sapucaia do Sul — banda ilimitada e atendimento humanizado.",
    link: "astronet.com.br →",
  },
  {
    id: "rometal",
    href: "https://www.rometal.com.br",
    logo: (
      <img
        className="tile-logo"
        style={{ maxWidth: 190 }}
        src="/brand-rometal.png"
        alt="Rometal"
      />
    ),
    role: "Sistemas & Acessórios para Móveis",
    desc: "Sistemas deslizantes para portas, puxadores, perfis e espelhos — soluções que valorizam móveis e ambientes.",
    link: "rometal.com.br →",
  },
  {
    id: "ipacol",
    href: "https://ipacol.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 72 }}
        src="/brand-ipacol.png"
        alt="Ipacol — Parceria de sol a sol"
      />
    ),
    role: "Máquinas Agrícolas",
    desc: "Máquinas e implementos agrícolas desde 1976 — do preparo do solo ao trato dos animais.",
    link: "ipacol.com.br →",
  },
  {
    id: "veranopolis",
    href: "https://www.veranopolis.rs.gov.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-veranopolis.png"
        alt="Prefeitura de Veranópolis"
      />
    ),
    role: "Poder Público Municipal",
    desc: "Prefeitura Municipal de Veranópolis/RS — serviços ao cidadão e às empresas do município.",
    link: "veranopolis.rs.gov.br →",
  },
  {
    id: "barbeariadopai",
    href: "https://www.instagram.com/barbearia.do.pai/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-barbeariadopai.png"
        alt="Barbearia do Pai"
      />
    ),
    role: "Barbearia",
    desc: "Barbearia em Veranópolis — cortes e barba com hora marcada e agendamento online.",
    link: "@barbearia.do.pai →",
  },
  {
    id: "dubom",
    href: wa("Olá Paulo! Quero me conectar com a Dubom Fertilizantes do ecossistema."),
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-dubom.png"
        alt="Dubom Fertilizantes"
      />
    ),
    role: "Fertilizantes & Adubos Orgânicos",
    desc: "Fabricação e comercialização de adubos orgânicos para jardinagem, horticultura e agricultura.",
    link: "Falar no WhatsApp →",
  },
  {
    id: "floriculturaalma",
    href: "https://www.instagram.com/floriculturaalma/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-floriculturaalma.png"
        alt="Floricultura Alma"
      />
    ),
    role: "Floricultura",
    desc: "Flores para celebrar quem importa — arranjos exclusivos, presentes e paisagismo.",
    link: "@floriculturaalma →",
  },
  {
    id: "jogastore",
    href: "https://www.instagram.com/jogastore23/",
    logo: (
      <img
        className="tile-logo"
        src="/brand-jogastore.png"
        alt="JO-GA Store"
      />
    ),
    role: "Moda & Vestuário",
    desc: "Loja de roupas em Veranópolis — somente produtos originais.",
    link: "@jogastore23 →",
  },
  {
    id: "asx",
    href: "https://asxsolucoeslogisticas.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 72 }}
        src="/brand-asx.png"
        alt="ASX Soluções Logísticas"
      />
    ),
    role: "Transporte & Logística",
    desc: "Transporte de cargas com cobertura nacional — dedicada, fracionada e lotação, com frota própria e seguro.",
    link: "asxsolucoeslogisticas.com.br →",
  },
  {
    id: "145cafe",
    href: "https://www.instagram.com/145cafe/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-145cafe.png"
        alt="145 Café"
      />
    ),
    role: "Cafeteria",
    desc: "Cafeteria — “o café nos move”. Cafés e um menu para acompanhar.",
    link: "@145cafe →",
  },
  {
    id: "marangoni",
    href: "https://www.instagram.com/marangoniatacado/",
    logo: (
      <img
        className="tile-logo"
        src="/brand-marangoni.png"
        alt="Marangoni Atacado e Varejo"
      />
    ),
    role: "Mercado & Atacado",
    desc: "Mercado, atacado e varejo no Centro de Veranópolis — para casa e para o seu negócio.",
    link: "@marangoniatacado →",
  },
  {
    id: "mga",
    href: "https://www.mga.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 68, transform: "translateY(-4px)" }}
        src="/brand-mga.png"
        alt="MGA Válvulas Industriais"
      />
    ),
    role: "Válvulas Industriais",
    desc: "Fabricante de válvulas de esfera, peças em PTFE e microfundidos desde 1991, com certificação ISO 9001.",
    link: "mga.com.br →",
  },
  {
    id: "dnlinfo",
    href: wa("Olá Paulo! Quero me conectar com a DNL Informática do ecossistema."),
    logo: (
      <img
        className="tile-logo"
        src="/brand-dnlinfo.png"
        alt="DNL Informática"
      />
    ),
    role: "Informática & Assistência Técnica",
    desc: "Assistência técnica de informática em Veranópolis.",
    link: "Falar no WhatsApp →",
  },
  {
    id: "amparo",
    href: "https://amparoseguros.com.br",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 64, transform: "translateY(-2px)" }}
        src="/brand-amparo.png"
        alt="Amparo Seguros"
      />
    ),
    role: "Seguros",
    desc: "Corretora de seguros para família e empresa — automóvel, residencial, vida e mais.",
    link: "amparoseguros.com.br →",
  },
  {
    id: "casanostra",
    href: "https://www.instagram.com/casanostra_rs/",
    logo: (
      <img
        className="tile-logo tall-logo"
        src="/brand-casanostra.png"
        alt="Casa Nostra Materiais de Construção"
      />
    ),
    role: "Materiais de Construção",
    desc: "Materiais de construção e acabamentos em Veranópolis — Grupo Mapracon.",
    link: "@casanostra_rs →",
  },
  {
    id: "coexistir",
    href: "https://www.instagram.com/coenegocios/",
    logo: (
      <img
        className="tile-logo tall-logo"
        style={{ maxHeight: 76 }}
        src="/brand-coexistir.png"
        alt="Coexistir — Centro de Desenvolvimento"
      />
    ),
    role: "Desenvolvimento de Pessoas & Negócios",
    desc: "Mentorias, consultorias, cursos, treinamentos e aconselhamento para pessoas e negócios.",
    link: "@coenegocios →",
  },
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

              <HeroAI />

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
                  Formado em <strong>Administração de Empresas</strong> e{" "}
                  <strong>Corretor de Imóveis</strong>, soma{" "}
                  <strong>
                    mais de 15 anos de experiência na área comercial e de vendas
                  </strong>
                  . Ao longo dessa trajetória, com forte atuação em prospecção
                  de clientes, construiu uma{" "}
                  <strong>rede de contatos ampla e diversa</strong>, que
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

            <BrandsCarousel brands={BRANDS} />

            <p className="brands-note">
              <a href="/rede" style={{ color: "var(--gold-2)" }}>Ver todas as empresas →</a>
              {"  ·  "}E a sua marca? <a href="#contato" style={{ color: "var(--gold-2)" }}>Faça parte da rede →</a>
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

            {/* Hub de segmentos (feixes de conexão) */}
            <SegmentHub nodes={HUB_NODES} />

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
                  s: "Inteligência Territorial",
                  logo: "/brand-native.png",
                  i: "F",
                },
                {
                  t: "Conheço o Paulo há anos e ao longo desse tempo pude vivenciar o impacto das relações que ele tem com diversos negócios em diversos nichos. Posso afirmar que esse ecossistema pode auxiliar muito qualquer negócio a prosperar.",
                  a: "Executiva de Vendas",
                  s: "Grupo RBS",
                  logo: "/brand-rbs.svg",
                  i: "R",
                },
                {
                  t: "Estar dentro do ecossistema do Paulo abriu portas reais para a Visara. Ele entende de gente e de negócio — apresenta a pessoa certa e o negócio flui.",
                  a: "Visara Digital",
                  s: "Agência Digital",
                  mark: "visara",
                  i: "V",
                },
              ].map((d) => (
                <article className="testimonial" key={d.a}>
                  <div className="mark" aria-hidden="true">
                    &ldquo;
                  </div>
                  <p>{d.t}</p>
                  <div className="author">
                    {d.logo ? (
                      <img className="t-logo" src={d.logo} alt={d.a} />
                    ) : d.mark === "visara" ? (
                      <span className="visara-mark t-visara">
                        <span className="dot" aria-hidden="true" />
                        VISARA
                      </span>
                    ) : (
                      <div className="av" aria-hidden="true">
                        {d.i}
                      </div>
                    )}
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
              <span className="btn insta-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
                Seguir
                <span className="insta-btn-arrow">→</span>
              </span>
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
            <div className="lead-divider">ou deixe seu pedido por aqui</div>
            <LeadForm />
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
              <a href="/rede">Todas as empresas</a>
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
              {" · "}
              <a className="fc-admin" href="/area/paulo">
                Painel do Paulo
              </a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
