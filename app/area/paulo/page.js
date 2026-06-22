"use client";

import { useEffect, useState } from "react";

function fmtDate(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function PauloAdmin() {
  const [authed, setAuthed] = useState(false);
  const [code, setCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("all"); // "7" | "30" | "all"
  const [customCompanies, setCustomCompanies] = useState([]);
  const [fixedCompanies, setFixedCompanies] = useState([]);
  const [editing, setEditing] = useState(null); // empresa em edição (ou nova)
  const [savingCo, setSavingCo] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_code");
      if (saved) {
        setCode(saved);
        setAuthed(true);
        load(saved);
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (c) => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      if (r.status === 401) {
        setErr("Código incorreto.");
        setAuthed(false);
        try {
          localStorage.removeItem("admin_code");
        } catch (e) {}
        setLoading(false);
        return;
      }
      const d = await r.json();
      setStats(d.stats);
      if (d.inviteLink) setInviteLink(d.inviteLink);
      if (Array.isArray(d.customCompanies)) setCustomCompanies(d.customCompanies);
      if (Array.isArray(d.fixedCompanies)) setFixedCompanies(d.fixedCompanies);
      setAuthed(true);
      try {
        localStorage.setItem("admin_code", c);
      } catch (e) {}
    } catch (e) {
      setErr("Erro ao carregar. Tente novamente.");
    }
    setLoading(false);
  };

  // atualização automática a cada 60s
  useEffect(() => {
    if (!authed || !code) return;
    const id = setInterval(() => load(code), 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, code]);

  // marca/desmarca lead como atendido (otimista + persiste no servidor)
  const toggleLeadDone = (t, done) => {
    setStats((s) => ({
      ...s,
      leadsDone: done
        ? [...(s.leadsDone || []), String(t)]
        : (s.leadsDone || []).filter((x) => x !== String(t)),
    }));
    fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "leadDone", t, done }),
    }).catch(() => {});
  };

  // marca/desmarca demanda (pedido sem empresa) como já buscada/recrutada
  const toggleDemandDone = (t, done) => {
    setStats((s) => ({
      ...s,
      demandsDone: done
        ? [...(s.demandsDone || []), String(t)]
        : (s.demandsDone || []).filter((x) => x !== String(t)),
    }));
    fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "demandDone", t, done }),
    }).catch(() => {});
  };

  // ---- gerenciar empresas da rede ----
  const emptyCompany = {
    id: "",
    nome: "",
    segmento: "",
    descricao: "",
    atende: "",
    link: "",
    linkLabel: "",
  };
  const startNew = () => setEditing({ ...emptyCompany });
  const startEdit = (c) =>
    setEditing({
      ...c,
      atende: Array.isArray(c.atende) ? c.atende.join(", ") : c.atende || "",
    });
  const cancelEdit = () => setEditing(null);

  const saveCompanyForm = async () => {
    if (!editing?.nome?.trim()) return;
    setSavingCo(true);
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          action: "companySave",
          company: {
            id: editing.id || undefined,
            nome: editing.nome,
            segmento: editing.segmento,
            descricao: editing.descricao,
            atende: editing.atende,
            link: editing.link,
            linkLabel: editing.linkLabel,
          },
        }),
      });
      const d = await r.json();
      if (Array.isArray(d.customCompanies)) setCustomCompanies(d.customCompanies);
      setEditing(null);
    } catch (e) {}
    setSavingCo(false);
  };

  const deleteCompanyForm = async (id) => {
    if (!id) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Remover esta empresa da rede? A IA deixa de indicá-la.")
    )
      return;
    setCustomCompanies((list) => list.filter((c) => c.id !== id));
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "companyDelete", id }),
      });
      const d = await r.json();
      if (Array.isArray(d.customCompanies)) setCustomCompanies(d.customCompanies);
    } catch (e) {}
  };

  // marca/desmarca cadastro de empresa (form do /ecossistema) como atendido
  const toggleSignupDone = (t, done) => {
    setStats((s) => ({
      ...s,
      signupsDone: done
        ? [...(s.signupsDone || []), String(t)]
        : (s.signupsDone || []).filter((x) => x !== String(t)),
    }));
    fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, action: "signupDone", t, done }),
    }).catch(() => {});
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  // exporta os leads em CSV (abre no Excel)
  const exportCsv = () => {
    const rows = [
      ["Data", "Nome", "Contato", "Pedido", "Atendido"],
      ...(stats?.leads || []).map((l) => [
        fmtDate(l.t),
        l.nome,
        l.contato,
        l.msg,
        (stats.leadsDone || []).includes(String(l.t)) ? "sim" : "não",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leads-ecossistema.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const login = (e) => {
    e.preventDefault();
    setCode(codeInput);
    load(codeInput);
  };

  const logout = () => {
    try {
      localStorage.removeItem("admin_code");
    } catch (e) {}
    setAuthed(false);
    setCode("");
    setStats(null);
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
            Painel do Paulo
          </div>
          <h1 style={{ fontSize: "1.9rem", margin: "8px 0 6px" }}>
            Controle da <em>rede</em>
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "0.95rem",
              marginBottom: 22,
            }}
          >
            Acesso restrito. Entre com o código de administrador.
          </p>
          <form onSubmit={login} className="login-form">
            <input
              type="password"
              placeholder="Código de administrador"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              autoFocus
            />
            <button className="btn btn-primary" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          {err && <div className="login-err">{err}</div>}
        </div>
      </div>
    );
  }

  const notReady = stats && stats.ready === false;

  // botão de resposta do lead: WhatsApp se for telefone, e-mail se tiver @
  const leadAction = (l) => {
    const digits = String(l.contato || "").replace(/\D/g, "");
    if (l.contato?.includes("@"))
      return {
        href: `mailto:${l.contato}?subject=${encodeURIComponent(
          "Seu pedido no ecossistema"
        )}`,
        label: "E-mail",
      };
    if (digits.length >= 10) {
      const full = digits.length <= 11 ? `55${digits}` : digits;
      return {
        href: `https://wa.me/${full}?text=${encodeURIComponent(
          `Olá ${l.nome}! Aqui é o Paulo Kasmirscki. Vi seu pedido no site: "${l.msg}". Vamos conversar?`
        )}`,
        label: "Responder",
      };
    }
    return null;
  };

  // demandas (necessidades reais sem empresa, já resumidas pela IA) = recrutamento
  const isDemandDone = (q) =>
    (stats?.demandsDone || []).includes(String(q.t));
  const allGaps = stats?.demands || [];
  const gaps = allGaps.filter((q) => !isDemandDone(q));
  const gapsDone = allGaps.filter(isDemandDone);

  // cadastros de empresas (form do /ecossistema)
  const isSignupDone = (s) => (stats?.signupsDone || []).includes(String(s.t));
  const signupsPend = (stats?.signups || []).filter((s) => !isSignupDone(s)).length;
  const hoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // filtros de período e busca aplicados às listas
  const cutoff =
    periodo === "all" ? 0 : Date.now() - Number(periodo) * 86400000;
  const inPeriod = (x) => !cutoff || (x.t || 0) >= cutoff;
  const match = (txt) =>
    !busca || String(txt || "").toLowerCase().includes(busca.toLowerCase());
  const fQueries = (stats?.recentQueries || [])
    .filter(inPeriod)
    .filter((q) => match(q.q));
  const fConnects = (stats?.recentConnects || [])
    .filter(inPeriod)
    .filter((c) => match(c.nome));
  const fLeads = (stats?.leads || [])
    .filter(inPeriod)
    .filter((l) => match(`${l.nome} ${l.contato} ${l.msg}`));
  const isDone = (l) => (stats?.leadsDone || []).includes(String(l.t));
  const pendentes = (stats?.leads || []).filter((l) => !isDone(l)).length;

  // gráfico: eventos por dia nos últimos 14 dias
  const days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d.getTime();
  });
  const chart = days.map((d0) => {
    const d1 = d0 + 86400000;
    const cnt = (list) =>
      (list || []).filter((x) => x.t >= d0 && x.t < d1).length;
    return {
      d: d0,
      q: cnt(stats?.recentQueries),
      c: cnt(stats?.recentConnects),
      l: cnt(stats?.leads),
    };
  });
  const chartMax = Math.max(1, ...chart.map((d) => d.q + d.c + d.l));

  // ---------- PAINEL ----------
  return (
    <div className="area">
      <header className="area-top">
        <a className="brand" href="/" aria-label="Paulo Kasmirscki">
          <img src="/logo-mark.svg" alt="" style={{ height: 30 }} />
          <span className="brand-name">Paulo Kasmirscki</span>
          <span className="area-badge">Painel do Paulo</span>
        </a>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="area-logout" onClick={() => load(code)}>
            Atualizar
          </button>
          <button className="area-logout" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <div className="admin-wrap">
        {notReady && (
          <div className="admin-alert">
            ⚙️ O armazenamento ainda não foi conectado. Conecte um banco
            Upstash/Vercel KV (variáveis <code>KV_REST_API_URL</code> e{" "}
            <code>KV_REST_API_TOKEN</code>) para começar a registrar os dados.
            Enquanto isso, o painel funciona mas fica sem números.
          </div>
        )}

        {stats && stats.ready && (
          <>
            {/* SAUDAÇÃO */}
            <div className="admin-hero">
              <div>
                <div className="kick">{hoje}</div>
                <h1>
                  Olá, <em>Paulo</em> 👋
                </h1>
                <p>
                  Sua rede gerou <strong>{stats.totals.queries}</strong>{" "}
                  {stats.totals.queries === 1 ? "conversa" : "conversas"} com a
                  IA, <strong>{stats.totals.connects}</strong>{" "}
                  {stats.totals.connects === 1 ? "pedido" : "pedidos"} de
                  conexão e <strong>{stats.totals.leads || 0}</strong>{" "}
                  {(stats.totals.leads || 0) === 1 ? "lead" : "leads"} até
                  agora.
                </p>
              </div>
            </div>

            {/* FERRAMENTAS */}
            <div className="admin-toolbar">
              <div className="admin-periods">
                {[
                  ["7", "7 dias"],
                  ["30", "30 dias"],
                  ["all", "Tudo"],
                ].map(([v, lbl]) => (
                  <button
                    key={v}
                    type="button"
                    className={`chip${periodo === v ? " chip-on" : ""}`}
                    onClick={() => setPeriodo(v)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <input
                className="admin-search"
                placeholder="Buscar lead, pergunta, empresa…"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              <div className="admin-tools">
                {inviteLink && (
                  <button type="button" className="chip" onClick={copyInvite}>
                    {copied ? "✓ Copiado!" : "🔗 Copiar link-convite"}
                  </button>
                )}
                {stats.leads?.length > 0 && (
                  <button type="button" className="chip" onClick={exportCsv}>
                    ⬇ Exportar leads (CSV)
                  </button>
                )}
              </div>
            </div>

            {/* CARTÕES DE TOTAIS */}
            <div className="admin-cards">
              <div className="admin-card">
                <div className="admin-ic" aria-hidden="true">
                  💬
                </div>
                <div className="admin-num">{stats.totals.queries}</div>
                <div className="admin-lbl">Conversas com a IA</div>
              </div>
              <div className="admin-card">
                <div className="admin-ic" aria-hidden="true">
                  🤝
                </div>
                <div className="admin-num">{stats.totals.connects}</div>
                <div className="admin-lbl">Pedidos de conexão</div>
              </div>
              <div className="admin-card">
                <div className="admin-ic" aria-hidden="true">
                  📥
                </div>
                <div className="admin-num">{stats.totals.leads || 0}</div>
                <div className="admin-lbl">Leads do site</div>
              </div>
            </div>

            {/* GRÁFICO DE ATIVIDADE (14 DIAS) */}
            <section className="admin-panel admin-chart-panel">
              <h3>📈 Atividade — últimos 14 dias</h3>
              <div className="admin-chart">
                {chart.map((d) => (
                  <div
                    className="ac-col"
                    key={d.d}
                    title={`${new Date(d.d).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })} — ${d.q} conversa(s), ${d.c} conexão(ões), ${d.l} lead(s)`}
                  >
                    <div className="ac-bars">
                      {d.l > 0 && (
                        <div
                          className="ac-bar ac-l"
                          style={{ height: `${(d.l / chartMax) * 100}%` }}
                        />
                      )}
                      {d.c > 0 && (
                        <div
                          className="ac-bar ac-c"
                          style={{ height: `${(d.c / chartMax) * 100}%` }}
                        />
                      )}
                      {d.q > 0 && (
                        <div
                          className="ac-bar ac-q"
                          style={{ height: `${(d.q / chartMax) * 100}%` }}
                        />
                      )}
                      {d.q + d.c + d.l === 0 && <div className="ac-zero" />}
                    </div>
                    <div className="ac-day">
                      {new Date(d.d).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="ac-legend">
                <span>
                  <i className="ac-q" /> Conversas
                </span>
                <span>
                  <i className="ac-c" /> Conexões
                </span>
                <span>
                  <i className="ac-l" /> Leads
                </span>
              </div>
            </section>

            {/* RADAR: DEMANDA SEM EMPRESA NA REDE */}
            {(gaps.length > 0 || gapsDone.length > 0) && (
              <section className="admin-panel admin-radar">
                <h3>
                  🎯 Radar — pedidos sem empresa na rede
                  {gaps.length > 0 && (
                    <span className="lg-tag">{gaps.length} pra buscar</span>
                  )}
                </h3>
                <p className="admin-hint">
                  Pessoas pediram isso à IA e ainda não há quem atenda. É aqui
                  que vale recrutar empresa nova pro ecossistema. Marque “Já
                  busquei” quando encontrar/recrutar um parceiro.
                </p>
                {gaps.length === 0 ? (
                  <p className="admin-empty">
                    Tudo em dia — nenhuma demanda em aberto. 🎉
                  </p>
                ) : (
                  <div className="gap-cards">
                    {gaps.slice(0, 12).map((q, i) => (
                      <div className="gap-card" key={q.t || i}>
                        <div className="gap-body">
                          <span className="lg-time">{fmtDate(q.t)}</span>
                          <span className="gap-text">“{q.q}”</span>
                        </div>
                        <div className="gap-actions">
                          <a
                            className="chip"
                            href={`https://www.google.com/search?q=${encodeURIComponent(
                              q.q + " Caxias do Sul RS"
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Procurar um parceiro no Google"
                          >
                            🔎 Buscar
                          </a>
                          <button
                            type="button"
                            className="lead-check"
                            onClick={() => toggleDemandDone(q.t, true)}
                            title="Marcar como já buscada/recrutada"
                          >
                            ✓ Já busquei
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {gapsDone.length > 0 && (
                  <details className="gap-done">
                    <summary>
                      Já buscadas ({gapsDone.length})
                    </summary>
                    <ul className="admin-log">
                      {gapsDone.slice(0, 12).map((q, i) => (
                        <li key={q.t || i}>
                          <span className="lg-time">{fmtDate(q.t)}</span>
                          <span className="lg-text" style={{ opacity: 0.6 }}>
                            {q.q}
                          </span>
                          <button
                            type="button"
                            className="gap-undo"
                            onClick={() => toggleDemandDone(q.t, false)}
                            title="Reabrir demanda"
                          >
                            reabrir
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </section>
            )}

            {/* CADASTROS DE EMPRESAS (form do /ecossistema) */}
            <section className="admin-panel admin-signups">
              <h3>
                📨 Cadastros de empresas
                {signupsPend > 0 && (
                  <span className="lg-tag">{signupsPend} novo(s)</span>
                )}
              </h3>
              <p className="admin-hint">
                Empresas que pediram pra entrar na rede pelo site (página
                “Entre para o Ecossistema”). Fale com elas e marque como
                atendido.
              </p>
              {!(stats.signups || []).length ? (
                <p className="admin-empty">
                  Nenhum cadastro ainda. Eles chegam pelo formulário em
                  /ecossistema.
                </p>
              ) : (
                <div className="lead-cards">
                  {(stats.signups || [])
                    .filter((s) => match(`${s.nome} ${s.empresa} ${s.email} ${s.whatsapp}`))
                    .filter(inPeriod)
                    .map((s, i) => {
                      const done = isSignupDone(s);
                      const digits = String(s.whatsapp || "").replace(/\D/g, "");
                      const waFull =
                        digits.length >= 10
                          ? digits.length <= 11
                            ? `55${digits}`
                            : digits
                          : "";
                      return (
                        <div
                          className={`lead-card${done ? " lead-ok" : ""}`}
                          key={s.t || i}
                        >
                          <div className="lead-card-top">
                            <div>
                              <div className="lead-nm">
                                {s.nome}
                                {s.empresa && (
                                  <span className="su-emp"> · {s.empresa}</span>
                                )}
                              </div>
                              <div className="lead-ct">{fmtDate(s.t)}</div>
                            </div>
                            <div className="lead-actions">
                              {!done && waFull && (
                                <a
                                  className="firm-conn"
                                  href={`https://wa.me/${waFull}?text=${encodeURIComponent(
                                    `Olá ${s.nome}! Aqui é o Paulo Kasmirscki. Recebi seu cadastro pra entrar na rede. Vamos conversar?`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  WhatsApp
                                </a>
                              )}
                              {!done && !waFull && s.email && (
                                <a
                                  className="firm-conn"
                                  href={`mailto:${s.email}?subject=${encodeURIComponent(
                                    "Sua entrada na rede do Paulo Kasmirscki"
                                  )}`}
                                >
                                  E-mail
                                </a>
                              )}
                              <button
                                type="button"
                                className={`lead-check${done ? " on" : ""}`}
                                onClick={() => toggleSignupDone(s.t, !done)}
                              >
                                ✓ {done ? "Atendido" : "Atender"}
                              </button>
                            </div>
                          </div>
                          <div className="su-contacts">
                            {s.whatsapp && (
                              <span>📱 {s.whatsapp}</span>
                            )}
                            {s.email && <span>✉️ {s.email}</span>}
                            {s.site && (
                              <a
                                href={
                                  s.site.startsWith("http")
                                    ? s.site
                                    : `https://${s.site}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                🌐 {s.site}
                              </a>
                            )}
                            {s.instagram && (
                              <a
                                href={`https://instagram.com/${s.instagram.replace(
                                  /^@/,
                                  ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                📷 {s.instagram}
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </section>

            {/* GERENCIAR EMPRESAS DA REDE */}
            <section className="admin-panel admin-companies">
              <h3>
                🏢 Empresas da rede
                <button
                  type="button"
                  className="chip chip-add"
                  onClick={startNew}
                >
                  + Adicionar empresa
                </button>
              </h3>
              <p className="admin-hint">
                Cadastre, edite ou remova as empresas que a IA recomenda. As
                alterações entram na hora no concierge e no diretório.
              </p>

              {editing && (
                <div className="co-form">
                  <div className="co-form-grid">
                    <label>
                      Nome da empresa *
                      <input
                        value={editing.nome}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, nome: e.target.value }))
                        }
                        placeholder="Ex.: Padaria do João"
                      />
                    </label>
                    <label>
                      Segmento
                      <input
                        value={editing.segmento}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, segmento: e.target.value }))
                        }
                        placeholder="Ex.: Alimentação"
                      />
                    </label>
                    <label className="co-full">
                      Descrição (o que ela faz)
                      <textarea
                        rows={2}
                        value={editing.descricao}
                        onChange={(e) =>
                          setEditing((s) => ({
                            ...s,
                            descricao: e.target.value,
                          }))
                        }
                        placeholder="Em 1 ou 2 frases, o que a empresa oferece."
                      />
                    </label>
                    <label className="co-full">
                      Atende (áreas, separadas por vírgula)
                      <input
                        value={editing.atende}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, atende: e.target.value }))
                        }
                        placeholder="Ex.: Alimentação, Comércio & Varejo"
                      />
                    </label>
                    <label>
                      Link de contato
                      <input
                        value={editing.link}
                        onChange={(e) =>
                          setEditing((s) => ({ ...s, link: e.target.value }))
                        }
                        placeholder="https://wa.me/55... ou site"
                      />
                    </label>
                    <label>
                      Texto do botão
                      <input
                        value={editing.linkLabel}
                        onChange={(e) =>
                          setEditing((s) => ({
                            ...s,
                            linkLabel: e.target.value,
                          }))
                        }
                        placeholder="Ex.: Falar no WhatsApp"
                      />
                    </label>
                  </div>
                  <div className="co-form-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={saveCompanyForm}
                      disabled={savingCo || !editing.nome.trim()}
                    >
                      {savingCo ? "Salvando..." : "Salvar empresa"}
                    </button>
                    <button
                      type="button"
                      className="chip"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="co-list">
                {customCompanies.length === 0 && !editing && (
                  <p className="admin-empty">
                    Nenhuma empresa cadastrada por você ainda. Clique em
                    “Adicionar empresa” pra começar.
                  </p>
                )}
                {customCompanies.map((c) => {
                  const norm = (s) =>
                    String(s || "")
                      .normalize("NFD")
                      .replace(/[̀-ͯ]/g, "")
                      .toLowerCase()
                      .replace(/\s+/g, " ")
                      .trim();
                  const dup = fixedCompanies.some(
                    (f) => f.id === c.id || norm(f.nome) === norm(c.nome)
                  );
                  return (
                  <div className="co-card" key={c.id}>
                    <div className="co-badge" aria-hidden="true">
                      {(c.nome || "?").trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="co-body">
                      <div className="co-nm">{c.nome}</div>
                      <div className="co-sg">{c.segmento}</div>
                      <div className="co-ds">{c.descricao}</div>
                      {dup && (
                        <div className="co-warn">
                          ⚠️ Já existe uma versão oficial desta empresa (com logo
                          na home). Pode remover esta para não duplicar.
                        </div>
                      )}
                    </div>
                    <div className="co-actions">
                      <button
                        type="button"
                        className="chip"
                        onClick={() => startEdit(c)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="chip chip-danger"
                        onClick={() => deleteCompanyForm(c.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              {fixedCompanies.length > 0 && (
                <details className="co-fixed">
                  <summary>
                    Empresas fixas da equipe ({fixedCompanies.length}) — com logo
                    na home
                  </summary>
                  <div className="co-list">
                    {fixedCompanies.map((c) => (
                      <div className="co-card co-card-fixed" key={c.id}>
                        <div className="co-badge" aria-hidden="true">
                          {(c.nome || "?").trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="co-body">
                          <div className="co-nm">
                            {c.nome}
                            <span className="co-tag">fixa</span>
                          </div>
                          <div className="co-sg">{c.segmento}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="admin-hint" style={{ marginTop: 10 }}>
                    Essas são mantidas pela equipe (têm logo caprichado na home).
                    Pra mudar uma delas, fale com o Felipe.
                  </p>
                </details>
              )}
            </section>

            {/* LEADS DO FORMULÁRIO */}
            <section className="admin-panel admin-leads">
              <h3>
                📥 Leads do site
                {pendentes > 0 && (
                  <span className="lg-tag">{pendentes} a responder</span>
                )}
              </h3>
              {!fLeads.length ? (
                <p className="admin-empty">
                  {stats.leads?.length
                    ? "Nenhum lead nesse filtro."
                    : "Nenhum lead ainda. Eles chegam pelo formulário no final da página inicial."}
                </p>
              ) : (
                <div className="lead-cards">
                  {fLeads.map((l, i) => {
                    const action = leadAction(l);
                    const done = isDone(l);
                    return (
                      <div
                        className={`lead-card${done ? " lead-ok" : ""}`}
                        key={i}
                      >
                        <div className="lead-card-top">
                          <div>
                            <div className="lead-nm">{l.nome}</div>
                            <div className="lead-ct">
                              {l.contato} · {fmtDate(l.t)}
                            </div>
                          </div>
                          <div className="lead-actions">
                            {action && !done && (
                              <a
                                className="firm-conn"
                                href={action.href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {action.label}
                              </a>
                            )}
                            <button
                              type="button"
                              className={`lead-check${done ? " on" : ""}`}
                              onClick={() => toggleLeadDone(l.t, !done)}
                              title={
                                done
                                  ? "Marcar como pendente"
                                  : "Marcar como atendido"
                              }
                            >
                              ✓ {done ? "Atendido" : "Atender"}
                            </button>
                          </div>
                        </div>
                        <p className="lead-msg">“{l.msg}”</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="admin-grid">
              {/* O QUE A IA MAIS RECOMENDA */}
              <section className="admin-panel">
                <h3>🔥 Empresas mais recomendadas pela IA</h3>
                {stats.recommended.length === 0 ? (
                  <p className="admin-empty">Ainda sem dados.</p>
                ) : (
                  <ul className="admin-rank">
                    {stats.recommended.map((r, i) => (
                      <li key={r.id}>
                        <span className="rk-pos">{i + 1}</span>
                        <span className="rk-name">
                          {r.nome}
                          <span
                            className="rk-bar"
                            style={{
                              width: `${
                                (r.count / stats.recommended[0].count) * 100
                              }%`,
                            }}
                          />
                        </span>
                        <span className="rk-count">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* RANKING DE CONEXÕES */}
              <section className="admin-panel">
                <h3>🤝 Mais procuradas (botão Conectar)</h3>
                {stats.connectsRanking.length === 0 ? (
                  <p className="admin-empty">Ainda sem dados.</p>
                ) : (
                  <ul className="admin-rank">
                    {stats.connectsRanking.map((r, i) => (
                      <li key={r.id}>
                        <span className="rk-pos">{i + 1}</span>
                        <span className="rk-name">
                          {r.nome}
                          <span
                            className="rk-bar"
                            style={{
                              width: `${
                                (r.count / stats.connectsRanking[0].count) *
                                100
                              }%`,
                            }}
                          />
                        </span>
                        <span className="rk-count">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ÚLTIMAS CONVERSAS */}
              <section className="admin-panel">
                <h3>💬 Últimas perguntas à IA</h3>
                {fQueries.length === 0 ? (
                  <p className="admin-empty">Nada por aqui.</p>
                ) : (
                  <ul className="admin-log">
                    {fQueries.map((q, i) => (
                      <li key={i}>
                        <span className="lg-time">{fmtDate(q.t)}</span>
                        <span className="lg-text">
                          {q.q}
                          {Array.isArray(q.r) && q.r.length === 0 && (
                            <span
                              className="lg-tag"
                              title="A IA não tinha empresa na rede pra esse pedido — oportunidade de recrutar"
                            >
                              sem empresa na rede
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ÚLTIMAS CONEXÕES */}
              <section className="admin-panel">
                <h3>📌 Últimos pedidos de conexão</h3>
                {fConnects.length === 0 ? (
                  <p className="admin-empty">Nada por aqui.</p>
                ) : (
                  <ul className="admin-log">
                    {fConnects.map((c, i) => (
                      <li key={i}>
                        <span className="lg-time">{fmtDate(c.t)}</span>
                        <span className="lg-text">{c.nome}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
