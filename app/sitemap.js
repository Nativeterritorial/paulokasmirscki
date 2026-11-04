import { COMPANIES } from "./area/companies";
import { EMPREENDIMENTOS, IMOVEIS, urlDoImovel } from "./imoveis/empreendimentos";
import { getVitrine } from "../lib/store";

// refeito a cada hora, para incluir os anúncios novos do painel
export const revalidate = 3600;

export default async function sitemap() {
  const base = "https://www.paulokasmirscki.com.br";
  // página de cada imóvel: os fixos do site e os anúncios do painel
  let vitrine = [];
  try {
    vitrine = await getVitrine();
  } catch (e) {}
  const imoveis = [...IMOVEIS, ...EMPREENDIMENTOS, ...vitrine].map((e) => ({
    url: base + urlDoImovel(e),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/ecossistema`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/imoveis`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/rede`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...imoveis,
    ...COMPANIES.map((c) => ({
      url: `${base}/rede/${c.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
