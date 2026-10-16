"use client";

import { useEffect, useState } from "react";
import { usePedidos, PedidosList, PedidoForm } from "./pedidos";
import {
  stageStatusLabel,
  projectProgress,
  stagesOf,
  stageNum,
  trilhaOf,
  TRILHAS,
} from "../parcerias/project-stages";
import { useAbrir } from "./abrir";

// textos de cada trilha (a seção de obra usa este mesmo componente)
const CONF = {
  abertura: {
    id: "projeto",
    cls: "svc-proj",
    tipo: "projeto",
    kick: "Meu projeto · Da ideia à abertura",
    h2: "Tem a ideia de um negócio?",
    p: "O Paulo ajuda a tirar a sua ideia do papel e reúne os parceiros certos para cada etapa. Você foca no seu sonho, e ele cuida do caminho até a inauguração.",
    btn: "+ Novo projeto",
    icon: [
      "M12 3c3 2 5 5.5 5 9.5L15 16H9l-2-3.5C7 8.5 9 5 12 3z",
      "M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
      "M9 16l-2 4 4-1.5M15 16l2 4-4-1.5",
    ],
  },
  obra: {
    id: "obra",
    cls: "svc-obra",
    tipo: "obra",
    kick: "Do Terreno às Chaves",
    h2: "Vai construir?",
    p: "Casa, pavilhão ou comercial: do terreno à entrega das chaves, o Paulo conduz as 11 fases da obra com os parceiros certos da rede. Um único ponto de confiança, do começo ao fim.",
    btn: "+ Iniciar minha obra",
    icon: ["M3 21h18", "M5 21V9l7-5 7 5v12", "M9 21v-6h6v6", "M12 4V2"],
  },
};

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

// "Meu projeto": o cliente do modelo "Da ideia à abertura" acompanha as seis
// etapas — o que já foi feito, quem cuida de cada uma e o próximo passo.
// Sempre aparece: com "+ Novo projeto" o membro manda a ideia pro Paulo.
export default function MyProjects({ code, member, trilha = "abertura" }) {
  const C = CONF[trilha];
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
        setProjects((d.projects || []).filter((p) => trilhaOf(p) === trilha));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, member, trilha]);

  const { list: pedidos, load: loadPedidos, cancel, apply } = usePedidos(code, member, C.tipo);
  const [open, setOpen] = useState(false);
  // o concierge pode abrir este formulário ("Iniciar meu projeto")
  useAbrir(C.tipo, C.id, () => setOpen(true));

  return (
    <section className={`area-refs area-projects svc ${C.cls}`} id={C.id}>
      <div className="area-refs-head">
        <div className="svc-ic" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {C.icon.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </div>
        <div className="svc-txt">
          <div className="kick">{C.kick}</div>
          <h2>{C.h2}</h2>
          <p>{C.p}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen((o) => !o)}>
          {open ? "Fechar" : C.btn}
        </button>
      </div>

      {open && (
        <div className="area-refs-form">
          <PedidoForm code={code} tipo={C.tipo} member={member} onDone={loadPedidos} />
        </div>
      )}

      <PedidosList list={pedidos} onCancel={cancel} code={code} apply={apply} />
      {projects.map((p) => {
        const done = projectProgress(p);
        const stages = stagesOf(p);
        const total = stages.length;
        return (
          <article className="proj" key={p.id}>
            <div className="area-refs-head">
              <div>
                <div className="kick">Meu projeto · {TRILHAS[trilhaOf(p)].nome}</div>
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
              {stages.map((s, i) => {
                const e = p.etapas?.[s.id] || {};
                const st = e.status || "pendente";
                return (
                  <li className={`proj-stage st-${st}`} key={s.id}>
                    <span className="proj-n" aria-hidden="true">
                      {st === "concluida" ? "✓" : stageNum(s, i)}
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
