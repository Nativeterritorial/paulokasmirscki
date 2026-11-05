import { categoriasComPagina, introDaCategoria } from "../rede/categorias";
import { Chamada, Moldura, Trilha } from "./pagina";

export const metadata = {
  title: "Empresas por categoria — Ecossistema PK | Paulo Kasmirscki",
  description:
    "Encontre empresas de confiança em Veranópolis e na Serra Gaúcha por categoria: gastronomia, construção, saúde, beleza, marketing, serviços e mais.",
  alternates: { canonical: "/empresas" },
};

export default function Empresas() {
  const cats = categoriasComPagina();
  return (
    <Moldura>
      <Trilha itens={[["A Rede", "/rede"], ["Categorias"]]} />
      <div className="cat-hero">
        <div className="eyebrow">Ecossistema PK</div>
        <h1>
          Empresas por <em>categoria</em>
        </h1>
        <p className="cat-intro">
          Empresas de confiança de Veranópolis, da Serra Gaúcha e de outras regiões, conectadas pessoalmente pelo Paulo.
          Escolha uma categoria.
        </p>
      </div>
      <ul className="cat-grade">
        {cats.map((c) => (
          <li key={c.slug} style={{ "--seg": c.cor }}>
            <a href={`/empresas/${c.slug}`}>
              <strong>{c.nome}</strong>
              <span>{introDaCategoria(c.nome)}</span>
            </a>
            {c.cidades.length > 0 && (
              <div className="cat-grade-cid">
                {c.cidades.map((cid) => (
                  <a key={cid.slug} href={`/empresas/${c.slug}/${cid.slug}`}>
                    {cid.nome}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <Chamada assunto="uma empresa de confiança" />
    </Moldura>
  );
}
