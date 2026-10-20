"use client";

import { useEffect, useRef, useState } from "react";

// Mapa da rede: um ponto por cidade (com o número de empresas), todos ligados
// a Veranópolis, a base do Paulo. Clicar numa cidade mostra as empresas dela,
// com o link para a página da empresa e para abrir no Google Maps.
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function carregarLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = LEAFLET_CSS;
    document.head.appendChild(l);
  }
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = LEAFLET_JS;
    s.onload = () => res(window.L);
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const gmaps = (nome, cidade) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome} ${cidade}`)}`;

export default function MapaRede({ grupos, base = "Veranópolis" }) {
  const ref = useRef(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let mapa;
    let vivo = true;
    carregarLeaflet()
      .then((L) => {
        if (!vivo || !ref.current) return;
        mapa = L.map(ref.current, {
          scrollWheelZoom: false,
          zoomSnap: 0.25,
          zoomControl: true,
          attributionControl: true,
        });
        // OpenStreetMap (gratuito); as cores são escurecidas no CSS (.mr-tiles)
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
          className: "mr-tiles",
        }).addTo(mapa);

        const hub = grupos.find((g) => g.cidade === base);
        // ligações: de Veranópolis para cada cidade da rede
        grupos.forEach((g) => {
          if (!hub || g === hub) return;
          L.polyline([hub.pos, g.pos], { className: "mr-linha", weight: 2, interactive: false }).addTo(mapa);
        });

        grupos.forEach((g) => {
          const n = g.empresas.length;
          const tam = g === hub ? 56 : Math.min(46, 24 + Math.sqrt(n) * 6);
          const icon = L.divIcon({
            className: "",
            html: g === hub
              ? `<div class="mr-pin mr-hub" style="--t:${tam}px"><img src="/logo-mark.svg" alt=""/><b>${n}</b></div>`
              : `<div class="mr-pin" style="--t:${tam}px"><b>${n}</b></div>`,
            iconSize: [tam, tam],
            iconAnchor: [tam / 2, tam / 2],
          });
          const lista = g.empresas
            .map(
              (e) => `<li><a href="/rede/${esc(e.id)}">${esc(e.nome)}</a><span>${esc(e.segmento)}</span>
                <a class="mr-gm" href="${gmaps(e.nome, g.cidade)}" target="_blank" rel="noopener noreferrer">Google Maps ↗</a></li>`
            )
            .join("");
          L.marker(g.pos, { icon, title: g.cidade })
            .addTo(mapa)
            .bindTooltip(`${esc(g.cidade)} · ${n} ${n === 1 ? "empresa" : "empresas"}`, { direction: "top", offset: [0, -tam / 2], className: "mr-tip" })
            .bindPopup(`<div class="mr-pop"><h4>${esc(g.cidade)}</h4><ul>${lista}</ul></div>`, { maxWidth: 320, className: "mr-popup" });
        });

        // enquadra o Rio Grande do Sul (quem estiver longe aparece ao afastar o zoom)
        const rs = grupos.filter((g) => g.pos[0] < -27 && g.pos[1] < -50.4).map((g) => g.pos);
        mapa.fitBounds(rs.length ? rs : grupos.map((g) => g.pos), { padding: [30, 30] });
        // o scroll da página não vira zoom; um clique no mapa libera
        mapa.once("focus", () => mapa.scrollWheelZoom.enable());
        mapa.on("click", () => mapa.scrollWheelZoom.enable());
      })
      .catch(() => vivo && setErro(true));
    return () => {
      vivo = false;
      mapa?.remove();
    };
  }, [grupos, base]);

  return (
    <div className="mr-wrap">
      <div ref={ref} className="mr-mapa" role="region" aria-label="Mapa das empresas da rede" />
      {erro && <p className="mr-erro">Não foi possível carregar o mapa agora.</p>}
      <p className="mr-dica">Toque numa cidade para ver as empresas da rede.</p>
    </div>
  );
}
