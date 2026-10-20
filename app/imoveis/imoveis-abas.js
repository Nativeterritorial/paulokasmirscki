"use client";

import { useEffect, useState } from "react";
import { CATEGORIAS, EMPREENDIMENTOS, categoriaDoTipo } from "./empreendimentos";
import Vitrine from "./vitrine";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// Cartão de um empreendimento: foto grande com miniaturas, destaques e contato
function Empreendimento({ e }) {
  const [foto, setFoto] = useState(0);
  return (
    <article className="emp-card" id={e.id}>
      <div className="emp-fotos">
        <img src={e.fotos[foto]} alt={`${e.nome} — foto ${foto + 1}`} className="emp-foto" />
        <span className="emp-status">{e.status}</span>
        {e.fotos.length > 1 && (
          <div className="emp-thumbs">
            {e.fotos.map((f, i) => (
              <button
                key={f}
                type="button"
                className={i === foto ? "on" : undefined}
                onClick={() => setFoto(i)}
                aria-label={`Ver foto ${i + 1}`}
              >
                <img src={f} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="emp-info">
        <div className="emp-loc">
          {e.tipo} · {e.cidade}
        </div>
        <h3>{e.nome}</h3>
        <div className="emp-inc">por {e.incorporadora}</div>
        <p>{e.resumo}</p>
        <ul className="emp-destaques">
          {e.destaques.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <div className="emp-corretor">
          <img src="/logo-mark.svg" alt="" />
          <span>
            Venda com <strong>Paulo Kasmirscki</strong> · corretor autorizado · CRECI-RS 77988
          </span>
        </div>
        <div className="emp-ctas">
          <a
            className="btn btn-primary"
            href={wa(`Olá Paulo! Tenho interesse no ${e.nome}, em ${e.cidade}. Pode me passar valores e condições?`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero saber mais
          </a>
          <a className="btn btn-outline" href={e.site} target="_blank" rel="noopener noreferrer">
            Site oficial ↗
          </a>
        </div>
      </div>
    </article>
  );
}

// Abas da página de imóveis (Terrenos, Casas, Apartamentos...): filtram os
// empreendimentos e os anúncios da vitrine ao mesmo tempo.
export default function ImoveisAbas({ imoveis }) {
  const [cat, setCat] = useState("");

  // a aba acompanha o endereço (#terrenos, #casas...) para dar para compartilhar
  useEffect(() => {
    const ler = () => {
      const h = window.location.hash.slice(1);
      if (CATEGORIAS.some((c) => c.id === h)) setCat(h);
    };
    ler();
    window.addEventListener("hashchange", ler);
    return () => window.removeEventListener("hashchange", ler);
  }, []);
  const escolher = (id) => {
    setCat(id);
    window.history.replaceState(null, "", id ? `#${id}` : window.location.pathname);
  };

  const emps = EMPREENDIMENTOS.filter((e) => !cat || e.categoria === cat);
  const avulsos = imoveis.filter((i) => !cat || categoriaDoTipo(i.tipo) === cat);
  const conta = (id) =>
    EMPREENDIMENTOS.filter((e) => !id || e.categoria === id).length +
    imoveis.filter((i) => !id || categoriaDoTipo(i.tipo) === id).length;

  return (
    <>
      <nav className="im-abas" aria-label="Tipos de imóvel">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id || "todos"}
            type="button"
            className={cat === c.id ? "on" : undefined}
            onClick={() => escolher(c.id)}
          >
            <span aria-hidden="true">{c.icon}</span> {c.label}
            <b>{conta(c.id)}</b>
          </button>
        ))}
      </nav>

      {emps.length > 0 && (
        <section className="emp-sec">
          <div className="emp-head">
            <div className="kick">Lançamentos e loteamentos</div>
            <h2>
              Empreendimentos que eu <em>vendo</em>
            </h2>
            <p>Sou corretor autorizado destes empreendimentos: valores, plantas e condições direto comigo.</p>
          </div>
          <div className="emp-lista">
            {emps.map((e) => (
              <Empreendimento e={e} key={e.id} />
            ))}
          </div>
        </section>
      )}

      {(avulsos.length > 0 || !emps.length || !cat) && (
        <section className="emp-sec">
          {emps.length > 0 && (
            <div className="emp-head">
              <div className="kick">Vitrine</div>
              <h2>
                Imóveis <em>avulsos</em>
              </h2>
            </div>
          )}
          <Vitrine imoveis={avulsos} key={cat} />
        </section>
      )}
    </>
  );
}
