"use client";

import { useEffect, useState } from "react";
import { toJpeg } from "../pedidos";
import { TIPOS_IMOVEL } from "../../parcerias/pedidos";
import {
  IMOVEL_STATUS,
  VITRINE_STATUS,
  MAX_FOTOS_IMOVEL,
  formatPreco,
  imovelCodigo,
  imovelResumo,
  imovelStatusLabel,
} from "../../imoveis/imovel-defs";

// Vitrine de imóveis no painel: o Paulo cria e edita os anúncios. Só os
// "Disponível" e "Reservado" aparecem na página pública /imoveis.
export default function ImoveisAdmin({ code, imoveis, open, setOpen, onData }) {
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const [enviando, setEnviando] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    const im = imoveis.find((x) => x.id === open);
    setDraft(im ? JSON.parse(JSON.stringify(im)) : null);
    setErr("");
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
      onData(d);
      return d;
    } catch (e) {
      return null;
    }
  };

  const novo = async () => {
    const d = await call({ action: "imovelSave", imovel: { titulo: "Novo imóvel", status: "rascunho" } });
    if (d?.novoImovel) setOpen(d.novoImovel);
  };

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    await call({ action: "imovelSave", imovel: draft });
    setSaving(false);
    setSaved(draft.id);
    setTimeout(() => setSaved(""), 2000);
  };

  const remove = async (im) => {
    if (!window.confirm(`Excluir o anúncio “${im.titulo}”? As fotos dele também são apagadas.`)) return;
    await call({ action: "imovelDelete", id: im.id });
    if (open === im.id) setOpen("");
  };

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const addFotos = async (e) => {
    const files = [...(e.target.files || [])].slice(0, MAX_FOTOS_IMOVEL - (draft.fotos || []).length);
    e.target.value = "";
    setErr("");
    for (const file of files) {
      setEnviando((n) => n + 1);
      try {
        const src = await toJpeg(file);
        const r = await fetch("/api/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, action: "foto", data: src.split(",")[1] }),
        });
        const d = await r.json();
        if (d.ok) setDraft((x) => ({ ...x, fotos: [...(x.fotos || []), d.id].slice(0, MAX_FOTOS_IMOVEL) }));
        else setErr("Não consegui enviar uma das fotos.");
      } catch (e2) {
        setErr("Não consegui ler uma das fotos. Tente outra.");
      }
      setEnviando((n) => n - 1);
    }
  };

  const moveFoto = (i, dir) =>
    setDraft((d) => {
      const f = [...(d.fotos || [])];
      const j = i + dir;
      if (j < 0 || j >= f.length) return d;
      [f[i], f[j]] = [f[j], f[i]];
      return { ...d, fotos: f };
    });

  return (
    <section className="admin-panel admin-signups">
      <h3>
        🏡 Vitrine de imóveis
        <span className="lg-tag">{imoveis.filter((i) => VITRINE_STATUS.includes(i.status)).length} na vitrine</span>
      </h3>
      <p className="admin-hint">
        Use “Preparar anúncio” num cadastro acima ou crie um anúncio do zero. Só
        os imóveis <strong>Disponível</strong> e <strong>Reservado</strong>{" "}
        aparecem na página pública <a href="/imoveis" target="_blank" rel="noopener noreferrer">/imoveis</a>,
        sempre sem o endereço.
      </p>
      <button type="button" className="chip chip-add" onClick={novo}>
        + Novo anúncio
      </button>

      {!imoveis.length ? (
        <p className="admin-empty">Nenhum anúncio ainda.</p>
      ) : (
        <div className="lead-cards proj-cards">
          {imoveis.map((im) => {
            const isOpen = open === im.id && draft;
            const publico = VITRINE_STATUS.includes(im.status);
            return (
              <div className="lead-card" key={im.id}>
                <div className="lead-card-top">
                  <div className="vt-adm-top">
                    <div className="vt-adm-capa">
                      {im.fotos?.[0] ? <img src={`/api/foto/${im.fotos[0]}`} alt="" /> : <span>sem foto</span>}
                    </div>
                    <div>
                      <div className="lead-nm">
                        {im.titulo}
                        <span className={`lg-tag vt-st-${im.status}`}>{imovelStatusLabel(im.status)}</span>
                      </div>
                      <div className="lead-ct">
                        {imovelCodigo(im)} · {imovelResumo(im) || im.tipo}
                        {im.bairro || im.cidade ? ` · ${[im.bairro, im.cidade].filter(Boolean).join(", ")}` : ""}
                        {" · "}
                        {im.preco ? formatPreco(im.preco) : "sem valor"}
                        {!im.valorVisivel && " (sob consulta)"}
                      </div>
                    </div>
                  </div>
                  <div className="lead-actions">
                    {publico && (
                      <a className="firm-conn" href={`/imoveis/${im.id}`} target="_blank" rel="noopener noreferrer">
                        Ver na vitrine
                      </a>
                    )}
                    <button type="button" className="chip" onClick={() => setOpen(isOpen ? "" : im.id)}>
                      {isOpen ? "Fechar" : "Editar"}
                    </button>
                    <button type="button" className="chip chip-danger" onClick={() => remove(im)}>
                      Excluir
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="proj-edit">
                    <div className="proj-edit-row proj-edit-head">
                      <label>
                        Título do anúncio
                        <input value={draft.titulo || ""} onChange={set("titulo")} placeholder="Ex.: Casa ampla no Centro" />
                      </label>
                      <label>
                        Tipo
                        <select value={draft.tipo || "Outro"} onChange={set("tipo")}>
                          {TIPOS_IMOVEL.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Situação do anúncio
                        <select value={draft.status} onChange={set("status")}>
                          {IMOVEL_STATUS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label} — {s.desc}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="vt-adm-grid">
                      <label>
                        Cidade
                        <input value={draft.cidade || ""} onChange={set("cidade")} />
                      </label>
                      <label>
                        Bairro
                        <input value={draft.bairro || ""} onChange={set("bairro")} />
                      </label>
                      <label>
                        Valor (R$)
                        <input
                          value={draft.preco || ""}
                          onChange={set("preco")}
                          inputMode="numeric"
                          placeholder="Ex.: 650000"
                        />
                      </label>
                      <label>
                        Valor no anúncio
                        <select
                          value={draft.valorVisivel === false ? "nao" : "sim"}
                          onChange={(e) => setDraft((d) => ({ ...d, valorVisivel: e.target.value === "sim" }))}
                        >
                          <option value="sim">Mostrar {draft.preco ? formatPreco(draft.preco) : "o valor"}</option>
                          <option value="nao">Sob consulta</option>
                        </select>
                      </label>
                      <label>
                        Área (m²)
                        <input value={draft.metragem || ""} onChange={set("metragem")} inputMode="numeric" />
                      </label>
                      <label>
                        Quartos
                        <input value={draft.quartos || ""} onChange={set("quartos")} inputMode="numeric" />
                      </label>
                      <label>
                        Banheiros
                        <input value={draft.banheiros || ""} onChange={set("banheiros")} inputMode="numeric" />
                      </label>
                      <label>
                        Vagas de garagem
                        <input value={draft.vagas || ""} onChange={set("vagas")} inputMode="numeric" />
                      </label>
                    </div>
                    <label className="proj-edit-full">
                      Descrição (aparece no anúncio)
                      <textarea rows={5} value={draft.descricao || ""} onChange={set("descricao")} />
                    </label>

                    <div className="gest-edit-sec">
                      <div className="gest-edit-head">
                        <strong>
                          Fotos ({(draft.fotos || []).length}/{MAX_FOTOS_IMOVEL}) — a primeira é a capa
                        </strong>
                        {(draft.fotos || []).length < MAX_FOTOS_IMOVEL && (
                          <label className="chip chip-add vt-adm-add">
                            + Adicionar fotos
                            <input type="file" accept="image/*" multiple onChange={addFotos} hidden />
                          </label>
                        )}
                      </div>
                      {err && <p className="admin-empty">{err}</p>}
                      <div className="pd-fotos-grid vt-adm-fotos">
                        {(draft.fotos || []).map((f, i) => (
                          <div className={`pd-foto${i === 0 ? " vt-capa" : ""}`} key={f}>
                            <img src={`/api/foto/${f}`} alt="" />
                            <div className="vt-foto-ctl">
                              <button type="button" aria-label="Mover para a esquerda" onClick={() => moveFoto(i, -1)} disabled={i === 0}>
                                ←
                              </button>
                              <button type="button" aria-label="Mover para a direita" onClick={() => moveFoto(i, 1)} disabled={i === draft.fotos.length - 1}>
                                →
                              </button>
                              <button
                                type="button"
                                aria-label="Remover foto"
                                onClick={() => setDraft((d) => ({ ...d, fotos: d.fotos.filter((x) => x !== f) }))}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                        {[...Array(enviando)].map((_, i) => (
                          <div className="pd-foto pd-foto-load" key={"l" + i}>
                            Enviando…
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="gest-edit-sec">
                      <strong>Só você vê</strong>
                      <div className="vt-adm-grid">
                        <label>
                          Endereço
                          <input value={draft.endereco || ""} onChange={set("endereco")} />
                        </label>
                        <label>
                          Proprietário
                          <input value={draft.proprietario || ""} onChange={set("proprietario")} />
                        </label>
                        <label>
                          Contato do proprietário
                          <input value={draft.contato || ""} onChange={set("contato")} />
                        </label>
                        <label>
                          CRECI do parceiro (aparece no anúncio)
                          <input value={draft.parceiroCreci || ""} onChange={set("parceiroCreci")} placeholder="Deixe vazio se o imóvel é seu" />
                        </label>
                      </div>
                      <label className="proj-edit-full">
                        Anotações
                        <textarea rows={3} value={draft.notas || ""} onChange={set("notas")} />
                      </label>
                    </div>

                    <div className="proj-edit-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={save}
                        disabled={saving || enviando > 0 || !String(draft.titulo || "").trim()}
                      >
                        {saving ? "Salvando..." : saved === im.id ? "✓ Salvo" : enviando ? "Enviando fotos..." : "Salvar anúncio"}
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
