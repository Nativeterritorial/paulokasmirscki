// Categorias das empresas da rede: usadas no diretório da Área de Membros e
// nas páginas públicas por categoria e cidade (/empresas/gastronomia/veranopolis).
import { COMPANIES } from "../area/companies";
import { cidadesDe } from "./cidades";

// segmento de cada empresa -> categoria com ícone (e cor) no diretório
export const SEG_MAP = [
  // veículos primeiro: "Estética Automotiva" é carro, não salão de beleza
  [/veículo|automóve|automotiv|concession|motos/i, "Veículos", "#46d6ff"],
  [/academia|fitness|esporte|esportivo|treinamento|crossfit|bicicleta|bike|música|shows/i, "Esporte & Lazer", "#5b9bff"],
  [/agro|pecu|fertiliz|agríc|cogumelo|máquina|ferrament/i, "Agro & Pecuária", "#6fffbf"],
  [/barbearia|estética|beleza/i, "Estética & Beleza", "#ff9bd2"],
  [/cafeteria|restaurante|lancheria|padaria|gastronomia|pizzaria|gastropub|cervejaria|vinícola|vinho|carnes|empório|frigorífic|pastel/i, "Gastronomia", "#ffb27a"],
  [/vidro|válvula|(^|[^\p{L}])móve|indústr/iu, "Indústria & Móveis", "#9fb6d9"],
  [/comunicação|mídia|gráfica|fotografia/i, "Mídia & Comunicação", "#ff8a8a"],
  [/consórcio|investimento|seguro|finan/i, "Finanças & Investimentos", "#f5c04e"],
  [/arquitet|urbanis|interiores/i, "Arquitetura", "#c9a8ff"],
  // jurídico antes de imóveis: "Cartório — Registro Civil e de Imóveis" é jurídico
  [/jurídic|cartório|registro/i, "Jurídico", "#c9a8ff"],
  [/construção|construtora|incorpora|loteamento|urbaniza|esquadria|tinta|engenharia|materiais|hidráulic|imóve|territorial/i, "Imóveis & Construção", "#f5c04e"],
  [/contabil/i, "Contabilidade", "#46d6ff"],
  [/marketing/i, "Marketing & Digital", "#b88cff"],
  [/informática|internet|telecom|sistemas|tecnologia|eletrônic|apple/i, "Tecnologia & IA", "#46d6ff"],
  [/educação|ensino|escola/i, "Educação", "#5b9bff"],
  [/logística|transporte/i, "Transporte & Logística", "#9fb6d9"],
  [/moda|vestuário|confecç|camiseta|boné|uniforme|fardamento|etiqueta|têxt|joalheria|ótica/i, "Moda & Vestuário", "#ff9bd2"],
  [/saúde|nutri|fisioterap|pilates|odonto|medicina|genética|suplemento/i, "Saúde & Bem-estar", "#6fffbf"],
  [/hotel|turismo|turíst|pousada|evento|viage|balão|balões/i, "Turismo & Hotelaria", "#ffb27a"],
  [/floricultura|flores|plantas|mudas|paisag|jardin|solar|energia|elétric/i, "Sustentabilidade & Meio Ambiente", "#6fffbf"],
  [/mercado|atacado|comércio|varejo|bazar|utilidades|livraria|papelaria|colch/i, "Comércio & Varejo", "#ffb27a"],
  [/desenvolvimento|gestão|consultoria|público|associação|entidade/i, "Negócios & Empresas", "#c9a8ff"],
];
export const segInfo = (segmento) => {
  const hit = SEG_MAP.find(([re]) => re.test(segmento));
  return hit ? { icon: hit[1], cor: hit[2] } : { icon: "Serviços", cor: "#9fb6d9" };
};

// texto de abertura de cada página de categoria
const INTRO = {
  "Veículos": "Concessionárias, lojas de motos, estética automotiva e serviços para o seu veículo.",
  "Esporte & Lazer": "Academias, complexos esportivos, lojas de esporte e opções de lazer.",
  "Agro & Pecuária": "Produtores, insumos, máquinas e serviços para o campo.",
  "Estética & Beleza": "Salões, barbearias, maquiadoras e clínicas de estética.",
  "Gastronomia": "Restaurantes, pizzarias, padarias, cafés, vinícolas e produtores de alimentos.",
  "Indústria & Móveis": "Indústrias, fábricas de móveis, vidraçarias e fornecedores industriais.",
  "Mídia & Comunicação": "Rádios, gráficas, fotógrafos, comunicadores e produtoras.",
  "Finanças & Investimentos": "Seguros, consórcios, investimentos e soluções financeiras.",
  "Arquitetura": "Arquitetos, urbanismo, design de interiores e decoração.",
  "Imóveis & Construção": "Construtoras, loteamentos, imobiliárias, engenharia e materiais de construção.",
  "Contabilidade": "Escritórios de contabilidade e serviços contábeis para empresas e pessoas.",
  "Jurídico": "Advogados, cartórios e serviços jurídicos.",
  "Marketing & Digital": "Agências, propaganda, tráfego pago, sites e marketing digital.",
  "Tecnologia & IA": "Informática, internet, sistemas, eletrônicos e inteligência artificial.",
  "Educação": "Escolas, cursos e capacitação.",
  "Transporte & Logística": "Transportadoras, logística e comércio exterior.",
  "Moda & Vestuário": "Lojas de roupas, confecções, uniformes, joalherias e óticas.",
  "Saúde & Bem-estar": "Clínicas, nutrição, fisioterapia, pilates, odontologia e bem-estar.",
  "Turismo & Hotelaria": "Hotéis, pousadas, turismo, viagens e espaços para eventos.",
  "Sustentabilidade & Meio Ambiente": "Floriculturas, paisagismo, energia solar e soluções sustentáveis.",
  "Comércio & Varejo": "Mercados, atacados, lojas, papelarias e comércio em geral.",
  "Negócios & Empresas": "Consultorias, gestão, associações e entidades empresariais.",
  "Serviços": "Prestadores de serviço de confiança para a sua casa e a sua empresa.",
};
export const introDaCategoria = (nome) => INTRO[nome] || "";

// "Estética & Beleza" -> "estetica-e-beleza"; "Veranópolis" -> "veranopolis"
export const slugify = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// página de cidade só com empresas suficientes (evita página quase vazia);
// toda categoria com ao menos 1 empresa tem página (os segmentos do início levam a ela)
const MIN_CIDADE = 3;
const MIN_CATEGORIA = 1;

const categoriaDe = (c) => segInfo(c.segmento).icon;

// todas as categorias com página: { nome, slug, cor, empresas, cidades: [{ nome, slug, empresas }] }
export function categoriasComPagina(companies = COMPANIES) {
  const mapa = {};
  for (const c of companies) {
    const nome = categoriaDe(c);
    const cat = (mapa[nome] ||= { nome, slug: slugify(nome), cor: segInfo(c.segmento).cor, empresas: [], porCidade: {} });
    cat.empresas.push(c);
    for (const cid of cidadesDe(c)) (cat.porCidade[cid] ||= []).push(c);
  }
  return Object.values(mapa)
    .filter((cat) => cat.empresas.length >= MIN_CATEGORIA)
    .map(({ porCidade, ...cat }) => ({
      ...cat,
      cidades: Object.entries(porCidade)
        .filter(([, emp]) => emp.length >= MIN_CIDADE)
        .map(([nome, empresas]) => ({ nome, slug: slugify(nome), empresas }))
        .sort((a, b) => b.empresas.length - a.empresas.length),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export const acharCategoria = (slug) => categoriasComPagina().find((c) => c.slug === slug) || null;

// endereço da página da categoria (e da cidade) de uma empresa, se existir
export function paginasDaEmpresa(c) {
  const cat = categoriasComPagina().find((x) => x.nome === categoriaDe(c));
  if (!cat) return null;
  const cid = cat.cidades.find((x) => cidadesDe(c).includes(x.nome));
  return { categoria: cat, cidade: cid || null };
}
