"use client";

import { useEffect } from "react";
import { usePedidos, PedidosList } from "./pedidos";

// "Minhas solicitações": tudo o que o membro pediu ao Paulo num só lugar —
// Chaves PK, projetos, gestão e imóveis — com a situação e a conversa de cada um.
export default function MySolicitacoes({ code, member, version }) {
  const { list, load, cancel, apply } = usePedidos(code, member, null);

  useEffect(() => {
    if (version) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  // entrou pelo código geral: o site não sabe quem é, então não há o que listar
  if (!member) {
    return (
      <section className="area-refs area-projects" id="solicitacoes">
        <div className="area-refs-head">
          <div>
            <div className="kick">Minhas solicitações</div>
            <h2>Acompanhe tudo o que você pediu ao Paulo</h2>
            <p>
              Para ver as suas solicitações e as respostas do Paulo, entre com o
              seu link pessoal de acesso. Ainda não tem? Peça ao Paulo pelo
              WhatsApp.
            </p>
          </div>
          <a
            className="btn btn-primary"
            href={`https://wa.me/5554996505799?text=${encodeURIComponent(
              "Olá Paulo! Quero o meu link pessoal da área de membros."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir meu link
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="area-refs area-projects" id="solicitacoes">
      <div className="area-refs-head">
        <div>
          <div className="kick">Minhas solicitações</div>
          <h2>Acompanhe tudo o que você pediu ao Paulo</h2>
          <p>
            Chaves PK, projetos, gestão e imóveis: a situação de cada pedido e a
            conversa com o Paulo ficam aqui.
          </p>
        </div>
      </div>
      {!list.length ? (
        <p className="area-refs-empty">
          Você ainda não fez nenhuma solicitação. Use a Chave PK nas empresas da
          rede ou os botões de novo projeto, gestão e imóvel abaixo.
        </p>
      ) : (
        <PedidosList list={list} onCancel={cancel} code={code} apply={apply} showTipo />
      )}
    </section>
  );
}
