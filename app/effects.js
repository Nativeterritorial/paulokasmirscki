"use client";

import { useEffect } from "react";

export default function Effects() {
  useEffect(() => {
    // Reveal on scroll (fade-up) + staggered hero words
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    document
      .querySelectorAll(".fade-up, .reveal")
      .forEach((el) => io.observe(el));

    // Staggered delay for hero words
    document.querySelectorAll(".reveal").forEach((r) => {
      r.querySelectorAll(".w").forEach((w, i) => {
        w.style.transitionDelay = i * 110 + "ms";
      });
    });

    // Cursor glow that follows the pointer (desktop only)
    const glow = document.getElementById("cursor-glow");
    const onMove = (e) => {
      if (!glow) return;
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine) window.addEventListener("mousemove", onMove);

    // Animated count-up for hero stats
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      const dur = 1400;
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(eased * target);
        el.textContent = prefix + val.toLocaleString("pt-BR") + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const countIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            countIO.unobserve(e.target);
          }
        }),
      { threshold: 0.6 }
    );
    document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

    return () => {
      io.disconnect();
      countIO.disconnect();
      if (fine) window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return null;
}
