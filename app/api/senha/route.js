import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { setMemberSenha, pedirNovaSenha, senhaValida, SENHA_MIN } from "../../../lib/store";

export const runtime = "nodejs";

// action "definir": o membro (já dentro da área) cria ou troca a senha
// action "esqueci": manda o pedido de nova senha pro painel do Paulo
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  if (body.action === "definir") {
    const { ok, member } = await checkAccess(body.code);
    if (!ok || !member) return NextResponse.json({ ok: false, error: "Entre com o seu acesso pessoal para criar a senha." }, { status: 401 });
    if (!senhaValida(body.senha))
      return NextResponse.json({ ok: false, error: `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.` }, { status: 400 });
    const salvo = await setMemberSenha(member.id, String(body.senha));
    return NextResponse.json(salvo ? { ok: true } : { ok: false, error: "Não foi possível salvar agora." });
  }

  if (body.action === "esqueci") {
    if (String(body.whatsapp || "").replace(/\D/g, "").length < 10)
      return NextResponse.json({ ok: false, error: "Informe o seu WhatsApp com DDD." }, { status: 400 });
    await pedirNovaSenha(body.whatsapp);
    // mesma resposta sempre: não revela se o número é de um membro
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false }, { status: 400 });
}
