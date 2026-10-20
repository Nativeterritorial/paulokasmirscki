import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getConvidante } from "../../../lib/store";

export const runtime = "nodejs";
export const alt = "Convite para o Ecossistema PK";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// arquivo da pasta public: lê do disco (no computador) ou pelo próprio site
// (na Vercel a pasta public não vai junto com a função)
async function arquivo(nome) {
  try {
    return await readFile(path.join(process.cwd(), "public", nome));
  } catch {
    const r = await fetch(`https://www.paulokasmirscki.com.br/${nome}`);
    return Buffer.from(await r.arrayBuffer());
  }
}

// fonte do Google Fonts (com fallback silencioso)
async function fonte(familia, peso) {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${familia}:wght@${peso}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
    }).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format/)?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

const selo = (fontSize, pad, raio) => ({
  fontFamily: "Sora",
  fontSize,
  color: "#0b1440",
  background: "linear-gradient(100deg, #7cc4ff, #8b5cf6)",
  padding: pad,
  borderRadius: raio,
});

// Prévia do convite: "<Nome> te convidou para o Ecossistema PK"
export default async function Imagem({ params }) {
  const { id } = await params;
  const [quem, base, logo, sora, inter] = await Promise.all([
    getConvidante(id),
    arquivo("og-convite-base.jpg"),
    arquivo("logo-mark.svg"),
    fonte("Sora", 800),
    fonte("Inter", 600),
  ]);
  const fonts = [];
  if (sora) fonts.push({ name: "Sora", data: sora, weight: 800 });
  if (inter) fonts.push({ name: "Inter", data: inter, weight: 600 });

  const nome = (quem?.nome || "").split(/\s+/).slice(0, 2).join(" ");
  const tam = nome.length <= 12 ? 70 : nome.length <= 18 ? 58 : 46;

  const png = new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", position: "relative", fontFamily: "Inter" }}>
        <img
          src={`data:image/jpeg;base64,${base.toString("base64")}`}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
        <div style={{ position: "absolute", left: 64, top: 58, width: 640, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} width={44} height={44} />
            <div style={{ fontFamily: "Sora", fontSize: 22, color: "#cfe0ff", letterSpacing: 1 }}>ECOSSISTEMA</div>
            <div style={selo(22, "2px 10px", 7)}>PK</div>
          </div>
          <div style={{ marginTop: 44, fontSize: 22, color: "#6fffbf", letterSpacing: 4 }}>CONVITE ESPECIAL</div>
          {nome ? (
            <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
              <div style={{ fontFamily: "Sora", fontSize: tam, color: "#ffffff", lineHeight: 1.05 }}>{nome}</div>
              <div style={{ fontFamily: "Sora", fontSize: 40, color: "#ffffff", marginTop: 10 }}>te convidou para o</div>
            </div>
          ) : (
            <div style={{ fontFamily: "Sora", fontSize: 50, color: "#ffffff", marginTop: 12 }}>Você foi convidado para o</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <div style={{ fontFamily: "Sora", fontSize: 54, color: "#6fffbf" }}>Ecossistema</div>
            <div style={selo(50, "0 14px", 12)}>PK</div>
          </div>
          <div style={{ display: "flex", marginTop: 40 }}>
            <div
              style={{
                fontSize: 26,
                color: "#06304a",
                background: "linear-gradient(90deg, #6fffbf, #46d6ff)",
                padding: "16px 34px",
                borderRadius: 999,
              }}
            >
              Aceitar convite →
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
  // em JPG fica bem mais leve (o WhatsApp às vezes ignora imagem pesada)
  try {
    const sharp = (await import("sharp")).default;
    const jpg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Response(jpg, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" } });
  } catch (e) {
    return png;
  }
}
