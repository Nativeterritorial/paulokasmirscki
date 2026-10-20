import { getVagasPublicas } from "../../lib/store";
import VagasLista from "./vagas-lista";

// as vagas mudam sempre que alguém publica no Mural: monta a cada visita
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vagas de emprego — Ecossistema PK",
  description:
    "Vagas de emprego nas empresas da rede do Paulo Kasmirscki em Veranópolis e região. Candidate-se direto pelo site.",
  alternates: { canonical: "/vagas" },
};

export default async function Vagas() {
  const vagas = await getVagasPublicas();
  return (
    <div className="rede-page">
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <div className="nav-actions">
            <a className="nav-login" href="/area" aria-label="Área de Membros">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
              </svg>
              <span className="nav-login-txt">Área de Membros</span>
            </a>
            <a className="btn btn-primary" href="/#faca-parte">
              Faça parte
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap">
        <div className="join-hero">
          <div className="eyebrow">Vagas da rede</div>
          <h1 className="mdl-title">
            Trabalhe nas empresas do <em>Ecossistema <span className="pk-selo">PK</span></em>
          </h1>
          <p className="join-lead">
            Vagas abertas nas empresas da rede em Veranópolis e região. Escolha
            a vaga e candidate-se: a empresa recebe o seu contato na hora.
          </p>
        </div>
        <VagasLista vagas={vagas} />
        <div className="vg-empresa">
          <h2>Sua empresa tem uma vaga?</h2>
          <p>
            Empresas do Ecossistema PK publicam vagas pelo Mural de
            Oportunidades, na Área de Membros, e elas aparecem aqui.
          </p>
          <a className="btn btn-outline" href="/area#mural">
            Publicar uma vaga
          </a>
        </div>
      </main>
    </div>
  );
}
