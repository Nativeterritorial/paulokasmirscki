import { NextResponse } from "next/server";
import { getVagasPublicas, muralInteresse } from "../../../lib/store";

export const runtime = "nodejs";

const ERROS = {
  fechado: "Essa vaga já foi encerrada.",
  contato: "Preencha seu nome e um WhatsApp com DDD.",
  repetido: "Você já se candidatou a essa vaga.",
  cheio: "Essa vaga já recebeu muitas candidaturas.",
};

// Página pública /vagas: lista as vagas do Mural e recebe candidaturas
// (qualquer pessoa pode se candidatar, sem cadastro).
export async function GET() {
  return NextResponse.json({ ok: true, vagas: await getVagasPublicas() });
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}
  // honeypot anti-bot
  if (body.website) return NextResponse.json({ ok: true });
  if (!body.id) return NextResponse.json({ ok: false }, { status: 400 });
  const r = await muralInteresse(null, String(body.id), body);
  if (r.error) {
    return NextResponse.json(
      { ok: false, error: ERROS[r.error] || "Não consegui enviar agora. Tente de novo." },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
