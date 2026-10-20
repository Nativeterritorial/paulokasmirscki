import { NextResponse } from "next/server";
import { logSignup, selfSignupMember, senhaValida, SENHA_MIN } from "../../../lib/store";

export const runtime = "nodejs";

// Cadastro no Ecossistema PK (página /ecossistema e página inicial).
// A pessoa já recebe o acesso pessoal na hora e entra na Área de Membros;
// o cadastro também aparece no painel do Paulo.
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

  if (!nome || String(whatsapp).replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { ok: false, error: "Preencha o seu nome e um WhatsApp com DDD." },
      { status: 400 }
    );
  }

  const senha = String(body.senha || "");
  if (!senhaValida(senha)) {
    return NextResponse.json(
      { ok: false, error: `Crie uma senha com pelo menos ${SENHA_MIN} caracteres.` },
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

  const r = await selfSignupMember({ nome, whatsapp, senha, convite: body.convite });
  if (r.token) return NextResponse.json({ ok: true, token: r.token });
  if (r.exists) return NextResponse.json({ ok: true, exists: true });
  // se não deu pra criar o acesso agora, o cadastro chegou ao Paulo mesmo assim
  return NextResponse.json({ ok: true });
}
