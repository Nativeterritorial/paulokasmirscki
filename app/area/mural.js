"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MURAL_TIPOS,
  REGIMES,
  MURAL_DIAS,
  publicarPedePlano,
  responderPedePlano,
  pedeAprovacao,
  PLANO,
  PLANOS,
  EXTRAS_PREMIUM,
} from "../parcerias/mural";
import { useAbrir } from "./abrir";

const WHATSAPP = "https://wa.me/5554996505799";

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const diasRestantes = (expira) =>
  Math.max(0, Math.ceil((expira - Date.now()) / (24 * 60 * 60 * 1000)));
const waLink = (v, txt) => {
  const d = String(v || "").replace(/\D/g, "");
  const n = d.length >= 10 ? (d.length <= 11 ? "55" + d : d) : "";
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(txt)}` : "";
};

const EMPTY = { tipo: "procuro", titulo: "", descricao: "", area: "", cidade: "", empresa: "", regime: "CLT", link: "" };
const linkHref = (v) => (/^https?:\/\//i.test(v) ? v : `https://${String(v).replace(/^@/, "instagram.com/")}`);
const linkTxt = (v) => (/instagram\.com|^@/i.test(v) ? "Ver Instagram" : "Ver site");
// situação das minhas publicações
const situacao = (m) =>
  m.status === "analise"
    ? "em análise pelo Paulo"
    : m.status === "recusado"
    ? "não aprovada"
    : m.noAr
    ? `no ar · mais ${diasRestantes(m.expira)} dia(s)`
    : "fora do ar";

const call = async (code, payload) => {
  const r = await fetch("/api/mural", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, ...payload }),
  });
  return r.json();
};

// convite para o Plano Ecossistema (liberação manual pelo Paulo, por enquanto)
// convite para o plano: Básico (o que resolve no Mural) e, ao lado, o Premium
// para comparar preço e diferença (é o plano em que o Paulo ajuda a vender)
function PlanoModal({ motivo, member, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const quem = member?.nome ? `Aqui é ${member.nome}. ` : "";
  const link = (id) =>
    `${WHATSAPP}?text=${encodeURIComponent(
      `Olá Paulo! ${quem}Quero assinar o plano ${PLANOS[id].nome} (${PLANOS[id].preco}/mês) do Ecossistema PK.`
    )}`;
  const P = PLANOS.premium;
  return (
    <div className="chave-overlay" onClick={onClose}>
      <div className="chave-box plano-box plano-duplo" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="chave-x" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
        <div className="kick">Planos do Ecossistema PK</div>
        {motivo && <p className="chave-lead plano-motivo">{motivo}</p>}
        <div className="plano-cols">
          <section className="plano-col basico">
            <div className="plano-col-tag">Para o Mural</div>
            <h3>{PLANOS.basico.nome}</h3>
            <div className="plano-col-preco">
              {PLANOS.basico.preco}
              <small>/mês</small>
            </div>
            <p className="plano-sub">{PLANOS.basico.sub}</p>
            <ul className="join-checks">
              {PLANOS.basico.beneficios.map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <a className="btn btn-primary join-cta" href={link("basico")} target="_blank" rel="noopener noreferrer">
              Quero o {PLANOS.basico.nome}
            </a>
          </section>
          <section className="plano-col premium">
            <div className="plano-col-tag">★ Para vender mais</div>
            <h3>{P.nome}</h3>
            <div className="plano-col-preco">
              {P.preco}
              <small>/mês</small>
            </div>
            <p className="plano-sub">{P.sub}</p>
            <ul className="join-checks">
              {P.beneficios.slice(0, -1).map((b) => (
                <li key={b}>✓ {b}</li>
              ))}
            </ul>
            <div className="plano-extras">
              <span>Extras com o Paulo:</span>
              {EXTRAS_PREMIUM.map((e) => (
                <span className="plano-extra" key={e.id}>
                  + {e.nome}
                </span>
              ))}
            </div>
            <a className="mur-plano-btn plano-col-btn" href={link("premium")} target="_blank" rel="noopener noreferrer">
              <span className="mur-plano-star" aria-hidden="true">
                ★
              </span>
              <span>
                <small>O Paulo ajuda a vender</small>
                Quero o {P.nome}
              </span>
            </a>
          </section>
        </div>
        <p className="plano-nota">
          Depois do pagamento, o Paulo libera o plano na sua conta.{" "}
          <a href="/ecossistema#planos" target="_blank" rel="noopener noreferrer">
            Ver todos os detalhes →
          </a>
        </p>
      </div>
    </div>
  );
}

// "Tenho interesse" / "Quero me candidatar"
function InteresseModal({ post, onEnviar, onClose }) {
  const [f, setF] = useState({ msg: "", empresa: "", link: "" });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const T = MURAL_TIPOS[post.tipo];
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.msg.trim()) return setErr("Escreva uma mensagem curta.");
    setSending(true);
    const r = await onEnviar(f);
    setSending(false);
    if (r?.ok) setDone(true);
    else setErr(r?.error || "Não consegui enviar. Tente novamente.");
  };
  return (
    <div className="chave-overlay" onClick={onClose}>
      <div className="chave-box" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="chave-x" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
        <div className="kick">{T.label}</div>
        <h3>{post.titulo}</h3>
        {done ? (
          <div className="signup-done">
            <div className="signup-done-ic" aria-hidden="true">
              ✓
            </div>
            <h3>Enviado!</h3>
            <p>
              {post.nome?.split(" ")[0] || "Quem publicou"} recebeu o seu nome, WhatsApp
              e a sua mensagem e vai entrar em contato.
            </p>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : (
          <form className="signup-form" onSubmit={submit}>
            <p className="chave-lead">
              Quem publicou recebe o seu nome e WhatsApp junto com a mensagem.
            </p>
            {post.tipo !== "vaga" && (
              <label>
                Sua empresa
                <input value={f.empresa} onChange={upd("empresa")} placeholder="Nome da empresa (opcional)" />
              </label>
            )}
            <label>
              {post.tipo === "vaga" ? "Apresente-se *" : "Sua mensagem *"}
              <textarea
                rows={4}
                value={f.msg}
                onChange={upd("msg")}
                placeholder={
                  post.tipo === "vaga"
                    ? "Conte sua experiência e por que quer a vaga."
                    : "Ex.: fabricamos esse produto, entrega em 10 dias."
                }
              />
            </label>
            {post.tipo === "vaga" && (
              <label>
                Link do currículo ou LinkedIn
                <input value={f.link} onChange={upd("link")} placeholder="https://..." />
              </label>
            )}
            <button className="btn btn-primary join-cta" disabled={sending}>
              {sending ? "Enviando..." : T.acao}
            </button>
            {err && <div className="signup-err">{err}</div>}
          </form>
        )}
      </div>
    </div>
  );
}

// soVagas: a aba "Vagas" da área mostra só as vagas de emprego do Mural
export default function MyMural({ code, member, soVagas = false }) {
  const VAZIO = soVagas ? { ...EMPTY, tipo: "vaga" } : EMPTY;
  const [data, setData] = useState({ posts: [], meus: [], conta: !!member?.id, plano: !!member?.plano });
  const [filtro, setFiltro] = useState(soVagas ? "vaga" : "todos");
  const [aberto, setAberto] = useState(false);
  const [f, setF] = useState(VAZIO);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [planoMotivo, setPlanoMotivo] = useState(undefined); // undefined = fechado
  const [interesse, setInteresse] = useState(null);
  const [verMeu, setVerMeu] = useState("");
  const [aviso, setAviso] = useState("");

  const load = useCallback(async (payload = {}) => {
    try {
      const d = await call(code, payload);
      if (d.ok) setData(d);
      return d;
    } catch (e) {
      return null;
    }
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  // o concierge pode abrir o formulário ("Publicar no Mural")
  useAbrir("mural", "mural", () => setAberto(true));

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const pedirPlano = (motivo) => setPlanoMotivo(motivo);

  const escolherTipo = (tipo) => {
    if (publicarPedePlano(tipo) && !data.plano) {
      pedirPlano(`Publicar ${tipo === "vaga" ? "vagas de emprego" : "ofertas"} no Mural é do ${PLANO.nome}.`);
      return;
    }
    setF((s) => ({ ...s, tipo }));
  };

  const publicar = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.titulo.trim() || !f.descricao.trim()) return setErr("Preencha o título e a descrição.");
    setSending(true);
    try {
      const r = await fetch("/api/mural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "create", post: f }),
      });
      const d = await r.json();
      if (d.ok) {
        setData(d);
        setF(VAZIO);
        setAberto(false);
        if (pedeAprovacao(f.tipo)) setAviso("Recomendação enviada! Ela aparece no Mural assim que o Paulo aprovar.");
      } else if (d.code === "plano") pedirPlano(d.error);
      else setErr(d.error || "Não consegui publicar. Tente novamente.");
    } catch (e2) {
      setErr("Não consegui publicar. Tente novamente.");
    }
    setSending(false);
  };

  const clicarInteresse = (p) => {
    if (!data.conta) {
      pedirPlano("Para responder no Mural, entre com a sua conta e assine o plano.");
      return;
    }
    if (responderPedePlano(p.tipo) && !data.plano) {
      pedirPlano(`Responder a quem procura fornecedor é do ${PLANO.nome}: é aqui que você fecha negócio.`);
      return;
    }
    setInteresse(p);
  };

  const enviarInteresse = async (dados) => {
    try {
      const r = await fetch("/api/mural", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "interesse", id: interesse.id, dados }),
      });
      const d = await r.json();
      if (d.ok) setData(d);
      if (d.code === "plano") pedirPlano(d.error);
      return d;
    } catch (e) {
      return null;
    }
  };

  const lista = data.posts.filter((p) => filtro === "todos" || p.tipo === filtro);
  const T = MURAL_TIPOS[f.tipo];

  return (
    <section className={`area-refs area-projects svc ${soVagas ? "svc-vag" : "svc-mur"}`} id={soVagas ? "vagas" : "mural"}>
      <div className="area-refs-head">
        <div className="svc-ic" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 9h6M7 13h10M7 17h4" />
            <circle cx="17" cy="9" r="1.2" />
          </svg>
        </div>
        <div className="svc-txt">
          {soVagas ? (
            <>
              <div className="kick">Vagas da rede</div>
              <h2>Trabalhe nas empresas do Ecossistema</h2>
              <p>
                Vagas de emprego abertas nas empresas da rede. Viu uma que
                combina com você ou com alguém que você conhece? Candidate-se
                por aqui. A sua empresa está contratando? Publique a vaga: ela
                fica {MURAL_DIAS} dias no ar.
              </p>
            </>
          ) : (
            <>
              <div className="kick">Mural de Oportunidades</div>
              <h2>Quem precisa encontra quem faz</h2>
              <p>
                Publique o que você procura, ofereça condições para a rede,
                divulgue vagas de emprego e recomende quem é de confiança. Cada
                publicação fica {MURAL_DIAS} dias no ar.
              </p>
            </>
          )}
        </div>
        {data.plano ? (
          <span className="sol-count mur-plano">
            {data.plano === "premium" ? "⭐ Plano Premium" : "✓ Plano Básico"}
          </span>
        ) : (
          <button type="button" className="mur-plano-btn" onClick={() => pedirPlano(null)}>
            <span className="mur-plano-star" aria-hidden="true">★</span>
            <span>
              <small>Vagas, ofertas e respostas no Mural</small>
              Plano {PLANOS.basico.nome} · {PLANOS.basico.preco}/mês
            </span>
          </button>
        )}
      </div>

      <div className="mur-bar">
        <div className="mur-filtros" role="tablist" aria-label="Filtrar o mural" style={soVagas ? { display: "none" } : undefined}>
          {[["todos", "Tudo"], ...Object.entries(MURAL_TIPOS).map(([id, t]) => [id, t.label])].map(([id, lbl]) => (
            <button
              key={id}
              type="button"
              className={`chip${filtro === id ? " chip-on" : ""}`}
              onClick={() => setFiltro(id)}
            >
              {lbl}
            </button>
          ))}
        </div>
        {data.conta ? (
          <button type="button" className={`mur-novo${aberto ? " on" : ""}`} onClick={() => setAberto((v) => !v)}>
            {aberto ? "✕ Fechar" : soVagas ? "+ Publicar vaga" : "+ Publicar no Mural"}
          </button>
        ) : (
          <span className="mur-aviso">Entre com a sua conta para publicar.</span>
        )}
      </div>

      {aberto && (
        <form className="signup-form mur-form" onSubmit={publicar}>
          <div className="mur-tipos">
            {Object.entries(MURAL_TIPOS).map(([id, t]) => (
              <button
                key={id}
                type="button"
                className={`mur-tipo${f.tipo === id ? " on" : ""}`}
                onClick={() => escolherTipo(id)}
              >
                <strong>
                  {t.label}
                  {publicarPedePlano(id) && !data.plano && " 🔒"}
                </strong>
                <span>{t.desc}</span>
              </button>
            ))}
          </div>
          <label>
            {T.titulo} *
            <input value={f.titulo} onChange={upd("titulo")} placeholder={T.exemplo} maxLength={100} />
          </label>
          <label>
            {f.tipo === "recomendo" ? "Por que você recomenda? *" : "Detalhes *"}
            <textarea
              rows={4}
              value={f.descricao}
              onChange={upd("descricao")}
              placeholder={
                f.tipo === "vaga"
                  ? "Atividades, requisitos, horário, salário/benefícios se quiser informar."
                  : f.tipo === "recomendo"
                  ? "Ex.: fez a elétrica da minha casa, caprichoso e cumpriu o prazo."
                  : "Quantidade, prazo, frequência, o que é importante para você."
              }
            />
          </label>
          <div className="signup-row">
            <label>
              {f.tipo === "vaga" ? "Empresa" : f.tipo === "recomendo" ? "Qual serviço faz?" : "Área / segmento"}
              {f.tipo === "vaga" ? (
                <input value={f.empresa} onChange={upd("empresa")} placeholder="Nome da empresa" />
              ) : (
                <input
                  value={f.area}
                  onChange={upd("area")}
                  placeholder={f.tipo === "recomendo" ? "Ex.: elétrica residencial" : "Ex.: embalagens, marketing, obra"}
                />
              )}
            </label>
            <label>
              Cidade
              <input value={f.cidade} onChange={upd("cidade")} placeholder="Ex.: Veranópolis" />
            </label>
          </div>
          {f.tipo === "recomendo" && (
            <label>
              Instagram ou site
              <input value={f.link} onChange={upd("link")} placeholder="Ex.: @eletricajoao ou eletricajoao.com.br" />
            </label>
          )}
          {f.tipo === "vaga" && (
            <label>
              Tipo de contratação
              <select value={f.regime} onChange={upd("regime")}>
                {REGIMES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          )}
          <button className="btn btn-primary join-cta" disabled={sending}>
            {sending ? "Enviando..." : pedeAprovacao(f.tipo) ? "Enviar para aprovação" : "Publicar"}
          </button>
          {err && <div className="signup-err">{err}</div>}
        </form>
      )}

      {aviso && (
        <div className="senha-aviso senha-ok mur-aviso-ok">
          <span>✓ {aviso}</span>
          <button type="button" className="login-link" onClick={() => setAviso("")}>
            Fechar
          </button>
        </div>
      )}

      {data.meus.length > 0 && (
        <div className="mur-meus">
          <div className="mur-sub">Minhas publicações</div>
          {data.meus.map((m) => (
            <article className={`mur-card meu${m.noAr ? "" : " off"}`} key={m.id}>
              <div className="mur-card-top">
                <span className={`mur-tag t-${m.tipo}`}>{MURAL_TIPOS[m.tipo]?.label}</span>
                <span className="mur-meta">{situacao(m)}</span>
              </div>
              <h3>{m.titulo}</h3>
              <div className="mur-acts">
                {m.tipo !== "recomendo" && (
                  <button type="button" className="chip" onClick={() => setVerMeu(verMeu === m.id ? "" : m.id)}>
                    {(m.interesses || []).length} interessado(s) {verMeu === m.id ? "▴" : "▾"}
                  </button>
                )}
                {m.noAr && (
                  <button type="button" className="chip" onClick={() => load({ action: "encerrar", id: m.id })}>
                    Encerrar
                  </button>
                )}
              </div>
              {verMeu === m.id && (
                <div className="mur-ints">
                  {!(m.interesses || []).length && <p className="area-refs-empty">Ninguém respondeu ainda.</p>}
                  {(m.interesses || []).map((i) => {
                    const wa = waLink(i.whatsapp, `Olá ${i.nome}! Vi o seu interesse em "${m.titulo}" no Mural do Ecossistema PK.`);
                    return (
                      <div className="mur-int" key={i.id}>
                        <div>
                          <strong>{i.nome}</strong>
                          {i.empresa && <span> · {i.empresa}</span>}
                          <span className="mur-meta"> · {fmt(i.t)}</span>
                          {i.msg && <p>{i.msg}</p>}
                          {i.link && (
                            <a href={i.link.startsWith("http") ? i.link : `https://${i.link}`} target="_blank" rel="noopener noreferrer">
                              Ver currículo / link
                            </a>
                          )}
                        </div>
                        {wa && (
                          <a className="firm-conn" href={wa} target="_blank" rel="noopener noreferrer">
                            WhatsApp
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {!lista.length ? (
        <p className="area-refs-empty">
          {soVagas
            ? "Nenhuma vaga aberta no momento. A sua empresa está contratando? Publique a primeira vaga da rede!"
            : data.posts.length
            ? "Nada desse tipo no momento."
            : "O Mural ainda está vazio. Seja o primeiro a publicar o que você procura!"}
        </p>
      ) : (
        <div className="mur-grid">
          {lista.map((p) => (
            <article className="mur-card" key={p.id}>
              <div className="mur-card-top">
                <span className={`mur-tag t-${p.tipo}`}>{MURAL_TIPOS[p.tipo]?.label}</span>
                <span className="mur-meta">{fmt(p.t)}</span>
              </div>
              <h3>{p.titulo}</h3>
              <p className="mur-desc">{p.descricao}</p>
              <div className="mur-facts">
                {p.empresa && <span>{p.empresa}</span>}
                {p.regime && <span>{p.regime}</span>}
                {p.area && <span>{p.area}</span>}
                {p.cidade && <span>📍 {p.cidade}</span>}
                {p.tipo !== "recomendo" && <span>por {p.nome?.split(" ")[0]}</span>}
              </div>
              {p.tipo === "recomendo" && (
                <div className="mur-selo">⭐ Recomendado por {p.nome?.split(" ")[0]}</div>
              )}
              <div className="mur-acts">
                {p.tipo === "recomendo" ? (
                  p.link && (
                    <a className="firm-conn" href={linkHref(p.link)} target="_blank" rel="noopener noreferrer">
                      {linkTxt(p.link)}
                    </a>
                  )
                ) : p.jaInteressei ? (
                  <span className="mur-ok">✓ Você já respondeu</span>
                ) : (
                  <button type="button" className="time-btn" onClick={() => clicarInteresse(p)}>
                    {responderPedePlano(p.tipo) && !data.plano && "🔒 "}
                    {MURAL_TIPOS[p.tipo]?.acao}
                  </button>
                )}
                {p.interessados > 0 && <span className="mur-meta">{p.interessados} interessado(s)</span>}
              </div>
            </article>
          ))}
        </div>
      )}

      {planoMotivo !== undefined && (
        <PlanoModal motivo={planoMotivo} member={member} onClose={() => setPlanoMotivo(undefined)} />
      )}
      {interesse && (
        <InteresseModal post={interesse} onEnviar={enviarInteresse} onClose={() => setInteresse(null)} />
      )}
    </section>
  );
}
