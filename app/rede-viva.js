"use client";

import { useEffect, useRef, useState } from "react";
import { SegIcon } from "./segment-icons";

// "A Rede viva": um globo 3D de pontos (estilo constelação, com profundidade).
// 1) Ao aparecer na tela, os pontos soltos se juntam e formam a rede.
// 2) Depois, em repetição, uma história de conexão: alguém pede algo, o sinal
//    vai até o Paulo (centro) e acende os segmentos que formam o time.
// Os segmentos ficam na superfície do globo; passar o mouse acende as ligações
// e clicar abre o concierge com a pergunta pronta. Arrastar gira o globo.

const HISTORIAS = [
  {
    pedido: "Uma empresa precisa construir um pavilhão",
    segs: ["Imóveis & Construção", "Indústria & Móveis", "Finanças & Investimentos"],
  },
  {
    pedido: "Alguém quer abrir o próprio negócio",
    segs: ["Negócios & Empresas", "Marketing & Digital", "Tecnologia & IA"],
  },
  {
    pedido: "Um produtor quer levar a safra mais longe",
    segs: ["Agro & Pecuária", "Transporte & Logística", "Finanças & Investimentos"],
  },
  {
    pedido: "Uma clínica quer crescer e atrair clientes",
    segs: ["Saúde & Bem-estar", "Marketing & Digital", "Imóveis & Construção"],
  },
];
const PASSOS = 4;
const DUR = [1500, 1400, 1700, 2600]; // ms de cada passo da história
const PAUSA = 1600; // girando livre entre uma história e outra

const C1 = [110, 214, 255];
const C2 = [167, 139, 250];
const MINT = [111, 255, 191];
const mix = (t) => C1.map((c, i) => Math.round(c + (C2[i] - c) * t));
const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

// pontos bem espalhados numa esfera (espiral de Fibonacci)
function fibo(n, r, jitter = 0) {
  const out = [];
  const g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rr = Math.sqrt(1 - y * y);
    const th = g * i;
    const k = r * (1 + (Math.random() - 0.5) * jitter);
    out.push({ x: Math.cos(th) * rr * k, y: y * k, z: Math.sin(th) * rr * k });
  }
  return out;
}

export default function RedeViva({ nodes, links = {} }) {
  const wrapRef = useRef(null);
  const cvRef = useRef(null);
  const lblRefs = useRef([]);
  const hoverRef = useRef(-1);
  const [legenda, setLegenda] = useState({ passo: -1, texto: "" });
  const [dica, setDica] = useState("Arraste para girar · passe o mouse num segmento");

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!window.matchMedia("(hover: hover)").matches) setDica("Arraste para girar · toque num segmento");

    let w = 0, h = 0, R = 1, cx = 0, cy = 0;
    let pts = [], edges = [], anchors = [], bokeh = [];
    let rotY = 0.6, rotX = -0.32, vel = 0.0022;
    let raf = 0, visivel = false;
    let montagem = reduz ? 1 : 0, montIni = 0; // 0 → 1: pontos soltos formando o globo
    let hist = { i: 0, ini: 0, ativo: false, origem: null, fimPausa: 0 };
    let ultimoPasso = -2;
    let arrasto = null;

    const N_SEG = nodes.length;

    const montar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h * 0.46;
      R = Math.min(w * 0.36, h * 0.37);

      const pequeno = w < 700;
      const N = pequeno ? 150 : 260;
      // globo base
      // espiral + desvio aleatório: rede orgânica, com espessura (uns pontos mais
      // para dentro, outros mais para fora)
      const base = fibo(N, 1).map((p) => {
        const v = { x: p.x + (Math.random() - 0.5) * 0.2, y: p.y + (Math.random() - 0.5) * 0.2, z: p.z + (Math.random() - 0.5) * 0.2 };
        const k = (0.86 + Math.random() * 0.24) / Math.hypot(v.x, v.y, v.z);
        return { x: v.x * k, y: v.y * k, z: v.z * k };
      });
      // âncoras dos segmentos (bem distribuídas) + um aglomerado em volta de cada
      const anc = fibo(N_SEG, 1).map((p, i) => ({ ...p, seg: i }));
      const cluster = [];
      anc.forEach((a) => {
        for (let k = 0; k < (pequeno ? 4 : 6); k++) {
          const v = { x: a.x + (Math.random() - 0.5) * 0.22, y: a.y + (Math.random() - 0.5) * 0.22, z: a.z + (Math.random() - 0.5) * 0.22 };
          const l = Math.hypot(v.x, v.y, v.z);
          cluster.push({ x: v.x / l, y: v.y / l, z: v.z / l, seg: a.seg, mini: true });
        }
      });
      pts = [...base, ...cluster, ...anc].map((p) => ({
        ...p,
        // posição inicial "solta" (contatos parados), longe e espalhada
        sx: (Math.random() - 0.5) * 4.2,
        sy: (Math.random() - 0.5) * 2.6,
        sz: (Math.random() - 0.5) * 3,
        atraso: Math.random() * 0.45,
        tw: Math.random() * Math.PI * 2,
      }));
      anchors = pts.filter((p) => p.seg !== undefined && !p.mini);
      anchors.sort((a, b) => a.seg - b.seg);

      // ligações: cada ponto com os 3 vizinhos mais próximos (sem repetir)
      const seen = new Set();
      edges = [];
      for (let i = 0; i < pts.length; i++) {
        const d = [];
        for (let j = 0; j < pts.length; j++) {
          if (i === j) continue;
          const a = pts[i], b = pts[j];
          d.push([(a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2, j]);
        }
        d.sort((p, q) => p[0] - q[0]);
        for (let k = 0; k < 3; k++) {
          const j = d[k][1];
          const key = i < j ? i + "-" + j : j + "-" + i;
          if (!seen.has(key)) {
            seen.add(key);
            const sa = pts[i].seg, sb = pts[j].seg;
            edges.push([i, j, sa !== undefined && sa === sb ? sa : -1]);
          }
        }
      }
      // poeira de luz ao fundo (bokeh)
      bokeh = Array.from({ length: pequeno ? 18 : 34 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 2 + Math.random() * 9,
        a: 0.04 + Math.random() * 0.1,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        c: Math.random() < 0.25 ? [255, 200, 140] : mix(Math.random()),
      }));
    };

    // gira e projeta um ponto 3D (raio 1) na tela
    const proj = (x, y, z) => {
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      let X = x * cY - z * sY;
      let Z = x * sY + z * cY;
      const cX = Math.cos(rotX), sX = Math.sin(rotX);
      const Y = y * cX - Z * sX;
      Z = y * sX + Z * cX;
      const D = 3.2;
      Z = Math.min(Z, 2.4); // ponto solto muito perto da câmera
      const s = (R * D) / (D - Z);
      return { x: cx + X * s, y: cy + Y * s, z: Z, t: Math.min(1, Math.max(0, (Z + 1) / 2)), s: s / R };
    };

    const posDe = (p, m) => {
      const k = ease((m - p.atraso) / (1 - p.atraso));
      return proj(p.sx + (p.x - p.sx) * k, p.sy + (p.y - p.sy) * k, p.sz + (p.z - p.sz) * k);
    };

    const passoDa = (t) => {
      if (!hist.ativo) return -1;
      let e = t - hist.ini;
      for (let i = 0; i < PASSOS; i++) {
        if (e < DUR[i]) return i + e / DUR[i] / 10; // inteiro = passo, fração = progresso/10
        e -= DUR[i];
      }
      return PASSOS;
    };

    const quadro = (t) => {
      ctx.clearRect(0, 0, w, h);

      // montagem (uma vez, quando a seção aparece)
      if (montagem < 1 && montIni) montagem = Math.min(1, (t - montIni) / 2600);
      const m = montagem;

      // história: começa depois da montagem e da pausa
      if (!reduz && m >= 1) {
        if (!hist.ativo && t > hist.fimPausa) {
          // origem: um ponto comum do globo, do lado da frente
          const frente = pts
            .map((p, i) => [proj(p.x, p.y, p.z), i])
            .filter(([q, i]) => q.t > 0.7 && pts[i].seg === undefined);
          const pick = frente[Math.floor(Math.random() * frente.length)];
          hist = { ...hist, ativo: true, ini: t, origem: pick ? pick[1] : 0 };
        }
      }
      const ps = passoDa(t);
      const passo = Math.floor(ps);
      const prog = ps < 0 ? 0 : (ps - passo) * 10;
      const H = HISTORIAS[hist.i % HISTORIAS.length];
      const time = hist.ativo ? H.segs.map((s) => nodes.findIndex((n) => n.label === s)).filter((i) => i >= 0) : [];
      if (hist.ativo && passo >= PASSOS) {
        hist = { ...hist, ativo: false, i: hist.i + 1, fimPausa: t + PAUSA };
      }
      // legenda segue o passo
      const passoVis = hist.ativo ? Math.min(passo, PASSOS - 1) : -1;
      if (passoVis !== ultimoPasso) {
        ultimoPasso = passoVis;
        const nomes = H.segs.join(", ").replace(/, ([^,]*)$/, " e $1");
        const textos = [H.pedido, "O pedido chega ao Paulo", `A rede monta o time: ${nomes}`, "Negócio fechado ✓"];
        setLegenda({ passo: passoVis, texto: passoVis >= 0 ? textos[passoVis] : "" });
      }

      // rotação: livre, mais lenta durante a história
      if (!reduz && !arrasto) {
        const alvo = hist.ativo ? 0.0006 : 0.0022;
        vel += (alvo - vel) * 0.04;
        rotY += vel;
      }

      // poeira ao fundo
      for (const b of bokeh) {
        if (!reduz) {
          b.x += b.vx;
          b.y += b.vy;
          if (b.x < -20) b.x = w + 20;
          if (b.x > w + 20) b.x = -20;
          if (b.y < -20) b.y = h + 20;
          if (b.y > h + 20) b.y = -20;
        }
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.a})`);
        g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const P = pts.map((p) => posDe(p, m));
      const hov = hoverRef.current;
      const acesos = new Set(hov >= 0 ? [hov] : passo >= 2 ? time : []);
      const centro = proj(0, 0, 0);

      // brilho do núcleo (o Paulo no centro)
      const gc = ctx.createRadialGradient(centro.x, centro.y, 0, centro.x, centro.y, R * 0.55);
      gc.addColorStop(0, `rgba(110,214,255,${0.22 * m})`);
      gc.addColorStop(1, "rgba(110,214,255,0)");
      ctx.fillStyle = gc;
      ctx.beginPath();
      ctx.arc(centro.x, centro.y, R * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // ligações do globo
      ctx.lineWidth = 1;
      const fadeLig = Math.pow(m, 2.2);
      for (const [i, j, seg] of edges) {
        const a = P[i], b = P[j];
        const dt = (a.t + b.t) / 2;
        let al = (0.05 + dt * 0.42) * fadeLig;
        let cor = mix(1 - dt);
        if (seg >= 0 && acesos.has(seg)) {
          cor = MINT;
          al = Math.min(1, al * 2.4 + 0.2);
        }
        ctx.strokeStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${al})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // raios do centro até os segmentos (fracos; acendem no time ou no mouse)
      anchors.forEach((a) => {
        const q = P[pts.indexOf(a)];
        const on = acesos.has(a.seg);
        const al = (on ? 0.85 : 0.05 + q.t * 0.08) * fadeLig;
        const cor = on ? MINT : C1;
        ctx.strokeStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${al})`;
        ctx.lineWidth = on ? 1.6 : 0.8;
        ctx.beginPath();
        ctx.moveTo(centro.x, centro.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      });
      ctx.lineWidth = 1;

      // pontos, com profundidade (os de trás pequenos e desfocados)
      const ordem = P.map((q, i) => i).sort((a, b) => P[a].z - P[b].z);
      for (const i of ordem) {
        const q = P[i], p = pts[i];
        const tw = reduz ? 1 : 0.75 + 0.25 * Math.sin(t / 700 + p.tw);
        const cor = p.seg !== undefined && acesos.has(p.seg) ? MINT : mix(1 - q.t);
        const anc = p.seg !== undefined && !p.mini;
        const r = (anc ? 3.4 : p.mini ? 1.9 : 1.5) * (0.55 + q.t * 0.9);
        const al = (0.18 + q.t * 0.82) * tw * (0.35 + 0.65 * m);
        if (q.t < 0.38) {
          // desfocado: um disco maior e suave
          const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 3);
          g.addColorStop(0, `rgba(${cor[0]},${cor[1]},${cor[2]},${al * 0.5})`);
          g.addColorStop(1, `rgba(${cor[0]},${cor[1]},${cor[2]},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(q.x, q.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(${cor[0]},${cor[1]},${cor[2]},${al * 0.25})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, r * (anc ? 3.6 : 2.8), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${Math.min(255, cor[0] + 60)},${Math.min(255, cor[1] + 40)},255,${al})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // a história: sinais correndo
      const sinal = (a, b, k, forte = 1) => {
        const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k;
        ctx.strokeStyle = `rgba(111,255,191,${0.55 * forte})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.lineWidth = 1;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
        g.addColorStop(0, `rgba(220,255,240,${forte})`);
        g.addColorStop(0.3, `rgba(111,255,191,${0.6 * forte})`);
        g.addColorStop(1, "rgba(111,255,191,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
      };
      const pulso = (q, k) => {
        const rr = 6 + k * 26;
        ctx.strokeStyle = `rgba(111,255,191,${1 - k})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(q.x, q.y, rr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      };
      if (hist.ativo && hist.origem !== null) {
        const o = P[hist.origem];
        const ancP = time.map((s) => P[pts.indexOf(anchors[s])]);
        if (passo === 0) {
          pulso(o, (prog * 2) % 1);
          sinal(o, o, 0, 0.9);
        }
        if (passo === 1) sinal(o, centro, ease(prog));
        if (passo >= 1) {
          ctx.strokeStyle = `rgba(111,255,191,${passo === 1 ? 0.3 : 0.6})`;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(o.x, o.y);
          ctx.lineTo(centro.x, centro.y);
          ctx.stroke();
          ctx.lineWidth = 1;
        }
        if (passo === 2) ancP.forEach((q) => sinal(centro, q, ease(prog)));
        if (passo === 3) {
          ancP.forEach((q) => pulso(q, (prog * 1.6) % 1));
          pulso(o, (prog * 1.6) % 1);
        }
      }

      // rótulos dos segmentos (HTML) seguem o globo
      anchors.forEach((a) => {
        const el = lblRefs.current[a.seg];
        if (!el) return;
        const q = P[pts.indexOf(a)];
        const lado = q.x < centro.x ? -1 : 1;
        const vis = Math.max(0, (m - 0.75) / 0.25);
        // posição: ao lado do ponto, sem sair da moldura
        const sc = 0.78 + q.t * 0.3;
        const lw = (el.offsetWidth || 120) * sc;
        let x0 = lado < 0 ? q.x - 14 - lw : q.x + 14;
        x0 = Math.max(6, Math.min(w - lw - 6, x0));
        el.style.transform = `translate(${x0}px, ${q.y}px) translateY(-50%) scale(${sc})`;
        el.style.transformOrigin = "left center";
        // segmento do time (ou com o mouse) fica sempre bem visível, mesmo atrás
        el.style.opacity = String(vis * (acesos.has(a.seg) ? 1 : 0.18 + q.t * 0.82));
        el.style.zIndex = String(acesos.has(a.seg) ? 200 : Math.round(q.t * 100));
        el.style.pointerEvents = q.t > 0.45 && vis > 0.9 ? "auto" : "none";
        el.classList.toggle("on", acesos.has(a.seg));
      });
    };

    const loop = (t) => {
      quadro(t);
      raf = visivel && !reduz ? requestAnimationFrame(loop) : 0;
    };

    montar();
    quadro(performance.now());

    const io = new IntersectionObserver(
      ([e]) => {
        visivel = e.isIntersecting;
        if (visivel) {
          if (!montIni) montIni = performance.now();
          if (!raf && !reduz) raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0.25 }
    );
    io.observe(wrap);

    let tm;
    const ro = new ResizeObserver(() => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        montar();
        quadro(performance.now());
      }, 150);
    });
    ro.observe(wrap);

    // arrastar para girar
    const down = (e) => {
      if (e.target.closest(".rv-lbl")) return;
      arrasto = { x: e.clientX, y: e.clientY, rx: rotY, ry: rotX };
      wrap.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      if (!arrasto) return;
      rotY = arrasto.rx + (e.clientX - arrasto.x) * 0.006;
      rotX = Math.max(-1, Math.min(0.6, arrasto.ry + (e.clientY - arrasto.y) * 0.004));
      if (reduz) quadro(performance.now());
    };
    const up = () => {
      arrasto = null;
    };
    wrap.addEventListener("pointerdown", down);
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerup", up);
    wrap.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearTimeout(tm);
      wrap.removeEventListener("pointerdown", down);
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerup", up);
      wrap.removeEventListener("pointercancel", up);
    };
  }, [nodes]);

  return (
    <div className="rv-wrap fade-up" ref={wrapRef}>
      <canvas ref={cvRef} className="rv-canvas" aria-hidden="true" />
      <div className="rv-core" aria-hidden="true">
        <img src="/logo-mark.svg" alt="" />
      </div>
      <nav className="rv-lbls" aria-label="Segmentos da rede">
        {nodes.map((n, i) => (
          <a
            key={n.label}
            ref={(el) => (lblRefs.current[i] = el)}
            className="rv-lbl"
            href={links[n.label] || "/area"}
            onMouseEnter={() => (hoverRef.current = i)}
            onMouseLeave={() => (hoverRef.current = -1)}
            onFocus={() => (hoverRef.current = i)}
            onBlur={() => (hoverRef.current = -1)}
          >
            <span className="ico">
              <SegIcon label={n.label} size={13} />
            </span>
            {n.label}
          </a>
        ))}
      </nav>
      <div className="rv-legenda" aria-live="polite">
        <div className="rv-passos" aria-hidden="true">
          {Array.from({ length: PASSOS }, (_, i) => (
            <i key={i} className={i <= legenda.passo ? "on" : undefined} />
          ))}
        </div>
        <p className={legenda.passo === PASSOS - 1 ? "fechado" : undefined}>
          {legenda.texto || dica}
        </p>
      </div>
    </div>
  );
}
