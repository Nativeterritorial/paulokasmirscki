"use client";

import { useEffect, useState } from "react";
import { SegIcon } from "./segment-icons";

const WHATSAPP = "https://wa.me/5554996505799";
const wa = (msg) => `${WHATSAPP}?text=${encodeURIComponent(msg)}`;

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

  // o fade-up fica num wrapper de classe fixa: o reveal-on-scroll adiciona a
  // classe "in" direto no DOM, e o React a apagaria ao trocar o className aqui
  return (
    <div className="fade-up">
    <nav
      className={`hub2${hover !== null ? " is-hover" : ""}`}
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
            <SegIcon label={n.label} />
          </span>
          {n.label}
        </a>
      ))}
    </nav>
    </div>
  );
}
