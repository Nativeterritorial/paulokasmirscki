import { COMPANIES } from "../app/area/companies";
import { getCustomCompanies } from "./store";

// Junta as empresas fixas (curadas no código, com logo na home) com as que o
// Paulo cadastra pelo painel (guardadas no banco). Se um id coincidir, a versão
// do painel prevalece. Sempre disponível no servidor (a IA, o diretório etc.).
export async function getAllCompanies() {
  let custom = [];
  try {
    custom = await getCustomCompanies();
  } catch (e) {
    custom = [];
  }
  const map = new Map(COMPANIES.map((c) => [c.id, c]));
  for (const c of custom) {
    if (c && c.id) map.set(c.id, c);
  }
  return [...map.values()];
}
