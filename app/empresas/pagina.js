// Moldura das páginas públicas de empresas por categoria e cidade
// (/empresas, /empresas/gastronomia, /empresas/gastronomia/veranopolis).
// Feitas para o Google: título claro, lista de empresas com link para a
// página de cada uma e dados estruturados (ItemList). Sem contagem de empresas.
import { cidadesDe } from "../rede/cidades";

const SITE = "https://www.paulokasmirscki.com.br";
const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export function Moldura({ children }) {
  return (
    <div className="rede-page">
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <div className="nav-actions">
            <a className="fp-top" href="/#faca-parte">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                <path d="M19 15v4M17 17h4" />
              </svg>
              Faça parte
            </a>
          </div>
        </div>
      </header>
      <main className="container empresa-wrap">{children}</main>
    </div>
  );
}

// trilha: Rede › Gastronomia › Veranópolis
export function Trilha({ itens }) {
  return (
    <nav className="cat-trilha" aria-label="Você está em">
      {itens.map(([label, href], i) => (
        <span key={label}>
          {i > 0 && <span aria-hidden="true"> › </span>}
          {href ? <a href={href}>{label}</a> : <span>{label}</span>}
        </span>
      ))}
    </nav>
  );
}

// lista de empresas em cartões, com os dados estruturados para o Google
export function ListaEmpresas({ empresas, titulo, url, mostrarCidade = true }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: titulo,
    url: SITE + url,
    itemListElement: empresas.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/rede/${c.id}`,
      name: c.nome,
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ul className="cat-lista">
        {[...empresas]
          .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
          .map((c) => (
            <li key={c.id}>
              <a className="cat-card" href={`/rede/${c.id}`}>
                <span className="cat-card-seg">{c.segmento}</span>
                <strong>{c.nome}</strong>
                <p>{c.descricao}</p>
                {mostrarCidade && <span className="cat-card-cid">📍 {cidadesDe(c).join(" · ")}</span>}
              </a>
            </li>
          ))}
      </ul>
    </>
  );
}

// chamada no fim da página: pedir indicação ao Paulo e entrar na rede
export function Chamada({ assunto }) {
  return (
    <section className="cat-cta">
      <div>
        <div className="kick">Conexão pelo Paulo</div>
        <h2>Precisa de indicação de {assunto}?</h2>
        <p>
          Me conte o que você procura: eu apresento você à empresa certa, com a confiança de quem conhece os dois lados.
        </p>
      </div>
      <div className="cat-cta-btns">
        <a
          className="btn btn-primary"
          href={wa(`Olá Paulo! Preciso de uma indicação de ${assunto}.`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Pedir indicação
        </a>
        <a className="btn btn-outline" href="/#faca-parte">
          Sua empresa na rede
        </a>
      </div>
    </section>
  );
}
