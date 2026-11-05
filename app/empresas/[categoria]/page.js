import { notFound } from "next/navigation";
import { acharCategoria, categoriasComPagina, introDaCategoria } from "../../rede/categorias";
import { Chamada, ListaEmpresas, Moldura, Trilha } from "../pagina";

export function generateStaticParams() {
  return categoriasComPagina().map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }) {
  const { categoria } = await params;
  const cat = acharCategoria(categoria);
  if (!cat) return {};
  return {
    title: `${cat.nome} — empresas de confiança | Ecossistema PK`,
    description: `${introDaCategoria(cat.nome)} Empresas de confiança da rede do Paulo Kasmirscki em Veranópolis e na Serra Gaúcha.`,
    alternates: { canonical: `/empresas/${cat.slug}` },
  };
}

export default async function Categoria({ params }) {
  const { categoria } = await params;
  const cat = acharCategoria(categoria);
  if (!cat) notFound();

  const outras = categoriasComPagina().filter((c) => c.slug !== cat.slug);
  return (
    <Moldura>
      <Trilha itens={[["A Rede", "/rede"], ["Categorias", "/empresas"], [cat.nome]]} />
      <div className="cat-hero" style={{ "--seg": cat.cor }}>
        <div className="eyebrow">Empresas da rede</div>
        <h1>{cat.nome}</h1>
        <p className="cat-intro">
          {introDaCategoria(cat.nome)} Empresas de confiança da rede do Ecossistema PK, conectadas pessoalmente pelo
          Paulo.
        </p>
        {cat.cidades.length > 0 && (
          <div className="cat-chips">
            {cat.cidades.map((cid) => (
              <a key={cid.slug} href={`/empresas/${cat.slug}/${cid.slug}`}>
                📍 {cat.nome} em {cid.nome}
              </a>
            ))}
          </div>
        )}
      </div>

      <ListaEmpresas empresas={cat.empresas} titulo={cat.nome} url={`/empresas/${cat.slug}`} />

      <Chamada assunto={cat.nome.toLowerCase()} />

      <section className="cat-outras">
        <h2>Outras categorias</h2>
        <div className="cat-chips">
          {outras.map((c) => (
            <a key={c.slug} href={`/empresas/${c.slug}`}>
              {c.nome}
            </a>
          ))}
        </div>
      </section>
    </Moldura>
  );
}
