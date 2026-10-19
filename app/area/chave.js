"use client";

import { useEffect, useState } from "react";
import { post } from "./pedidos";
import { PLANOS, CHAVES_POR_MES, chavesRestantes, inicioDoMes } from "../parcerias/mural";

const WHATSAPP = "https://wa.me/5554996505799";

// Chave PK: a apresentação feita pelo Paulo ao responsável por uma empresa da
// rede. Não é um contato direto — o pedido passa por análise e o Paulo faz a
// ponte. O acesso livre continua sendo o site/Instagram da empresa.

const ETAPAS = ["Pedido", "Análise do Paulo", "Apresentação", "Conexão"];

const Lock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

// rótulo do link livre conforme o endereço da empresa
const linkLabel = (c) => {
  if (!c.link) return "Ver perfil";
  return /instagram\.com/i.test(c.link) ? "Instagram" : "Site";
};

// botões de cada empresa: acesso livre (site/Instagram) + Chave PK
export function FirmActions({ c, onChave, onVisit }) {
  return (
    <div className="firm-acts">
      <a
        className="firm-conn firm-free"
        href={c.link || `/rede/${c.id}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onVisit}
      >
        {linkLabel(c)}
      </a>
      <button type="button" className="firm-conn firm-chave" onClick={() => onChave(c)}>
        <Lock /> Chave PK
      </button>
    </div>
  );
}

// janela de pedido da Chave PK
export function ChaveModal({ company, code, member, onClose, onDone }) {
  const [f, setF] = useState({ descricao: "", nome: "", whatsapp: "" });
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  // Chaves já usadas neste mês (pelo plano); null = carregando
  const [usadas, setUsadas] = useState(null);
  // sem Chave disponível no plano: primeiro escolhe (avulsa ou plano)
  const [avulsaOk, setAvulsaOk] = useState(false);
  const plano = member?.plano || "";

  useEffect(() => {
    let vivo = true;
    post(code, {})
      .then((d) => {
        if (!vivo) return;
        const ini = inicioDoMes();
        setUsadas(
          (d?.pedidos || []).filter((p) => p.tipo === "chave" && (p.t || 0) >= ini && !p.avulsa).length
        );
      })
      .catch(() => vivo && setUsadas(0));
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restantes = usadas === null ? null : chavesRestantes(plano, usadas);
  // escolha aparece para quem não tem plano ou já usou as do mês
  const precisaEscolher = usadas !== null && !restantes && !avulsaOk;
  const quem = member?.nome ? `Aqui é ${member.nome}. ` : "";
  const assinar = (id) =>
    `${WHATSAPP}?text=${encodeURIComponent(
      `Olá Paulo! ${quem}Quero assinar o plano ${PLANOS[id].nome} (${PLANOS[id].preco}/mês) do Ecossistema PK para usar a Chave PK.`
    )}`;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const upd = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!member && (!f.nome.trim() || !f.whatsapp.trim())) {
      setErr("Preencha seu nome e WhatsApp.");
      return;
    }
    if (!f.descricao.trim()) {
      setErr("Conte em poucas palavras o que você precisa.");
      return;
    }
    setSending(true);
    try {
      const d = await post(code, {
        action: "create",
        pedido: {
          tipo: "chave",
          titulo: company.nome,
          empresaId: company.id,
          descricao: f.descricao,
          nome: f.nome,
          whatsapp: f.whatsapp,
        },
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

  return (
    <div className="chave-overlay" onClick={onClose}>
      <div
        className="chave-box"
        role="dialog"
        aria-modal="true"
        aria-label={`Chave PK — ${company.nome}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="chave-x" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
        <div className="kick">
          <Lock /> Chave PK
        </div>
        <h3>{company.nome}</h3>
        <p className="chave-lead">
          A Chave PK é a sua conexão com o responsável pela empresa: o pedido
          passa por uma análise e, quando faz sentido, o Paulo faz a
          apresentação pessoalmente.
        </p>
        <ol className="chave-steps">
          {ETAPAS.map((e, i) => (
            <li key={e}>
              <span>{i + 1}</span>
              {e}
            </li>
          ))}
        </ol>

        {!done && usadas === null && <p className="join-hint">Carregando…</p>}

        {!done && precisaEscolher && (
          <div className="chave-opcoes">
            <p className="chave-opcoes-lead">
              {plano
                ? `Você já usou as ${CHAVES_POR_MES[plano]} Chaves PK do seu plano neste mês. Como quer seguir?`
                : "A pesquisa é grátis; a Chave PK é a apresentação pessoal do Paulo. Escolha como quer a sua:"}
            </p>
            <button type="button" className="chave-opcao avulsa" onClick={() => setAvulsaOk(true)}>
              <strong>Chave avulsa</strong>
              <span>Só esta apresentação. O Paulo analisa o que você precisa e passa o valor.</span>
              <em>Continuar →</em>
            </button>
            {!plano && (
              <a className="chave-opcao basico" href={assinar("basico")} target="_blank" rel="noopener noreferrer">
                <strong>
                  {PLANOS.basico.nome} · {PLANOS.basico.preco}/mês
                </strong>
                <span>{CHAVES_POR_MES.basico} Chaves PK por mês, mais vagas, ofertas e respostas no Mural.</span>
                <em>Quero o {PLANOS.basico.nome} →</em>
              </a>
            )}
            <a className="chave-opcao premium" href={assinar("premium")} target="_blank" rel="noopener noreferrer">
              <strong>
                ⭐ {PLANOS.premium.nome} · {PLANOS.premium.preco}/mês
              </strong>
              <span>Chaves PK sem limite, com prioridade na análise, e o Paulo ajudando a sua empresa a vender.</span>
              <em>Quero o {PLANOS.premium.nome} →</em>
            </a>
          </div>
        )}

        {!done && usadas !== null && !precisaEscolher && (
          <p className={`chave-cota ${restantes ? plano : "avulsa"}`}>
            {restantes === Infinity
              ? "⭐ Premium: Chaves PK sem limite, com prioridade na análise."
              : restantes
              ? `★ ${PLANOS.basico.nome}: você tem ${restantes} de ${CHAVES_POR_MES.basico} Chaves PK neste mês.`
              : "Chave avulsa: o Paulo analisa o seu pedido e passa o valor antes da apresentação."}
          </p>
        )}

        {done ? (
          <div className="signup-done">
            <div className="signup-done-ic" aria-hidden="true">
              ✓
            </div>
            <h3>Pedido enviado!</h3>
            <p>
              O Paulo vai analisar e falar com você pelo WhatsApp sobre a
              apresentação.
              {" "}Você acompanha o andamento e as respostas em Solicitações.
            </p>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Fechar
            </button>
          </div>
        ) : usadas === null || precisaEscolher ? null : (
          <form className="signup-form" onSubmit={submit}>
            {!member && (
              <div className="signup-row">
                <label>
                  Seu nome *
                  <input value={f.nome} onChange={upd("nome")} autoComplete="name" />
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
            <label>
              O que você precisa da {company.nome}? *
              <textarea
                rows={3}
                value={f.descricao}
                onChange={upd("descricao")}
                placeholder="Ex.: orçamento para abrir um restaurante em Veranópolis"
              />
            </label>
            {err && <p className="signup-err">{err}</p>}
            <button className="btn btn-primary join-cta" disabled={sending}>
              {sending ? "Enviando..." : "Solicitar Chave PK"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
