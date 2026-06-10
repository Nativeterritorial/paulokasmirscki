"use client";

import { useEffect, useRef, useState } from "react";
import { COMPANIES } from "./companies";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// Renderiza a resposta da IA: escapa HTML, aplica negrito e links, quebra linhas.
function formatMsg(text) {
  let s = String(text || "");
  // escapa HTML
  s = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // links markdown [texto](url)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // negrito **texto**
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // remove quaisquer asteriscos restantes
  s = s.replace(/\*/g, "");
  // URLs soltas que ainda não viraram link
  s = s.replace(
    /(^|[^"'>])(https?:\/\/[^\s<)]+)/g,
    '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'
  );
  // quebras de linha
  s = s.replace(/\n/g, "<br/>");
  return s;
}

export default function Area() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  const GREETING = [
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou o concierge do ecossistema. Me conte o que você precisa — ex.: \"preciso de uma empresa pra fazer meu site\" — que eu encontro a pessoa certa na rede.",
    },
  ];
  const [messages, setMessages] = useState(GREETING);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [openSeg, setOpenSeg] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    try {
      // link-convite: /area?convite=CODIGO entra direto
      const convite = new URLSearchParams(window.location.search).get(
        "convite"
      );
      if (convite) {
        window.history.replaceState({}, "", "/area");
        fetch("/api/area-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: convite }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.ok) {
              setCode(convite);
              setAuthed(true);
              try {
                localStorage.setItem("area_code", convite);
              } catch (e) {}
            }
          })
          .catch(() => {});
      }
      const saved = localStorage.getItem("area_code");
      if (saved) {
        setCode(saved);
        setAuthed(true);
      }
      // restaura o histórico da conversa
      const chat = JSON.parse(localStorage.getItem("area_chat") || "null");
      if (Array.isArray(chat) && chat.length) setMessages(chat);
    } catch (e) {}
  }, []);

  // salva a conversa (últimas 40 mensagens) a cada atualização
  useEffect(() => {
    try {
      localStorage.setItem("area_chat", JSON.stringify(messages.slice(-40)));
    } catch (e) {}
  }, [messages]);

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

  const trackConnect = (companyId) => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "connect", company: companyId, code }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) {}
  };

  const logout = () => {
    try {
      localStorage.removeItem("area_code");
      localStorage.removeItem("area_chat");
    } catch (e) {}
    setAuthed(false);
    setCode("");
    setMessages(GREETING);
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
      if (r.status === 401) {
        // código de acesso vencido/incorreto — força novo login
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "🔒 Sua sessão expirou ou o código mudou. Vou te levar para entrar de novo…",
          },
        ]);
        setSending(false);
        setTimeout(() => logout(), 1500);
        return;
      }

      // lê a resposta em streaming, atualizando a bolha em tempo real
      if (r.body && r.ok) {
        setMessages((m) => [...m, { role: "assistant", content: "" }]);
        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        const flush = () => {
          // separa o marcador final @@REC:ids@@ do texto visível
          const recMatch = buf.match(/@@REC:([^@]*)@@/);
          const recs = recMatch
            ? recMatch[1].split(",").filter(Boolean)
            : undefined;
          // esconde marcador completo ou parcial (começando em @@) no fim do buffer
          const visible = buf
            .replace(/@@REC:[^@]*@@/g, "")
            .replace(/@@(?:R(?:E(?:C(?::[^@]*)?)?)?)?$/, "");
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = {
              role: "assistant",
              content: visible,
              recs,
            };
            return next;
          });
        };
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          flush();
        }
        buf += decoder.decode();
        flush();
      } else {
        const d = await r.json().catch(() => ({}));
        const reply =
          d.reply ||
          d.error ||
          "⚠️ Não consegui responder agora. Tente de novo em instantes.";
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
      }
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
            Ainda não tem acesso?
            <a className="btn btn-outline login-signup" href="/ecossistema">
              Cadastre-se
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
            {messages.map((m, i) => {
              // último pedido do usuário antes desta resposta (contexto pro WhatsApp)
              const pedido = messages
                .slice(0, i)
                .filter((x) => x.role === "user")
                .pop()
                ?.content?.slice(0, 160);
              return m.role === "assistant" ? (
                <div key={i} className="msg-block">
                  <div
                    className="bubble assistant"
                    dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }}
                  />
                  {m.recs?.length > 0 && (
                    <div className="bubble-recs">
                      {m.recs
                        .map((id) => COMPANIES.find((c) => c.id === id))
                        .filter(Boolean)
                        .map((c) => (
                          <div className="rec-card" key={c.id}>
                            <div className="rec-info">
                              <div className="rec-nm">{c.nome}</div>
                              <div className="rec-sg">{c.segmento}</div>
                            </div>
                            <a
                              className="firm-conn"
                              href={wa(
                                `Olá Paulo! Quero me conectar com a ${c.nome} do ecossistema.` +
                                  (pedido ? ` Meu pedido: "${pedido}"` : "")
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackConnect(c.id)}
                            >
                              Conectar
                            </a>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div key={i} className="bubble user">
                  {m.content}
                </div>
              );
            })}
            {sending && messages[messages.length - 1]?.role === "user" && (
              <div className="bubble assistant typing">digitando…</div>
            )}
          </div>
          {!messages.some((m) => m.role === "user") && (
            <div className="chat-chips">
              {[
                "Preciso de um site pro meu negócio",
                "Procuro um contador",
                "Quero comprar ou vender um imóvel",
                "Preciso de material gráfico",
                "Busco consultoria pra minha empresa",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  onClick={() => send(s)}
                  disabled={sending}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
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
            {Object.entries(
              COMPANIES.reduce((acc, c) => {
                (acc[c.segmento] = acc[c.segmento] || []).push(c);
                return acc;
              }, {})
            )
              .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
              .map(([segmento, firms]) => (
                <div
                  className={`firm-group${openSeg === segmento ? " open" : ""}`}
                  key={segmento}
                >
                  <button
                    type="button"
                    className="firm-group-title"
                    onClick={() =>
                      setOpenSeg((s) => (s === segmento ? null : segmento))
                    }
                    aria-expanded={openSeg === segmento}
                  >
                    <span>{segmento}</span>
                    <span className="firm-group-meta">
                      {firms.length}
                      <span className="chev" aria-hidden="true">
                        ▾
                      </span>
                    </span>
                  </button>
                  {openSeg === segmento &&
                    firms.map((c) => (
                    <div className="firm" key={c.id}>
                      <div className="firm-info">
                        <div className="firm-nm">{c.nome}</div>
                        <div className="firm-d">{c.descricao}</div>
                      </div>
                      <a
                        className="firm-conn"
                        href={wa(
                          `Olá Paulo! Quero me conectar com a ${c.nome} do ecossistema.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackConnect(c.id)}
                      >
                        Conectar
                      </a>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
