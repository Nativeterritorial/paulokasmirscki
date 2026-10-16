"use client";

import { useCallback, useEffect, useState } from "react";
import ReferralForm from "../parcerias/referral-form";
import {
  REFERRAL_STATUS,
  statusInfo,
  protocolo,
} from "../parcerias/referral-status";

// etapas do processo (sem o desfecho "encerrada"), pra desenhar a linha de progresso
const STEPS = REFERRAL_STATUS.filter((s) => s.id !== "encerrada");

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

// "Minhas indicações": o membro vê o andamento de cada negócio que indicou e
// registra novas indicações sem sair da Área de Membros.
export default function MyReferrals({ code, member }) {
  const [list, setList] = useState(null); // null = carregando
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!member) return;
    try {
      const r = await fetch("/api/my-referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const d = await r.json();
      if (d.ok) {
        setList(d.referrals || []);
        setFailed(false);
      } else setFailed(true);
    } catch (e) {
      setFailed(true);
    }
  }, [code, member]);

  useEffect(() => {
    load();
  }, [load]);

  const [delErr, setDelErr] = useState("");
  const remove = async (r) => {
    setDelErr("");
    if (!window.confirm(`Excluir a indicação de ${r.indicado}?`)) return;
    try {
      const res = await fetch("/api/my-referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "delete", t: r.t }),
      });
      const d = await res.json();
      if (d.ok) setList(d.referrals || []);
      else {
        setDelErr(d.error || "Não consegui excluir. Tente novamente.");
        load();
      }
    } catch (e) {
      setDelErr("Não consegui excluir. Tente novamente.");
    }
  };

  return (
    <section className="area-refs area-projects svc svc-ind" id="indicacoes">
      <div className="area-refs-head">
        <div className="svc-ic" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 10v10h14V10" />
            <path d="M12 12v6" />
            <path d="M9 15h6" />
          </svg>
        </div>
        <div className="svc-txt">
          <div className="kick">Minhas indicações</div>
          <h2>
            {member
              ? "Acompanhe os negócios que você indicou"
              : "Indique um negócio imobiliário"}
          </h2>
          <p>
            Conhece alguém que quer comprar, vender ou alugar um imóvel? Você
            indica, o Paulo conduz o negócio e você recebe uma bonificação
            sobre a comissão quando ele fecha.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Fechar" : "+ Nova indicação"}
        </button>
      </div>

      {open && (
        <div className="area-refs-form">
          <ReferralForm member={member} code={member ? code : ""} onDone={load} />
        </div>
      )}

      {member && failed && (
        <p className="area-refs-empty">
          Não consegui carregar as suas indicações agora.{" "}
          <button type="button" className="area-refs-retry" onClick={load}>
            Tentar de novo
          </button>
        </p>
      )}
      {member && !failed && list === null && (
        <p className="area-refs-empty">Carregando…</p>
      )}
      {member && !failed && list && !list.length && (
        <p className="area-refs-empty">
          Você ainda não indicou nenhum negócio. Conhece alguém que quer
          comprar, vender ou alugar um imóvel? Toque em “Nova indicação”.
        </p>
      )}

      {delErr && <p className="area-refs-empty">{delErr}</p>}

      {!failed && list && list.length > 0 && (
        <div className="ref-list">
          {list.map((r) => {
            const st = statusInfo(r.status);
            const closed = st.id === "encerrada";
            const pos = STEPS.findIndex((s) => s.id === st.id);
            return (
              <article className={`ref-item${closed ? " closed" : ""}`} key={r.t}>
                <div className="ref-item-top">
                  <div>
                    <div className="ref-nm">
                      {r.indicado}
                      {r.tipo && <span className="ref-tipo"> · {r.tipo}</span>}
                    </div>
                    <div className="ref-meta-line">
                      {protocolo(r.t)} · registrada em {fmt(r.t)}
                    </div>
                  </div>
                  <span className={`ref-badge s-${st.id}`}>{st.label}</span>
                </div>
                {!closed && (
                  <ol className="ref-steps" aria-label={`Andamento: ${st.label}`}>
                    {STEPS.map((s, i) => (
                      <li
                        key={s.id}
                        className={i < pos ? "done" : i === pos ? "now" : ""}
                      >
                        <span className="dot" aria-hidden="true" />
                        <span className="lbl">{s.label}</span>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="ref-desc">{st.desc}</p>
                {st.id === "registrada" && (
                  <button
                    type="button"
                    className="ref-del"
                    onClick={() => remove(r)}
                  >
                    Excluir indicação
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
