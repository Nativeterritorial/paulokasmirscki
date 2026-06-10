export default function manifest() {
  return {
    name: "Paulo Kasmirscki — Ecossistema",
    short_name: "PK Ecossistema",
    description:
      "A rede do Paulo Kasmirscki: concierge de IA e empresas do ecossistema.",
    start_url: "/area",
    display: "standalone",
    background_color: "#0a0c1e",
    theme_color: "#0a0c1e",
    icons: [
      {
        src: "/logo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
