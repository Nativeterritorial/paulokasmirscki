"use client";

import { useState } from "react";

const EMPTY = {
  nome: "",
  empresa: "",
  whatsapp: "",
  senha: "",
  email: "",
  site: "",
  instagram: "",
  website: "", // honeypot (fica escondido)
};

// para onde levar depois do cadastro, conforme o botão que trouxe a pessoa
// (ex.: /ecossistema?servico=obra#cadastro abre a seção da obra)
const DESTINO = {
  obra: "#obra",
  projeto: "#projeto",
  gestao: "#gestao",
  imovel: "#vender",
  indicacoes: "#indicacoes",
};

export default function SignupForm() {
  const [f, setF] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false); // false | "entrando" | "existe" | "enviado"
  const [err, setErr] = useState("");

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.nome.trim() || f.whatsapp.replace(/\D/g, "").length < 10) {
      setErr("Preencha o seu nome e um WhatsApp com DDD.");
      return;
    }
    if (f.senha.length < 6) {
      setErr("Crie uma senha com pelo menos 6 caracteres.");
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
      if (d.ok && d.token) {
        // acesso imediato: entra direto na Área de Membros
        setDone("entrando");
        const servico = new URLSearchParams(window.location.search).get("servico");
        setTimeout(() => {
          window.location.href =
            `/area?convite=${encodeURIComponent(d.token)}${DESTINO[servico] || ""}`;
        }, 1200);
      } else if (d.ok && d.exists) setDone("existe");
      else if (d.ok) setDone("enviado");
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
        {done === "entrando" ? (
          <>
            <h3>Bem-vindo ao Ecossistema PK!</h3>
            <p>Seu acesso foi criado. Entrando na Área de Membros…</p>
          </>
        ) : done === "existe" ? (
          <>
            <h3>Você já tem conta!</h3>
            <p>
              Já existe um acesso com esse WhatsApp. Entre com o seu WhatsApp e
              a sua senha. Se esqueceu, use “Esqueci minha senha” na entrada.
            </p>
            <a className="btn btn-primary" href="/area">
              Entrar na Área de Membros
            </a>
          </>
        ) : (
          <>
            <h3>Cadastro enviado!</h3>
            <p>O Paulo recebeu seus dados e vai enviar o seu acesso em breve.</p>
          </>
        )}
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
      <label>
        Crie uma senha *
        <input
          type="password"
          value={f.senha}
          onChange={upd("senha")}
          placeholder="Pelo menos 6 caracteres"
          autoComplete="new-password"
        />
        <span className="signup-sub">
          Com o seu WhatsApp e esta senha você entra de qualquer aparelho.
        </span>
      </label>
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
        {sending ? "Criando seu acesso..." : "Quero fazer parte"}
      </button>
      {err && <div className="signup-err">{err}</div>}
      <div className="join-hint">
        Sem compromisso: seu acesso é criado na hora e você já entra na Área de Membros.
      </div>
    </form>
  );
}
