// Empreendimentos (lançamentos e loteamentos) que o Paulo vende como corretor
// autorizado. Fotos em /public/empreendimentos (por enquanto as dos sites
// oficiais; trocar pelas do material das incorporadoras quando chegar).
// categoria: terrenos | casas | apartamentos | pavilhoes | comercial | rural

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

export const EMPREENDIMENTOS = [
  {
    id: "jardim-europa",
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
