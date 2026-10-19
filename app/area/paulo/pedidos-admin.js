"use client";

import { useState } from "react";
import { PEDIDO_STATUS, statusLabel, naoLidas, MAX_MSG } from "../../parcerias/pedidos";

const fmtMsg = (t) =>
  new Date(t).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

// telefone só com dígitos, sem o 55 do Brasil (pra comparar cadastros)
const phoneKey = (v) => {
  const d = String(v || "").replace(/\D/g, "");
  return d.length > 11 && d.startsWith("55") ? d.slice(2) : d;
};

const RESPOSTAS_PRONTAS = [
  "Recebi o seu pedido! Vou analisar e te retorno por aqui.",
  "Vou te chamar no WhatsApp para combinarmos os detalhes.",
  "Apresentação feita! Já passei o seu contato para a empresa.",
];

// conversa com o cliente, dentro do cartão do pedido
function ConversaAdmin({ p, call, dono }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [criando, setCriando] = useState(false);
  const enviar = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    await call({ action: "pedidoMsg", id: p.id, texto });
    setTexto("");
    setEnviando(false);
  };
  // cria o acesso pessoal do cliente (o mesmo WhatsApp passa a ver o pedido)
  const criarAcesso = async () => {
    setCriando(true);
    await call({ action: "memberSave", member: { nome: p.nome, whatsapp: p.whatsapp } });
    setCriando(false);
  };
  const wa = phoneKey(p.whatsapp);
  const linkMsg =
    dono &&
    `Olá ${dono.nome}! Aqui é o Paulo Kasmirscki. Respondi a sua solicitação na área de membros. Entre pelo seu link pessoal e veja em "Solicitações": ${dono.link}`;
  return (
    <div className="pd-chat">
      {!(p.mensagens || []).length && (
        <p className="pd-chat-empty">Nenhuma mensagem ainda.</p>
      )}
      {(p.mensagens || []).map((m, i) => (
        <div className={`pd-msg de-${m.de}`} key={i}>
          <div className="pd-msg-txt">{m.texto}</div>
          <div className="pd-msg-meta">
            {m.de === "paulo" ? "Você" : m.de === "cliente" ? p.nome : "Aviso"} · {fmtMsg(m.t)}
          </div>
        </div>
      ))}

      <div className="pd-chat-who">
        {dono ? (
          <>
            {dono.nome} vê a resposta em <strong>Solicitações</strong>, na área de membros.
            {dono.link && wa.length >= 10 && (
              <a
                href={`https://wa.me/55${wa}?text=${encodeURIComponent(linkMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Avisar no WhatsApp com o link
              </a>
            )}
          </>
        ) : wa.length >= 10 ? (
          <>
            {p.nome} ainda não tem link pessoal: a resposta fica guardada e aparece
            assim que o acesso for criado e usado.
            <button type="button" className="chip chip-add" onClick={criarAcesso} disabled={criando}>
              {criando ? "Criando..." : "Criar acesso para este cliente"}
            </button>
          </>
        ) : (
          <>Pedido sem WhatsApp: o cliente não consegue acompanhar pela área.</>
        )}
      </div>

      <div className="pd-quick">
        {RESPOSTAS_PRONTAS.map((r) => (
          <button type="button" className="chip" key={r} onClick={() => setTexto(r)}>
            {r}
          </button>
        ))}
      </div>
      <form className="pd-chat-form" onSubmit={enviar}>
        <textarea
          rows={2}
          maxLength={MAX_MSG}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Responder ao cliente (aparece em Solicitações, na área dele)"
        />
        <button className="chip chip-add" disabled={enviando || !texto.trim()}>
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}

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
  chave: {
    titulo: "🔑 Chaves PK — pedidos de apresentação",
    vazio: "Nenhum pedido ainda. Eles chegam pelo botão “Chave PK” das empresas na área de membros.",
    local: "",
    fase: "",
    criar: "",
    msg: (p) => `Olá ${p.nome}! Aqui é o Paulo Kasmirscki. Recebi o seu pedido de Chave PK para a ${p.titulo}. Vamos conversar sobre a apresentação?`,
  },
  time: {
    titulo: "🧩 Monte meu time — times montados pelo concierge",
    vazio: "Nenhum time ainda. Eles chegam pelo botão “Quero esse time” do concierge, quando a pessoa precisa de várias empresas para um mesmo projeto.",
    local: "",
    fase: "",
    criar: "",
    msg: (p) => `Olá ${p.nome}! Aqui é o Paulo Kasmirscki. Recebi o seu pedido de time para ${p.titulo}. Vamos conversar sobre as conexões?`,
  },
  obra: {
    titulo: "🏗️ Pedidos Do Terreno às Chaves",
    vazio: "Nenhum pedido ainda. Eles chegam pelo botão “+ Iniciar minha obra” da área de membros e pelo concierge.",
    local: "Cidade",
    fase: "Terreno",
    criar: "Criar projeto da obra",
    msg: (p) => `Olá ${p.nome}! Aqui é o Paulo Kasmirscki. Recebi o seu pedido Do Terreno às Chaves (${p.titulo}${p.local ? " em " + p.local : ""}). Vamos conversar?`,
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
export default function PedidosAdmin({ code, tipo, pedidos, members = [], onData, onImovel }) {
  const R = ROTULOS[tipo];
  const [verTodos, setVerTodos] = useState(false);
  const [busy, setBusy] = useState("");
  const [aberta, setAberta] = useState(""); // conversa aberta

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
    if (tipo === "projeto" || tipo === "obra") {
      await call({
        action: "projectSave",
        project: {
          nome: tipo === "obra" ? [p.titulo, p.local].filter(Boolean).join(" em ") : p.titulo,
          cliente: p.nome,
          memberId: p.memberId,
          trilha: tipo === "obra" ? "obra" : "abertura",
        },
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

  const donoDe = (p) =>
    (p.memberId && members.find((m) => m.id === p.memberId)) ||
    (phoneKey(p.whatsapp).length >= 10 &&
      members.find((m) => phoneKey(m.whatsapp) === phoneKey(p.whatsapp))) ||
    null;
  const doTipo = pedidos.filter((p) => p.tipo === tipo);
  const abertos = doTipo.filter(
    (p) => p.status === "novo" || p.status === "conversa" || naoLidas(p, "paulo") > 0
  );
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
                      {!p.memberId &&
                        (donoDe(p)
                          ? ` · pelo código geral · acompanha pelo acesso de ${donoDe(p).nome}`
                          : " · pelo código geral (sem link pessoal)")}
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
                        {statusLabel(s.id, tipo)}
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
                    {p.prazo && (
                      <span>
                        Começar: <strong>{p.prazo}</strong>
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
                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      const abrir = aberta !== p.id;
                      setAberta(abrir ? p.id : "");
                      if (abrir && naoLidas(p, "paulo") > 0) call({ action: "pedidoRead", id: p.id });
                    }}
                  >
                    💬 Conversa
                    {(p.mensagens || []).length > 0 && ` (${(p.mensagens || []).length})`}
                    {naoLidas(p, "paulo") > 0 && <span className="pd-new">nova</span>}
                  </button>
                  <button type="button" className="chip chip-danger" onClick={() => excluir(p)}>
                    Excluir
                  </button>
                </div>
                {aberta === p.id && <ConversaAdmin p={p} call={call} dono={donoDe(p)} />}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
