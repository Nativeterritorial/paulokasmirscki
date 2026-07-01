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

// Empresas (lat/lng — primeiro palpite de cidade, fácil de ajustar)
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

// Marcadores internacionais (alcance da MBX / Exatus pelo mundo)
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

      const countries = topojson.feature(
        topo,
        topo.objects.countries
      ).features;

      const points = [HUB, ...COMPANIES, ...INTL];
      const localArcs = COMPANIES.map((c) => ({
        startLat: HUB.lat,
        startLng: HUB.lng,
        endLat: c.lat,
        endLng: c.lng,
        kind: "local",
      }));
      const intlArcs = INTL.map((c) => ({
        startLat: HUB.lat,
        startLng: HUB.lng,
        endLat: c.lat,
        endLng: c.lng,
        kind: "intl",
      }));

      const w = elRef.current.clientWidth;
      const globe = Globe()(elRef.current)
        .width(w)
        .height(540)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .atmosphereColor("#6a8dff")
        .atmosphereAltitude(0.2)
        .polygonsData(countries)
        .polygonCapColor(() => "rgba(90,120,220,0.15)")
        .polygonSideColor(() => "rgba(20,28,70,0.15)")
        .polygonStrokeColor(() => "rgba(150,175,255,0.5)")
        .polygonAltitude(0.006)
        .pointsData(points)
        .pointLat("lat")
        .pointLng("lng")
        .pointColor((d) =>
          d.hub ? "#ffffff" : d.intl ? "#7ee2a8" : "#9db4ff"
        )
        .pointAltitude((d) => (d.hub ? 0.06 : 0.03))
        .pointRadius((d) => (d.hub ? 0.55 : 0.32))
        .pointLabel((d) => `${d.nome} — ${d.cidade}`)
        .onPointClick((d) => setSel(d))
        .arcsData([...localArcs, ...intlArcs])
        .arcColor((a) =>
          a.kind === "intl"
            ? ["rgba(126,226,168,0.1)", "rgba(126,226,168,0.9)"]
            : ["rgba(157,180,255,0.1)", "rgba(157,180,255,0.85)"]
        )
        .arcAltitudeAutoScale((a) => (a.kind === "intl" ? 0.5 : 0.2))
        .arcStroke(0.4)
        .arcDashLength(0.5)
        .arcDashGap(0.25)
        .arcDashAnimateTime((a) => (a.kind === "intl" ? 3500 : 2200));

      // globo escuro (na identidade do site)
      try {
        globe.globeMaterial().color.set("#0a0e26");
        globe.globeMaterial().emissive.set("#0a0e26");
        globe.globeMaterial().shininess = 6;
      } catch (e) {}

      // ponto de vista inicial: Brasil; rotação automática + arraste pra girar
      globe.pointOfView({ lat: -15, lng: -55, altitude: 2.0 }, 0);
      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
      controls.enableZoom = true;
      controls.minDistance = 180;
      controls.maxDistance = 600;
      // para de girar sozinho ao interagir
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
        globeRef.current && globeRef.current._destructor
          ? globeRef.current._destructor()
          : null;
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
        <div className="nm-hint">Arraste pra girar o globo · clique nos pontos</div>
      </div>
    </div>
  );
}
