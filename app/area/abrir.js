"use client";

import { useEffect } from "react";

// O concierge sugere um serviço ("Iniciar meu projeto") e dispara o evento
// "pk-abrir" com o tipo; a seção daquele serviço abre o formulário e rola até ele.
export const abrirServico = (tipo) => {
  window.dispatchEvent(new CustomEvent("pk-abrir", { detail: tipo }));
};

export function useAbrir(tipo, sectionId, abrir) {
  useEffect(() => {
    const on = (e) => {
      if (e.detail !== tipo) return;
      abrir();
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    };
    window.addEventListener("pk-abrir", on);
    return () => window.removeEventListener("pk-abrir", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, sectionId]);
}
