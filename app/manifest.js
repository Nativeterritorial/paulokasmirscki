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
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
