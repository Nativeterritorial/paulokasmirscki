"use client";

import { useEffect } from "react";
import { usePedidos, PedidosList } from "./pedidos";

// "Minhas solicitações": tudo o que a pessoa pediu ao Paulo num só lugar —
// Chaves PK, projetos, gestão e imóveis — com a situação e a conversa de cada
// um. Com link pessoal aparecem todos; pelo código geral, os feitos neste
// aparelho.
export default function MySolicitacoes({ code, member, version }) {
  const { list, load, cancel, apply } = usePedidos(code, member, null);

  useEffect(() => {
    if (version) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return (
    <section className="area-refs area-projects" id="solicitacoes">
      <div className="area-refs-head">
        <div>
          <div className="kick">Minhas solicitações</div>
          <h2>Acompanhe tudo o que você pediu ao Paulo</h2>
          <p>
            Chaves PK, projetos, gestão e imóveis: a situação de cada pedido e
            as respostas do Paulo ficam aqui.
          </p>
        </div>
        {list.length > 0 && (
          <span className="sol-count">
            {list.length} {list.length === 1 ? "solicitação" : "solicitações"}
          </span>
        )}
      </div>
      {!list.length ? (
        <p className="area-refs-empty">
          {member
            ? "Você ainda não fez nenhuma solicitação. Use a Chave PK nas empresas da rede ou os botões de novo projeto, gestão e imóvel abaixo."
            : "As solicitações que você fizer neste aparelho aparecem aqui, com as respostas do Paulo. Use a Chave PK nas empresas da rede ou os botões abaixo."}
        </p>
      ) : (
        <div className="sol-scroll">
          <PedidosList list={list} onCancel={cancel} code={code} apply={apply} showTipo />
        </div>
      )}
    </section>
  );
}
