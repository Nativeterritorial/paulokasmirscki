"use client";

import { useEffect } from "react";

// chegou por um link como /ecossistema#indicar: já abre o "Como funciona"
// daquele serviço e rola até ele
export default function AbrirComo() {
  useEffect(() => {
    const abrir = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const sec = id ? document.getElementById(id) : null;
      const det = sec?.querySelector("details.eco-como");
      if (!det) return;
      det.open = true;
      // rola depois que a página assenta (fontes e animações de entrada)
      const ir = () => window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 90, behavior: "instant" });
      setTimeout(ir, 300);
      setTimeout(ir, 1000);
      setTimeout(ir, 1800);
    };
    abrir();
    window.addEventListener("hashchange", abrir);
    return () => window.removeEventListener("hashchange", abrir);
  }, []);
  return null;
}
