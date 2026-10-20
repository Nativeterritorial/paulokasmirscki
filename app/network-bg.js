"use client";

import { useEffect, useRef } from "react";

// Fundo animado de rede: pontos que se movem devagar e se ligam quando ficam
// perto. Nas cores da marca (azul-claro → lilás). Pausa fora da tela, usa
// menos pontos no celular e fica parado para quem pede menos animação.
const C1 = [110, 214, 255]; // azul-claro
const C2 = [167, 139, 250]; // lilás
const mix = (t) => C1.map((c, i) => Math.round(c + (C2[i] - c) * t));

export default function NetworkBG({ className = "", densidade = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const host = cv.parentElement;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const comMouse = window.matchMedia("(hover: hover)").matches;

    let w = 0, h = 0, pts = [], raf = 0, visivel = false;
    const mouse = { x: -9999, y: -9999 };
    let sinais = []; // brilho que corre por uma ligação
    let proxSinal = 0;

    const montar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = w < 700 ? 15000 : 10500;
      const n = Math.round(Math.min(120, (w * h) / area) * densidade);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.8 + 1.1,
      }));
      sinais = [];
    };

    const quadro = (t) => {
      ctx.clearRect(0, 0, w, h);
      const L = w < 700 ? 95 : 135;
      const L2 = L * L;

      if (!reduz) {
        for (const p of pts) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -20) p.x = w + 20;
          else if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          else if (p.y > h + 20) p.y = -20;
        }
      }

      // ligações entre pontos próximos
      const pares = [];
      ctx.lineWidth = 1.1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < L2) {
            const al = (1 - Math.sqrt(d2) / L) * 0.85;
            const [r, g, bl] = mix((a.x + b.x) / 2 / w);
            ctx.strokeStyle = `rgba(${r},${g},${bl},${al})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            if (al > 0.35) pares.push([a, b]);
          }
        }
        // o visitante entra na rede: pontos perto do mouse se ligam a ele
        const mx = a.x - mouse.x, my = a.y - mouse.y;
        const md2 = mx * mx + my * my;
        if (md2 < L2 * 1.6) {
          const al = (1 - Math.sqrt(md2) / (L * 1.26)) * 0.7;
          ctx.strokeStyle = `rgba(200,235,255,${al})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // pontos com brilho
      for (const p of pts) {
        const [r, g, b] = mix(p.x / w);
        ctx.fillStyle = `rgba(${r},${g},${b},0.22)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${Math.min(255, r + 70)},${Math.min(255, g + 40)},255,0.95)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // de vez em quando, um sinal percorre uma ligação (uma conexão acontecendo)
      if (!reduz) {
        if (t > proxSinal && pares.length) {
          const [a, b] = pares[Math.floor(Math.random() * pares.length)];
          sinais.push({ a, b, ini: t });
          proxSinal = t + 450 + Math.random() * 700;
        }
        sinais = sinais.filter((s) => t - s.ini < 1100);
        for (const s of sinais) {
          const k = (t - s.ini) / 1100;
          const x = s.a.x + (s.b.x - s.a.x) * k;
          const y = s.a.y + (s.b.y - s.a.y) * k;
          const al = Math.sin(k * Math.PI);
          ctx.fillStyle = `rgba(111,255,191,${0.25 * al})`;
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(220,255,240,${al})`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (t) => {
      quadro(t);
      raf = visivel && !reduz ? requestAnimationFrame(loop) : 0;
    };
    const iniciar = () => {
      if (!raf && !reduz) raf = requestAnimationFrame(loop);
    };

    montar();
    quadro(0);

    const io = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      if (visivel) iniciar();
    });
    io.observe(cv);

    let tm;
    const ro = new ResizeObserver(() => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        montar();
        quadro(performance.now());
      }, 120);
    });
    ro.observe(cv);

    const onMove = (e) => {
      const b = cv.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };
    if (comMouse && host) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      clearTimeout(tm);
      if (host) {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [densidade]);

  return <canvas ref={ref} className={`net-bg ${className}`} aria-hidden="true" />;
}
