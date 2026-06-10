import { notFound } from "next/navigation";
import { COMPANIES } from "../../area/companies";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// logos disponíveis em /public (as demais usam o nome estilizado)
const LOGOS = {
  native: "/brand-native.png",
  pulse: "/brand-pulse.png",
  exatus: "/brand-exatus.png",
  bigwolf: "/brand-bigwolf.png",
  agetra: "/brand-agetra.png",
  gilioli: "/brand-gilioli.png",
  mutalys: "/brand-mutalys.png",
  alsus: "/brand-alsus.png",
  ordeclean: "/brand-ordeclean.svg",
};

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const c = COMPANIES.find((x) => x.id === id);
  if (!c) return {};
  return {
    title: `${c.nome} — ${c.segmento} | Rede Paulo Kasmirscki`,
    description: c.descricao,
    alternates: { canonical: `/rede/${c.id}` },
    openGraph: {
      title: `${c.nome} — ${c.segmento}`,
      description: c.descricao,
      type: "website",
    },
  };
}

export default async function Empresa({ params }) {
  const { id } = await params;
  const c = COMPANIES.find((x) => x.id === id);
  if (!c) notFound();

  const externo = !c.link.includes("wa.me");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.nome,
    description: c.descricao,
    ...(externo ? { url: c.link } : {}),
    memberOf: {
      "@type": "Organization",
      name: "Ecossistema Paulo Kasmirscki",
      url: "https://www.paulokasmirscki.com.br",
    },
  };

  return (
    <div className="rede-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <div className="nav-actions">
            <a className="btn btn-primary" href="/#contato">
              Fazer parte
            </a>
          </div>
        </div>
      </header>

      <main className="container empresa-wrap">
        <a className="empresa-back" href="/rede">
          ← Todas as empresas da rede
        </a>

        <div className="empresa-hero">
          <div className="empresa-info">
            <div className="eyebrow">{c.segmento}</div>
            {LOGOS[c.id] ? (
              <img className="empresa-logo" src={LOGOS[c.id]} alt={c.nome} />
            ) : (
              <h1 className="empresa-nome">{c.nome}</h1>
            )}
            {LOGOS[c.id] && <h1 className="empresa-nome-sub">{c.nome}</h1>}
            <p className="empresa-desc">{c.descricao}</p>

            <div className="empresa-tags">
              {c.atende.map((a) => (
                <span className="seg-tag" key={a}>
                  {a}
                </span>
              ))}
            </div>

            <div className="hero-actions" style={{ marginTop: 30 }}>
              <a
                className="btn btn-primary"
                href={wa(
                  `Olá Paulo! Quero me conectar com a ${c.nome} do ecossistema.`
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Conectar via Paulo
              </a>
              {externo && (
                <a
                  className="btn btn-outline"
                  href={c.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {c.linkLabel}
                </a>
              )}
            </div>
          </div>

          <aside className="empresa-side">
            <div className="empresa-side-card">
              <div className="kick">Como funciona</div>
              <p>
                Toda conexão do ecossistema passa pelo <strong>Paulo</strong> —
                ele apresenta você à {c.nome} com a confiança de quem conhece
                os dois lados.
              </p>
              <p className="empresa-side-muted">
                Membro da rede? Use o{" "}
                <a href="/area">concierge de IA</a> pra se conectar na hora.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
