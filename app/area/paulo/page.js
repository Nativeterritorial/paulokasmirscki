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
      setAuthed(true);
      try {
        localStorage.setItem("admin_code", c);
      } catch (e) {}
    } catch (e) {
      setErr("Erro ao carregar. Tente novamente.");
    }
    setLoading(false);
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
            {/* CARTÕES DE TOTAIS */}
            <div className="admin-cards">
              <div className="admin-card">
                <div className="admin-num">{stats.totals.queries}</div>
                <div className="admin-lbl">Conversas com a IA</div>
              </div>
              <div className="admin-card">
                <div className="admin-num">{stats.totals.connects}</div>
                <div className="admin-lbl">Pedidos de conexão</div>
              </div>
              <div className="admin-card">
                <div className="admin-num">{stats.totals.leads || 0}</div>
                <div className="admin-lbl">Leads do site</div>
              </div>
            </div>

            {/* LEADS DO FORMULÁRIO */}
            {stats.leads?.length > 0 && (
              <section className="admin-panel" style={{ marginBottom: 22 }}>
                <h3>📥 Leads do site (formulário da home)</h3>
                <ul className="admin-log">
                  {stats.leads.map((l, i) => (
                    <li key={i} className="lead-item">
                      <span className="lg-time">{fmtDate(l.t)}</span>
                      <span className="lg-text">
                        <strong>{l.nome}</strong> · {l.contato}
                        <br />
                        {l.msg}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
                        <span className="rk-name">{r.nome}</span>
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
                        <span className="rk-name">{r.nome}</span>
                        <span className="rk-count">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ÚLTIMAS CONVERSAS */}
              <section className="admin-panel">
                <h3>💬 Últimas perguntas à IA</h3>
                {stats.recentQueries.length === 0 ? (
                  <p className="admin-empty">Ainda sem dados.</p>
                ) : (
                  <ul className="admin-log">
                    {stats.recentQueries.map((q, i) => (
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
                {stats.recentConnects.length === 0 ? (
                  <p className="admin-empty">Ainda sem dados.</p>
                ) : (
                  <ul className="admin-log">
                    {stats.recentConnects.map((c, i) => (
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
