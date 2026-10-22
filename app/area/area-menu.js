"use client";

import { useEffect, useState } from "react";

// Menu da Área de Membros, agrupado em blocos:
// computador = barra lateral à esquerda (dá para recolher e deixar só os ícones);
// celular = barra fixa embaixo com 5 botões, e cada grupo abre um mini-menu.

const P = {
  inicio: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z",
  mural: "M4 13V9a1 1 0 0 1 1-1h3l7-4v14l-7-4H5a1 1 0 0 1-1-1zM8 14l1.5 5h2.5l-1.5-5",
  vantagens: "M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8c-2-4-6-4-6-1.5S10 8 12 8zM12 8c2-4 6-4 6-1.5S14 8 12 8z",
  vagas: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
  solicitacoes: "M14.5 9.5a4 4 0 1 0-4 4L5 19l2 2M7 17l2 2M14.5 6.5h.01",
  indicacoes: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .6 3 2.6 3 6",
  vender: "M4 11l8-7 8 7M6 10v10h12V10M10 20v-5h4v5",
  obra: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6M9 10h.01M15 10h.01",
  projeto: "M4 20L20 4M7 17l2 2M10 14l2 2M13 11l2 2M16 8l2 2",
  gestao: "M4 19h16M5 15l4-4 3 3 6-7M15 7h3v3",
  raiox: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4M11 8v6M8 11h6",
  plano: "M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.5 6.8 19.2l1-5.9L3.5 9.2l5.9-.8L12 3z",
  rede: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  conexoes: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  servicos: "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5 2.5-2.5z",
  perfil: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-8 8-8s8 3.6 8 8",
  recolher: "M15 6l-6 6 6 6",
  sair: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

const Ic = ({ n }) => (
  <svg className="am-ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={P[n]} />
  </svg>
);

const grupos = (member) => [
  { id: "rede", nome: "Rede", itens: [["mural", "svc-mur", "Mural"], ["vantagens", "svc-van", "Vantagens"], ["vagas", "svc-vag", "Vagas"]] },
  {
    id: "conexoes",
    nome: "Minhas conexões",
    curto: "Conexões",
    itens: [["solicitacoes", "svc-sol", "Solicitações"], ["indicacoes", "svc-ind", member ? "Indicações" : "Indicar imóvel"]],
  },
  {
    id: "servicos",
    nome: "Serviços do Paulo",
    curto: "Serviços",
    itens: [["vender", "svc-imo", "Vender imóvel"], ["obra", "svc-obra", "Minha obra"], ["projeto", "svc-proj", "Meu projeto"], ["gestao", "svc-gest", "Minha gestão"]],
  },
];

const NOME_PLANO = { basico: "Plano Básico", premium: "Plano Premium" };

export default function AreaMenu({ aba, member, naoLidas, raiox, onRaiox, onSair }) {
  const [mini, setMini] = useState(false); // barra lateral recolhida (só ícones)
  const [folha, setFolha] = useState(null); // celular: grupo aberto
  const G = grupos(member);
  const msgs = naoLidas?.total || 0;

  useEffect(() => {
    try {
      setMini(localStorage.getItem("pk_menu_mini") === "1");
    } catch (e) {}
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("am-mini-on", mini);
  }, [mini]);
  // fecha o mini-menu ao trocar de aba
  useEffect(() => setFolha(null), [aba]);

  const alternar = () =>
    setMini((v) => {
      try {
        localStorage.setItem("pk_menu_mini", v ? "0" : "1");
      } catch (e) {}
      return !v;
    });

  const href = (id) => (id === "solicitacoes" && msgs > 0 ? `#pd-${naoLidas.primeiro}` : `#${id}`);
  const Item = ({ id, cls, lbl }) => (
    <a className={`am-item ${cls}${aba === id ? " on" : ""}`} href={href(id)} aria-current={aba === id ? "page" : undefined} title={lbl}>
      <Ic n={id} />
      <span className="am-lbl">{lbl}</span>
      {id === "solicitacoes" && msgs > 0 && <span className="am-n">{msgs}</span>}
    </a>
  );
  const grupoDe = (id) => G.find((g) => g.itens.some(([i]) => i === id))?.id;
  const ativo = aba === "inicio" ? "inicio" : grupoDe(aba);
  const plano = (
    <a className="am-item am-extra" href="/ecossistema#planos" target="_blank" rel="noopener noreferrer" title="Meu plano">
      <Ic n="plano" />
      <span className="am-lbl">{NOME_PLANO[member?.plano] || "Conhecer os planos"}</span>
    </a>
  );
  const raioxBtn = (
    <button type="button" className="am-item am-extra" onClick={onRaiox} title="Meu Raio-X">
      <Ic n="raiox" />
      <span className="am-lbl">{raiox ? "Meu Raio-X" : "Fazer meu Raio-X"}</span>
    </button>
  );

  return (
    <>
      {/* computador: barra lateral */}
      <aside className={`am-side${mini ? " mini" : ""}`} aria-label="Seções da área de membros">
        <nav>
          <Item id="inicio" cls="svc-ia" lbl="Início" />
          {G.map((g) => (
            <div key={g.id} className="am-grupo">
              <div className="am-gtit">{g.nome}</div>
              {g.itens.map(([id, cls, lbl]) => (
                <Item key={id} id={id} cls={cls} lbl={lbl} />
              ))}
            </div>
          ))}
        </nav>
        <div className="am-pe">
          {raioxBtn}
          {plano}
          <button type="button" className="am-item am-recolher" onClick={alternar} title={mini ? "Abrir o menu" : "Recolher o menu"}>
            <Ic n="recolher" />
            <span className="am-lbl">Recolher o menu</span>
          </button>
        </div>
      </aside>

      {/* celular: barra embaixo + mini-menu do grupo */}
      {folha && <div className="am-veu" onClick={() => setFolha(null)} />}
      {folha && (
        <div className="am-folha" role="dialog" aria-label={folha === "perfil" ? "Perfil" : G.find((g) => g.id === folha)?.nome}>
          <div className="am-gtit">{folha === "perfil" ? (member?.nome ? `Olá, ${member.nome.split(" ")[0]}` : "Perfil") : G.find((g) => g.id === folha)?.nome}</div>
          {folha === "perfil" ? (
            <>
              {raioxBtn}
              {plano}
              <button type="button" className="am-item" onClick={onSair}>
                <Ic n="sair" />
                <span className="am-lbl">Sair</span>
              </button>
            </>
          ) : (
            G.find((g) => g.id === folha)?.itens.map(([id, cls, lbl]) => <Item key={id} id={id} cls={cls} lbl={lbl} />)
          )}
        </div>
      )}
      <nav className="am-bar" aria-label="Menu">
        <a className={`am-tab${ativo === "inicio" ? " on" : ""}`} href="#inicio">
          <Ic n="inicio" />
          Início
        </a>
        {G.map((g) => (
          <button key={g.id} type="button" className={`am-tab${ativo === g.id || folha === g.id ? " on" : ""}`} onClick={() => setFolha((f) => (f === g.id ? null : g.id))}>
            <Ic n={g.id} />
            {g.curto || g.nome}
            {g.id === "conexoes" && msgs > 0 && <span className="am-n">{msgs}</span>}
          </button>
        ))}
        <button type="button" className={`am-tab${folha === "perfil" ? " on" : ""}`} onClick={() => setFolha((f) => (f === "perfil" ? null : "perfil"))}>
          <Ic n="perfil" />
          Perfil
        </button>
      </nav>
    </>
  );
}
