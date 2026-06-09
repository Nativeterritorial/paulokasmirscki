"use client";

import { useEffect, useState } from "react";

const EXAMPLES = [
  { q: "preciso de um contador", a: "Gilioli", emoji: "📊" },
  { q: "quero fazer um site", a: "Visara Digital", emoji: "🚀" },
  { q: "quero treinar jiu-jitsu", a: "Pulse Jiu-Jitsu", emoji: "🥋" },
  { q: "preciso imprimir cartões", a: "Agetra Gráfica", emoji: "🖨️" },
  { q: "terreno pra regularizar", a: "NATIVE", emoji: "🗺️" },
  { q: "terraplenagem pro loteamento", a: "Grupo ALSUS", emoji: "🏗️" },
];

export default function HeroAI() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | answer | hold | clearing

  useEffect(() => {
    const ex = EXAMPLES[idx];
    let t;

    if (phase === "typing") {
      if (typed.length < ex.q.length) {
        t = setTimeout(() => setTyped(ex.q.slice(0, typed.length + 1)), 55);
      } else {
        t = setTimeout(() => setPhase("answer"), 450);
      }
    } else if (phase === "answer") {
      t = setTimeout(() => setPhase("hold"), 1700);
    } else if (phase === "hold") {
      t = setTimeout(() => setPhase("clearing"), 600);
    } else if (phase === "clearing") {
      if (typed.length > 0) {
        t = setTimeout(() => setTyped(typed.slice(0, -1)), 24);
      } else {
        setIdx((i) => (i + 1) % EXAMPLES.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(t);
  }, [typed, phase, idx]);

  const ex = EXAMPLES[idx];
  const showAnswer = phase === "answer" || phase === "hold";

  return (
    <div className="hero-ai">
      <div className="hero-ai-badge">
        <span className="hai-dot" />
        Concierge de IA da rede
        <span className="hai-new">novo</span>
      </div>
      <div className="hero-ai-demo">
        <div className="hai-row">
          <span className="hai-tag">você</span>
          <span className="hai-q">
            {typed}
            <span className="hai-caret" />
          </span>
        </div>
        <div className={`hai-row hai-ans ${showAnswer ? "on" : ""}`}>
          <span className="hai-tag ia">IA</span>
          <span className="hai-a">
            conecto você com <strong>{ex.a}</strong> {ex.emoji}
          </span>
        </div>
      </div>
      <a className="hero-ai-cta" href="/area">
        Falar com a IA da rede →
      </a>
    </div>
  );
}
