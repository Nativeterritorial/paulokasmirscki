"use client";

import { useState } from "react";

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function Candidatura({ vaga, onClose }) {
  const [f, setF] = useState({ nome: "", whatsapp: "", msg: "", link: "", website: "" });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.nome.trim() || f.whatsapp.replace(/\D/g, "").length < 10) {
      setErr("Preencha seu nome e um WhatsApp com DDD.");
      return;
    }
    if (!f.msg.trim()) {
      setErr("Conte um pouco sobre você.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/vagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: vaga.id, ...f }),
      });
      const d = await r.json();
      if (d.ok) setDone(true);
      else setErr(d.error || "Não consegui enviar. Tente novamente.");
    } catch (e2) {
      setErr("Não consegui enviar. Tente novamente.");
    }
    setSending(false);
  };
  if (done) {
    return (
      <div className="signup-done">
        <div className="signup-done-ic" aria-hidden="true">
          ✓
        </div>
        <h3>Candidatura enviada!</h3>
        <p>A empresa recebeu o seu contato e vai falar com você pelo WhatsApp. Boa sorte!</p>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Fechar
        </button>
      </div>
    );
  }
  return (
    <form className="signup-form vg-form" onSubmit={submit}>
      <div className="signup-row">
        <label>
          Seu nome *
          <input value={f.nome} onChange={upd("nome")} autoComplete="name" />
        </label>
        <label>
          WhatsApp *
          <input value={f.whatsapp} onChange={upd("whatsapp")} inputMode="tel" autoComplete="tel" placeholder="(54) 99999-9999" />
        </label>
      </div>
      <label>
        Apresente-se *
        <textarea rows={4} value={f.msg} onChange={upd("msg")} placeholder="Sua experiência e por que você quer a vaga." />
      </label>
      <label>
        Link do currículo ou LinkedIn
        <input value={f.link} onChange={upd("link")} placeholder="https://..." />
      </label>
      <input className="signup-hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={upd("website")} aria-hidden="true" />
      <div className="vg-form-acts">
        <button className="btn btn-primary" disabled={sending}>
          {sending ? "Enviando..." : "Enviar candidatura"}
        </button>
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Cancelar
        </button>
      </div>
      {err && <div className="signup-err">{err}</div>}
    </form>
  );
}

export default function VagasLista({ vagas }) {
  const [aberta, setAberta] = useState("");
  if (!vagas.length) {
    return (
      <div className="vg-vazio">
        <p>No momento não há vagas abertas. Volte em breve: novas vagas da rede aparecem aqui.</p>
      </div>
    );
  }
  return (
    <div className="vg-lista">
      {vagas.map((v) => (
        <article className="vg-card" key={v.id}>
          <div className="vg-top">
            <div>
              <h3>{v.titulo}</h3>
              <div className="vg-emp">{v.empresa || "Empresa da rede"}</div>
            </div>
            {v.regime && <span className="vg-regime">{v.regime}</span>}
          </div>
          <div className="vg-facts">
            {v.cidade && <span>📍 {v.cidade}</span>}
            {v.area && <span>{v.area}</span>}
            <span>Publicada em {fmt(v.t)}</span>
          </div>
          <p className="vg-desc">{v.descricao}</p>
          {aberta === v.id ? (
            <Candidatura vaga={v} onClose={() => setAberta("")} />
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setAberta(v.id)}>
              Quero me candidatar
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
