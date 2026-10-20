"use client";

import { useEffect, useState } from "react";
import { SegIcon } from "./segment-icons";
import NetworkBG from "./network-bg";

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

// Malha que interliga os segmentos (mesmo estilo da rede animada do topo):
// entre cada par de segmentos vizinhos há dois pontos (um por fora, um por
// dentro) e algumas ligações cruzam o círculo de um mercado a outro.
const P = (ang, r) => ({ x: +(50 + Math.cos(ang) * r).toFixed(2), y: +(50 + Math.sin(ang) * r).toFixed(2) });
function malha(nodes) {
  const n = nodes.length;
  const ang = nodes.map((nd) => Math.atan2(nd.y - 50, nd.x - 50));
  const pontos = [];
  const ligs = []; // [a, b, segmentos envolvidos]
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    let d = ang[j] - ang[i];
    if (d < 0) d += Math.PI * 2;
    const meio = ang[i] + d / 2;
    const fora = P(meio, 47);
    const dentro = P(meio + (i % 2 ? 0.08 : -0.08), 30);
    pontos.push(fora, dentro);
    ligs.push([nodes[i], fora, [i]], [fora, nodes[j], [j]], [nodes[i], dentro, [i]], [dentro, nodes[j], [j]], [fora, dentro, []]);
    // de um mercado a outro, atravessando a rede
    ligs.push([nodes[i], nodes[(i + 3) % n], [i, (i + 3) % n]]);
  }
  // pontos de dentro ligados entre si (um anel interno em volta do Paulo)
  for (let i = 0; i < n; i++) ligs.push([pontos[i * 2 + 1], pontos[((i + 1) % n) * 2 + 1], []]);
  return { pontos, ligs };
}
const linha = (a, b) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

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
  const { pontos, ligs } = malha(nodes);
  // sinais que correm pela malha (uma conexão entre mercados acontecendo)
  const sinais = ligs.filter((_, k) => k % 3 === 0);

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

      <NetworkBG className="hub2-net" densidade={0.55} />

      <svg className="hub2-svg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="hubmesh" gradientUnits="userSpaceOnUse" x1="10" y1="10" x2="90" y2="90">
            <stop offset="0" stopColor="#6ed6ff" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <g className="hub2-mesh">
          {ligs.map(([a, b, segs], k) => (
            <path
              key={k}
              d={linha(a, b)}
              className={segs.includes(active) ? "on" : segs.length === 2 ? "cross" : undefined}
            />
          ))}
        </g>
        <g className="hub2-dots">
          {pontos.map((pt, k) => (
            <g key={k} style={{ animationDelay: `${(k % 7) * 0.45}s` }}>
              <circle className="glow" cx={pt.x} cy={pt.y} r="1.5" />
              <circle cx={pt.x} cy={pt.y} r="0.55" />
            </g>
          ))}
        </g>
        <g className="hub2-sig">
          {sinais.map(([a, b], k) => (
            <g key={k}>
              <circle className="glow" r="1.4">
                <animateMotion dur="2.6s" begin={`${k * 0.55}s`} repeatCount="indefinite" path={linha(a, b)} />
              </circle>
              <circle r="0.5">
                <animateMotion dur="2.6s" begin={`${k * 0.55}s`} repeatCount="indefinite" path={linha(a, b)} />
              </circle>
            </g>
          ))}
        </g>
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
