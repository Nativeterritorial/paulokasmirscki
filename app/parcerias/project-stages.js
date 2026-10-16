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

// Trilha "Do Terreno às Chaves": as 11 fases da obra (0 a 10). O que o
// cliente vê — sem comissões, que ficam só com o Paulo.
export const OBRA_STAGES = [
  { id: "planejamento", n: 0, nome: "Planejamento financeiro", desc: "Orçamento, fonte de crédito (financiamento ou consórcio) e planejamento fiscal." },
  { id: "terreno", n: 1, nome: "Aquisição do terreno", desc: "Escolha, negociação e documentação do terreno ideal para o seu projeto." },
  { id: "levantamento", n: 2, nome: "Levantamento técnico", desc: "Topografia e sondagem de solo, antes de qualquer projeto." },
  { id: "arquitetonico", n: 3, nome: "Projeto arquitetônico", desc: "Plantas, fachada e memorial descritivo, com aprovação na Prefeitura." },
  { id: "complementares", n: 4, nome: "Projetos complementares", desc: "Estrutural, elétrico, hidrossanitário e telecomunicações, com ART." },
  { id: "licenciamento", n: 5, nome: "Licenciamento", desc: "Alvará de construção e licenças ambientais." },
  { id: "execucao", n: 6, nome: "Execução da obra", desc: "Terraplenagem, fundação, estrutura, alvenaria, telhado e instalações." },
  { id: "instalacoes", n: 7, nome: "Instalações especiais", desc: "Elétrica, hidráulica, climatização, energia solar e câmeras." },
  { id: "acabamentos", n: 8, nome: "Acabamentos", desc: "Pisos, pintura, marcenaria, bancadas e esquadrias." },
  { id: "externa", n: 9, nome: "Área externa", desc: "Paisagismo, calçadas, área gourmet e piscina." },
  { id: "entrega", n: 10, nome: "Regularização e entrega", desc: "Habite-se, averbação e a entrega das chaves." },
];

// parceiros da rede que já entram em cada fase (preenchidos ao criar a obra)
export const OBRA_RESPONSAVEIS = {
  planejamento: "Gilioli Organizações Contábeis",
  terreno: "Paulo Kasmirscki · Gazzana & Maragno",
  levantamento: "NATIVE",
  licenciamento: "Gazzana & Maragno",
  execucao: "Grupo ALSUS",
  entrega: "Paulo Kasmirscki · Gazzana & Maragno",
};

export const TRILHAS = {
  abertura: { nome: "Da ideia à abertura", stages: PROJECT_STAGES },
  obra: { nome: "Do Terreno às Chaves", stages: OBRA_STAGES },
};
export const TRILHA_IDS = Object.keys(TRILHAS);
export const trilhaOf = (p) => (TRILHAS[p?.trilha] ? p.trilha : "abertura");
export const stagesOf = (p) => TRILHAS[trilhaOf(p)].stages;
// número mostrado em cada etapa (a obra começa na fase 0)
export const stageNum = (s, i) => (typeof s.n === "number" ? s.n : i + 1);

// quantas etapas concluídas (pra barra de progresso)
export const projectProgress = (project) =>
  stagesOf(project).filter((s) => project?.etapas?.[s.id]?.status === "concluida").length;
