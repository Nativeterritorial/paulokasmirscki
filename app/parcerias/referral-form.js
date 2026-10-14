"use client";

import { useState } from "react";
import { protocolo } from "./referral-status";

export { protocolo };

const WHATSAPP = "https://wa.me/5554996505799";
const WA_FALLBACK = `${WHATSAPP}?text=${encodeURIComponent(
  "Olá Paulo! Quero registrar uma indicação de negócio imobiliário."
)}`;

const TIPOS = ["Comprar", "Vender", "Alugar", "Ainda não sei"];

const EMPTY = {
  nome: "",
  whatsapp: "",
  indicado: "",
  indicadoContato: "",
  tipo: "",
  obs: "",
  autorizado: false,
  aceite: false,
  website: "", // honeypot (fica escondido)
};

// Formulário de indicação. No site público a pessoa informa nome e WhatsApp;
// na Área de Membros (props `member` + `code`) quem indica já é conhecido, então
// esses dois campos somem e a indicação fica ligada ao membro.
export default function ReferralForm({ member = null, code = "", onDone }) {
  const [f, setF] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [doneAt, setDoneAt] = useState(null);
  const [err, setErr] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const chk = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.checked }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setUnavailable(false);
    if (!member && (!f.nome.trim() || !f.whatsapp.trim())) {
      setErr("Preencha seu nome e WhatsApp, e o nome e contato de quem você indica.");
      return;
    }
    if (!f.indicado.trim() || !f.indicadoContato.trim()) {
      setErr("Preencha o nome e o contato de quem você indica.");
      return;
    }
    if (!f.autorizado || !f.aceite) {
      setErr("Marque as duas confirmações para registrar a indicação.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member ? { ...f, code } : f),
      });
      const d = await r.json();
      if (d.ok && d.t) {
        setDoneAt(d.t);
        if (onDone) onDone(d.t);
      } else {
        setErr(d.error || "Não consegui registrar. Tente novamente.");
        setUnavailable(!!d.unavailable);
      }
    } catch (e2) {
      setErr("Não consegui registrar. Tente novamente.");
      setUnavailable(true);
    }
    setSending(false);
  };

  if (doneAt) {
    return (
      <div className="signup-done">
        <div className="signup-done-ic" aria-hidden="true">
          ✓
        </div>
        <h3>Indicação registrada!</h3>
        <p>
          Protocolo <strong>{protocolo(doneAt)}</strong>, registrado em{" "}
          {new Date(doneAt).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
          . {member ? "Ela já aparece na sua lista de indicações." : "Guarde esse número: é ele que comprova a data da sua indicação."}
        </p>
        <p>O Paulo confirma com você pelo WhatsApp se a indicação é válida.</p>
        <button
          type="button"
          className="btn btn-outline join-cta"
          onClick={() => {
            setF({ ...EMPTY, nome: f.nome, whatsapp: f.whatsapp });
            setDoneAt(null);
          }}
        >
          Registrar outra indicação
        </button>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={submit}>
      {!member && (
        <div className="signup-row">
          <label>
            Seu nome *
            <input
              value={f.nome}
              onChange={upd("nome")}
              placeholder="Quem está indicando"
              autoComplete="name"
            />
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
      <div className="signup-row">
        <label>
          Quem você indica *
          <input
            value={f.indicado}
            onChange={upd("indicado")}
            placeholder="Nome da pessoa"
            autoComplete="off"
          />
        </label>
        <label>
          Contato dela *
          <input
            value={f.indicadoContato}
            onChange={upd("indicadoContato")}
            placeholder="WhatsApp ou e-mail"
            autoComplete="off"
          />
        </label>
      </div>
      <label>
        O que ela quer fazer
        <select value={f.tipo} onChange={upd("tipo")}>
          <option value="">Selecione</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label>
        Observações
        <textarea
          value={f.obs}
          onChange={upd("obs")}
          rows={3}
          placeholder="Ex.: procura casa de 3 quartos em Veranópolis"
        />
      </label>
      <label className="ref-check">
        <input
          type="checkbox"
          checked={f.autorizado}
          onChange={chk("autorizado")}
        />
        <span>
          A pessoa indicada sabe da indicação e autorizou que eu passe o contato
          dela ao Paulo. *
        </span>
      </label>
      <label className="ref-check">
        <input type="checkbox" checked={f.aceite} onChange={chk("aceite")} />
        <span>
          Li e aceito as{" "}
          {member ? (
            <a href="/parcerias#indicar" target="_blank" rel="noopener noreferrer">
              regras da indicação
            </a>
          ) : (
            "regras da indicação descritas nesta página"
          )}
          . *
        </span>
      </label>
      {/* honeypot anti-bot: escondido pra humanos */}
      <input
        className="signup-hp"
        tabIndex={-1}
        autoComplete="off"
        value={f.website}
        onChange={upd("website")}
        aria-hidden="true"
      />
      <button className="btn btn-primary join-cta" disabled={sending}>
        {sending ? "Registrando..." : "Registrar indicação"}
      </button>
      {err && <div className="signup-err">{err}</div>}
      {unavailable && (
        <a
          className="btn btn-outline join-cta"
          href={WA_FALLBACK}
          target="_blank"
          rel="noopener noreferrer"
        >
          Enviar pelo WhatsApp
        </a>
      )}
      <div className="join-hint">
        A data e a hora do registro ficam gravadas e definem quem indicou
        primeiro.
      </div>
    </form>
  );
}
