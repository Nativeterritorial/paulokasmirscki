"use client";

import { useEffect, useState } from "react";
import {
  GOAL_TERMS,
  GOAL_STATUS,
  MAX_METAS,
  currentMonth,
  goalsDone,
  monthLabel,
} from "../../parcerias/gestao";

const EMPTY_NEW = { empresa: "", cliente: "", memberId: "" };

// nome + WhatsApp (ou data de criação) pra não confundir dois membros de mesmo nome
const memberLabel = (m) =>
  m.whatsapp
    ? `${m.nome} — ${m.whatsapp}`
    : `${m.nome} — sem WhatsApp (criado em ${new Date(m.t).toLocaleDateString("pt-BR")})`;

const waDigits = (v) => {
  const d = String(v || "").replace(/[^0-9]/g, "");
  return d.length >= 10 ? (d.length <= 11 ? "55" + d : d) : "";
};

const tmpId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// Aba "Gestão" do painel: o Paulo acompanha as empresas do modelo "Gestor de
// negócios" — metas e relatório mensal. O cliente vê isso em "Minha gestão".
export default function GestaoAdmin({ code, gestoes, members, onChange }) {
  const [novo, setNovo] = useState(EMPTY_NEW);
  const [open, setOpen] = useState("");
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const g = gestoes.find((x) => x.id === open);
    setDraft(g ? JSON.parse(JSON.stringify(g)) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const call = async (payload) => {
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...payload }),
      });
      const d = await r.json();
      if (Array.isArray(d.gestoes)) onChange(d.gestoes);
      return d;
    } catch (e) {
      return null;
    }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!novo.empresa.trim()) return;
    const antes = new Set(gestoes.map((g) => g.id));
    const d = await call({ action: "gestaoSave", gestao: novo });
    setNovo(EMPTY_NEW);
    const criada = (d?.gestoes || []).find((g) => !antes.has(g.id));
    if (criada) setOpen(criada.id);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    await call({ action: "gestaoSave", gestao: draft });
    setSaving(false);
    setSaved(draft.id);
    setTimeout(() => setSaved(""), 2000);
  };

  const remove = async (g) => {
    if (!window.confirm(`Excluir a gestão de “${g.empresa}”? Ela some também da área do cliente.`))
      return;
    await call({ action: "gestaoDelete", id: g.id });
    if (open === g.id) setOpen("");
  };

  const setField = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const setList = (k, id, field, v) =>
    setDraft((d) => ({
      ...d,
      [k]: (d[k] || []).map((x) => (x.id === id ? { ...x, [field]: v } : x)),
    }));
  const removeFrom = (k, id) =>
    setDraft((d) => ({ ...d, [k]: (d[k] || []).filter((x) => x.id !== id) }));

  const addMeta = () =>
    setDraft((d) => ({
      ...d,
      metas: [...(d.metas || []), { id: tmpId("g"), texto: "", prazo: "curto", status: "pendente" }],
    }));

  // novo relatório já com o mês atual (ou o mês seguinte ao último, se já existir)
  const addRelatorio = () =>
    setDraft((d) => {
      const usados = new Set((d.relatorios || []).map((r) => r.mes));
      let mes = currentMonth();
      while (usados.has(mes)) {
        const [y, m] = mes.split("-").map(Number);
        mes = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
      }
      return {
        ...d,
        relatorios: [{ id: tmpId("r"), mes, feito: "", numeros: "", proximos: "" }, ...(d.relatorios || [])],
      };
    });

  const memberOf = (id) => members.find((m) => m.id === id);

  return (
    <section className="admin-panel admin-signups">
      <h3>
        📊 Gestão — Gestor de negócios
        <span className="lg-tag">{gestoes.length}</span>
      </h3>
      <p className="admin-hint">
        Acompanhe as empresas em que você atua como gestor. Ligue a empresa a um
        membro e ele vê as metas e o relatório de cada mês na área dele.
      </p>

      <form className="member-form" onSubmit={create}>
        <input
          placeholder="Nome da empresa"
          value={novo.empresa}
          onChange={(e) => setNovo((f) => ({ ...f, empresa: e.target.value }))}
        />
        <input
          placeholder="Dono (nome)"
          value={novo.cliente}
          onChange={(e) => setNovo((f) => ({ ...f, cliente: e.target.value }))}
        />
        <select
          className="ref-status-select"
          aria-label="Membro que acompanha a gestão"
          value={novo.memberId}
          onChange={(e) => setNovo((f) => ({ ...f, memberId: e.target.value }))}
        >
          <option value="">Sem membro (só você vê)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {memberLabel(m)}
            </option>
          ))}
        </select>
        <button className="chip chip-add" disabled={!novo.empresa.trim()}>
          + Nova empresa
        </button>
      </form>

      {!gestoes.length ? (
        <p className="admin-empty">
          Nenhuma empresa ainda. Cadastre a primeira quando fechar um cliente do
          modelo “Gestor de negócios”.
        </p>
      ) : (
        <div className="lead-cards proj-cards">
          {gestoes.map((g) => {
            const isOpen = open === g.id && draft;
            const metas = g.metas || [];
            const ultimo = (g.relatorios || [])[0];
            const member = memberOf(g.memberId);
            const wa = waDigits(member?.whatsapp);
            return (
              <div className="lead-card" key={g.id}>
                <div className="lead-card-top">
                  <div>
                    <div className="lead-nm">
                      {g.empresa}
                      {g.cliente && <span className="su-emp"> · {g.cliente}</span>}
                    </div>
                    <div className="lead-ct">
                      {goalsDone(g)}/{metas.length} metas concluídas
                      {" · "}
                      {ultimo ? `último relatório: ${monthLabel(ultimo.mes)}` : "sem relatório ainda"}
                      {g.memberId
                        ? ` · visível para ${member?.nome || "membro removido"}`
                        : " · só você vê"}
                    </div>
                  </div>
                  <div className="lead-actions">
                    {wa && (
                      <a
                        className="firm-conn"
                        href={`https://wa.me/${wa}?text=${encodeURIComponent(
                          `Olá ${member.nome}! Aqui é o Paulo Kasmirscki. O relatório da ${g.empresa} está atualizado na sua área de membros.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Avisar cliente
                      </a>
                    )}
                    <button type="button" className="chip" onClick={() => setOpen(isOpen ? "" : g.id)}>
                      {isOpen ? "Fechar" : "Abrir"}
                    </button>
                    <button type="button" className="chip chip-danger" onClick={() => remove(g)}>
                      Excluir
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="proj-edit">
                    <div className="proj-edit-row proj-edit-head">
                      <label>
                        Empresa
                        <input value={draft.empresa || ""} onChange={(e) => setField("empresa", e.target.value)} />
                      </label>
                      <label>
                        Dono
                        <input value={draft.cliente || ""} onChange={(e) => setField("cliente", e.target.value)} />
                      </label>
                      <label>
                        Membro que acompanha
                        <select value={draft.memberId || ""} onChange={(e) => setField("memberId", e.target.value)}>
                          <option value="">Sem membro (só você vê)</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {memberLabel(m)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="proj-edit-full">
                      Foco do momento (aparece em destaque para o cliente)
                      <input
                        value={draft.foco || ""}
                        onChange={(e) => setField("foco", e.target.value)}
                        placeholder="Ex.: reduzir custos fixos em 10% até dezembro"
                      />
                    </label>

                    <div className="gest-edit-sec">
                      <div className="gest-edit-head">
                        <strong>Metas</strong>
                        <button
                          type="button"
                          className="chip chip-add"
                          onClick={addMeta}
                          disabled={(draft.metas || []).length >= MAX_METAS}
                        >
                          + Meta
                        </button>
                      </div>
                      {!(draft.metas || []).length && (
                        <p className="admin-empty">Nenhuma meta ainda.</p>
                      )}
                      {(draft.metas || []).map((m) => (
                        <div className="gest-edit-meta" key={m.id}>
                          <input
                            value={m.texto}
                            onChange={(e) => setList("metas", m.id, "texto", e.target.value)}
                            placeholder="Ex.: abrir a segunda loja"
                            aria-label="Meta"
                          />
                          <select
                            value={m.prazo}
                            onChange={(e) => setList("metas", m.id, "prazo", e.target.value)}
                            aria-label="Prazo"
                          >
                            {GOAL_TERMS.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={m.status}
                            onChange={(e) => setList("metas", m.id, "status", e.target.value)}
                            aria-label="Situação"
                          >
                            {GOAL_STATUS.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="chip chip-danger"
                            onClick={() => removeFrom("metas", m.id)}
                            aria-label="Remover meta"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="gest-edit-sec">
                      <div className="gest-edit-head">
                        <strong>Relatórios mensais</strong>
                        <button type="button" className="chip chip-add" onClick={addRelatorio}>
                          + Relatório do mês
                        </button>
                      </div>
                      {!(draft.relatorios || []).length && (
                        <p className="admin-empty">
                          Nenhum relatório ainda. O mais recente aparece em
                          destaque para o cliente.
                        </p>
                      )}
                      {(draft.relatorios || []).map((r) => (
                        <div className="gest-edit-rel" key={r.id}>
                          <div className="gest-edit-rel-top">
                            <label>
                              Mês
                              <input
                                type="month"
                                value={r.mes}
                                onChange={(e) => setList("relatorios", r.id, "mes", e.target.value)}
                              />
                            </label>
                            <button
                              type="button"
                              className="chip chip-danger"
                              onClick={() => removeFrom("relatorios", r.id)}
                            >
                              Remover relatório
                            </button>
                          </div>
                          <label>
                            O que foi feito
                            <textarea
                              rows={3}
                              value={r.feito}
                              onChange={(e) => setList("relatorios", r.id, "feito", e.target.value)}
                              placeholder="Reuniões, decisões, negociações, ajustes na operação…"
                            />
                          </label>
                          <label>
                            Números do mês
                            <textarea
                              rows={2}
                              value={r.numeros}
                              onChange={(e) => setList("relatorios", r.id, "numeros", e.target.value)}
                              placeholder="Faturamento, custos, margem, caixa…"
                            />
                          </label>
                          <label>
                            Próximos passos
                            <textarea
                              rows={2}
                              value={r.proximos}
                              onChange={(e) => setList("relatorios", r.id, "proximos", e.target.value)}
                              placeholder="O que fica combinado para o próximo mês"
                            />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="proj-edit-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={save}
                        disabled={saving || !String(draft.empresa || "").trim()}
                      >
                        {saving ? "Salvando..." : saved === g.id ? "✓ Salvo" : "Salvar"}
                      </button>
                    </div>
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
