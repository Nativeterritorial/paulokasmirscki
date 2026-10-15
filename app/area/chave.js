"use client";

import { useEffect, useState } from "react";

// Chave PK: a apresentação feita pelo Paulo ao responsável por uma empresa da
// rede. Não é um contato direto — o pedido passa por análise e o Paulo faz a
// ponte. O acesso livre continua sendo o site/Instagram da empresa.

const ETAPAS = ["Pedido", "Análise do Paulo", "Apresentação", "Conexão"];

const Lock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

// rótulo do link livre conforme o endereço da empresa
const linkLabel = (c) => {
  if (!c.link) return "Ver perfil";
  return /instagram\.com/i.test(c.link) ? "Instagram" : "Site";
};

// botões de cada empresa: acesso livre (site/Instagram) + Chave PK
export function FirmActions({ c, onChave, onVisit }) {
  return (
    <div className="firm-acts">
      <a
        className="firm-conn firm-free"
        href={c.link || `/rede/${c.id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onVisit}
      >
        {linkLabel(c)}
      </a>
      <button type="button" className="firm-conn firm-chave" onClick={() => onChave(c)}>
        <Lock /> Chave PK
      </button>
    </div>
  );
}

// janela de pedido da Chave PK
export function ChaveModal({ company, code, member, onClose, onDone }) {
  const [f, setF] = useState({ descricao: "", nome: "", whatsapp: "" });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!member && (!f.nome.trim() || !f.whatsapp.trim())) {
      setErr("Preencha seu nome e WhatsApp.");
      return;
    }
    if (!f.descricao.trim()) {
      setErr("Conte em poucas palavras o que você precisa.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/my-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          action: "create",
          pedido: {
            tipo: "chave",
            titulo: company.nome,
            empresaId: company.id,
            descricao: f.descricao,
            nome: f.nome,
            whatsapp: f.whatsapp,
          },
        }),
      });
      const d = await r.json();
      if (d.ok) {
        setDone(true);
        if (onDone) onDone();
      } else setErr(d.error || "Não consegui enviar. Tente novamente.");
    } catch (e2) {
      setErr("Não consegui enviar. Tente novamente.");
    }
    setSending(false);
  };

  return (
    <div className="chave-overlay" onClick={onClose}>
      <div
        className="chave-box"
        role="dialog"
        aria-modal="true"
        aria-label={`Chave PK — ${company.nome}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="chave-x" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
        <div className="kick">
          <Lock /> Chave PK
        </div>
        <h3>{company.nome}</h3>
        <p className="chave-lead">
          A Chave PK é a sua conexão com o responsável pela empresa: o pedido
          passa por uma análise e, quando faz sentido, o Paulo faz a
          apresentação pessoalmente.
        </p>
        <ol className="chave-steps">
          {ETAPAS.map((e, i) => (
            <li key={e}>
              <span>{i + 1}</span>
              {e}
            </li>
          ))}
        </ol>

        {done ? (
          <div className="signup-done">
            <div className="signup-done-ic" aria-hidden="true">
              ✓
            </div>
            <h3>Pedido enviado!</h3>
            <p>
              O Paulo vai analisar e falar com você pelo WhatsApp sobre a
              apresentação.
              {member ? " Você acompanha o andamento na sua área." : ""}
            </p>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <form className="signup-form" onSubmit={submit}>
            {!member && (
              <div className="signup-row">
                <label>
                  Seu nome *
                  <input value={f.nome} onChange={upd("nome")} autoComplete="name" />
                </label>
                <label>
                  Seu WhatsApp *
                  <input
                    value={f.whatsapp}
                    onChange={upd("whatsapp")}
                    placeholder="(54) 99999-9999"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
              </div>
            )}
            <label>
              O que você precisa da {company.nome}? *
              <textarea
                rows={3}
                value={f.descricao}
                onChange={upd("descricao")}
                placeholder="Ex.: orçamento para abrir um restaurante em Veranópolis"
              />
            </label>
            <p className="join-hint">
              O valor da Chave é combinado com o Paulo na análise do pedido.
            </p>
            {err && <p className="signup-err">{err}</p>}
            <button className="btn btn-primary join-cta" disabled={sending}>
              {sending ? "Enviando..." : "Solicitar Chave PK"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
