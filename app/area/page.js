"use client";

import { useEffect, useRef, useState } from "react";
import { COMPANIES } from "./companies";
import InstallApp from "./install-app";
import MyReferrals from "./my-referrals";
import MyProjects from "./my-projects";
import MyGestao from "./my-gestao";
import MyImoveis from "./my-imoveis";
import { FirmActions, ChaveModal } from "./chave";
import MySolicitacoes from "./solicitacoes";
import { useNaoLidas } from "./pedidos";
import { SegIcon } from "../segment-icons";
import { abrirServico } from "./abrir";
import { LoginForm, SenhaAviso } from "./login";

// serviços que o concierge pode oferecer (marcador @@SERV:tipo@@ na resposta)
const SERVICOS = {
  obra: { nome: "Do Terreno às Chaves", desc: "As 11 fases da obra, do terreno à entrega das chaves, com o Paulo conduzindo.", btn: "Iniciar minha obra", cls: "svc-obra" },
  projeto: { nome: "Da ideia à abertura", desc: "Para abrir o seu negócio com os parceiros certos em cada etapa.", btn: "Iniciar meu projeto", cls: "svc-proj" },
  gestao: { nome: "Gestor de negócios", desc: "O Paulo ao seu lado, mês a mês, nos números e nas decisões.", btn: "Pedir gestão", cls: "svc-gest" },
  imovel: { nome: "Quero vender meu imóvel", desc: "Cadastre o imóvel: o Paulo avalia e leva até os compradores.", btn: "Cadastrar imóvel", cls: "svc-imo" },
};

// sugestões do concierge, cada uma com o ícone do segmento mais próximo
const SUGESTOES = [
  ["Preciso de um site pro meu negócio", "Marketing & Digital"],
  ["Procuro um contador", "Contabilidade"],
  ["Quero comprar ou vender um imóvel", "Imóveis & Construção"],
  ["Preciso de material gráfico", "Mídia & Comunicação"],
  ["Busco consultoria pra minha empresa", "Negócios & Empresas"],
];

// segmento de cada empresa -> categoria com ícone (e cor) no diretório
const SEG_MAP = [
  [/academia|fitness|esporte/i, "Esporte & Lazer", "#5b9bff"],
  [/agro|pecu|fertiliz|agríc/i, "Agro & Pecuária", "#6fffbf"],
  [/barbearia|estética|beleza/i, "Estética & Beleza", "#ff9bd2"],
  [/cafeteria|restaurante|lancheria|padaria|gastronomia/i, "Gastronomia", "#ffb27a"],
  [/vidro|válvula|(^|[^\p{L}])móve|indústr/iu, "Indústria & Móveis", "#9fb6d9"],
  [/comunicação|mídia|gráfica|fotografia/i, "Mídia & Comunicação", "#ff8a8a"],
  [/consórcio|investimento|seguro|finan/i, "Finanças & Investimentos", "#f5c04e"],
  [/construção|materiais|hidráulic|imóve|territorial/i, "Imóveis & Construção", "#f5c04e"],
  [/contabil/i, "Contabilidade", "#46d6ff"],
  [/jurídic/i, "Jurídico", "#c9a8ff"],
  [/marketing/i, "Marketing & Digital", "#b88cff"],
  [/informática|internet|telecom|sistemas|tecnologia/i, "Tecnologia & IA", "#46d6ff"],
  [/veículo|automóve|concession/i, "Veículos", "#46d6ff"],
  [/logística|transporte/i, "Transporte & Logística", "#9fb6d9"],
  [/moda|vestuário|joalheria|ótica/i, "Moda & Vestuário", "#ff9bd2"],
  [/saúde|odonto|medicina|genética|suplemento/i, "Saúde & Bem-estar", "#6fffbf"],
  [/hotel|turismo/i, "Turismo & Hotelaria", "#ffb27a"],
  [/floricultura|flores/i, "Sustentabilidade & Meio Ambiente", "#6fffbf"],
  [/mercado|atacado|comércio|varejo/i, "Comércio & Varejo", "#ffb27a"],
  [/desenvolvimento|gestão|consultoria|público|associação|entidade/i, "Negócios & Empresas", "#c9a8ff"],
];
const segInfo = (segmento) => {
  const hit = SEG_MAP.find(([re]) => re.test(segmento));
  return hit ? { icon: hit[1], cor: hit[2] } : { icon: "Serviços", cor: "#9fb6d9" };
};

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// normaliza pra busca (sem acento, minúsculo, sem espaços nas pontas)
const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

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
  const [member, setMember] = useState(null); // { id, nome } quando entrou por link pessoal

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
  const [busca, setBusca] = useState("");
  // empresas combinadas (fixas + cadastradas pelo Paulo); começa com as fixas
  const [companies, setCompanies] = useState(COMPANIES);
  const [chaveFor, setChaveFor] = useState(null); // empresa da Chave PK aberta
  const [chaveVer, setChaveVer] = useState(0); // recarrega "Minhas Chaves PK"
  const naoLidas = useNaoLidas(code, member);
  const chatRef = useRef(null);

  // busca a lista atualizada de empresas (inclui as que o Paulo cadastra)
  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.companies) && d.companies.length)
          setCompanies(d.companies);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      // link-convite: /area?convite=CODIGO entra direto
      const convite = new URLSearchParams(window.location.search).get(
        "convite"
      );
      if (convite) {
        // mantém o destino (#obra, #projeto…) de quem acabou de se cadastrar
        const destino = window.location.hash;
        window.history.replaceState({}, "", "/area" + destino);
        fetch("/api/area-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: convite }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.ok) {
              setCode(convite);
              setMember(d.member || null);
              setAuthed(true);
              try {
                localStorage.setItem("area_code", convite);
              } catch (e) {}
              // chegou por um serviço: abre o formulário dele (ou só rola até a seção)
              const TIPO = { "#obra": "obra", "#projeto": "projeto", "#gestao": "gestao", "#vender": "imovel" };
              if (destino) {
                setTimeout(() => {
                  if (TIPO[destino]) abrirServico(TIPO[destino]);
                  else document.querySelector(destino)?.scrollIntoView({ behavior: "smooth" });
                }, 900);
              }
            }
          })
          .catch(() => {});
      }
      const saved = localStorage.getItem("area_code");
      if (saved && !convite) {
        setCode(saved);
        setAuthed(true);
        // revalida o acesso salvo: um link trocado ou removido sai na hora
        // (se a rede falhar, mantém a sessão)
        fetch("/api/area-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: saved }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.ok) setMember(d.member || null);
            else {
              try {
                localStorage.removeItem("area_code");
              } catch (e) {}
              setAuthed(false);
              setCode("");
            }
          })
          .catch(() => {});
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

  // entrou (WhatsApp + senha ou código): guarda o acesso neste aparelho
  const login = (acesso, m) => {
    setCode(acesso);
    setMember(m);
    setAuthed(true);
    try {
      localStorage.setItem("area_code", acesso);
    } catch (e) {}
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
    setMember(null);
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
          // esconde marcadores completos (@@REC / @@GAP) e qualquer parcial no fim
          const servMatch = buf.match(/@@SERV:(\w+)@@/);
          const serv = servMatch && SERVICOS[servMatch[1]] ? servMatch[1] : undefined;
          const visible = buf
            .replace(/@@SERV:[^@]*@@/g, "")
            .replace(/@@REC:[^@]*@@/g, "")
            .replace(/@@GAP:[^@]*@@/g, "")
            .replace(
              /@@(?:R(?:E(?:C(?::[^@]*)?)?)?|G(?:A(?:P(?::[^@]*)?)?)?|S(?:E(?:R(?:V(?::[^@]*)?)?)?)?)?$/,
              ""
            )
            .trimEnd();
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = {
              role: "assistant",
              content: visible,
              recs,
              serv,
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
            Entre com o seu WhatsApp e a sua senha para conversar com o
            concierge e se conectar às empresas da rede.
          </p>
          <LoginForm onLogin={login} />
          <div className="login-hint">
            Ainda não tem acesso?
            <a className="btn btn-outline login-signup" href="/ecossistema#cadastro">
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
        <div className="area-top-actions">
          {member && (
            <span className="area-hello">Olá, {member.nome.split(" ")[0]}</span>
          )}
          <a
            className={`area-refs-link area-sol top-svc svc-sol${naoLidas.total > 0 ? " area-msgs" : ""}`}
            href={naoLidas.total > 0 ? `#pd-${naoLidas.primeiro}` : "#solicitacoes"}
          >
            Solicitações
            {naoLidas.total > 0 && <span className="area-msgs-n">{naoLidas.total}</span>}
          </a>
          <a className="area-refs-link top-svc svc-ind" href="#indicacoes">
            {member ? "Minhas indicações" : "Indicar negócio"}
          </a>
          <a className="area-refs-link top-svc svc-imo" href="#vender">
            Vender imóvel
          </a>
          <a className="area-refs-link top-svc svc-obra" href="#obra">
            Minha obra
          </a>
          <a className="area-refs-link top-svc svc-proj" href="#projeto">
            Meu projeto
          </a>
          <a className="area-refs-link top-svc svc-gest" href="#gestao">
            Minha gestão
          </a>
          <InstallApp />
          <button className="area-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <SenhaAviso
        code={code}
        member={member}
        onSalva={() => setMember((m) => (m ? { ...m, temSenha: true, senhaTemp: false } : m))}
      />

      <div className="area-wrap">
        {/* CHAT */}
        <section className="area-panel ia-panel">
          <div className="area-panel-head ia-head">
            <div className="ia-avatar" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                <path d="M19 15v4M17 17h4" />
              </svg>
              <span className="ia-online" />
            </div>
            <div>
              <div className="kick ia-kick">Concierge de IA · Online</div>
              <h2 style={{ fontSize: "1.35rem" }}>Como posso te conectar hoje?</h2>
            </div>
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
                  {m.serv && SERVICOS[m.serv] && (
                    <div className={`serv-card svc ${SERVICOS[m.serv].cls}`}>
                      <div className="serv-txt">
                        <div className="serv-kick">Serviço do ecossistema</div>
                        <div className="serv-nm">{SERVICOS[m.serv].nome}</div>
                        <div className="serv-d">{SERVICOS[m.serv].desc}</div>
                      </div>
                      <button type="button" className="serv-btn" onClick={() => abrirServico(m.serv)}>
                        {SERVICOS[m.serv].btn}
                      </button>
                    </div>
                  )}
                  {m.recs?.length > 0 && (
                    <div className="bubble-recs">
                      {m.recs
                        .map((id) => companies.find((c) => c.id === id))
                        .filter(Boolean)
                        .map((c) => (
                          <div className="rec-card" key={c.id}>
                            <div className="rec-info">
                              <div className="rec-nm">{c.nome}</div>
                              <div className="rec-sg">{c.segmento}</div>
                            </div>
                            <FirmActions
                              c={c}
                              onChave={setChaveFor}
                              onVisit={() => trackConnect(c.id)}
                            />
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
              {SUGESTOES.map(([s, ic]) => (
                <button
                  key={s}
                  type="button"
                  className="chip ia-chip"
                  onClick={() => send(s)}
                  disabled={sending}
                >
                  <SegIcon label={ic} size={14} />
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </section>

        {/* DIRETÓRIO */}
        <aside className="area-dir">
          <div className="area-panel-head">
            <div className="kick">Empresas da rede</div>
            <h2 style={{ fontSize: "1.2rem" }}>Explorar o ecossistema</h2>
            <label className="firm-search">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Buscar empresa ou segmento"
                aria-label="Buscar empresa ou segmento"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </label>
          </div>
          <div className="area-firms">
            {norm(busca) &&
              (() => {
                const achadas = companies
                  .filter((c) =>
                    norm(`${c.nome} ${c.segmento}`).includes(norm(busca))
                  )
                  .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
                if (!achadas.length)
                  return (
                    <p className="firm-empty">
                      Nenhuma empresa ou segmento encontrado.
                    </p>
                  );
                return achadas.map((c) => (
                  <div className="firm" key={c.id}>
                    <div className="firm-info">
                      <div className="firm-seg">{c.segmento}</div>
                      <div className="firm-nm">{c.nome}</div>
                      <div className="firm-d">{c.descricao}</div>
                    </div>
                    <FirmActions
                      c={c}
                      onChave={setChaveFor}
                      onVisit={() => trackConnect(c.id)}
                    />
                  </div>
                ));
              })()}
            {!norm(busca) && Object.entries(
              companies.reduce((acc, c) => {
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
                    <span
                      className="seg-ico"
                      style={{ "--seg": segInfo(segmento).cor }}
                      aria-hidden="true"
                    >
                      <SegIcon label={segInfo(segmento).icon} size={15} />
                    </span>
                    <span className="seg-nm">{segmento}</span>
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
                      <FirmActions
                        c={c}
                        onChave={setChaveFor}
                        onVisit={() => trackConnect(c.id)}
                      />
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </aside>
      </div>

      <MySolicitacoes code={code} member={member} version={chaveVer} />
      <MyReferrals code={code} member={member} />
      <MyImoveis code={code} member={member} />
      <MyProjects code={code} member={member} trilha="obra" />
      <MyProjects code={code} member={member} />
      <MyGestao code={code} member={member} />

      {chaveFor && (
        <ChaveModal
          company={chaveFor}
          code={code}
          member={member}
          onClose={() => setChaveFor(null)}
          onDone={() => setChaveVer((v) => v + 1)}
        />
      )}
    </div>
  );
}
