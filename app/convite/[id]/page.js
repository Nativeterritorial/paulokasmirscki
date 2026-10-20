import { getConvidante } from "../../../lib/store";
import SignupForm from "../../ecossistema/signup-form";
import NetworkBG from "../../network-bg";
import SalvarConvite from "./salvar";

export const dynamic = "force-dynamic";

const primeiro = (nome) => (nome || "").split(/\s+/)[0];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const quem = await getConvidante(id);
  const titulo = quem
    ? `${primeiro(quem.nome)} te convidou para o Ecossistema PK`
    : "Você foi convidado para o Ecossistema PK";
  const descricao = quem
    ? `Uma rede de empresas de confiança, com IA e o Paulo conduzindo cada conexão. Entre pelo convite de ${primeiro(quem.nome)}: cadastro grátis em 1 minuto.`
    : "Uma rede de empresas de confiança, com IA e o Paulo conduzindo cada conexão. Cadastro grátis em 1 minuto.";
  return {
    title: titulo,
    description: descricao,
    robots: { index: false },
    openGraph: { title: titulo, description: descricao, type: "website", locale: "pt_BR", siteName: "Paulo Kasmirscki" },
    twitter: { card: "summary_large_image", title: titulo, description: descricao },
  };
}

// Página do convite: quem convidou, o que é o Ecossistema e o cadastro.
export default async function Convite({ params }) {
  const { id } = await params;
  const quem = await getConvidante(id);
  const nome = quem ? primeiro(quem.nome) : "";

  return (
    <div className="convite-page">
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
        </div>
      </header>
      {quem && <SalvarConvite id={quem.id} />}

      <main id="faca-parte" className="cta convite-hero">
        <NetworkBG className="net-cta" densidade={0.8} />
        <div className="container">
          <div className="eyebrow">Convite especial</div>
          <h1 className="fp-title">
            {nome ? (
              <>
                <span className="convite-nome">{nome}</span> te convidou para o{" "}
              </>
            ) : (
              <>Você foi convidado para o </>
            )}
            <em>
              Ecossistema <span className="pk-selo">PK</span>
            </em>
          </h1>
          <p className="fp-sub">
            Uma rede de empresas e profissionais de confiança, com IA e o Paulo
            conduzindo cada conexão. Você pede, a rede monta o time certo e o
            negócio acontece.
          </p>
          <ul className="rede-valores convite-valores">
            <li>🤖 Concierge de IA</li>
            <li>🔑 Contato direto com quem decide</li>
            <li>💰 Indicações com bonificação</li>
            <li>📌 Mural de oportunidades e vagas</li>
          </ul>
          <div className="fp-form">
            <SignupForm />
          </div>
          <p className="fp-login">
            Já é membro? <a href="/area">Entrar na Área de Membros →</a>
          </p>
        </div>
      </main>
    </div>
  );
}
