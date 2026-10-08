"use client";

import { useEffect, useState } from "react";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

// ícones (traço) por segmento — viewBox 24x24
const ICONS = {
  "Imóveis & Construção": ["M3 11l9-7 9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
  "Finanças & Investimentos": ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  "Jurídico": [
    "M12 3v18",
    "M7 21h10",
    "M5 7h14",
    "M5 7l-3 7a3 3 0 0 0 6 0L5 7z",
    "M19 7l-3 7a3 3 0 0 0 6 0l-3-7z",
  ],
  "Marketing & Digital": [
    "M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z",
    "M15 9a4 4 0 0 1 0 6",
    "M18 6a8 8 0 0 1 0 12",
  ],
  "Saúde & Bem-estar": [
    "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z",
  ],
  "Negócios & Empresas": ["M3 8h18v12H3z", "M9 8V5h6v3", "M3 13h18"],
  "Agro & Indústria": [
    "M12 21v-9",
    "M12 12c0-4-3-6-7-6 0 4 3 6 7 6z",
    "M12 15c0-3 2.5-5 6-5 0 3-2.5 5-6 5z",
  ],
  "Gastronomia": ["M6 3v7a3 3 0 0 0 6 0V3", "M9 3v18", "M17 3c-2 2-2 7 0 9v9"],
  "Tecnologia & IA": [
    "M7 7h10v10H7z",
    "M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4",
  ],
};

// feixe levemente curvo do centro (50,50) até o nó
function beam(n, i) {
  const mx = (50 + n.x) / 2;
  const my = (50 + n.y) / 2;
  const dx = n.x - 50;
  const dy = n.y - 50;
  const len = Math.hypot(dx, dy) || 1;
  const k = (i % 2 ? -1 : 1) * 5;
  const cx = mx + (-dy / len) * k;
  const cy = my + (dx / len) * k;
  return `M 50 50 Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${n.x} ${n.y}`;
}

// Hub de segmentos: o Paulo no centro, feixes de luz saindo para cada mercado.
// Os destaques passeiam sozinhos; ao passar o mouse, o segmento assume o foco.
export default function SegmentHub({ nodes }) {
  const [auto, setAuto] = useState(0);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setAuto((a) => (a + 1) % nodes.length), 2200);
    return () => clearInterval(t);
  }, [nodes.length]);

  const active = hover ?? auto;

  return (
    <nav
      className={`hub2 fade-up${hover !== null ? " is-hover" : ""}`}
      aria-label="Segmentos da rede"
    >
      <div className="hub2-wm" aria-hidden="true">
        <span>PK</span>
      </div>

      <svg className="hub2-svg" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="hub2-orbit" cx="50" cy="50" r="40" />
        <circle className="hub2-orbit o2" cx="50" cy="50" r="28" />
        <circle className="hub2-orbit o3" cx="50" cy="50" r="16" />
        {nodes.map((n, i) => (
          <g key={n.label} className={i === active ? "on" : undefined}>
            <path className="hub2-beam" d={beam(n, i)} pathLength="100" />
            <path
              className="hub2-pulse"
              d={beam(n, i)}
              pathLength="100"
              style={{ animationDelay: `${i * 0.32}s` }}
            />
          </g>
        ))}
      </svg>

      <div className="hub2-core" aria-hidden="true">
        <span className="ping" />
        <span className="ping p2" />
        <div className="core">
          <img src="/logo-mark.svg" alt="" />
        </div>
      </div>

      {nodes.map((n, i) => (
        <a
          key={n.label}
          className={`hub2-node${i === active ? " on" : ""}`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
          href={wa(`Olá Paulo! Procuro uma conexão em ${n.label}.`)}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(null)}
        >
          <span className="ico">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {(ICONS[n.label] || []).map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </span>
          {n.label}
        </a>
      ))}
    </nav>
  );
}
