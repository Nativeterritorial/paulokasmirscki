"use client";

import { useEffect, useState } from "react";
import { usePedidos, PedidosList, PedidoForm } from "./pedidos";
import {
  PROJECT_STAGES,
  stageStatusLabel,
  projectProgress,
} from "../parcerias/project-stages";

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

// "Meu projeto": o cliente do modelo "Da ideia à abertura" acompanha as seis
// etapas — o que já foi feito, quem cuida de cada uma e o próximo passo.
// Sempre aparece: com "+ Novo projeto" o membro manda a ideia pro Paulo.
export default function MyProjects({ code, member }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!member) return;
    let alive = true;
    fetch("/api/my-projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!alive || !d.ok) return;
        setProjects(d.projects || []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, member]);

  const { list: pedidos, load: loadPedidos, cancel } = usePedidos(code, member, "projeto");
  const [open, setOpen] = useState(false);

  return (
    <section className="area-refs area-projects" id="projeto">
      <div className="area-refs-head">
        <div>
          <div className="kick">Meu projeto · Da ideia à abertura</div>
          <h2>Tem a ideia de um negócio?</h2>
          <p>Conte a sua ideia: o Paulo coordena as empresas da rede em cada etapa, da viabilidade até a inauguração.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen((o) => !o)}>
          {open ? "Fechar" : "+ Novo projeto"}
        </button>
      </div>

      {open && (
        <div className="area-refs-form">
          <PedidoForm code={code} tipo="projeto" member={member} onDone={loadPedidos} />
        </div>
      )}

      <PedidosList list={pedidos} onCancel={cancel} />
      {projects.map((p) => {
        const done = projectProgress(p);
        const total = PROJECT_STAGES.length;
        return (
          <article className="proj" key={p.id}>
            <div className="area-refs-head">
              <div>
                <div className="kick">Meu projeto · Da ideia à abertura</div>
                <h2>{p.nome}</h2>
                {p.proximo && (
                  <p>
                    <strong>Próximo passo:</strong> {p.proximo}
                  </p>
                )}
              </div>
              <div className="proj-progress" aria-label={`${done} de ${total} etapas concluídas`}>
                <span className="proj-progress-n">
                  {done}/{total}
                </span>
                <span className="proj-progress-lbl">etapas concluídas</span>
                <span className="proj-bar" aria-hidden="true">
                  <span style={{ width: `${(done / total) * 100}%` }} />
                </span>
              </div>
            </div>

            <ol className="proj-stages">
              {PROJECT_STAGES.map((s, i) => {
                const e = p.etapas?.[s.id] || {};
                const st = e.status || "pendente";
                return (
                  <li className={`proj-stage st-${st}`} key={s.id}>
                    <span className="proj-n" aria-hidden="true">
                      {st === "concluida" ? "✓" : i + 1}
                    </span>
                    <div className="proj-stage-body">
                      <div className="proj-stage-top">
                        <h3>{s.nome}</h3>
                        <span className="proj-status">{stageStatusLabel(st)}</span>
                      </div>
                      <p className="proj-desc">{s.desc}</p>
                      {e.responsavel && (
                        <p className="proj-resp">
                          Quem cuida: <strong>{e.responsavel}</strong>
                        </p>
                      )}
                      {e.nota && <p className="proj-nota">{e.nota}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
            {p.atualizado && (
              <p className="proj-updated">Atualizado em {fmt(p.atualizado)}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
