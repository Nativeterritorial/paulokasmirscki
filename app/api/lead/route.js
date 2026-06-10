import { NextResponse } from "next/server";
import { logLead } from "../../../lib/store";

export const runtime = "nodejs";

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  // honeypot: campo invisível que só robô preenche
  if (body.site) return NextResponse.json({ ok: true });

  const nome = String(body.nome || "").trim();
  const contato = String(body.contato || "").trim();
  const msg = String(body.msg || "").trim();

  if (!nome || !contato || !msg) {
    return NextResponse.json(
      { ok: false, error: "Preencha todos os campos." },
      { status: 400 }
    );
  }
  if (nome.length > 80 || contato.length > 80 || msg.length > 400) {
    return NextResponse.json(
      { ok: false, error: "Texto longo demais." },
      { status: 400 }
    );
  }

  await logLead({ nome, contato, msg });
  return NextResponse.json({ ok: true });
}
