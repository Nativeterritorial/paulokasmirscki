"use client";

import { useState } from "react";

export default function LeadForm() {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [msg, setMsg] = useState("");
  const [site, setSite] = useState(""); // honeypot
  const [state, setState] = useState("idle"); // idle | sending | done | error

  const submit = async (e) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, contato, msg, site }),
      });
      const d = await r.json().catch(() => ({}));
      setState(d.ok ? "done" : "error");
    } catch (e) {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="lead-form lead-done">
        <div className="lead-done-ic" aria-hidden="true">
          ✓
        </div>
        <h3>Recebido!</h3>
        <p>
          O Paulo vai olhar o seu pedido e te chamar no contato que você
          deixou. Enquanto isso, se quiser adiantar:
        </p>
        <a
          className="btn btn-outline"
          href="https://wa.me/5554996505799"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chamar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="lead-row">
        <input
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={80}
          required
        />
        <input
          placeholder="WhatsApp ou e-mail"
          value={contato}
          onChange={(e) => setContato(e.target.value)}
          maxLength={80}
          required
        />
      </div>
      <textarea
        placeholder="O que você procura? Ex.: preciso de um contador pra abrir minha empresa…"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        maxLength={400}
        rows={3}
        required
      />
      {/* honeypot anti-spam (invisível) */}
      <input
        type="text"
        name="site"
        value={site}
        onChange={(e) => setSite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="lead-hp"
        aria-hidden="true"
      />
      <button className="btn btn-primary" disabled={state === "sending"}>
        {state === "sending" ? "Enviando..." : "Enviar pro Paulo"}
      </button>
      {state === "error" && (
        <div className="lead-err">
          Não consegui enviar agora — tenta de novo ou chama no WhatsApp.
        </div>
      )}
    </form>
  );
}
