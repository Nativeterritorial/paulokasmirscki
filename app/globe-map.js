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

const COMPANIES = [
  { id: "native", nome: "NATIVE", seg: "Inteligência Territorial", cidade: "Veranópolis · RS", lat: -28.93, lng: -51.55 },
  { id: "ordeclean", nome: "Ordeclean", seg: "Agro & Pecuária", cidade: "Serra Gaúcha · RS", lat: -28.99, lng: -51.62 },
  { id: "rapadura", nome: "Rapadura da Serra Gaúcha", seg: "Alimentação & Doces", cidade: "Cotiporã · RS", lat: -28.9797, lng: -51.7139 },
  { id: "bigwolf", nome: "Big Wolf", seg: "Moda & Vestuário", cidade: "Loja online", lat: -28.90, lng: -51.49 },
  { id: "pulse", nome: "Pulse Jiu-Jitsu", seg: "Esporte & Lazer", cidade: "Veranópolis · RS", lat: -28.945, lng: -51.545 },
  { id: "mutalys", nome: "Mutalys", seg: "Gestão & Consultoria", cidade: "Serra Gaúcha · RS", lat: -29.05, lng: -51.42 },
  { id: "serafin", nome: "Serafin Suplementos", seg: "Saúde & Suplementos", cidade: "Veranópolis · RS", lat: -28.928, lng: -51.562 },
  { id: "gazzana", nome: "Gazzana & Maragno", seg: "Jurídico", cidade: "Veranópolis · RS", lat: -28.921, lng: -51.552 },
  { id: "visara", nome: "Visara Digital", seg: "Marketing & Digital", cidade: "Serra Gaúcha · RS", lat: -29.16, lng: -51.35 },
  { id: "gilioli", nome: "Gilioli", seg: "Contabilidade", cidade: "Serra Gaúcha · RS", lat: -29.02, lng: -51.48 },
  { id: "alsus", nome: "Grupo ALSUS", seg: "Construção & Infra", cidade: "Serra Gaúcha · RS", lat: -29.18, lng: -51.44 },
  { id: "agetra", nome: "Agetra Gráfica", seg: "Gráfica & Impressão", cidade: "Caxias do Sul · RS", lat: -29.1678, lng: -51.1794 },
  { id: "mbx", nome: "MBX Global Services", seg: "Logística & Comércio Exterior", cidade: "Porto Alegre · RS", lat: -30.0346, lng: -51.2177 },
  { id: "rbs", nome: "Grupo RBS", seg: "Mídia & Comunicação", cidade: "Porto Alegre · RS", lat: -30.03, lng: -51.23 },
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
    let onResize = null;

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
        .pointsData(points)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor((d) => (d.hub ? "#ffffff" : d.intl ? "#7ee2a8" : "#ffd15b"))
        .pointAltitude((d) => (d.hub ? 0.07 : 0.03))
        .pointRadius((d) => (d.hub ? 0.6 : 0.34))
        .pointLabel((d) => `${d.nome}${d.cidade ? " — " + d.cidade : ""}`)
        .onPointClick((d) => select(d))
        .labelsData([...INTL])
        .labelLat("lat")
        .labelLng("lng")
        .labelText((d) => d.cidade)
        .labelSize(1.1)
        .labelDotRadius(0.3)
        .labelColor(() => "rgba(126,226,168,0.9)")
        .labelResolution(2)
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

      globe.pointOfView({ lat: -12, lng: -55, altitude: 2.0 }, 0);
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

      onResize = () => {
        if (elRef.current) globe.width(elRef.current.clientWidth);
      };
      window.addEventListener("resize", onResize);
    })();

    return () => {
      destroyed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      try {
        globeRef.current?._destructor?.();
      } catch (e) {}
      if (elRef.current) elRef.current.innerHTML = "";
    };
  }, []);

  // seleciona uma empresa: voa até ela e mostra o rótulo com o nome
  const select = (d) => {
    setSel(d);
    const g = globeRef.current;
    if (!g) return;
    g.controls().autoRotate = false;
    const extra = d.hub || d.intl ? [] : [d];
    g.labelsData([...INTL, ...extra]);
    if (d.lat != null) {
      g.pointOfView(
        { lat: d.lat, lng: d.lng, altitude: d.intl ? 1.6 : 0.9 },
        900
      );
    }
  };

  return (
    <div className="globe-layout">
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
          <div className="nm-hint">Arraste pra girar · role pra dar zoom</div>
        </div>
      </div>

      <aside className="globe-list">
        <div className="gl-head">
          <button
            type="button"
            className={`gl-item gl-hub${sel.id === "pk" ? " on" : ""}`}
            onClick={() => select(HUB)}
          >
            <span className="gl-dot hub" />
            <span>
              <span className="gl-nm">Paulo Kasmirscki</span>
              <span className="gl-ct">Veranópolis · o conector</span>
            </span>
          </button>
        </div>
        <div className="gl-scroll">
          {COMPANIES.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`gl-item${sel.id === c.id ? " on" : ""}`}
              onClick={() => select(c)}
            >
              <span className="gl-dot" />
              <span>
                <span className="gl-nm">{c.nome}</span>
                <span className="gl-ct">{c.cidade}</span>
              </span>
            </button>
          ))}
          <div className="gl-sep">Alcance internacional</div>
          {INTL.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`gl-item${sel.id === c.id ? " on" : ""}`}
              onClick={() => select(c)}
            >
              <span className="gl-dot intl" />
              <span>
                <span className="gl-nm">{c.cidade}</span>
                <span className="gl-ct">{c.seg}</span>
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
