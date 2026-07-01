"use client";

import { useState } from "react";

// Mapa estilizado da rede (v1). Posições em coordenadas do viewBox (1000x640),
// dispostas para sugerir a geografia: Serra Gaúcha em cima, Porto Alegre embaixo,
// alcance internacional à direita. As CIDADES são um primeiro palpite — fáceis de
// ajustar depois (é só mudar aqui).
const HUB = {
  id: "pk",
  nome: "Paulo Kasmirscki",
  seg: "Conector de negócios",
  cidade: "Veranópolis · RS",
  x: 470,
  y: 300,
};

const NODES = [
  { id: "native", nome: "NATIVE", seg: "Inteligência Territorial", cidade: "Veranópolis · RS", x: 300, y: 175 },
  { id: "ordeclean", nome: "Ordeclean", seg: "Agro & Pecuária", cidade: "Serra Gaúcha · RS", x: 440, y: 130 },
  { id: "rapadura", nome: "Rapadura da Serra Gaúcha", seg: "Alimentação & Doces", cidade: "Cotiporã · RS", x: 590, y: 150 },
  { id: "bigwolf", nome: "Big Wolf", seg: "Moda & Vestuário", cidade: "Loja online", x: 710, y: 200 },
  { id: "pulse", nome: "Pulse Jiu-Jitsu", seg: "Esporte & Lazer", cidade: "Veranópolis · RS", x: 690, y: 300 },
  { id: "mutalys", nome: "Mutalys", seg: "Gestão & Consultoria", cidade: "Serra Gaúcha · RS", x: 680, y: 400 },
  { id: "serafin", nome: "Serafin Suplementos", seg: "Saúde & Suplementos", cidade: "Veranópolis · RS", x: 600, y: 460 },
  { id: "gazzana", nome: "Gazzana & Maragno", seg: "Jurídico", cidade: "Veranópolis · RS", x: 470, y: 480 },
  { id: "visara", nome: "Visara Digital", seg: "Marketing & Digital", cidade: "Serra Gaúcha · RS", x: 340, y: 460 },
  { id: "gilioli", nome: "Gilioli", seg: "Contabilidade", cidade: "Serra Gaúcha · RS", x: 250, y: 380 },
  { id: "alsus", nome: "Grupo ALSUS", seg: "Construção & Infra", cidade: "Serra Gaúcha · RS", x: 220, y: 280 },
  { id: "agetra", nome: "Agetra Gráfica", seg: "Gráfica & Impressão", cidade: "Caxias do Sul · RS", x: 250, y: 220 },
  // Porto Alegre (embaixo)
  { id: "mbx", nome: "MBX Global Services", seg: "Logística & Comércio Exterior", cidade: "Porto Alegre · RS", x: 470, y: 590, intl: true },
  { id: "rbs", nome: "Grupo RBS", seg: "Mídia & Comunicação", cidade: "Porto Alegre · RS", x: 360, y: 575 },
  // Alcance internacional (direita)
  { id: "exatus", nome: "Exatus Gene", seg: "Saúde & Genética", cidade: "Alcance internacional", x: 905, y: 150, intl: true },
];

// destino "mundo" para os arcos internacionais
const WORLD = { x: 940, y: 470 };

function arcPath(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - 90;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export default function NetworkMap() {
  const [sel, setSel] = useState(null);
  const active = sel || HUB;

  return (
    <div className="netmap">
      <svg
        className="netmap-svg"
        viewBox="0 0 1000 640"
        role="img"
        aria-label="Mapa da rede de empresas do Paulo Kasmirscki"
      >
        <defs>
          <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8ab0ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8ab0ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* linhas: Paulo (hub) -> cada empresa */}
        {NODES.map((n) => (
          <line
            key={`l-${n.id}`}
            className={`netmap-line${active.id === n.id ? " on" : ""}`}
            x1={HUB.x}
            y1={HUB.y}
            x2={n.x}
            y2={n.y}
          />
        ))}

        {/* arcos internacionais (alcance no mundo) */}
        {NODES.filter((n) => n.intl).map((n) => (
          <path
            key={`a-${n.id}`}
            className="netmap-arc"
            d={arcPath(n, WORLD)}
            fill="none"
          />
        ))}
        <g className="netmap-world">
          <circle cx={WORLD.x} cy={WORLD.y} r="7" />
          <text x={WORLD.x} y={WORLD.y + 26} textAnchor="middle">
            mundo
          </text>
        </g>

        {/* glow + hub do Paulo */}
        <circle cx={HUB.x} cy={HUB.y} r="90" fill="url(#hubGlow)" />
        <g
          className={`netmap-hub${active.id === HUB.id ? " sel" : ""}`}
          onClick={() => setSel(null)}
          onMouseEnter={() => setSel(null)}
        >
          <circle className="netmap-hub-pulse" cx={HUB.x} cy={HUB.y} r="16" />
          <circle className="netmap-hub-dot" cx={HUB.x} cy={HUB.y} r="11" />
          <text x={HUB.x} y={HUB.y - 24} textAnchor="middle">
            Paulo
          </text>
        </g>

        {/* nós das empresas */}
        {NODES.map((n) => (
          <g
            key={n.id}
            className={`netmap-node${active.id === n.id ? " sel" : ""}`}
            onClick={() => setSel(n)}
            onMouseEnter={() => setSel(n)}
            tabIndex={0}
            onFocus={() => setSel(n)}
          >
            <circle cx={n.x} cy={n.y} r="18" className="netmap-hit" />
            <circle cx={n.x} cy={n.y} r="6.5" className="netmap-dot" />
            <text
              x={n.x}
              y={n.y < 120 ? n.y - 14 : n.y + 24}
              textAnchor="middle"
              className="netmap-label"
            >
              {n.nome.length > 20 ? n.nome.slice(0, 18) + "…" : n.nome}
            </text>
          </g>
        ))}
      </svg>

      {/* card da empresa/hub selecionada */}
      <div className="netmap-card" aria-live="polite">
        <div className="nm-city">📍 {active.cidade}</div>
        <div className="nm-name">{active.nome}</div>
        <div className="nm-seg">{active.seg}</div>
        {active.id !== "pk" ? (
          <a className="nm-link" href={`/rede/${active.id}`}>
            Conhecer a empresa →
          </a>
        ) : (
          <div className="nm-hub-tag">O conector da rede</div>
        )}
        <div className="nm-hint">Passe o mouse (ou toque) nos pontos do mapa</div>
      </div>
    </div>
  );
}
