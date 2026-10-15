import { notFound } from "next/navigation";
import { getImovelPublic } from "../../../lib/store";
import { formatPreco, imovelCodigo, imovelResumo } from "../imovel-defs";
import Galeria from "./galeria";
import Compartilhar from "./compartilhar";

export const dynamic = "force-dynamic";

const SITE = "https://www.paulokasmirscki.com.br";
const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const im = await getImovelPublic(id);
  if (!im) return { title: "Imóvel não encontrado — Paulo Kasmirscki" };
  const onde = [im.bairro, im.cidade].filter(Boolean).join(", ");
  const desc = [imovelResumo(im), onde, im.sobConsulta ? "" : formatPreco(im.preco)]
    .filter(Boolean)
    .join(" · ");
  return {
    title: `${im.titulo} — Imóveis Paulo Kasmirscki`,
    description: desc,
    alternates: { canonical: `/imoveis/${im.id}` },
    openGraph: {
      title: im.titulo,
      description: desc,
      images: im.fotos?.[0] ? [`/api/foto/${im.fotos[0]}`] : undefined,
    },
  };
}

export default async function ImovelPage({ params }) {
  const { id } = await params;
  const im = await getImovelPublic(id);
  if (!im) notFound();

  const codigo = imovelCodigo(im);
  const onde = [im.bairro, im.cidade].filter(Boolean).join(", ");
  const link = `${SITE}/imoveis/${im.id}`;
  const specs = [
    [im.metragem, "m²", "Área"],
    [im.quartos, im.quartos === 1 ? "quarto" : "quartos", "Quartos"],
    [im.banheiros, im.banheiros === 1 ? "banheiro" : "banheiros", "Banheiros"],
    [im.vagas, im.vagas === 1 ? "vaga" : "vagas", "Garagem"],
  ].filter(([n]) => n > 0);

  return (
    <div className="rede-page vt-theme">
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
            <a className="btn btn-outline" href="/imoveis">
              ← Vitrine
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap vt-page">
        <div className="vt-detail">
          <Galeria fotos={im.fotos || []} titulo={im.titulo} reservado={im.status === "reservado"} />

          <aside className="vt-info">
            <div className="kick">
              {im.tipo} · {codigo}
            </div>
            <h1>{im.titulo}</h1>
            {onde && <div className="vt-loc">{onde}</div>}
            <div className="vt-preco vt-preco-lg">
              {im.sobConsulta ? "Valor sob consulta" : formatPreco(im.preco)}
            </div>
            {im.status === "reservado" && (
              <p className="vt-reservado">Este imóvel está reservado. Fale comigo para entrar na lista de espera.</p>
            )}
            {specs.length > 0 && (
              <div className="vt-spec-grid">
                {specs.map(([n, un, lbl]) => (
                  <div key={lbl}>
                    <strong>{n}</strong> {un}
                    <small>{lbl}</small>
                  </div>
                ))}
              </div>
            )}
            <a
              className="btn btn-primary"
              href={wa(`Olá Paulo! Tenho interesse no imóvel ${codigo} (${im.titulo}). ${link}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tenho interesse
            </a>
            <Compartilhar titulo={im.titulo} link={link} />
            <p className="vt-legal">
              Anúncio de Paulo Kasmirscki, corretor de imóveis CRECI-RS 77988
              {im.parceiroCreci ? `, em parceria com ${im.parceiroCreci}` : ""}. Endereço
              informado no contato.
            </p>
          </aside>
        </div>

        {im.descricao && (
          <section className="vt-desc">
            <h2>Sobre o imóvel</h2>
            {im.descricao
              .split("\n")
              .filter((l) => l.trim())
              .map((l, i) => (
                <p key={i}>{l}</p>
              ))}
          </section>
        )}
      </main>
    </div>
  );
}
