"use client";

import { useEffect } from "react";

// guarda neste aparelho quem convidou: vale para o cadastro feito aqui ou
// em qualquer outra página do site nos próximos 30 dias
export default function SalvarConvite({ id }) {
  useEffect(() => {
    try {
      if (id) localStorage.setItem("pk_convite", JSON.stringify({ id, t: Date.now() }));
    } catch (e) {}
  }, [id]);
  return null;
}
