import { NextResponse } from "next/server";
import { logSignup } from "../../../lib/store";

export const runtime = "nodejs";

// Recebe o cadastro de uma empresa que quer entrar na rede (form do /ecossistema)
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  // honeypot anti-bot: campo oculto que humano não preenche
  if (body.website) return NextResponse.json({ ok: true });

  const nome = String(body.nome || "").trim();
  const whatsapp = String(body.whatsapp || "").trim();
  const email = String(body.email || "").trim();

  // exige ao menos nome + uma forma de contato
  if (!nome || (!whatsapp && !email)) {
    return NextResponse.json(
      { ok: false, error: "Preencha o nome e ao menos WhatsApp ou e-mail." },
      { status: 400 }
    );
  }

  await logSignup({
    nome,
    empresa: body.empresa,
    site: body.site,
    instagram: body.instagram,
    email,
    whatsapp,
  });

  return NextResponse.json({ ok: true });
}
