// Definições da vitrine de imóveis. Usadas no painel (aba Imóveis), nas
// páginas públicas (/imoveis) e na limpeza dos dados (lib/store.js).
// Os tipos de imóvel ficam em ../parcerias/pedidos (TIPOS_IMOVEL).

export const IMOVEL_STATUS = [
  { id: "rascunho", label: "Rascunho", desc: "Só você vê" },
  { id: "disponivel", label: "Disponível", desc: "Aparece na vitrine" },
  { id: "reservado", label: "Reservado", desc: "Aparece na vitrine com a etiqueta Reservado" },
  { id: "vendido", label: "Vendido", desc: "Sai da vitrine" },
];
export const IMOVEL_STATUS_IDS = IMOVEL_STATUS.map((s) => s.id);
export const imovelStatusLabel = (id) =>
  (IMOVEL_STATUS.find((s) => s.id === id) || IMOVEL_STATUS[0]).label;

// o que aparece na vitrine pública
export const VITRINE_STATUS = ["disponivel", "reservado"];

export const MAX_FOTOS_IMOVEL = 20;

// 650000 -> "R$ 650.000"
export const formatPreco = (n) =>
  Number(n) > 0
    ? "R$ " + Math.round(Number(n)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
    : "";

// texto livre do proprietário -> número em reais (ou 0 se não der pra entender)
// "R$ 650 mil" -> 650000 · "650.000,00" -> 650000 · "1,2 milhão" -> 1200000
export function parsePreco(txt) {
  const s = String(txt || "").toLowerCase().replace(/r\$|\s/g, "");
  const m = /^([\d.,]+)(milhões|milhoes|milhão|milhao|mil|mi|m|k)?/.exec(s);
  if (!m) return 0;
  let num = m[1];
  if (m[2]) {
    // com "mil"/"milhão" a vírgula é decimal: "1,2 milhão"
    num = Number(num.replace(/\./g, "").replace(",", "."));
    const mult = /^(mil|k)$/.test(m[2]) ? 1e3 : 1e6;
    return Number.isFinite(num) ? Math.round(num * mult) : 0;
  }
  // sem sufixo: "650.000,00" ou "650000"
  num = Number(num.replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(num) ? Math.round(num) : 0;
}

// código curto mostrado para o cliente ("IMV-3F9K")
export const imovelCodigo = (im) => "IMV-" + String(im?.id || "").slice(-5).toUpperCase();

// "Casa · 3 quartos · 180 m²"
export const imovelResumo = (im) =>
  [
    im.tipo,
    Number(im.quartos) > 0 ? `${im.quartos} ${Number(im.quartos) === 1 ? "quarto" : "quartos"}` : "",
    Number(im.metragem) > 0 ? `${im.metragem} m²` : "",
  ]
    .filter(Boolean)
    .join(" · ");
