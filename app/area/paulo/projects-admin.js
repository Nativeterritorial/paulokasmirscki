"use client";

import { useEffect, useState } from "react";
import {
  PROJECT_STAGES,
  STAGE_STATUS,
  projectProgress,
} from "../../parcerias/project-stages";

const EMPTY_NEW = { nome: "", cliente: "", memberId: "" };

const waDigits = (v) => {
  const d = String(v || "").replace(/[^0-9]/g, "");
  return d.length >= 10 ? (d.length <= 11 ? "55" + d : d) : "";
};

// Aba "Projetos" do painel: o Paulo cria e atualiza os projetos do modelo
// "Da ideia à abertura". O que ele salva aqui é o que o cliente vê na Área de
// Membros (quando o projeto está ligado a um membro).
export default function ProjectsAdmin({ code, projects, members, companies, onChange }) {
  const [novo, setNovo] = useState(EMPTY_NEW);
  const [open, setOpen] = useState("");
  const [draft, setDraft] = useState(null); // cópia editável do projeto aberto
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");

  // ao abrir um projeto, edita uma cópia; só vai pro servidor no "Salvar"
  useEffect(() => {
    const p = projects.find((x) => x.id === open);
    setDraft(p ? JSON.parse(JSON.stringify(p)) : null);
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
      if (Array.isArray(d.projects)) onChange(d.projects);
      return d;
    } catch (e) {
      return null;
    }
  };

  const create = async (e) => {
    e.preventDefault();
    if (!novo.nome.trim()) return;
    const antes = new Set(projects.map((p) => p.id));
    const d = await call({ action: "projectSave", project: novo });
    setNovo(EMPTY_NEW);
    const criado = (d?.projects || []).find((p) => !antes.has(p.id));
    if (criado) setOpen(criado.id);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    await call({ action: "projectSave", project: draft });
    setSaving(false);
    setSaved(draft.id);
    setTimeout(() => setSaved(""), 2000);
  };

  const remove = async (p) => {
    if (!window.confirm(`Excluir o projeto “${p.nome}”? Ele some também da área do cliente.`))
      return;
    await call({ action: "projectDelete", id: p.id });
    if (open === p.id) setOpen("");
  };

  const setStage = (stageId, key, value) =>
    setDraft((d) => ({
      ...d,
      etapas: {
        ...(d.etapas || {}),
        [stageId]: { ...(d.etapas?.[stageId] || {}), [key]: value },
      },
    }));

  const memberName = (id) => members.find((m) => m.id === id)?.nome || "";

  return (
    <section className="admin-panel admin-signups">
      <h3>
        🚀 Projetos — Da ideia à abertura
        <span className="lg-tag">{projects.length}</span>
      </h3>
      <p className="admin-hint">
        Acompanhe cada negócio que você está ajudando a abrir. Ligue o projeto a
        um membro e ele vê as seis etapas na área dele, com o que você salvar
        aqui.
      </p>

      <form className="member-form" onSubmit={create}>
        <input
          placeholder="Nome do negócio"
          value={novo.nome}
          onChange={(e) => setNovo((f) => ({ ...f, nome: e.target.value }))}
        />
        <input
          placeholder="Cliente (nome)"
          value={novo.cliente}
          onChange={(e) => setNovo((f) => ({ ...f, cliente: e.target.value }))}
        />
        <select
          className="ref-status-select"
          aria-label="Membro que acompanha o projeto"
          value={novo.memberId}
          onChange={(e) => setNovo((f) => ({ ...f, memberId: e.target.value }))}
        >
          <option value="">Sem membro (só você vê)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        <button className="chip chip-add" disabled={!novo.nome.trim()}>
          + Novo projeto
        </button>
      </form>

      {!projects.length ? (
        <p className="admin-empty">
          Nenhum projeto ainda. Crie o primeiro quando fechar um cliente do
          modelo “Da ideia à abertura”.
        </p>
      ) : (
        <div className="lead-cards proj-cards">
          {projects.map((p) => {
            const isOpen = open === p.id && draft;
            const done = projectProgress(p);
            const member = members.find((m) => m.id === p.memberId);
            const wa = waDigits(member?.whatsapp);
            return (
              <div className="lead-card" key={p.id}>
                <div className="lead-card-top">
                  <div>
                    <div className="lead-nm">
                      {p.nome}
                      {p.cliente && <span className="su-emp"> · {p.cliente}</span>}
                    </div>
                    <div className="lead-ct">
                      {done}/{PROJECT_STAGES.length} etapas concluídas
                      {p.memberId
                        ? ` · visível para ${memberName(p.memberId) || "membro removido"}`
                        : " · só você vê"}
                    </div>
                  </div>
                  <div className="lead-actions">
                    {wa && (
                      <a
                        className="firm-conn"
                        href={`https://wa.me/${wa}?text=${encodeURIComponent(
                          `Olá ${member.nome}! Aqui é o Paulo Kasmirscki. Atualizei o andamento do projeto ${p.nome}. Você acompanha as etapas na área de membros.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Avisar cliente
                      </a>
                    )}
                    <button
                      type="button"
                      className="chip"
                      onClick={() => setOpen(isOpen ? "" : p.id)}
                    >
                      {isOpen ? "Fechar" : "Abrir etapas"}
                    </button>
                    <button
                      type="button"
                      className="chip chip-danger"
                      onClick={() => remove(p)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="proj-edit">
                    <div className="proj-edit-row proj-edit-head">
                      <label>
                        Nome do negócio
                        <input
                          value={draft.nome || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, nome: e.target.value }))}
                        />
                      </label>
                      <label>
                        Cliente
                        <input
                          value={draft.cliente || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, cliente: e.target.value }))}
                        />
                      </label>
                      <label>
                        Membro que acompanha
                        <select
                          value={draft.memberId || ""}
                          onChange={(e) => setDraft((d) => ({ ...d, memberId: e.target.value }))}
                        >
                          <option value="">Sem membro (só você vê)</option>
                          {members.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.nome}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="proj-edit-full">
                      Próximo passo (aparece em destaque para o cliente)
                      <input
                        value={draft.proximo || ""}
                        onChange={(e) => setDraft((d) => ({ ...d, proximo: e.target.value }))}
                        placeholder="Ex.: assinar o contrato de locação até sexta"
                      />
                    </label>

                    {PROJECT_STAGES.map((s, i) => {
                      const e = draft.etapas?.[s.id] || {};
                      return (
                        <div className="proj-edit-row" key={s.id}>
                          <div className="proj-edit-name">
                            <span className="js-n">{i + 1}</span>
                            {s.nome}
                          </div>
                          <label>
                            Situação
                            <select
                              value={e.status || "pendente"}
                              onChange={(ev) => setStage(s.id, "status", ev.target.value)}
                            >
                              {STAGE_STATUS.map((o) => (
                                <option key={o.id} value={o.id}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Quem cuida
                            <input
                              list="proj-empresas"
                              value={e.responsavel || ""}
                              onChange={(ev) => setStage(s.id, "responsavel", ev.target.value)}
                              placeholder="Empresa ou pessoa"
                            />
                          </label>
                          <label className="proj-edit-note">
                            Observação para o cliente
                            <input
                              value={e.nota || ""}
                              onChange={(ev) => setStage(s.id, "nota", ev.target.value)}
                              placeholder="O que foi feito ou o que falta"
                            />
                          </label>
                        </div>
                      );
                    })}
                    <datalist id="proj-empresas">
                      {companies.map((c) => (
                        <option key={c.id} value={c.nome} />
                      ))}
                    </datalist>

                    <div className="proj-edit-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={save}
                        disabled={saving || !String(draft.nome || "").trim()}
                      >
                        {saving ? "Salvando..." : saved === p.id ? "✓ Salvo" : "Salvar projeto"}
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
