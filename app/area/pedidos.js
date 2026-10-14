"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FASES_PROJETO,
  TEMPO_EMPRESA,
  AREAS_GESTAO,
  TIPOS_IMOVEL,
  SITUACAO_IMOVEL,
  pedidoStatus,
} from "../parcerias/pedidos";

const MAX_FOTOS = 10;

// reduz a foto no navegador (lado maior 1600px, JPEG até ~300 KB) antes de enviar
const loadImg = (file) =>
  new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      res(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      rej(e);
    };
    img.src = url;
  });

async function toJpeg(file) {
  const img = await loadImg(file);
  let max = 1600;
  let data = "";
  for (let tries = 0; tries < 6; tries++) {
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    data = c.toDataURL("image/jpeg", 0.8);
    if (data.length < 420000) return data;
    max = Math.round(max * 0.8);
  }
  return data;
}

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
        const st = pedidoStatus(p.status, p.tipo);
        return (
          <article className={`ref-item${st.id === "encerrado" ? " closed" : ""}`} key={p.id}>
            <div className="ref-item-top">
              <div>
                <div className="ref-nm">
                  {p.titulo}
                  {p.onde && <span className="ref-tipo"> · {p.onde}</span>}
                </div>
                <div className="ref-meta-line">
                  {p.tipo === "imovel" ? "Cadastrado" : "Pedido enviado"} em {fmt(p.t)}
                </div>
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
    titulo: ["Sua empresa (ou seu nome) *", "Ex.: Mercado Bom Preço ou João Silva"],
    local: ["Segmento", "Ex.: supermercado, indústria, serviços"],
    fase: ["Há quanto tempo a empresa existe", TEMPO_EMPRESA],
    descricao: ["Qual é o maior desafio hoje? *", "Ex.: o caixa aperta todo mês, quero abrir filial, falta organização"],
    enviar: "Solicitar gestão",
    ok: "Pedido enviado!",
  },
  imovel: {
    titulo: ["Tipo de imóvel *", TIPOS_IMOVEL],
    local: ["Cidade", "Ex.: Veranópolis"],
    fase: ["Situação do imóvel", SITUACAO_IMOVEL],
    descricao: ["Conte sobre o imóvel *", "Ex.: casa de alvenaria, 2 vagas de garagem, pátio, reformada em 2022"],
    enviar: "Cadastrar meu imóvel",
    ok: "Imóvel cadastrado!",
  },
};

// Formulário de "+ Novo projeto" / "+ Nova gestão"
export function PedidoForm({ code, tipo, member, onDone }) {
  const T = TEXTOS[tipo];
  const [f, setF] = useState({
    nome: "",
    whatsapp: "",
    titulo: "",
    local: "",
    fase: "",
    descricao: "",
    areas: [],
    bairro: "",
    valor: "",
    metragem: "",
    quartos: "",
    proprietario: false,
    valorVisivel: true,
    origem: "proprietario",
    creci: "",
    endereco: "",
  });
  const [fotos, setFotos] = useState([]); // [{ id, src }]
  const [enviando, setEnviando] = useState(0);

  const addFotos = async (e) => {
    const files = [...(e.target.files || [])].slice(0, MAX_FOTOS - fotos.length);
    e.target.value = "";
    setErr("");
    for (const file of files) {
      setEnviando((n) => n + 1);
      try {
        const src = await toJpeg(file);
        const d = await post(code, { action: "foto", data: src.split(",")[1] });
        if (d.ok) setFotos((l) => (l.length < MAX_FOTOS ? [...l, { id: d.id, src }] : l));
        else setErr(d.error || "Não consegui enviar uma das fotos.");
      } catch (e2) {
        setErr("Não consegui ler uma das fotos. Tente outra.");
      }
      setEnviando((n) => n - 1);
    }
  };
  const imovel = tipo === "imovel";
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
    if (!member && (!f.nome.trim() || !f.whatsapp.trim())) {
      setErr("Preencha seu nome e WhatsApp.");
      return;
    }
    if (!f.titulo.trim() || !f.descricao.trim()) {
      setErr("Preencha os campos com *.");
      return;
    }
    if (enviando > 0) {
      setErr("Aguarde as fotos terminarem de enviar.");
      return;
    }
    if (imovel && !f.proprietario) {
      setErr("Confirme que você é o proprietário ou tem autorização dele.");
      return;
    }
    setSending(true);
    try {
      const d = await post(code, {
        action: "create",
        pedido: { ...f, tipo, fotos: fotos.map((x) => x.id) },
      });
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
        <p>
          {imovel
            ? "O Paulo vai avaliar o cadastro e falar com você pelo WhatsApp."
            : "O Paulo recebeu o seu pedido e vai falar com você pelo WhatsApp."}
        </p>
      </div>
    );
  }

  return (
    <form className="signup-form" onSubmit={submit}>
      {!member && (
        <div className="signup-row">
          <label>
            Seu nome *
            <input value={f.nome} onChange={upd("nome")} placeholder="Seu nome" autoComplete="name" />
          </label>
          <label>
            Seu WhatsApp *
            <input
              value={f.whatsapp}
              onChange={upd("whatsapp")}
              placeholder="(54) 99999-9999"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
        </div>
      )}
      {imovel && (
        <div className="signup-row">
          <label>
            Quem está cadastrando
            <select value={f.origem} onChange={upd("origem")}>
              <option value="proprietario">Sou o proprietário</option>
              <option value="parceiro">Sou corretor / imobiliária parceira</option>
            </select>
          </label>
          {f.origem === "parceiro" ? (
            <label>
              Seu CRECI
              <input value={f.creci} onChange={upd("creci")} placeholder="Ex.: CRECI-RS 12345" />
            </label>
          ) : (
            <span />
          )}
        </div>
      )}
      <div className="signup-row">
        <label>
          {T.titulo[0]}
          {imovel ? (
            <select value={f.titulo} onChange={upd("titulo")}>
              <option value="">Selecione</option>
              {T.titulo[1].map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input value={f.titulo} onChange={upd("titulo")} placeholder={T.titulo[1]} />
          )}
        </label>
        <label>
          {T.local[0]}
          <input value={f.local} onChange={upd("local")} placeholder={T.local[1]} />
        </label>
      </div>
      {imovel && (
        <>
          <div className="signup-row">
            <label>
              Bairro
              <input value={f.bairro} onChange={upd("bairro")} placeholder="Ex.: Centro" />
            </label>
            <label>
              Valor que você pede
              <input value={f.valor} onChange={upd("valor")} placeholder="Ex.: R$ 650 mil" />
            </label>
          </div>
          <label>
            Endereço completo
            <input
              value={f.endereco}
              onChange={upd("endereco")}
              placeholder="Rua, número, complemento"
              autoComplete="street-address"
            />
          </label>
          <label>
            No anúncio, o valor deve aparecer?
            <select
              value={f.valorVisivel ? "sim" : "nao"}
              onChange={(e) => setF((s) => ({ ...s, valorVisivel: e.target.value === "sim" }))}
            >
              <option value="sim">Sim, mostrar o valor</option>
              <option value="nao">Não, deixar “sob consulta”</option>
            </select>
          </label>
          <div className="signup-row">
            <label>
              Área (m²)
              <input value={f.metragem} onChange={upd("metragem")} placeholder="Ex.: 180" inputMode="numeric" />
            </label>
            <label>
              Quartos
              <input value={f.quartos} onChange={upd("quartos")} placeholder="Ex.: 3" inputMode="numeric" />
            </label>
          </div>
        </>
      )}
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
      {imovel && (
        <>
          <div className="pd-fotos">
            <div className="pd-fotos-head">
              <span>
                Fotos do imóvel <small>({fotos.length}/{MAX_FOTOS})</small>
              </span>
              {fotos.length < MAX_FOTOS && (
                <label className="btn btn-outline pd-fotos-add">
                  + Adicionar fotos
                  <input type="file" accept="image/*" multiple onChange={addFotos} hidden />
                </label>
              )}
            </div>
            {(fotos.length > 0 || enviando > 0) && (
              <div className="pd-fotos-grid">
                {fotos.map((x) => (
                  <div className="pd-foto" key={x.id}>
                    <img src={x.src} alt="" />
                    <button
                      type="button"
                      aria-label="Remover foto"
                      onClick={() => setFotos((l) => l.filter((y) => y.id !== x.id))}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {[...Array(enviando)].map((_, i) => (
                  <div className="pd-foto pd-foto-load" key={"l" + i}>
                    Enviando…
                  </div>
                ))}
              </div>
            )}
          </div>
          <label className="ref-check">
            <input
              type="checkbox"
              checked={f.proprietario}
              onChange={(e) => setF((s) => ({ ...s, proprietario: e.target.checked }))}
            />
            <span>
              {f.origem === "parceiro"
                ? "Tenho autorização do proprietário para anunciar e vender este imóvel. *"
                : "Sou o proprietário do imóvel ou tenho autorização dele para vender. *"}
            </span>
          </label>
          <p className="join-hint">
            O endereço fica só com o Paulo: o anúncio mostra apenas o bairro e
            todo contato passa por ele. As fotos são avaliadas antes de ir para
            a vitrine.
          </p>
        </>
      )}
      {err && <p className="signup-err">{err}</p>}
      <button className="btn btn-primary join-cta" disabled={sending}>
        {sending ? "Enviando..." : T.enviar}
      </button>
    </form>
  );
}
