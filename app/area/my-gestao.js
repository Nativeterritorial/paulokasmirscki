"use client";

import { useEffect, useState } from "react";
import { usePedidos, PedidosList, PedidoForm } from "./pedidos";
import {
  GOAL_TERMS,
  goalStatusLabel,
  goalsDone,
  monthLabel,
} from "../parcerias/gestao";

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

// texto com quebras de linha vira parágrafos
const Lines = ({ text }) =>
  String(text || "")
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => <p key={i}>{l}</p>);

function Relatorio({ r }) {
  return (
    <div className="gest-rel-body">
      {r.feito && (
        <div className="gest-rel-block">
          <h4>O que foi feito</h4>
          <Lines text={r.feito} />
        </div>
      )}
      {r.numeros && (
        <div className="gest-rel-block">
          <h4>Números do mês</h4>
          <Lines text={r.numeros} />
        </div>
      )}
      {r.proximos && (
        <div className="gest-rel-block">
          <h4>Próximos passos</h4>
          <Lines text={r.proximos} />
        </div>
      )}
    </div>
  );
}

// "Minha gestão": o cliente do modelo "Gestor de negócios" acompanha as metas
// e lê o relatório de cada mês. Com "+ Nova gestão" o membro pede o serviço.
export default function MyGestao({ code, member }) {
  const [gestoes, setGestoes] = useState([]);

  useEffect(() => {
    if (!member) return;
    let alive = true;
    fetch("/api/my-gestao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d.ok) return;
        setGestoes(d.gestoes || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, member]);

  const { list: pedidos, load: loadPedidos, cancel } = usePedidos(code, member, "gestao");
  const [open, setOpen] = useState(false);

  return (
    <section className="area-refs area-projects" id="gestao">
      <div className="area-refs-head">
        <div>
          <div className="kick">Minha gestão · Gestor de negócios</div>
          <h2>Quer um gestor ao lado da sua empresa?</h2>
          <p>Conte o momento da sua empresa: o Paulo atua com você, mês a mês, no planejamento, nos números, nos processos e nas negociações.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen((o) => !o)}>
          {open ? "Fechar" : "+ Nova gestão"}
        </button>
      </div>

      {open && (
        <div className="area-refs-form">
          <PedidoForm code={code} tipo="gestao" member={member} onDone={loadPedidos} />
        </div>
      )}

      <PedidosList list={pedidos} onCancel={cancel} />
      {gestoes.map((g) => {
        const metas = g.metas || [];
        const done = goalsDone(g);
        const [ultimo, ...anteriores] = g.relatorios || [];
        return (
          <article className="proj" key={g.id}>
            <div className="area-refs-head">
              <div>
                <div className="kick">Minha gestão · Gestor de negócios</div>
                <h2>{g.empresa}</h2>
                {g.foco && (
                  <p>
                    <strong>Foco do momento:</strong> {g.foco}
                  </p>
                )}
              </div>
              {metas.length > 0 && (
                <div className="proj-progress" aria-label={`${done} de ${metas.length} metas concluídas`}>
                  <span className="proj-progress-n">
                    {done}/{metas.length}
                  </span>
                  <span className="proj-progress-lbl">metas concluídas</span>
                  <span className="proj-bar" aria-hidden="true">
                    <span style={{ width: `${(done / metas.length) * 100}%` }} />
                  </span>
                </div>
              )}
            </div>

            {metas.length > 0 && (
              <div className="gest-metas">
                {GOAL_TERMS.map((term) => {
                  const list = metas.filter((m) => m.prazo === term.id);
                  if (!list.length) return null;
                  return (
                    <div className="gest-term" key={term.id}>
                      <h3>{term.label}</h3>
                      <ul>
                        {list.map((m) => (
                          <li className={`gest-meta st-${m.status}`} key={m.id}>
                            <span className="proj-n" aria-hidden="true">
                              {m.status === "concluida" ? "✓" : "•"}
                            </span>
                            <span className="gest-meta-txt">{m.texto}</span>
                            <span className="proj-status">{goalStatusLabel(m.status)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {ultimo ? (
              <div className="gest-rel">
                <div className="kick">Relatório de {monthLabel(ultimo.mes)}</div>
                <Relatorio r={ultimo} />
              </div>
            ) : (
              <p className="area-refs-empty">
                O primeiro relatório mensal aparece aqui assim que o Paulo
                fechar o mês.
              </p>
            )}

            {anteriores.length > 0 && (
              <div className="gest-old">
                <div className="kick">Relatórios anteriores</div>
                {anteriores.map((r) => (
                  <details className="gest-old-item" key={r.id}>
                    <summary>{monthLabel(r.mes)}</summary>
                    <Relatorio r={r} />
                  </details>
                ))}
              </div>
            )}

            {g.atualizado && (
              <p className="proj-updated">Atualizado em {fmt(g.atualizado)}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
