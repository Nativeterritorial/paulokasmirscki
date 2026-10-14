// Definições do modelo "Gestor de negócios". Usadas no painel do Paulo (aba
// Gestão), no acompanhamento do cliente (Minha gestão) e na limpeza dos dados.

// prazo de cada meta
export const GOAL_TERMS = [
  { id: "curto", label: "Curto prazo" },
  { id: "medio", label: "Médio prazo" },
  { id: "longo", label: "Longo prazo" },
];
export const GOAL_TERM_IDS = GOAL_TERMS.map((g) => g.id);
export const goalTermLabel = (id) =>
  (GOAL_TERMS.find((g) => g.id === id) || GOAL_TERMS[0]).label;

// situação de cada meta (mesmos rótulos das etapas de projeto)
export const GOAL_STATUS = [
  { id: "pendente", label: "A fazer" },
  { id: "andamento", label: "Em andamento" },
  { id: "concluida", label: "Concluída" },
];
export const GOAL_STATUS_IDS = GOAL_STATUS.map((s) => s.id);
export const goalStatusLabel = (id) =>
  (GOAL_STATUS.find((s) => s.id === id) || GOAL_STATUS[0]).label;

export const MAX_METAS = 12;
export const MAX_RELATORIOS = 36;

// "2026-10" -> "Outubro de 2026"
export const monthLabel = (mes) => {
  const m = /^(\d{4})-(\d{2})$/.exec(String(mes || ""));
  if (!m) return "";
  const s = new Date(Number(m[1]), Number(m[2]) - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// mês atual no formato "2026-10"
export const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const goalsDone = (g) =>
  (g?.metas || []).filter((m) => m.status === "concluida").length;
