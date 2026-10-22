import { COMPANIES } from "../area/companies";
import { porCidade } from "./cidades";
import MapaRede from "./mapa-rede";

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

      <main className="container rede-wrap">
        {/* topo e mapa num bloco só */}
        <section id="mapa" className="mr-sec rede-topo">
          <div className="rede-topo-head">
            <div>
              <div className="eyebrow">O Ecossistema PK</div>
              <h1>
                As empresas da <em>rede</em>
              </h1>
            </div>
            <div className="rede-topo-txt">
              <p>
                Empresas de confiança, de segmentos diferentes, conectadas
                pessoalmente pelo Paulo. Aqui você encontra <strong>clientes,
                parceiros e fornecedores</strong> — e cada negócio gera
                oportunidade para os outros.
              </p>
              <ul className="rede-topo-chips">
                <li>🤝 Conexão pessoal com quem decide</li>
                <li>✓ Empresas indicadas e conhecidas</li>
                <li>📍 Veja no mapa onde a rede está</li>
              </ul>
            </div>
          </div>
          <MapaRede grupos={porCidade(COMPANIES)} />
        </section>

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
