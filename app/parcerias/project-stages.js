// As seis etapas do modelo "Da ideia à abertura". Usadas na página pública
// (/parcerias), no painel do Paulo e no acompanhamento do cliente.
export const PROJECT_STAGES = [
  { id: "viabilidade", nome: "Ideia e viabilidade", desc: "Validar o modelo, o público e os custos antes de investir." },
  { id: "formalizacao", nome: "Formalização", desc: "Tipo de empresa, CNPJ, contratos e alvarás, com contador e advogado." },
  { id: "ponto", nome: "Ponto", desc: "Compra ou locação do imóvel certo e a regularização dele." },
  { id: "obra", nome: "Obra e estrutura", desc: "Reforma, materiais, móveis, segurança, internet e informática." },
  { id: "protecao", nome: "Proteção e crédito", desc: "Seguros e alternativas de crédito para o negócio começar protegido." },
  { id: "lancamento", nome: "Marca e lançamento", desc: "Site, material gráfico, vídeo e divulgação na mídia local." },
];

export const STAGE_IDS = PROJECT_STAGES.map((s) => s.id);

// situação de cada etapa
export const STAGE_STATUS = [
  { id: "pendente", label: "A fazer" },
  { id: "andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
];

export const STAGE_STATUS_IDS = STAGE_STATUS.map((s) => s.id);

export const stageStatusLabel = (id) =>
  (STAGE_STATUS.find((s) => s.id === id) || STAGE_STATUS[0]).label;

// quantas etapas concluídas (pra barra de progresso)
export const projectProgress = (project) =>
  STAGE_IDS.filter((id) => project?.etapas?.[id]?.status === "concluida").length;
