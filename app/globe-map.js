"use client";

import { useEffect, useRef, useState } from "react";

// Paulo (hub) — Veranópolis/RS
const HUB = {
  id: "pk",
  nome: "Paulo Kasmirscki",
  seg: "Conector de negócios",
  cidade: "Veranópolis · RS",
  lat: -28.9339,
  lng: -51.5539,
  hub: true,
};

// coords espalhadas pela Serra Gaúcha/RS pra os pins não empilharem
const COMPANIES = [
  { id: "native", nome: "NATIVE", seg: "Inteligência Territorial", cidade: "Veranópolis · RS", lat: -28.86, lng: -51.78 },
  { id: "ordeclean", nome: "Ordeclean", seg: "Agro & Pecuária", cidade: "Serra Gaúcha · RS", lat: -28.42, lng: -51.55 },
  { id: "rapadura", nome: "Rapadura da Serra Gaúcha", seg: "Alimentação & Doces", cidade: "Cotiporã · RS", lat: -28.98, lng: -51.71 },
  { id: "bigwolf", nome: "Big Wolf", seg: "Moda & Vestuário", cidade: "Loja online", lat: -28.55, lng: -51.10 },
  { id: "pulse", nome: "Pulse Jiu-Jitsu", seg: "Esporte & Lazer", cidade: "Veranópolis · RS", lat: -29.02, lng: -51.30 },
  { id: "mutalys", nome: "Mutalys", seg: "Gestão & Consultoria", cidade: "Serra Gaúcha · RS", lat: -29.40, lng: -51.80 },
  { id: "serafin", nome: "Serafin Suplementos", seg: "Saúde & Suplementos", cidade: "Veranópolis · RS", lat: -28.93, lng: -51.55 },
  { id: "gazzana", nome: "Gazzana & Maragno", seg: "Jurídico", cidade: "Veranópolis · RS", lat: -28.72, lng: -51.33 },
  { id: "visara", nome: "Visara Digital", seg: "Marketing & Digital", cidade: "Serra Gaúcha · RS", lat: -29.22, lng: -51.58 },
  { id: "gilioli", nome: "Gilioli", seg: "Contabilidade", cidade: "Serra Gaúcha · RS", lat: -29.10, lng: -51.98 },
  { id: "alsus", nome: "Grupo ALSUS", seg: "Construção & Infra", cidade: "Serra Gaúcha · RS", lat: -29.48, lng: -51.28 },
  { id: "agetra", nome: "Agetra Gráfica", seg: "Gráfica & Impressão", cidade: "Caxias do Sul · RS", lat: -29.17, lng: -51.18 },
  { id: "mbx", nome: "MBX Global Services", seg: "Logística & Comércio Exterior", cidade: "Porto Alegre · RS", lat: -30.03, lng: -51.22 },
  { id: "rbs", nome: "Grupo RBS", seg: "Mídia & Comunicação", cidade: "Porto Alegre · RS", lat: -30.15, lng: -51.42 },
];

// Marcadores internacionais (alcance da MBX / Exatus)
const INTL = [
  { id: "intl-us", nome: "Alcance internacional", seg: "MBX · América do Norte", cidade: "Estados Unidos", lat: 40.71, lng: -74.0, intl: true },
  { id: "intl-de", nome: "Alcance internacional", seg: "MBX · Europa", cidade: "Alemanha", lat: 50.11, lng: 8.68, intl: true },
  { id: "intl-cn", nome: "Alcance internacional", seg: "MBX · Ásia", cidade: "China", lat: 31.23, lng: 121.47, intl: true },
  { id: "intl-ae", nome: "Alcance internacional", seg: "MBX · Oriente Médio", cidade: "Emirados Árabes", lat: 25.2, lng: 55.27, intl: true },
  { id: "intl-za", nome: "Alcance internacional", seg: "Exatus · África", cidade: "África do Sul", lat: -26.2, lng: 28.04, intl: true },
];

export default function GlobeMap() {
  const elRef = useRef(null);
  const globeRef = useRef(null);
  const [sel, setSel] = useState(HUB);
  const [ready, setReady] = useState(false);

  // cria o globo (uma vez)
  useEffect(() => {
    let destroyed = false;
    let ro = null;

    (async () => {
      const [{ default: Globe }, topojson] = await Promise.all([
        import("globe.gl"),
        import("topojson-client"),
      ]);
      const topo = await fetch("/countries-110m.json").then((r) => r.json());
      if (destroyed || !elRef.current) return;

      const countries = topojson.feature(topo, topo.objects.countries).features;
      const points = [HUB, ...COMPANIES, ...INTL];
      const arcs = [
        ...COMPANIES.map((c) => ({ startLat: HUB.lat, startLng: HUB.lng, endLat: c.lat, endLng: c.lng, kind: "local" })),
        ...INTL.map((c) => ({ startLat: HUB.lat, startLng: HUB.lng, endLat: c.lat, endLng: c.lng, kind: "intl" })),
      ];

      const select = (d) => {
        setSel(d);
        const g = globeRef.current;
        if (!g) return;
        g.controls().autoRotate = false;
        if (d.lat != null) {
          g.pointOfView(
            { lat: d.lat, lng: d.lng, altitude: d.intl ? 1.6 : 0.7 },
            900
          );
        }
      };

      const globe = Globe()(elRef.current)
        .width(elRef.current.clientWidth)
        .height(560)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("/earth/earth-blue-marble.jpg")
        .bumpImageUrl("/earth/earth-topology.png")
        .showAtmosphere(true)
        .atmosphereColor("#6a8dff")
        .atmosphereAltitude(0.22)
        .polygonsData(countries)
        .polygonCapColor(() => "rgba(0,0,0,0)")
        .polygonSideColor(() => "rgba(0,0,0,0)")
        .polygonStrokeColor(() => "rgba(180,200,255,0.35)")
        .polygonAltitude(0.005)
        .labelsData(points)
        .labelLat("lat")
        .labelLng("lng")
        .labelText((d) => (d.hub ? "Paulo" : d.intl ? d.cidade : d.nome))
        .labelSize((d) => (d.hub ? 0.9 : 0.62))
        .labelDotRadius((d) => (d.hub ? 0.5 : 0.32))
        .labelColor((d) =>
          d.hub ? "#ffffff" : d.intl ? "#7ee2a8" : "#ffd15b"
        )
        .labelResolution(2)
        .labelAltitude(0.01)
        .onLabelClick((d) => select(d))
        .arcsData(arcs)
        .arcColor((a) =>
          a.kind === "intl"
            ? ["rgba(126,226,168,0.1)", "rgba(126,226,168,0.9)"]
            : ["rgba(255,209,91,0.1)", "rgba(255,209,91,0.85)"]
        )
        .arcAltitudeAutoScale((a) => (a.kind === "intl" ? 0.5 : 0.22))
        .arcStroke(0.4)
        .arcDashLength(0.5)
        .arcDashGap(0.25)
        .arcDashAnimateTime((a) => (a.kind === "intl" ? 3500 : 2200));

      globe.pointOfView({ lat: -22, lng: -53, altitude: 1.6 }, 0);
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 160;
      controls.maxDistance = 600;
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
      });

      globeRef.current = globe;
      setReady(true);

      // mantém a largura sincronizada assim que o layout define o tamanho
      // (corrige canvas 0x0 quando o clientWidth ainda era 0 na criação)
      const resize = () => {
        const w = elRef.current && elRef.current.clientWidth;
        if (w > 0) globe.width(w);
      };
      // roda várias vezes: o globe.gl reseta a largura na init interna,
      // então reforçamos depois dela (senão o canvas fica 0x0)
      resize();
      requestAnimationFrame(resize);
      [100, 350, 800].forEach((t) => setTimeout(resize, t));
      if (typeof ResizeObserver !== "undefined" && elRef.current) {
        ro = new ResizeObserver(resize);
        ro.observe(elRef.current);
      }
      window.addEventListener("resize", resize);
      globeRef.current._resizeHandler = resize;
    })();

    return () => {
      destroyed = true;
      if (ro) ro.disconnect();
      if (globeRef.current?._resizeHandler)
        window.removeEventListener("resize", globeRef.current._resizeHandler);
      try {
        globeRef.current?._destructor?.();
      } catch (e) {}
      if (elRef.current) elRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="globe-wrap">
      <div ref={elRef} className="globe-canvas" />
      {!ready && <div className="globe-loading">carregando o globo…</div>}
      <div className="netmap-card globe-card" aria-live="polite">
        <div className="nm-city">📍 {sel.cidade}</div>
        <div className="nm-name">{sel.nome}</div>
        <div className="nm-seg">{sel.seg}</div>
        {sel.hub ? (
          <div className="nm-hub-tag">O conector da rede</div>
        ) : sel.intl ? (
          <div className="nm-hub-tag" style={{ color: "#7ee2a8" }}>
            Alcance da rede no mundo
          </div>
        ) : (
          <a className="nm-link" href={`/rede/${sel.id}`}>
            Conhecer a empresa →
          </a>
        )}
        <div className="nm-hint">
          Arraste pra girar · role pra dar zoom · clique nos pins
        </div>
      </div>
    </div>
  );
}
