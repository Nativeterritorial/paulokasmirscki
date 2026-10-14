import { NextResponse } from "next/server";
import { logReferral } from "../../../lib/store";
import { checkAccess } from "../../../lib/auth";

export const runtime = "nodejs";

const TIPOS = ["Comprar", "Vender", "Alugar", "Ainda não sei"];

// Recebe uma indicação de negócio imobiliário. Vem de dois lugares:
// - do formulário público em /parcerias (a pessoa informa nome e WhatsApp);
// - da Área de Membros (vem com o código de acesso; quem indica é o membro).
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  // honeypot anti-bot: campo oculto que humano não preenche
  if (body.website) return NextResponse.json({ ok: true });

  // indicação feita por um membro logado com link pessoal
  let member = null;
  if (body.code) {
    const access = await checkAccess(body.code);
    member = access.ok ? access.member : null;
  }

  const nome = member ? member.nome : String(body.nome || "").trim();
  const whatsapp = member
    ? member.whatsapp || String(body.whatsapp || "").trim()
    : String(body.whatsapp || "").trim();
  const indicado = String(body.indicado || "").trim();
  const indicadoContato = String(body.indicadoContato || "").trim();

  if (!indicado || !indicadoContato) {
    return NextResponse.json(
      { ok: false, error: "Preencha o nome e o contato de quem você indica." },
      { status: 400 }
    );
  }
  if (!member && (!nome || !whatsapp)) {
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
    memberId: member ? member.id : "",
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
