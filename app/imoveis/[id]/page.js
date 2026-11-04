import { notFound } from "next/navigation";
import { getImovelPublic, getVitrine } from "../../../lib/store";
import { formatPreco, imovelCodigo, imovelResumo } from "../imovel-defs";
import { fixoPorEndereco, urlDoImovel } from "../empreendimentos";
import Galeria from "./galeria";
import Compartilhar from "./compartilhar";

export const dynamic = "force-dynamic";

const SITE = "https://www.paulokasmirscki.com.br";
const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// A página aceita o código (/imoveis/pk-1001), que é o endereço oficial, e
// também o id antigo dos anúncios do painel (links já compartilhados).
// Imóveis fixos (empreendimentos e selecionados) vêm do código do site;
// os do painel, do banco.
async function acharImovel(param) {
  const fixo = fixoPorEndereco(param);
  if (fixo) return { fixo };
  const k = String(param || "").toLowerCase();
  if (/^pk-\d+$/.test(k)) {
    const im = (await getVitrine()).find((i) => i.codigo?.toLowerCase() === k);
    return im ? { im } : null;
  }
  const im = await getImovelPublic(param);
  return im ? { im } : null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const achado = await acharImovel(id);
  if (!achado) return { title: "Imóvel não encontrado — Paulo Kasmirscki" };

  if (achado.fixo) {
    const e = achado.fixo;
    const desc = [e.codigo, `${e.tipo} em ${e.cidade}`, e.preco || e.status, e.resumo].filter(Boolean).join(" · ");
    return {
      title: `${e.nome} — Imóveis Paulo Kasmirscki`,
      description: desc,
      alternates: { canonical: urlDoImovel(e) },
      openGraph: { title: `${e.nome} · ${e.codigo}`, description: desc, images: e.fotos?.[0] ? [e.fotos[0]] : undefined },
    };
  }

  const im = achado.im;
  const onde = [im.bairro, im.cidade].filter(Boolean).join(", ");
  const desc = [imovelResumo(im), onde, im.sobConsulta ? "" : formatPreco(im.preco)]
    .filter(Boolean)
    .join(" · ");
  return {
    title: `${im.titulo} — Imóveis Paulo Kasmirscki`,
    description: desc,
    alternates: { canonical: urlDoImovel(im) },
    openGraph: {
      title: im.titulo,
      description: desc,
      images: im.fotos?.[0] ? [`/api/foto/${im.fotos[0]}`] : undefined,
    },
  };
}

// imóvel fixo: empreendimento (lançamento, loteamento) ou imóvel selecionado
function ImovelFixo({ e }) {
  const link = SITE + urlDoImovel(e);
  const specs = [[e.quartos, e.quartos === 1 ? "quarto" : "quartos", "Quartos"]].filter(([n]) => n > 0);
  return (
    <>
      <div className="vt-detail">
        <Galeria fotos={e.fotos || []} titulo={e.nome} />

        <aside className="vt-info">
          <div className="kick">
            {e.tipo} · {e.codigo}
          </div>
          <h1>{e.nome}</h1>
          <div className="vt-loc">{[e.bairro, e.cidade].filter(Boolean).join(", ")}</div>
          {e.incorporadora && <div className="emp-inc">por {e.incorporadora}</div>}
          {e.parceiro && <div className="emp-inc">{e.parceiro}</div>}
          <div className="vt-preco vt-preco-lg">{e.preco || e.status}</div>
          {e.precoNota && <p className="vt-nota">{e.precoNota}</p>}
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
            href={wa(`Olá Paulo! Tenho interesse no imóvel ${e.codigo} (${e.nome}), em ${e.cidade}. ${link}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tenho interesse
          </a>
          <Compartilhar titulo={`${e.nome} · ${e.codigo}`} link={link} />
          {e.site && (
            <a className="btn btn-outline" href={e.site} target="_blank" rel="noopener noreferrer">
              {e.siteLabel || "Site oficial ↗"}
            </a>
          )}
          <p className="vt-legal">
            Venda com Paulo Kasmirscki, corretor de imóveis CRECI-RS 77988. Endereço e condições informados no contato.
          </p>
        </aside>
      </div>

      <section className="vt-desc">
        <h2>Sobre o imóvel</h2>
        <p>{e.resumo}</p>
        {e.destaques?.length > 0 && (
          <ul className="emp-destaques">
            {e.destaques.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// anúncio cadastrado pelo painel
function ImovelPainel({ im }) {
  const codigo = imovelCodigo(im);
  const onde = [im.bairro, im.cidade].filter(Boolean).join(", ");
  const link = SITE + urlDoImovel(im);
  const specs = [
    [im.metragem, "m²", "Área"],
    [im.quartos, im.quartos === 1 ? "quarto" : "quartos", "Quartos"],
    [im.banheiros, im.banheiros === 1 ? "banheiro" : "banheiros", "Banheiros"],
    [im.vagas, im.vagas === 1 ? "vaga" : "vagas", "Garagem"],
  ].filter(([n]) => n > 0);

  return (
    <>
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
    </>
  );
}

export default async function ImovelPage({ params }) {
  const { id } = await params;
  const achado = await acharImovel(id);
  if (!achado) notFound();

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
        {achado.fixo ? <ImovelFixo e={achado.fixo} /> : <ImovelPainel im={achado.im} />}
      </main>
    </div>
  );
}
