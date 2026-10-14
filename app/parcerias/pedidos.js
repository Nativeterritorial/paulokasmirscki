// Pedidos feitos pelos membros na Área de Membros: "+ Novo projeto" (Da ideia
// à abertura) e "+ Nova gestão" (Gestor de negócios). O Paulo vê nas abas
// Projetos e Gestão do painel e transforma em projeto/gestão.

export const PEDIDO_TIPOS = ["projeto", "gestao"];

export const PEDIDO_STATUS = [
  { id: "novo", label: "Recebido", desc: "O Paulo recebeu o seu pedido e vai entrar em contato pelo WhatsApp." },
  { id: "conversa", label: "Em conversa", desc: "O Paulo está conversando com você para entender os detalhes." },
  { id: "aceito", label: "Aprovado", desc: "Pedido aprovado! O acompanhamento aparece aqui na sua área." },
  { id: "encerrado", label: "Encerrado", desc: "Esse pedido foi encerrado. Fale com o Paulo se quiser retomar." },
];
export const PEDIDO_STATUS_IDS = PEDIDO_STATUS.map((s) => s.id);
export const pedidoStatus = (id) =>
  PEDIDO_STATUS.find((s) => s.id === id) || PEDIDO_STATUS[0];

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

export const MAX_PEDIDOS_ABERTOS = 5;
