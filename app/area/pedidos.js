"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FASES_PROJETO,
  TEMPO_EMPRESA,
  AREAS_GESTAO,
  pedidoStatus,
} from "../parcerias/pedidos";

const fmt = (t) =>
  new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const post = async (code, extra) => {
  const r = await fetch("/api/my-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, ...extra }),
  });
  return r.json();
};

// Lista de pedidos do membro de um tipo. Compartilhada entre Meu projeto e
// Minha gestão; o pai controla o formulário.
export function usePedidos(code, member, tipo) {
  const [list, setList] = useState([]);
  const load = useCallback(async () => {
    if (!member) return;
    try {
      const d = await post(code, {});
      if (d.ok) setList((d.pedidos || []).filter((p) => p.tipo === tipo));
    } catch (e) {}
  }, [code, member, tipo]);
  useEffect(() => {
    load();
  }, [load]);
  const cancel = async (p) => {
    if (!window.confirm(`Cancelar o pedido “${p.titulo}”?`)) return;
    try {
      const d = await post(code, { action: "cancel", id: p.id });
      if (d.ok) setList((d.pedidos || []).filter((x) => x.tipo === tipo));
    } catch (e) {}
  };
  return { list, load, cancel };
}

export function PedidosList({ list, onCancel }) {
  if (!list.length) return null;
  return (
    <div className="ref-list">
      {list.map((p) => {
        const st = pedidoStatus(p.status);
        return (
          <article className={`ref-item${st.id === "encerrado" ? " closed" : ""}`} key={p.id}>
            <div className="ref-item-top">
              <div>
                <div className="ref-nm">{p.titulo}</div>
                <div className="ref-meta-line">Pedido enviado em {fmt(p.t)}</div>
              </div>
              <span className={`ref-badge pd-${st.id}`}>{st.label}</span>
            </div>
            <p className="ref-desc">{st.desc}</p>
            {st.id === "novo" && (
              <button type="button" className="ref-del" onClick={() => onCancel(p)}>
                Cancelar pedido
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}

const TEXTOS = {
  projeto: {
    titulo: ["Qual é a ideia de negócio? *", "Ex.: cafeteria, loja de roupas, oficina"],
    local: ["Cidade onde quer abrir", "Ex.: Veranópolis"],
    fase: ["Em que ponto você está", FASES_PROJETO],
    descricao: ["Conte a sua ideia *", "O que pretende oferecer, para quem, e o que já tem pronto"],
    enviar: "Enviar minha ideia",
    ok: "Ideia enviada!",
  },
  gestao: {
    titulo: ["Nome da empresa *", "Ex.: Mercado Bom Preço"],
    local: ["Segmento", "Ex.: supermercado, indústria, serviços"],
    fase: ["Há quanto tempo a empresa existe", TEMPO_EMPRESA],
    descricao: ["Qual é o maior desafio hoje? *", "Ex.: o caixa aperta todo mês, quero abrir filial, falta organização"],
    enviar: "Solicitar gestão",
    ok: "Pedido enviado!",
  },
};

// Formulário de "+ Novo projeto" / "+ Nova gestão"
export function PedidoForm({ code, tipo, onDone }) {
  const T = TEXTOS[tipo];
  const [f, setF] = useState({ titulo: "", local: "", fase: "", descricao: "", areas: [] });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const toggleArea = (a) =>
    setF((s) => ({
      ...s,
      areas: s.areas.includes(a) ? s.areas.filter((x) => x !== a) : [...s.areas, a],
    }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!f.titulo.trim() || !f.descricao.trim()) {
      setErr("Preencha os campos com *.");
      return;
    }
    setSending(true);
    try {
      const d = await post(code, { action: "create", pedido: { ...f, tipo } });
      if (d.ok) {
        setDone(true);
        if (onDone) onDone();
      } else setErr(d.error || "Não consegui enviar. Tente novamente.");
    } catch (e2) {
      setErr("Não consegui enviar. Tente novamente.");
    }
    setSending(false);
  };

  if (done) {
    return (
      <div className="signup-done">
        <div className="signup-done-ic" aria-hidden="true">
          ✓
        </div>
        <h3>{T.ok}</h3>
        <p>O Paulo recebeu o seu pedido e vai falar com você pelo WhatsApp.</p>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={submit}>
      <div className="signup-row">
        <label>
          {T.titulo[0]}
          <input value={f.titulo} onChange={upd("titulo")} placeholder={T.titulo[1]} />
        </label>
        <label>
          {T.local[0]}
          <input value={f.local} onChange={upd("local")} placeholder={T.local[1]} />
        </label>
      </div>
      <label>
        {T.fase[0]}
        <select value={f.fase} onChange={upd("fase")}>
          <option value="">Selecione</option>
          {T.fase[1].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
      <label>
        {T.descricao[0]}
        <textarea value={f.descricao} onChange={upd("descricao")} rows={4} placeholder={T.descricao[1]} />
      </label>
      {tipo === "gestao" && (
        <fieldset className="pd-areas">
          <legend>Onde você quer ajuda</legend>
          {AREAS_GESTAO.map((a) => (
            <label className="ref-check" key={a}>
              <input type="checkbox" checked={f.areas.includes(a)} onChange={() => toggleArea(a)} />
              <span>{a}</span>
            </label>
          ))}
        </fieldset>
      )}
      {err && <p className="signup-err">{err}</p>}
      <button className="btn btn-primary join-cta" disabled={sending}>
        {sending ? "Enviando..." : T.enviar}
      </button>
    </form>
  );
}
