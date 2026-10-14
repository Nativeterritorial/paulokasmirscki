import { getVitrine } from "../../lib/store";
import Vitrine from "./vitrine";

// a vitrine muda sempre que o Paulo publica um anúncio: monta a cada visita
export const dynamic = "force-dynamic";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export const metadata = {
  title: "Imóveis à venda — Paulo Kasmirscki",
  description:
    "Vitrine de imóveis do ecossistema Paulo Kasmirscki: casas, apartamentos, terrenos e pontos comerciais à venda em Veranópolis e região.",
  alternates: { canonical: "/imoveis" },
};

export default async function Imoveis() {
  const imoveis = await getVitrine();
  return (
    <div className="rede-page">
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <div className="nav-actions">
            <a
              className="btn btn-primary"
              href={wa("Olá Paulo! Vi a vitrine de imóveis e quero conversar.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com o Paulo
            </a>
          </div>
        </div>
      </header>

      <main className="container join-wrap">
        <div className="join-hero">
          <div className="eyebrow">Vitrine do ecossistema</div>
          <h1 className="mdl-title">
            Imóveis à <em>venda</em>
          </h1>
          <p className="join-lead">
            Casas, apartamentos, terrenos e pontos comerciais selecionados. Gostou
            de algum? Fale comigo e eu conduzo a negociação do começo ao fim.
          </p>
        </div>

        <Vitrine imoveis={imoveis} />

        <section className="vt-sell">
          <div>
            <div className="kick">Quer vender o seu imóvel?</div>
            <h2>Cadastre o seu imóvel na Área de Membros</h2>
            <p>
              Você manda os dados e as fotos, eu avalio com você e preparo o
              anúncio. O endereço fica só comigo: aqui aparece apenas o bairro.
            </p>
          </div>
          <div className="vt-sell-ctas">
            <a className="btn btn-primary" href="/area#vender">
              Cadastrar meu imóvel
            </a>
            <a
              className="btn btn-outline"
              href={wa("Olá Paulo! Quero vender o meu imóvel.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar pelo WhatsApp
            </a>
          </div>
        </section>

        <p className="mdl-note">
          Paulo Kasmirscki · Corretor de imóveis · CRECI-RS 77988
        </p>
      </main>
    </div>
  );
}
