// Empreendimentos (lançamentos e loteamentos) que o Paulo vende como corretor
// autorizado. Fotos em /public/empreendimentos (por enquanto as dos sites
// oficiais; trocar pelas do material das incorporadoras quando chegar).
// categoria: terrenos | casas | apartamentos | pavilhoes | comercial | rural
// (uma ou uma lista, quando o empreendimento aparece em mais de uma aba)

export const CATEGORIAS = [
  { id: "", label: "Todos", icon: "✨" },
  { id: "terrenos", label: "Terrenos", icon: "🌳" },
  { id: "casas", label: "Casas", icon: "🏡" },
  { id: "apartamentos", label: "Apartamentos", icon: "🏢" },
  { id: "pavilhoes", label: "Pavilhões", icon: "🏭" },
  { id: "comercial", label: "Comercial", icon: "🏪" },
  { id: "rural", label: "Rural", icon: "🌾" },
];

// tipo do anúncio da vitrine -> aba
export const categoriaDoTipo = (tipo) =>
  ({
    Casa: "casas",
    Apartamento: "apartamentos",
    Terreno: "terrenos",
    "Sala comercial": "comercial",
    "Loja / ponto comercial": "comercial",
    Pavilhão: "pavilhoes",
    "Área rural": "rural",
  })[tipo] || "outros";

export const naCategoria = (e, cat) => !cat || [].concat(e.categoria).includes(cat);

// busca sem acento e sem diferença de maiúsculas; o código vale com ou sem
// traço (PK-1001, pk1001 ou só 1001)
export const normBusca = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export const textoDoImovel = (e) => {
  const t = normBusca(
    [e.codigo, e.nome, e.titulo, e.tipo, e.status, e.cidade, e.bairro, e.resumo, e.descricao, e.palavras, ...(e.destaques || [])].join(" ")
  );
  return t + " " + t.replace(/[^a-z0-9]/g, "");
};

export const EMPREENDIMENTOS = [
  {
    id: "dhunas",
    codigo: "PK-1002",
    nome: "Dhunas Marine Resort",
    incorporadora: "Dwell Construções e Incorporações · Alsus Urbanizadora",
    cidade: "Passo de Torres (SC)",
    categoria: ["terrenos", "casas"],
    tipo: "Condomínio náutico",
    quartos: 3,
    palavras: "praia litoral marina náutico",
    status: "Lançamento",
    resumo:
      "O primeiro condomínio náutico às margens do Rio Mampituba, em Passo de Torres, ao lado de Torres: a conexão entre o rio, o mar, as dunas e a cidade. Casas Brise, Wave e Sand em 6 projetos personalizáveis.",
    destaques: [
      "Mais de 108.000 m² de área total",
      "Marina privativa e píer",
      "Praia de areia, piscinas e lounge",
      "Casas de 171 a 365 m², de 3 a 5 suítes",
    ],
    fotos: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `/empreendimentos/dhunas-${n}.jpg`),
    site: "https://www.instagram.com/dhunasoficial/",
    siteLabel: "Instagram oficial ↗",
  },
  {
    id: "jardim-europa",
    codigo: "PK-1003",
    nome: "Jardim Europa Residences",
    incorporadora: "Grupo Roncato",
    cidade: "Veranópolis",
    categoria: "terrenos",
    tipo: "Condomínio fechado",
    status: "Em construção",
    resumo:
      "Condomínio fechado na região mais nobre de Veranópolis, perto dos Pavilhões da Femaçã e do Clube de Tiro: segurança, exclusividade e lazer completo num espaço planejado.",
    destaques: ["Portaria e segurança", "Academia e quadras de esporte", "Quiosque e áreas de convivência", "38 unidades disponíveis"],
    fotos: [1, 2, 3, 4, 5, 6, 7].map((n) => `/empreendimentos/jardim-europa-${n}.jpg`),
    site: "https://gruporoncato.com/empreendimentos/jardim-europa-veranopolis-rs",
  },
  {
    id: "vista-do-vale",
    codigo: "PK-1004",
    nome: "Vista do Vale",
    incorporadora: "Imobiliária Favero",
    cidade: "Veranópolis",
    categoria: "terrenos",
    tipo: "Loteamento",
    status: "Poucos lotes disponíveis",
    resumo:
      "Loteamento premium na Rua Getúlio Vargas, em Veranópolis: altitude elevada, vista exclusiva para Bento Gonçalves e Caxias do Sul e perto de farmácias, supermercado, escolas e padarias.",
    destaques: ["100% regularizado", "Água, energia, esgoto e asfalto", "Vista para o vale", "Condições especiais por faixa de renda"],
    fotos: [1, 2, 3].map((n) => `/empreendimentos/vista-do-vale-${n}.jpg`),
    site: "https://vistadovaleveranopolis.com.br/",
  },
  {
    id: "florescer",
    codigo: "PK-1005",
    nome: "Florescer Parque Residencial",
    incorporadora: "Florescer Negócios Imobiliários",
    cidade: "Vila Flores",
    categoria: "terrenos",
    tipo: "Loteamento",
    status: "Lotes à venda",
    resumo:
      "Parque residencial planejado numa região alta de Vila Flores, com horizonte amplo do nascer ao pôr do sol, a 600 m do complexo Vila Capuchinhos e com acesso rápido à BR-470.",
    destaques: ["Lotes com testada mínima de 14 m", "Ruas asfaltadas e vias largas", "Infraestrutura completa instalada", "Áreas residenciais e mistas"],
    fotos: [1, 2, 3].map((n) => `/empreendimentos/florescer-${n}.jpg`),
    site: "https://florescerparqueresidencial.com.br/",
  },
];

// Imóveis prontos à venda (casas, apartamentos...) que o Paulo vende em
// parceria com outras imobiliárias (o nome da parceira não aparece no site).
// Fotos em /public/imoveis. Código: PK-1001, PK-1002... (o próximo livre)
export const IMOVEIS = [
  {
    id: "casa-femaca",
    codigo: "PK-1001",
    nome: "Casa de alto padrão no Bairro Femaçã",
    parceiro: "Venda em parceria",
    cidade: "Veranópolis",
    categoria: "casas",
    tipo: "Casa",
    status: "À venda",
    preco: "R$ 2.800.000",
    valor: 2800000,
    quartos: 4,
    bairro: "Femaçã",
    palavras: "permuta troca aceita imóvel piscina esquina suíte",
    precoNota: "Aceita imóvel de menor valor na negociação",
    resumo:
      "Casa completa, sofisticada e planejada, de esquina, com vista livre e exuberante. Construída sobre 2 terrenos (750 m²), com 377,19 m² de área construída, piscina aquecida, quiosque com churrasqueira e energia solar. Vendida porteira fechada.",
    destaques: [
      "377,19 m² construídos em 750 m² de terreno",
      "4 dormitórios, 1 suíte master com closet e hidromassagem",
      "Piscina aquecida e quiosque com churrasqueira",
      "Garagem para 2 carros + 3 vagas no pátio",
      "Placas solares e aquecimento solar com apoio a gás",
      "Aberturas em PVC, vidros duplos e câmeras",
    ],
    fotos: Array.from({ length: 20 }, (_, i) => `/imoveis/casa-femaca-${i + 1}.jpg`),
  },
];
