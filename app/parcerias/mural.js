// Mural de Oportunidades: o "classificados" da rede.
// - Procuro: preciso de fornecedor, serviço ou profissional (grátis para publicar;
//   responder é do Plano Ecossistema — é ali que a empresa fecha negócio)
// - Ofereço: condição especial, capacidade disponível, parceria (só Plano)
// - Vaga: vaga de emprego (só Plano para publicar; candidatar-se é livre e
//   aparece também na página pública /vagas)
// - Recomendo: o membro recomenda um profissional ou empresa de confiança
//   (grátis; só entra no ar depois da aprovação do Paulo)

export const MURAL_TIPOS = {
  procuro: {
    label: "Procuro",
    titulo: "O que você procura?",
    exemplo: "Ex.: 500 caixas de papelão por mês",
    desc: "Fornecedor, serviço ou profissional que você precisa.",
    acao: "Tenho interesse",
  },
  ofereco: {
    label: "Ofereço",
    titulo: "O que você oferece?",
    exemplo: "Ex.: 10% de desconto para membros da rede",
    desc: "Condição especial, capacidade disponível ou parceria.",
    acao: "Tenho interesse",
  },
  vaga: {
    label: "Vaga de emprego",
    titulo: "Qual é a vaga?",
    exemplo: "Ex.: Auxiliar administrativo",
    desc: "Vaga na sua empresa: aparece também na página pública de vagas.",
    acao: "Quero me candidatar",
  },
  recomendo: {
    label: "Recomendo",
    titulo: "Quem você recomenda?",
    exemplo: "Ex.: Eletricista João Silva",
    desc: "Profissional ou empresa de confiança. Passa pela aprovação do Paulo.",
    acao: "",
  },
};
export const MURAL_TIPO_IDS = Object.keys(MURAL_TIPOS);

export const REGIMES = ["CLT", "Estágio", "PJ", "Freelancer", "Temporário", "Jovem aprendiz"];

export const MURAL_DIAS = 30; // cada publicação fica no ar por 30 dias
export const MURAL_MAX_ATIVOS = 5; // publicações no ar ao mesmo tempo, por membro
export const MURAL_MAX_INTERESSES = 60;
export const RECOMENDO_DIAS = 90; // recomendação aprovada fica 90 dias no ar
// precisa da aprovação do Paulo antes de aparecer
export const pedeAprovacao = (tipo) => tipo === "recomendo";

// o que pede o Plano Ecossistema
export const publicarPedePlano = (tipo) => tipo === "ofereco" || tipo === "vaga";
export const responderPedePlano = (tipo) => tipo === "procuro";

// ---------- PLANOS ----------
// grátis (cadastro) · Básico · Premium. O Paulo libera o plano de cada membro no
// painel depois do pagamento; o membro guarda "basico" ou "premium" em plano.
// (Para trocar nome ou preço, é só mudar aqui: o site e a área leem daqui.)
export const PLANOS = {
  gratis: {
    nome: "Grátis",
    preco: "R$ 0",
    sub: "Para entrar na rede e resolver o que você precisa.",
    beneficios: [
      "Concierge de IA e Monte meu time",
      "Diretório da rede (Chave PK avulsa, valor com o Paulo)",
      "Publicar o que você procura no Mural",
      "Recomendar profissionais de confiança",
      "Pedir obra, projeto, gestão e venda de imóvel",
    ],
  },
  basico: {
    nome: "Básico",
    preco: "R$ 37",
    sub: "Para quem quer fazer negócio dentro da rede.",
    beneficios: [
      "Tudo do plano Grátis",
      "2 Chaves PK por mês: o Paulo apresenta você ao dono da empresa",
      "Publicar vagas de emprego (também na página pública /vagas)",
      "Indicar negócios e receber bonificação",
      "Responder a quem procura fornecedor ou serviço",
      "Publicar ofertas e condições para a rede",
      "Ver quem se interessou e falar direto",
    ],
  },
  premium: {
    nome: "Premium",
    preco: "R$ 97",
    sub: "Para empresas que querem aparecer e vender mais.",
    beneficios: [
      "Tudo do plano Básico",
      "Chaves PK sem limite, com prioridade na análise",
      "Topo da sua categoria no diretório, com selo Premium",
      "Prioridade quando o Paulo monta os times do concierge",
      "Divulgação da empresa no Instagram do Paulo",
      "Acesso aos extras: Destaque, Plano de Vendas e Gestão",
    ],
  },
};
// extras do Premium (abas): somam ao valor do plano, combinados com o Paulo
export const EXTRAS_PREMIUM = [
  {
    id: "destaque",
    nome: "Destaque",
    valor: "a combinar",
    itens: [
      "Empresa em destaque na página inicial e no Mural",
      "Parceiro do Mês: post e stories no Instagram do Paulo",
      "Presença no Café do Ecossistema",
    ],
  },
  {
    id: "vendas",
    nome: "Plano de Vendas",
    valor: "comissão sobre as vendas",
    itens: [
      "O Paulo representa a sua empresa e leva os seus produtos e serviços para a rede e os contatos dele",
      "Indicação da sua empresa nos times e nos projetos do Paulo",
      "Comissão sobre as vendas, combinada direto com o Paulo",
    ],
  },
  {
    id: "gestao",
    nome: "Gestão",
    valor: "mensalidade a combinar",
    itens: [
      "O Paulo ao seu lado, mês a mês, no planejamento e nos números",
      "Processos, custos, metas e negociações da empresa",
      "Para a empresa ou para a sua vida financeira",
    ],
  },
];
export const PLANO_NIVEIS = ["basico", "premium"];

// Chave PK por plano: quantas por mês (Premium sem limite). Sem plano, ou
// passando do limite, a Chave é "avulsa": o Paulo analisa e passa o valor.
export const CHAVES_POR_MES = { basico: 2, premium: Infinity };
export const inicioDoMes = (agora = Date.now()) => {
  const d = new Date(agora);
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
};
// quantas Chaves a pessoa ainda tem neste mês (null = sem plano)
export const chavesRestantes = (plano, usadasNoMes) => {
  const lim = CHAVES_POR_MES[plano];
  if (!lim) return null;
  return lim === Infinity ? Infinity : Math.max(0, lim - usadasNoMes);
};
// compatível com o que já existia: o plano pago "de entrada" é o Básico
export const PLANO = { ...PLANOS.basico, nome: "Plano Básico" };
