"use client";

import { useEffect, useRef, useState } from "react";
import { COMPANIES } from "./companies";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

export default function Area() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou o concierge do ecossistema. Me conte o que você precisa — ex.: \"preciso de uma empresa pra fazer meu site\" — que eu encontro a pessoa certa na rede.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("area_code");
      if (saved) {
        setCode(saved);
        setAuthed(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, sending]);

  const login = async (e) => {
    e.preventDefault();
    setErr("");
    setLoadingLogin(true);
    try {
      const r = await fetch("/api/area-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput }),
      });
      const d = await r.json();
      if (d.ok) {
        setCode(codeInput);
        setAuthed(true);
        try {
          localStorage.setItem("area_code", codeInput);
        } catch (e) {}
      } else {
        setErr("Código incorreto.");
      }
    } catch (e) {
      setErr("Erro ao entrar. Tente novamente.");
    }
    setLoadingLogin(false);
  };

  const logout = () => {
    try {
      localStorage.removeItem("area_code");
    } catch (e) {}
    setAuthed(false);
    setCode("");
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    const next = [...messages, { role: "user", content: msg }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const r = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, code }),
      });
      const d = await r.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: d.reply || "..." },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Não consegui responder agora." },
      ]);
    }
    setSending(false);
  };

  // ---------- LOGIN ----------
  if (!authed) {
    return (
      <div className="area-login">
        <div className="login-card">
          <a className="brand" href="/" aria-label="Paulo Kasmirscki">
            <img src="/logo-mark.svg" alt="" style={{ height: 40 }} />
            <span className="brand-name">Paulo Kasmirscki</span>
          </a>
          <div className="eyebrow" style={{ marginTop: 26 }}>
            Área de Membros
          </div>
          <h1 style={{ fontSize: "1.9rem", margin: "8px 0 6px" }}>
            Acesse o <em>ecossistema</em>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 22 }}>
            Entre com o seu código de acesso para conversar com o concierge e se
            conectar às empresas da rede.
          </p>
          <form onSubmit={login} className="login-form">
            <input
              type="password"
              placeholder="Código de acesso"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary" disabled={loadingLogin}>
              {loadingLogin ? "Entrando..." : "Entrar"}
            </button>
          </form>
          {err && <div className="login-err">{err}</div>}
          <div className="login-hint">
            Ainda não tem acesso?{" "}
            <a href={wa("Olá Paulo! Quero acesso à área de membros do ecossistema.")} target="_blank" rel="noopener noreferrer">
              Fale com o Paulo
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ---------- DASHBOARD ----------
  return (
    <div className="area">
      <header className="area-top">
        <a className="brand" href="/" aria-label="Paulo Kasmirscki">
          <img src="/logo-mark.svg" alt="" style={{ height: 30 }} />
          <span className="brand-name">Paulo Kasmirscki</span>
          <span className="area-badge">Área de Membros</span>
        </a>
        <button className="area-logout" onClick={logout}>
          Sair
        </button>
      </header>

      <div className="area-wrap">
        {/* CHAT */}
        <section className="area-panel">
          <div className="area-panel-head">
            <div className="kick" style={{ marginBottom: 8 }}>
              Concierge do Ecossistema · IA
            </div>
            <h2 style={{ fontSize: "1.35rem" }}>Como posso te conectar hoje?</h2>
          </div>
          <div className="area-chat" ref={chatRef}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && <div className="bubble assistant typing">digitando…</div>}
          </div>
          <form
            className="area-chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              placeholder="Digite o que você precisa…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="send" disabled={sending} aria-label="Enviar">
              ↑
            </button>
          </form>
        </section>

        {/* DIRETÓRIO */}
        <aside className="area-dir">
          <div className="area-panel-head">
            <div className="kick">Empresas da rede</div>
            <h2 style={{ fontSize: "1.2rem" }}>Explorar o ecossistema</h2>
          </div>
          <div className="area-firms">
            {COMPANIES.map((c) => (
              <div className="firm" key={c.id}>
                <div className="firm-info">
                  <div className="firm-nm">{c.nome}</div>
                  <div className="firm-sg">{c.segmento}</div>
                  <div className="firm-d">{c.descricao}</div>
                </div>
                <a
                  className="firm-conn"
                  href={wa(
                    `Olá Paulo! Quero me conectar com a ${c.nome} do ecossistema.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Conectar
                </a>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
