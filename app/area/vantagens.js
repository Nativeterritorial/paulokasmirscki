"use client";

import { useEffect, useState } from "react";
import { VANTAGEM_CATEGORIAS } from "./vantagens-defs";

// Clube de Vantagens: descontos e condições especiais das empresas da rede,
// só para membros. Empresas podem propor uma vantagem (o Paulo aprova).

const VAZIA = { empresa: "", titulo: "", descricao: "", como: "", categoria: "Outros", validade: "" };

function Vantagem({ v, empresa, onUsar }) {
  const [aberta, setAberta] = useState(false);
  return (
    <article className={`van-card${aberta ? " aberta" : ""}`}>
      <div className="van-selo">{v.titulo}</div>
      <div className="van-info">
        <div className="van-cat">{v.categoria}</div>
        <h3>{v.empresa}</h3>
        {v.descricao && <p>{v.descricao}</p>}
        {v.validade && <div className="van-validade">⏳ {v.validade}</div>}
        {aberta ? (
          <div className="van-como">
            <strong>Como usar:</strong> {v.como || "Diga que você é membro do Ecossistema PK ao falar com a empresa."}
            {empresa?.link && (
              <a href={empresa.link} target="_blank" rel="noopener noreferrer">
                Falar com a empresa ↗
              </a>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="van-usar"
            onClick={() => {
              setAberta(true);
              onUsar(v.id);
            }}
          >
            🎁 Quero usar esta vantagem
          </button>
        )}
      </div>
    </article>
  );
}

export default function MyVantagens({ code, member, companies = [] }) {
  const [lista, setLista] = useState(null);
  const [conta, setConta] = useState(!!member?.id);
  const [cat, setCat] = useState("");
  const [form, setForm] = useState(false);
  const [f, setF] = useState(VAZIA);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [enviando, setEnviando] = useState(false);

  const call = async (payload = {}) => {
    const r = await fetch("/api/vantagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, ...payload }),
    });
    return r.json();
  };

  useEffect(() => {
    if (!code) return;
    call()
      .then((d) => {
        setLista(d.vantagens || []);
        setConta(!!d.conta);
      })
      .catch(() => setLista([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const porId = Object.fromEntries(companies.map((c) => [c.id, c]));
  const cats = [...new Set((lista || []).map((v) => v.categoria))];
  const visiveis = (lista || []).filter((v) => !cat || v.categoria === cat);

  const propor = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.empresa.trim() || !f.titulo.trim()) {
      setErr("Preencha o nome da empresa e a vantagem.");
      return;
    }
    setEnviando(true);
    try {
      const d = await call({ action: "propor", vantagem: f });
      if (d.ok) {
        setForm(false);
        setF(VAZIA);
        setMsg("Recebido! O Paulo vai olhar a sua vantagem e, aprovada, ela entra no Clube. 🎉");
      } else setErr(d.error || "Não consegui enviar agora.");
    } catch (e2) {
      setErr("Não consegui enviar agora.");
    }
    setEnviando(false);
  };

  return (
    <section className="area-refs area-projects svc svc-van" id="vantagens">
      <div className="area-refs-head">
        <div className="svc-ic" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="13" rx="2" />
            <path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z" />
          </svg>
        </div>
        <div className="svc-txt">
          <div className="kick">Clube de Vantagens</div>
          <h2>Vantagens exclusivas para quem é da rede</h2>
          <p>
            Descontos e condições especiais que as empresas do Ecossistema
            oferecem só para membros. É só escolher, dizer que você é da rede e
            aproveitar.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setForm((v) => !v)}>
          {form ? "Fechar" : "Oferecer uma vantagem"}
        </button>
      </div>

      {msg && <p className="van-msg">{msg}</p>}

      {form && (
        <form className="van-form" onSubmit={propor}>
          <p className="van-form-lead">
            A sua empresa quer aparecer no Clube? Ofereça um desconto ou uma condição especial para os membros. O Paulo
            aprova e ela entra no ar.
          </p>
          {!conta && <p className="van-aviso">Para oferecer uma vantagem, entre com a sua conta (WhatsApp e senha).</p>}
          <div className="van-grid">
            <label>
              Empresa *
              <input value={f.empresa} maxLength={80} onChange={(e) => setF({ ...f, empresa: e.target.value })} placeholder="Nome da sua empresa" />
            </label>
            <label>
              A vantagem *
              <input value={f.titulo} maxLength={80} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex.: 10% de desconto, 1ª consulta grátis" />
            </label>
            <label className="van-larga">
              Detalhes
              <textarea rows={2} value={f.descricao} maxLength={400} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="Em quais produtos ou serviços vale, regras, limites…" />
            </label>
            <label className="van-larga">
              Como o membro usa
              <input value={f.como} maxLength={300} onChange={(e) => setF({ ...f, como: e.target.value })} placeholder="Ex.: dizer que é do Ecossistema PK no WhatsApp ou usar o cupom PK10" />
            </label>
            <label>
              Categoria
              <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
                {VANTAGEM_CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Validade
              <input value={f.validade} maxLength={60} onChange={(e) => setF({ ...f, validade: e.target.value })} placeholder="Ex.: até 31/12 ou sem prazo" />
            </label>
          </div>
          {err && <p className="van-erro">{err}</p>}
          <button className="btn btn-primary" disabled={enviando || !conta}>
            {enviando ? "Enviando…" : "Enviar para o Paulo aprovar"}
          </button>
        </form>
      )}

      {lista === null ? (
        <p className="area-refs-empty">Carregando…</p>
      ) : !lista.length ? (
        <div className="van-vazio">
          <div className="van-vazio-ic" aria-hidden="true">🎁</div>
          <h3>As primeiras vantagens estão chegando</h3>
          <p>
            O Clube está sendo montado com as empresas da rede. A sua empresa pode ser uma das primeiras: toque em{" "}
            <strong>“Oferecer uma vantagem”</strong>.
          </p>
        </div>
      ) : (
        <>
          {cats.length > 1 && (
            <div className="mur-filtros van-filtros">
              <button type="button" className={`chip${!cat ? " chip-on" : ""}`} onClick={() => setCat("")}>
                Todas
              </button>
              {cats.map((c) => (
                <button key={c} type="button" className={`chip${cat === c ? " chip-on" : ""}`} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="van-lista">
            {visiveis.map((v) => (
              <Vantagem key={v.id} v={v} empresa={porId[v.empresaId]} onUsar={(id) => call({ action: "usar", id }).catch(() => {})} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
