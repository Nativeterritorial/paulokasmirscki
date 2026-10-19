// Mural de Oportunidades: o "classificados" da rede.
// - Procuro: preciso de fornecedor, serviço ou profissional (grátis para publicar;
//   responder é do Plano Ecossistema — é ali que a empresa fecha negócio)
// - Ofereço: condição especial, capacidade disponível, parceria (só Plano)
// - Vaga: vaga de emprego (só Plano para publicar; candidatar-se é livre e
//   aparece também na página pública /vagas)

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
};
export const MURAL_TIPO_IDS = Object.keys(MURAL_TIPOS);

export const REGIMES = ["CLT", "Estágio", "PJ", "Freelancer", "Temporário", "Jovem aprendiz"];

export const MURAL_DIAS = 30; // cada publicação fica no ar por 30 dias
export const MURAL_MAX_ATIVOS = 5; // publicações no ar ao mesmo tempo, por membro
export const MURAL_MAX_INTERESSES = 60;

// o que pede o Plano Ecossistema
export const publicarPedePlano = (tipo) => tipo === "ofereco" || tipo === "vaga";
export const responderPedePlano = (tipo) => tipo === "procuro";

// nome e preço do plano (ajuste quando decidirem: o resto do site lê daqui)
export const PLANO = {
  nome: "Plano Ecossistema",
  preco: "", // ex.: "R$ 97/mês" — vazio mostra "condições com o Paulo"
  beneficios: [
    "Responder a quem procura fornecedor ou serviço",
    "Publicar ofertas e condições para a rede",
    "Publicar vagas de emprego (também na página pública)",
    "Ver quem se interessou e falar direto",
  ],
};
