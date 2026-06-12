import { COMPANIES } from "../app/area/companies";
import { getCustomCompanies } from "./store";

// normaliza nome pra comparar (sem acento, minúsculo, sem espaços extras)
function normName(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Junta as empresas fixas (curadas no código, com logo na home) com as que o
// Paulo cadastra pelo painel (guardadas no banco). Empresa cadastrada que
// coincide com uma fixa (mesmo id OU mesmo nome) é ignorada — a fixa prevalece,
// evitando duplicar quando promovemos uma empresa pra vitrine.
export async function getAllCompanies() {
  let custom = [];
  try {
    custom = await getCustomCompanies();
  } catch (e) {
    custom = [];
  }
  const fixedIds = new Set(COMPANIES.map((c) => c.id));
  const fixedNames = new Set(COMPANIES.map((c) => normName(c.nome)));
  const extras = custom.filter(
    (c) =>
      c &&
      c.id &&
      !fixedIds.has(c.id) &&
      !fixedNames.has(normName(c.nome))
  );
  return [...COMPANIES, ...extras];
}

// Empresas cadastradas pelo Paulo que colidem com uma fixa (pra avisar no painel)
export function findDuplicateCustom(custom = [], fixed = COMPANIES) {
  const ids = new Set(fixed.map((c) => c.id));
  const names = new Set(fixed.map((c) => normName(c.nome)));
  return custom.filter(
    (c) => c && (ids.has(c.id) || names.has(normName(c.nome)))
  );
}
