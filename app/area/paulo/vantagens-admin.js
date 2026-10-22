"use client";

import { useState } from "react";
import { VANTAGEM_CATEGORIAS } from "../vantagens-defs";

const VAZIA = { empresaId: "", empresa: "", titulo: "", descricao: "", como: "", categoria: "Outros", validade: "", status: "ativo" };
const STATUS_TXT = { analise: "⏳ Para aprovar", ativo: "🟢 No ar", pausado: "⏸ Pausada" };

// Aba "Vantagens" do painel: cadastrar as vantagens das empresas, aprovar as
// propostas dos membros, pausar e excluir.
export default function VantagensAdmin({ code, vantagens = [], companies = [], onData }) {
  const [f, setF] = useState(null); // null = formulário fechado
  const [filtro, setFiltro] = useState("todas");

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

  const salvar = async (e) => {
    e.preventDefault();
    if (!f.empresa.trim() || !f.titulo.trim()) return;
    await call({ action: "vantagemSave", vantagem: f });
    setF(null);
  };

  const escolherEmpresa = (id) => {
    const c = companies.find((x) => x.id === id);
    setF((s) => ({ ...s, empresaId: id, empresa: c ? c.nome : s.empresa }));
  };

  const analise = vantagens.filter((v) => v.status === "analise");
  const lista = vantagens.filter((v) => filtro === "todas" || v.status === filtro);
  const usos = vantagens.reduce((n, v) => n + (v.usos || 0), 0);

  return (
    <section className="admin-panel admin-signups pd-admin">
      <h3>
        🎁 Clube de Vantagens
        <span className="lg-tag">{vantagens.filter((v) => v.status === "ativo").length} no ar</span>
        <span className="lg-tag">{usos} uso(s)</span>
      </h3>
      <p className="admin-hint">
        Descontos e condições especiais das empresas da rede, só para membros. Você cadastra direto (entra no ar na
        hora) e aprova as que os membros oferecem. “Usos” conta quantas vezes alguém clicou em “Quero usar”.
      </p>

      <div className="admin-periods" style={{ marginBottom: 12 }}>
        {[
          ["todas", "Todas"],
          ["analise", `Para aprovar (${analise.length})`],
          ["ativo", "No ar"],
          ["pausado", "Pausadas"],
        ].map(([id, lbl]) => (
          <button key={id} type="button" className={`chip${filtro === id ? " chip-on" : ""}`} onClick={() => setFiltro(id)}>
            {lbl}
          </button>
        ))}
        <button type="button" className="chip chip-add" onClick={() => setF(f ? null : { ...VAZIA })}>
          {f ? "Fechar" : "+ Nova vantagem"}
        </button>
      </div>

      {f && (
        <form className="van-form van-form-admin" onSubmit={salvar}>
          <div className="van-grid">
            <label>
              Empresa da rede
              <select value={f.empresaId} onChange={(e) => escolherEmpresa(e.target.value)}>
                <option value="">— escolher (opcional) —</option>
                {[...companies].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nome que aparece *
              <input value={f.empresa} onChange={(e) => setF({ ...f, empresa: e.target.value })} />
            </label>
            <label>
              A vantagem *
              <input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Ex.: 10% OFF" />
            </label>
            <label>
              Categoria
              <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
                {VANTAGEM_CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="van-larga">
              Detalhes
              <textarea rows={2} value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} />
            </label>
            <label className="van-larga">
              Como o membro usa
              <input value={f.como} onChange={(e) => setF({ ...f, como: e.target.value })} />
            </label>
            <label>
              Validade
              <input value={f.validade} onChange={(e) => setF({ ...f, validade: e.target.value })} />
            </label>
            <label>
              Situação
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                <option value="ativo">No ar</option>
                <option value="pausado">Pausada</option>
                <option value="analise">Para aprovar</option>
              </select>
            </label>
          </div>
          <button className="chip chip-add" disabled={!f.empresa.trim() || !f.titulo.trim()}>
            Salvar vantagem
          </button>
        </form>
      )}

      {!lista.length ? (
        <p className="admin-empty">Nenhuma vantagem aqui ainda.</p>
      ) : (
        lista.map((v) => (
          <div className="lead-card" key={v.id}>
            <div className="lead-card-top">
              <div>
                <div className="lead-nm">
                  <strong>{v.titulo}</strong> · {v.empresa}
                </div>
                <div className="lead-ct">
                  {STATUS_TXT[v.status]} · {v.categoria}
                  {v.validade ? ` · ${v.validade}` : ""} · {v.usos || 0} uso(s)
                  {v.autor ? ` · proposta por ${v.autor.nome}${v.autor.whatsapp ? ` (${v.autor.whatsapp})` : ""}` : ""}
                </div>
                {v.descricao && <div className="lead-ct">{v.descricao}</div>}
                {v.como && <div className="lead-ct">Como usar: {v.como}</div>}
              </div>
              <div className="lead-actions">
                {v.status !== "ativo" && (
                  <button type="button" className="chip chip-add" onClick={() => call({ action: "vantagemStatus", id: v.id, status: "ativo" })}>
                    {v.status === "analise" ? "Aprovar" : "Pôr no ar"}
                  </button>
                )}
                {v.status === "ativo" && (
                  <button type="button" className="chip" onClick={() => call({ action: "vantagemStatus", id: v.id, status: "pausado" })}>
                    Pausar
                  </button>
                )}
                <button type="button" className="chip" onClick={() => setF({ ...VAZIA, ...v })}>
                  Editar
                </button>
                <button
                  type="button"
                  className="chip"
                  onClick={() => window.confirm(`Excluir a vantagem "${v.titulo}" de ${v.empresa}?`) && call({ action: "vantagemDelete", id: v.id })}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}
