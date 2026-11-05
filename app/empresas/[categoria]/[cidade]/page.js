import { notFound } from "next/navigation";
import { acharCategoria, categoriasComPagina, introDaCategoria } from "../../../rede/categorias";
import { Chamada, ListaEmpresas, Moldura, Trilha } from "../../pagina";

export function generateStaticParams() {
  return categoriasComPagina().flatMap((c) => c.cidades.map((cid) => ({ categoria: c.slug, cidade: cid.slug })));
}

function achar(categoria, cidade) {
  const cat = acharCategoria(categoria);
  const cid = cat?.cidades.find((x) => x.slug === cidade);
  return cid ? { cat, cid } : null;
}

export async function generateMetadata({ params }) {
  const { categoria, cidade } = await params;
  const achado = achar(categoria, cidade);
  if (!achado) return {};
  const { cat, cid } = achado;
  return {
    title: `${cat.nome} em ${cid.nome} — empresas de confiança | Ecossistema PK`,
    description: `${cat.nome} em ${cid.nome}: ${introDaCategoria(cat.nome).toLowerCase()} Empresas de confiança da rede do Paulo Kasmirscki.`,
    alternates: { canonical: `/empresas/${cat.slug}/${cid.slug}` },
  };
}

export default async function CategoriaNaCidade({ params }) {
  const { categoria, cidade } = await params;
  const achado = achar(categoria, cidade);
  if (!achado) notFound();
  const { cat, cid } = achado;

  // outras categorias com página nesta mesma cidade
  const naCidade = categoriasComPagina().filter(
    (c) => c.slug !== cat.slug && c.cidades.some((x) => x.slug === cid.slug)
  );
  const outrasCidades = cat.cidades.filter((x) => x.slug !== cid.slug);

  return (
    <Moldura>
      <Trilha
        itens={[["A Rede", "/rede"], ["Categorias", "/empresas"], [cat.nome, `/empresas/${cat.slug}`], [cid.nome]]}
      />
      <div className="cat-hero" style={{ "--seg": cat.cor }}>
        <div className="eyebrow">Empresas da rede · {cid.nome}</div>
        <h1>
          {cat.nome} em <em>{cid.nome}</em>
        </h1>
        <p className="cat-intro">
          {introDaCategoria(cat.nome)} Empresas de confiança em {cid.nome}, conectadas pessoalmente pelo Paulo.
        </p>
      </div>

      <ListaEmpresas
        empresas={cid.empresas}
        titulo={`${cat.nome} em ${cid.nome}`}
        url={`/empresas/${cat.slug}/${cid.slug}`}
        mostrarCidade={false}
      />

      <Chamada assunto={`${cat.nome.toLowerCase()} em ${cid.nome}`} />

      {naCidade.length > 0 && (
        <section className="cat-outras">
          <h2>Mais empresas em {cid.nome}</h2>
          <div className="cat-chips">
            {naCidade.map((c) => (
              <a key={c.slug} href={`/empresas/${c.slug}/${cid.slug}`}>
                {c.nome}
              </a>
            ))}
          </div>
        </section>
      )}
      {outrasCidades.length > 0 && (
        <section className="cat-outras">
          <h2>{cat.nome} em outras cidades</h2>
          <div className="cat-chips">
            {outrasCidades.map((x) => (
              <a key={x.slug} href={`/empresas/${cat.slug}/${x.slug}`}>
                {x.nome}
              </a>
            ))}
            <a href={`/empresas/${cat.slug}`}>Todas as cidades</a>
          </div>
        </section>
      )}
    </Moldura>
  );
}
