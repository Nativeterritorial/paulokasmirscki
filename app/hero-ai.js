"use client";

import { useEffect, useState } from "react";

// cada exemplo mostra um caminho diferente do Ecossistema PK
const EXAMPLES = [
  { q: "preciso de um eletricista", a: <>Achei profissionais de confiança na rede. Peça sua <strong>Chave PK</strong> 🔑</> },
  { q: "quero abrir uma loja", a: <>Monto o seu <strong>time</strong>: contador, arquiteto e marketing, com o Paulo conduzindo 🤝</> },
  { q: "vou construir minha casa", a: <>Isso é com o <strong>Do Terreno às Chaves</strong> 🏗️</> },
  { q: "estou contratando", a: <>Publique a vaga no <strong>Mural</strong>: ela aparece também em /vagas 📌</> },
  { q: "quero vender meu imóvel", a: <>O <strong>Paulo cuida da venda</strong>, e quem indica ganha bonificação 🏡</> },
];

// atalhos: entram na área com a pergunta já escrita
const ATALHOS = [
  { label: "🔌 eletricista", q: "Preciso de um eletricista" },
  { label: "🏪 abrir uma loja", q: "Quero abrir uma loja" },
  { label: "💼 vagas", q: "Estou contratando, quero divulgar uma vaga" },
];
const linkPergunta = (q) => `/area?pergunta=${encodeURIComponent(q)}`;

export default function HeroAI() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | thinking | answer | clearing

  useEffect(() => {
    const ex = EXAMPLES[idx];
    let t;

    if (phase === "typing") {
      if (typed.length < ex.q.length) {
        t = setTimeout(() => setTyped(ex.q.slice(0, typed.length + 1)), 55);
      } else {
        t = setTimeout(() => setPhase("thinking"), 250);
      }
    } else if (phase === "thinking") {
      t = setTimeout(() => setPhase("answer"), 900);
    } else if (phase === "answer") {
      t = setTimeout(() => setPhase("clearing"), 2600);
    } else if (phase === "clearing") {
      if (typed.length > 0) {
        t = setTimeout(() => setTyped(typed.slice(0, -1)), 22);
      } else {
        setIdx((i) => (i + 1) % EXAMPLES.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(t);
  }, [typed, phase, idx]);

  const ex = EXAMPLES[idx];

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
            {phase === "typing" && <span className="hai-caret" />}
          </span>
        </div>
        <div className={`hai-row hai-ans ${phase !== "typing" ? "on" : ""}`}>
          <span className="hai-tag ia">IA</span>
          {phase === "answer" ? (
            <span className="hai-a">{ex.a}</span>
          ) : (
            <span className="hai-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      </div>
      <div className="hai-atalhos">
        <span>Experimente:</span>
        {ATALHOS.map((a) => (
          <a key={a.q} href={linkPergunta(a.q)}>
            {a.label}
          </a>
        ))}
      </div>
      <a className="hero-ai-cta" href="/area">
        <span className="hai-cta-icon">✦</span>
        Falar com a IA da rede
        <span className="hai-cta-arrow">→</span>
      </a>
      <p className="hai-sub">Grátis · cadastro em 1 minuto</p>
    </div>
  );
}
