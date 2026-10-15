// Pedidos feitos pelos membros na Área de Membros: "+ Novo projeto" (Da ideia
// à abertura), "+ Nova gestão" (Gestor de negócios) e "+ Cadastrar imóvel"
// (Quero vender meu imóvel). O Paulo vê nas abas Projetos, Gestão e Imóveis.

export const PEDIDO_TIPOS = ["projeto", "gestao", "imovel", "chave"];

export const PEDIDO_STATUS = [
  { id: "novo", label: "Recebido", desc: "O Paulo recebeu o seu pedido e vai entrar em contato pelo WhatsApp." },
  { id: "conversa", label: "Em conversa", desc: "O Paulo está conversando com você para entender os detalhes." },
  { id: "aceito", label: "Aprovado", desc: "Pedido aprovado! O acompanhamento aparece aqui na sua área." },
  { id: "encerrado", label: "Encerrado", desc: "Esse pedido foi encerrado. Fale com o Paulo se quiser retomar." },
];
export const PEDIDO_STATUS_IDS = PEDIDO_STATUS.map((s) => s.id);
// textos próprios do imóvel (o resto usa os gerais)
const IMOVEL_DESC = {
  aceito: "Imóvel aprovado! O Paulo vai preparar o anúncio com você.",
  encerrado: "Esse cadastro foi encerrado. Fale com o Paulo se quiser retomar.",
};
// Chave PK: as etapas têm nomes próprios (Pedido → Análise → Apresentação)
const CHAVE_STATUS = {
  novo: { label: "Pedido recebido", desc: "O Paulo recebeu o pedido da sua Chave e vai analisar." },
  conversa: { label: "Em análise", desc: "O Paulo está avaliando e combinando a apresentação." },
  aceito: { label: "Apresentado", desc: "Apresentação feita! O Paulo conectou você com a empresa." },
  encerrado: { label: "Encerrado", desc: "Esse pedido foi encerrado. Fale com o Paulo se quiser retomar." },
};
export const pedidoStatus = (id, tipo) => {
  const st = PEDIDO_STATUS.find((s) => s.id === id) || PEDIDO_STATUS[0];
  if (tipo === "chave") return { ...st, ...CHAVE_STATUS[st.id] };
  return tipo === "imovel" && IMOVEL_DESC[st.id] ? { ...st, desc: IMOVEL_DESC[st.id] } : st;
};
export const statusLabel = (id, tipo) => pedidoStatus(id, tipo).label;

// em que ponto está a ideia (pedido de projeto)
export const FASES_PROJETO = [
  "Só a ideia",
  "Já fiz algumas pesquisas",
  "Já tenho o ponto/imóvel",
  "Já tenho CNPJ",
];

// há quanto tempo a empresa existe (pedido de gestão)
export const TEMPO_EMPRESA = [
  "Menos de 1 ano",
  "De 1 a 3 anos",
  "De 3 a 10 anos",
  "Mais de 10 anos",
];

// áreas em que o dono quer ajuda (iguais às da página /parcerias)
export const AREAS_GESTAO = [
  "Planejamento estratégico",
  "Gestão financeira",
  "Organização de processos",
  "Visão de mercado",
  "Negociação e parcerias",
];

// tipo de imóvel e situação da documentação (Quero vender meu imóvel)
export const TIPOS_IMOVEL = [
  "Casa",
  "Apartamento",
  "Terreno",
  "Sala comercial",
  "Loja / ponto comercial",
  "Pavilhão",
  "Área rural",
  "Outro",
];
export const SITUACAO_IMOVEL = [
  "Quitado, com escritura",
  "Financiado",
  "Em inventário",
  "Precisa regularizar",
  "Não sei",
];

export const MAX_PEDIDOS_ABERTOS = 5;
