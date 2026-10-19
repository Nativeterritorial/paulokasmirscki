"use client";

import { useState } from "react";
import { MURAL_TIPOS } from "../../parcerias/mural";

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
const waDigits = (v) => {
  const d = String(v || "").replace(/[^0-9]/g, "");
  return d.length >= 10 ? (d.length <= 11 ? "55" + d : d) : "";
};
const noAr = (m) => m.status === "ativo" && (m.expira || 0) > Date.now();

// Aba "Mural" do painel: tudo o que foi publicado, quem respondeu, e o
// controle de tirar do ar. As publicações entram no ar na hora (sem aprovação).
const normNome = (v) =>
  String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export default function MuralAdmin({ code, mural, companies = [], onData }) {
  const [filtro, setFiltro] = useState("ar");
  const [aberto, setAberto] = useState("");

  const call = async (payload) => {
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...payload }),
      });
      onData(await r.json());
    } catch (e) {}
  };

  const lista = mural.filter((m) =>
    filtro === "ar" ? noAr(m) : filtro === "fora" ? !noAr(m) : m.tipo === filtro
  );
  const respostas = mural.reduce((n, m) => n + (m.interesses || []).length, 0);
  const analise = mural.filter((m) => m.status === "analise");
  // a empresa recomendada já está na rede? (pelo nome ou pelo link)
  const naRede = (m) => {
    const n = normNome(m.titulo);
    const l = normNome(m.link).replace(/^(https?)?(www)?/, "");
    return companies.find(
      (c) =>
        (n.length > 3 && (normNome(c.nome).includes(n) || n.includes(normNome(c.nome)))) ||
        (l.length > 5 && normNome(c.link).includes(l))
    );
  };

  return (
    <section className="admin-panel admin-signups pd-admin">
      <h3>
        📌 Mural de Oportunidades
        <span className="lg-tag">{mural.filter(noAr).length} no ar</span>
        <span className="lg-tag">{respostas} resposta(s)</span>
      </h3>
      <p className="admin-hint">
        As publicações dos membros entram no ar na hora e ficam 30 dias. Aqui
        você acompanha tudo, vê quem respondeu e pode tirar do ar o que não
        fizer sentido. As vagas também aparecem na página pública{" "}
        <a href="/vagas" target="_blank" rel="noopener noreferrer">/vagas</a>.
      </p>
      {analise.length > 0 && (
        <div className="mur-analise">
          <div className="senha-pedidos-h">
            ⭐ Recomendações para aprovar
            <span className="lg-tag">{analise.length}</span>
          </div>
          {analise.map((m) => {
            const rede = naRede(m);
            return (
              <div className="mur-int" key={m.id}>
                <div>
                  <strong>{m.titulo}</strong>
                  {m.area && <span> · {m.area}</span>}
                  {m.cidade && <span> · {m.cidade}</span>}
                  <span className="mur-meta"> · recomendado por {m.nome} em {fmt(m.t)}</span>
                  <p>“{m.descricao}”</p>
                  {m.link && (
                    <a href={/^https?:/i.test(m.link) ? m.link : `https://${m.link.replace(/^@/, "instagram.com/")}`} target="_blank" rel="noopener noreferrer">
                      {m.link}
                    </a>
                  )}
                  <p className="mur-rede">
                    {rede
                      ? `✓ Já está na rede: ${rede.nome}`
                      : `Ainda não está na rede — convide! Argumento: “${m.nome.split(" ")[0]} te recomendou”.`}
                  </p>
                </div>
                <span className="lead-actions">
                  <button type="button" className="chip chip-add" onClick={() => call({ action: "muralStatus", id: m.id, status: "ativo" })}>
                    Aprovar
                  </button>
                  <button type="button" className="chip" onClick={() => call({ action: "muralStatus", id: m.id, status: "recusado" })}>
                    Recusar
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="admin-periods" style={{ marginBottom: 14 }}>
        {[
          ["ar", "No ar"],
          ["procuro", "Procuro"],
          ["ofereco", "Ofereço"],
          ["vaga", "Vagas"],
          ["recomendo", "Recomendo"],
          ["fora", "Fora do ar"],
        ].map(([id, lbl]) => (
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

      {!lista.length ? (
        <p className="admin-empty">
          {mural.length ? "Nada nesse filtro." : "Nenhuma publicação ainda. Elas chegam pela seção Mural da área de membros."}
        </p>
      ) : (
        <div className="lead-cards">
          {lista.map((m) => {
            const wa = waDigits(m.whatsapp);
            const ints = m.interesses || [];
            return (
              <div className={`lead-card${noAr(m) ? "" : " lead-ok"}`} key={m.id}>
                <div className="lead-card-top">
                  <div>
                    <div className="lead-nm">
                      <span className={`mur-tag t-${m.tipo}`}>{MURAL_TIPOS[m.tipo]?.label}</span>{" "}
                      {m.titulo}
                    </div>
                    <div className="lead-ct">
                      {m.nome}
                      {m.empresa ? ` · ${m.empresa}` : ""}
                      {m.cidade ? ` · ${m.cidade}` : ""}
                      {m.regime ? ` · ${m.regime}` : ""} · publicado {fmt(m.t)} ·{" "}
                      {noAr(m)
                        ? `no ar até ${fmt(m.expira)}`
                        : m.status === "oculto"
                        ? "tirado do ar por você"
                        : m.status === "analise"
                        ? "aguardando a sua aprovação"
                        : m.status === "recusado"
                        ? "recusada"
                        : "fora do ar"}
                    </div>
                  </div>
                  <div className="lead-actions">
                    {wa && (
                      <a className="firm-conn" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </a>
                    )}
                    <button type="button" className="chip" onClick={() => setAberto(aberto === m.id ? "" : m.id)}>
                      {ints.length} resposta(s)
                    </button>
                    {noAr(m) ? (
                      <button type="button" className="chip" onClick={() => call({ action: "muralStatus", id: m.id, status: "oculto" })}>
                        Tirar do ar
                      </button>
                    ) : (
                      m.status === "oculto" &&
                      (m.expira || 0) > Date.now() && (
                        <button type="button" className="chip" onClick={() => call({ action: "muralStatus", id: m.id, status: "ativo" })}>
                          Voltar ao ar
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      className="chip chip-danger"
                      onClick={() =>
                        window.confirm(`Excluir “${m.titulo}”? Some também das respostas.`) &&
                        call({ action: "muralDelete", id: m.id })
                      }
                    >
                      Excluir
                    </button>
                  </div>
                </div>
                <p className="lead-msg">{m.descricao}</p>
                {aberto === m.id && (
                  <div className="mur-ints">
                    {!ints.length && <p className="admin-empty">Ninguém respondeu ainda.</p>}
                    {ints.map((i) => (
                      <div className="mur-int" key={i.id}>
                        <div>
                          <strong>{i.nome}</strong>
                          {i.empresa && <span> · {i.empresa}</span>}
                          <span className="mur-meta"> · {i.whatsapp} · {fmt(i.t)}</span>
                          {!i.memberId && <span className="mur-meta"> · candidato pelo site</span>}
                          {i.msg && <p>{i.msg}</p>}
                          {i.link && (
                            <a href={i.link.startsWith("http") ? i.link : `https://${i.link}`} target="_blank" rel="noopener noreferrer">
                              {i.link}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
