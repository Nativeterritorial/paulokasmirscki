"use client";

import { useState } from "react";
import { PEDIDO_STATUS } from "../../parcerias/pedidos";

const fmt = (t) =>
  new Date(t).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const waDigits = (v) => {
  const d = String(v || "").replace(/[^0-9]/g, "");
  return d.length >= 10 ? (d.length <= 11 ? "55" + d : d) : "";
};

const ROTULOS = {
  projeto: {
    titulo: "💡 Pedidos de novo projeto",
    vazio: "Nenhum pedido ainda. Eles chegam pelo botão “+ Novo projeto” da área de membros.",
    local: "Cidade",
    fase: "Ponto em que está",
    criar: "Criar projeto",
    msg: (p) => `Olá ${p.nome}! Aqui é o Paulo Kasmirscki. Recebi a sua ideia de ${p.titulo} pela área de membros. Vamos conversar?`,
  },
  imovel: {
    titulo: "🏠 Imóveis para vender",
    vazio: "Nenhum imóvel ainda. Eles chegam pelo botão “+ Cadastrar imóvel” da área de membros.",
    local: "Cidade",
    fase: "Situação",
    criar: "Preparar anúncio",
    msg: (p) => `Olá ${p.nome}! Aqui é o Paulo Kasmirscki. Recebi o cadastro do imóvel (${p.titulo}${p.bairro ? " no " + p.bairro : ""}) pela área de membros. Vamos conversar?`,
  },
  gestao: {
    titulo: "📨 Pedidos de gestão",
    vazio: "Nenhum pedido ainda. Eles chegam pelo botão “+ Nova gestão” da área de membros.",
    local: "Segmento",
    fase: "Tempo de empresa",
    criar: "Criar gestão",
    msg: (p) => `Olá ${p.nome}! Aqui é o Paulo Kasmirscki. Recebi o seu pedido de gestão para ${p.titulo}. Vamos conversar?`,
  },
};

// Pedidos de "+ Novo projeto" / "+ Nova gestão" feitos pelos membros. Fica no
// alto das abas Projetos e Gestão. "Criar" já monta o projeto/gestão ligado ao
// membro e marca o pedido como aprovado. Pedido feito pelo código geral fica sem
// membro: crie o acesso dele em Membros (mesmo WhatsApp) para ele acompanhar.
export default function PedidosAdmin({ code, tipo, pedidos, onData, onImovel }) {
  const R = ROTULOS[tipo];
  const [verTodos, setVerTodos] = useState(false);
  const [busy, setBusy] = useState("");

  const call = async (payload) => {
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, ...payload }),
      });
      const d = await r.json();
      onData(d);
      return d;
    } catch (e) {
      return null;
    }
  };

  const criar = async (p) => {
    if (busy) return;
    setBusy(p.id);
    // imóvel: cria um rascunho na vitrine (o servidor já marca o cadastro como aprovado)
    if (tipo === "imovel") {
      const d = await call({ action: "imovelFromPedido", id: p.id });
      setBusy("");
      if (d?.novoImovel && onImovel) onImovel(d.novoImovel);
      return;
    }
    if (tipo === "projeto") {
      await call({
        action: "projectSave",
        project: { nome: p.titulo, cliente: p.nome, memberId: p.memberId },
      });
    } else {
      await call({
        action: "gestaoSave",
        gestao: { empresa: p.titulo, cliente: p.nome, memberId: p.memberId },
      });
    }
    await call({ action: "pedidoStatus", id: p.id, status: "aceito" });
    setBusy("");
  };

  const excluir = async (p) => {
    if (!window.confirm(`Excluir o pedido “${p.titulo}”? Ele some também da área do membro.`)) return;
    await call({ action: "pedidoDelete", id: p.id });
  };

  const doTipo = pedidos.filter((p) => p.tipo === tipo);
  const abertos = doTipo.filter((p) => p.status === "novo" || p.status === "conversa");
  const lista = verTodos ? doTipo : abertos;
  const novos = doTipo.filter((p) => p.status === "novo").length;

  return (
    <section className="admin-panel admin-signups pd-admin">
      <h3>
        {R.titulo}
        {novos > 0 && <span className="lg-tag">{novos} novo(s)</span>}
      </h3>
      {doTipo.length > abertos.length && (
        <button type="button" className="chip" onClick={() => setVerTodos((v) => !v)}>
          {verTodos ? "Ver só os em aberto" : `Ver todos (${doTipo.length})`}
        </button>
      )}

      {!lista.length ? (
        <p className="admin-empty">
          {doTipo.length ? "Nenhum pedido em aberto." : R.vazio}
        </p>
      ) : (
        <div className="lead-cards">
          {lista.map((p) => {
            const wa = waDigits(p.whatsapp);
            return (
              <div className={`lead-card${p.status === "novo" ? " is-new" : ""}`} key={p.id}>
                <div className="lead-card-top">
                  <div>
                    <div className="lead-nm">
                      {p.titulo}
                      <span className="su-emp"> · {p.nome}</span>
                    </div>
                    <div className="lead-ct">
                      {fmt(p.t)}
                      {p.whatsapp ? ` · ${p.whatsapp}` : " · sem WhatsApp no cadastro"}
                      {!p.memberId && " · pelo código geral (sem link pessoal)"}
                    </div>
                  </div>
                  <select
                    className="ref-status-select"
                    aria-label="Situação do pedido"
                    value={p.status}
                    onChange={(e) => call({ action: "pedidoStatus", id: p.id, status: e.target.value })}
                  >
                    {PEDIDO_STATUS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                {(p.local || p.fase || p.bairro || p.valor) && (
                  <div className="pd-facts">
                    {p.origem === "parceiro" && (
                      <span>
                        <strong>Parceiro</strong>
                        {p.creci ? ` · ${p.creci}` : " · sem CRECI informado"}
                      </span>
                    )}
                    {p.endereco && (
                      <span>
                        Endereço: <strong>{p.endereco}</strong>
                      </span>
                    )}
                    {p.bairro && (
                      <span>
                        Bairro: <strong>{p.bairro}</strong>
                      </span>
                    )}
                    {p.local && (
                      <span>
                        {R.local}: <strong>{p.local}</strong>
                      </span>
                    )}
                    {p.fase && (
                      <span>
                        {R.fase}: <strong>{p.fase}</strong>
                      </span>
                    )}
                    {p.valor && (
                      <span>
                        Valor pedido: <strong>{p.valor}</strong>
                        {p.valorVisivel === false && " (anúncio: sob consulta)"}
                      </span>
                    )}
                    {p.metragem && (
                      <span>
                        Área: <strong>{p.metragem} m²</strong>
                      </span>
                    )}
                    {p.quartos && (
                      <span>
                        Quartos: <strong>{p.quartos}</strong>
                      </span>
                    )}
                  </div>
                )}
                <p className="lead-msg">{p.descricao}</p>
                {p.fotos?.length > 0 && (
                  <div className="pd-fotos-grid pd-fotos-admin">
                    {p.fotos.map((f) => (
                      <a key={f} href={`/api/foto/${f}`} target="_blank" rel="noopener noreferrer">
                        <img src={`/api/foto/${f}`} alt="Foto do imóvel" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
                {p.areas?.length > 0 && (
                  <div className="pd-tags">
                    {p.areas.map((a) => (
                      <span className="lg-tag" key={a}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                <div className="lead-actions pd-actions">
                  {wa && (
                    <a
                      className="firm-conn"
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(R.msg(p))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  )}
                  {R.criar && p.status !== "aceito" && (
                    <button
                      type="button"
                      className="chip chip-add"
                      disabled={busy === p.id}
                      onClick={() => criar(p)}
                    >
                      {busy === p.id ? "Criando..." : R.criar}
                    </button>
                  )}
                  <button type="button" className="chip chip-danger" onClick={() => excluir(p)}>
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
