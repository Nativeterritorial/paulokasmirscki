"use client";

import { useState } from "react";

const EMPTY = {
  nome: "",
  empresa: "",
  whatsapp: "",
  email: "",
  site: "",
  instagram: "",
  website: "", // honeypot (fica escondido)
};

export default function SignupForm() {
  const [f, setF] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.nome.trim() || (!f.whatsapp.trim() && !f.email.trim())) {
      setErr("Preencha seu nome e ao menos WhatsApp ou e-mail.");
      return;
    }
    setSending(true);
    try {
      const r = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
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
        <h3>Cadastro enviado!</h3>
        <p>
          O Paulo recebeu seus dados e vai entrar em contato em breve pra te dar
          as boas-vindas à rede.
        </p>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={submit}>
      <label>
        Seu nome *
        <input
          value={f.nome}
          onChange={upd("nome")}
          placeholder="Como podemos te chamar"
          autoComplete="name"
        />
      </label>
      <label>
        Empresa / negócio
        <input
          value={f.empresa}
          onChange={upd("empresa")}
          placeholder="Nome da sua empresa"
        />
      </label>
      <div className="signup-row">
        <label>
          WhatsApp *
          <input
            value={f.whatsapp}
            onChange={upd("whatsapp")}
            placeholder="(54) 99999-9999"
            inputMode="tel"
            autoComplete="tel"
          />
        </label>
        <label>
          E-mail
          <input
            value={f.email}
            onChange={upd("email")}
            placeholder="voce@email.com"
            inputMode="email"
            autoComplete="email"
          />
        </label>
      </div>
      <div className="signup-row">
        <label>
          Site
          <input
            value={f.site}
            onChange={upd("site")}
            placeholder="seusite.com.br"
          />
        </label>
        <label>
          Instagram
          <input
            value={f.instagram}
            onChange={upd("instagram")}
            placeholder="@seuperfil"
          />
        </label>
      </div>
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
        {sending ? "Enviando..." : "Quero me cadastrar"}
      </button>
      {err && <div className="signup-err">{err}</div>}
      <div className="join-hint">
        Sem compromisso — o Paulo recebe seus dados e fala com você.
      </div>
    </form>
  );
}
