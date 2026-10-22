import Effects from "./effects";
import CookieBanner from "./cookie";
import HeroAI from "./hero-ai";
import RedeViva from "./rede-viva";
import { SegIcon } from "./segment-icons";
import SignupForm from "./ecossistema/signup-form";
import BrandsCarousel from "./brands-carousel";
import MobileMenu from "./mobile-menu";
import NetworkBG from "./network-bg";

const WHATSAPP = "https://wa.me/5554996505799";
const INSTAGRAM = "https://instagram.com/paulokasmirscki";
// redes do rodapé: deixe "" para não mostrar o botão
const FACEBOOK = "https://www.facebook.com/paulo.kasmirscki";
const LINKEDIN = "https://www.linkedin.com/in/paulo-kasmirscki-72719796/";
const TELEFONE = "(54) 99650-5799";
const EMAIL = "paulokasmirscki@gmail.com";
const ENDERECO = "Centro, Veranópolis - RS";
const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Centro, Veranópolis - RS"
)}`;

const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

const SEGMENTOS = [
  "Imóveis & Construção",
  "Arquitetura",
  "Finanças & Investimentos",
  "Contabilidade",
  "Jurídico",
  "Tecnologia & IA",
  "Marketing & Digital",
  "Mídia & Comunicação",
  "Saúde & Bem-estar",
  "Estética & Beleza",
  "Gastronomia",
  "Turismo & Hotelaria",
  "Esporte & Lazer",
  "Comércio & Varejo",
  "Moda & Vestuário",
  "Serviços",
  "Transporte & Logística",
  "Agro & Pecuária",
  "Indústria & Móveis",
  "Sustentabilidade & Meio Ambiente",
  "Negócios & Empresas",
];

// pergunta que cada segmento já deixa escrita no concierge da área
const SEG_PERGUNTA = {
  "Imóveis & Construção": "Procuro ajuda com imóveis e construção",
  Arquitetura: "Procuro um arquiteto de confiança",
  "Finanças & Investimentos": "Procuro orientação sobre finanças e investimentos",
  Contabilidade: "Procuro um contador de confiança",
  Jurídico: "Procuro um advogado de confiança",
  "Tecnologia & IA": "Procuro uma empresa de tecnologia e IA",
  "Marketing & Digital": "Procuro uma empresa de marketing digital",
  "Mídia & Comunicação": "Procuro mídia e comunicação para divulgar meu negócio",
  "Saúde & Bem-estar": "Procuro um profissional de saúde e bem-estar",
  "Estética & Beleza": "Procuro estética e beleza",
  Gastronomia: "Procuro um restaurante ou serviço de gastronomia",
  "Turismo & Hotelaria": "Procuro turismo e hospedagem",
  "Esporte & Lazer": "Procuro esporte e lazer",
  "Comércio & Varejo": "Procuro uma loja na rede",
  "Moda & Vestuário": "Procuro moda e vestuário",
  Serviços: "Procuro um prestador de serviço de confiança",
  "Transporte & Logística": "Procuro transporte e logística",
  "Agro & Pecuária": "Procuro fornecedores para o agro",
  "Indústria & Móveis": "Procuro uma indústria ou fábrica de móveis",
  "Sustentabilidade & Meio Ambiente": "Procuro uma solução ambiental para o meu negócio",
  "Negócios & Empresas": "Procuro parceiros de negócio na rede",
};
const segLink = (seg) =>
  `/area?pergunta=${encodeURIComponent(SEG_PERGUNTA[seg] || `Procuro ${seg} na rede`)}`;

// posições dos nós em volta do centro (50,50), raio 40 — 10 segmentos em destaque,
// um a cada 36° (nomes curtos nas pontas esquerda/direita pra não cortar)
const HUB_NODES = [
  { label: "Imóveis & Construção", x: 50, y: 10 },
  { label: "Finanças & Investimentos", x: 73.51, y: 17.64 },
  { label: "Negócios & Empresas", x: 88.04, y: 37.64 },
  { label: "Marketing & Digital", x: 88.04, y: 62.36 },
  { label: "Indústria & Móveis", x: 73.51, y: 82.36 },
  { label: "Saúde & Bem-estar", x: 50, y: 90 },
  { label: "Transporte & Logística", x: 26.49, y: 82.36 },
  { label: "Agro & Pecuária", x: 11.96, y: 62.36 },
  { label: "Gastronomia", x: 11.96, y: 37.64 },
  { label: "Tecnologia & IA", x: 26.49, y: 17.64 },
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
    href: "/imoveis",
    logo: (
      <span className="pk-wordmark">
        <span className="pk-name">PAULO KASMIRSCKI</span>
        <span className="pk-sub">Corretor de Imóveis</span>
      </span>
    ),
    role: "Imóveis · CRECI-RS 77988",
    desc: "A atuação do próprio Paulo no mercado imobiliário, dentro do ecossistema.",
    link: "Ver imóveis à venda →",
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
            <a href="/ecossistema">Ecossistema</a>
            <a href="#rede">A Rede</a>
            <a href="#segmentos">Segmentos</a>
            <a href="/imoveis">Imóveis</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-login" href="/area" aria-label="Entrar na Área de Membros">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
              </svg>
              <span className="nav-login-txt">Entrar</span>
            </a>
            <a className="fp-top" href="#faca-parte">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                <path d="M19 15v4M17 17h4" />
              </svg>
              Faça parte
            </a>
            <MobileMenu />
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <NetworkBG className="net-hero" />
          <div className="container hero-inner">
            <div className="reveal">
              <div className="eyebrow">
                O conector do <span className="marca-pk">Ecossistema <span className="pk-selo">PK</span></span>
              </div>
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
                <a className="btn btn-primary" href="#faca-parte">
                  Quero fazer parte
                </a>
                <a className="btn btn-outline" href="/ecossistema">
                  Conhecer o Ecossistema
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
                  <div className="num gold-text">24h</div>
                  <div className="label">Concierge de IA</div>
                </div>
                <div className="stat">
                  <div className="num gold-text">1</div>
                  <div className="label">Pessoa conduzindo cada passo</div>
                </div>
              </div>
            </div>

            <aside className="hero-photo">
              <a
                href="#faca-parte"
                className="hero-seal"
                aria-label="Faça parte do Ecossistema PK"
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
                <img className="seal-logo" src="/logo-mark.svg" alt="" aria-hidden="true" />
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
                  <strong>Paulo Kasmirscki</strong> destaca-se por sua{" "}
                  <strong>comunicação magnética e cordialidade genuína</strong>.
                  Com uma facilidade rara de acolher as pessoas através da
                  gentileza e do respeito, ele cria ambientes de total{" "}
                  <strong>confiança</strong> onde as conversas fluem naturalmente — abrindo caminhos
                  sólidos para grandes negócios.
                </p>
                <p>
                  Formado em <strong>Administração de Empresas</strong> e
                  atuando como <strong>Corretor de Imóveis</strong> (CRECI-RS
                  77988), soma{" "}
                  <strong>
                    mais de 15 anos de experiência na área comercial e de vendas
                  </strong>
                  , com forte atuação em prospecção de clientes. Ao longo dessa
                  trajetória, construiu uma{" "}
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
                  <div className="attr-ico" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
                      <path d="M16 4.5a3.5 3.5 0 0 1 0 6.5" />
                      <path d="M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
                    </svg>
                  </div>
                  <div>
                    <h4>Facilidade de aproximar pessoas</h4>
                    <p>
                      Comunicação natural que abre portas e cria confiança desde
                      a primeira conversa.
                    </p>
                  </div>
                </div>
                <div className="attr">
                  <div className="attr-ico" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      <path d="M5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      <path d="M19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      <path d="M12 6v5" />
                      <path d="M12 11l-5.6 6.4" />
                      <path d="M12 11l5.6 6.4" />
                    </svg>
                  </div>
                  <div>
                    <h4>Rede de contatos diversa</h4>
                    <p>
                      Relacionamentos sólidos espalhados por múltiplos setores e
                      segmentos do mercado.
                    </p>
                  </div>
                </div>
                <div className="attr">
                  <div className="attr-ico" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17l6-6 4 4 8-8" />
                      <path d="M15 7h6v6" />
                    </svg>
                  </div>
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

        {/* Marquee */}
        <div className="marquee-band" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((k) => (
              <div className="marquee-group" key={k}>
                {[
                  "Conexões",
                  "Negócios",
                  "Networking",
                  "Indicações",
                  "Parcerias",
                  "Confiança",
                  "Oportunidades",
                  "Contatos",
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

        {/* 02 — A Rede (marcas) */}
        <section id="rede">
          <GhostMarquee word="Rede" />
          <div className="container">
            <div className="section-head">
              <div className="section-num">
                02 <span>/ A Rede</span>
              </div>
              <h2>
                Marcas que já fazem parte do{" "}
                <em className="nowrap">
                  Ecossistema <span className="pk-selo">PK</span>
                </em>
              </h2>
              <p>
                Empresas e profissionais de confiança, de vários segmentos,
                conectados para crescer juntos. O Paulo é a ponte: apresenta,
                conduz e acompanha cada conexão.
              </p>
              <ul className="rede-valores">
                <li>🤝 Apresentadas pelo Paulo</li>
                <li>🔑 Contato direto com quem decide</li>
                <li>📈 Negócios gerados dentro da rede</li>
              </ul>
            </div>

            <BrandsCarousel brands={BRANDS} />

            <p className="brands-note">
              <a href="/rede" style={{ color: "var(--gold-2)" }}>Ver todas as empresas →</a>
              {"  ·  "}<a href="/rede#mapa" style={{ color: "var(--gold-2)" }}>Ver no mapa 🗺️</a>
              {"  ·  "}E a sua marca? <a href="/ecossistema#faca-parte" style={{ color: "var(--gold-2)" }}>Faça parte da rede →</a>
            </p>
          </div>
        </section>

        {/* 03 — Segmentos (editorial hover) */}
        <section id="segmentos">
          <GhostMarquee word="Mercados" />
          <div className="container">
            <div className="section-head">
              <div className="section-num">
                03 <span>/ Segmentos atendidos</span>
              </div>
              <h2>
                Uma rede que cruza <em>vários mercados</em>
              </h2>
            </div>

            {/* Hub de segmentos (feixes de conexão) */}
            <RedeViva
              nodes={HUB_NODES}
              links={Object.fromEntries(HUB_NODES.map((n) => [n.label, segLink(n.label)]))}
            />

            {/* Grade com todos os segmentos: cada um abre o concierge */}
            <p className="seg-dica">
              Toque num segmento e a <strong>IA da rede</strong> mostra o caminho.
            </p>
            <div className="seg-grid fade-up">
              {SEGMENTOS.map((seg, i) => (
                <a className="seg-tag has-ico" key={seg} href={segLink(seg)} style={{ "--i": i }}>
                  <span className="ico">
                    <SegIcon label={seg} size={14} />
                  </span>
                  {seg}
                  <span className="seg-seta" aria-hidden="true">→</span>
                </a>
              ))}
              <a
                className="seg-tag seg-outro"
                href={`${WHATSAPP}?text=${encodeURIComponent("Olá Paulo! Não achei o meu segmento no site. Procuro uma conexão em: ")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--i": SEGMENTOS.length }}
              >
                ➕ Não achou o seu? Fale com o Paulo
              </a>
            </div>

          </div>
        </section>

        {/* 04 — Depoimentos */}
        <section id="depoimentos">
          <GhostMarquee word="Confiança" />
          <div className="container">
            <div className="section-head center">
              <div className="section-num">
                04 <span>/ Depoimentos</span>
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

        {/* 05 — A Plataforma */}
        <section id="plataforma">
          <GhostMarquee word="Plataforma" />
          <div className="container">
            <div className="plat-grid">
              <div className="plat-text">
                <div className="section-num">
                  05 <span>/ A Plataforma</span>
                </div>
                <h2 style={{ marginTop: "16px" }}>
                  A plataforma do{" "}
                  <em className="nowrap">
                    Ecossistema <span className="pk-selo">PK</span>
                  </em>
                </h2>
                <p className="plat-lead">
                  Na área de membros você pede, encontra e fecha negócio dentro
                  da rede: a IA agiliza e o Paulo conduz cada passo.
                </p>

                <div className="plat-benefits plat-grid6">
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">🤖</div>
                    <div>
                      <h4>Concierge com IA</h4>
                      <p>Diga o que precisa: a IA mostra o caminho certo dentro da rede.</p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">🧩</div>
                    <div>
                      <h4>Monte meu time</h4>
                      <p>Para um projeto maior, a IA monta o time e o Paulo conduz.</p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">🔑</div>
                    <div>
                      <h4>Chave PK</h4>
                      <p>O Paulo apresenta você direto a quem decide na empresa.</p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">📌</div>
                    <div>
                      <h4>Mural de Oportunidades</h4>
                      <p>Procuro, ofereço, vagas e recomendações da rede.</p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">💰</div>
                    <div>
                      <h4>Indicações</h4>
                      <p>Indique negócios e imóveis e receba bonificação.</p>
                    </div>
                  </div>
                  <div className="plat-b">
                    <div className="plat-ic" aria-hidden="true">📋</div>
                    <div>
                      <h4>Tudo acompanhado</h4>
                      <p>Pedidos e conversas com o Paulo num só lugar.</p>
                    </div>
                  </div>
                </div>

                <div className="hero-actions" style={{ marginTop: "34px" }}>
                  <a className="btn btn-primary" href="#faca-parte">
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
                  <span className="pp-dot" /> Concierge do Ecossistema PK · IA
                </div>
                <div className="pp-chat">
                  <div className="pp-bubble pp-me">quero construir um pavilhão</div>
                  <div className="pp-bubble pp-bot">
                    Montei o seu <b>time</b> para construir o pavilhão 🏗️ Marque
                    o que você precisa, que o Paulo conduz.
                  </div>
                </div>
                <div className="pp-time">
                  <div className="pp-time-tt">🧩 Time · Construir o pavilhão</div>
                  <div className="pp-svc on">
                    <span className="pp-check">✓</span>
                    <span className="pp-svc-nm">Projeto e aprovação na prefeitura</span>
                    <span className="pp-svc-or">Parceiros na rede</span>
                  </div>
                  <div className="pp-svc on">
                    <span className="pp-check">✓</span>
                    <span className="pp-svc-nm">Terraplenagem do terreno</span>
                    <span className="pp-svc-or">Parceiros na rede</span>
                  </div>
                  <div className="pp-svc on">
                    <span className="pp-check">✓</span>
                    <span className="pp-svc-nm">Estrutura pré-moldada</span>
                    <span className="pp-svc-or">Parceiros na rede</span>
                  </div>
                  <div className="pp-svc">
                    <span className="pp-check"></span>
                    <span className="pp-svc-nm">Financiamento da obra</span>
                    <span className="pp-svc-or">O Paulo busca para você</span>
                  </div>
                  <span className="pp-pedir">Pedir meu time →</span>
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
              <div className="insta-perfil">
                <span className="insta-anel" aria-hidden="true">
                  <span className="insta-foto" />
                </span>
                <div className="insta-left">
                  <div className="insta-kick">Acompanhe no Instagram</div>
                  <div className="name serif">
                    Paulo Kasmirscki
                    {/* selo do Ecossistema PK (não é o verificado do Instagram) */}
                    <svg className="insta-selo" viewBox="0 0 24 24" aria-label="Conector oficial do Ecossistema PK" role="img">
                      <title>Conector oficial do Ecossistema PK</title>
                      <defs>
                        <linearGradient id="seloPk" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0" stopColor="#6fffbf" />
                          <stop offset="0.5" stopColor="#7cc4ff" />
                          <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#seloPk)"
                        d="M12 1.5l2.4 1.9 3-.3 1.1 2.8 2.8 1.1-.3 3 1.9 2.4-1.9 2.4.3 3-2.8 1.1-1.1 2.8-3-.3L12 22.5l-2.4-1.9-3 .3-1.1-2.8-2.8-1.1.3-3L1.1 12 3 9.6l-.3-3 2.8-1.1L6.6 2.7l3 .3z"
                      />
                      <path d="M7.6 12.3l3 3 5.8-6.1" fill="none" stroke="#0b1440" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="handle">@paulokasmirscki</div>
                  <p className="insta-bio">Bastidores da rede, novas empresas e oportunidades do Ecossistema PK.</p>
                </div>
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

        {/* Faça parte: cadastro com acesso imediato */}
        <section id="faca-parte" className="cta">
          <GhostMarquee word="Conecte" />
          <NetworkBG className="net-cta" densidade={0.7} />
          <div className="container">
            <div className="eyebrow">Faça parte</div>
            <h2 className="fp-title">
              Entre para o <em>Ecossistema <span className="pk-selo">PK</span></em>
            </h2>
            <p>
              Uma rede de empresas e profissionais de confiança, com uma pessoa
              conduzindo cada passo. Veja como podemos crescer juntos.
              Cadastre-se e use a plataforma hoje mesmo.
            </p>
            <ol className="fp-steps">
              <li>
                <span>1</span>Cadastre-se
              </li>
              <li>
                <span>2</span>Receba seu acesso na hora
              </li>
              <li>
                <span>3</span>Conecte-se à rede
              </li>
            </ol>
            <div className="fp-form">
              <SignupForm />
            </div>
            <p className="fp-login">
              Já é membro? <a href="/area">Entrar na Área de Membros →</a>
            </p>
          </div>
        </section>
      </main>

      {/* WhatsApp flutuante */}
      <a
        className="wa-float"
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <span className="wa-float-tip" aria-hidden="true">
          Falar no WhatsApp
        </span>
        <svg viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      {/* Footer multi-coluna */}
      <footer className="footer-rich" id="contato">
        <div className="container">
          <div className="footer-card fc-grid">
            <div className="fc-brand">
              <div className="fc-id">
                <img src="/logo-mark.svg" alt="" />
                <div className="brand-name">Paulo Kasmirscki</div>
              </div>
              <p>
                O conector do ecossistema.
                <br />
                Conectando pessoas e gerando negócios.
              </p>
              <a className="fc-btn fc-member" href="/area">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                Área de Membros
              </a>
            </div>

            <div className="fc-contact">
              <div className="kick">Contato</div>
              <ul className="fc-list">
                <li>
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                    <span className="fc-ic">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20l1.2-5A8.5 8.5 0 1 1 21 11.5z" /><path d="M9 10a4 4 0 0 0 5 5" /></svg>
                    </span>
                    <span>
                      <small>Telefone e WhatsApp</small>
                      {TELEFONE}
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${EMAIL}`}>
                    <span className="fc-ic">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
                    </span>
                    <span>
                      <small>E-mail</small>
                      {EMAIL}
                    </span>
                  </a>
                </li>
                <li>
                  <a href={MAPS} target="_blank" rel="noopener noreferrer">
                    <span className="fc-ic">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" /><path d="M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
                    </span>
                    <span>
                      <small>Localização</small>
                      {ENDERECO}
                    </span>
                  </a>
                </li>
              </ul>
              <div className="fc-social">
                <a className="fc-btn" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></svg>
                  Instagram
                </a>
                {FACEBOOK && (
                  <a className="fc-btn" href={FACEBOOK} target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h-3a4 4 0 0 0-4 4v3H5v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    Facebook
                  </a>
                )}
                {LINKEDIN && (
                  <a className="fc-btn" href={LINKEDIN} target="_blank" rel="noopener noreferrer">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></svg>
                    LinkedIn
                  </a>
                )}
              </div>
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
