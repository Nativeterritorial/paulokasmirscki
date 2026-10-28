"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIAS, EMPREENDIMENTOS, IMOVEIS, categoriaDoTipo, naCategoria, normBusca, textoDoImovel } from "./empreendimentos";
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
        {e.codigo && <span className="emp-codigo">Cód. {e.codigo}</span>}
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
        {e.incorporadora && <div className="emp-inc">por {e.incorporadora}</div>}
        {e.parceiro && <div className="emp-inc">{e.parceiro}</div>}
        {e.preco && (
          <div className="emp-preco">
            <strong>{e.preco}</strong>
            {e.precoNota && <span>{e.precoNota}</span>}
          </div>
        )}
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
        <a className="emp-indique" href="/ecossistema#indicar">
          💰 Conhece alguém interessado? <strong>Indique e ganhe bonificação →</strong>
        </a>
        <div className="emp-ctas">
          <a
            className="btn btn-primary"
            href={wa(
              e.preco
                ? `Olá Paulo! Tenho interesse no imóvel ${e.codigo} — "${e.nome}", em ${e.cidade}. Pode me passar mais informações e agendar uma visita?`
                : `Olá Paulo! Tenho interesse no ${e.nome} (${e.codigo}), em ${e.cidade}. Pode me passar valores e condições?`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Quero saber mais
          </a>
          {e.site && (
            <a className="btn btn-outline" href={e.site} target="_blank" rel="noopener noreferrer">
              {e.siteLabel || "Site oficial ↗"}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const FAIXAS = [
  [0, "Qualquer valor"],
  [300000, "Até R$ 300 mil"],
  [500000, "Até R$ 500 mil"],
  [800000, "Até R$ 800 mil"],
  [1500000, "Até R$ 1,5 milhão"],
  [3000000, "Até R$ 3 milhões"],
];
// atalhos de busca (preenchem a busca com um clique)
const ATALHOS = [
  ["🏊", "Piscina", "piscina"],
  ["🔒", "Condomínio", "condominio"],
  ["🌄", "Vista", "vista"],
  ["🚀", "Lançamento", "lancamento"],
  ["🔁", "Aceita permuta", "permuta"],
];

// Buscador da página de imóveis: busca por código ou texto, abas por tipo
// (Terrenos, Casas...), cidade, valor e quartos. Filtra ao mesmo tempo os
// imóveis selecionados, os empreendimentos e os anúncios da vitrine.
export default function ImoveisAbas({ imoveis }) {
  const [cat, setCat] = useState("");
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [ate, setAte] = useState(0);
  const [quartos, setQuartos] = useState(0);

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

  // tudo numa lista só, com o que cada filtro precisa
  const todos = useMemo(
    () => [
      ...IMOVEIS.map((e) => ({ e, grupo: "pronto", cats: [].concat(e.categoria), valor: e.valor || 0, quartos: e.quartos || 0 })),
      ...EMPREENDIMENTOS.map((e) => ({ e, grupo: "emp", cats: [].concat(e.categoria), valor: e.valor || 0, quartos: e.quartos || 0 })),
      ...imoveis.map((i) => ({ e: i, grupo: "avulso", cats: [categoriaDoTipo(i.tipo)], valor: i.sobConsulta ? 0 : i.preco || 0, quartos: i.quartos || 0 })),
    ].map((x) => ({ ...x, texto: textoDoImovel(x.e) })),
    [imoveis]
  );
  const cidades = [...new Set(todos.map((x) => x.e.cidade).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const termos = normBusca(busca).split(/\s+/).filter(Boolean);
  const passa = (x, semCat) =>
    (semCat || !cat || x.cats.includes(cat)) &&
    (!cidade || x.e.cidade === cidade) &&
    // valor sob consulta (lançamentos) continua aparecendo
    (!ate || !x.valor || x.valor <= ate) &&
    (!quartos || x.quartos >= quartos) &&
    termos.every((t) => x.texto.includes(t) || x.texto.includes(t.replace(/[^a-z0-9]/g, "")));
  const achados = todos.filter((x) => passa(x));
  const conta = (id) => todos.filter((x) => passa(x, true) && (!id || x.cats.includes(id))).length;

  const prontos = achados.filter((x) => x.grupo === "pronto").map((x) => x.e);
  const emps = achados.filter((x) => x.grupo === "emp").map((x) => x.e);
  const avulsos = achados.filter((x) => x.grupo === "avulso").map((x) => x.e);
  const filtrando = busca || cidade || ate || quartos || cat;
  const limpar = () => {
    setBusca("");
    setCidade("");
    setAte(0);
    setQuartos(0);
    escolher("");
  };

  // código exato (PK-1001): leva direto ao imóvel
  useEffect(() => {
    const cod = normBusca(busca).replace(/[^a-z0-9]/g, "");
    if (!/^pk\d{4}$/.test(cod)) return;
    const alvo = todos.find((x) => normBusca(x.e.codigo || "").replace(/[^a-z0-9]/g, "") === cod);
    if (alvo && alvo.grupo !== "avulso") {
      const t = setTimeout(() => document.getElementById(alvo.e.id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
      return () => clearTimeout(t);
    }
  }, [busca, todos]);

  return (
    <>
      <div className="ib-painel">
        <div className="ib-topo">
          <label className="ib-busca">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10.5 3a7.5 7.5 0 015.9 12.1l4.2 4.2-1.4 1.4-4.2-4.2A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
            </svg>
            <input
              value={busca}
              onChange={(ev) => setBusca(ev.target.value)}
              placeholder="Busque pelo código (PK-1001), bairro, cidade ou o que você procura…"
              aria-label="Buscar imóvel"
            />
            {busca && (
              <button type="button" className="ib-x" onClick={() => setBusca("")} aria-label="Limpar busca">
                ✕
              </button>
            )}
          </label>
        </div>

        <nav className="im-abas ib-abas" aria-label="Tipos de imóvel">
          {CATEGORIAS.map((c) => {
            const n = conta(c.id);
            return (
              <button
                key={c.id || "todos"}
                type="button"
                className={`${cat === c.id ? "on" : ""}${!n && cat !== c.id ? " vazio" : ""}`}
                onClick={() => escolher(c.id)}
              >
                <span aria-hidden="true">{c.icon}</span> {c.label}
                <b>{n}</b>
              </button>
            );
          })}
        </nav>

        <div className="ib-filtros">
          {cidades.length > 1 && (
            <select value={cidade} onChange={(ev) => setCidade(ev.target.value)} aria-label="Cidade">
              <option value="">📍 Todas as cidades</option>
              {cidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <select value={ate} onChange={(ev) => setAte(Number(ev.target.value))} aria-label="Valor máximo">
            {FAIXAS.map(([v, l]) => (
              <option key={v} value={v}>
                {v ? "💰 " : "💰 "}
                {l}
              </option>
            ))}
          </select>
          <select value={quartos} onChange={(ev) => setQuartos(Number(ev.target.value))} aria-label="Quartos">
            <option value={0}>🛏️ Quartos</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+ quartos
              </option>
            ))}
          </select>
          <div className="ib-atalhos">
            {ATALHOS.map(([ic, lbl, termo]) => (
              <button
                key={termo}
                type="button"
                className={normBusca(busca) === termo ? "on" : undefined}
                onClick={() => setBusca(normBusca(busca) === termo ? "" : termo)}
              >
                {ic} {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="ib-resumo">
          <span>
            <strong>{achados.length}</strong> {achados.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
          </span>
          {filtrando ? (
            <button type="button" onClick={limpar}>
              Limpar busca e filtros
            </button>
          ) : null}
        </div>
      </div>

      {!achados.length && (
        <div className="ib-nada">
          <div className="ib-nada-ic" aria-hidden="true">🔎</div>
          <h3>Não encontrei esse imóvel por aqui… ainda</h3>
          <p>
            Me conte o que você procura que eu busco na minha rede de parceiros — muitos imóveis nem chegam a ser
            anunciados.
          </p>
          <div className="ib-nada-ctas">
            <a
              className="btn btn-primary"
              href={wa(`Olá Paulo! Estou procurando um imóvel${busca ? `: ${busca}` : ""}${cidade ? ` em ${cidade}` : ""}. Pode me ajudar?`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Dizer o que procuro
            </a>
            <button type="button" className="btn btn-outline" onClick={limpar}>
              Ver todos os imóveis
            </button>
          </div>
        </div>
      )}

      {prontos.length > 0 && (
        <section className="emp-sec">
          <div className="emp-head">
            <div className="kick">À venda</div>
            <h2>
              Imóveis <em>selecionados</em>
            </h2>
            <p>Imóveis prontos que eu vendo como corretor: visitas, valores e negociação direto comigo.</p>
          </div>
          <div className="emp-lista">
            {prontos.map((e) => (
              <Empreendimento e={e} key={e.id} />
            ))}
          </div>
        </section>
      )}

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

      {avulsos.length > 0 && (
        <section className="emp-sec">
          <div className="emp-head">
            <div className="kick">Vitrine</div>
            <h2>
              Mais imóveis <em>à venda</em>
            </h2>
          </div>
          <Vitrine imoveis={avulsos} semFiltros />
        </section>
      )}
    </>
  );
}
