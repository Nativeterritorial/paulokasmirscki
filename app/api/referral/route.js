import { NextResponse } from "next/server";
import { logReferral } from "../../../lib/store";

export const runtime = "nodejs";

const TIPOS = ["Comprar", "Vender", "Alugar", "Ainda não sei"];

// Recebe uma indicação de negócio imobiliário (form do /parcerias)
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  // honeypot anti-bot: campo oculto que humano não preenche
  if (body.website) return NextResponse.json({ ok: true });

  const nome = String(body.nome || "").trim();
  const whatsapp = String(body.whatsapp || "").trim();
  const indicado = String(body.indicado || "").trim();
  const indicadoContato = String(body.indicadoContato || "").trim();

  if (!nome || !whatsapp || !indicado || !indicadoContato) {
    return NextResponse.json(
      {
        ok: false,
        error: "Preencha seu nome e WhatsApp, e o nome e contato de quem você indica.",
      },
      { status: 400 }
    );
  }
  if (!body.autorizado || !body.aceite) {
    return NextResponse.json(
      {
        ok: false,
        error: "Marque as duas confirmações para registrar a indicação.",
      },
      { status: 400 }
    );
  }

  const t = await logReferral({
    nome,
    whatsapp,
    indicado,
    indicadoContato,
    tipo: TIPOS.includes(body.tipo) ? body.tipo : "",
    obs: body.obs,
  });

  // a data do registro define a precedência: se não gravou, não dá pra dizer que sim
  if (!t) {
    return NextResponse.json(
      {
        ok: false,
        unavailable: true,
        error: "Não consegui registrar agora. Envie a indicação pelo WhatsApp.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, t });
}
