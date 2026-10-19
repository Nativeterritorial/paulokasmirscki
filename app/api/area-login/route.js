import { NextResponse } from "next/server";
import { checkAccess } from "../../../lib/auth";
import { touchMember, loginWithSenha, memberSenhaInfo } from "../../../lib/store";

export const runtime = "nodejs";

const ERROS = {
  dados: "WhatsApp ou senha não conferem.",
  bloqueado: "Muitas tentativas. Aguarde 15 minutos ou use “Esqueci minha senha”.",
  semsenha:
    "Esse WhatsApp ainda não tem senha. Entre pelo seu link de acesso e crie a senha, ou use “Esqueci minha senha”.",
  indisponivel: "Não foi possível entrar agora. Tente de novo em instantes.",
};

// Entrada na Área de Membros: WhatsApp + senha (qualquer aparelho),
// link pessoal do membro ou código geral.
export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}

  let code = String(body.code || "").trim();
  if (!code && body.whatsapp) {
    const r = await loginWithSenha(body.whatsapp, String(body.senha || ""));
    if (!r.token) return NextResponse.json({ ok: false, error: ERROS[r.error] || ERROS.dados });
    code = r.token;
  }

  const { ok, member } = await checkAccess(code);
  if (ok && member) await touchMember(member.id);
  const senha = member ? await memberSenhaInfo(member.id) : null;

  // pro navegador vai só o necessário pra saudação (e o token quando entrou por senha)
  return NextResponse.json({
    ok,
    token: ok && body.whatsapp ? code : undefined,
    member: member ? { id: member.id, nome: member.nome, plano: !!member.plano, ...senha } : null,
  });
}
