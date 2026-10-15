"use client";

import { useState } from "react";
import { usePedidos, PedidosList, PedidoForm } from "./pedidos";

// "Quero vender meu imóvel": o proprietário cadastra o imóvel e acompanha a
// situação do cadastro. O Paulo avalia, fecha a autorização de venda e depois
// publica na vitrine do ecossistema.
export default function MyImoveis({ code, member }) {
  const { list, load, cancel, apply } = usePedidos(code, member, "imovel");
  const [open, setOpen] = useState(false);

  return (
    <section className="area-refs area-projects" id="vender">
      <div className="area-refs-head">
        <div>
          <div className="kick">Quero vender meu imóvel</div>
          <h2>Tem um imóvel para vender?</h2>
          <p>
            Cadastre o seu imóvel: o Paulo avalia com você, prepara o anúncio e
            leva até os compradores e indicadores do ecossistema.{" "}
            <a className="vt-link" href="/imoveis">
              Ver a vitrine de imóveis →
            </a>
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setOpen((o) => !o)}>
          {open ? "Fechar" : "+ Cadastrar imóvel"}
        </button>
      </div>

      {open && (
        <div className="area-refs-form">
          <PedidoForm code={code} tipo="imovel" member={member} onDone={load} />
        </div>
      )}

      <PedidosList list={list} onCancel={cancel} code={code} apply={apply} />
    </section>
  );
}
