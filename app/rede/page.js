import { COMPANIES } from "../area/companies";

export const metadata = {
  title: "A Rede — Paulo Kasmirscki",
  description:
    "As empresas do ecossistema de negócios do Paulo Kasmirscki: imóveis, contabilidade, marketing, saúde, construção e mais — conectadas em Veranópolis e na Serra Gaúcha.",
  alternates: { canonical: "/rede" },
};

export default function Rede() {
  return (
    <div className="rede-page">
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

      <main className="container rede-wrap">
        <div className="section-head" style={{ paddingTop: 40 }}>
          <div className="eyebrow">O ecossistema</div>
          <h1>
            As empresas da <em>rede</em>
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 560 }}>
            Negócios de segmentos diferentes, conectados pelo Paulo — cada um
            com sua especialidade, todos gerando oportunidade uns para os
            outros.
          </p>
        </div>

        <div className="rede-grid">
          {COMPANIES.map((c) => (
            <a className="rede-card" key={c.id} href={`/rede/${c.id}`}>
              <div className="rede-sg">{c.segmento}</div>
              <h2>{c.nome}</h2>
              <p>{c.descricao}</p>
              <span className="b-link">Conhecer →</span>
            </a>
          ))}
        </div>

        <p className="brands-note">
          E a sua marca?{" "}
          <a href="/#contato" style={{ color: "var(--gold-2)" }}>
            Faça parte da rede →
          </a>
        </p>
      </main>
    </div>
  );
}
