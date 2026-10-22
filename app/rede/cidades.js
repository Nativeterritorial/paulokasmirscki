// Cidades da rede (coordenadas do centro de cada cidade) e em quais cidades
// fica cada empresa: o campo "cidade" da empresa (uma ou uma lista), ou a
// cidade citada na descrição; sem nenhuma, Veranópolis (a base do Paulo).
export const CIDADES = {
  "Veranópolis": [-28.9358, -51.5494],
  "Vila Flores": [-28.8622, -51.505],
  "Porto Alegre": [-30.0346, -51.2177],
  "Bento Gonçalves": [-29.1699, -51.5185],
  "Caxias do Sul": [-29.1678, -51.1794],
  "Nova Prata": [-28.7836, -51.6106],
  "Cotiporã": [-28.9894, -51.6977],
  "Fagundes Varela": [-28.8794, -51.7008],
  "Nova Bassano": [-28.729, -51.707],
  "Guaporé": [-28.8458, -51.8956],
  "Dois Lajeados": [-28.9839, -51.8394],
  "Vacaria": [-28.5079, -50.9339],
  "Gramado": [-29.3734, -50.8762],
  "Canoas": [-29.9178, -51.1839],
  "Gravataí": [-29.944, -50.9919],
  "São Leopoldo": [-29.7604, -51.1477],
  "Portão": [-29.7015, -51.2429],
  "Santo Antônio da Patrulha": [-29.8268, -50.5175],
  "Torres": [-29.3353, -49.7269],
  "Holambra": [-22.6405, -47.0487],
  "Rio de Janeiro": [-22.9068, -43.1729],
  "Marau": [-28.4498, -52.1986],
  "Flores da Cunha": [-29.0288, -51.1818],
  "Paraí": [-28.5964, -51.7896],
  "São Paulo": [-23.5505, -46.6333],
  "Miami": [25.7617, -80.1918],
  "Dubai": [25.2048, 55.2708],
  "Luanda": [-8.839, 13.2894],
  "Passo de Torres": [-29.3097, -49.7203],
  "Pelotas": [-31.7654, -52.3376],
  "Canela": [-29.3654, -50.8114],
  "Carlos Barbosa": [-29.2975, -51.5028],
  "Santa Catarina": [-27.5954, -48.548],
  "Nova York": [40.7128, -74.006],
  "China": [31.2304, 121.4737],
  "Portugal": [38.7223, -9.1393],
  "Inglaterra": [51.5072, -0.1276],
};
export const BASE = "Veranópolis";

// nomes mais longos primeiro ("Santo Antônio da Patrulha" antes de "Porto"...)
const NOMES = Object.keys(CIDADES).sort((a, b) => b.length - a.length);

export function cidadesDe(c) {
  const fixas = [].concat(c.cidade || []).filter((n) => CIDADES[n]);
  if (fixas.length) return fixas;
  const txt = `${c.descricao || ""} ${c.nome || ""}`;
  return [NOMES.find((n) => txt.includes(n)) || BASE];
}

// empresas agrupadas por cidade, para o mapa
export function porCidade(companies) {
  const g = {};
  for (const c of companies) {
    for (const cid of cidadesDe(c)) {
      (g[cid] ||= { cidade: cid, pos: CIDADES[cid], empresas: [] }).empresas.push({
        id: c.id,
        nome: c.nome,
        segmento: c.segmento,
      });
    }
  }
  return Object.values(g).sort((a, b) => b.empresas.length - a.empresas.length);
}
