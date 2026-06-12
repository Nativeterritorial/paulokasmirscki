"use client";

import { useEffect, useState } from "react";

// embaralha (Fisher-Yates) sem mutar o original
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Carrossel de marcas com ordem aleatória a cada visita.
// Renderiza primeiro na ordem original (evita divergência de hidratação) e,
// logo após montar, reembaralha no cliente.
export default function BrandsCarousel({ brands }) {
  const [order, setOrder] = useState(brands);

  useEffect(() => {
    setOrder(shuffle(brands));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="brands-carousel fade-up">
      <div className="bc-track">
        {[0, 1].map((dup) =>
          order.map((b) => (
            <a
              className="brand-card"
              key={`${dup}-${b.id}`}
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={dup === 1 ? "true" : undefined}
              tabIndex={dup === 1 ? -1 : undefined}
            >
              <div className="logo-slot">{b.logo}</div>
              <div className="b-role">{b.role}</div>
              <p className="b-desc">{b.desc}</p>
              <span className="b-link">{b.link}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
