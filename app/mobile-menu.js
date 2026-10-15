"use client";

import { useEffect, useState } from "react";

const LINKS = [
  ["#sobre", "Sobre"],
  ["/ecossistema", "Ecossistema"],
  ["#rede", "A Rede"],
  ["#segmentos", "Segmentos"],
  ["/parcerias", "Parcerias"],
  ["/imoveis", "Imóveis"],
  ["#contato", "Contato"],
];

// Menu do celular/tablet: o cabeçalho esconde os links em telas menores, então
// este botão abre a mesma lista, com Entrar e Parcerias em destaque.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`nav-burger${open ? " on" : ""}`}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <>
          <div className="mm-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
          <nav className="mobile-menu" id="mobile-menu" aria-label="Menu">
            <a className="mm-login" href="/area" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
              </svg>
              Entrar na Área de Membros
            </a>
            <div className="mm-links">
              {LINKS.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  className={href === "/parcerias" ? "mm-hl" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                  {href === "/parcerias" && <span className="mm-tag">3 modelos</span>}
                </a>
              ))}
            </div>
            <a className="btn btn-primary mm-cta" href="#contato" onClick={() => setOpen(false)}>
              Vamos conversar
            </a>
          </nav>
        </>
      )}
    </>
  );
}
