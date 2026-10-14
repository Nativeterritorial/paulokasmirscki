"use client";

import { useState } from "react";

// Foto grande + miniaturas. Setas no teclado e nos botões trocam a foto.
export default function Galeria({ fotos, titulo, reservado }) {
  const [i, setI] = useState(0);
  const n = fotos.length;
  const go = (d) => setI((x) => (x + d + n) % n);

  if (!n) {
    return (
      <div className="vt-gal">
        <div className="vt-gal-main vt-noimg">Fotos em breve</div>
      </div>
    );
  }

  return (
    <div
      className="vt-gal"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div className="vt-gal-main">
        <img src={`/api/foto/${fotos[i]}`} alt={`${titulo} — foto ${i + 1} de ${n}`} />
        {reservado && <span className="vt-badge">Reservado</span>}
        {n > 1 && (
          <>
            <button type="button" className="vt-gal-nav prev" aria-label="Foto anterior" onClick={() => go(-1)}>
              ‹
            </button>
            <button type="button" className="vt-gal-nav next" aria-label="Próxima foto" onClick={() => go(1)}>
              ›
            </button>
            <span className="vt-gal-n">
              {i + 1}/{n}
            </span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="vt-gal-thumbs">
          {fotos.map((f, k) => (
            <button
              type="button"
              key={f}
              className={k === i ? "on" : ""}
              aria-label={`Ver foto ${k + 1}`}
              onClick={() => setI(k)}
            >
              <img src={`/api/foto/${f}`} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
