"use client";

import { useEffect, useState } from "react";
import { post } from "./pedidos";

// "Monte meu time": para projetos que pedem vários serviços (casamento, obra,
// abrir empresa...), o concierge monta o roteiro de SERVIÇOS — sem citar
// empresas. A pessoa marca o que precisa e o Paulo escolhe as opções de
// parceiros para cada serviço (e descobre onde a rede ainda tem vaga).
// Marcador no fim da resposta: @@TIME:Título|Serviço=id,id;Serviço=@@
// (os ids são das empresas que fazem o serviço — só o Paulo vê os nomes).

export function parseTime(buf) {
  const m = String(buf || "").match(/@@TIME:([^@]*)@@/);
  if (!m) return undefined;
  const [titulo, ...resto] = m[1].split("|");
  const servicos = resto
    .join("|")
    .split(";")
    .map((par) => {
      const i = par.indexOf("=");
      const nome = (i >= 0 ? par.slice(0, i) : par).trim();
      const ids = i >= 0 ? par.slice(i + 1).split(",").map((x) => x.trim()).filter(Boolean) : [];
      return nome ? { nome, ids } : null;
    })
    .filter(Boolean);
  return servicos.length ? { titulo: titulo.trim() || "Seu time", servicos } : undefined;
}

const Puzzle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 3h6v3a2 2 0 1 0 4 0V3h2v6h-3a2 2 0 1 0 0 4h3v8h-6v-3a2 2 0 1 0-4 0v3H3v-8h3a2 2 0 1 0 0-4H3V3h6z" />
  </svg>
);

export function TimeCard({ time, companies = [], onPedir }) {
  // todos marcados no começo; a pessoa desmarca o que já tem
  const [off, setOff] = useState([]);
  // conversa antiga guardada no aparelho (versão com empresas): não mostra
  if (!Array.isArray(time?.servicos) || !time.servicos.length) return null;
  // só conta como "na rede" se o id existe mesmo no diretório
  const temParceiro = (sv) => sv.ids.some((id) => companies.some((c) => c.id === id));
  const marcados = time.servicos.filter((sv) => !off.includes(sv.nome));
  const alternar = (nome) =>
    setOff((o) => (o.includes(nome) ? o.filter((x) => x !== nome) : [...o, nome]));

  return (
    <div className="time-card">
      <div className="time-head">
        <span className="time-ic">
          <Puzzle />
        </span>
        <div>
          <div className="time-kick">Monte meu time</div>
          <div className="time-nm">{time.titulo}</div>
        </div>
      </div>
      <ol className="time-list">
        {time.servicos.map((sv) => {
          const on = !off.includes(sv.nome);
          const rede = temParceiro(sv);
          return (
            <li key={sv.nome}>
              <label className={`time-row sv${on ? "" : " off"}`}>
                <span className="time-info">
                  <input type="checkbox" checked={on} onChange={() => alternar(sv.nome)} />
                  <span className="time-sv">{sv.nome}</span>
                </span>
                <span className={`time-cob ${rede ? "rede" : "busca"}`}>
                  {rede ? "Parceiros na rede" : "O Paulo busca para você"}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
      <div className="time-foot">
        <p>Marque o que você precisa: o Paulo seleciona as melhores opções de parceiros para cada serviço.</p>
        <button
          type="button"
          className="time-btn"
          disabled={!marcados.length}
          onClick={() => onPedir({ ...time, servicos: marcados })}
        >
          Quero esse time
        </button>
      </div>
    </div>
  );
}

export function TimeModal({ time, code, member, onClose, onDone }) {
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
      setErr("Conte em poucas palavras o seu projeto (data, cidade, tamanho...).");
      return;
    }
    setSending(true);
    try {
      const d = await post(code, {
        action: "create",
        pedido: {
          tipo: "time",
          titulo: time.titulo,
          descricao: `${f.descricao.trim()}\n\nServiços que preciso: ${time.servicos
            .map((sv) => sv.nome)
            .join(", ")}.`,
          servicos: time.servicos,
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
          O Paulo analisa o seu projeto, seleciona as melhores opções de
          parceiros para cada serviço e faz as apresentações. Você acompanha
          tudo em Solicitações.
        </p>
        <ul className="time-mini">
          {time.servicos.map((sv) => (
            <li key={sv.nome}>{sv.nome}</li>
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
              {sending ? "Enviando..." : "Pedir para o Paulo montar"}
            </button>
            {err && <div className="signup-err">{err}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
