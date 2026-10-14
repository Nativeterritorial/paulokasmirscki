// Andamento de uma indicação de negócio. A ordem aqui é a ordem do processo;
// "encerrada" é o desfecho de quando o negócio não avança.
export const REFERRAL_STATUS = [
  { id: "registrada", label: "Registrada", desc: "Recebida — aguardando a confirmação do Paulo." },
  { id: "confirmada", label: "Confirmada", desc: "Indicação válida. O Paulo vai entrar em contato." },
  { id: "negociacao", label: "Em negociação", desc: "O Paulo está conduzindo o negócio." },
  { id: "fechada", label: "Negócio fechado", desc: "A bonificação sai quando a comissão do negócio for paga." },
  { id: "paga", label: "Bonificação paga", desc: "O valor já foi repassado a você." },
  { id: "encerrada", label: "Encerrada", desc: "O negócio não avançou." },
];

export const STATUS_IDS = REFERRAL_STATUS.map((s) => s.id);

export const statusInfo = (id) =>
  REFERRAL_STATUS.find((s) => s.id === id) || REFERRAL_STATUS[0];

// protocolo curto a partir do timestamp do registro (o mesmo aparece no painel)
export const protocolo = (t) => `IND-${Number(t).toString(36).toUpperCase()}`;
