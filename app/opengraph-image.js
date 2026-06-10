import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Paulo Kasmirscki — Conectando pessoas e gerando negócios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Busca um peso da Space Grotesk no Google Fonts (com fallback silencioso)
async function loadFont(weight) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OG() {
  const [regular, bold] = await Promise.all([loadFont(400), loadFont(700)]);
  const fonts = [];
  if (regular)
    fonts.push({ name: "Space Grotesk", data: regular, weight: 400 });
  if (bold) fonts.push({ name: "Space Grotesk", data: bold, weight: 700 });

  // nós da rede em volta do centro (motivo do logo)
  const nodes = [
    { x: 1040, y: 120 },
    { x: 1130, y: 280 },
    { x: 1060, y: 460 },
    { x: 900, y: 540 },
    { x: 880, y: 90 },
  ];
  const cx = 980;
  const cy = 300;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #0a0c1e 0%, #131a45 55%, #1d2a6e 100%)",
          fontFamily: "Space Grotesk",
          position: "relative",
        }}
      >
        {/* rede de conexões à direita */}
        <svg
          width="1200"
          height="630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {nodes.map((n, i) => (
            <line
              key={`l${i}`}
              x1={cx}
              y1={cy}
              x2={n.x}
              y2={n.y}
              stroke="#8a93ff"
              strokeWidth="2"
              opacity="0.45"
            />
          ))}
          {nodes.map((n, i) => (
            <circle
              key={`c${i}`}
              cx={n.x}
              cy={n.y}
              r="9"
              fill="#0a0c1e"
              stroke="#8a93ff"
              strokeWidth="3"
              opacity="0.9"
            />
          ))}
          <circle cx={cx} cy={cy} r="16" fill="#8a93ff" />
          <circle
            cx={cx}
            cy={cy}
            r="34"
            fill="none"
            stroke="#8a93ff"
            strokeWidth="2"
            opacity="0.5"
          />
        </svg>

        {/* texto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 90px",
            maxWidth: 860,
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              color: "#8a93ff",
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            O conector do ecossistema
          </div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "#eef0fb",
              lineHeight: 1.05,
              marginBottom: 30,
            }}
          >
            Paulo Kasmirscki
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#aab3e8",
              lineHeight: 1.35,
            }}
          >
            Conectando pessoas e gerando negócios — networking, parcerias e
            oportunidades na Serra Gaúcha.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginTop: 46,
            }}
          >
            <div
              style={{
                width: 46,
                height: 2,
                background: "#8a93ff",
              }}
            />
            <div style={{ fontSize: 24, color: "#8a93ff" }}>
              paulokasmirscki.com.br
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
