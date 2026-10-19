"use client";

import { useEffect, useState } from "react";
import { post } from "./pedidos";
import { FirmActions } from "./chave";

// "Monte meu time": para projetos que pedem várias empresas (casamento, obra,
// abrir empresa...), o concierge monta um time da rede — um papel para cada
// empresa — e a pessoa pode pedir ao Paulo que coordene todas as conexões.
// O concierge manda o marcador @@TIME:Título|Papel=id;Papel=id@@ no fim da resposta.

export function parseTime(buf) {
  const m = String(buf || "").match(/@@TIME:([^@]*)@@/);
  if (!m) return undefined;
  const [titulo, ...resto] = m[1].split("|");
  const papeis = resto
    .join("|")
    .split(";")
    .map((par) => {
      const i = par.indexOf("=");
      return i > 0 ? { papel: par.slice(0, i).trim(), id: par.slice(i + 1).trim() } : null;
    })
    .filter((x) => x && x.id);
  return papeis.length ? { titulo: titulo.trim() || "Seu time", papeis } : undefined;
}

// só as empresas que existem no diretório (a IA pode errar um id)
const membrosDoTime = (time, companies) =>
  time.papeis
    .map((p) => ({ ...p, c: companies.find((c) => c.id === p.id) }))
    .filter((p) => p.c);

const Puzzle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 3h6v3a2 2 0 1 0 4 0V3h2v6h-3a2 2 0 1 0 0 4h3v8h-6v-3a2 2 0 1 0-4 0v3H3v-8h3a2 2 0 1 0 0-4H3V3h6z" />
  </svg>
);

export function TimeCard({ time, companies, onChave, onVisit, onPedir }) {
  const lista = membrosDoTime(time, companies);
  if (!lista.length) return null;
  return (
    <div className="time-card">
      <div className="time-head">
        <span className="time-ic">
          <Puzzle />
        </span>
        <div>
          <div className="time-kick">Seu time na rede</div>
          <div className="time-nm">{time.titulo}</div>
        </div>
      </div>
      <ol className="time-list">
        {lista.map((p) => (
          <li className="time-row" key={p.papel + p.id}>
            <div className="time-info">
              <div className="time-papel">{p.papel}</div>
              <div className="time-emp">{p.c.nome}</div>
              <div className="time-sg">{p.c.segmento}</div>
            </div>
            <FirmActions c={p.c} onChave={onChave} onVisit={() => onVisit?.(p.c.id)} />
          </li>
        ))}
      </ol>
      <div className="time-foot">
        <p>O Paulo pode coordenar todas as conexões do seu time de uma vez.</p>
        <button type="button" className="time-btn" onClick={onPedir}>
          Quero esse time
        </button>
      </div>
    </div>
  );
}

export function TimeModal({ time, companies, code, member, onClose, onDone }) {
  const [f, setF] = useState({ descricao: "", nome: "", whatsapp: "" });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const lista = membrosDoTime(time, companies);

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
      setErr("Conte em poucas palavras o seu projeto (data, cidade, tamanho...).");
      return;
    }
    setSending(true);
    try {
      const timeTxt = lista.map((p) => `- ${p.papel}: ${p.c.nome}`).join("\n");
      const d = await post(code, {
        action: "create",
        pedido: {
          tipo: "time",
          titulo: time.titulo,
          descricao: `${f.descricao.trim()}\n\nTime sugerido pelo concierge:\n${timeTxt}`,
          empresas: lista.map((p) => ({ papel: p.papel, id: p.id })),
          nome: f.nome,
          whatsapp: f.whatsapp,
        },
      });
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
        className="chave-box time-box"
        role="dialog"
        aria-modal="true"
        aria-label={`Monte meu time — ${time.titulo}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="chave-x" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
        <div className="kick time-kick">
          <Puzzle /> Monte meu time
        </div>
        <h3>{time.titulo}</h3>
        <p className="chave-lead">
          O Paulo analisa o seu projeto, conversa com cada empresa do time e faz
          as apresentações. Você acompanha tudo em Solicitações.
        </p>
        <ul className="time-mini">
          {lista.map((p) => (
            <li key={p.papel + p.id}>
              <span>{p.papel}</span> {p.c.nome}
            </li>
          ))}
        </ul>

        {done ? (
          <div className="signup-done">
            <div className="signup-done-ic" aria-hidden="true">
              ✓
            </div>
            <h3>Time enviado!</h3>
            <p>
              O Paulo vai analisar e falar com você pelo WhatsApp. Você acompanha
              o andamento e as respostas em Solicitações.
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
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(54) 99999-9999"
                  />
                </label>
              </div>
            )}
            <label>
              Conte sobre o seu projeto *
              <textarea
                rows={4}
                value={f.descricao}
                onChange={upd("descricao")}
                placeholder="Ex.: casamento em março de 2027, em Veranópolis, para uns 150 convidados."
              />
            </label>
            <button className="btn btn-primary join-cta" disabled={sending}>
              {sending ? "Enviando..." : "Pedir para o Paulo coordenar"}
            </button>
            {err && <div className="signup-err">{err}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
