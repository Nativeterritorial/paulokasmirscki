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

  // pedidos à IA sem empresa correspondente = oportunidade de recrutamento
  const gaps = (stats?.recentQueries || []).filter(
    (q) => Array.isArray(q.r) && q.r.length === 0
  );
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
            {gaps.length > 0 && (
              <section className="admin-panel admin-radar">
                <h3>🎯 Radar — pedidos sem empresa na rede</h3>
                <p className="admin-hint">
                  Pessoas pediram isso à IA e ainda não há quem atenda. É aqui
                  que vale recrutar empresa nova pro ecossistema.
                </p>
                <ul className="admin-log">
                  {gaps.slice(0, 8).map((q, i) => (
                    <li key={i}>
                      <span className="lg-time">{fmtDate(q.t)}</span>
                      <span className="lg-text">{q.q}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
