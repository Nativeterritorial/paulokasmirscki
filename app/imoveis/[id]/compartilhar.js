"use client";

import { useState } from "react";

// Compartilhar o anúncio: no celular abre o menu do aparelho (WhatsApp etc.);
// no computador copia o link.
export default function Compartilhar({ titulo, link }) {
  const [copiado, setCopiado] = useState(false);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: titulo, url: link });
        return;
      } catch (e) {
        if (e?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch (e) {
      window.prompt("Copie o link do anúncio:", link);
    }
  };

  return (
    <button type="button" className="btn btn-outline" onClick={share}>
      {copiado ? "✓ Link copiado" : "Compartilhar"}
    </button>
  );
}
