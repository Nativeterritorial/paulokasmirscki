import { getFoto } from "../../../../lib/store";

export const runtime = "nodejs";

// Entrega a foto de um imóvel. O id é aleatório e longo (não dá pra adivinhar);
// a foto não muda nunca, então o navegador pode guardar em cache.
export async function GET(req, { params }) {
  const { id } = await params;
  const b64 = await getFoto(id);
  if (!b64) return new Response("Foto não encontrada", { status: 404 });
  return new Response(Buffer.from(b64, "base64"), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
